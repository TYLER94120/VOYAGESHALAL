// Logique EXACTE du filtre hôtels « façon Booking, mais halal & bien situé ».
// Fonctions PURES (aucun réseau) — répliquées à l'identique de l'app native pour
// que le site classe les hôtels au chiffre près. Source de vérité partagée.

export interface HotelLike {
  nom?: string
  lat?: number; lng?: number
  latitude?: number; longitude?: number
  coords?: { lat?: number; lng?: number }
  note?: number; score?: number
  reviewCount?: number; nombreAvis?: number; avis?: number
  price?: string; prix?: string; priceRange?: string; gamme_prix?: string
  prixNuitEur?: number
  category?: string; type?: string; categorie?: string
  salleDePriere?: boolean; prayerRoom?: boolean
  sansAlcool?: boolean; sans_alcool?: boolean; noAlcohol?: boolean
  petitDejeunerHalal?: boolean; halalBreakfast?: boolean
  piscineNonMixte?: boolean; womenOnlyPool?: boolean
  qibla?: boolean; qiblaIndicateur?: boolean
  halalFriendly?: boolean; halal_certifie?: boolean
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  [k: string]: any
}
export interface LatLng { lat: number; lng: number }

const clamp = (x: number, lo: number, hi: number) => Math.max(lo, Math.min(hi, x))

// Lecture tolérante des coordonnées (plusieurs noms de clés acceptés)
export function coordsOf(h: HotelLike): LatLng | null {
  const lat = h.lat ?? h.latitude ?? h.coords?.lat
  const lng = h.lng ?? h.longitude ?? h.coords?.lng
  return typeof lat === 'number' && typeof lng === 'number' ? { lat, lng } : null
}

// §1 Distance Haversine, en km
export function distanceKm(a: LatLng, b: LatLng): number {
  const R = 6371, p = Math.PI / 180
  const dLat = (b.lat - a.lat) * p, dLng = (b.lng - a.lng) * p
  const s = Math.sin(dLat / 2) ** 2 + Math.cos(a.lat * p) * Math.cos(b.lat * p) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.atan2(Math.sqrt(s), Math.sqrt(1 - s))
}

// §2 Rang de prix à partir de `price`/`priceRange`/… (0 = gratuit, 1..4, null inconnu)
export function priceRank(h: HotelLike): number | null {
  const raw = String(h.price ?? h.prix ?? h.priceRange ?? h.gamme_prix ?? '').trim()
  if (!raw) return null
  const low = raw.toLowerCase()
  if (low === 'gratuit' || low === 'free' || low === '0') return 0
  const euros = (raw.match(/€/g) || []).length
  return euros >= 1 ? Math.min(euros, 4) : null
}

export const noteOf = (h: HotelLike): number | null =>
  typeof h.note === 'number' ? h.note : typeof h.score === 'number' ? h.score : null
export const reviewCountOf = (h: HotelLike): number =>
  Number(h.reviewCount ?? h.nombreAvis ?? h.avis ?? 0) || 0
export const halalFlagged = (h: HotelLike): boolean =>
  !!(h.halal_certifie || h.halalFriendly)

// §3 Score « bien situé » : proximité mosquée + restaurants halal autour
export function scoreSitue(h: LatLng, mosques: LatLng[], restos: LatLng[]): { score: number; nearestMosqueKm: number; restosNear: number } {
  let nearestMosqueKm = Infinity
  for (const m of mosques) { const d = distanceKm(h, m); if (d < nearestMosqueKm) nearestMosqueKm = d }
  const restosNear = restos.reduce((n, r) => (distanceKm(h, r) <= 1 ? n + 1 : n), 0)
  const mosqueBonus = nearestMosqueKm === Infinity ? 0 : Math.max(0, 2 - nearestMosqueKm) * 5
  return { score: restosNear + mosqueBonus, nearestMosqueKm, restosNear }
}

// §4 Score « Recommandé » (0..1)
export function scoreRecommended(h: HotelLike, distToOrigin: number | null): number {
  const note = noteOf(h)
  const pr = priceRank(h)
  const noteScore = note != null ? clamp(note / 5, 0, 1) : 0.5
  const proxScore = distToOrigin != null ? 1 / (1 + Math.max(0, distToOrigin) / 2) : 0.4
  const cheapness = pr != null ? clamp((5 - pr) / 4, 0, 1) : 0.6
  const valueScore = noteScore * cheapness
  return 0.40 * noteScore + 0.35 * proxScore + 0.25 * valueScore
    + (halalFlagged(h) ? 0.05 : 0)
    + Math.min(reviewCountOf(h) / 800, 1) * 0.04
}

// §A Vocabulaire type normalisé
export const HOTEL_CATEGORIES = ['Premium', 'Boutique', 'Riad / Villa', 'Appartement', 'Familial', 'Budget', 'Capsule', 'Auberge'] as const
export const categoryOf = (h: HotelLike): string | null => h.category ?? h.categorie ?? h.type ?? null

// Équipements halal (lecture tolérante)
export const EQUIP = {
  salleDePriere: (h: HotelLike) => !!(h.salleDePriere ?? h.prayerRoom),
  sansAlcool: (h: HotelLike) => !!(h.sansAlcool ?? h.sans_alcool ?? h.noAlcohol),
  petitDejeunerHalal: (h: HotelLike) => !!(h.petitDejeunerHalal ?? h.halalBreakfast),
  piscineNonMixte: (h: HotelLike) => !!(h.piscineNonMixte ?? h.womenOnlyPool),
  qibla: (h: HotelLike) => !!(h.qibla ?? h.qiblaIndicateur),
} as const

// §7 Déduplication : fusionne si nom normalisé proche ET coords ≤ 70 m
const GENERIC = new Set(['hotel', 'hôtel', 'riad', 'resort', 'suites', 'suite', 'the', 'le', 'la', 'les', 'inn', 'by'])
export function normHotelName(nom?: string): string {
  return (nom || '')
    .normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()
    .replace(/[^a-z0-9 ]+/g, ' ')
    .split(/\s+/).filter((w) => w && !GENERIC.has(w)).join(' ').trim()
}
export function dedupeHotels<T extends HotelLike>(hotels: T[]): T[] {
  const out: T[] = []
  for (const h of hotels) {
    const c = coordsOf(h); const n = normHotelName(h.nom)
    const dup = out.some((o) => {
      if (normHotelName(o.nom) !== n || !n) return false
      const oc = coordsOf(o)
      return c && oc ? distanceKm(c, oc) * 1000 <= 70 : true
    })
    if (!dup) out.push(h) // l'entrée curée (en premier) gagne
  }
  return out
}
