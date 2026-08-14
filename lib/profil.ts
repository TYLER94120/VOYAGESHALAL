// 👤 « LE SITE ME CONNAÎT » — le profil qui se souvient.
//
// Ordre de Mohamed, 16 août : « Je veux qu'il sache répondre à "je sors de
// la salle de sport, je veux manger sain et protéiné", "je suis végane",
// "je ne mange pas de gluten". Et qu'il sache y répondre À TOKYO COMME À
// MARSEILLE. Le site ne me demande pas ce que je veux manger, il sait
// déjà comment je mange. »
//
// ════════ VIE PRIVÉE : NON NÉGOCIABLE ════════
//
// Ce profil vit dans le TÉLÉPHONE (localStorage), jamais sur un serveur.
// Aucun compte, aucune synchronisation, rien qui parte chez nous. Un
// régime alimentaire touche parfois à la santé — un végétarien qui l'est
// pour raison médicale, une allergie —, et ces choses-là ne se stockent
// pas chez un tiers. « Oublier tout » efface réellement la clé.
//
// C'est aussi ce qui rend la fonction possible sans compte : le sur
// mesure ne doit pas se payer d'une inscription.

export type Regime = 'aucun' | 'vegane' | 'vegetarien' | 'pescetarien'
export type Objectif = 'aucun' | 'proteine' | 'leger' | 'pas-cher'

export interface Profil {
  regime: Regime
  sansGluten: boolean
  sansLactose: boolean
  objectif: Objectif
  /** Ce que je ne mange pas, en toutes lettres. Jamais interprété comme
   *  une affirmation sur un lieu — seulement comme une préférence. */
  exclusions: string
  /** « Je sors souvent de la salle de sport » → le protéiné remonte tout
   *  seul, sans que le visiteur le redemande. */
  habitueSport: boolean
}

export const PROFIL_VIDE: Profil = {
  regime: 'aucun', sansGluten: false, sansLactose: false,
  objectif: 'aucun', exclusions: '', habitueSport: false,
}

const CLE = 'vh_profil_alimentaire'

export function lireProfil(): Profil {
  if (typeof localStorage === 'undefined') return PROFIL_VIDE
  try {
    const brut = localStorage.getItem(CLE)
    if (!brut) return PROFIL_VIDE
    return { ...PROFIL_VIDE, ...(JSON.parse(brut) as Partial<Profil>) }
  } catch { return PROFIL_VIDE }
}

export function ecrireProfil(p: Profil): void {
  if (typeof localStorage === 'undefined') return
  try { localStorage.setItem(CLE, JSON.stringify(p)) } catch { /* mode privé : tant pis */ }
}

/** « Oublier tout » — visible et franc, et il efface vraiment. */
export function oublierProfil(): void {
  if (typeof localStorage === 'undefined') return
  try { localStorage.removeItem(CLE) } catch { /* rien à faire */ }
}

export function profilVide(p: Profil): boolean {
  return p.regime === 'aucun' && !p.sansGluten && !p.sansLactose
    && p.objectif === 'aucun' && !p.exclusions.trim() && !p.habitueSport
}

// ════════════════════════════════════════════════════════════════════
// 🔎 TRADUIRE UN BESOIN EN RECHERCHE — le vrai travail.
//
// Google ne connaît pas le mot « protéiné ». Notre travail est de
// traduire le besoin en ce que Google sait chercher : des types de lieux,
// des types de cuisine, des mots qui apparaissent dans les menus et les
// avis. Cette table est écrite à la main, comme les pistes — et pour la
// même raison : un modèle qui inventerait librement les termes de
// recherche finirait par écrire « brasserie » ou « wine bar ».
// ════════════════════════════════════════════════════════════════════

const TRADUCTION: Record<string, string> = {
  // « sain et protéiné après le sport » → ce que Google sait trouver.
  proteine: 'poke grilled chicken bowl salad protein izgara shawarma plate',
  leger: 'salad soup bowl light',
  'pas-cher': 'canteen cheap eats set menu',
  // Régimes : le type Google + les cuisines à forte offre végétale.
  vegane: 'vegan plant based indian ethiopian lebanese mezze thai',
  vegetarien: 'vegetarian indian lebanese mezze thai',
  pescetarien: 'seafood fish poke sushi',
  // Cuisines naturellement à base de riz ou de maïs.
  'sans-gluten': 'gluten free indian mexican vietnamese poke rice',
  'sans-lactose': 'dairy free vegan',
}

/**
 * Construit la requête envoyée à Google à partir de la requête de base et
 * du profil. Le profil AFFINE, il ne remplace jamais les filtres de base :
 * « halal » reste en tête, le filtre alcool reste dans le code, la
 * distance reste chirurgicale.
 */
export function requeteAvecProfil(base: string, p: Profil): string {
  const bouts = [base]
  if (p.regime !== 'aucun') bouts.push(TRADUCTION[p.regime])
  if (p.objectif !== 'aucun') bouts.push(TRADUCTION[p.objectif])
  else if (p.habitueSport) bouts.push(TRADUCTION.proteine)
  if (p.sansGluten) bouts.push(TRADUCTION['sans-gluten'])
  if (p.sansLactose) bouts.push(TRADUCTION['sans-lactose'])
  // On borne : une requête interminable dilue le résultat au lieu de
  // l'affiner, et Google finit par ignorer la fin.
  return bouts.join(' ').split(/\s+/).slice(0, 24).join(' ')
}

/**
 * Les critères du profil, du PLUS au MOINS essentiel. Sert au relâchement
 * (§5) : quand rien ne coche tout, on lâche le dernier d'abord — et on
 * DIT lequel. Un critère relâché en silence est un mensonge.
 */
export function criteresRelachables(p: Profil, en: boolean): { cle: string; libelle: string }[] {
  const L: { cle: string; libelle: string }[] = []
  // Le régime passe en dernier à être lâché : c'est le plus structurant.
  if (p.sansLactose) L.push({ cle: 'sansLactose', libelle: en ? 'lactose-free' : 'sans lactose' })
  if (p.sansGluten) L.push({ cle: 'sansGluten', libelle: en ? 'gluten-free' : 'sans gluten' })
  if (p.objectif !== 'aucun') L.push({ cle: 'objectif', libelle: en ? 'your goal' : 'ton objectif' })
  if (p.regime !== 'aucun') L.push({ cle: 'regime', libelle: en ? 'your diet' : 'ton régime' })
  return L
}

/** Le profil résumé en toutes lettres, pour l'afficher et pour l'IA. */
export function resumerProfil(p: Profil, en: boolean): string[] {
  const L: string[] = []
  const R: Record<Regime, [string, string]> = {
    aucun: ['', ''], vegane: ['végane', 'vegan'], vegetarien: ['végétarien', 'vegetarian'], pescetarien: ['pescétarien', 'pescatarian'],
  }
  const O: Record<Objectif, [string, string]> = {
    aucun: ['', ''], proteine: ['protéiné / sportif', 'high-protein / sporty'], leger: ['léger', 'light'], 'pas-cher': ['pas cher', 'cheap'],
  }
  if (p.regime !== 'aucun') L.push(R[p.regime][en ? 1 : 0])
  if (p.sansGluten) L.push(en ? 'gluten-free' : 'sans gluten')
  if (p.sansLactose) L.push(en ? 'lactose-free' : 'sans lactose')
  if (p.objectif !== 'aucun') L.push(O[p.objectif][en ? 1 : 0])
  else if (p.habitueSport) L.push(en ? 'often after the gym' : 'souvent après la salle')
  if (p.exclusions.trim()) L.push((en ? 'avoids: ' : 'évite : ') + p.exclusions.trim().slice(0, 60))
  return L
}

/**
 * 🔴 LA LIGNE ALLERGIE — fixe, visible, jamais reformulée.
 *
 * « Une allergie mal gérée peut tuer. Le site ne garantit JAMAIS l'absence
 * d'un allergène, jamais, sous aucune formulation. » On ne connaît pas les
 * menus : on connaît des types de lieux et des avis. La différence est
 * vitale, et elle s'écrit.
 */
const MOTS_ALLERGIE = /\ballergi|\banaphyla|\bintoléran|\bintoleran|\bcœliaque|\bcoeliaque|\bceliac|\barachide|\bpeanut|\bfruits? à coque|\bnuts?\b|\bcrustac|\bshellfish|\bsésame|\bsesame/i

export function mentionneAllergie(p: Profil): boolean {
  return MOTS_ALLERGIE.test(p.exclusions)
}

export function ligneAllergie(en: boolean): string {
  return en
    ? 'We cannot verify what dishes contain. Tell the restaurant about your allergy directly.'
    : "Nous ne pouvons pas vérifier la composition des plats. Signale ton allergie directement au restaurant."
}

/**
 * Ce que l'IA a le droit de dire sur le profil — et surtout pas.
 * On ne connaît pas les menus : on connaît des types de lieux, des
 * attributs Google et ce que les gens écrivent dans les avis.
 */
export function consigneProfilIA(p: Profil, en: boolean): string | null {
  if (profilVide(p)) return null
  const resume = resumerProfil(p, en).join(', ')
  const base = en
    ? `The traveller's eating profile: ${resume}. Use it to explain WHY each place fits or does not. NEVER state as fact that a place "offers gluten-free" or "has vegan dishes" — we do not know the menus. Only say what the reviews or the place type support, and say where it comes from ("according to reviews"). No nutrition advice, no calories, no health opinion.`
    : `Profil alimentaire du voyageur : ${resume}. Sers-t'en pour expliquer POURQUOI chaque adresse convient ou non. N'affirme JAMAIS qu'un lieu « propose du sans gluten » ou « a des plats véganes » — nous ne connaissons pas les menus. Dis seulement ce que les avis ou le type de lieu permettent de dire, et dis d'où ça vient (« d'après les avis »). Aucun conseil nutritionnel, aucune calorie, aucun avis de santé.`
  if (!mentionneAllergie(p)) return base
  return base + (en
    ? ' The traveller mentions an allergy: NEVER guarantee the absence of an allergen, under any wording. Tell them to check directly with the restaurant.'
    : " Le voyageur mentionne une allergie : ne garantis JAMAIS l'absence d'un allergène, sous aucune formulation. Invite-le à vérifier directement auprès du restaurant.")
}

// (Redéploiement : le webhook Vercel a manqué le commit e9f4d1b.)
