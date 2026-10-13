// 🏷️ LE LIBELLÉ HALAL — et la valeur fantôme qui le faussait.
//
// Trouvé le 13 octobre. `components/villes/PageVille.tsx` comparait
// `halalConfidence === 'verified'` en quatre endroits — or **cette valeur
// n'existe nulle part dans les données.** Les valeurs réelles, comptées sur
// les 354 fiches (16 512 adresses) :
//
//   likely     14 168   (85,8 %)   déduit du type de cuisine
//   yes         1 425              tag explicite d'un contributeur
//   high          692
//   only          167
//   certified      60
//
// Conséquence, exactement à l'envers du bon sens : les **2 344 adresses
// explicitement taguées** tombaient dans le dernier cas et s'affichaient
// « à vérifier », tandis que les **14 168 simples déductions** s'affichaient
// « signalé halal » — un libellé plus fort. Et le tri « vérifiées d'abord »
// ne déplaçait jamais rien, puisque aucune fiche n'est `verified`.
//
// 🔴 CE QUE NOUS N'ÉCRIVONS JAMAIS. Ni « certifié » (une certification
// concerne une cuisine ou un produit, pas une ligne de base de données),
// ni « vérifié » pour un tag OSM : nous ne l'avons pas vérifié nous-mêmes.
// Un tag de contributeur est une SOURCE, donc « signalé ». Une déduction
// faite par nous à partir du mot « kebab » n'est pas une source : c'est
// « à confirmer ».

/** Les valeurs que les données portent réellement, de la plus forte à la
 *  plus faible. Une valeur inconnue est traitée comme une déduction. */
export const HALAL_DECLARE = ['certified', 'only', 'yes', 'high']

/** Une source a-t-elle déclaré ce lieu halal, ou l'avons-nous déduit ? */
export function halalDeclare(halal) {
  return HALAL_DECLARE.includes(String(halal ?? ''))
}

/**
 * Le libellé à afficher, en deux états honnêtes.
 *   halalDeclare → « signalé halal »  : un contributeur l'a tagué
 *   sinon        → « à confirmer »     : nous l'avons déduit du type de cuisine
 */
export function libelleHalal(halal, en) {
  if (halalDeclare(halal)) return en ? 'reported halal' : 'signalé halal'
  return en ? 'to confirm' : 'à confirmer'
}

/** Pour trier : les lieux déclarés avant les lieux déduits. */
export function rangHalal(halal) {
  return halalDeclare(halal) ? 0 : 1
}
