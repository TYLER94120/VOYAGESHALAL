// 💶 📍 ⭐ — TROIS FILTRES, UNE LIGNE, AUCUNE IA.
//
// Ordre de Mohamed, 16 août : « Les propositions sont trop longues,
// prennent quatre lignes sur téléphone, et sont lentes. On remplace tout
// par trois filtres sur UNE seule ligne : Pas cher · Proche · Bien noté. »
//
// ════════ CE QUE ÇA CHANGE, ET POURQUOI C'EST PLUS SOLIDE ════════
//
// Trois critères universels que Google rend TOUJOURS : niveau de prix,
// distance, note. Aucune formulation à inventer, rien à rédiger, rien qui
// puisse échouer. Instantané, gratuit, incassable.
//
// Ce sont des FILTRES, pas des questions : ils s'allument, s'éteignent, et
// SE CUMULENT. « Pas cher + proche » veut dire les deux à la fois. La liste
// se retrie en direct, sans le moindre appel réseau.
//
// « Ouvert maintenant » n'est PAS un bouton : c'est le comportement par
// défaut. Les ouverts passent devant, les fermés derrière, marqués comme
// tels — un lieu fermé n'est pas une réponse à « où je mange maintenant »,
// mais ce n'est pas une raison de le cacher : il rouvre.
//
// Un filtre qui ne trouverait aucune adresse ne s'affiche pas. La règle ne
// bouge pas : toute proposition affichée est un engagement.
//
// ════════ LES SEUILS, ET D'OÙ ILS VIENNENT ════════
//
//   Pas cher   ← priceLevel 1 ou 2 (Google : INEXPENSIVE, MODERATE)
//   Proche     ← 400 m, soit environ cinq minutes à pied
//   Bien noté  ← rating >= 4.2 sur au moins 20 avis. Les deux comptent :
//                un 5,0 sur trois avis ne dit rien.

/** Les trois filtres, dans l'ordre où ils s'affichent. */
export const FILTRES = [
  { id: 'pas-cher', icone: '💶', fr: 'Pas cher', en: 'Cheap' },
  { id: 'proche', icone: '📍', fr: 'Proche', en: 'Nearby' },
  { id: 'bien-note', icone: '⭐', fr: 'Bien noté', en: 'Well rated' },
]

function garde(id, f) {
  if (id === 'pas-cher') return typeof f.prix === 'number' && f.prix > 0 && f.prix <= 2
  if (id === 'proche') return f.distanceM <= 400
  if (id === 'bien-note') return typeof f.note === 'number' && f.note >= 4.2 && (f.nbAvis ?? 0) >= 20
  return true
}

/**
 * Les filtres réellement proposables sur CES adresses-là, chacun avec son
 * compte. Un filtre sans résultat, ou qui garderait toute la liste, ne
 * s'affiche pas : dans un cas il ment, dans l'autre il ne sert à rien.
 */
export function filtresDisponibles(fiches) {
  const L = Array.isArray(fiches) ? fiches.filter(Boolean) : []
  if (L.length < 2) return []
  return FILTRES
    .map((f) => ({ ...f, n: L.filter((x) => garde(f.id, x)).length }))
    .filter((f) => f.n > 0 && f.n < L.length)
}

/**
 * La liste filtrée. Les filtres se CUMULENT — une adresse doit satisfaire
 * tous ceux qui sont allumés. Puis l'ordre : les ouverts d'abord, et à
 * état égal le plus proche d'abord.
 */
export function appliquer(fiches, actifs) {
  const L = Array.isArray(fiches) ? fiches.filter(Boolean) : []
  const on = Array.isArray(actifs) ? actifs : []
  return L
    .filter((f) => on.every((id) => garde(id, f)))
    .sort((a, b) => {
      const fa = a.ouvert === false ? 1 : 0
      const fb = b.ouvert === false ? 1 : 0
      if (fa !== fb) return fa - fb
      return a.distanceM - b.distanceM
    })
}
