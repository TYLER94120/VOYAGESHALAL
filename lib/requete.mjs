// 🔴 LA REQUÊTE QUI PART CHEZ GOOGLE — LES MOTS DU VISITEUR D'ABORD.
//
// DÉFAUT CONSTATÉ PAR MOHAMED, 15 août :
//   « Je tape kebab → Master Poulet. Je tape pizza → Master Poulet. Je tape
//     autre chose → Master Poulet. Ce n'est pas du sur mesure, c'est une
//     liste des lieux les plus proches à laquelle on a collé une barre de
//     recherche. Le mot que je tape n'arrive jamais jusqu'au moteur. »
//
// Il avait raison, et il y avait DEUX causes distinctes :
//   1. ICI — la phrase était réduite à une liste FERMÉE de sept valeurs.
//      « pâtisserie orientale » devenait « halal bakery pastry » et perdait
//      « orientale » ; « couscous », « tacos », « poulet braisé » ne
//      correspondaient à rien et devenaient « halal restaurant ».
//   2. Dans le classement — le rang de pertinence de Google était jeté et
//      tout re-trié à la distance, donc le lieu le plus proche gagnait
//      toujours. (Corrigé dans app/api/lieux/route.ts.)
//
// Ce fichier est en .mjs pour la même raison que lib/alcool.mjs : la règle
// doit pouvoir être vérifiée par un test lancé AVANT le build, sans
// compilateur. Un défaut de ce genre est invisible en relecture et évident
// à l'usage — donc il se teste.

/**
 * Les mots qui décrivent le CONTEXTE et non ce qu'on cherche. « pas cher »,
 * « pas loin », « ouvert maintenant » sont déjà devenus des critères ; les
 * renvoyer à Google ne fait que diluer la requête.
 *
 * ⚠️ On ne retire QUE ces mots-là. Tout ce qu'on ne comprend pas est
 * conservé — c'est justement là que se cache ce que le visiteur veut.
 */
const MOTS_DE_CONTEXTE = /\b(?:je|tu|un|une|des|du|de|la|le|les|au|aux|en|et|ou|pour|avec|dans|sur|qui|que|quoi|veux|voudrais|cherche|aimerais|trouve|manger|boire|svp|stp|te|plait|plaît|me|moi|mon|ma|mes|est|sont|il|elle|y|a|à|pas|cher|chère|loin|près|pres|proche|tout|toute|vraiment|bien|très|tres|maintenant|suite|ouvert|ouverte|soir|midi|seul|famille|amis|i|want|would|like|looking|for|the|an|some|near|nearby|close|by|cheap|open|now|good|really|please|my)\b/gi

/**
 * Ce qu'il reste de la phrase une fois retirés les mots de contexte : les
 * mots qui DÉCRIVENT ce qu'on cherche. Vide quand il ne reste rien
 * d'exploitable — on retombe alors sur la catégorie, honnêtement.
 */
export function motsUtiles(phrase) {
  const reste = String(phrase ?? '')
    .replace(/[''`]/g, ' ')
    .replace(MOTS_DE_CONTEXTE, ' ')
    .replace(/[^\p{L}\p{N}\s-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (reste.length < 3) return ''
  // Au-delà de huit mots, on dilue au lieu d'affiner.
  return reste.split(' ').slice(0, 8).join(' ')
}

/** Le repli quand le visiteur n'a rien écrit — il a cliqué sur une tuile. */
export const TEXTE_PAR_DEFAUT = {
  pizza: 'halal pizza', kebab: 'halal kebab', burger: 'halal burger',
  oriental: 'halal middle eastern restaurant', asiatique: 'halal asian restaurant',
  'petit-dejeuner': 'halal breakfast', patisserie: 'halal bakery pastry',
  'peu-importe': 'halal restaurant',
}

/**
 * La requête textuelle envoyée à Google Places.
 *
 * · mosquée  → « mosquée » (jamais « halal » : c'est absurde et ça brouille)
 * · activité → les mots tels quels, ou un repli explicite
 * · manger   → « halal » + les mots TELS QUELS ; le repli par catégorie ne
 *              sert que si rien n'a été écrit.
 */
export function requeteGoogle(criteres) {
  const c = criteres ?? {}
  const mots = motsUtiles(c.motsCles ?? '')
  if (c.categorie === 'mosquee') return 'mosquée'
  if (c.categorie === 'activite') return mots || 'à visiter musée parc monument'
  if (!mots) return TEXTE_PAR_DEFAUT[c.quoi] ?? TEXTE_PAR_DEFAUT['peu-importe']
  return /halal/i.test(mots) ? mots : `halal ${mots}`
}
