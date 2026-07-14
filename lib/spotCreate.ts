import { saveSpot } from '@/lib/prayerSpots'
import type { PrayerSpot, PrayerSpotLieu } from '@/lib/villeTypes'
import cityCoords from '@/lib/cityCoords.json'

// Logique de création d'un spot de prière, partagée entre
// POST /api/admin/spots et POST /api/spots (admin uniquement).

interface CityRef { slug: string; nom: string; lat: number; lng: number }
const CITIES = cityCoords as CityRef[]
const norm = (s: string) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

const LIEU_VALUES: PrayerSpotLieu[] = ['centre_commercial', 'restaurant', 'aeroport', 'gare', 'hotel', 'parc', 'universite', 'bureau', 'autre']
// Alias acceptés (compat clients externes) → valeurs canoniques
const LIEU_ALIASES: Record<string, PrayerSpotLieu> = {
  salle: 'bureau', salle_de_priere: 'bureau', mosquee: 'autre', coin: 'autre',
  mall: 'centre_commercial', airport: 'aeroport', station: 'gare', university: 'universite', park: 'parc', office: 'bureau', other: 'autre',
}
function resolveLieu(raw: unknown): PrayerSpotLieu {
  const v = String(raw || 'autre').toLowerCase()
  if ((LIEU_VALUES as string[]).includes(v)) return v as PrayerSpotLieu
  return LIEU_ALIASES[v] ?? 'autre'
}

// Rattache un spot à la ville la plus proche (pour l'index /priere/[ville]).
function nearestCity(lat: number, lng: number): CityRef {
  let best = CITIES[0], bd = Infinity
  for (const c of CITIES) {
    const d = (c.lat - lat) ** 2 + (c.lng - lng) ** 2
    if (d < bd) { bd = d; best = c }
  }
  return best
}

export async function createSpotFromBody(body: Record<string, unknown>):
  Promise<{ error: string; status: number } | { spot: PrayerSpot }> {
  const nom = String(body.nom || body.name || '').trim()
  const lat = Number(body.lat), lng = Number(body.lng)
  const typeLieu = resolveLieu(body.typeLieu ?? body.type)
  if (!nom || Number.isNaN(lat) || Number.isNaN(lng)) {
    return { error: 'nom, lat, lng requis', status: 400 }
  }

  // Ville : explicite (villeSlug) sinon la plus proche des coordonnées.
  let city: CityRef | undefined
  if (body.villeSlug) {
    const nq = norm(String(body.villeSlug))
    city = CITIES.find((c) => c.slug === body.villeSlug || norm(c.nom) === nq)
  }
  if (!city) city = nearestCity(lat, lng)

  const spot = await saveSpot({
    nom, typeLieu,
    villeSlug: city.slug, villeNom: city.nom,
    lat, lng,
    adresse: body.adresse ? String(body.adresse) : undefined,
    description: body.description ? String(body.description) : undefined,
    photo: body.photo ? String(body.photo) : undefined,
    note: body.note != null ? Number(body.note) : undefined,
  })
  if (!spot) return { error: 'Base non configurée (UPSTASH manquant).', status: 500 }
  return { spot }
}
