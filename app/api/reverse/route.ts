import { NextResponse } from 'next/server'
import cityCoords from '@/lib/cityCoords.json'

// GET /api/reverse?lat=..&lng=..  →  { nom, pays, slug, distKm, source }
//
// POURQUOI CETTE ROUTE EXISTE.
// Quand le GPS répondait, nous écrivions « Ma position ». Ce n'est pas une
// réponse : ça ne dit pas OÙ. L'utilisateur ne peut donc pas savoir si sa
// position a été prise en compte, ni si le résultat affiché le concerne.
// C'est le reproche exact de Mohamed, et il est juste.
//
// Nommer le lieu coûte presque rien : nous avons déjà les coordonnées de nos
// 354 villes. On cherche la plus proche — instantané, hors ligne, gratuit,
// aucune facturation Google. Ce n'est qu'au-delà de 60 km, quand aucune de
// nos villes ne convient honnêtement, qu'on demande le nom réel à Nominatim.

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface CityRef { slug: string; nom: string; pays: string; lat: number; lng: number }
const CITIES = cityCoords as CityRef[]

/** Seuil d'honnêteté : au-delà, dire « vous êtes à X » serait faux.
 *  60 km ≈ l'agglomération élargie d'une grande ville. */
const RAYON_KM = 60

function distKm(aLat: number, aLng: number, bLat: number, bLng: number) {
  const p = Math.PI / 180
  const h = Math.sin(((bLat - aLat) * p) / 2) ** 2 +
    Math.cos(aLat * p) * Math.cos(bLat * p) * Math.sin(((bLng - aLng) * p) / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h))
}

/** La phrase exacte de Google quand il refuse — jamais reformulée. On la
 *  remonte telle quelle : « ne devine pas, ne contourne pas : rapporte la
 *  phrase, Mohamed a la console sous la main ». */
async function googleCommune(lat: number, lng: number): Promise<{ nom?: string; pays?: string; refus?: string }> {
  const cle = process.env.GOOGLE_PLACES_KEY
  if (!cle) return { refus: 'GOOGLE_PLACES_KEY absente de l\'environnement' }
  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), 4000)
  try {
    const u = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&language=fr&result_type=locality|postal_town|administrative_area_level_2&key=${cle}`
    const r = await fetch(u, { signal: ac.signal })
    const j = await r.json()
    if (j.status !== 'OK') return { refus: `${j.status}${j.error_message ? ' — ' + j.error_message : ''}` }
    const comp = j.results?.[0]?.address_components ?? []
    const trouve = (t: string) => comp.find((c: { types: string[]; long_name: string }) => c.types.includes(t))?.long_name
    const nom = trouve('locality') || trouve('postal_town') || trouve('administrative_area_level_2')
    return nom ? { nom, pays: trouve('country') } : { refus: 'OK mais aucune commune dans la réponse' }
  } catch (e) {
    return { refus: String(e).slice(0, 140) }
  } finally { clearTimeout(t) }
}

/** OpenStreetMap : gratuit, sans clé, et il connaît les communes. C'est
 *  notre filet quand Google refuse — et il donne le MÊME niveau de détail. */
async function nominatimCommune(lat: number, lng: number): Promise<{ nom?: string; pays?: string }> {
  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), 4000)
  try {
    // zoom=12 : la commune, pas le département. À zoom=10 Fontenay-sous-Bois
    // remontait « Val-de-Marne » — un département n'est pas un endroit où
    // l'on est.
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&zoom=12&lat=${lat}&lon=${lng}`
    const r = await fetch(url, {
      headers: { 'User-Agent': 'VoyagesHalal/1.0 (contact@voyageshalal.fr)', 'Accept-Language': 'fr,en' },
      signal: ac.signal,
    })
    if (!r.ok) return {}
    const a = (await r.json())?.address ?? {}
    const nom = a.city || a.town || a.village || a.municipality || a.suburb
    return nom ? { nom, pays: a.country } : {}
  } catch { return {} } finally { clearTimeout(t) }
}

export async function GET(req: Request) {
  const u = new URL(req.url)
  const lat = parseFloat(u.searchParams.get('lat') || '')
  const lng = parseFloat(u.searchParams.get('lng') || '')
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: 'lat et lng requis' }, { status: 400 })
  }

  // ════════ LA VRAIE COMMUNE D'ABORD ════════
  //
  // DÉFAUT CORRIGÉ LE 15 AOÛT. Cette route commençait par chercher la plus
  // proche de NOS 354 villes dans un rayon de 60 km. Résultat pour quelqu'un
  // à Fontenay-sous-Bois : « Paris », à dix kilomètres — une ville où il
  // n'est pas. Le raccourci était gratuit et instantané, mais il répondait à
  // une autre question que celle posée : « quelle est notre ville la plus
  // proche ? » au lieu de « où suis-je ? ».
  //
  // Nos villes redescendent donc en DERNIER recours, et quand elles servent
  // la réponse porte sa distance : on ne fait jamais passer « la ville la
  // plus proche » pour « ta ville ».
  const g = await googleCommune(lat, lng)
  if (g.nom) {
    return NextResponse.json(
      { nom: g.nom, pays: g.pays ?? null, slug: null, distKm: 0, source: 'google' },
      { headers: { 'Cache-Control': 'public, max-age=86400' } },
    )
  }
  const n = await nominatimCommune(lat, lng)
  if (n.nom) {
    return NextResponse.json(
      { nom: n.nom, pays: n.pays ?? null, slug: null, distKm: 0, source: 'nominatim', diagnostic: g.refus },
      { headers: { 'Cache-Control': 'public, max-age=86400' } },
    )
  }

  // Dernier recours : notre propre liste, et on DIT que c'est approximatif.
  let best: CityRef | null = null
  let bestD = Infinity
  for (const c of CITIES) {
    const d = distKm(lat, lng, c.lat, c.lng)
    if (d < bestD) { bestD = d; best = c }
  }
  if (best && bestD <= RAYON_KM) {
    return NextResponse.json(
      { nom: best.nom, pays: best.pays, slug: best.slug, distKm: Math.round(bestD), source: 'ville', diagnostic: g.refus },
      { headers: { 'Cache-Control': 'public, max-age=86400' } },
    )
  }

  // Aucun nom sûr : on n'en invente pas.
  return NextResponse.json({ nom: null, source: 'inconnu', diagnostic: g.refus }, { headers: { 'Cache-Control': 'no-store' } })
}
