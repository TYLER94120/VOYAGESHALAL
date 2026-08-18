// 🔴🔴 CHAQUE ONGLET A SON DOMAINE, STRICTEMENT.
//
// DÉFAUT LE PLUS GRAVE DU SITE, 15 août. Mohamed : « J'ai sélectionné
// PRIER. J'ai cliqué "choisis pour moi". Le site m'a répondu AL AMIR,
// traiteur, spécialités libanaises, avec des photos de houmous. Je
// cherchais un lieu de prière. On m'a servi un restaurant. C'est la faute
// la plus grave que ce site puisse commettre : ce n'est pas une
// imprécision de tri, c'est la promesse du site qui tombe. »
//
// ════════ POURQUOI CE FICHIER EXISTE ════════
//
// La première cause était ailleurs (le raccourci « choisis pour moi »
// écrasait la catégorie choisie). Mais une cause corrigée ne suffit pas
// quand la faute est de cette gravité : il faut une PORTE, au dernier
// moment, que rien ne puisse contourner. Même logique que lib/alcool.mjs.
//
// Ici, la porte est POSITIVE et non négative : en mode Prier, on ne
// cherche pas à écarter les restaurants — on n'accepte QUE des lieux de
// culte. La différence est décisive : une liste d'exclusions oublie
// toujours un cas (le traiteur libanais qui n'est ni bar ni restaurant au
// sens de Google), alors qu'une liste d'admissions ne laisse passer que ce
// qu'on a explicitement reconnu. Dans le doute, on n'affiche pas.
//
// ⚠️ ET SURTOUT : UN NOM À CONSONANCE MUSULMANE N'EST PAS UN LIEU DE
// PRIÈRE. Aucune règle ici ne regarde le nom du lieu pour décider qu'il
// s'agit d'une mosquée. Ni « Al », ni « Masjid », ni « Baraka ». Seul le
// TYPE déclaré compte.

/** Les seuls types Google qui SONT un lieu de prière. Liste d'admission. */
export const TYPES_PRIERE = new Set([
  'mosque', 'place_of_worship', 'islamic_prayer_hall', 'prayer_room',
  'religious_destination', 'synagogue', 'church', 'hindu_temple',
])

/**
 * Les types qui SERVENT À MANGER — donc interdits dans « Que faire », et
 * jamais un lieu de prière. Liste EXACTE : un motif large comme /food/
 * attraperait `seafood`, et on ne veut pas d'un filtre dont on ignore ce
 * qu'il exclut.
 */
export const TYPES_NOURRITURE = new Set([
  'restaurant', 'cafe', 'coffee_shop', 'bakery', 'bar', 'pub', 'bar_and_grill',
  'meal_takeaway', 'meal_delivery', 'fast_food_restaurant', 'food_court',
  'ice_cream_shop', 'sandwich_shop', 'juice_shop', 'dessert_shop', 'donut_shop',
  'candy_store', 'confectionery', 'deli', 'diner', 'buffet_restaurant',
  'breakfast_restaurant', 'brunch_restaurant', 'steak_house', 'cafeteria',
  'tea_house', 'wine_bar', 'night_club', 'grocery_store', 'supermarket',
  'catering_service', 'food_store', 'butcher_shop', 'liquor_store',
])

/** Le filet : Google crée régulièrement de nouveaux types de restaurants
 *  (afghani_restaurant, turkish_restaurant, mediterranean_restaurant…). */
const MOTIF_RESTAURANT = /_restaurant$|^restaurant$|_store$|_shop$/

/** `true` si ce lieu sert à manger. */
export function sertAManger(primaryType, types) {
  for (const t of [primaryType, ...(types ?? [])]) {
    if (!t) continue
    const k = String(t).toLowerCase()
    if (TYPES_NOURRITURE.has(k) || MOTIF_RESTAURANT.test(k)) return true
  }
  return false
}

/** `true` si ce lieu est un lieu de culte DÉCLARÉ comme tel. */
export function estLieuDePriere(primaryType, types) {
  for (const t of [primaryType, ...(types ?? [])]) {
    if (!t) continue
    if (TYPES_PRIERE.has(String(t).toLowerCase())) return true
  }
  return false
}

/**
 * LA PORTE. Ce lieu a-t-il le droit d'apparaître dans cette catégorie ?
 *
 * · mosquee  → uniquement un lieu de culte déclaré, ET jamais un lieu qui
 *              sert à manger (une salle de prière dans un restaurant reste
 *              un restaurant du point de vue de Google : dans le doute, non).
 * · activite → tout sauf ce qui sert à manger.
 * · manger   → pas de restriction ici : le filtre alcool s'en charge, et
 *              il est plus strict.
 *
 * Un lieu SANS AUCUN TYPE connu ne franchit pas la porte en mode Prier :
 * on ne devine pas qu'un lieu inconnu est une mosquée.
 */
export function accepte(categorie, primaryType, types) {
  if (categorie === 'mosquee') {
    if (sertAManger(primaryType, types)) return false
    return estLieuDePriere(primaryType, types)
  }
  if (categorie === 'activite') {
    // 🔎 Itération 4, diagnostic « Que faire ne trouve rien » : la porte
    // regardait TOUS les types — or un musée porte souvent 'cafe' ou
    // 'gift_shop'/'store' en types secondaires (sa boutique, sa cafétéria)
    // et sortait un à un. Un lieu n'est pas ce qu'il contient : seul le
    // TYPE PRINCIPAL décide. Un parc n'est ni halal ni pas halal — la
    // restauration intégrée peut se mentionner, jamais exclure.
    return !sertAManger(primaryType, primaryType ? [primaryType] : [])
  }
  return true
}
