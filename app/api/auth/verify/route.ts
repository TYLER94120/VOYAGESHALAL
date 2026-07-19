import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/pushStore'
import { findOrCreateUser, createSession, rateLimit } from '@/lib/community'

export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  let body: { email?: string; code?: string; pseudo?: string }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }
  const email = String(body.email ?? '').toLowerCase().trim()
  const code = String(body.code ?? '').trim()
  if (!(await rateLimit(`verify:${email}`, 10, 3600))) return NextResponse.json({ error: 'Trop d\'essais' }, { status: 429 })
  const r = getRedis()
  if (!r) return NextResponse.json({ error: 'Service indisponible' }, { status: 500 })
  const expected = (await r.get(`vh:otp:${email}`)) as string | null
  if (!expected || String(expected) !== code) return NextResponse.json({ error: 'Code incorrect ou expiré' }, { status: 401 })
  await r.del(`vh:otp:${email}`)
  const user = await findOrCreateUser(email, String(body.pseudo ?? ''))
  if (!user) return NextResponse.json({ error: 'Service indisponible' }, { status: 500 })
  const token = await createSession(user.id)
  return NextResponse.json({ ok: true, token, user: { id: user.id, pseudo: user.pseudo, points: user.points, badges: user.badges } })
}
