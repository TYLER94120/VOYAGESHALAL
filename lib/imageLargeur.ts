// 🖼 DEMANDER UNE IMAGE À LA TAILLE OÙ ELLE EST AFFICHÉE.
//
// Mesuré sur la page d'accueil : les vignettes de destinations font
// **168 px de large à l'écran** et chargeaient des images de **1400 à
// 1600 px**. Neuf fois trop de pixels, soit environ dix fois le poids.
//
// Pire : ces vignettes sont posées en `backgroundImage` CSS, donc elles
// échappent complètement à l'optimiseur d'images de Next. Personne ne
// redimensionne à notre place — il faut le demander à la source.
//
// Nos images viennent d'Unsplash, qui accepte un paramètre `w` dans
// l'URL et renvoie l'image déjà redimensionnée. Il suffit de le corriger.
//
// Règle : on demande la largeur d'AFFICHAGE multipliée par 2 (les écrans
// de téléphone ont deux pixels physiques par pixel CSS), arrondie au
// palier supérieur. Au-delà, on paie des octets que l'œil ne voit pas.

/**
 * Réécrit la largeur demandée dans une URL d'image.
 * Sans effet sur une URL locale ou sans paramètre de largeur.
 */
export function photoLargeur(url: string | undefined, largeurAffichee: number): string | undefined {
  if (!url || !/^https?:\/\//.test(url)) return url
  const cible = Math.min(1600, Math.max(200, Math.round(largeurAffichee * 2 / 100) * 100))
  if (/[?&]w=\d+/.test(url)) return url.replace(/([?&]w=)\d+/, `$1${cible}`)
  return url + (url.includes('?') ? '&' : '?') + `w=${cible}`
}
