import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/community'

// 🗓 RÉORGANISER LE SÉJOUR — Claude réagence les journées, JAMAIS les
// prières. Le serveur réimpose les entrées « prayer » du planning reçu à
// leurs horaires d'origine après coup : même si le modèle les déplaçait,
// elles reviendraient. JSON strict, température 0, échec franc — le client
// garde ses journées types (jamais bloqué).
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface Etape { t: string; type: 'prayer' | 'visit' | 'meal'; title: string; sub?: string }

function etapeValide(e: unknown): e is Etape {
  if (!e || typeof e !== 'object') return false
  const x = e as Record<string, unknown>
  return typeof x.t === 'string' && /^\d{1,2}:\d{2}$/.test(x.t)
    && (x.type === 'prayer' || x.type === 'visit' || x.type === 'meal')
    && typeof x.title === 'string' && x.title.length > 0 && x.title.length <= 90
    && (x.sub === undefined || (typeof x.sub === 'string' && x.sub.length <= 120))
}

export async function POST(request: Request) {
  const cle = process.env.ANTHROPIC_API_KEY
  if (!cle) return NextResponse.json({ erreur: 'sans-cle' }, { status: 503 })
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon'
  if (!(await rateLimit(`sejour:${ip}`, 20, 3600))) return NextResponse.json({ erreur: 'quota' }, { status: 429 })

  let corps: { ville?: string; demande?: string; planning?: Etape[][]; lang?: string }
  try { corps = await request.json() } catch { return NextResponse.json({ erreur: 'corps' }, { status: 400 }) }
  const demande = String(corps.demande ?? '').slice(0, 200)
  const planning = corps.planning
  if (!demande || !Array.isArray(planning) || planning.length !== 3) return NextResponse.json({ erreur: 'corps' }, { status: 400 })

  const prieresParJour = planning.map((j) => (Array.isArray(j) ? j.filter((e) => e?.type === 'prayer' && etapeValide(e)) : []))

  const PROMPT = `Tu réorganises un séjour de 3 jours à ${String(corps.ville ?? '').slice(0, 60)} selon la demande du voyageur.
Règles ABSOLUES :
- Tu ne peux utiliser QUE les lieux déjà présents dans le planning fourni — jamais un lieu inventé. Tu peux les déplacer entre jours, en retirer, changer les heures des visites et repas.
- Les entrées "type":"prayer" sont FIXES : mêmes horaires, mêmes intitulés, dans chaque jour.
- Réponds UNIQUEMENT un JSON : un tableau de 3 tableaux d'étapes {"t":"HH:MM","type":"prayer|visit|meal","title":"...","sub":"..."}. Aucun texte autour.

Demande du voyageur : « ${demande} »
Planning actuel : ${JSON.stringify(planning).slice(0, 6000)}`

  try {
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: cle })
    const rep = await client.messages.create({
      model: 'claude-haiku-4-5-20251001', max_tokens: 2000, temperature: 0,
      messages: [{ role: 'user', content: PROMPT }],
    })
    const brut = (rep.content.find((c) => c.type === 'text')?.text ?? '').trim()
    const j = JSON.parse(brut.match(/\[[\s\S]*\]/)?.[0] ?? 'null') as unknown
    if (!Array.isArray(j) || j.length !== 3) return NextResponse.json({ erreur: 'sortie' }, { status: 502 })

    // Seuls les lieux DÉJÀ dans le planning ont le droit d'exister.
    const titresConnus = new Set(planning.flat().map((e) => e.title))
    const plans: Etape[][] = j.map((jour, idx) => {
      const etapes = (Array.isArray(jour) ? jour : []).filter(etapeValide)
        .filter((e) => e.type !== 'prayer' && titresConnus.has(e.title))
      // Les prières d'origine du jour sont RÉIMPOSÉES, puis tout est trié.
      return [...etapes, ...prieresParJour[idx]]
        .sort((a, b) => a.t.localeCompare(b.t))
        .slice(0, 8)
    })
    if (plans.some((p) => p.length === 0)) return NextResponse.json({ erreur: 'sortie' }, { status: 502 })
    return NextResponse.json({ plans })
  } catch {
    return NextResponse.json({ erreur: 'ia' }, { status: 502 })
  }
}
