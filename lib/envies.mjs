// ⚠️ CE FICHIER EST EN .mjs, ET C'EST VOULU (20 août).
// La table des envies et ses fonctions de correspondance sont testées au
// build par scripts/test-envie-precise.mjs. Un test qui devrait importer
// du TypeScript aurait besoin d'un drapeau expérimental de Node — et ce
// drapeau a fait échouer la construction sur Vercel. Le dépôt a déjà ce
// motif dix fois (latin.mjs, halalScore.mjs, immersionTirage.mjs…) : la
// logique pure vit en .mjs, les types l'accompagnent en .d.mts, et le
// reste de l'application l'importe par lib/envies.ts sans rien changer.
//
// 🍔 « J'AI ENVIE DE… » — traduire une envie humaine en types de cuisine.
//
// Nos fiches villes portent le champ `type` d'OpenStreetMap (texte libre :
// « kebab », « burger, kebab », « american, italian, moroccan »…). Ce
// fichier fait le pont entre ce que dit un voyageur (« un burger ») et ce
// que contient la donnee. Aucun `fs` ici : partage serveur ET navigateur.
//
// LECON DU TERRAIN (test de Mohamed a Marrakech) : le mot « american »
// avait fait passer un restaurant generaliste pour LE burger le plus
// proche. Les mots sont donc separes en deux niveaux : les mots SURS (le
// plat lui-meme) et les mots LARGES (une famille de cuisine qui en sert
// peut-etre). Seuls les mots surs donnent une correspondance certaine.
//
// Honnetete : filtrer par envie ne change RIEN au statut halal. Les lieux
// restent « signalé halal · à vérifier » — on ne promet jamais une chaine
// (McDonald's, Burger King…) comme halal.

/**
 * 🔎 LES REQUÊTES CONCRÈTES D'UNE ENVIE (21 août — « il ne trouve jamais
 * asiatique, le mot clé choisi n'est pas bon je pense, là où je suis il y
 * a plein de sushi »).
 *
 * L'intuition était juste. « restaurant asiatique » est un mot de CATÉGORIE :
 * personne n'appelle son enseigne comme ça, et Google cherche d'abord dans
 * les noms et les descriptions. « sushi », « chinois », « thaï » sont des
 * mots de PLAT — ceux qui figurent réellement sur les devantures.
 *
 * On garde la requête large en premier (elle suffit souvent, et c'est un
 * appel), et on ne déroule les requêtes de plat QUE si l'écran allait
 * rester vide. Le coût suit le besoin.
 */
export const REQUETES_PLAT = {
  asiatique: ['sushi', 'restaurant chinois', 'restaurant thaï', 'restaurant vietnamien'],
  sushi: ['sushi', 'restaurant japonais'],
  pizza: ['pizzeria', 'pizza'],
  burger: ['burger', 'smash burger'],
  kebab: ['kebab', 'grillades turques'],
  poulet: ['poulet grillé', 'chicken', 'rôtisserie'],
  indien: ['restaurant indien', 'biryani', 'tandoori'],
  turc: ['restaurant turc', 'lahmacun', 'pide'],
  maghrebin: ['restaurant marocain', 'couscous', 'tajine'],
  oriental: ['restaurant libanais', 'falafel', 'mezze'],
  poisson: ['poissonnerie restaurant', 'fruits de mer'],
  dessert: ['pâtisserie', 'glacier', 'salon de thé'],
  cafe: ['café', 'boulangerie', 'petit-déjeuner'],
}

export const ENVIES = [
  { id: 'sushi', emoji: '🍣', fr: 'Sushi', en: 'Sushi', motsSurs: ['sushi', 'sashimi', 'maki', 'sushiya'], motsLarges: ['japanese'],
    typesSurs: ['sushi_restaurant'], typesLarges: ['japanese_restaurant', 'asian_restaurant'] },
  { id: 'dessert', emoji: '🍰', fr: 'Dessert', en: 'Dessert', motsSurs: ['pastry', 'patisserie', 'dessert', 'cake', 'gateau', 'glace', 'ice_cream', 'crepe'], motsLarges: ['bakery'],
    typesSurs: ['dessert_shop', 'ice_cream_shop', 'donut_shop', 'bakery'], typesLarges: ['cafe', 'coffee_shop'] },
  { id: 'burger', emoji: '🍔', fr: 'Burger', en: 'Burger', motsSurs: ['burger', 'hamburger'], motsLarges: ['american', 'diner', 'fast_food'],
    typesSurs: ['hamburger_restaurant'], typesLarges: ['fast_food_restaurant', 'american_restaurant'] },
  { id: 'kebab', emoji: '🥙', fr: 'Kebab', en: 'Kebab', motsSurs: ['kebab', 'shawarma', 'doner', 'durum', 'kebap'], motsLarges: ['grill', 'turkish'],
    typesSurs: ['turkish_restaurant'], typesLarges: ['middle_eastern_restaurant', 'fast_food_restaurant', 'meal_takeaway'] },
  { id: 'pizza', emoji: '🍕', fr: 'Pizza', en: 'Pizza', motsSurs: ['pizza', 'pizzeria'], motsLarges: ['italian', 'pasta'],
    typesSurs: ['pizza_restaurant'], typesLarges: ['italian_restaurant'] },
  { id: 'poulet', emoji: '🍗', fr: 'Poulet', en: 'Chicken', motsSurs: ['chicken', 'poulet'], motsLarges: ['fried', 'wings', 'rotisserie'],
    typesSurs: ['chicken_restaurant'], typesLarges: ['fast_food_restaurant', 'barbecue_restaurant'] },
  { id: 'indien', emoji: '🍛', fr: 'Indien', en: 'Indian', motsSurs: ['indian', 'pakistani', 'bangladeshi', 'biryani', 'tandoori', 'curry'], motsLarges: ['nepalese', 'sri_lankan'],
    typesSurs: ['indian_restaurant'], typesLarges: ['asian_restaurant'] },
  { id: 'turc', emoji: '🇹🇷', fr: 'Turc', en: 'Turkish', motsSurs: ['turkish', 'pide', 'lahmacun', 'ottoman'], motsLarges: ['anatolian', 'kebab'],
    typesSurs: ['turkish_restaurant'], typesLarges: ['middle_eastern_restaurant'] },
  { id: 'oriental', emoji: '🌯', fr: 'Oriental', en: 'Middle East', motsSurs: ['lebanese', 'syrian', 'falafel', 'mezze', 'yemeni', 'iraqi', 'palestinian', 'egyptian'], motsLarges: ['arab', 'middle eastern', 'oriental'],
    typesSurs: ['middle_eastern_restaurant', 'lebanese_restaurant'], typesLarges: ['mediterranean_restaurant'] },
  { id: 'maghrebin', emoji: '🍲', fr: 'Maghrébin', en: 'Moroccan', motsSurs: ['moroccan', 'tajine', 'tagine', 'couscous', 'algerian', 'tunisian'], motsLarges: ['berber', 'african'],
    typesSurs: ['moroccan_restaurant', 'african_restaurant'], typesLarges: ['mediterranean_restaurant', 'middle_eastern_restaurant'] },
  { id: 'asiatique', emoji: '🍜', fr: 'Asiatique', en: 'Asian', motsSurs: ['chinese', 'vietnamese', 'thai', 'sushi', 'japanese', 'korean', 'ramen', 'noodle', 'malaysian', 'indonesian', 'wok'], motsLarges: ['asian'],
    typesSurs: ['asian_restaurant', 'chinese_restaurant', 'thai_restaurant', 'vietnamese_restaurant', 'japanese_restaurant', 'korean_restaurant', 'ramen_restaurant', 'sushi_restaurant', 'indonesian_restaurant'], typesLarges: [] },
  { id: 'poisson', emoji: '🐟', fr: 'Poisson', en: 'Seafood', motsSurs: ['seafood', 'fish', 'poisson'], motsLarges: ['grill'],
    typesSurs: ['seafood_restaurant'], typesLarges: [] },
  { id: 'cafe', emoji: '☕', fr: 'Café · petit-déj', en: 'Coffee · breakfast', motsSurs: ['cafe', 'coffee', 'breakfast', 'bakery', 'pastry', 'crepe', 'ice_cream', 'juice', 'tea'], motsLarges: ['dessert', 'sandwich'],
    typesSurs: ['cafe', 'coffee_shop', 'bakery', 'breakfast_restaurant', 'brunch_restaurant'], typesLarges: ['dessert_shop', 'sandwich_shop'] },
]

const sansAccent = (s) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/**
 * Force de la correspondance entre un lieu et une envie :
 *   2 = SUR      — le plat est nomme dans la cuisine principale ou dans le
 *                  nom du lieu (« Pizza Unica », « Istanbul Grill »)
 *   1 = POSSIBLE — plat en etiquette secondaire, ou simple famille de
 *                  cuisine (« american » pour un burger) : dit comme tel
 *   0 = aucun rapport
 */
export function forceEnvie(type, nom, envieId) {
  const envie = ENVIES.find((e) => e.id === envieId)
  if (!envie) return 0
  const tags = type ? sansAccent(type).split(/[,;/]+/).map((t) => t.trim()).filter(Boolean) : []
  const n = nom ? sansAccent(nom) : ''
  // Le nom du lieu nomme le plat : le signal le plus fiable qu'on ait
  if (n && envie.motsSurs.some((m) => m.length >= 4 && n.includes(m))) return 2
  // Cuisine principale = le plat lui-meme
  if (tags.length && envie.motsSurs.some((m) => tags[0].includes(m))) return 2
  // Plat en etiquette secondaire, ou seule la famille de cuisine correspond
  if (tags.some((t) => envie.motsSurs.some((m) => t.includes(m)))) return 1
  if (envie.motsLarges?.length && tags.some((t) => envie.motsLarges.some((m) => t.includes(m)))) return 1
  return 0
}

/**
 * 🔴 LA MÊME QUESTION, POSÉE À UN RÉSULTAT GOOGLE (20 août).
 *
 * « Quand on veut des sushi on doit pas tomber sur des pizzas. » Le défaut
 * venait de ce qu'on envoyait le mot à Google et qu'on affichait TOUT ce
 * qu'il rendait : sur une envie précise, sa recherche textuelle complète
 * volontiers une liste courte avec des restaurants du quartier qui n'ont
 * rien à voir. Rien ne relisait la réponse.
 *
 * Ici on la relit, avec ce que Places nous donne de plus solide : le TYPE
 * du lieu (`pizza_restaurant`, `sushi_restaurant`…).
 *   2 = le type du plat, ou le plat nommé dans l'enseigne — certain
 *   1 = une famille voisine (japonais pour des sushi) — possible
 *   0 = aucun rapport → l'adresse n'est pas montrée
 */
export function forceEnvieGoogle(primaryType, types, nom, envieId) {
  const envie = ENVIES.find((e) => e.id === envieId)
  if (!envie) return 0
  const tousTypes = [primaryType, ...(types ?? [])].filter(Boolean)
  if (envie.typesSurs?.length && tousTypes.some((t) => envie.typesSurs.includes(t))) return 2
  const n = nom ? sansAccent(nom) : ''
  if (n && envie.motsSurs.some((m) => m.length >= 4 && n.includes(m))) return 2
  if (envie.typesLarges?.length && tousTypes.some((t) => envie.typesLarges.includes(t))) return 1
  // Dernier recours : le mot de la famille dans l'enseigne (« Istanbul
  // Grill » pour un kebab). Jamais une certitude, donc jamais un 2.
  if (n && envie.motsLarges?.some((m) => m.length >= 5 && n.includes(m))) return 1
  return 0
}

/** Compatibilite : y a-t-il un rapport, meme faible ? */
export function correspondEnvie(type, envieId) {
  return forceEnvie(type, undefined, envieId) > 0
}

export function envieById(id) {
  return ENVIES.find((e) => e.id === id) ?? null
}

// ── Niveau de signalement halal (tag OSM `diet:halal`) ────────────────
// HONNETETE : OSM emploie le mot « certified », mais nous n'avons verifie
// AUCUNE certification. On ne reprend donc jamais ce mot : on decrit ce
// que dit la source, et on invite toujours a verifier sur place.
export function niveauHalal(v, en = false) {
  switch (v) {
    case 'only':
      return { texte: en ? 'all halal here · reported' : 'tout est halal ici · signalé', fort: true }
    case 'yes':
    case 'high':
    case 'certified':
      return { texte: en ? 'reported halal · to verify' : 'signalé halal · à vérifier', fort: true }
    case 'likely':
      return { texte: en ? 'likely halal · to verify' : 'halal probable · à vérifier', fort: false }
    default:
      return null
  }
}
