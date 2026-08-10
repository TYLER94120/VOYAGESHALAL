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

export async function GET(req: Request) {
  const u = new URL(req.url)
  const lat = parseFloat(u.searchParams.get('lat') || '')
  const lng = parseFloat(u.searchParams.get('lng') || '')
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: 'lat et lng requis' }, { status: 400 })
  }

  // 1) La plus proche de nos villes
  let best: CityRef | null = null
  let bestD = Infinity
  for (const c of CITIES) {
    const d = distKm(lat, lng, c.lat, c.lng)
    if (d < bestD) { bestD = d; best = c }
  }
  if (best && bestD <= RAYON_KM) {
    return NextResponse.json(
      { nom: best.nom, pays: best.pays, slug: best.slug, distKm: Math.round(bestD), source: 'ville' },
      { headers: { 'Cache-Control': 'public, max-age=86400' } },
    )
  }

  // 2) Sinon le vrai nom du lieu (village, quartier) — le réseau ne bloque
  //    jamais l'affichage : l'appelant garde son libellé si ça échoue.
  try {
    const url = `https://nominatim.openstreetmap.org/reverse?format=json&zoom=10&lat=${lat}&lon=${lng}`
    const ac = new AbortController()
    const t = setTimeout(() => ac.abort(), 4000)
    const r = await fetch(url, {
      headers: { 'User-Agent': 'VoyagesHalal/1.0 (contact@voyageshalal.fr)', 'Accept-Language': 'fr,en' },
      signal: ac.signal,
    })
    clearTimeout(t)
    if (r.ok) {
      const j = await r.json()
      const a = j?.address ?? {}
      const nom = a.city || a.town || a.village || a.municipality || a.county || a.state
      if (nom) {
        return NextResponse.json(
          { nom, pays: a.country ?? null, slug: null, distKm: 0, source: 'nominatim' },
          { headers: { 'Cache-Control': 'public, max-age=86400' } },
        )
      }
    }
  } catch { /* pas de nom : l'appelant garde le sien */ }

  return NextResponse.json({ nom: null, source: 'inconnu' }, { headers: { 'Cache-Control': 'no-store' } })
}
