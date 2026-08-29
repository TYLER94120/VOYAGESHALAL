// 🔎 LE TITRE ET LA DESCRIPTION D'UNE PAGE VILLE — écrits une seule fois.
//
// CHANTIER DU 21 AOÛT, sur mesures de Search Console (28 jours, mobile) :
// gohalaltravel.com/destinations/marrakech était en position 7,5 — première
// page de Google — avec 59 affichages et ZÉRO clic. Almaty 9,5 : zéro clic.
// Amsterdam 11,8 : zéro clic. Le classement n'était pas le problème.
//
// Le modèle qui a marché sur le site français :
//   AVANT « Marrakech Halal — Restaurants, Mosquées & Guide Complet 2026 »
//   APRÈS « Où prier à Marrakech : 45 mosquées et les restos halal »
// Le besoin d'abord, un chiffre vérifiable, une réponse promise — pas un
// guide.
//
// ⚠️ POURQUOI CE FICHIER EXISTE PLUTÔT QU'UN GABARIT DANS LA PAGE.
// Les chiffres annoncés doivent être VÉRIFIABLES sur les 354 villes, pas
// sur les quatre que l'on regarde. Une fonction pure s'audite d'un coup
// (scripts/test-titres-villes.mjs) ; un gabarit noyé dans un composant ne
// s'audite jamais.
//
// 🔴 LES PLAFONDS DE COLLECTE, ET POURQUOI ILS COMPTENT.
// Nos fichiers ne stockent pas tout : la collecte s'arrête à 60 mosquées,
// 150 restaurants, 120 hôtels. Mesuré le 21 août : 78 villes sur 354 sont
// exactement à 60 mosquées, 23 à 150 restaurants, 29 à 120 hôtels. Annoncer
// « 60 mosques » à Istanbul, qui en compte 1 489 dans OpenStreetMap, c'est
// écrire un chiffre faux avec l'aplomb d'un chiffre compté. Au plafond, on
// écrit « 60+ » — c'est vrai, et c'est plus attirant.

export const PLAFOND_MOSQUEES = 60
export const PLAFOND_RESTOS = 150
export const PLAFOND_HOTELS = 120

/** « 1489 » se lit mal, « 1,489 » se lit. */
const nb = (n) => n.toLocaleString('en-GB')
/** Au plafond, le compte n'est pas le total : on le dit. */
const compte = (n, plafond) => (n >= plafond ? `${nb(n)}+` : nb(n))

/**
 * Le titre anglais. Moins de 60 caractères, le besoin d'abord, un chiffre
 * compté — et aucun chiffre plutôt qu'un chiffre faux.
 *
 * @param nom          nom anglais de la ville (Marrakesh, Mecca…)
 * @param nbPriere     lieux de prière comptés (OSM si disponible, sinon la base)
 * @param sourceOsm    vrai si le compte vient d'OpenStreetMap (ville entière)
 */
export function titresVilleEn(nom, nbPriere, sourceOsm) {
  if (!nbPriere || nbPriere <= 0) {
    return [`Where to pray and eat halal in ${nom}`, `Halal travel in ${nom}`]
  }
  const n = sourceOsm ? nb(nbPriere) : compte(nbPriere, PLAFOND_MOSQUEES)
  // « prayer places » quand le compte vient d'OSM : salles de prière et
  // mosquées y sont mélangées, on ne promet pas plus que ce qu'on sait.
  const quoi = sourceOsm ? 'prayer places' : 'mosques'
  return [
    `Where to pray in ${nom}: ${n} ${quoi}, halal food`,
    `Where to pray in ${nom}: ${n} ${quoi}`,
    `Where to pray in ${nom}`,
  ]
}

/** Le titre français, même règle. */
export function titresVilleFr(nom, nbPriere, sourceOsm) {
  if (!nbPriere || nbPriere <= 0) {
    return [`Où prier et manger halal à ${nom}`, `Voyager halal à ${nom}`]
  }
  const n = sourceOsm ? nb(nbPriere).replace(/,/g, ' ') : compte(nbPriere, PLAFOND_MOSQUEES).replace(/,/g, ' ')
  const quoi = sourceOsm ? 'lieux de prière' : 'mosquées'
  // 🔎 29 août, sur les chiffres de Search Console (3 mois, mobile).
  // /destinations/marrakech : 146 affichages, position 8,2, ZÉRO clic — la
  // deuxième réserve du site après Disneyland. Son titre servi ne faisait
  // que 42 caractères sur les 60 disponibles :
  //     « Où prier à Marrakech : 142 lieux de prière »
  // La version complète en fait 62 : elle dépasse d'UN caractère, et le
  // repli sautait directement à la version nue. Dix-huit caractères de
  // promesse perdus pour un caractère de trop.
  //
  // Mesuré sur les 343 villes qui ont un compte : 45 titres français
  // tombaient ainsi. Un palier intermédiaire — la même promesse, écrite
  // court — en récupère 42. L'anglais n'en perdait que 4, parce qu'il
  // utilisait déjà la forme courte (« , halal food »).
  return [
    `Où prier à ${nom} : ${n} ${quoi} et les restos halal`,
    `Où prier à ${nom} : ${n} ${quoi}, restos halal`,
    `Où prier à ${nom} : ${n} ${quoi}`,
    `Où prier à ${nom}`,
  ]
}

/**
 * La description. Elle COMPLÈTE le titre au lieu de le répéter — le titre
 * porte déjà les lieux de prière — et elle annonce la preuve : source
 * affichée, gratuit, sans compte.
 *
 * 🔴 Elle ne redonne JAMAIS un second compte de mosquées : le titre disait
 * « 142 prayer places » (OpenStreetMap, toute la ville) pendant que la
 * description disait « 45 mosques » (notre base). Deux chiffres pour la
 * même chose, sur la même ligne de résultat : le lecteur ne se demande pas
 * lequel est bon, il passe au résultat suivant.
 */
export function descriptionVille({ nom, nbRestos, nbHotels, en }) {
  const bouts = []
  if (nbRestos > 0) bouts.push(en ? `${compte(nbRestos, PLAFOND_RESTOS)} halal places to eat` : `${compte(nbRestos, PLAFOND_RESTOS)} adresses halal`)
  if (nbHotels > 0) bouts.push(en ? `${compte(nbHotels, PLAFOND_HOTELS)} hotels` : `${compte(nbHotels, PLAFOND_HOTELS)} hôtels`)
  const liste = bouts.join(en ? ' and ' : ' et ')
  const texte = en
    ? `${liste ? `${liste} in ${nom}, ` : ''}prayer times in the city's own time zone. Source shown on every listing. Free, no account.`
    : `${liste ? `${liste} à ${nom}, ` : ''}horaires de prière au fuseau de la ville. Source affichée sur chaque adresse. Gratuit, sans compte.`
  // 155 caractères : au-delà, Google coupe. On tronque au mot, jamais au
  // milieu d'un mot.
  return texte.length <= 155 ? texte : `${texte.slice(0, 152).replace(/\s+\S*$/, '')}…`
}

/** Les mots qui ne donnent aucune raison de cliquer. */
export const MOTS_INTERDITS = /complete guide|ultimate guide|everything you need to know|\bdiscover\b|your guide to|guide complet|découvrez|tout savoir/i
