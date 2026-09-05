// 🇫🇷 « À LE CAIRE » — la préposition française, à un seul endroit.
//
// Trouvé le 4 septembre en vérifiant les titres servis après le
// rafraîchissement automatique de la base OSM :
//
//   titre  Où prier à Le Caire : 463 lieux de prière, restos halal
//   desc   33 adresses halal et 106 hôtels à Le Caire, horaires…
//   h1     Où prier à Le Caire : 463 lieux de prière et 33 adresses halal
//
// Trois surfaces servies, la même faute. En français, « à » se contracte
// avec l'article masculin : au Caire, au Cap. Le féminin, lui, ne bouge
// pas — « à La Mecque », « à La Havane », « à La Haye » sont corrects, et
// une règle trop large les casserait.
//
// ⚠️ Deux villes seulement sur 354 (Le Caire, Le Cap) — mais elles portent
// la faute dans le TITRE, la seule ligne que Google affiche, et Le Caire
// est une destination majeure.
//
// Le 28 août, la même faute sur les PAYS (« en Maroc », « en Japon ») a été
// réglée en retirant la préposition du gabarit. Ici on ne peut pas : « Où
// prier Le Caire » ne se dit pas. Il faut donc la contracter — et le faire
// à UN SEUL endroit, parce que « à ${nom} » est écrit dans quinze gabarits
// (titre, description, h1, h2, FAQ, liens internes). C'est exactement la
// forme de défaut des quatre nuits précédentes : une règle vraie quelque
// part et fausse ailleurs.
//
// Le site anglais n'est pas concerné : il écrit « in Cairo », « in Cape
// Town » — vérifié servi sur les deux domaines.

/** L'article détaché en tête de nom, s'il y en a un. */
const ARTICLE = /^(Le|La|Les|L')\s+/

/**
 * « à » + nom de ville, contracté comme il se doit.
 *
 *   aVille('Le Caire')   → 'au Caire'
 *   aVille('Les Sables') → 'aux Sables'
 *   aVille('La Mecque')  → 'à La Mecque'   (le féminin ne se contracte pas)
 *   aVille('Paris')      → 'à Paris'
 *   aVille('Lahore')     → 'à Lahore'      (« La » collé n'est pas un article)
 */
export function aVille(nom) {
  const n = String(nom ?? '').trim()
  if (!n) return 'à'
  const m = n.match(ARTICLE)
  if (!m) return `à ${n}`
  const reste = n.slice(m[0].length)
  const art = m[1]
  if (art === 'Le') return `au ${reste}`
  if (art === 'Les') return `aux ${reste}`
  // « La » et « L' » : aucune contraction en français.
  return `à ${n}`
}

/**
 * « de » + nom de ville, même règle — utile pour « les mosquées du Caire ».
 * Fourni ici pour que la deuxième contraction ne parte pas vivre ailleurs.
 */
export function deVille(nom) {
  const n = String(nom ?? '').trim()
  if (!n) return 'de'
  const m = n.match(ARTICLE)
  if (!m) return `de ${n}`
  const reste = n.slice(m[0].length)
  const art = m[1]
  if (art === 'Le') return `du ${reste}`
  if (art === 'Les') return `des ${reste}`
  return `de ${n}`
}
