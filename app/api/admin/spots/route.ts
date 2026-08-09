import { NextResponse } from 'next/server'
import { checkAdmin } from '@/lib/adminAuth'
import { deleteSpot, listAllSpotsRaw, getSpotById, updateSpot } from '@/lib/prayerSpots'
import { createSpotFromBody } from '@/lib/spotCreate'

// Admin-only (ADMIN_TOKEN). Aucun formulaire public — seed par le propriétaire.
//   GET    /api/admin/spots?token=…            → liste complète (y compris cachés)
//   POST   /api/admin/spots                    → crée un spot
//   PATCH  /api/admin/spots                    → valide/masque une contribution
//   DELETE /api/admin/spots?id=…&token=…       → supprime un spot

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  // Liste brute : l'admin est le SEUL à voir les contributions en attente.
  const spots = await listAllSpotsRaw()
  const enAttente = spots.filter((s) => s.status === 'pending').length
  return NextResponse.json({ spots, count: spots.length, enAttente })
}

export async function POST(req: Request) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }
  const result = await createSpotFromBody(body)
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status })
  return NextResponse.json({ ok: true, spot: result.spot })
}

// Validation d'une contribution : un coin prière proposé par un visiteur
// arrive en 'pending' et n'est visible nulle part tant qu'un humain ne l'a
// pas vérifié ici. C'est le seul chemin pour le publier.
export async function PATCH(req: Request) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  let body: { id?: string; status?: string }
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }
  const { id, status } = body
  if (!id || !status || !['published', 'hidden', 'pending'].includes(status)) {
    return NextResponse.json({ error: 'id et status (published|hidden|pending) requis' }, { status: 400 })
  }
  const spot = await getSpotById(id)
  if (!spot) return NextResponse.json({ error: 'Spot introuvable' }, { status: 404 })
  const maj = await updateSpot(id, { status: status as 'published' | 'hidden' | 'pending' })
  if (!maj) return NextResponse.json({ error: 'Base indisponible' }, { status: 500 })
  return NextResponse.json({ ok: true, spot: maj })
}

export async function DELETE(req: Request) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })
  await deleteSpot(id)
  return NextResponse.json({ ok: true })
}
