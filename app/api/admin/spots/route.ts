import { NextResponse } from 'next/server'
import { checkAdmin } from '@/lib/adminAuth'
import { saveSpot, deleteSpot, listAllSpots } from '@/lib/prayerSpots'
import type { PrayerSpotLieu } from '@/lib/villeTypes'
import cityCoords from '@/lib/cityCoords.json'

// Admin-only (ADMIN_TOKEN). Aucun formulaire public — seed par le propriétaire.
//   GET    /api/admin/spots?token=…            → liste complète (y compris cachés)
//   POST   /api/admin/spots                    → crée un spot
//   DELETE /api/admin/spots?id=…&token=…       → supprime un spot

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface CityRef { slug: string; nom: string; lat: number; lng: number }
const CITIES = cityCoords as CityRef[]
const norm = (s: string) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

// Rattache un spot à la ville la plus proche (pour l'index /priere/[ville]).
function nearestCity(lat: number, lng: number): CityRef {
  let best = CITIES[0], bd = Infinity
  for (const c of CITIES) {
    const d = (c.lat - lat) ** 2 + (c.lng - lng) ** 2
    if (d < bd) { bd = d; best = c }
  }
  return best
}

export async function GET(req: Request) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const spots = await listAllSpots()
  return NextResponse.json({ spots, count: spots.length })
}

export async function POST(req: Request) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }

  const nom = String(body.nom || '').trim()
  const lat = Number(body.lat), lng = Number(body.lng)
  const typeLieu = String(body.typeLieu || 'autre') as PrayerSpotLieu
  if (!nom || Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json({ error: 'nom, lat, lng requis' }, { status: 400 })
  }

  // Ville : explicite (villeSlug) sinon la plus proche des coordonnées.
  let city: CityRef | undefined
  if (body.villeSlug) {
    const nq = norm(String(body.villeSlug))
    city = CITIES.find((c) => c.slug === body.villeSlug || norm(c.nom) === nq)
  }
  if (!city) city = nearestCity(lat, lng)

  const spot = await saveSpot({
    nom, typeLieu,
    villeSlug: city.slug, villeNom: city.nom,
    lat, lng,
    adresse: body.adresse ? String(body.adresse) : undefined,
    description: body.description ? String(body.description) : undefined,
    photo: body.photo ? String(body.photo) : undefined,
    note: body.note != null ? Number(body.note) : undefined,
  })
  if (!spot) return NextResponse.json({ error: 'Base non configurée (UPSTASH manquant).' }, { status: 500 })
  return NextResponse.json({ ok: true, spot })
}

export async function DELETE(req: Request) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })
  await deleteSpot(id)
  return NextResponse.json({ ok: true })
}
