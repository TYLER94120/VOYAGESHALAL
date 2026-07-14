import { NextResponse } from 'next/server'
import { listAllSpots, listSpotsByVille } from '@/lib/prayerSpots'
import { checkAdmin } from '@/lib/adminAuth'
import { createSpotFromBody } from '@/lib/spotCreate'

// GET /api/spots               → tous les spots publiés (couche carte)
// GET /api/spots?ville=berkane → spots d'une ville
// GET /api/spots?lat&lng&radius→ spots autour d'un point (km)
// Public, lecture seule. Source unique partagée app + web.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function haversineKm(a: number, b: number, c: number, d: number) {
  const R = 6371, p = Math.PI / 180
  const x = Math.sin(((c - a) * p) / 2) ** 2 + Math.cos(a * p) * Math.cos(c * p) * Math.sin(((d - b) * p) / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const ville = searchParams.get('ville')
  const lat = parseFloat(searchParams.get('lat') || '')
  const lng = parseFloat(searchParams.get('lng') || '')
  const radius = Math.min(Math.max(parseFloat(searchParams.get('radius') || '10'), 0.5), 50)

  let spots = ville ? await listSpotsByVille(ville) : await listAllSpots()

  if (!Number.isNaN(lat) && !Number.isNaN(lng)) {
    spots = spots
      .map((s) => ({ ...s, distanceKm: Math.round(haversineKm(lat, lng, s.lat, s.lng) * 100) / 100 }))
      .filter((s) => (s as { distanceKm: number }).distanceKm <= radius)
      .sort((a, b) => (a as { distanceKm: number }).distanceKm - (b as { distanceKm: number }).distanceKm)
  }

  return NextResponse.json({ spots }, { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=120' } })
}

// POST /api/spots — création admin uniquement (x-admin-key / Bearer / ?token=).
// Même logique que /api/admin/spots ; accepte aussi l'alias `type` pour `typeLieu`.
export async function POST(req: Request) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }
  const result = await createSpotFromBody(body)
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status })
  return NextResponse.json({ ok: true, spot: result.spot })
}
