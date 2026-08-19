// 🔤 « Plus jamais d'écriture non latine seule » (itération 7).
//
// Un nom est LISIBLE s'il commence en écriture latine — « Temple Sensō-ji
// (浅草寺) » passe (le local suit entre parenthèses), « 和泉村地蔵墓地 »
// non. Un lieu au nom illisible n'entre ni dans le planning ni dans les
// sections du guide : il attend sa romanisation, il n'est pas déformé.

/** Vrai si la partie PRINCIPALE du nom (avant une éventuelle parenthèse)
 *  est majoritairement en écriture latine. */
export function estLatinLisible(nom) {
  const principal = String(nom ?? '').split('(')[0].trim()
  if (!principal) return false
  const lettres = [...principal].filter((c) => /\p{L}/u.test(c))
  if (!lettres.length) return false
  const latines = lettres.filter((c) => /\p{Script=Latin}/u.test(c))
  return latines.length / lettres.length >= 0.8
}
