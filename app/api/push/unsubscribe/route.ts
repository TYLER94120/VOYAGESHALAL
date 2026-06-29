import { NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { deleteSub, getRedis } from '@/lib/pushStore'

export const runtime = 'nodejs'

export async function POST(req: Request) {
  if (!getRedis()) return NextResponse.json({ error: 'push_not_configured' }, { status: 503 })
  try {
    const { endpoint } = await req.json()
    if (!endpoint) return NextResponse.json({ error: 'invalid' }, { status: 400 })
    const id = createHash('sha256').update(endpoint).digest('hex').slice(0, 40)
    await deleteSub(id)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'bad_request' }, { status: 400 })
  }
}
