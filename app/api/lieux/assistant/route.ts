import { NextResponse } from 'next/server'

// 🌙 RELAIS VERS LA PORTE IA DE LA FAMILLE — POST /api/lieux/assistant
//
// Le widget « manger halal près de moi » fait rédiger sa réponse par
// https://halalgpt.fr/api/assistant. On passe par NOTRE serveur plutôt que
// d'appeler la porte depuis le navigateur : pas de question de CORS, pas
// de surprise selon le téléphone, et un délai maximum tenu ICI.
//
// La porte refuse d'affirmer un fait local hors du `contexte` fourni —
// la qualité de la réponse EST donc la qualité des résultats de
// /api/lieux, qui portent chacun leur phrase d'honnêteté.
//
// CONDITIONS DÉGRADÉES : la porte muette ou lente n'affiche JAMAIS un
// écran cassé — le widget garde sa liste de lieux et vit sans prose.

export const runtime = 'nodejs'
export const maxDuration = 60

const PORTE = 'https://halalgpt.fr/api/assistant'
/** Premier octet attendu sous 12 s, sinon on rend la main au widget. */
const DELAI_PREMIER_OCTET = 12_000

export async function POST(req: Request) {
  let corps: { question?: string; contexte?: string[]; site?: string }
  try { corps = await req.json() } catch { return NextResponse.json({ erreur: 'corps invalide' }, { status: 400 }) }
  const question = String(corps.question ?? '').slice(0, 600)
  // Le contexte porte désormais les AVIS et les ATTRIBUTS des trois lieux :
  // c'est la matière de ce que l'IA doit écrire (§3 de l'ordre du 15 août).
  // Plus long, donc, mais toujours borné — et toujours factuel : la porte
  // refuse d'affirmer un fait local absent d'ici.
  const contexte = Array.isArray(corps.contexte) ? corps.contexte.slice(0, 12).map((c) => String(c).slice(0, 1400)) : []
  if (!question) return NextResponse.json({ erreur: 'question vide' }, { status: 400 })

  const ac = new AbortController()
  const minuteur = setTimeout(() => ac.abort(), DELAI_PREMIER_OCTET)
  let reponse: Response
  try {
    reponse = await fetch(PORTE, {
      method: 'POST',
      signal: ac.signal,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        site: corps.site === 'gohalaltravel' ? 'gohalaltravel' : 'voyageshalal',
        question,
        contexte,
      }),
    })
  } catch {
    clearTimeout(minuteur)
    return NextResponse.json({ erreur: 'porte muette' }, { status: 503 })
  }
  clearTimeout(minuteur)
  if (!reponse.ok || !reponse.body) {
    return NextResponse.json({ erreur: 'porte muette' }, { status: 503 })
  }

  // On relaie le flux tel quel : le widget l'affiche mot à mot.
  return new Response(reponse.body, {
    headers: {
      'Content-Type': reponse.headers.get('Content-Type') ?? 'text/plain; charset=utf-8',
      'Cache-Control': 'no-store',
    },
  })
}
