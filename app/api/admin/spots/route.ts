import { NextResponse } from 'next/server'
import { checkAdmin } from '@/lib/adminAuth'
import { deleteSpot, listAllSpots } from '@/lib/prayerSpots'
import { createSpotFromBody } from '@/lib/spotCreate'

// Admin-only (ADMIN_TOKEN). Aucun formulaire public — seed par le propriétaire.
//   GET    /api/admin/spots?token=…            → liste complète (y compris cachés)
//   POST   /api/admin/spots                    → crée un spot
//   DELETE /api/admin/spots?id=…&token=…       → supprime un spot

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const spots = await listAllSpots()
  return NextResponse.json({ spots, count: spots.length })
}

export async function POST(req: Request) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  let body: Record<string, unknown>
  try { body = await req.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }
  const result = await createSpotFromBody(body)
  if ('error' in result) return NextResponse.json({ error: result.error }, { status: result.status })
  return NextResponse.json({ ok: true, spot: result.spot })
}

export async function DELETE(req: Request) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const id = new URL(req.url).searchParams.get('id')
  if (!id) return NextResponse.json({ error: 'id requis' }, { status: 400 })
  await deleteSpot(id)
  return NextResponse.json({ ok: true })
}
