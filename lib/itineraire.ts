// 🧭 UN TAP = L'ITINÉRAIRE — et un retour propre sur le site.
//
// DEUX DÉFAUTS SUCCESSIFS, ET LA DIFFÉRENCE ENTRE LES DEUX EST TOUT LE
// SUJET. On ne peut pas comprendre ce fichier sans les deux.
//
// 🔴 Itération 6 — `window.location.href = 'maps://…'` (iOS) ou
//    `'google.navigation:…'` (Android). Un SCHÉMA D'APPLICATION mis dans
//    l'URL courante casse l'état du document : au retour, le navigateur
//    restaurait une page morte. Corrigé en ouvrant un nouvel onglet.
//
// 🔴 21 août — le nouvel onglet a son propre défaut, et Mohamed l'a
//    photographié : « je clique sur itinéraire, ça me donne l'itinéraire,
//    je reviens sur le site et j'ai ça » — une page blanche avec un bouton
//    « OK ». C'est l'onglet que nous avions ouvert : iOS a passé la main à
//    l'app Plans, et la fenêtre laissée derrière est vide. Elle ne se
//    referme pas toute seule, et c'est elle qu'on retrouve.
//
// LA BONNE VOIE, celle qui n'a aucun des deux défauts : le lien UNIVERSEL
// https, suivi DANS L'ONGLET COURANT. Un lien universel n'est pas un
// schéma d'application — iOS et Android l'interceptent AVANT toute
// navigation et ouvrent l'app ; la page, elle, n'est jamais remplacée. On
// revient dessus intacte, sans onglet fantôme.
//
// Et si l'app n'est pas installée : la page s'ouvre sur Google Maps dans
// le même onglet, et le bouton « retour » du téléphone ramène au site.
// C'est le comportement que tout le monde connaît.
//
// On passe les COORDONNÉES, jamais le nom — et le mode adapté (à pied si
// la marche réelle ≤ 15 min) via travelmode.
export function lienItineraire(lat: number, lng: number, marche?: boolean): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}${marche === undefined ? '' : `&travelmode=${marche ? 'walking' : 'driving'}`}`
}

export function lancerItineraire(lat: number, lng: number, marche?: boolean): void {
  window.location.href = lienItineraire(lat, lng, marche)
}
