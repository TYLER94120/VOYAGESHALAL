// 🍔 « J'AI ENVIE DE… » — traduire une envie humaine en types de cuisine.
//
// Nos fiches villes portent le champ `type` d'OpenStreetMap (texte libre :
// « kebab », « burger, kebab », « indian, pakistanese »…). Ce fichier fait
// le pont entre ce que dit un voyageur (« un burger ») et ce que contient
// la donnee. Aucun `fs` ici : le module est partage serveur ET navigateur.
//
// Honnetete : filtrer par envie ne change RIEN au statut halal. Les lieux
// restent « signalé halal · à vérifier » — on ne promet jamais une chaine
// (McDonald's, Burger King…) comme halal : on propose le BURGER halal le
// plus proche parmi les adresses signalees.

export interface Envie {
  id: string
  emoji: string
  fr: string
  en: string
  /** mots-cles cherches dans le champ `type` (minuscule, sans accent) */
  mots: string[]
}

export const ENVIES: Envie[] = [
  { id: 'burger', emoji: '🍔', fr: 'Burger', en: 'Burger', mots: ['burger', 'hamburger', 'american'] },
  { id: 'kebab', emoji: '🥙', fr: 'Kebab', en: 'Kebab', mots: ['kebab', 'shawarma', 'doner', 'grill'] },
  { id: 'pizza', emoji: '🍕', fr: 'Pizza', en: 'Pizza', mots: ['pizza', 'italian', 'pasta'] },
  { id: 'poulet', emoji: '🍗', fr: 'Poulet', en: 'Chicken', mots: ['chicken', 'poulet', 'fried'] },
  { id: 'indien', emoji: '🍛', fr: 'Indien', en: 'Indian', mots: ['indian', 'pakistani', 'nepalese', 'bangladeshi', 'curry', 'biryani', 'tandoori'] },
  { id: 'turc', emoji: '🇹🇷', fr: 'Turc', en: 'Turkish', mots: ['turkish', 'ottoman', 'anatolian', 'pide', 'lahmacun'] },
  { id: 'oriental', emoji: '🌯', fr: 'Oriental', en: 'Middle East', mots: ['lebanese', 'syrian', 'arab', 'middle eastern', 'mezze', 'falafel', 'egyptian', 'palestinian', 'yemeni', 'iraqi'] },
  { id: 'maghrebin', emoji: '🍲', fr: 'Maghrébin', en: 'Moroccan', mots: ['moroccan', 'tajine', 'tagine', 'couscous', 'algerian', 'tunisian', 'berber'] },
  { id: 'asiatique', emoji: '🍜', fr: 'Asiatique', en: 'Asian', mots: ['chinese', 'vietnamese', 'thai', 'asian', 'sushi', 'japanese', 'noodle', 'ramen', 'korean', 'malaysian', 'indonesian'] },
  { id: 'poisson', emoji: '🐟', fr: 'Poisson', en: 'Seafood', mots: ['seafood', 'fish', 'poisson'] },
  { id: 'cafe', emoji: '☕', fr: 'Café · petit-déj', en: 'Coffee · breakfast', mots: ['cafe', 'coffee', 'breakfast', 'bakery', 'pastry', 'crepe', 'dessert', 'ice_cream', 'juice', 'tea'] },
]

const sansAccent = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/**
 * Force de la correspondance entre un lieu et une envie :
 *   2 = signal FORT  — la cuisine principale (1er tag) correspond, ou le nom
 *                      du lieu le dit (« Pizza Unica », « Istanbul Grill »)
 *   1 = signal FAIBLE — l'envie n'apparait qu'en tag secondaire
 *                      (« asian, kebab » pour une envie d'asiatique)
 *   0 = aucun rapport
 * On sert d'abord les signaux forts : mieux vaut un vrai burger a 1 km
 * qu'un « burger » en 3e etiquette a 200 m.
 */
export function forceEnvie(type: string | undefined, nom: string | undefined, envieId: string): 0 | 1 | 2 {
  const envie = ENVIES.find((e) => e.id === envieId)
  if (!envie) return 0
  const tags = type ? sansAccent(type).split(/[,;/]+/).map((t) => t.trim()).filter(Boolean) : []
  // Le nom parle : on n'accepte que des mots assez longs pour etre surs
  const n = nom ? sansAccent(nom) : ''
  if (n && envie.mots.some((m) => m.length >= 5 && n.includes(m))) return 2
  if (tags.length && envie.mots.some((m) => tags[0].includes(m))) return 2
  if (tags.some((t) => envie.mots.some((m) => t.includes(m)))) return 1
  return 0
}

/** Compatibilite : y a-t-il un rapport, meme faible ? */
export function correspondEnvie(type: string | undefined, envieId: string): boolean {
  return forceEnvie(type, undefined, envieId) > 0
}

export function envieById(id: string | null | undefined): Envie | null {
  return ENVIES.find((e) => e.id === id) ?? null
}
