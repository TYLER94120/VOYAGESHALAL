// 🗺️ RECONNAÎTRE UNE VILLE DANS UNE PHRASE ÉCRITE LIBREMENT.
//
// Ordre de Mohamed, 16 août : « Il y a DEUX barres de recherche sur
// l'accueil : "Dis-moi ce que tu cherches" et "Istanbul, Marrakech,
// Dubaï…". C'est le même geste, deux fois, et c'est ce qui prend toute la
// hauteur. UNE SEULE BARRE désormais. Elle comprend les deux. »
//
// Trois lectures possibles d'une même phrase :
//   · « un kebab pas loin »        → aucune ville : on cherche autour de moi
//   · « Istanbul »                 → rien d'autre que la ville : on ouvre son guide
//   · « une pâtisserie à Tirana »  → un besoin ET une ville : on cherche là-bas
//
// POURQUOI CETTE LECTURE EST LOCALE, comme `lireDemande`. Elle est
// instantanée, elle marche sans réseau, elle ne coûte rien — et surtout
// elle est VÉRIFIABLE : une ville n'est reconnue que si elle existe
// réellement dans nos 354 fiches. Un modèle, lui, inventerait volontiers
// « Ourika » ou « Djerba-Ville » et nous enverrions le visiteur sur une
// page 404. Ici, si la ville n'est pas dans le fichier, elle n'existe pas.
//
// ⚠️ CE QU'ELLE NE FAIT JAMAIS : deviner. Dans le doute elle rend
// `ambigu`, et c'est le VISITEUR qui tranche en un appui — jamais nous.
//
// ════════ POURQUOI CE FICHIER EST EN .mjs ET NON EN .ts ════════
//
// Même raison que `lib/alcool.mjs` : la règle doit pouvoir tourner dans
// un test Node lancé AVANT le build, sans compilateur. Les données (les
// 354 villes) sont INJECTÉES par l'appelant plutôt qu'importées ici — le
// test peut ainsi vérifier la logique sur une poignée de villes choisies,
// et l'application lui passe le fichier complet.

/** Minuscules, sans accents, ponctuation en espaces. */
export function normaliser(s) {
  return String(s)
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

/**
 * Des noms de villes qui sont AUSSI des mots courants en français ou en
 * anglais. « a nice place to eat » ne désigne pas Nice ; « un porto »
 * n'est pas Porto ; « des gênes » n'est pas Gênes. Pour celles-là on
 * exige une préposition explicite (« à Nice ») ou une phrase qui ne
 * contient rien d'autre. C'est la même prudence que le filtre alcool :
 * dans le doute, on ne bascule pas.
 */
export const AMBIGU = new Set([
  'nice', 'split', 'porto', 'genes', 'gand', 'damas', 'lima', 'palma',
  'faro', 'goa', 'safi', 'taza', 'bali', 'rome', 'milan', 'bath',
])

/** Prépositions qui désignent sans ambiguïté un lieu, FR et EN. */
const PREPOSITION = /(?:^| )(?:a|au|aux|en|vers|sur|pour|dans|de|du|in|at|to|near|around|for)$/

/**
 * Pour les noms ambigus SEULEMENT : est-ce que la phrase D'ORIGINE
 * désigne vraiment un lieu ?
 *
 * Le piège trouvé au test : une fois normalisé, « à » devient « a », donc
 * « a nice place to eat » a exactement la forme de « à Nice place… ». La
 * préposition ne suffit donc pas à trancher. Deux indices le font, et ils
 * survivent tous les deux à la façon dont les gens écrivent vraiment :
 *   · la majuscule du nom propre — « à Nice », « in Nice » ;
 *   · l'accent de la préposition française — « à nice » sans majuscule.
 * Aucun des deux n'apparaît dans « a nice place to eat ».
 */
export function designeUnLieu(phraseOrigine, nom) {
  const echappe = nom.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  // Majuscule initiale conservée : c'est un nom propre, pas un adjectif.
  if (new RegExp(`(^|[^\\p{L}])${echappe}([^\\p{L}]|$)`, 'u').test(phraseOrigine)) return true
  // « à nice », « À Nice » : l'accent ne laisse aucun doute.
  return new RegExp(`\\b[àÀ]\\s+${echappe}([^\\p{L}]|$)`, 'iu').test(phraseOrigine)
}

/** Index de `mot` dans `texte`, aux frontières de mots uniquement.
 *  « paris » ne doit jamais sortir de « parisienne ». */
export function trouverMot(texte, mot) {
  let i = texte.indexOf(mot)
  while (i >= 0) {
    const avantOk = i === 0 || texte[i - 1] === ' '
    const finOk = i + mot.length === texte.length || texte[i + mot.length] === ' '
    if (avantOk && finOk) return i
    i = texte.indexOf(mot, i + 1)
  }
  return -1
}

/**
 * Prépare l'index une fois pour toutes : le plus long nom d'abord, pour
 * que « kuala lumpur » gagne contre « kuala » et « new york » contre
 * « york ».
 */
export function indexerVilles(villes) {
  return villes
    .map((v) => ({ slug: v.slug, nom: v.nom, lat: v.lat, lng: v.lng, cle: normaliser(v.nom) }))
    .filter((e) => e.cle.length >= 3)
    .sort((a, b) => b.cle.length - a.cle.length)
}

/** Cherche une ville dans la phrase. `null` quand il n'y en a pas — le
 *  cas le plus fréquent, et celui où l'on cherche autour de soi. */
export function lireVille(phrase, index) {
  const p = normaliser(phrase)
  if (!p) return null
  for (const e of index) {
    const i = trouverMot(p, e.cle)
    if (i < 0) continue
    const avant = p.slice(0, i).trim()
    const apres = p.slice(i + e.cle.length).trim()
    const explicite = PREPOSITION.test(' ' + avant)
    const reste = [avant.replace(PREPOSITION, '').trim(), apres].filter(Boolean).join(' ').trim()
    // Un nom court ou ambigu ne compte que s'il est explicitement désigné
    // ou seul : sinon on préfère chercher autour du visiteur.
    if (AMBIGU.has(e.cle) && reste && !designeUnLieu(phrase, e.nom)) continue
    if (e.cle.length < 4 && !explicite && reste) continue
    return { slug: e.slug, nom: e.nom, lat: e.lat, lng: e.lng, seule: reste === '', explicite, reste }
  }
  return null
}

/**
 * Ce que la barre unique doit FAIRE de la phrase. Trois issues, et une
 * quatrième — `ambigu` — où l'on ne tranche pas à la place du visiteur :
 * on lui propose les deux en un appui, comme demandé.
 */
export function lireIntention(phrase, index) {
  const ville = lireVille(phrase, index)
  if (!ville) return { quoi: 'autour' }
  if (ville.seule) return { quoi: 'guide', ville }
  if (ville.explicite) return { quoi: 'dans-ville', ville }
  // Une ville citée sans préposition au milieu d'un besoin
  // (« kebab Istanbul ») : les deux lectures se défendent. On demande.
  return { quoi: 'ambigu', ville }
}
