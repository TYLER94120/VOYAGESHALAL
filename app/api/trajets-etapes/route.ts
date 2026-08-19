import { NextResponse } from 'next/server'
import { ajouterMinutes } from '@/lib/trajets'
import { getRedis } from '@/lib/pushStore'
import { rateLimit } from '@/lib/community'

// 🚶 TEMPS RÉELS ENTRE LES ÉTAPES DU PLANNING (itération 7, règle 4).
// Le MÊME service partagé que partout (lib/trajets : Google Routes →
// OSRM → rien) — jamais un temps estimé. Chaque paire origine→dest rend
// {marcheMin?, voitureMin?} ; une paire sans réponse rend {} et le
// planning n'affiche rien entre ces deux étapes.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface P { lat: number; lng: number }
const ok = (p: unknown): p is P => !!p && typeof (p as P).lat === 'number' && typeof (p as P).lng === 'number'
  && Math.abs((p as P).lat) <= 90 && Math.abs((p as P).lng) <= 180

export async function POST(request: Request) {
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon'
  if (!(await rateLimit(`trajetsetapes:${ip}`, 60, 3600))) return NextResponse.json({ erreur: 'quota' }, { status: 429 })

  let corps: { paires?: { a?: P; b?: P }[] }
  try { corps = await request.json() } catch { return NextResponse.json({ erreur: 'corps' }, { status: 400 }) }
  const paires = (corps.paires ?? []).filter((p) => ok(p?.a) && ok(p?.b)).slice(0, 8)
  if (!paires.length) return NextResponse.json({ erreur: 'corps' }, { status: 400 })

  const r = getRedis()
  const temps = await Promise.all(paires.map(async ({ a, b }) => {
    const f: { lat: number; lng: number; marcheMin?: number; voitureMin?: number } = { lat: b!.lat, lng: b!.lng }
    try { await ajouterMinutes([f], { lat: a!.lat, lng: a!.lng }, r) } catch (e) {
      console.error('[trajets-etapes] échec :', e instanceof Error ? e.message : e)
    }
    return { marcheMin: f.marcheMin, voitureMin: f.voitureMin }
  }))
  return NextResponse.json({ temps })
}
