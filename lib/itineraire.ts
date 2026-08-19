// 🧭 UN TAP = L'ITINÉRAIRE — sans jamais quitter la page.
//
// 🔴 Itération 6, correction 3 — LA CAUSE DE LA PAGE BLANCHE : ce module
// faisait `window.location.href = 'maps://…'` (iOS) ou
// `'google.navigation:…'` (Android). Remplacer l'URL COURANTE par un schéma
// externe casse l'état du document : au retour depuis Maps, le navigateur
// restaure une page morte. Interdit désormais.
//
// La bonne voie : le lien UNIVERSEL https de Google Maps, ouvert DANS UN
// NOUVEL ONGLET (noopener). iOS et Android l'attrapent et ouvrent l'app
// Plans / Maps ; le site, lui, reste exactement où il était.
// On passe les COORDONNÉES, jamais le nom — et le mode adapté (à pied si
// la marche réelle ≤ 15 min) via travelmode.
export function lancerItineraire(lat: number, lng: number, marche?: boolean): void {
  const web = `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}${marche === undefined ? '' : `&travelmode=${marche ? 'walking' : 'driving'}`}`
  window.open(web, '_blank', 'noopener')
}
