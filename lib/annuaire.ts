import fs from 'fs'
import path from 'path'
import { correspondEnvie } from '@/lib/envies'

// 📒 ANNUAIRE — les lieux DEJA documentes dans nos 354 fiches villes
// (mosquees et restaurants), exposes autour d'une position.
//
// HONNETETE (regle non negociable) : ces lieux viennent d'OpenStreetMap
// (champ `source: "osm"` dans les fiches). Ils ne sont PAS verifies par une
// equipe et ne sont PAS des temoignages de voyageurs. On les etiquette donc
// « referencé · à vérifier » — jamais « vérifié », jamais « confirmé ».
// Les spots communautaires gardent leur propre badge, distinct.

export interface AnnuaireLieu {
  nom: string
  lat: number
  lng: number
  type: 'priere' | 'resto'
  /** type de cuisine brut (OSM) : sert au filtre « j'ai envie de… » */
  cuisine?: string
  villeSlug: string
  villeNom: string
  source: 'annuaire'
  distKm: number
}

interface VilleIdx { slug: string; nom: string; lat: number; lng: number }

let idxCache: VilleIdx[] | null = null
const fileCache = new Map<string, AnnuaireLieu[]>()

function distKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const p = Math.PI / 180
  const a = Math.sin(((bLat - aLat) * p) / 2) ** 2 + Math.cos(aLat * p) * Math.cos(bLat * p) * Math.sin(((bLng - aLng) * p) / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

// Index leger { slug, nom, lat, lng } construit une fois par instance.
function getIndex(): VilleIdx[] {
  if (idxCache) return idxCache
  const dir = path.join(process.cwd(), 'data', 'villes')
  const out: VilleIdx[] = []
  try {
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.json')) continue
      try {
        const v = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'))
        const lat = Number(v.coordonnees?.lat), lng = Number(v.coordonnees?.lng)
        if (Number.isFinite(lat) && Number.isFinite(lng)) out.push({ slug: v.slug ?? f.replace('.json', ''), nom: v.nom ?? '', lat, lng })
      } catch { /* fiche illisible : ignoree */ }
    }
  } catch { /* dossier absent */ }
  idxCache = out
  return out
}

// Lieux documentes d'une ville (mis en cache : les fiches ne changent pas
// entre deux deploiements).
function lieuxDeVille(slug: string, nom: string): AnnuaireLieu[] {
  const hit = fileCache.get(slug)
  if (hit) return hit
  const out: AnnuaireLieu[] = []
  try {
    const v = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'data', 'villes', `${slug}.json`), 'utf8'))
    const push = (arr: unknown, type: 'priere' | 'resto') => {
      if (!Array.isArray(arr)) return
      for (const raw of arr) {
        const l = raw as { nom?: string; lat?: number; lng?: number; type?: string; coordonnees?: { lat?: number; lng?: number } }
        const lat = Number(l.lat ?? l.coordonnees?.lat), lng = Number(l.lng ?? l.coordonnees?.lng)
        if (!l.nom || !Number.isFinite(lat) || !Number.isFinite(lng)) continue
        out.push({ nom: String(l.nom), lat, lng, type, cuisine: type === 'resto' ? (l.type ?? undefined) : undefined, villeSlug: slug, villeNom: v.nom ?? nom, source: 'annuaire', distKm: 0 })
      }
    }
    push(v.mosqueesPrincipales ?? v.mosquees, 'priere')
    push(v.restaurants, 'resto')
  } catch { /* fiche absente */ }
  fileCache.set(slug, out)
  return out
}

// Lieux documentes autour d'une position : on regarde les villes les plus
// proches (rayon large) puis on filtre lieu par lieu.
export function annuaireAutour(
  lat: number,
  lng: number,
  opts: { rayonKm?: number; type?: 'priere' | 'resto'; limit?: number; envie?: string } = {},
): { lieux: AnnuaireLieu[]; ville: { slug: string; nom: string; distKm: number } | null } {
  const rayon = opts.rayonKm ?? 25
  const limit = opts.limit ?? 40
  const villes = getIndex()
    .map((v) => ({ ...v, d: distKm(lat, lng, v.lat, v.lng) }))
    .filter((v) => v.d < rayon + 60)
    .sort((a, b) => a.d - b.d)
    .slice(0, 4)
  if (!villes.length) return { lieux: [], ville: null }
  const lieux: AnnuaireLieu[] = []
  for (const v of villes) {
    for (const l of lieuxDeVille(v.slug, v.nom)) {
      if (opts.type && l.type !== opts.type) continue
      // « j'ai envie de… » : filtre sur le type de cuisine, jamais sur le
      // statut halal (qui reste « signalé · à vérifier » dans tous les cas)
      if (opts.envie && !(l.type === 'resto' && correspondEnvie(l.cuisine, opts.envie))) continue
      const d = distKm(lat, lng, l.lat, l.lng)
      if (d <= rayon) lieux.push({ ...l, distKm: Math.round(d * 10) / 10 })
    }
  }
  lieux.sort((a, b) => a.distKm - b.distKm)
  return {
    lieux: lieux.slice(0, limit),
    ville: { slug: villes[0].slug, nom: villes[0].nom, distKm: Math.round(villes[0].d * 10) / 10 },
  }
}
