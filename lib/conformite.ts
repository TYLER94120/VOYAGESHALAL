// 🕌 CONFORMITE — un lieu propose sur VoyagesHalal doit pouvoir accueillir
// un musulman, sa femme et ses enfants sans gene.
//
// Pourquoi ce fichier existe : notre annuaire vient d'OpenStreetMap, qui
// reference tout, y compris des bars, des lounges a chicha et des boites de
// nuit. Un « Restaurant & Lounge » avec bar et narguile peut porter le tag
// halal sur sa cuisine ET rester un endroit ou nous n'envoyons personne.
// Servir de la nourriture halal ne suffit pas : le LIEU compte aussi.
//
// Deux niveaux, pour ne pas jeter des adresses correctes par exces :
//  · MOTS_EXCLUS  — l'activite elle-meme est incompatible (bar, chicha,
//    boite, casino, alcool). Ecarte toujours, quel que soit le tag halal.
//  · MOTS_DOUTE   — l'enseigne est ambigue selon les pays (bistro, taverne,
//    brasserie, rooftop, club). Ecarte SAUF si la fiche indique un halal
//    affirme (« only » / « yes »), auquel cas on garde et on laisse le
//    voyageur verifier.
//
// La comparaison se fait sur des MOTS ENTIERS : « bar » ne doit pas
// exclure « barbecue », ni « club » exclure un « club sandwich ».

const MOTS_EXCLUS = [
  // alcool
  'bar', 'pub', 'brewery', 'beer', 'biere', 'bieres', 'wine', 'wines', 'vins',
  'whisky', 'whiskey', 'rhum', 'rum', 'vodka', 'mojito', 'cocktail', 'cocktails',
  'alcool', 'alcohol', 'spirits', 'taverne', 'tavern', 'speakeasy',
  'brewpub', 'winery', 'cave a vin', 'aperitif', 'happy hour',
  // chicha / narguile
  'shisha', 'chicha', 'hookah', 'narguile', 'narghile', 'sheesha',
  // nuit / jeux
  'nightclub', 'night club', 'discotheque', 'disco', 'karaoke', 'cabaret',
  'casino', 'strip', 'lounge',
]

// Volontairement COURT : le test sur les 16 512 fiches a montre que
// « club », « bistro » et « rooftop » ecartaient a tort de vrais
// restaurants (« Delhi Club », « OM Indian Bistro », « Taj View Rooftop »).
// Ne restent que les enseignes ou l'alcool est la norme du format.
const MOTS_DOUTE = ['brasserie', 'tapas']

// « bar » designe aussi un comptoir de nourriture : « snack bar »,
// « couscous bar », « salad bar » n'ont rien a voir avec l'alcool.
const BAR_ALIMENTAIRE = [
  'snack', 'salad', 'salade', 'juice', 'jus', 'couscous', 'coffee', 'cafe',
  'tea', 'the', 'milk', 'sandwich', 'kebab', 'sushi', 'noodle', 'pizza',
  'burger', 'grill', 'lait', 'smoothie', 'crepe',
]

const sansAccent = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

function contientMot(blob: string, mot: string): boolean {
  // mots entiers uniquement (evite barbecue → bar, barista → bar)
  const m = mot.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
  return new RegExp(`(?<![a-z0-9])${m}(?![a-z0-9])`).test(blob)
}

export interface Verdict {
  ok: boolean
  /** mot qui a declenche l'exclusion (pour les journaux et l'admin) */
  motif?: string
}

/**
 * Ce lieu a-t-il sa place sur un site de voyage halal ?
 * @param nom     nom de l'etablissement
 * @param cuisine tag cuisine brut (OSM)
 * @param halal   halalConfidence de la fiche (only | yes | high | certified | likely)
 */
export function estConforme(nom?: string, cuisine?: string, halal?: string): Verdict {
  const blob = sansAccent(`${nom ?? ''} ${cuisine ?? ''}`)
  if (!blob.trim()) return { ok: true }
  for (const m of MOTS_EXCLUS) {
    if (!contientMot(blob, m)) continue
    // exception : comptoir de nourriture (« snack bar », « couscous bar »)
    if (m === 'bar' && BAR_ALIMENTAIRE.some((f) => new RegExp(`${f}\\s*-?\\s*bar(?![a-z0-9])`).test(blob))) continue
    return { ok: false, motif: m }
  }
  const halalAffirme = halal === 'only' || halal === 'yes' || halal === 'certified' || halal === 'high'
  if (!halalAffirme) {
    for (const m of MOTS_DOUTE) {
      if (contientMot(blob, m)) return { ok: false, motif: m }
    }
  }
  return { ok: true }
}

/** Raccourci booleen */
export function conforme(nom?: string, cuisine?: string, halal?: string): boolean {
  return estConforme(nom, cuisine, halal).ok
}
