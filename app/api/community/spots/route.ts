import { NextRequest, NextResponse } from 'next/server'
import { getUserByToken, tokenFromRequest, createCommunitySpot, rateLimit, impactOf, niveauOf, CATEGORIES } from '@/lib/community'
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
  const user = await getUserByToken(tokenFromRequest(request))
  if (!user) return NextResponse.json({ error: 'Connexion requise' }, { status: 401 })
  if (!(await rateLimit(`spot:${user.id}`, 5, 3600))) return NextResponse.json({ error: 'Doucement 😊 — 5 spots max par heure' }, { status: 429 })
  let body: Record<string, unknown>
  try { body = await request.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }
  const nom = String(body.nom ?? '').trim()
  const lat = Number(body.lat), lng = Number(body.lng)
  const categorie = String(body.categorie ?? 'autre')
  if (!nom || nom.length < 3 || Number.isNaN(lat) || Number.isNaN(lng)) return NextResponse.json({ error: 'Nom et position requis' }, { status: 400 })
  if (!CATEGORIES.some((c) => c.id === categorie)) return NextResponse.json({ error: 'Catégorie inconnue' }, { status: 400 })
  const city = nearestCity(lat, lng)
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
