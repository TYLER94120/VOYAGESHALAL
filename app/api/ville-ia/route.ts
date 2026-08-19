import { NextResponse } from 'next/server'
import { after } from 'next/server'
import { readFileSync } from 'fs'
import path from 'path'
import { getRedis } from '@/lib/pushStore'
import { estLatinLisible } from '@/lib/latin.mjs'
import { conforme } from '@/lib/conformite'
import { compteurVille } from '@/lib/mosqueesOsm'

// 🧠 LE CONTENU IA DE LA PAGE VILLE — côté serveur, en cache par ville
// (itération 7). Trois familles de champs, avec leur provenance :
//
//   base_vh  : les COMPTEURS (restos, mosquées) et la monnaie — comptés
//              ici même depuis data/villes, jamais écrits par l'IA.
//   ia_cache : les qualificatifs des 3 faits, le conseil quartier, la
//              stratégie manger, la grille À savoir, les romanisations —
//              générés UNE fois par Haiku puis Redis 30 jours. Sans clé
//              API : ces champs sont ABSENTS (jamais improvisés côté
//              serveur ni côté client).
//
// Le serveur ASSEMBLE les faits : le chiffre vient du compteur réel, l'IA
// n'écrit que la nuance. « certifié » est interdit et filtré.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface Sortie {
  faits: { avant: string; nuance?: string; ton: 'vert' | 'orange' }[]
  /** L'accroche du World feed (≤ 12 mots, ia_cache) — jamais un chiffre
   *  hors compteurs fournis. */
  accroche?: string
  quartier?: string
  strategie?: string
  savoir?: { monnaie?: string; transport?: string; piege?: string; mots?: string }
  noms?: Record<string, string>
  sources: Record<string, string>
}

const CLE = (slug: string, lang: string) => `vh:villeia:v1:${lang}:${slug}`
const INTERDITS = /certifi/i

function lireVille(slug: string): Record<string, unknown> | null {
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) return null
  try { return JSON.parse(readFileSync(path.join(process.cwd(), 'data', 'villes', `${slug}.json`), 'utf8')) } catch { return null }
}

export async function GET(request: Request) {
  const u = new URL(request.url)
  const slug = u.searchParams.get('slug') ?? ''
  const lang = u.searchParams.get('lang') === 'en' ? 'en' : 'fr'
  const v = lireVille(slug)
  if (!v) return NextResponse.json({ erreur: 'ville' }, { status: 404 })
  const en = lang === 'en'

  // ── Les compteurs RÉELS (base_vh) — la seule source des chiffres. ──
  const restos = ((v.restaurants as { nom?: string; type?: string; halalConfidence?: string }[]) ?? [])
    .filter((r) => conforme(r.nom, r.type, r.halalConfidence))
  const nbRestos = restos.length
  // 🕌 Le compteur OSM d'abord (chantier du 17 août) : « X lieux de prière
  // dans tout Tokyo » — la vue d'ensemble que Google ne vend pas. La base
  // locale (ODbL, crédit affiché par la page) couvre pays par pays ; sans
  // elle, le compte de nos mosquées relevées reste la source.
  const nbOsm = compteurVille(slug)
  const nbMosquees = nbOsm ?? ((v.mosqueesPrincipales as unknown[]) ?? []).length
  const ip = (v.infos_pratiques as Record<string, string>) ?? {}

  const faitManger = nbRestos > 0
    ? { avant: en ? `Halal food: ${nbRestos} listed places` : `Manger halal : ${nbRestos} adresses relevées`, ton: (nbRestos >= 30 ? 'vert' : 'orange') as 'vert' | 'orange' }
    : null
  // « lieu de prière » quand le compte vient d'OSM : salles de prière et
  // mausolées y sont mélangés aux mosquées — on ne promet pas plus.
  const faitPrier = nbMosquees > 0
    ? {
        avant: nbOsm != null
          ? (en ? `Praying: ${nbMosquees} prayer places across the city` : `Prier : ${nbMosquees} lieux de prière dans toute la ville`)
          : (en ? `Praying: ${nbMosquees} listed mosques` : `Prier : ${nbMosquees} mosquées relevées`),
        ton: (nbMosquees >= 5 ? 'vert' : 'orange') as 'vert' | 'orange',
      }
    : null
  const faitAlcool = ip.alcool
    ? { avant: en ? `Alcohol: ${ip.alcool.toLowerCase()}` : `Alcool : ${ip.alcool.toLowerCase()}`, ton: (/rare|interdit|banned|rare/i.test(ip.alcool) ? 'vert' : 'orange') as 'vert' | 'orange' }
    : null
  const base: Sortie = {
    faits: [faitManger, faitPrier, faitAlcool].filter((f): f is NonNullable<typeof f> => !!f),
    savoir: {
      ...(ip.monnaie ? { monnaie: ip.monnaie } : {}),
      ...((v.infoPratique as { transport?: string })?.transport ? { transport: (v.infoPratique as { transport: string }).transport } : {}),
    },
    sources: { faits: nbOsm != null ? 'base_vh+osm' : 'base_vh', compteurs: nbOsm != null ? 'base_vh+osm' : 'base_vh', monnaie: 'base_vh', transport: 'base_vh' },
  }

  const r = getRedis()
  if (r) {
    try {
      const cache = await r.get<Sortie>(CLE(slug, lang))
      if (cache && typeof cache === 'object') return NextResponse.json(cache)
    } catch { /* cache muet : on continue */ }
  }

  const cle = process.env.ANTHROPIC_API_KEY
  if (!cle || !r) return NextResponse.json(base) // sans IA : compteurs seuls, rien d'improvisé

  // ── Génération UNE fois, en arrière-plan — on sert la base tout de suite. ──
  after(async () => {
    try {
      const nonLatins = [
        ...((v.activites as { nom?: string }[]) ?? []),
        ...((v.mosqueesPrincipales as { nom?: string }[]) ?? []),
        ...restos,
      ].map((x) => x.nom).filter((n): n is string => !!n && !estLatinLisible(n)).slice(0, 25)

      const PROMPT = `Ville : ${v.nom} (${v.pays}). Données réelles : ${nbRestos} adresses halal relevées, ${nbMosquees} mosquées relevées, alcool : ${ip.alcool ?? 'inconnu'}.
Réponds UNIQUEMENT un JSON ${en ? 'en anglais' : 'en français'} :
{"accroche":"...","nuances":{"manger":"...","prier":"...","alcool":"..."},"quartier":"...","strategie":"...","savoir":{"monnaie":"...","transport":"...","piege":"...","mots":"..."},"noms":{${nonLatins.length ? '"nom local":"Romanisation"' : ''}}}
Règles ABSOLUES :
- accroche : le rêve de ${v.nom} en ≤ 12 mots, concret et donnant envie (ex. « Deux continents, le halal sans réfléchir ») — JAMAIS un chiffre autre que ceux fournis.
- nuances : ≤ 8 mots chacune, un complément concret au compteur (ex. « concentrées par quartiers », « salles dans les grands magasins ») — JAMAIS un chiffre autre que ceux fournis ci-dessus.
- quartier : « Le bon quartier : NOM — pourquoi (mosquée, restos, calme) », ≤ 18 mots, un quartier réel et connu de ${v.nom}.
- strategie : où viser pour manger halal à ${v.nom}, ≤ 18 mots, quartiers réels.
- savoir.monnaie : nom de la monnaie + taux approximatif en euros. savoir.transport : LE conseil clé. savoir.piege : le piège halal local (ex. mirin, saindoux, bouillons). savoir.mots : 2 phrases phonétiques utiles.
- noms : pour CHAQUE nom listé ici ${JSON.stringify(nonLatins)}, sa romanisation ou traduction française usuelle « Nom lisible » ; si tu ne le connais pas avec certitude, OMETS-le.
- Jamais le mot « certifié ». Si tu n'es pas sûr d'un champ, omets-le.`
      const { default: Anthropic } = await import('@anthropic-ai/sdk')
      const client = new Anthropic({ apiKey: cle })
      const rep = await client.messages.create({ model: 'claude-haiku-4-5-20251001', max_tokens: 1400, temperature: 0, messages: [{ role: 'user', content: PROMPT }] })
      const brut = (rep.content.find((c) => c.type === 'text')?.text ?? '').trim()
      const j = JSON.parse(brut.match(/\{[\s\S]*\}/)?.[0] ?? 'null') as {
        accroche?: string; nuances?: Record<string, string>; quartier?: string; strategie?: string
        savoir?: Record<string, string>; noms?: Record<string, string>
      } | null
      if (!j) return
      const prop = (s?: string) => (typeof s === 'string' && s.trim() && !INTERDITS.test(s) ? s.trim() : undefined)
      const enrichi: Sortie = {
        faits: base.faits.map((f) => {
          const th = /halal food|manger/i.test(f.avant) ? 'manger' : /pray|prier/i.test(f.avant) ? 'prier' : 'alcool'
          return { ...f, nuance: prop(j.nuances?.[th]) }
        }),
        accroche: prop(j.accroche),
        quartier: prop(j.quartier),
        strategie: prop(j.strategie),
        savoir: {
          ...base.savoir,
          ...(prop(j.savoir?.monnaie) ? { monnaie: prop(j.savoir?.monnaie) } : {}),
          ...(prop(j.savoir?.transport) ? { transport: prop(j.savoir?.transport) } : {}),
          ...(prop(j.savoir?.piege) ? { piege: prop(j.savoir?.piege) } : {}),
          ...(prop(j.savoir?.mots) ? { mots: prop(j.savoir?.mots) } : {}),
        },
        noms: Object.fromEntries(Object.entries(j.noms ?? {}).filter(([k, val]) => typeof val === 'string' && estLatinLisible(val) && k !== val).slice(0, 25)),
        sources: { compteurs: 'base_vh', faits: 'base_vh+ia_cache', quartier: 'ia_cache', strategie: 'ia_cache', savoir: 'base_vh+ia_cache', noms: 'ia_cache' },
      }
      await r.set(CLE(slug, lang), enrichi, { ex: 30 * 24 * 3600 })
    } catch (e) {
      console.error('[ville-ia] génération échouée :', e instanceof Error ? e.message : e)
    }
  })
  return NextResponse.json(base)
}
