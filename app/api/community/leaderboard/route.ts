import { NextRequest, NextResponse } from 'next/server'
import { topContributeurs } from '@/lib/community'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const ville = request.nextUrl.searchParams.get('ville')
  const scope = request.nextUrl.searchParams.get('scope')
  const top = await topContributeurs(ville ? `ville:${ville}` : scope === 'all' ? 'all' : 'mois', 10)
  return NextResponse.json({ top }, { headers: { 'Cache-Control': 'public, max-age=60' } })
}
