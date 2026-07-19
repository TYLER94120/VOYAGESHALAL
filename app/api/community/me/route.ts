import { NextRequest, NextResponse } from 'next/server'
import { getUserByToken, tokenFromRequest, impactOf, niveauOf } from '@/lib/community'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const user = await getUserByToken(tokenFromRequest(request))
  if (!user) return NextResponse.json({ user: null })
  const impact = await impactOf(user.id)
  return NextResponse.json({ user: { pseudo: user.pseudo, points: user.points, nbSpots: user.nbSpots, nbConfirmations: user.nbConfirmations, badges: user.badges, niveau: niveauOf(user.points), impact } })
}
