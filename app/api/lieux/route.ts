import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { listAllSpots } from '@/lib/prayerSpots'

// 🍽 « MANGER HALAL PRÈS DE MOI » — POST /api/lieux { lat, lng, requete }
//
// Ordre de Mohamed, 14 août au soir : « La priorité est Google Maps. »
// Le visiteur dit ce qu'il veut manger, cette route trouve les adresses
// halal autour de lui, et le widget fait rédiger la réponse par l'IA de
// la famille (via /api/lieux/assistant).
//
// TROIS SOURCES, DANS CET ORDRE, ET ON DIT TOUJOURS D'OÙ ÇA VIENT :
//   1. NOS SPOTS VÉRIFIÉS — toujours au-dessus. Google trouve large,
//      nous on qualifie : c'est notre valeur.
//   2. GOOGLE PLACES si la clé GOOGLE_PLACES_KEY existe dans
//      l'environnement — JAMAIS dans la page : une clé dans le navigateur
//      est volée le jour même. Chaque lieu Google est étiqueté « signalé
//      halal sur Google Maps — à confirmer sur place » : leur filtre
//      halal repose sur les déclarations et les avis, PAS sur une
//      certification. Non négociable — un widget qui survend une adresse
//      détruit la confiance des cinq sites d'un coup.
//   3. Sans clé ou Places muet : notre relais OpenStreetMap — et la
//      réponse porte source: 'osm' pour que le widget le dise sobrement.
//
// PRÊT-POUR-LA-CLÉ : la clé n'est peut-être pas encore posée dans
// l'hébergeur. Ce code marche sans (repli 1+3) et s'allume TOUT SEUL
// quand elle apparaît — aucun déploiement à refaire.
//
// CONDITIONS DÉGRADÉES (règles de la maison) :
//   · délai maximum 4 s sur Places — chaque appel coûte de l'argent, une
//     attente infinie coûterait un visiteur ;
//   · cache Redis 24 h par zone arrondie (~1 km) + requête : la même
//     recherche ne se paie pas deux fois ;
//   · quota 20 recherches / heure / visiteur ;
//   · Redis absent → tout continue, simplement sans cache ni quota.
//
// LA MESURE, SINON RIEN : compteurs Redis lieux:recherches, lieux:avec,
// lieux:vides — un widget qu'on ne mesure pas n'existe pas.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DELAI_PLACES = 4000
const DELAI_OSM = 8500
const QUOTA_HEURE = 20
const CACHE_S = 24 * 3600

let redis: Redis | null | undefined
function getRedis(): Redis | null {
  if (redis !== undefined) return redis
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  redis = url && token ? new Redis({ url, token }) : null
  return redis
}

export interface Lieu {
  nom: string
  distanceM: number
  note?: number
  ouvert?: boolean
  adresse?: string
  /** Phrase d'honnêteté affichée telle quelle par le widget. */
  statut: string
  source: 'spot' | 'google' | 'osm'
  lat: number
  lng: number
}

function distM(a: number, b: number, c: number, d: number) {
  const R = 6371000, p = Math.PI / 180
  const x = Math.sin(((c - a) * p) / 2) ** 2 + Math.cos(a * p) * Math.cos(c * p) * Math.sin(((d - b) * p) / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)))
}

/** Nos spots vérifiés autour du point — TOUJOURS servis, toujours premiers. */
async function nosSpots(lat: number, lng: number, requete: string): Promise<Lieu[]> {
  try {
    const tous = await listAllSpots()
    const q = requete.trim().toLowerCase()
    return tous
      .filter((s) => s.categorie === 'resto' || s.categorie === 'boucherie')
      .map((s) => ({ s, d: distM(lat, lng, s.lat, s.lng) }))
      .filter(({ s, d }) => d <= 8000 && (!q || `${s.nom} ${s.description ?? ''}`.toLowerCase().includes(q)))
      .sort((a, b) => a.d - b.d)
      .slice(0, 3)
      .map(({ s, d }) => ({
        nom: s.nom, distanceM: d, adresse: s.adresse, lat: s.lat, lng: s.lng,
        note: s.note,
        statut: s.source === 'community'
          ? `partagé par un voyageur · ${s.confirmations || 'aucune'} confirmation${(s.confirmations ?? 0) > 1 ? 's' : ''}`
          : 'référencé par VoyagesHalal · à vérifier',
        source: 'spot' as const,
      }))
  } catch { return [] }
}

/** Google Places Text Search — seulement si la clé est posée. */
async function viaPlaces(lat: number, lng: number, requete: string, cle: string): Promise<Lieu[] | null> {
  const ac = new AbortController()
  const minuteur = setTimeout(() => ac.abort(), DELAI_PLACES)
  try {
    const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST',
      signal: ac.signal,
      headers: {
        'Content-Type': 'application/json',
        'X-Goog-Api-Key': cle,
        'X-Goog-FieldMask': 'places.displayName,places.location,places.rating,places.currentOpeningHours.openNow,places.formattedAddress',
      },
      body: JSON.stringify({
        textQuery: `halal ${requete.trim() || 'restaurant'}`,
        languageCode: 'fr',
        pageSize: 6,
        locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius: 5000 } },
      }),
    })
    if (!r.ok) return null
    const j = await r.json() as { places?: { displayName?: { text?: string }; location?: { latitude: number; longitude: number }; rating?: number; currentOpeningHours?: { openNow?: boolean }; formattedAddress?: string }[] }
    if (!j.places?.length) return []
    return j.places
      .filter((p) => p.displayName?.text && p.location)
      .map((p) => ({
        nom: p.displayName!.text!,
        lat: p.location!.latitude, lng: p.location!.longitude,
        distanceM: distM(lat, lng, p.location!.latitude, p.location!.longitude),
        note: p.rating,
        ouvert: p.currentOpeningHours?.openNow,
        adresse: p.formattedAddress,
        statut: 'signalé halal sur Google Maps — à confirmer sur place',
        source: 'google' as const,
      }))
      .sort((a, b) => a.distanceM - b.distanceM)
      .slice(0, 6)
  } catch { return null } finally { clearTimeout(minuteur) }
}

/** Repli : notre relais OpenStreetMap (miroirs + cache déjà en place). */
async function viaOSM(origin: string, lat: number, lng: number): Promise<Lieu[]> {
  const ac = new AbortController()
  const minuteur = setTimeout(() => ac.abort(), DELAI_OSM)
  try {
    const r = await fetch(`${origin}/api/osm-restos?lat=${lat}&lng=${lng}`, { signal: ac.signal })
    if (!r.ok) return []
    const j = await r.json() as { restos?: { nom: string; lat: number; lng: number; halal?: string }[] }
    return (j.restos ?? [])
      .map((x) => ({
        nom: x.nom, lat: x.lat, lng: x.lng,
        distanceM: distM(lat, lng, x.lat, x.lng),
        statut: 'signalé halal sur OpenStreetMap — à confirmer sur place',
        source: 'osm' as const,
      }))
      .sort((a, b) => a.distanceM - b.distanceM)
      .slice(0, 6)
  } catch { return [] } finally { clearTimeout(minuteur) }
}

export async function POST(req: Request) {
  let corps: { lat?: number; lng?: number; requete?: string }
  try { corps = await req.json() } catch { return NextResponse.json({ erreur: 'corps invalide' }, { status: 400 }) }
  const lat = Number(corps.lat), lng = Number(corps.lng)
  const requete = String(corps.requete ?? '').slice(0, 60)
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ erreur: 'position invalide' }, { status: 400 })
  }

  const r = getRedis()

  // Quota par visiteur — 20/h. Redis absent : on laisse passer, un widget
  // qui refuse tout le monde parce que le compteur est en panne serait pire.
  if (r) {
    try {
      const ip = (req.headers.get('x-forwarded-for') ?? 'inconnu').split(',')[0].trim()
      const cle = `lieux:quota:${ip}:${new Date().toISOString().slice(0, 13)}`
      const n = await r.incr(cle)
      if (n === 1) await r.expire(cle, 3600)
      if (n > QUOTA_HEURE) return NextResponse.json({ erreur: 'quota atteint — réessaie dans une heure' }, { status: 429 })
    } catch { /* le quota ne doit jamais casser la recherche */ }
  }

  // Cache par zone (~1 km) + requête : la même recherche ne se paie pas
  // deux fois. On ne met en cache QUE les réponses Google : mettre le
  // repli en cache 24 h retarderait l'allumage quand la clé arrive.
  const zone = `${lat.toFixed(2)},${lng.toFixed(2)}:${requete.trim().toLowerCase() || 'tout'}`
  if (r) {
    try {
      const enCache = await r.get<{ lieux: Lieu[]; source: string }>(`lieux:cache:${zone}`)
      if (enCache) {
        await r.incr('lieux:recherches').catch(() => {})
        await r.incr(enCache.lieux.length ? 'lieux:avec' : 'lieux:vides').catch(() => {})
        return NextResponse.json({ ...enCache, cache: true })
      }
    } catch { /* cache muet = on cherche */ }
  }

  const origin = new URL(req.url).origin
  const cleGoogle = process.env.GOOGLE_PLACES_KEY

  const spots = await nosSpots(lat, lng, requete)
  let lieux: Lieu[] = [...spots]
  let source: 'google' | 'osm' | 'spots-seulement' = 'spots-seulement'

  if (cleGoogle) {
    const dePlaces = await viaPlaces(lat, lng, requete, cleGoogle)
    if (dePlaces !== null) {
      source = 'google'
      lieux = [...spots, ...dePlaces.filter((g) => !spots.some((s) => distM(s.lat, s.lng, g.lat, g.lng) < 60))].slice(0, 6)
    }
  }
  if (source !== 'google') {
    const deOSM = await viaOSM(origin, lat, lng)
    if (deOSM.length) {
      source = 'osm'
      lieux = [...spots, ...deOSM.filter((o) => !spots.some((s) => distM(s.lat, s.lng, o.lat, o.lng) < 60))].slice(0, 6)
    }
  }

  // La mesure, sinon rien.
  if (r) {
    try {
      await r.incr('lieux:recherches')
      await r.incr(lieux.length ? 'lieux:avec' : 'lieux:vides')
    } catch { /* compter ne doit jamais casser la réponse */ }
    if (source === 'google') {
      try { await r.set(`lieux:cache:${zone}`, { lieux, source }, { ex: CACHE_S }) } catch { /* idem */ }
    }
  }

  return NextResponse.json({ lieux, source })
}
