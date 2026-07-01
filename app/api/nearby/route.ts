import { NextResponse } from 'next/server'
import { readdirSync, readFileSync } from 'fs'
import path from 'path'

// GET /api/nearby?lat=..&lng=..&type=..&radius=8
// Renvoie les restaurants / hôtels / activités / boucheries autour de coordonnées
// GPS, en cherchant dans TOUTES les villes (pas seulement la plus proche).
// Les mosquées restent gérées côté client via OpenStreetMap (données réelles).
//
// Format de sortie = objets POI bruts des fiches villes + `distanceKm` → le
// parseur de l'app (et du web) fonctionne sans rien changer.
//
// Algo : pré-filtre bounding-box (rapide) → affinage Haversine → tri distance →
// déduplication (nom normalisé + ≤ 70 m). Index construit une fois puis mis en
// cache mémoire (module scope) → requêtes suivantes < ~50 ms.

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type Kind = 'restaurants' | 'hotels' | 'activites' | 'boucheries'
const KINDS: Kind[] = ['restaurants', 'hotels', 'activites', 'boucheries']
// Champs qui contiennent des POI géolocalisables dans les JSON villes
const SOURCE_KEYS: Record<Exclude<Kind, 'boucheries'>, string[]> = {
  restaurants: ['restaurants'],
  hotels: ['hotels'],
  activites: ['activites'],
}

interface Poi {
  kind: Kind
  lat: number
  lng: number
  city: string
  nameKey: string
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  raw: any
}

// ---- Index mémoire (construit au 1er appel, réutilisé ensuite) ----
let INDEX: Poi[] | null = null

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function coordOf(o: any): { lat: number; lng: number } | null {
  const lat = o?.lat ?? o?.latitude ?? o?.coordonnees?.lat ?? o?.coords?.lat
  const lng = o?.lng ?? o?.longitude ?? o?.coordonnees?.lng ?? o?.coords?.lng
  return typeof lat === 'number' && typeof lng === 'number' ? { lat, lng } : null
}
const GENERIC = new Set(['hotel', 'hôtel', 'riad', 'resort', 'restaurant', 'le', 'la', 'les', 'the', 'de', 'du', 'des'])
function normName(nom?: string): string {
  return (nom || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ').split(/\s+/).filter((w) => w && !GENERIC.has(w)).join(' ')
}

function buildIndex(): Poi[] {
  const dir = path.join(process.cwd(), 'data', 'villes')
  const out: Poi[] = []
  let files: string[] = []
  try { files = readdirSync(dir).filter((f) => f.endsWith('.json')) } catch { return out }
  for (const f of files) {
    let d: Record<string, unknown>
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    try { d = JSON.parse(readFileSync(path.join(dir, f), 'utf-8')) } catch { continue }
    const city = String((d as { nom?: string }).nom ?? f.replace('.json', ''))
    for (const kind of ['restaurants', 'hotels', 'activites'] as const) {
      for (const key of SOURCE_KEYS[kind]) {
        const arr = d[key]
        if (!Array.isArray(arr)) continue
        for (const o of arr) {
          const c = coordOf(o)
          if (!c || !o?.nom) continue
          out.push({ kind, lat: c.lat, lng: c.lng, city, nameKey: normName(o.nom), raw: { ...o, lat: c.lat, lng: c.lng } })
        }
      }
    }
  }
  return out
}
function getIndex(): Poi[] {
  if (!INDEX) INDEX = buildIndex()
  return INDEX
}

function haversineKm(a: number, b: number, c: number, d: number) {
  const R = 6371, p = Math.PI / 180
  const x = Math.sin(((c - a) * p) / 2) ** 2 + Math.cos(a * p) * Math.cos(c * p) * Math.sin(((d - b) * p) / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lat = parseFloat(searchParams.get('lat') || '')
  const lng = parseFloat(searchParams.get('lng') || '')
  const radiusKm = Math.min(Math.max(parseFloat(searchParams.get('radius') || '8'), 0.5), 50)
  const typeParam = (searchParams.get('type') || 'all').toLowerCase()
  const limit = Math.min(parseInt(searchParams.get('limit') || '60', 10) || 60, 200)
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json({ error: 'lat/lng requis' }, { status: 400 })
  }

  const wanted: Kind[] = typeParam === 'all'
    ? KINDS
    : (KINDS.filter((k) => k === typeParam || typeParam === k.slice(0, -1)) as Kind[])

  // 1) Pré-filtre bounding-box (rapide) autour de (lat,lng)
  const dLat = radiusKm / 111
  const dLng = radiusKm / (111 * Math.max(0.2, Math.cos(lat * Math.PI / 180)))
  const idx = getIndex()

  const result: Record<string, unknown[]> = {}
  for (const kind of wanted) {
    if (kind === 'boucheries') { result[kind] = []; continue } // pas de données bakées → OSM côté client
    const hits = idx.filter((p) => p.kind === kind
      && p.lat >= lat - dLat && p.lat <= lat + dLat && p.lng >= lng - dLng && p.lng <= lng + dLng)
      // 2) Affinage Haversine
      .map((p) => ({ p, dist: haversineKm(lat, lng, p.lat, p.lng) }))
      .filter((x) => x.dist <= radiusKm)
      // 3) Tri par distance
      .sort((a, b) => a.dist - b.dist)
    // 4) Déduplication (nom normalisé + ≤ 70 m)
    const kept: { p: Poi; dist: number }[] = []
    for (const h of hits) {
      const dup = kept.some((k) => k.p.nameKey && k.p.nameKey === h.p.nameKey
        && haversineKm(k.p.lat, k.p.lng, h.p.lat, h.p.lng) * 1000 <= 70)
      if (!dup) kept.push(h)
    }
    result[kind] = kept.slice(0, limit).map((k) => ({ ...k.p.raw, city: k.p.city, distanceKm: Math.round(k.dist * 100) / 100 }))
  }

  const single = typeParam !== 'all' && wanted.length === 1
  return NextResponse.json(single ? { type: wanted[0], items: result[wanted[0]] } : { spots: result }, {
    headers: { 'Cache-Control': 'public, max-age=120, s-maxage=600' },
  })
}
