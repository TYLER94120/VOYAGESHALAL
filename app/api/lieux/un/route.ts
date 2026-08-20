import { NextResponse } from 'next/server'
import { getRedis } from '@/lib/pushStore'
import { rateLimit } from '@/lib/community'

// 📷 ENRICHIR UN SEUL LIEU, À LA DEMANDE — pour le swipe d'Autour de moi
// (ordre du 20 août). Le moteur n'enrichit que les 3 fiches affichées ;
// les suivantes ne se paient QUE si le visiteur swipe jusqu'à elles :
// le coût suit l'usage réel. Cache Redis 24 h par lieu, champs minimaux
// (photo, note, avis, ouverture) — la clé ne sort jamais.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CHAMPS = ['id', 'rating', 'userRatingCount', 'photos', 'currentOpeningHours'].join(',')

export async function GET(request: Request) {
  const u = new URL(request.url)
  const id = u.searchParams.get('id') ?? ''
  const lang = u.searchParams.get('lang') === 'en' ? 'en' : 'fr'
  if (!/^[\w-]{5,200}$/.test(id)) return NextResponse.json({ erreur: 'id' }, { status: 400 })
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon'
  if (!(await rateLimit(`lieuxun:${ip}`, 120, 3600))) return NextResponse.json({ erreur: 'quota' }, { status: 429 })

  const r = getRedis()
  const cle = `vh:lieuxun:v1:${id}`
  if (r) {
    try {
      const cache = await r.get<Record<string, unknown>>(cle)
      if (cache) return NextResponse.json(cache)
    } catch { /* cache muet */ }
  }
  const api = process.env.GOOGLE_PLACES_KEY
  if (!api) return NextResponse.json({ erreur: 'sans-cle' }, { status: 503 })

  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), 4000)
  try {
    const rep = await fetch(`https://places.googleapis.com/v1/places/${encodeURIComponent(id)}?languageCode=${lang}`, {
      signal: ac.signal, headers: { 'X-Goog-Api-Key': api, 'X-Goog-FieldMask': CHAMPS },
    })
    if (!rep.ok) return NextResponse.json({ erreur: 'refus' }, { status: 502 })
    const p = await rep.json() as Record<string, unknown>
    const photos = (p.photos as { name?: string }[] | undefined) ?? []
    const oh = p.currentOpeningHours as { openNow?: boolean } | undefined
    const sortie = {
      photos: photos.slice(0, 1).map((ph) => `/api/lieux/photo?ref=${encodeURIComponent(ph.name ?? '')}`).filter((x) => !x.endsWith('ref=')),
      note: p.rating as number | undefined,
      nbAvis: p.userRatingCount as number | undefined,
      ouvert: oh?.openNow,
    }
    if (r) { try { await r.set(cle, sortie, { ex: 24 * 3600 }) } catch { /* pas bloquant */ } }
    return NextResponse.json(sortie)
  } catch { return NextResponse.json({ erreur: 'delai' }, { status: 504 }) } finally { clearTimeout(t) }
}
