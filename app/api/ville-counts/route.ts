import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getVilleCounts } from '@/lib/villeStats'

// Compteurs reels d'une fiche ville, pour que le board propose le guide de
// la ville OU L'ON EST plutot qu'une vedette generique. Lecture seule.
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const slug = (req.nextUrl.searchParams.get('slug') ?? '').toLowerCase()
  const en = req.nextUrl.searchParams.get('en') === '1'
  if (!/^[a-z0-9-]{2,60}$/.test(slug)) return NextResponse.json({ ville: null })
  return NextResponse.json(
    { ville: getVilleCounts(slug, en) },
    { headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' } },
  )
}
