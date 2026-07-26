import { NextRequest, NextResponse } from 'next/server'
import { getUserByToken, tokenFromRequest, createCommunitySpot, createAnonSpot, rateLimit, impactOf, niveauOf, CATEGORIES } from '@/lib/community'
import cityCoords from '@/lib/cityCoords.json'

// BLOC 2 — ajout d'un spot par la communauté (auth requise, < 30 s, anti-spam)
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface CityRef { slug: string; nom: string; lat: number; lng: number }
const CITIES = cityCoords as CityRef[]
function nearestCity(lat: number, lng: number): CityRef {
  let best = CITIES[0], bd = Infinity
  for (const c of CITIES) { const d = (c.lat - lat) ** 2 + (c.lng - lng) ** 2; if (d < bd) { bd = d; best = c } }
  return best
}

export async function POST(request: NextRequest) {
  // ZÉRO FRICTION : le compte est OPTIONNEL. Sans compte → publication
  // anonyme (« Un voyageur »), 3 spots/jour par IP, rattachable ensuite.
  const user = await getUserByToken(tokenFromRequest(request))
  if (user) {
    if (!(await rateLimit(`spot:${user.id}`, 5, 3600))) return NextResponse.json({ error: 'Doucement 😊 — 5 spots max par heure' }, { status: 429 })
  } else {
    const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon'
    if (!(await rateLimit(`anonspot:${ip}`, 3, 86400))) return NextResponse.json({ error: 'Limite atteinte — connecte-toi pour continuer à partager' }, { status: 429 })
  }
  let body: Record<string, unknown>
  try { body = await request.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }
  const nom = String(body.nom ?? '').trim()
  const lat = Number(body.lat), lng = Number(body.lng)
  const categorie = String(body.categorie ?? 'autre')
  if (!nom || nom.length < 3 || Number.isNaN(lat) || Number.isNaN(lng)) return NextResponse.json({ error: 'Nom et position requis' }, { status: 400 })
  if (!CATEGORIES.some((c) => c.id === categorie)) return NextResponse.json({ error: 'Catégorie inconnue' }, { status: 400 })
  const city = nearestCity(lat, lng)
  if (!user) {
    const anon = await createAnonSpot({
      categorie, nom, lat, lng,
      note: body.note ? String(body.note) : undefined,
      villeSlug: city.slug, villeNom: city.nom,
    })
    if (!anon) return NextResponse.json({ error: 'Base indisponible' }, { status: 500 })
    return NextResponse.json({
      ok: true, anon: true, spot: anon.spot, claimKey: anon.claimKey,
      pointsGagnes: 0, nouveauxBadges: [], impact: 0,
      url: `/spot/${anon.spot.id}`,
    })
  }
  const res = await createCommunitySpot(user, {
    categorie, nom, lat, lng,
    note: body.note ? String(body.note) : undefined,
    photo: body.photo && /^https:\/\//.test(String(body.photo)) ? String(body.photo) : undefined,
    villeSlug: city.slug, villeNom: city.nom,
    typeLieu: categorie === 'coin_priere' ? 'autre' : 'autre',
  })
  if (!res) return NextResponse.json({ error: 'Base indisponible' }, { status: 500 })
  const impact = await impactOf(user.id)
  return NextResponse.json({
    ok: true, spot: res.spot, pointsGagnes: res.pointsGagnes, nouveauxBadges: res.nouveauxBadges,
    points: user.points, niveau: niveauOf(user.points), impact,
    url: `/spot/${res.spot.id}`,
  })
}

// GET — fil des spots pour le feed « Découvrir les spots ».
// Tri : plus récents d'abord ; filtres optionnels catégorie / ville / rayon.
export async function GET(request: NextRequest) {
  const { listAllSpots } = await import('@/lib/prayerSpots')
  const sp = request.nextUrl.searchParams
  const categorie = sp.get('categorie')
  const ville = sp.get('ville')
  const lat = parseFloat(sp.get('lat') ?? '')
  const lng = parseFloat(sp.get('lng') ?? '')
  const radius = parseFloat(sp.get('radius') ?? '50')
  const limit = Math.min(60, parseInt(sp.get('limit') ?? '30', 10) || 30)
  let spots = (await listAllSpots()).filter((s) => s.status === 'published')
  if (categorie) spots = spots.filter((s) => (s.categorie ?? 'coin_priere') === categorie)
  if (ville) spots = spots.filter((s) => s.villeSlug === ville)
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    const p = Math.PI / 180
    const dist = (s: { lat: number; lng: number }) => {
      const a = Math.sin(((s.lat - lat) * p) / 2) ** 2 + Math.cos(lat * p) * Math.cos(s.lat * p) * Math.sin(((s.lng - lng) * p) / 2) ** 2
      return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    }
    spots = spots
      .map((s) => ({ ...s, distKm: Math.round(dist(s) * 10) / 10 }))
      .filter((s) => (s as { distKm: number }).distKm <= radius)
      .sort((a, b) => (a as { distKm: number }).distKm - (b as { distKm: number }).distKm)
  } else {
    spots = spots.sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
  }
  return NextResponse.json(
    { spots: spots.slice(0, limit) },
    { headers: { 'Cache-Control': 's-maxage=60, stale-while-revalidate=300' } },
  )
}
