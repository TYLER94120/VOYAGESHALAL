import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { annuaireAutour } from '@/lib/annuaire'

// GET /api/annuaire?lat=&lng=&rayon=&type=priere|resto
// Les lieux DEJA documentes dans nos fiches villes, autour d'une position.
// Source OpenStreetMap : etiquetes « referencé · à vérifier », jamais
// « vérifié » ni « confirmé » (ce ne sont pas des temoignages de voyageurs).
export const dynamic = 'force-dynamic'

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const lat = parseFloat(sp.get('lat') ?? '')
  const lng = parseFloat(sp.get('lng') ?? '')
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: 'lat et lng requis' }, { status: 400 })
  }
  const type = sp.get('type')
  const rayonKm = Math.min(60, Math.max(1, parseFloat(sp.get('rayon') ?? '25') || 25))
  const limit = Math.min(60, Math.max(1, parseInt(sp.get('limit') ?? '40', 10) || 40))
  const { lieux, ville } = annuaireAutour(lat, lng, {
    rayonKm,
    limit,
    type: type === 'priere' || type === 'resto' ? type : undefined,
  })
  return NextResponse.json(
    { lieux, ville, source: 'openstreetmap', mention: 'referencé · à vérifier' },
    { headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' } },
  )
}
