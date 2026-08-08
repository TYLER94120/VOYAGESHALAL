import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getRedis } from '@/lib/pushStore'
import { rateLimit } from '@/lib/community'

// 👍 AVIS COMMUNAUTAIRES sur les lieux de l'annuaire.
//
// Pourquoi : nous n'avons AUCUNE note (Google Places non active). Plutot
// que d'inventer une notation ou d'en presenter une fausse, on construit
// la notre : un tap = « j'ai aime ». C'est peu, mais c'est vrai, et ca
// nous appartient. Un lieu sans avis est affiche sans note, jamais avec
// une note supposee.
//
// Cles Redis : vh:avis:<id>  -> set des votants (IP ou compte)
// Identifiant d'un lieu : a_<lat 5 dec>_<lng 5 dec> (stable, sans compte).
export const dynamic = 'force-dynamic'

const ID_RE = /^a_-?\d+\.\d{1,6}_-?\d+\.\d{1,6}$/

export async function GET(req: NextRequest) {
  const r = getRedis()
  const ids = (req.nextUrl.searchParams.get('ids') ?? '').split(',').filter((i) => ID_RE.test(i)).slice(0, 20)
  if (!r || !ids.length) return NextResponse.json({ avis: {} })
  const counts: Record<string, number> = {}
  await Promise.all(ids.map(async (id) => {
    try { counts[id] = Number(await r.scard(`vh:avis:${id}`)) || 0 } catch { counts[id] = 0 }
  }))
  return NextResponse.json({ avis: counts })
}

export async function POST(req: NextRequest) {
  try {
    const r = getRedis()
    if (!r) return NextResponse.json({ error: 'Base indisponible' }, { status: 503 })
    const ip = (req.headers.get('x-forwarded-for') ?? 'anon').split(',')[0].trim()
    if (!(await rateLimit(`avis:${ip}`, 40, 3600))) {
      return NextResponse.json({ error: 'Doucement 🙂' }, { status: 429 })
    }
    const { id, nom } = await req.json()
    if (!ID_RE.test(String(id ?? ''))) return NextResponse.json({ error: 'Lieu invalide' }, { status: 400 })
    const added = await r.sadd(`vh:avis:${id}`, ip)
    const n = Number(await r.scard(`vh:avis:${id}`)) || 0
    // Memorise le nom pour la moderation eventuelle (jamais affiche tel quel)
    if (added && nom) { try { await r.set(`vh:avis:nom:${id}`, String(nom).slice(0, 120)) } catch {} }
    return NextResponse.json({ ok: true, deja: !added, avis: n })
  } catch {
    return NextResponse.json({ error: 'Requête invalide' }, { status: 400 })
  }
}
