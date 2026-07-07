// Normalise les types de cuisine BRUTS d'OpenStreetMap (« seafood, italian
// pizza, beef bowl, kebab… ») vers nos ~12 catégories éditoriales propres.
// Évite l'explosion de pastilles de filtre illisibles sur les fiches villes.

const RULES: [RegExp, string][] = [
  [/kebab|doner|döner|grill|barbecue|bbq|shawarma|ocakba/i, 'Grillades & Kebab'],
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
  'Traditionnel local', 'Grillades & Kebab', 'Fruits de mer', 'Pizza & Italien',
  'Burgers & Fast-food', 'Japonais & Asiatique', 'Indien & Pakistani',
  'Libanais & Levant', 'Marocain', 'Végétarien & Healthy', 'Pâtisserie & Café',
  'Gastronomique',
]

const KNOWN = new Set(CATEGORY_ORDER)

/** Catégorie éditoriale d'un restaurant à partir de son type brut. */
export function cuisineCategory(type?: string): string {
  const t = (type || '').trim()
  if (!t) return 'Traditionnel local'
  if (KNOWN.has(t)) return t // déjà une catégorie curée
  for (const [re, cat] of RULES) if (re.test(t)) return cat
  return 'Traditionnel local'
}
