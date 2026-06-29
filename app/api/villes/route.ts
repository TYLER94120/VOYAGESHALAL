import { NextResponse } from 'next/server'
import { readdirSync, readFileSync } from 'fs'
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

// Liste légère des villes — consommée par l'application mobile (Expo) et le web.
export function GET() {
  const dir = path.join(process.cwd(), 'data', 'villes')
  let villes: unknown[] = []
  try {
    villes = readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => {
        const v = JSON.parse(readFileSync(path.join(dir, f), 'utf-8'))
        return {
          slug: f.replace('.json', ''),
          nom: v.nom,
          pays: v.pays,
          continent: v.continent ?? null,
          region: v.region ?? null,
          score_halal: v.score_halal ?? null,
          halalScore: v.halalScore ?? null,
          image: v.image ?? v.image_hero ?? null,
          coordonnees: v.coordonnees ?? null,
          statistiques: v.statistiques ?? null,
        }
      })
      .sort((a, b) => String(a.nom).localeCompare(String(b.nom), 'fr'))
  } catch { /* ignore */ }
  return NextResponse.json({ count: villes.length, villes }, { headers: CORS })
}
