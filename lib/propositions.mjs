// 💶 📍 ⭐ — TROIS TRIS, UN SEUL À LA FOIS, AUCUNE IA.
//
// Brief de Mohamed, 17 août (écran « Barre intelligente ») :
//   « Chips Pas cher / Proche / Bien noté → fixent le TRI — choix unique,
//     re-tap = retirer. Pas cher = price_level ascendant, Proche = distance
//     ascendante, Bien noté = rating descendant (minimum 20 avis). »
//
// ⚠️ C'est un CHANGEMENT DE RÈGLE assumé : la veille, ces puces étaient des
// filtres cumulables qui retiraient des adresses. Mohamed a tranché pour
// des TRIS exclusifs — on ne cache plus rien, on réordonne. C'est plus
// honnête d'ailleurs : une adresse chère reste visible, elle passe juste
// derrière. La consigne la plus récente gagne, et ce commentaire existe
// pour qu'on ne « répare » pas ce changement en croyant à une régression.
//
// Ce qui ne change pas : aucun appel réseau, aucune IA. Google a déjà rendu
// prix, distance, note et nombre d'avis — trier est gratuit et instantané.

/** Les trois tris, dans l'ordre où ils s'affichent. Les icônes sont des
 *  identifiants pour l'écran (qui dessine des SVG — zéro emoji au rendu). */
export const TRIS = [
  { id: 'pas-cher', icone: 'billet', fr: 'Pas cher', en: 'Cheap' },
  { id: 'proche', icone: 'fleche', fr: 'Proche', en: 'Nearby' },
  { id: 'bien-note', icone: 'etoile', fr: 'Bien noté', en: 'Top rated' },
]

/** Un tri n'est proposé que si les adresses portent la donnée qu'il trie :
 *  « Pas cher » sans aucun niveau de prix serait un bouton mort. */
export function trisDisponibles(fiches) {
  const L = Array.isArray(fiches) ? fiches.filter(Boolean) : []
  if (L.length < 2) return []
  return TRIS.filter((t) => {
    if (t.id === 'pas-cher') return L.some((f) => typeof f.prix === 'number' && f.prix > 0)
    if (t.id === 'bien-note') return L.some((f) => typeof f.note === 'number' && (f.nbAvis ?? 0) >= 20)
    return true // la distance existe toujours : c'est nous qui la calculons
  })
}

/**
 * La liste réordonnée. `tri` est UN identifiant ou null (aucun tri actif).
 *
 * Deux invariants, quel que soit le tri :
 *   · les OUVERTS passent devant les fermés — un lieu fermé n'est jamais
 *     la première réponse à « maintenant », même s'il est le moins cher ;
 *   · une adresse SANS la donnée triée passe derrière celles qui l'ont —
 *     l'absence d'un prix n'est pas un petit prix.
 */
export function appliquer(fiches, tri) {
  const L = Array.isArray(fiches) ? fiches.filter(Boolean) : []
  const cle = (f) => {
    if (tri === 'pas-cher') return typeof f.prix === 'number' && f.prix > 0 ? f.prix : 99
    if (tri === 'bien-note') {
      // Minimum 20 avis : un 5,0 sur trois avis ne dit rien. En dessous du
      // seuil, l'adresse n'est pas exclue — elle est classée après.
      return typeof f.note === 'number' && (f.nbAvis ?? 0) >= 20 ? -f.note : 99
    }
    return f.distanceM // « proche », et le défaut sans tri actif
  }
  return [...L].sort((a, b) => {
    const fa = a.ouvert === false ? 1 : 0
    const fb = b.ouvert === false ? 1 : 0
    if (fa !== fb) return fa - fb
    const d = cle(a) - cle(b)
    return d !== 0 ? d : a.distanceM - b.distanceM
  })
}
