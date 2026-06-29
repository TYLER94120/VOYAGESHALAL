import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import path from 'path'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Cache-Control': 'public, max-age=600, s-maxage=3600',
}

export function OPTIONS() {
  return new NextResponse(null, { headers: CORS })
}

// Détail complet d'une ville — consommé par l'application mobile.
export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params
  const safe = slug.replace(/[^a-z0-9-]/gi, '')
  const file = path.join(process.cwd(), 'data', 'villes', `${safe}.json`)
  if (!existsSync(file)) return NextResponse.json({ error: 'not_found' }, { status: 404, headers: CORS })
  try {
    const ville = JSON.parse(readFileSync(file, 'utf-8'))
    return NextResponse.json(ville, { headers: CORS })
  } catch {
    return NextResponse.json({ error: 'parse_error' }, { status: 500, headers: CORS })
  }
}
