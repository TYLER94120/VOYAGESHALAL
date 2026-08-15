import { NextResponse } from 'next/server'
import { getRedis } from '@/lib/pushStore'
import { checkAdmin } from '@/lib/adminAuth'

// 🧹 POST /api/admin/purge-lieux?token=… → EFFACE LE CACHE DES RECHERCHES.
//
// Ordre de Mohamed, 15 août : « VIDE LE CACHE des recherches de lieux
// maintenant. Purge complète. »
//
// La version du moteur (`VERSION_MOTEUR` dans /api/lieux) rend déjà les
// anciennes entrées inatteignables dès qu'elle change : c'est la vraie
// protection, celle qui agit toute seule et qu'on ne peut pas oublier.
// Cette route est le complément manuel, pour les cas où l'on veut aussi
// LIBÉRER la place — ou forcer un nouvel appel Google sans changer de
// version (par exemple après une correction de données côté Google).
//
// ⚠️ ELLE COÛTE DE L'ARGENT. Vider le cache, c'est refaire payer chaque
// recherche à Mohamed au prochain visiteur. On ne l'appelle donc pas
// « pour voir » : protégée par ADMIN_TOKEN, en POST (jamais en GET, qu'un
// aspirateur de liens pourrait déclencher), et elle DIT combien de clés
// elle a supprimées.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const redis = getRedis()
  if (!redis) return NextResponse.json({ erreur: 'Base non configurée — rien à purger.' })

  // `scan` par lots plutôt que `keys` : sur une base chargée, `keys` bloque
  // le serveur le temps du balayage.
  let curseur = '0'
  let supprimees = 0
  const MAX_TOURS = 200 // garde-fou : on ne tourne pas indéfiniment
  try {
    for (let tour = 0; tour < MAX_TOURS; tour++) {
      const [suivant, lot] = await redis.scan(curseur, { match: 'surmesure:cache:*', count: 200 }) as [string, string[]]
      if (lot.length) { await redis.del(...lot); supprimees += lot.length }
      curseur = String(suivant)
      if (curseur === '0') break
    }
  } catch (e) {
    return NextResponse.json({ erreur: String(e).slice(0, 160), supprimees }, { status: 200 })
  }
  return NextResponse.json({
    supprimees,
    note: 'Les prochaines recherches repaieront un appel Google. La version du moteur suffit normalement à invalider les anciennes réponses.',
  })
}
