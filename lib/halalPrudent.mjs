// 🔴🔴 LA COCHE VERTE SE MÉRITE.
//
// DÉFAUT TROUVÉ PAR MOHAMED SUR TIRANA, 15 août :
//   « "Grill & Souvlaki Stop" est marqué "✓ signalé halal · OSM". Le
//     souvlaki, dans les Balkans et en Grèce, est traditionnellement du
//     PORC. C'est exactement le danger qu'on s'est juré d'éviter : une
//     déclaration OpenStreetMap non vérifiée, affichée avec une coche
//     verte, sur un établissement dont le nom même évoque un plat de porc. »
//
// Et le signal était DANS NOS PROPRES DONNÉES : la fiche portait
// `type: "souvlaki, pizza, burger, chicken"` et `halalConfidence: "yes"`.
// Nous avions l'avertissement sous les yeux et nous l'ignorions.
//
// ════════ CE QUE CE FICHIER FAIT, ET CE QU'IL NE FAIT PAS ════════
//
// Il ne décide PAS qu'un lieu est haram — nous n'en savons rien, et le dire
// serait aussi malhonnête que la coche verte. Il décide seulement de ce
// qu'on a le droit d'AFFICHER :
//
//   · vérifié     → une source solide : notre communauté, un relevé maison.
//                   Seul cas où la coche verte apparaît.
//   · signalé     → OpenStreetMap dit « halal », et rien ne contredit.
//                   Mention honnête, sans coche : « signalé halal — à
//                   confirmer sur place ».
//   · à-confirmer → un mot à risque, ou une déclaration faible. Gris, sans
//                   coche : « statut halal non confirmé — à vérifier ».
//
// Trois états, jamais deux. « Dans le doute, on n'affiche pas » vaut pour la
// COCHE, pas pour le lieu : on garde l'adresse, on retire la promesse.
//
// ⚠️ Le sens de la lecture compte : on cherche les mots à risque dans le NOM
// ET dans le champ `type` (la liste de cuisines d'OpenStreetMap). C'est là
// que « souvlaki » était écrit.

/**
 * Les mots qui déclenchent une vérification renforcée. Liste dictée par
 * Mohamed, augmentée des plats de porc les plus courants en Europe.
 * Frontières de mots : « bar » ne doit pas attraper « barbecue », et
 * « porc » ne doit pas attraper « porcelaine ».
 */
export const MOTS_A_RISQUE = [
  'souvlaki', 'gyros', 'porc', 'pork', 'jambon', 'bacon', 'charcuterie',
  'tapas', 'brasserie', 'taverna', 'tavern', 'schnitzel', 'prosciutto',
  'chorizo', 'saucisson', 'lardon', 'pancetta', 'salami', 'mortadelle',
  'sausage', 'hot dog', 'hotdog', 'bratwurst', 'ham',
]
const MOTIF_RISQUE = new RegExp(`(?:^|[^\\p{L}])(?:${MOTS_A_RISQUE.map((m) => m.replace(/ /g, '[ -]?')).join('|')})(?:[^\\p{L}]|$)`, 'iu')

/** Les marqueurs d'alcool : un lieu qui en sert ne porte jamais de coche. */
const MOTIF_ALCOOL = /(?:^|[^\p{L}])(?:bar|pub|wine|vin|biere|bière|beer|cocktail|brewery|brasserie|alcool|alcohol|spirits)(?:[^\p{L}]|$)/iu

/**
 * « Bar » n'est pas toujours un débit de boissons. Un « juice bar », un
 * « fish bar » anglais (friterie), un « salad bar » ne servent pas
 * d'alcool — les rétrograder ferait perdre une information juste sur des
 * lieux honnêtes, et la prudence excessive finit par ne plus rien dire.
 * Ces tournures-là sont donc neutralisées AVANT la recherche du motif.
 * On ne neutralise que des expressions exactes et fermées : jamais « bar »
 * seul, jamais un motif large.
 */
const BARS_SANS_ALCOOL = /\b(?:juice|jus|fish|salad|salade|coffee|caf[ée]|snack|sushi|milk|lait|smoothie|shawarma|kebab|grill|sandwich|tea|th[ée]|dessert|ice cream|oyster|poke|noodle|breakfast)[ -]bars?\b/gi

/** Un mot à risque est-il présent dans ce que nous savons du lieu ? */
export function motARisque(nom, type) {
  const brut = `${nom ?? ''} ${type ?? ''}`
  // On retire d'abord les « juice bar » et « fish bar » : ce ne sont pas
  // des débits de boissons, et les rétrograder serait de la prudence qui
  // ne protège personne.
  const texte = brut.replace(BARS_SANS_ALCOOL, ' ')
  return MOTIF_RISQUE.test(texte) || MOTIF_ALCOOL.test(texte)
}

/**
 * Le statut halal AFFICHABLE. Rend l'un des trois états, jamais autre chose.
 *
 * `source` : 'community' | 'maison' | 'osm' | 'google' | …
 * `halalConfidence` : ce qu'OpenStreetMap déclare — 'yes' | 'likely' | …
 */
export function verdictHalal({ nom, type, halalConfidence, source, verifie }) {
  // 1. Ce que NOUS avons vérifié passe avant tout — et c'est le seul cas
  //    où la coche verte est méritée.
  if (verifie === true || source === 'community' || source === 'maison') {
    return { etat: 'verifie', coche: true }
  }
  // 2. Un mot à risque ferme la porte à la coche, quoi qu'OSM déclare.
  //    C'est exactement le cas « Grill & Souvlaki Stop ».
  if (motARisque(nom, type)) {
    return { etat: 'a-confirmer', coche: false, motif: 'mot-a-risque' }
  }
  // 3. Une déclaration OSM franche, sans contradiction : signalé, pas coché.
  if (halalConfidence === 'yes' || halalConfidence === 'only') {
    return { etat: 'signale', coche: false }
  }
  // 4. Tout le reste : on ne sait pas, et on le dit.
  return { etat: 'a-confirmer', coche: false }
}

/** La phrase affichée, mot pour mot. Jamais reformulée ailleurs. */
export function phraseHalal(etat, en = false) {
  if (etat === 'verifie') return en ? '✓ Verified halal — checked by us' : '✓ Halal vérifié — contrôlé par nous'
  if (etat === 'signale') return en ? 'Reported halal — confirm on site' : 'Signalé halal — à confirmer sur place'
  return en ? 'Halal status unconfirmed — check on site' : 'Statut halal non confirmé — à vérifier sur place'
}

// ════════════════════════════════════════════════════════════════════
// 🏷️ LES CATÉGORIES VIENNENT DES TYPES, PAS D'UNE DEVINETTE SUR LE NOM.
//
// Défaut de Mohamed : « "La Famiglia - Pizzeri - Kreperi" est classé
// "Traditionnel local". "Grill & Souvlaki Stop" est classé "Pizza &
// Italien". Le classement est décoratif : il ne correspond à rien. »
//
// Le champ `type` d'OpenStreetMap est une liste de cuisines en clair
// (« pizza, regional, sandwich »). On la lit dans l'ORDRE des priorités —
// le premier mot reconnu gagne — et quand rien n'est reconnu, on écrit
// « Restaurant » plutôt que d'inventer une famille.
// ════════════════════════════════════════════════════════════════════

const FAMILLES = [
  ['Kebab & grillades', /\bkebab|shawarma|doner|döner|grill|barbecue|rotisserie|souvlaki|gyros/i],
  ['Pizza & italien', /\bpizza|italian|italien|pasta|kreperi|crêperie|creperie/i],
  ['Burgers & snacks', /\bburger|hot ?dog|sandwich|fast food|friture|fries|snack/i],
  ['Cuisine turque', /\bturkish|turc|turque|ottoman/i],
  ['Cuisine orientale', /\blebanese|liban|arab|syrian|syrien|moroccan|marocain|couscous|tajine|mezze|middle eastern/i],
  ['Cuisine asiatique', /\bindian|indien|chinese|chinois|thai|thaï|japanese|sushi|ramen|wok|noodle|vietnam/i],
  ['Poisson & fruits de mer', /\bfish|seafood|poisson|fruits de mer/i],
  ['Café & pâtisserie', /\bcoffee|caf[ée]|dessert|pastry|p[âa]tisserie|bakery|boulangerie|ice cream|glace/i],
  ['Cuisine locale', /\bregional|balkan|local|traditional|traditionnel/i],
  ['Cuisine internationale', /\binternational|mediterranean|m[ée]diterran|european|fusion/i],
]

/**
 * La famille d'un lieu d'après son champ `type`. `null` quand on ne
 * reconnaît rien — l'appelant écrit alors « Restaurant », qui est vrai.
 */
export function familleDepuisType(type) {
  const t = String(type ?? '')
  if (!t.trim()) return null
  for (const [nom, motif] of FAMILLES) if (motif.test(t)) return nom
  return null
}
