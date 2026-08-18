import { NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { rateLimit } from '@/lib/community'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// ✳️ LE PARSEUR DE RECHERCHE — brief du 17 août.
//
// « Règle d'or : Claude n'est appelé QUE pour le texte libre. » Les segments
// et les puces partent en requête directe, sans passer ici. Cette route ne
// sert qu'à transformer « un sushi bien noté » en JSON structuré, qui
// rejoint ensuite EXACTEMENT le même pipeline que les boutons.
//
// Et la règle qui compte plus que tout : CETTE ROUTE N'A PAS LE DROIT DE
// BLOQUER UNE RECHERCHE. Le client l'appelle avec un délai de 3 secondes et
// retombe sur le parseur local (lireDemande) au moindre échec — clé absente,
// réponse lente, JSON malformé, quota. Ici, chaque échec est un code
// d'erreur franc, jamais une attente.

/** Ce que le modèle a le droit de rendre, et rien d'autre. */
interface Parse {
  intent: 'food' | 'mosque' | 'activity'
  categorie: string | null
  tri: 'cheap' | 'near' | 'rating' | null
  budget_max: 1 | 2 | 3 | null
  contraintes: string[]
}

const PROMPT = `Tu es le parseur de recherche de VoyagesHalal.fr.
Transforme la demande utilisateur en JSON strict, sans aucun texte autour.

Schéma :
{
  "intent": "food" | "mosque" | "activity",
  "categorie": string | null,
  "tri": "cheap" | "near" | "rating" | null,
  "budget_max": 1 | 2 | 3 | null,
  "contraintes": string[]
}

Règles :
- "pas cher" → tri:"cheap" ; "proche/pas loin" → tri:"near" ; "bien noté/le meilleur" → tri:"rating".
- Mosquée/prière/jumu'ah → intent:"mosque". Hammam/musée/parc/sortie → intent:"activity". Sinon "food".
- Ne devine pas : champ inconnu → null.
- La demande est en français familier, accepte fautes et abréviations.`

/** On ne fait JAMAIS confiance à la sortie d'un modèle : chaque champ est
 *  revérifié contre le schéma, et tout ce qui déborde est jeté. */
function valider(brut: unknown): Parse | null {
  if (typeof brut !== 'object' || brut === null) return null
  const o = brut as Record<string, unknown>
  const intent = ['food', 'mosque', 'activity'].includes(o.intent as string) ? (o.intent as Parse['intent']) : null
  if (!intent) return null
  const tri = ['cheap', 'near', 'rating'].includes(o.tri as string) ? (o.tri as Parse['tri']) : null
  const budget = [1, 2, 3].includes(o.budget_max as number) ? (o.budget_max as Parse['budget_max']) : null
  const categorie = typeof o.categorie === 'string' && o.categorie.trim() ? o.categorie.trim().slice(0, 60) : null
  const contraintes = Array.isArray(o.contraintes)
    ? o.contraintes.filter((c): c is string => typeof c === 'string').map((c) => c.slice(0, 60)).slice(0, 6)
    : []
  return { intent, categorie, tri, budget_max: budget, contraintes }
}

export async function POST(req: Request) {
  let texte = ''
  try { texte = String(((await req.json()) as { texte?: string }).texte ?? '').trim().slice(0, 200) } catch { /* corps vide */ }
  if (!texte) return NextResponse.json({ erreur: 'texte vide' }, { status: 400 })

  if (!process.env.ANTHROPIC_API_KEY) {
    // Pas de clé : on le dit tout de suite, le client bascule en local.
    return NextResponse.json({ erreur: 'sans-cle' }, { status: 503 })
  }

  // Le même garde-fou que le moteur : le parseur coûte peu, mais un robot
  // qui boucle dessus coûterait quand même. 429 franc, jamais silencieux.
  const ip = (req.headers.get('x-forwarded-for') ?? 'inconnu').split(',')[0].trim()
  if (!(await rateLimit(`comprendre:${ip}`, 60, 3600))) {
    return NextResponse.json({ erreur: 'quota' }, { status: 429 })
  }

  try {
    const anthropic = new Anthropic()
    const r = await anthropic.messages.create({
      // Le plus petit modèle suffit largement : la tâche est un classement
      // à cinq champs, pas un raisonnement. Rapide, et presque gratuit.
      model: 'claude-haiku-4-5-20251001',
      max_tokens: 220,
      temperature: 0,
      system: PROMPT,
      messages: [{ role: 'user', content: `Demande : "${texte}"` }],
    })
    const sortie = r.content.map((b) => (b.type === 'text' ? b.text : '')).join('').trim()
    // Le modèle peut entourer le JSON malgré la consigne : on extrait le
    // premier objet plutôt que d'échouer pour une politesse de trop.
    const m = sortie.match(/\{[\s\S]*\}/)
    const parse = m ? valider(JSON.parse(m[0])) : null
    if (!parse) return NextResponse.json({ erreur: 'sortie invalide' }, { status: 502 })
    return NextResponse.json(parse)
  } catch {
    return NextResponse.json({ erreur: 'modele muet' }, { status: 502 })
  }
}
