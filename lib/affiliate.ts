// Liens d'affiliation — revenus n°1 (hôtels) & extras du business plan.
// Les IDs d'affiliation sont lus depuis des variables d'environnement publiques :
// il suffit de les renseigner dans Vercel (Settings → Environment Variables),
// aucun code à modifier ensuite. Sans ID, les liens fonctionnent quand même
// (sans commission) → jamais de lien cassé pour l'utilisateur.

const HALALBOOKING_AID = process.env.NEXT_PUBLIC_HALALBOOKING_AID || ''
const BOOKING_AID = process.env.NEXT_PUBLIC_BOOKING_AID || ''
const GYG_PARTNER = process.env.NEXT_PUBLIC_GETYOURGUIDE_PARTNER || ''

/** URL de réservation d'hôtel halal pour une ville — HALALBOOKING UNIQUEMENT.
 * Décision produit : Booking & co ne sont pas orientés halal (pas de filtres
 * piscine femmes / sans alcool, pas de prix membres) → on ne les propose plus.
 * Le lien marche avec ou sans AID (sans = pas de commission, jamais cassé). */
export function hotelBookingUrl(cityName: string): { url: string; provider: 'halalbooking' } {
  const q = encodeURIComponent(cityName)
  const aid = HALALBOOKING_AID ? `&aid=${encodeURIComponent(HALALBOOKING_AID)}` : ''
  return {
    url: `https://www.halalbooking.com/search?query=${q}${aid}`,
    provider: 'halalbooking',
  }
}
// (BOOKING_AID conservé uniquement pour compat — plus utilisé pour les hôtels)
void BOOKING_AID

/** URL d'activités/excursions (GetYourGuide) pour une ville. */
export function activitiesUrl(cityName: string): string {
  const q = encodeURIComponent(cityName)
  const partner = GYG_PARTNER ? `?partner_id=${encodeURIComponent(GYG_PARTNER)}` : ''
  return `https://www.getyourguide.com/s/?q=${q}${partner}`
}
