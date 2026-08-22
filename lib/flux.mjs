// 🖱 LE FLUX SUR UN ORDINATEUR — le calcul, isolé pour être vérifiable.
//
// Mesuré le 22 août au navigateur, fenêtre 1440 × 900, sur le CSS réel du
// flux (.imm-flux, scroll-snap-type: y mandatory) :
//
//   molette de 400 px  → scrollTop 0      (rien ne bouge)
//   molette de 900 px  → scrollTop 814    (un panneau)
//   flèche ↓           → le flux ne bouge pas, c'est la PAGE qui défile
//
// Un cran de molette réel vaut environ 100 px. Le collage « mandatory »
// ramène au panneau courant tant que le geste n'a pas dépassé la moitié
// de l'écran : sur un ordinateur, le flux ne bougeait donc JAMAIS. Sur
// téléphone, le doigt lance un vrai élan et le collage s'accroche au
// panneau suivant — d'où « ça marche sur iPhone, pas sur PC ».
//
// La correction ne touche pas au collage (il fait bien son travail au
// doigt) : elle donne à la molette et aux flèches ce que le doigt a
// naturellement — UN panneau par geste.

/**
 * Le panneau visé après un geste.
 *
 * @param i      panneau courant (index)
 * @param sens   +1 vers le bas, -1 vers le haut
 * @param nb     nombre de panneaux
 * @returns l'index visé, ou null si le geste sort du flux — dans ce cas
 *          la page reprend la main et continue vers le socle, au lieu de
 *          rester bloquée sur le dernier panneau.
 */
export function panneauVise(i, sens, nb) {
  if (!Number.isFinite(i) || nb <= 0) return null
  const j = i + sens
  if (j < 0 || j > nb - 1) return null
  return j
}

/** Le panneau affiché, à partir du défilement. */
export function panneauCourant(scrollTop, hauteur) {
  if (!hauteur) return 0
  return Math.round(scrollTop / hauteur)
}
