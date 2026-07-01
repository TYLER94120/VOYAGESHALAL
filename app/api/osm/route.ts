import { NextResponse } from 'next/server'

// Proxy Overpass CÔTÉ SERVEUR : GET /api/osm?lat=..&lng=..&kind=..&radius=6000
// Le navigateur échoue souvent à joindre Overpass (CORS / rate-limit / timeout).
// En passant par notre serveur (Vercel → Overpass), c'est fiable et sans CORS.
// Renvoie des points {id,lat,lng,name,sub,dist,halal} prêts pour la carte.

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

type Kind = 'mosquees' | 'boucheries' | 'restaurants' | 'hotels'
const HALAL_CUISINE = 'kebab|turkish|lebanese|arab|syrian|persian|iranian|afghan|pakistani|bangladeshi|egyptian|moroccan|uyghur|halal|doner|shawarma|biryani|indian'

function haversine(a: number, b: number, c: number, d: number) {
  const R = 6371000, p = Math.PI / 180
  const x = Math.sin(((c - a) * p) / 2) ** 2 + Math.cos(a * p) * Math.cos(c * p) * Math.sin(((d - b) * p) / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

function buildQuery(kind: Kind, lat: number, lng: number, r: number): string {
  if (kind === 'mosquees')
    return `[out:json][timeout:20];(node["amenity"="place_of_worship"]["religion"="muslim"](around:${r},${lat},${lng});way["amenity"="place_of_worship"]["religion"="muslim"](around:${r},${lat},${lng}););out center;`
  if (kind === 'hotels')
    return `[out:json][timeout:20];(node["tourism"~"hotel|guest_house|hostel"](around:${r},${lat},${lng});way["tourism"~"hotel|guest_house|hostel"](around:${r},${lat},${lng}););out center;`
  if (kind === 'boucheries')
    return `[out:json][timeout:20];(node["shop"="butcher"]["diet:halal"~"yes|only"](around:${r},${lat},${lng});node["shop"="butcher"]["halal"~"yes|only"](around:${r},${lat},${lng});way["shop"="butcher"]["diet:halal"~"yes|only"](around:${r},${lat},${lng}););out center;`
  return `[out:json][timeout:20];(node["amenity"~"restaurant|fast_food"]["diet:halal"~"yes|only"](around:${r},${lat},${lng});way["amenity"~"restaurant|fast_food"]["diet:halal"~"yes|only"](around:${r},${lat},${lng});node["amenity"~"restaurant|fast_food"]["cuisine"~"${HALAL_CUISINE}",i](around:${r},${lat},${lng});way["amenity"~"restaurant|fast_food"]["cuisine"~"${HALAL_CUISINE}",i](around:${r},${lat},${lng}););out center;`
}

async function overpass(query: string) {
  const endpoints = [
    'https://overpass-api.de/api/interpreter',
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass.private.coffee/api/interpreter',
  ]
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 22000)
  const attempts = endpoints.map(async (url) => {
    const res = await fetch(url, { method: 'POST', body: `data=${encodeURIComponent(query)}`, signal: ctrl.signal })
    if (!res.ok) throw new Error(String(res.status))
    const j = await res.json()
    return j.elements || []
  })
  try { return await Promise.any(attempts) } catch { return null } finally { clearTimeout(timer); ctrl.abort() }
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lat = parseFloat(searchParams.get('lat') || '')
  const lng = parseFloat(searchParams.get('lng') || '')
  const kind = (searchParams.get('kind') || 'mosquees') as Kind
  const radius = Math.min(Math.max(parseInt(searchParams.get('radius') || '6000', 10) || 6000, 500), 20000)
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json({ error: 'lat/lng requis' }, { status: 400 })
  }

  const els = await overpass(buildQuery(kind, lat, lng, radius))
  if (!els) return NextResponse.json({ items: [], error: 'overpass_unavailable' }, { headers: { 'Cache-Control': 'public, max-age=60' } })

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const items = (els as any[]).map((el) => {
    const elat = el.lat ?? el.center?.lat, elng = el.lon ?? el.center?.lng ?? el.center?.lon
    const name = el.tags?.name || el.tags?.['name:fr'] || el.tags?.['name:en']
    if (!elat || !elng || !name) return null
    const t = el.tags || {}
    const halal = kind === 'restaurants' ? (t['diet:halal'] === 'only' ? 'only' : t['diet:halal'] === 'yes' ? 'yes' : 'likely') : undefined
    const sub = kind === 'restaurants' ? (t.cuisine ? String(t.cuisine).replace(/_/g, ' ').replace(/;/g, ', ') : 'Restaurant')
      : kind === 'hotels' ? (t.stars ? `${t.stars}★` : 'Hôtel')
      : kind === 'boucheries' ? 'Boucherie halal'
      : (t['addr:street'] || 'Lieu de prière')
    return { id: el.id, lat: elat, lng: elng, name, sub, dist: haversine(lat, lng, elat, elng), halal }
  }).filter(Boolean).sort((a, b) => (a as { dist: number }).dist - (b as { dist: number }).dist).slice(0, 60)

  return NextResponse.json({ items }, { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=1800' } })
}
