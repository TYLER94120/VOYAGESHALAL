// Normalise les types de cuisine BRUTS d'OpenStreetMap (« seafood, italian
// pizza, beef bowl, kebab… ») vers nos ~12 catégories éditoriales propres.
// Évite l'explosion de pastilles de filtre illisibles sur les fiches villes.

const RULES: [RegExp, string][] = [
  [/kebab|doner|döner|grill|barbecue|bbq|shawarma|ocakba|souvlaki|gyros|rotisserie|roast/i, 'Grillades & Kebab'],
  [/seafood|fish|poisson|balik|balık/i, 'Fruits de mer'],
  [/pizza|italian|pasta|italien/i, 'Pizza & Italien'],
  [/burger|fast.?food|fried.?chicken|chicken|sandwich|tacos/i, 'Burgers & Fast-food'],
  [/japanese|sushi|ramen|asian|chinese|korean|thai|vietnam|noodle|wok|beef.?bowl/i, 'Japonais & Asiatique'],
  [/indian|pakistani|biryani|bangladesh|curry|tandoori/i, 'Indien & Pakistani'],
  [/lebanese|arab|syrian|oriental|levant|falafel|hummus|mezze|egyptian|yemen/i, 'Libanais & Levant'],
  [/coffee|café|cafe|tea|breakfast|brunch|patisserie|pâtisserie|dessert|bakery|boulangerie|ice.?cream|juice/i, 'Pâtisserie & Café'],
  [/vegetarian|vegan|healthy|salad|bio/i, 'Végétarien & Healthy'],
  [/fine.?dining|gastronom|french|steak.?house/i, 'Gastronomique'],
  [/marocain|moroccan|couscous|tajine/i, 'Marocain'],
  [/turkish|turc|anatol|ottoman/i, 'Traditionnel local'],
  [/local|regional|traditional|traditionnel|home|lokanta|pide|köfte|kofte/i, 'Traditionnel local'],
]

// Ordre d'affichage fixe des pastilles de filtre (épuré, stable).
export const CATEGORY_ORDER = [
  'Restaurant', 'Traditionnel local', 'Grillades & Kebab', 'Fruits de mer', 'Pizza & Italien',
  'Burgers & Fast-food', 'Japonais & Asiatique', 'Indien & Pakistani',
  'Libanais & Levant', 'Marocain', 'Végétarien & Healthy', 'Pâtisserie & Café',
  'Gastronomique',
]

const KNOWN = new Set(CATEGORY_ORDER)

/**
 * Catégorie éditoriale d'un restaurant à partir de son type brut.
 *
 * 🔴 DÉFAUT CORRIGÉ LE 15 AOÛT. Mohamed, sur Tirana : « "La Famiglia -
 * Pizzeri - Kreperi" est classé "Traditionnel local". Le classement est
 * décoratif : il ne correspond à rien. »
 *
 * DEUX CAUSES, toutes deux ici :
 *   1. « Traditionnel local » servait de FOURRE-TOUT — type vide ou type
 *      non reconnu, tout y tombait. Une pizzeria dont le type est
 *      « Restaurant halal » n'est pas de la cuisine locale : elle est
 *      simplement inconnue, et « Restaurant » est la réponse honnête.
 *   2. L'ordre des règles décidait au hasard des mots présents. Le type
 *      « souvlaki, pizza, burger, chicken » tombait sur /pizza/ et devenait
 *      « Pizza & Italien » alors que le premier mot annonce des grillades.
 *      Le PREMIER type déclaré compte davantage que les suivants — c'est
 *      celui que le restaurateur a mis en tête.
 */
export function cuisineCategory(type?: string): string {
  const t = (type || '').trim()
  // Type absent : on ne devine pas une cuisine, on dit « Restaurant ».
  if (!t) return 'Restaurant'
  if (KNOWN.has(t)) return t // déjà une catégorie curée
  // Le premier type déclaré d'abord, puis la chaîne entière : « souvlaki,
  // pizza… » se classe en grillades, pas en italien.
  const premier = t.split(/[,;/]/)[0].trim()
  for (const [re, cat] of RULES) if (premier && re.test(premier)) return cat
  for (const [re, cat] of RULES) if (re.test(t)) return cat
  // Rien de reconnu : « Restaurant » est vrai, « Traditionnel local » est
  // une invention.
  return 'Restaurant'
}
