import { NextRequest, NextResponse } from 'next/server'
import { getUserByToken, tokenFromRequest, confirmSpot, rateLimit } from '@/lib/community'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(request: NextRequest) {
  const user = await getUserByToken(tokenFromRequest(request))
  if (!user) return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })
  if (!(await rateLimit(`confirm:${user.id}`, 30, 3600))) return NextResponse.json({ error: 'Trop de confirmations' }, { status: 429 })
  let body: { spotId?: string }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }
  const res = await confirmSpot(String(body.spotId ?? ''), user)
  if (!res.ok) return NextResponse.json({ error: 'Spot introuvable' }, { status: 404 })
  return NextResponse.json(res)
}
