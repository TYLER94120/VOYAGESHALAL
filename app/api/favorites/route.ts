import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/pushStore'

// Sync « Mon carnet » par email (P3) — même identifiant sur app et web.
//   GET  /api/favorites?email=…   → { items }
//   POST /api/favorites { email, items } → fusion (union par id) puis stockage

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

function normEmail(e: unknown): string | null {
  const s = String(e ?? '').toLowerCase().trim()
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s) ? s : null
}
const key = (email: string) => `vh:fav:${email}`

interface Item { id: string; kind: string; nom: string; href: string; villeNom?: string; addedAt: string }

export async function GET(request: NextRequest) {
  const email = normEmail(request.nextUrl.searchParams.get('email'))
  if (!email) return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
  const redis = getRedis()
  if (!redis) return NextResponse.json({ error: 'Base non configurée' }, { status: 500 })
  const items = ((await redis.get(key(email))) as Item[] | null) ?? []
  return NextResponse.json({ items })
}

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try { body = await request.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }
  const email = normEmail(body.email)
  if (!email) return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
  const incoming = (Array.isArray(body.items) ? body.items : [])
    .filter((i): i is Item => Boolean(i && typeof i === 'object' && (i as Item).id && (i as Item).href))
    .slice(0, 500)
  const redis = getRedis()
  if (!redis) return NextResponse.json({ error: 'Base non configurée' }, { status: 500 })
  const existing = ((await redis.get(key(email))) as Item[] | null) ?? []
  const ids = new Set(existing.map((i) => i.id))
  const merged = [...existing, ...incoming.filter((i) => !ids.has(i.id))].slice(0, 500)
  await redis.set(key(email), merged)
  return NextResponse.json({ ok: true, items: merged })
}
