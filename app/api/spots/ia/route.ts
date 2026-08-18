import { NextRequest, NextResponse } from 'next/server'
import { getSpotById, updateSpot } from '@/lib/prayerSpots'
import { rateLimit } from '@/lib/community'

// 🔎 L'EXTRACTION IA D'UN SPOT — « Claude a lu le menu : tacos ~7 € ».
//
// RÈGLE ABSOLUE, la même que partout : rien d'inventé. Le modèle ne peut
// écrire que ce qu'il LIT sur une photo du spot (un menu, une ardoise, un
// panneau de prix). S'il ne lit rien de tel, il répond RIEN et la ligne
// n'existe pas. Jamais d'estimation, jamais de « probablement ».
//
// Appelée en arrière-plan après un ajout de photo, en fire-and-forget :
// un échec (pas de clé, quota, photo floue) est silencieux et ne bloque
// jamais la publication. La ligne apparaît au prochain passage, ou jamais.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const PROMPT = `Tu regardes la photo d'un lieu partagé par un voyageur (resto, boucherie, coin prière…).
Si la photo montre un MENU, une ardoise ou des PRIX LISIBLES : réponds une seule ligne courte en français qui cite 1 à 3 prix réellement lisibles, format « tacos ~7 €, grillades 9–13 € ». Maximum 80 caractères.
Si aucun prix n'est lisible sur la photo : réponds exactement RIEN.
Interdits : estimer, arrondir ce que tu ne lis pas, déduire du décor, mentionner le halal (tu ne peux pas le vérifier sur une photo).`

export async function POST(request: NextRequest) {
  const cle = process.env.ANTHROPIC_API_KEY
  if (!cle) return NextResponse.json({ ok: false, raison: 'sans-cle' }, { status: 503 })
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon'
  if (!(await rateLimit(`spotia:${ip}`, 20, 3600))) return NextResponse.json({ ok: false, raison: 'quota' }, { status: 429 })

  let body: { spotId?: string }
  try { body = await request.json() } catch { return NextResponse.json({ ok: false }, { status: 400 }) }
  const spot = body.spotId ? await getSpotById(String(body.spotId)) : null
  if (!spot || spot.status !== 'published') return NextResponse.json({ ok: false }, { status: 404 })
  if (spot.ia) return NextResponse.json({ ok: true, ia: spot.ia }) // déjà lu : on ne relit pas

  const photo = spot.photos?.[0] ?? spot.photo
  if (!photo) return NextResponse.json({ ok: false, raison: 'sans-photo' }, { status: 400 })

  // data-URL compressée côté client, ou URL https — les deux formes du dépôt.
  const m = photo.match(/^data:(image\/[a-z0-9.+-]+);base64,(.+)$/)
  const source = m
    ? { type: 'base64' as const, media_type: m[1] as 'image/jpeg', data: m[2] }
    : /^https:\/\//.test(photo) ? { type: 'url' as const, url: photo } : null
  if (!source) return NextResponse.json({ ok: false, raison: 'photo-illisible' }, { status: 400 })

  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: cle })
    const rep = await client.messages.create({
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 100,
      temperature: 0,
      messages: [{ role: 'user', content: [{ type: 'image', source }, { type: 'text', text: PROMPT }] }],
    })
    const texte = (rep.content.find((c) => c.type === 'text')?.text ?? '').trim()
    // La validation refait le travail du prompt : une ligne de prix contient
    // un chiffre ET un €. « RIEN », une phrase bavarde ou une ligne trop
    // longue ne sont jamais enregistrés.
    if (!texte || /^RIEN\b/i.test(texte) || texte.length > 90 || !/\d/.test(texte) || !texte.includes('€')) {
      return NextResponse.json({ ok: true, ia: null })
    }
    const ia = { texte, date: new Date().toISOString() }
    await updateSpot(spot.id, { ia })
    return NextResponse.json({ ok: true, ia })
  } catch {
    return NextResponse.json({ ok: false, raison: 'ia-indisponible' }, { status: 502 })
  }
}
