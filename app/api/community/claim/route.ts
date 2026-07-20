import { NextRequest, NextResponse } from 'next/server'
import { getUserByToken, tokenFromRequest, claimSpot, rateLimit } from '@/lib/community'

// Rattacher un spot publié SANS compte à un compte fraîchement connecté :
// récupère les +10 points, badges et l'impact déjà accumulé (claimKey 48 h).
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const user = await getUserByToken(tokenFromRequest(request))
  if (!user) return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })
  if (!(await rateLimit(`claim:${user.id}`, 10, 3600))) return NextResponse.json({ error: 'Trop d\'essais' }, { status: 429 })
  let body: { spotId?: string; key?: string }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }
  const res = await claimSpot(user, String(body.spotId ?? ''), String(body.key ?? ''))
  if (!res) return NextResponse.json({ error: 'Spot introuvable ou déjà rattaché' }, { status: 400 })
  return NextResponse.json({ ok: true, pointsGagnes: res.pointsGagnes, nouveauxBadges: res.nouveauxBadges, points: user.points })
}
