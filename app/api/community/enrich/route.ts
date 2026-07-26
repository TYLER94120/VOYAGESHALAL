import { NextResponse } from 'next/server'
import { enrichSpot, getUserByToken, tokenFromRequest, rateLimit } from '@/lib/community'

// POST /api/community/enrich — enrichissement collectif d'un spot.
// Connecté = signé du pseudo ; sinon « Un voyageur » (zéro friction).
export async function POST(req: Request) {
  try {
    const ip = (req.headers.get('x-forwarded-for') ?? 'anon').split(',')[0].trim()
    if (!(await rateLimit(`enrich:${ip}`, 20, 3600))) {
      return NextResponse.json({ error: 'Trop de contributions, réessaie dans une heure.' }, { status: 429 })
    }
    const body = await req.json()
    const spotId = String(body.spotId ?? '')
    if (!spotId) return NextResponse.json({ error: 'spotId requis' }, { status: 400 })
    const user = await getUserByToken(tokenFromRequest(req))
    const spot = await enrichSpot(spotId, user?.pseudo ?? 'Un voyageur', {
      photo: body.photo, video: body.video, videoTexte: body.videoTexte, videoDebut: body.videoDebut, videoFin: body.videoFin,
      astuce: body.astuce, infos: body.infos, tags: body.tags,
    })
    if (!spot) return NextResponse.json({ error: 'Spot introuvable' }, { status: 404 })
    return NextResponse.json({ ok: true, spot })
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }
}
