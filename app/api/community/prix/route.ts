import { NextResponse } from 'next/server'
import { votePrix, getUserByToken, tokenFromRequest, rateLimit } from '@/lib/community'

// POST /api/community/prix — « L'addition, s'il te plaît » : 1 tap = le prix
// par personne réellement payé (bucket), sans compte, dédupliqué par visiteur.
export async function POST(req: Request) {
  try {
    const ip = (req.headers.get('x-forwarded-for') ?? 'anon').split(',')[0].trim()
    if (!(await rateLimit(`prix:${ip}`, 20, 3600))) return NextResponse.json({ error: 'Doucement 🙂' }, { status: 429 })
    const { spotId, bucket } = await req.json()
    if (!spotId || !bucket) return NextResponse.json({ error: 'spotId et bucket requis' }, { status: 400 })
    const user = await getUserByToken(tokenFromRequest(req))
    const res = await votePrix(String(spotId), String(bucket), user?.id ?? ip)
    if (!res.ok) return NextResponse.json({ error: 'Spot ou fourchette invalide' }, { status: 400 })
    return NextResponse.json(res)
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }
}
