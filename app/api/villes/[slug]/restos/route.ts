import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import path from 'path'

// Liste complète des restaurants d'une ville, chargée À LA DEMANDE quand
// l'utilisateur ouvre « Voir toutes les adresses » — la page ville n'en
// sérialise que 24 (hydratation plus rapide sur mobile d'entrée de gamme).
export const runtime = 'nodejs'

export async function GET(_req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params
  if (!/^[a-z0-9-]{2,60}$/.test(slug)) return NextResponse.json({ error: 'slug' }, { status: 400 })
  try {
    const raw = readFileSync(path.join(process.cwd(), 'data', 'villes', `${slug}.json`), 'utf-8')
    const v = JSON.parse(raw)
    return NextResponse.json(
      { restaurants: Array.isArray(v.restaurants) ? v.restaurants : [] },
      { headers: { 'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=86400' } },
    )
  } catch {
    return NextResponse.json({ error: 'introuvable' }, { status: 404 })
  }
}
