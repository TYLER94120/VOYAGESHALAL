import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/pushStore'
import { getSpotById, addImpact, rateLimit } from '@/lib/community'

// « X voyageurs ont lancé l'itinéraire » — le signal d'usage le plus fort.
// Beacon au clic sur le bouton Itinéraire (pas d'auth : usage anonyme).
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  let body: { spotId?: string }
  try { body = await request.json() } catch { return NextResponse.json({ ok: false }, { status: 400 }) }
  const spotId = String(body.spotId ?? '')
  if (!(await rateLimit(`itin:${spotId}`, 60, 3600))) return NextResponse.json({ ok: true })
  const spot = await getSpotById(spotId)
  if (!spot) return NextResponse.json({ ok: false }, { status: 404 })
  const r = getRedis()
  if (r) {
    try {
      const n = await r.incr(`vh:spot:${spotId}:itineraires`)
      // Miroir sur l'objet spot → visible sur toutes les cartes sans jointure
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ;(spot as any).itineraires = Number(n)
      await r.set(`vh:spot:${spotId}`, spot)
      if (spot.auteurId) await addImpact(spot.auteurId, 1)
    } catch { /* best-effort */ }
  }
  return NextResponse.json({ ok: true })
}
