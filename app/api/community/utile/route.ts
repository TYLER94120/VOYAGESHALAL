import { NextResponse } from 'next/server'
import { reactUtile, rateLimit } from '@/lib/community'

// POST /api/community/utile — réaction légère « 🤲 utile / merci » (1 tap,
// sans compte, dédupliquée par IP).
export async function POST(req: Request) {
  try {
    const ip = (req.headers.get('x-forwarded-for') ?? 'anon').split(',')[0].trim()
    if (!(await rateLimit(`utile:${ip}`, 60, 3600))) {
      return NextResponse.json({ error: 'Doucement 🙂' }, { status: 429 })
    }
    const { spotId } = await req.json()
    if (!spotId) return NextResponse.json({ error: 'spotId requis' }, { status: 400 })
    const res = await reactUtile(String(spotId), ip)
    if (!res.ok) return NextResponse.json({ error: 'Spot introuvable' }, { status: 404 })
    return NextResponse.json(res)
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }
}
