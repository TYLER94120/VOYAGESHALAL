import { NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import path from 'path'
import cityCoords from '@/lib/cityCoords.json'

// API « Autour de moi » : renvoie INSTANTANÉMENT nos points pré-chargés
// (mosquées, restaurants halal, hôtels) proches d'une position, à partir de la
// ville la plus proche parmi nos 354 fiches. Sert de premier affichage < 1 s ;
// le client complète ensuite avec les données live OpenStreetMap en arrière-plan.

export const dynamic = 'force-dynamic'

interface CityRef { slug: string; nom: string; lat: number; lng: number }
const CITIES = cityCoords as CityRef[]

function haversine(a: number, b: number, c: number, d: number) {
  const R = 6371000, p = Math.PI / 180
  const x = Math.sin(((c - a) * p) / 2) ** 2 + Math.cos(a * p) * Math.cos(c * p) * Math.sin(((d - b) * p) / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function coordOf(o: any): { lat: number; lng: number } | null {
  const lat = o?.lat ?? o?.coordonnees?.lat
  const lng = o?.lng ?? o?.coordonnees?.lng
  return typeof lat === 'number' && typeof lng === 'number' ? { lat, lng } : null
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const lat = parseFloat(searchParams.get('lat') || '')
  const lng = parseFloat(searchParams.get('lng') || '')
  const radius = parseFloat(searchParams.get('r') || '6000')
  if (Number.isNaN(lat) || Number.isNaN(lng)) {
    return NextResponse.json({ error: 'lat/lng requis' }, { status: 400 })
  }

  // Ville la plus proche
  let nearest: CityRef | null = null
  let best = Infinity
  for (const c of CITIES) {
    const dd = haversine(lat, lng, c.lat, c.lng)
    if (dd < best) { best = dd; nearest = c }
  }
  if (!nearest) return NextResponse.json({ city: null, spots: {} })

  // On ne renvoie des points pré-chargés que si l'utilisateur est raisonnablement
  // proche d'une de nos villes (≤ 40 km). Sinon → uniquement du live côté client.
  if (best > 40000) {
    return NextResponse.json({ city: nearest.nom, distance: Math.round(best), spots: {} })
  }

  let data: Record<string, unknown>
  try {
    data = JSON.parse(readFileSync(path.join(process.cwd(), 'data', 'villes', `${nearest.slug}.json`), 'utf-8'))
  } catch {
    return NextResponse.json({ city: nearest.nom, spots: {} })
  }

  const FALLBACK_RADIUS = 35000 // si rien dans le rayon serré, on montre les plus proches (banlieue)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const near = (arr: any[] | undefined, map: (o: any, dist: number) => any) => {
    if (!Array.isArray(arr)) return []
    // Tous les lieux géolocalisés, triés par distance à l'utilisateur
    const all = arr
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      .map((o) => { const c = coordOf(o); return c ? { o: { ...o, lat: c.lat, lng: c.lng }, dist: haversine(lat, lng, c.lat, c.lng) } : null })
      .filter((x): x is { o: any; dist: number } => x !== null) // eslint-disable-line @typescript-eslint/no-explicit-any
      .sort((a, b) => a.dist - b.dist)
    // Priorité au rayon serré ; si vide, repli sur les plus proches (≤ 35 km)
    const within = all.filter((x) => x.dist <= radius)
    const chosen = within.length ? within : all.filter((x) => x.dist <= FALLBACK_RADIUS)
    return chosen.slice(0, 40).map((x) => map(x.o, x.dist))
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const spots = {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    mosquees: near(data.mosqueesPrincipales as any[], (o, dist) => ({ id: `m-${o.nom}`, lat: o.lat, lng: o.lng, name: o.nom, sub: o.adresse || 'Lieu de prière', dist })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    restaurants: near(data.restaurants as any[], (o, dist) => ({ id: `r-${o.nom}`, lat: o.lat, lng: o.lng, name: o.nom, sub: o.type || 'Restaurant', dist, halal: o.halalConfidence === 'certified' || o.halalConfidence === 'high' ? 'yes' : 'likely' })),
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    hotels: near(data.hotels as any[], (o, dist) => ({ id: `h-${o.nom}`, lat: o.lat, lng: o.lng, name: o.nom, sub: o.categorie || 'Hôtel', dist })),
    boucheries: [] as unknown[],
  }

  return NextResponse.json({ city: nearest.nom, distance: Math.round(best), spots }, {
    headers: { 'Cache-Control': 'public, max-age=300, s-maxage=3600' },
  })
}
