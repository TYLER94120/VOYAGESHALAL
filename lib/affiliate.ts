// Liens d'affiliation — revenus n°1 (hôtels) & extras du business plan.
// Les IDs d'affiliation sont lus depuis des variables d'environnement publiques :
// il suffit de les renseigner dans Vercel (Settings → Environment Variables),
// aucun code à modifier ensuite. Sans ID, les liens fonctionnent quand même
// (sans commission) → jamais de lien cassé pour l'utilisateur.

const HALALBOOKING_AID = process.env.NEXT_PUBLIC_HALALBOOKING_AID || ''
const BOOKING_AID = process.env.NEXT_PUBLIC_BOOKING_AID || ''
const GYG_PARTNER = process.env.NEXT_PUBLIC_GETYOURGUIDE_PARTNER || ''

/** URL de réservation d'hôtel halal pour une ville (HalalBooking prioritaire, sinon Booking.com). */
export function hotelBookingUrl(cityName: string): { url: string; provider: 'halalbooking' | 'booking' } {
  const q = encodeURIComponent(cityName)
  if (HALALBOOKING_AID) {
    return {
      url: `https://www.halalbooking.com/search?query=${q}&aid=${encodeURIComponent(HALALBOOKING_AID)}`,
      provider: 'halalbooking',
    }
  }
  // Repli Booking.com (avec aid si dispo) — couverture mondiale
  const aid = BOOKING_AID ? `&aid=${encodeURIComponent(BOOKING_AID)}` : ''
  return {
    url: `https://www.booking.com/searchresults.html?ss=${q}${aid}`,
    provider: 'booking',
  }
}

/** URL d'activités/excursions (GetYourGuide) pour une ville. */
export function activitiesUrl(cityName: string): string {
  const q = encodeURIComponent(cityName)
  const partner = GYG_PARTNER ? `?partner_id=${encodeURIComponent(GYG_PARTNER)}` : ''
  return `https://www.getyourguide.com/s/?q=${q}${partner}`
}
