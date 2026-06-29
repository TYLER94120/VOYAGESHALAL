import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { saveSub, getRedis } from '@/lib/pushStore'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  if (!getRedis()) return NextResponse.json({ error: 'push_not_configured' }, { status: 503 })
  try {
    const body = await req.json()
    const sub = body.subscription
    const endpoint: string | undefined = sub?.endpoint
    if (!endpoint || body.lat == null || body.lng == null) {
      return NextResponse.json({ error: 'invalid' }, { status: 400 })
    }
    const id = createHash('sha256').update(endpoint).digest('hex').slice(0, 40)
    await saveSub({
      id,
      subscription: sub,
      lat: Number(body.lat),
      lng: Number(body.lng),
      method: Number(body.method ?? 3),
      school: Number(body.school ?? 0),
      prayers: Array.isArray(body.prayers) ? body.prayers : ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'],
      city: body.city,
    })
    return NextResponse.json({ ok: true, id })
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }
}
