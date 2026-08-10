import fs from 'fs'
import path from 'path'
import { forceEnvie } from '@/lib/envies'
import { conforme } from '@/lib/conformite'
import { halalParDefaut } from '@/lib/paysHalalDefaut'

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
  /** force de la correspondance a l'envie demandee (2 fort, 1 faible) */
  force?: number
  /** niveau de signalement halal OSM : only | yes | high | certified | likely */
  halal?: string
  /** lien Google Maps de la fiche (photos et avis REELS, chez Google) */
  mapsUrl?: string
  villeSlug: string
  villeNom: string
  source: 'annuaire'
  distKm: number
}

interface VilleIdx { slug: string; nom: string; lat: number; lng: number; pays: string }

export interface AnnuaireVille {
  slug: string
  nom: string
  pays: string
  /** le pays autorise-t-il a montrer un lieu sans etiquette halal ? */
  halalParDefaut: boolean
  distKm: number
}

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
        if (Number.isFinite(lat) && Number.isFinite(lng)) out.push({ slug: v.slug ?? f.replace('.json', ''), nom: v.nom ?? '', lat, lng, pays: v.pays ?? '' })
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
        const l = raw as { nom?: string; lat?: number; lng?: number; type?: string; halalConfidence?: string; mapsUrl?: string; coordonnees?: { lat?: number; lng?: number } }
        const lat = Number(l.lat ?? l.coordonnees?.lat), lng = Number(l.lng ?? l.coordonnees?.lng)
        if (!l.nom || !Number.isFinite(lat) || !Number.isFinite(lng)) continue
        // Bars, lounges a chicha, boites : ecartes de l'annuaire (le LIEU
        // compte autant que la nourriture — voir lib/conformite.ts)
        if (type === 'resto' && !conforme(l.nom, l.type, l.halalConfidence)) continue
        out.push({
          nom: String(l.nom), lat, lng, type,
          cuisine: type === 'resto' ? (l.type ?? undefined) : undefined,
          halal: l.halalConfidence ?? undefined,
          mapsUrl: l.mapsUrl ?? undefined,
          villeSlug: slug, villeNom: v.nom ?? nom, source: 'annuaire', distKm: 0,
        })
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
): { lieux: AnnuaireLieu[]; ville: AnnuaireVille | null } {
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
      let force = 0
      if (opts.envie) {
        if (l.type !== 'resto') continue
        force = forceEnvie(l.cuisine, l.nom, opts.envie)
        if (!force) continue
      }
      const d = distKm(lat, lng, l.lat, l.lng)
      if (d <= rayon) lieux.push({ ...l, force: force || undefined, distKm: Math.round(d * 10) / 10 })
    }
  }
  // Une envie : les correspondances SURES d'abord, puis la distance.
  // Sans envie : la distance seule.
  lieux.sort((a, b) => (opts.envie ? (b.force ?? 0) - (a.force ?? 0) : 0) || a.distKm - b.distKm)
  return {
    lieux: lieux.slice(0, limit),
    // Le PAYS voyage avec la ville : c'est lui qui dit au board s'il a le
    // droit de montrer un restaurant sans etiquette halal (voir
    // lib/paysHalalDefaut.ts — l'accueil affichait « aucun kebab » a Berkane).
    ville: {
      slug: villes[0].slug,
      nom: villes[0].nom,
      pays: villes[0].pays,
      halalParDefaut: halalParDefaut(villes[0].pays),
      distKm: Math.round(villes[0].d * 10) / 10,
    },
  }
}
