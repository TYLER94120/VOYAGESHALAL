import { NextResponse } from 'next/server'
import { leaveSalam, getUserByToken, tokenFromRequest, rateLimit } from '@/lib/community'

// POST /api/community/salam — un 👋 de passage sur un spot (1 tap, sans texte,
// sans compte requis — signé du pseudo si connecté).
export async function POST(req: Request) {
  try {
    const ip = (req.headers.get('x-forwarded-for') ?? 'anon').split(',')[0].trim()
    if (!(await rateLimit(`salam:${ip}`, 30, 3600))) return NextResponse.json({ error: 'Doucement 🙂' }, { status: 429 })
    const { spotId } = await req.json()
    if (!spotId) return NextResponse.json({ error: 'spotId requis' }, { status: 400 })
    const user = await getUserByToken(tokenFromRequest(req))
    const res = await leaveSalam(String(spotId), user?.pseudo ?? 'Un voyageur', user?.id ?? ip)
    if (!res.ok) return NextResponse.json({ error: 'Spot introuvable' }, { status: 404 })
    return NextResponse.json(res)
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }
}
