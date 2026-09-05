// 🔢 « 1 MOSQUÉES » — l'accord en nombre, à un seul endroit.
//
// Trouvé le 5 septembre en balayant les 3 153 phrases que les gabarits
// produisent réellement sur les 354 villes × 2 langues :
//
//   Où prier à Alicante : 1 mosquées et les restos halal
//   Where to pray in Alicante: 1 mosques, halal food
//
// **92 phrases, 28 villes, les deux langues** — et dans le TITRE, la seule
// ligne que Google affiche. Une faute d'accord y coûte des clics avant même
// d'être lue.
//
// 🔴 LA RÈGLE EXISTAIT DÉJÀ, AILLEURS. `lib/villeFaq.ts` la tient depuis
// toujours (`plFr`, `plEn`, avec `n > 1`), et `lib/titreVille.mjs` ne l'avait
// pas. Sixième nuit d'affilée avec la même forme de défaut : une règle vraie
// quelque part et fausse ailleurs. D'où ce module — les deux fichiers
// l'appellent, aucun ne peut plus diverger.
//
// ⚠️ « lieux de prière » ne se met pas au singulier en retirant un « s » :
// c'est « lieu de prière », le pluriel porte sur le premier mot. Une règle
// naïve écrirait « 1 lieux de prière » ou « 1 lieu de prières ». Les paires
// sont donc explicites, jamais devinées.
//
// ⚠️ L'accord se décide sur le NOMBRE, pas sur le texte affiché : le compte
// peut être rendu « 1,489 » ou « 60+ », et un compte plafonné (« 60+ ») reste
// toujours pluriel.

/** Les formes, explicites. Clé = pluriel tel qu'écrit dans les gabarits. */
const FORMES = {
  'mosquées': 'mosquée',
  'lieux de prière': 'lieu de prière',
  'adresses halal': 'adresse halal',
  'hôtels': 'hôtel',
  'restaurants': 'restaurant',
  'mosques': 'mosque',
  'prayer places': 'prayer place',
  'halal places to eat': 'halal place to eat',
  'hotels': 'hotel',
  'restaurants halal': 'restaurant halal',
}

/**
 * Le mot accordé au nombre.
 *
 *   accord(1, 'mosquées')          → 'mosquée'
 *   accord(3, 'mosquées')          → 'mosquées'
 *   accord(1, 'lieux de prière')   → 'lieu de prière'
 *   accord(0, 'mosquées')          → 'mosquées'   (zéro reste pluriel en FR)
 *
 * @param n      le NOMBRE réel, pas le texte affiché
 * @param mot    la forme plurielle, telle qu'écrite dans le gabarit
 * @param plafonne  vrai si le compte est affiché « 60+ » : toujours pluriel
 */
export function accord(n, mot, plafonne = false) {
  if (plafonne) return mot
  if (Number(n) !== 1) return mot
  const s = FORMES[mot]
  if (s) return s
  // Mot inconnu : on ne devine pas une forme singulière, on rend le pluriel
  // tel quel. Mieux vaut « 1 kiosques » qu'une invention grammaticale — et
  // scripts/test-accord.mjs échoue pour que la paire soit ajoutée ici.
  return mot
}

/** Les formes connues, pour que le test puisse vérifier qu'aucun mot de
 *  gabarit ne manque à l'appel. */
export const MOTS_ACCORDABLES = Object.keys(FORMES)
