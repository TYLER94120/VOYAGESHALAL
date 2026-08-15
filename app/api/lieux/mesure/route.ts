import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

// 📊 LE COMPTEUR DU SUR MESURE — POST /api/lieux/mesure { cle }
//
// §7 de l'ordre du 15 août : « Le sur mesure se juge à UN chiffre :
// combien appuient sur "Itinéraire". » Les recherches, les demandes
// écrites et les résultats vides sont comptés dans /api/lieux ; ce qui se
// passe DANS le navigateur (un itinéraire lancé, une fiche ouverte) ne
// peut être compté que d'ici.
//
// Liste blanche stricte : on n'incrémente que des clés connues. Sans
// elle, n'importe qui pourrait créer des millions de clés dans Redis.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// La mesure de l'aide au choix (16 août) : « c'est ce qui nous dira ce
// que les gens viennent VRAIMENT chercher — et donc ce qu'il faudra
// développer ensuite ».
const AUTORISEES = new Set([
  'itineraires', 'appels', 'fiches-ouvertes', 'relances-sautees',
  'cat-mosquee', 'cat-manger', 'cat-activite',
  'piste', 'choisis-pour-moi', 'profil-cree',
  // 🗺️ La barre unique (16 août) : quand la phrase désigne une ville ET un
  // besoin, laquelle des deux lectures le visiteur choisit-il ? C'est ce
  // qui dira si l'aiguillage automatique devine juste. Ces deux clés
  // étaient appelées par le composant SANS être ici : elles renvoyaient
  // 400 et ne comptaient rien. Une mesure qu'on croit avoir est pire que
  // pas de mesure du tout.
  'barre-ville', 'barre-autour',
])

let redis: Redis | null | undefined
function getRedis(): Redis | null {
  if (redis !== undefined) return redis
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  redis = url && token ? new Redis({ url, token }) : null
  return redis
}

export async function POST(req: Request) {
  let cle = ''
  try { cle = String(((await req.json()) as { cle?: string }).cle ?? '') } catch { /* corps vide */ }
  if (!AUTORISEES.has(cle)) return NextResponse.json({ ok: false }, { status: 400 })
  const r = getRedis()
  // Compter ne doit jamais faire échouer un geste du visiteur.
  if (r) { try { await r.incr(`surmesure:${cle}`) } catch { /* silencieux */ } }
  return NextResponse.json({ ok: true })
}
