import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getRedis } from '@/lib/pushStore'
import { getDomainSEO } from '@/lib/domain'
import { localizedHref } from '@/lib/slugs'
import PlanView from '@/components/planner/PlanView'
import type { TripPlan } from '@/lib/planner'

// Page SSR d'un plan sauvegardé (partage). noindex : plans personnels =
// contenu mince/dupliqué ; la page indexable est le planificateur lui-même.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ id: string }> }

async function getPlan(id: string): Promise<TripPlan | null> {
  if (!/^[a-z0-9-]+$/.test(id)) return null
  const redis = getRedis()
  if (!redis) return null
  try { return (await redis.get(`vh:plan:${id}`)) as TripPlan | null } catch { return null }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const { isEN } = await getDomainSEO()
  const plan = await getPlan(id)
  const title = plan
    ? (isEN ? `Halal itinerary ${plan.villeNom} — ${plan.nbJours} days` : `Itinéraire halal ${plan.villeNom} — ${plan.nbJours} jours`)
    : (isEN ? 'Saved plan' : 'Plan sauvegardé')
  return { title, robots: { index: false, follow: true } }
}

export default async function PlanPage({ params }: Props) {
  const { id } = await params
  const { isEN: en } = await getDomainSEO()
  const plan = await getPlan(id)
  if (!plan) notFound()

  return (
    <main style={{ minHeight: '100vh', background: 'var(--creme)' }} className="px-4 py-10">
      <PlanView plan={plan} />
      <p className="text-center text-sm mt-2">
        <Link href={localizedHref('/planificateur', en)} className="font-bold underline" style={{ color: '#1a3a2a' }}>
          {en ? '✨ Build my own halal itinerary' : '✨ Créer mon propre itinéraire halal'}
        </Link>
      </p>
    </main>
  )
}
