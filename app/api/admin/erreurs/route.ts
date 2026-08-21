import { NextResponse } from 'next/server'
import { getRedis } from '@/lib/pushStore'
import { checkAdmin } from '@/lib/adminAuth'

// 📋 GET /api/admin/erreurs?token=… — les vingt derniers écrans cassés.
//
// Le pendant de /api/erreur-client : ce qui a été enregistré doit pouvoir
// être LU, sinon autant ne rien enregistrer. Mohamed ouvre l'adresse, colle
// la réponse, et le défaut se corrige sur des faits.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const r = getRedis()
  if (!r) return NextResponse.json({ erreurs: [], note: 'Redis absent : voir les journaux du serveur.' })
  try {
    const brut = await r.lrange<string>('vh:erreurs:client', 0, 19)
    const erreurs = (brut ?? []).map((x) => { try { return typeof x === 'string' ? JSON.parse(x) : x } catch { return x } })
    return NextResponse.json({ erreurs, lu: new Date().toISOString() })
  } catch (e) {
    return NextResponse.json({ erreur: String(e).slice(0, 160) }, { status: 500 })
  }
}
