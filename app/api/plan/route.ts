import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import path from 'path'
import { getRedis } from '@/lib/pushStore'
import { generatePlan, type PlanInput, type TripPlan } from '@/lib/planner'

// Planificateur « Mon voyage halal » — même API pour app et web.
//   POST /api/plan  { action:'generate', villeSlug, dateStart, dateEnd, profil, interets, en? }
//   POST /api/plan  { action:'save', plan }        → { id, url }
//   GET  /api/plan?id=…                            → { plan }

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const villesDir = path.join(process.cwd(), 'data', 'villes')

function getVille(slug: string): Record<string, unknown> | null {
  if (!/^[a-z0-9-]+$/.test(slug)) return null
  try { return JSON.parse(readFileSync(path.join(villesDir, `${slug}.json`), 'utf-8')) } catch { return null }
}

const DATE_RE = /^\d{4}-\d{2}-\d{2}$/
const PROFILS = ['famille', 'couple', 'solo']
const INTERETS = ['culture', 'detente', 'gastronomie', 'spiritualite', 'shopping']

export async function POST(request: NextRequest) {
  let body: Record<string, unknown>
  try { body = await request.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }

  if (body.action === 'save') {
    const plan = body.plan as TripPlan | undefined
    if (!plan || !plan.villeSlug || !Array.isArray(plan.days) || plan.days.length === 0 || plan.days.length > 14) {
      return NextResponse.json({ error: 'Plan invalide' }, { status: 400 })
    }
    const redis = getRedis()
    if (!redis) return NextResponse.json({ error: 'Base non configurée' }, { status: 500 })
    const id = `${plan.villeSlug.slice(0, 24)}-${Math.random().toString(36).slice(2, 8)}`
    const stored: TripPlan = { ...plan, id, createdAt: new Date().toISOString() }
    try {
      await redis.set(`vh:plan:${id}`, stored, { ex: 60 * 60 * 24 * 180 }) // 6 mois
    } catch {
      return NextResponse.json({ error: 'Sauvegarde impossible, réessayez.' }, { status: 500 })
    }
    return NextResponse.json({ ok: true, id, url: `/plan/${id}` })
  }

  // action par défaut : generate
  const villeSlug = String(body.villeSlug ?? '')
  const dateStart = String(body.dateStart ?? '')
  const dateEnd = String(body.dateEnd ?? '')
  const profil = String(body.profil ?? 'solo')
  const interets = (Array.isArray(body.interets) ? body.interets : []).map(String).filter((i) => INTERETS.includes(i))
  const en = body.en === true

  if (!DATE_RE.test(dateStart) || !DATE_RE.test(dateEnd) || dateEnd < dateStart) {
    return NextResponse.json({ error: 'Dates invalides' }, { status: 400 })
  }
  if (!PROFILS.includes(profil)) return NextResponse.json({ error: 'Profil invalide' }, { status: 400 })
  const ville = getVille(villeSlug)
  if (!ville) return NextResponse.json({ error: 'Ville inconnue' }, { status: 404 })

  const input: PlanInput = { villeSlug, dateStart, dateEnd, profil: profil as PlanInput['profil'], interets: interets as PlanInput['interets'] }
  const { plan, alternates } = generatePlan(ville, input, en)
  return NextResponse.json({ plan, alternates })
}

export async function GET(request: NextRequest) {
  const id = request.nextUrl.searchParams.get('id') || ''
  if (!/^[a-z0-9-]+$/.test(id)) return NextResponse.json({ error: 'id invalide' }, { status: 400 })
  const redis = getRedis()
  if (!redis) return NextResponse.json({ error: 'Base non configurée' }, { status: 500 })
  const plan = await redis.get(`vh:plan:${id}`)
  if (!plan) return NextResponse.json({ error: 'Plan introuvable' }, { status: 404 })
  return NextResponse.json({ plan })
}
