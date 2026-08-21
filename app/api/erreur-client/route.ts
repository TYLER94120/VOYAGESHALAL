import { NextResponse } from 'next/server'
import { getRedis } from '@/lib/pushStore'

// 🔎 CE QUI A CASSÉ, ÉCRIT QUELQUE PART.
//
// « Quand je clique sushi j'ai cet écran » — et l'écran était blanc. Je
// n'avais aucun moyen de savoir ce qui s'était passé sur SON téléphone :
// pas de journal, pas de trace, et le défaut ne se reproduisait pas dans
// l'atelier. On corrige au jugé, ou on ne corrige pas.
//
// Cette route reçoit ce que la limite d'erreur (app/error.tsx) a vu :
// le message, l'empreinte, le chemin, les premières lignes de la pile.
// Elle les écrit dans les journaux du serveur et garde les vingt derniers
// dans Redis, lisibles par /api/admin/erreurs.
//
// CE QU'ELLE NE FAIT PAS : aucune position, aucun identifiant, aucun
// contenu de recherche. Un défaut se diagnostique avec une pile d'appels,
// pas avec la vie privée de quelqu'un.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CLE = 'vh:erreurs:client'
const MAX = 20

export async function POST(req: Request) {
  let corps: Record<string, unknown> = {}
  try { corps = await req.json() } catch { return NextResponse.json({ ok: false }, { status: 400 }) }

  const entree = {
    quand: new Date().toISOString(),
    message: String(corps.message ?? '').slice(0, 300),
    digest: corps.digest ? String(corps.digest).slice(0, 60) : null,
    chemin: String(corps.chemin ?? '').slice(0, 200),
    pile: String(corps.pile ?? '').slice(0, 600),
    // L'appareil aide à distinguer un défaut de Safari d'un défaut général.
    agent: (req.headers.get('user-agent') ?? '').slice(0, 160),
  }

  // Dans les journaux du serveur : visible immédiatement, sans dépendance.
  console.error('[erreur-client]', JSON.stringify(entree))

  const r = getRedis()
  if (r) {
    try {
      await r.lpush(CLE, JSON.stringify(entree))
      await r.ltrim(CLE, 0, MAX - 1)
    } catch { /* le journal serveur suffit */ }
  }
  return NextResponse.json({ ok: true })
}
