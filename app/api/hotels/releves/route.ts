import { NextResponse } from 'next/server'
import { getRedis } from '@/lib/pushStore'
import { rateLimit } from '@/lib/community'

// 📊 Relevés de prix communautaires — SOUMISSION avec MODÉRATION.
// Rien ne s'affiche publiquement sans validation : les soumissions vont dans
// une file (Redis), l'admin les relit (GET + ADMIN_TOKEN) puis les publie en
// les ajoutant à data/prixReleves.json (source affichée, datée).
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  try {
    const ip = (req.headers.get('x-forwarded-for') ?? 'anon').split(',')[0].trim()
    if (!(await rateLimit(`releve:${ip}`, 5, 86400))) {
      return NextResponse.json({ error: 'Limite atteinte, réessaie demain.' }, { status: 429 })
    }
    const b = await req.json()
    const hotel = String(b.hotel ?? '').trim().slice(0, 80)
    const ville = String(b.ville ?? '').trim().slice(0, 60)
    const booking = Number(b.booking), halalbooking = Number(b.halalbooking)
    const membre = b.membre != null && b.membre !== '' ? Number(b.membre) : undefined
    if (!hotel || !ville || !Number.isFinite(booking) || !Number.isFinite(halalbooking) || booking <= 0 || halalbooking <= 0 || booking > 10000 || halalbooking > 10000) {
      return NextResponse.json({ error: 'Hôtel, ville et deux prix valides requis' }, { status: 400 })
    }
    const r = getRedis()
    if (!r) return NextResponse.json({ error: 'Base indisponible' }, { status: 503 })
    await r.lpush('vh:prix:releves:pending', JSON.stringify({
      hotel, ville, booking, halalbooking, membre, devise: '€',
      date: new Date().toISOString().slice(0, 10), ip: ip.slice(0, 24),
    }))
    await r.ltrim('vh:prix:releves:pending', 0, 199)
    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }
}

// GET (admin) — liste des relevés en attente de validation
export async function GET(req: Request) {
  const token = new URL(req.url).searchParams.get('token')
  if (!process.env.ADMIN_TOKEN || token !== process.env.ADMIN_TOKEN) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }
  const r = getRedis()
  if (!r) return NextResponse.json({ error: 'Base indisponible' }, { status: 503 })
  const raw = (await r.lrange('vh:prix:releves:pending', 0, 199)) as unknown[]
  const pending = raw.map((x) => { try { return typeof x === 'string' ? JSON.parse(x) : x } catch { return null } }).filter(Boolean)
  return NextResponse.json({ pending })
}
