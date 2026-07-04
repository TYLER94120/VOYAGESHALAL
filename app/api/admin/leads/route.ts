import { NextResponse } from 'next/server'
import { getRedis } from '@/lib/pushStore'
import { checkAdmin } from '@/lib/adminAuth'

// GET /api/admin/leads?token=… → liste des emails captés (preuve de stockage réel).
// Protégé par ADMIN_TOKEN. Lecture seule.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(req: Request) {
  if (!checkAdmin(req)) return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  const redis = getRedis()
  if (!redis) return NextResponse.json({ error: 'Base non configurée (UPSTASH manquant en prod).', emails: [], leads: [], count: 0 }, { status: 200 })

  // Auto-diagnostic (?diag=1) : teste si Redis est accessible EN ÉCRITURE.
  // Un token Upstash « read-only » lit mais n'écrit pas → capture silencieusement perdue.
  if (new URL(req.url).searchParams.get('diag') === '1') {
    let canWrite = false, writeError = ''
    try { await redis.set('vh:diag:write', Date.now()); canWrite = (await redis.get('vh:diag:write')) != null }
    catch (e) { writeError = String(e).slice(0, 120) }
    return NextResponse.json({ redisConnected: true, canWrite, writeError })
  }

  const emails = (await redis.smembers('vh:leads:emails')) as string[]
  // Détail (source/ville/date) pour les 200 derniers, best-effort.
  const sample = emails.slice(0, 200)
  const leads = await Promise.all(sample.map(async (e) => {
    try { return (await redis.get(`vh:lead:${e}`)) || { email: e } } catch { return { email: e } }
  }))
  leads.sort((a, b) => String((b as { date?: string }).date || '').localeCompare(String((a as { date?: string }).date || '')))
  return NextResponse.json({ count: emails.length, leads })
}
