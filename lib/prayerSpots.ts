import { getRedis } from '@/lib/pushStore'
import type { PrayerSpot, PrayerSpotLieu } from '@/lib/villeTypes'

// Source UNIQUE des spots de prière (app + web + sitemap). Stockage Upstash Redis
// car le filesystem Vercel est read-only en prod : le propriétaire doit pouvoir
// semer un spot depuis son téléphone pendant un road trip.
//
// Clés :
//   vh:spots:ids            → set des ids
//   vh:spot:<id>            → objet PrayerSpot
//   vh:spots:ville:<slug>   → set des ids d'une ville (index rapide)

const IDS = 'vh:spots:ids'
const spotKey = (id: string) => `vh:spot:${id}`
const villeKey = (villeSlug: string) => `vh:spots:ville:${villeSlug}`

export const LIEU_LABELS: Record<PrayerSpotLieu, { fr: string; en: string; icon: string }> = {
  centre_commercial: { fr: 'Centre commercial', en: 'Shopping mall', icon: '🛍️' },
  restaurant: { fr: 'Restaurant', en: 'Restaurant', icon: '🍽️' },
  aeroport: { fr: 'Aéroport', en: 'Airport', icon: '✈️' },
  gare: { fr: 'Gare', en: 'Train station', icon: '🚉' },
  hotel: { fr: 'Hôtel', en: 'Hotel', icon: '🏨' },
  parc: { fr: 'Parc', en: 'Park', icon: '🌳' },
  universite: { fr: 'Université', en: 'University', icon: '🎓' },
  bureau: { fr: 'Bureau / espace public', en: 'Office / public space', icon: '🏢' },
  autre: { fr: 'Autre lieu', en: 'Other place', icon: '📍' },
}

export function slugify(s: string): string {
  return s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 60)
}

export async function listAllSpots(): Promise<PrayerSpot[]> {
  const r = getRedis(); if (!r) return []
  const ids = (await r.smembers(IDS)) as string[]
  if (!ids.length) return []
  const spots = await Promise.all(ids.map((id) => r.get(spotKey(id)) as Promise<PrayerSpot | null>))
  return spots.filter((s): s is PrayerSpot => !!s && s.status === 'published')
}

export async function listSpotsByVille(villeSlug: string): Promise<PrayerSpot[]> {
  const r = getRedis(); if (!r) return []
  const ids = (await r.smembers(villeKey(villeSlug))) as string[]
  if (!ids.length) return []
  const spots = await Promise.all(ids.map((id) => r.get(spotKey(id)) as Promise<PrayerSpot | null>))
  return spots.filter((s): s is PrayerSpot => !!s && s.status === 'published')
}

export async function getSpot(villeSlug: string, spotSlug: string): Promise<PrayerSpot | null> {
  const spots = await listSpotsByVille(villeSlug)
  return spots.find((s) => s.slug === spotSlug) || null
}

export async function saveSpot(input: Omit<PrayerSpot, 'id' | 'slug' | 'createdAt' | 'confirmations' | 'status' | 'source'> & Partial<Pick<PrayerSpot, 'source' | 'status'>>): Promise<PrayerSpot | null> {
  const r = getRedis(); if (!r) return null
  const id = `sp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`
  // slug unique dans la ville (suffixe si collision)
  const existing = await listSpotsByVille(input.villeSlug)
  let slug = slugify(input.nom) || 'spot'
  if (existing.some((s) => s.slug === slug)) slug = `${slug}-${id.slice(-4)}`
  const spot: PrayerSpot = {
    id, slug,
    nom: input.nom, typeLieu: input.typeLieu,
    villeSlug: input.villeSlug, villeNom: input.villeNom,
    lat: input.lat, lng: input.lng,
    adresse: input.adresse, description: input.description, photo: input.photo, note: input.note,
    source: input.source ?? 'curated',
    status: input.status ?? 'published',
    confirmations: 0,
    createdAt: new Date().toISOString(),
  }
  await r.set(spotKey(id), spot)
  await r.sadd(IDS, id)
  await r.sadd(villeKey(input.villeSlug), id)
  return spot
}

export async function deleteSpot(id: string): Promise<void> {
  const r = getRedis(); if (!r) return
  const spot = (await r.get(spotKey(id))) as PrayerSpot | null
  await r.del(spotKey(id))
  await r.srem(IDS, id)
  if (spot) await r.srem(villeKey(spot.villeSlug), id)
}
