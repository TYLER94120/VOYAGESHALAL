import { NextRequest, NextResponse } from 'next/server'

// Géolocalisation par IP — instantanée et non bloquante (fix UX horaires).
// Vercel injecte la position approximative de l'IP dans les en-têtes de la
// requête : aucun service tiers, aucune latence supplémentaire.

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const h = request.headers
  const lat = parseFloat(h.get('x-vercel-ip-latitude') ?? '')
  const lng = parseFloat(h.get('x-vercel-ip-longitude') ?? '')
  const city = h.get('x-vercel-ip-city')
  const country = h.get('x-vercel-ip-country')
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json({ ok: false }, { headers: { 'Cache-Control': 'no-store' } })
  }
  return NextResponse.json(
    { ok: true, lat, lng, city: city ? decodeURIComponent(city) : null, country },
    { headers: { 'Cache-Control': 'no-store' } }
  )
}
