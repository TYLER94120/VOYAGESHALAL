import { NextResponse } from 'next/server'
import { getFeed } from '@/lib/community'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET() {
  const feed = await getFeed(30)
  return NextResponse.json({ feed }, { headers: { 'Cache-Control': 'public, max-age=30' } })
}
