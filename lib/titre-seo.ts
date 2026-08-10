// ✂️ LA RÈGLE DU TITRE, ÉCRITE UNE SEULE FOIS.
//
// CE QUI SE PASSE SANS ELLE. Un gabarit produit le même titre pour 354 villes.
// Il tient pour « Dubaï » et déborde pour « Bandar Seri Begawan ». Le défaut
// n'apparaît donc pas à l'écriture du gabarit, mais des mois plus tard, sur
// une poignée de pages, et il faut un robot pour le voir. Mesuré aujourd'hui :
// 31 titres coupés par Google, tous issus de trois gabarits, tous sur des
// villes au nom long.
//
// LA MAUVAISE RÉPARATION serait de raccourcir ces 31 pages. Le gabarit
// resterait faux, et la 355ᵉ ville au nom long réintroduirait le défaut.
//
// LA RÈGLE. On n'écrit plus UN titre, on écrit une liste de versions, de la
// plus riche à la plus courte. On sert la première qui tient. La dernière
// doit toujours tenir — c'est ce que vérifie scripts/test-titres.mjs, qui
// casse la construction si un gabarit ne peut pas se replier.
//
// POURQUOI 60 ET NON 62. Google coupe autour de 600 pixels, pas à un nombre
// de caractères. 60 est la limite prudente qui vaut pour les majuscules et
// les mots larges. Au-delà, on joue.

export const TITRE_MAX = 60
export const DESCRIPTION_MAX = 160

/**
 * Rend la première version qui tient dans la limite d'affichage de Google.
 *
 * @param versions de la plus riche à la plus courte. La dernière sert de
 *   filet : elle doit tenir seule, sans dépendre de la longueur d'un nom.
 *
 * @example
 *   titreSeo([
 *     `Hôtels halal ${ville} 2026 : sans alcool, mosquée proche`,
 *     `Hôtels halal ${ville} : sans alcool, mosquée proche`,
 *     `Hôtels halal ${ville} 2026 : sans alcool`,
 *     `Hôtels halal ${ville}`,
 *   ])
 */
export function titreSeo(versions: string[], max = TITRE_MAX): string {
  for (const v of versions) {
    const t = v.trim()
    if (t.length <= max) return t
  }
  // Aucune version ne tient : le nom lui-même est trop long (cas extrême,
  // pas encore rencontré sur nos 354 villes). On coupe sur un mot entier
  // plutôt qu'au milieu — et le test signale le gabarit fautif.
  return couperAuMot(versions[versions.length - 1] ?? '', max)
}

/** Coupe sans mutiler un mot, et sans laisser de ponctuation orpheline. */
export function couperAuMot(texte: string, max: number): string {
  const t = texte.trim()
  if (t.length <= max) return t
  const coupe = t.slice(0, max - 1)
  const espace = coupe.lastIndexOf(' ')
  return (espace > max * 0.6 ? coupe.slice(0, espace) : coupe).replace(/[\s:,;—–-]+$/, '') + '…'
}

/** Même principe pour la description (Google en affiche ~160 caractères). */
export function descriptionSeo(versions: string[], max = DESCRIPTION_MAX): string {
  for (const v of versions) {
    const t = v.trim()
    if (t.length <= max) return t
  }
  return couperAuMot(versions[versions.length - 1] ?? '', max)
}
