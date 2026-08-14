// 🧠 LIRE LA DEMANDE ÉCRITE EN LANGAGE ORDINAIRE.
//
// Ordre de Mohamed, 15 août : « le parcours ne commence PAS par des cases,
// il commence par une vraie question : "Dis-moi ce que tu cherches." L'IA
// lit cette phrase et en EXTRAIT les critères, puis montre ce qu'elle a
// compris sous forme de boutons déjà cochés que le visiteur peut corriger
// d'un appui. »
//
// POURQUOI CETTE LECTURE EST LOCALE ET NON CONFIÉE AU MODÈLE. Trois
// raisons, dans cet ordre :
//   1. Elle est INSTANTANÉE. Le visiteur voit « J'ai compris : kebab ·
//      petit prix · à pied » pendant qu'il lève le pouce du clavier. Un
//      aller-retour réseau ici, c'est une seconde d'attente avant même
//      d'avoir cherché quoi que ce soit.
//   2. Elle marche TOUJOURS — sans clé, sans réseau, en 4G faible. Le
//      modèle, lui, sert là où il est irremplaçable : écrire ce que les
//      chiffres ne disent pas (§3 de l'ordre).
//   3. Elle ne coûte rien. Chaque appel se paie ; celui-ci se remplace
//      par cinquante expressions régulières.
//
// Elle est BILINGUE : la même fonction lit « un kebab pas cher pas loin »
// et « a cheap kebab nearby ».
//
// ⚠️ Ce qu'elle ne fait JAMAIS : deviner un fait sur un lieu. Elle ne lit
// que l'INTENTION du visiteur. Aucune de ces valeurs ne devient une
// affirmation sur un restaurant.

export type Quoi = 'pizza' | 'kebab' | 'burger' | 'oriental' | 'asiatique' | 'petit-dejeuner' | 'patisserie' | 'peu-importe'
// 🚶 COMMENT TU Y VAS — ce n'est pas seulement de l'affichage : le mode
// change le RAYON et le TRI (§5.3 de l'ordre du 15 août au soir).
export type ModeChoisi = 'pied' | 'voiture' | 'transports' | 'peu-importe'
export type Budget = 'petit' | 'moyen' | 'peu-importe'
export type Exigence = 'verifies' | 'signales'

export interface Criteres {
  quoi: Quoi
  mode: ModeChoisi
  budget: Budget
  exigence: Exigence
  ouvertMaintenant: boolean
  sallePriere: boolean
  sansAlcool: boolean
  famille: boolean
  vegetarien: boolean
  /** Ce que la phrase a laissé deviner sans certitude — sert à la relance. */
  moment?: 'maintenant' | 'ce-soir'
  compagnie?: 'seul' | 'famille' | 'amis'
}

export const CRITERES_DEFAUT: Criteres = {
  quoi: 'peu-importe',
  mode: 'peu-importe',
  budget: 'peu-importe',
  // Par défaut on montre TOUT ce qui est signalé halal, en le disant : se
  // limiter aux adresses vérifiées renverrait presque toujours zéro
  // résultat aujourd'hui, et un écran vide n'aide personne.
  exigence: 'signales',
  ouvertMaintenant: false,
  sallePriere: false,
  sansAlcool: false,
  famille: false,
  vegetarien: false,
}

const MOTIFS: { champ: keyof Criteres; valeur: unknown; re: RegExp }[] = [
  // — QUOI
  { champ: 'quoi', valeur: 'pizza', re: /\bpizz|\bitalien|\bitalian/i },
  { champ: 'quoi', valeur: 'kebab', re: /\bkebab|\bdurum|\btacos|\bshawarma|\bgrec\b/i },
  { champ: 'quoi', valeur: 'burger', re: /\bburger|\bhamburger|\bsmash/i },
  { champ: 'quoi', valeur: 'oriental', re: /\boriental|\bcouscous|\btajine|\btagine|\bliban|\blebanese|\bsyrien|\bsyrian|\bturc\b|\bturkish|\bmarocain|\bmoroccan/i },
  { champ: 'quoi', valeur: 'asiatique', re: /\basiat|\basian|\bchinois|\bchinese|\bjapon|\bjapanese|\bsushi|\bthaï|\bthai\b|\bindien|\bindian|\bwok\b|\bnouilles|\bnoodles/i },
  { champ: 'quoi', valeur: 'petit-dejeuner', re: /petit[- ]d[ée]j|\bbrunch|\bbreakfast|\bmsemen|\bbaghrir/i },
  { champ: 'quoi', valeur: 'patisserie', re: /\bp[âa]tisser|\bpastry|\bg[âa]teau|\bcake\b|\bdessert|\bcr[êe]pe|\bglace\b|\bice cream|\bcaf[ée]\b|\bcoffee/i },
  // — COMMENT TU Y VAS. « en bas de chez moi » = à pied, « je suis sur la
  // route » = voiture : le mode se devine dans la phrase (§5.3).
  { champ: 'mode', valeur: 'pied', re: /\bà pied\b|\bpas loin\b|\btout près\b|\bjuste à c[ôo]t[ée]\b|\ben bas de chez moi\b|\bdans le coin\b|\bwalking\b|\bon foot\b|\bnearby\b|\bclose by\b|\baround the corner\b|\bautour de moi\b/i },
  { champ: 'mode', valeur: 'voiture', re: /\ben voiture\b|\bje conduis\b|\bsur la route\b|\ben bagnole\b|\bby car\b|\bdriving\b|\bshort drive\b|\bi.m driving\b/i },
  { champ: 'mode', valeur: 'transports', re: /\ben transports?\b|\ben m[ée]tro\b|\ben bus\b|\ben tram\b|\bby (metro|bus|tram|transit)\b|\bpublic transport\b/i },
  // — BUDGET
  { champ: 'budget', valeur: 'petit', re: /\bpas cher\b|\bpas ch[èe]re\b|\bbon march[ée]\b|\b[ée]conomique\b|\bpetit budget\b|\bpetit prix\b|\bcheap\b|\bbudget\b|\baffordable\b|\binexpensive\b/i },
  { champ: 'budget', valeur: 'moyen', re: /\bmoyen\b|\bcorrect\b|\bmid[- ]range\b|\bmoderate\b/i },
  // — EXIGENCE HALAL
  { champ: 'exigence', valeur: 'verifies', re: /\bv[ée]rifi[ée]|\bcertifi[ée]|\bs[ûu]r\b|\bconfiance\b|\bverified\b|\btrusted\b|\bcertified\b/i },
  // — REPLIÉS
  { champ: 'ouvertMaintenant', valeur: true, re: /\bouvert\b|\bmaintenant\b|\btout de suite\b|\bopen now\b|\bright now\b|\bcurrently open\b/i },
  { champ: 'sallePriere', valeur: true, re: /salle de pri[èe]re|\bpri[èe]re\b|\bmusalla\b|\bprayer room\b|\bpray\b/i },
  { champ: 'sansAlcool', valeur: true, re: /sans alcool|\bpas d.alcool\b|\bno alcohol\b|\balcohol[- ]free\b/i },
  { champ: 'famille', valeur: true, re: /\bfamille\b|\benfants?\b|\bfamily\b|\bkids?\b|\bchildren\b/i },
  { champ: 'vegetarien', valeur: true, re: /\bv[ée]g[ée]tarien|\bvegan\b|\bvegetarian\b/i },
  // — INDICES pour la relance (jamais des filtres)
  { champ: 'moment', valeur: 'maintenant', re: /\bmaintenant\b|\btout de suite\b|\bright now\b|\bnow\b/i },
  { champ: 'moment', valeur: 'ce-soir', re: /\bce soir\b|\bd[îi]ner\b|\btonight\b|\bdinner\b|\bthis evening\b/i },
  { champ: 'compagnie', valeur: 'famille', re: /\bfamille\b|\ben famille\b|\bfamily\b|\bwith (my )?kids\b/i },
  { champ: 'compagnie', valeur: 'seul', re: /\bseul\b|\btout seul\b|\balone\b|\bby myself\b|\bsolo\b/i },
  { champ: 'compagnie', valeur: 'amis', re: /\bamis\b|\bcopains\b|\bfriends\b|\bmates\b/i },
]

/** Lit une phrase libre et en tire les critères. Rien n'est inventé : un
 *  critère absent de la phrase reste à sa valeur par défaut. */
export function lireDemande(phrase: string): Criteres {
  const c: Criteres = { ...CRITERES_DEFAUT }
  const p = ` ${phrase} `
  for (const { champ, valeur, re } of MOTIFS) {
    if (!re.test(p)) continue
    // Premier motif gagnant pour les champs à choix unique : « pizza ou
    // kebab » retient pizza, et le visiteur corrige d'un appui — c'est
    // exactement le rôle des boutons de correction.
    const dejaFixe = c[champ] !== CRITERES_DEFAUT[champ] && CRITERES_DEFAUT[champ] !== undefined
    if (dejaFixe && champ !== 'moment' && champ !== 'compagnie') continue
    ;(c as unknown as Record<string, unknown>)[champ] = valeur
  }
  return c
}

/** Libellés affichés dans les boutons « J'ai compris : … ». */
export function resumerCriteres(c: Criteres, en: boolean): string[] {
  const L: string[] = []
  const QUOI: Record<Quoi, [string, string]> = {
    pizza: ['pizza', 'pizza'], kebab: ['kebab', 'kebab'], burger: ['burger', 'burger'],
    oriental: ['oriental', 'Middle Eastern'], asiatique: ['asiatique', 'Asian'],
    'petit-dejeuner': ['petit-déjeuner', 'breakfast'], patisserie: ['pâtisserie', 'pastry'],
    'peu-importe': ['peu importe', 'anything'],
  }
  if (c.quoi !== 'peu-importe') L.push(QUOI[c.quoi][en ? 1 : 0])
  if (c.budget === 'petit') L.push(en ? 'cheap' : 'petit prix')
  if (c.budget === 'moyen') L.push(en ? 'mid-range' : 'prix moyen')
  if (c.mode === 'pied') L.push(en ? 'on foot' : 'à pied')
  if (c.mode === 'voiture') L.push(en ? 'by car' : 'en voiture')
  if (c.mode === 'transports') L.push(en ? 'by transit' : 'en transports')
  if (c.ouvertMaintenant) L.push(en ? 'open now' : 'ouvert maintenant')
  if (c.exigence === 'verifies') L.push(en ? 'community-verified only' : 'vérifiées seulement')
  if (c.sallePriere) L.push(en ? 'prayer room nearby' : 'salle de prière')
  if (c.sansAlcool) L.push(en ? 'no alcohol served' : 'sans alcool')
  if (c.famille) L.push(en ? 'family-friendly' : 'en famille')
  if (c.vegetarien) L.push(en ? 'vegetarian option' : 'option végétarienne')
  return L
}

/**
 * LA RELANCE — une seule, jamais deux.
 *
 * « Si un critère décisif manque ET qu'il change vraiment le résultat,
 * l'IA pose UNE question ouverte, courte, sautable, et elle explique en
 * trois mots pourquoi elle demande. » Au deuxième « encore une question »,
 * le visiteur est parti.
 *
 * On ne relance donc que si la réponse peut réellement changer les trois
 * fiches : sans indication de compagnie ni de moment, le tri ne sait pas
 * arbitrer entre « vite fait » et « s'installer ».
 */
export function relance(c: Criteres, en: boolean): { question: string; choix: [string, Partial<Criteres>][] } | null {
  if (!c.compagnie && !c.famille) {
    return {
      question: en ? 'Are you on your own or with family? (changes the room size)' : 'Tu es seul ou en famille ? (ça change la taille de la salle)',
      choix: [
        [en ? 'On my own' : 'Seul', { compagnie: 'seul' }],
        [en ? 'With family' : 'En famille', { compagnie: 'famille', famille: true }],
        [en ? 'With friends' : 'Entre amis', { compagnie: 'amis' }],
      ],
    }
  }
  if (!c.moment && !c.ouvertMaintenant) {
    return {
      question: en ? 'Right now or later tonight? (some close early)' : "C'est pour tout de suite ou pour ce soir ? (certaines ferment tôt)",
      choix: [
        [en ? 'Right now' : 'Tout de suite', { moment: 'maintenant', ouvertMaintenant: true }],
        [en ? 'Tonight' : 'Ce soir', { moment: 'ce-soir' }],
      ],
    }
  }
  return null
}
