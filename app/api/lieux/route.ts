import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'
import { listAllSpots } from '@/lib/prayerSpots'
import { CRITERES_DEFAUT, type Criteres } from '@/lib/criteres'

// 🍽 LE SUR MESURE — POST /api/lieux
//
// Ordre de Mohamed, 15 août : « Le visiteur ne veut pas choisir parmi
// vingt restaurants : il veut qu'on lui dise où aller, ce soir, pour lui.
// TROIS fiches. Jamais plus. »
//
// ════════ DEUX PASSES, ET C'EST TOUT L'ENJEU ════════
//
// PASSE 1 — chercher large avec les champs les MOINS chers.
//   Text Search (API New), FieldMask réduit au strict nécessaire pour
//   TRIER : nom, position, note, nombre d'avis, niveau de prix, ouvert,
//   adresse, identifiant. Une quinzaine de candidats. Aucune photo,
//   aucun avis — ce sont eux qui coûtent.
//
// PASSE 2 — choisir TROIS, puis enrichir SEULEMENT ces trois.
//   Place Details sur les trois retenus, avec les champs riches dont
//   l'IA a besoin pour écrire quelque chose d'intéressant : avis,
//   résumé, attributs (sur place / à emporter / livraison, familles,
//   terrasse, végétarien, réservation), horaires, photos, téléphone.
//
// POURQUOI CET ORDRE COÛTE DIX FOIS MOINS. Google facture par palier de
// champs : Essentials (position, nom) < Pro (note, ouverture) <
// Enterprise (avis, photos, attributs). Demander les champs riches sur
// quinze candidats au lieu de trois multiplie la facture pour un
// résultat identique — les douze autres ne sont jamais affichés.
//
// ════════ CE QUI NE SE NÉGOCIE PAS ════════
// · Nos spots vérifiés passent AU-DESSUS, toujours.
// · Chaque lieu porte sa phrase d'honnêteté : « vérifié par la
//   communauté » ou « signalé halal sur Google Maps — à confirmer sur
//   place ». Jamais une certification affirmée.
// · La clé reste côté serveur. Sans clé : repli spots + OpenStreetMap,
//   et la réponse le DIT (source: 'osm' / 'spots-seulement').
// · Délai 4 s par appel, cache Redis 24 h par zone + critères, quota
//   20/h par visiteur.
// · Attribution Google conservée et renvoyée au client (leurs conditions
//   l'exigent sur les photos et les avis).

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const DELAI = 4000
const DELAI_OSM = 8500
const QUOTA_HEURE = 20
const CACHE_S = 24 * 3600
const CANDIDATS = 15
const RETENUS = 3
const AUTRES = 4

let redis: Redis | null | undefined
function getRedis(): Redis | null {
  if (redis !== undefined) return redis
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  redis = url && token ? new Redis({ url, token }) : null
  return redis
}

export interface Avis {
  texte: string
  note?: number
  /** Auteur — l'attribution est exigée par Google dès qu'on montre un avis. */
  auteur?: string
}

export interface Fiche {
  id?: string
  nom: string
  distanceM: number
  lat: number
  lng: number
  note?: number
  nbAvis?: number
  /** 1 à 4, échelle Google. */
  prix?: number
  ouvert?: boolean
  fermeA?: string
  adresse?: string
  telephone?: string
  mapsUri?: string
  /** URL passant par notre proxy : la clé ne sort jamais du serveur. */
  photos?: string[]
  attributionsPhotos?: string[]
  avis?: Avis[]
  resume?: string
  attributs?: {
    surPlace?: boolean; aEmporter?: boolean; livraison?: boolean
    famille?: boolean; terrasse?: boolean; vegetarien?: boolean
    reservation?: boolean; accessible?: boolean
  }
  statut: string
  source: 'spot' | 'google' | 'osm'
}

function distM(a: number, b: number, c: number, d: number) {
  const R = 6371000, p = Math.PI / 180
  const x = Math.sin(((c - a) * p) / 2) ** 2 + Math.cos(a * p) * Math.cos(c * p) * Math.sin(((d - b) * p) / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)))
}

const RAYON: Record<Criteres['distance'], number> = { pied: 1200, court: 5000, 'peu-importe': 12000 }

const TEXTE: Record<Criteres['quoi'], string> = {
  pizza: 'halal pizza', kebab: 'halal kebab', burger: 'halal burger',
  oriental: 'halal middle eastern restaurant', asiatique: 'halal asian restaurant',
  'petit-dejeuner': 'halal breakfast', patisserie: 'halal bakery pastry',
  'peu-importe': 'halal restaurant',
}

// ─────────────────────── nos spots vérifiés ───────────────────────

async function nosSpots(lat: number, lng: number, c: Criteres): Promise<Fiche[]> {
  try {
    const tous = await listAllSpots()
    return tous
      .filter((s) => s.categorie === 'resto' || s.categorie === 'boucherie')
      .map((s) => ({ s, d: distM(lat, lng, s.lat, s.lng) }))
      .filter(({ d }) => d <= RAYON[c.distance])
      .sort((a, b) => a.d - b.d)
      .slice(0, RETENUS)
      .map(({ s, d }) => ({
        id: s.id, nom: s.nom, distanceM: d, lat: s.lat, lng: s.lng,
        adresse: s.adresse, note: s.note,
        statut: s.source === 'community'
          ? `vérifié par la communauté · ${s.confirmations || 0} confirmation${(s.confirmations ?? 0) > 1 ? 's' : ''}`
          : 'référencé par VoyagesHalal · à vérifier sur place',
        source: 'spot' as const,
      }))
  } catch { return [] }
}

// ─────────────────────── passe 1 : chercher large ───────────────────────

/** Champs de tri UNIQUEMENT — les moins chers de la grille Google. */
const CHAMPS_PASSE1 = [
  'places.id',
  'places.displayName',
  'places.location',
  'places.formattedAddress',
  'places.rating',
  'places.userRatingCount',
  'places.priceLevel',
  'places.currentOpeningHours.openNow',
].join(',')

interface Candidat {
  id: string; nom: string; lat: number; lng: number
  note?: number; nbAvis?: number; prix?: number; ouvert?: boolean; adresse?: string
  distanceM: number
}

async function passe1(lat: number, lng: number, c: Criteres, cle: string, lang: string): Promise<Candidat[] | null> {
  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), DELAI)
  try {
    const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST', signal: ac.signal,
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': cle, 'X-Goog-FieldMask': CHAMPS_PASSE1 },
      body: JSON.stringify({
        textQuery: TEXTE[c.quoi],
        languageCode: lang,
        pageSize: CANDIDATS,
        openNow: c.ouvertMaintenant || undefined,
        locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius: RAYON[c.distance] } },
      }),
    })
    if (!r.ok) return null
    const j = await r.json() as { places?: Record<string, unknown>[] }
    const PRIX: Record<string, number> = { PRICE_LEVEL_INEXPENSIVE: 1, PRICE_LEVEL_MODERATE: 2, PRICE_LEVEL_EXPENSIVE: 3, PRICE_LEVEL_VERY_EXPENSIVE: 4 }
    return (j.places ?? [])
      .map((p) => {
        const loc = p.location as { latitude: number; longitude: number } | undefined
        const nom = (p.displayName as { text?: string } | undefined)?.text
        if (!loc || !nom) return null
        return {
          id: String(p.id ?? ''), nom, lat: loc.latitude, lng: loc.longitude,
          note: p.rating as number | undefined,
          nbAvis: p.userRatingCount as number | undefined,
          prix: PRIX[String(p.priceLevel ?? '')],
          ouvert: (p.currentOpeningHours as { openNow?: boolean } | undefined)?.openNow,
          adresse: p.formattedAddress as string | undefined,
          distanceM: distM(lat, lng, loc.latitude, loc.longitude),
        } as Candidat
      })
      .filter(Boolean) as Candidat[]
  } catch { return null } finally { clearTimeout(t) }
}

/** Le tri : c'est lui qui rend le résultat « sur mesure ». */
function classer(cands: Candidat[], c: Criteres): Candidat[] {
  return [...cands]
    .filter((x) => (c.budget === 'petit' ? (x.prix ?? 2) <= 2 : c.budget === 'moyen' ? (x.prix ?? 2) <= 3 : true))
    .map((x) => {
      let s = 0
      // Proximité : décisive quand le visiteur a dit « à pied ».
      const poidsDist = c.distance === 'pied' ? 3 : c.distance === 'court' ? 2 : 1
      s -= (x.distanceM / 1000) * poidsDist
      // Une note ne vaut que par son nombre d'avis : 5,0 sur 3 avis ne
      // dit rien, 4,4 sur 900 dit beaucoup.
      if (x.note && x.nbAvis) s += x.note * Math.min(1, Math.log10(x.nbAvis + 1) / 2.5) * 1.6
      if (x.ouvert === true) s += 1.2
      if (x.ouvert === false && c.ouvertMaintenant) s -= 8
      if (c.budget === 'petit' && x.prix === 1) s += 1
      return { x, s }
    })
    .sort((a, b) => b.s - a.s)
    .map((o) => o.x)
}

// ─────────────────────── passe 2 : enrichir les 3 ───────────────────────

/** Champs riches — demandés SEULEMENT sur les trois retenus. */
const CHAMPS_PASSE2 = [
  'id', 'displayName', 'formattedAddress', 'location', 'rating', 'userRatingCount',
  'priceLevel', 'nationalPhoneNumber', 'googleMapsUri',
  'currentOpeningHours', 'editorialSummary', 'reviews', 'photos',
  'dineIn', 'takeout', 'delivery', 'goodForChildren', 'outdoorSeating',
  'servesVegetarianFood', 'reservable', 'accessibilityOptions',
].join(',')

async function enrichir(cand: Candidat, cle: string, lang: string, origin: string): Promise<Fiche> {
  const base: Fiche = {
    id: cand.id, nom: cand.nom, distanceM: cand.distanceM, lat: cand.lat, lng: cand.lng,
    note: cand.note, nbAvis: cand.nbAvis, prix: cand.prix, ouvert: cand.ouvert, adresse: cand.adresse,
    statut: 'signalé halal sur Google Maps — à confirmer sur place',
    source: 'google',
  }
  if (!cand.id) return base
  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), DELAI)
  try {
    const r = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(cand.id)}?languageCode=${lang}`, {
      signal: ac.signal,
      headers: { 'X-Goog-Api-Key': cle, 'X-Goog-FieldMask': CHAMPS_PASSE2 },
    })
    if (!r.ok) return base
    const p = await r.json() as Record<string, unknown>
    const oh = p.currentOpeningHours as { openNow?: boolean; weekdayDescriptions?: string[] } | undefined
    const photos = (p.photos as { name?: string; authorAttributions?: { displayName?: string }[] }[] | undefined) ?? []
    const reviews = (p.reviews as { text?: { text?: string }; rating?: number; authorAttribution?: { displayName?: string } }[] | undefined) ?? []
    const acc = p.accessibilityOptions as Record<string, boolean> | undefined
    return {
      ...base,
      telephone: p.nationalPhoneNumber as string | undefined,
      mapsUri: p.googleMapsUri as string | undefined,
      ouvert: oh?.openNow ?? cand.ouvert,
      fermeA: heureFermeture(oh?.weekdayDescriptions),
      resume: (p.editorialSummary as { text?: string } | undefined)?.text,
      // Les photos passent par NOTRE proxy : la clé ne sort jamais.
      photos: photos.slice(0, 2).map((ph) => `${origin}/api/lieux/photo?ref=${encodeURIComponent(ph.name ?? '')}`).filter((u) => !u.endsWith('ref=')),
      attributionsPhotos: photos.slice(0, 2).flatMap((ph) => (ph.authorAttributions ?? []).map((a) => a.displayName ?? '').filter(Boolean)),
      avis: reviews.slice(0, 4).map((rv) => ({
        texte: (rv.text?.text ?? '').slice(0, 400),
        note: rv.rating,
        auteur: rv.authorAttribution?.displayName,
      })).filter((rv) => rv.texte),
      attributs: {
        surPlace: p.dineIn as boolean | undefined,
        aEmporter: p.takeout as boolean | undefined,
        livraison: p.delivery as boolean | undefined,
        famille: p.goodForChildren as boolean | undefined,
        terrasse: p.outdoorSeating as boolean | undefined,
        vegetarien: p.servesVegetarianFood as boolean | undefined,
        reservation: p.reservable as boolean | undefined,
        accessible: acc ? Object.values(acc).some(Boolean) : undefined,
      },
    }
  } catch { return base } finally { clearTimeout(t) }
}

/** « lundi : 11:00 – 23:00 » → « 23:00 ». Aucune heure inventée : si on ne
 *  sait pas lire la ligne du jour, on ne renvoie rien. */
function heureFermeture(desc?: string[]): string | undefined {
  if (!desc?.length) return undefined
  const jour = new Date().getDay() // 0 = dimanche
  const ligne = desc[(jour + 6) % 7] // Google commence au lundi
  const m = ligne?.match(/(\d{1,2}[:h]\d{2})\s*(?:–|-|—|to)\s*(\d{1,2}[:h]\d{2})/)
  return m?.[2]
}

// ─────────────────────── repli OpenStreetMap ───────────────────────

async function viaOSM(origin: string, lat: number, lng: number, c: Criteres): Promise<Fiche[]> {
  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), DELAI_OSM)
  try {
    const r = await fetch(`${origin}/api/osm-restos?lat=${lat}&lng=${lng}`, { signal: ac.signal })
    if (!r.ok) return []
    const j = await r.json() as { restos?: { nom: string; lat: number; lng: number }[] }
    return (j.restos ?? [])
      .map((x) => ({
        nom: x.nom, lat: x.lat, lng: x.lng,
        distanceM: distM(lat, lng, x.lat, x.lng),
        statut: 'signalé halal sur OpenStreetMap — à confirmer sur place',
        source: 'osm' as const,
      }))
      .filter((x) => x.distanceM <= RAYON[c.distance])
      .sort((a, b) => a.distanceM - b.distanceM)
      .slice(0, RETENUS + AUTRES)
  } catch { return [] } finally { clearTimeout(t) }
}

// ─────────────────────── la route ───────────────────────

export async function POST(req: Request) {
  let corps: { lat?: number; lng?: number; criteres?: Partial<Criteres>; lang?: string; ecrit?: boolean }
  try { corps = await req.json() } catch { return NextResponse.json({ erreur: 'corps invalide' }, { status: 400 }) }
  const lat = Number(corps.lat), lng = Number(corps.lng)
  if (!Number.isFinite(lat) || !Number.isFinite(lng) || Math.abs(lat) > 90 || Math.abs(lng) > 180) {
    return NextResponse.json({ erreur: 'position invalide' }, { status: 400 })
  }
  const c: Criteres = { ...CRITERES_DEFAUT, ...(corps.criteres ?? {}) }
  const lang = corps.lang === 'en' ? 'en' : 'fr'
  const r = getRedis()

  // Quota — Redis absent : on laisse passer (un compteur en panne ne doit
  // pas fermer le service).
  if (r) {
    try {
      const ip = (req.headers.get('x-forwarded-for') ?? 'inconnu').split(',')[0].trim()
      const k = `lieux:quota:${ip}:${new Date().toISOString().slice(0, 13)}`
      const n = await r.incr(k)
      if (n === 1) await r.expire(k, 3600)
      if (n > QUOTA_HEURE) return NextResponse.json({ erreur: 'quota' }, { status: 429 })
    } catch { /* jamais bloquant */ }
  }

  // 📊 LA MESURE (§7) : sans elle, ça n'existe pas.
  const compter = async (...cles: string[]) => {
    if (!r) return
    try { await Promise.all(cles.map((k) => r.incr(k))) } catch { /* jamais bloquant */ }
  }
  await compter('surmesure:recherches', corps.ecrit ? 'surmesure:ecrites' : 'surmesure:cliquees')

  const zone = `${lat.toFixed(2)},${lng.toFixed(2)}`
  const empreinte = `${zone}:${c.quoi}:${c.distance}:${c.budget}:${c.exigence}:${c.ouvertMaintenant ? 1 : 0}:${lang}`
  if (r) {
    try {
      const cache = await r.get<{ fiches: Fiche[]; autres: Fiche[]; source: string }>(`surmesure:cache:${empreinte}`)
      if (cache) {
        await compter(cache.fiches.length ? 'surmesure:avec' : 'surmesure:vides')
        return NextResponse.json({ ...cache, cache: true })
      }
    } catch { /* cache muet = on cherche */ }
  }

  const origin = new URL(req.url).origin
  const cle = process.env.GOOGLE_PLACES_KEY
  const spots = await nosSpots(lat, lng, c)

  let fiches: Fiche[] = []
  let autres: Fiche[] = []
  let source: 'google' | 'osm' | 'spots-seulement' = 'spots-seulement'
  let etatGoogle: 'ok' | 'vide' | 'muet' | 'sans-cle' = cle ? 'muet' : 'sans-cle'

  // « Seulement les adresses vérifiées » : on n'interroge même pas Google.
  if (c.exigence === 'verifies') {
    fiches = spots.slice(0, RETENUS)
  } else if (cle) {
    const cands = await passe1(lat, lng, c, cle, lang)
    if (cands !== null) etatGoogle = cands.length ? 'ok' : 'vide'
    if (cands?.length) {
      const classes = classer(cands, c).filter((x) => !spots.some((s) => distM(s.lat, s.lng, x.lat, x.lng) < 60))
      const placesRetenues = classes.slice(0, Math.max(0, RETENUS - spots.length))
      // PASSE 2 : uniquement sur les retenues.
      const enrichies = await Promise.all(placesRetenues.map((x) => enrichir(x, cle, lang, origin)))
      source = 'google'
      fiches = [...spots, ...enrichies].slice(0, RETENUS)
      autres = classes.slice(placesRetenues.length, placesRetenues.length + AUTRES).map((x) => ({
        id: x.id, nom: x.nom, distanceM: x.distanceM, lat: x.lat, lng: x.lng,
        note: x.note, nbAvis: x.nbAvis, prix: x.prix, ouvert: x.ouvert, adresse: x.adresse,
        statut: 'signalé halal sur Google Maps — à confirmer sur place',
        source: 'google' as const,
      }))
    }
  }

  if (source !== 'google' && c.exigence !== 'verifies') {
    const osm = await viaOSM(origin, lat, lng, c)
    if (osm.length) {
      source = 'osm'
      const sansDoublon = osm.filter((o) => !spots.some((s) => distM(s.lat, s.lng, o.lat, o.lng) < 60))
      fiches = [...spots, ...sansDoublon].slice(0, RETENUS)
      autres = sansDoublon.slice(Math.max(0, RETENUS - spots.length)).slice(0, AUTRES)
    } else if (spots.length) {
      fiches = spots.slice(0, RETENUS)
    }
  }

  await compter(fiches.length ? 'surmesure:avec' : 'surmesure:vides')
  const reponse = { fiches, autres, source, etatGoogle }
  if (r && source === 'google') {
    try { await r.set(`surmesure:cache:${empreinte}`, reponse, { ex: CACHE_S }) } catch { /* jamais bloquant */ }
  }
  return NextResponse.json(reponse)
}
