// 🔢 UN CHIFFRE QUI NE VIENT PAS DU COMPTAGE NE S'AFFICHE PAS.
//
// Mohamed, 27 août, capture de l'accueil anglais sur son iPhone. Panneau
// de La Mecque, trois nombres sur le même écran :
//
//   « Muslim travelers will find 76 halal restaurants listed, 400 mosques… »
//   « Saudi Arabia · 739 prayer places across the city »
//
// La fiche, elle, contient 26 restaurants et 60 mosquées ; le 739 vient
// d'OpenStreetMap. Aucun des deux premiers nombres n'est comptable.
//
// Mesuré sur toute la base : 347 chiffres démentis par la fiche qui les
// porte, sur 354 villes — « 1 mosque » à Agra, « 0 mosques » à Alexandrie,
// « 1 halal restaurant » à Ahmedabad. Ces phrases éditoriales ont été
// écrites une fois et n'ont jamais suivi les données.
//
// Ce n'est pas un problème d'affichage : ce texte est rendu par le SERVEUR
// dans le socle des 354 fiches, dans les deux langues, et c'est ce que
// Google lit. Une page dont le titre annonce 739 lieux de prière, le socle
// 400 mosquées et la FAQ 60 ne se contredit pas un peu : elle se disqualifie.
//
// LA RÈGLE, la plus simple possible : dans une phrase éditoriale, un compte
// de restaurants, de mosquées ou de lieux de prière ne s'affiche pas. Les
// vrais comptes existent déjà ailleurs sur la page — titre, compteurs du
// socle, FAQ — et ceux-là sont comptés. On ne tente pas de deviner si le
// chiffre du texte est juste : on ne peut pas le savoir, donc on ne le
// montre pas.
//
// Vérifié : 353 fiches sur 354 gardent de la prose après ce retrait.

/** La marque abandonnée. Elle traîne encore dans 699 descriptions. */
const MARQUE = /halal trust score/i
/** Sa fin de phrase : « with a Halal Trust Score of 4.9/5 », « avec un… ».
 *  ⚠️ On ne s'arrête PAS au premier point — « 4.9 » en contient un, et
 *  c'est exactement le piège qui produisait « with a 9/5 ». On s'arrête à
 *  une ponctuation SUIVIE D'UNE ESPACE ou de la fin : celle qui termine
 *  vraiment une phrase. */
const CLAUSE_MARQUE = /[,;]?\s*(with|avec)\s+an?\s+Halal Trust Score.*?(?=[.!?](?:\s|$))/i

/** Un compte de lieux dans une phrase : « 400 mosques », « 76 halal restaurants ». */
const COMPTE = /\d[\d\s,]*\s*\+?\s*(halal restaurants|restaurants halal|restaurants|mosques|mosquées|prayer places|lieux de prière)/i

/**
 * Le texte éditorial débarrassé des phrases qui avancent un compte.
 * @param {string | undefined | null} texte
 * @returns {string} la prose restante, ou une chaîne vide
 */
export function sansChiffreNonSource(texte) {
  if (typeof texte !== 'string' || !texte.trim()) return ''
  return texte
    .split(/(?<=[.!?])\s+/)
    // On RÉPARE la phrase de la marque abandonnée avant de la juger : la
    // jeter entière viderait 158 chapeaux sur 354, alors que seule sa fin
    // est à retirer. « Mecca, in Saudi Arabia, is a halal-friendly
    // destination with a Halal Trust Score of 4.9/5. » garde tout sauf le
    // score.
    .map((p) => (MARQUE.test(p) ? p.replace(CLAUSE_MARQUE, '').replace(/\s+([.!?])/, '$1').trim() : p))
    .filter((p) => p && !COMPTE.test(p) && !MARQUE.test(p))
    .join(' ')
    .trim()
}

// 🔴 POURQUOI CE FILTRE REMPLACE UN `replace()` — le défaut du 27 août.
//
// Le socle nettoyait la marque abandonnée ainsi :
//     s.replace(/Halal Trust Score[^.]*\./gi, '')
// « [^.]* » s'arrête au PREMIER point. Or la phrase dit « …with a Halal
// Trust Score of 4.9/5. » : le premier point est celui de « 4.9 ». Le
// nettoyage emportait « Halal Trust Score of 4. » et laissait, sur la page,
//     « Mecca … is a halal-friendly destination with a 9/5. »
// Une note de 9 sur 5, servie à Google. Mesuré : 172 descriptions sur 699
// ressortaient mutilées de ce nettoyage.
//
// On ne découpe donc plus À L'INTÉRIEUR d'une phrase : on retire la phrase
// entière. Le découpage `(?<=[.!?])\s+` exige une espace après le point,
// ce que « 4.9 » n'a pas — le décimal ne peut plus casser la coupe.

/** Vrai si la phrase avance un compte de lieux — pour les tests. */
export function avanceUnCompte(phrase) {
  return COMPTE.test(String(phrase ?? ''))
}
