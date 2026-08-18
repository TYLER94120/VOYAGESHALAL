import type { Criteres } from '@/lib/criteres'

// 🚶 LA DISTANCE, CHIRURGICALE — et jamais absurde.
//
// DÉFAUT CONSTATÉ PAR MOHAMED, 15 août au soir : « j'ai demandé un café,
// une pâtisserie — on m'a proposé des adresses à QUATRE-VINGT-DIX
// MINUTES. Une pâtisserie à 90 minutes n'est pas une pâtisserie, c'est
// une excursion. »
//
// Ce fichier tient les cinq règles qui en découlent :
//
// 1. LE TEMPS AFFICHÉ CORRESPOND À UN DÉPLACEMENT RÉEL. Au-delà de
//    20 minutes de marche, on ne dit plus « à pied » : on bascule sur la
//    voiture. « 91 min à pied » n'existe pas.
// 2. LE MODE EST TOUJOURS ÉCRIT à côté du temps. Un nombre de minutes
//    sans son mode de déplacement est une information fausse.
// 3. ON CALCULE À VOL D'OISEAU, donc on SOUS-ESTIME (rivières,
//    périphérique, sens uniques). D'où le « ≈ » et une marge de détour
//    honnête, plutôt qu'un chiffre faussement précis.
// 4. LE RAYON DÉPEND DE LA NATURE DE LA DEMANDE. On ne traverse pas une
//    ville pour un café ; on accepte de rouler pour un hôtel.
// 5. LE POINT DE DÉPART N'EST PAS TOUJOURS LE VISITEUR. Sur la fiche
//    d'une ville, il est chez lui à 2 000 km : le repère devient le
//    centre-ville, et on l'écrit.

export type Mode = 'pied' | 'voiture' | 'transports'

/** Vitesses effectives PORTE À PORTE, volontairement prudentes.
 *  m/min. La voiture en ville n'est pas à 50 km/h : feux, stationnement. */
const VITESSE: Record<Mode, number> = { pied: 78, voiture: 320, transports: 240 }

/** Marge de détour : le trajet réel est plus long que la ligne droite.
 *  1,3 en marche (rues, traversées), 1,4 en voiture (sens uniques). */
const DETOUR: Record<Mode, number> = { pied: 1.3, voiture: 1.4, transports: 1.35 }

/** Au-delà, marcher n'est plus une proposition sérieuse. */
const MARCHE_MAX_MIN = 20

/** Minutes de trajet estimées, marge de détour comprise. */
export function minutes(distanceM: number, mode: Mode): number {
  return Math.max(1, Math.round((distanceM * DETOUR[mode]) / VITESSE[mode]))
}

/**
 * Le mode RÉELLEMENT affichable pour cette distance.
 * Le visiteur a beau avoir dit « à pied », on ne lui annonce pas
 * 91 minutes de marche : au-delà de 20 minutes, on bascule sur la voiture
 * — et on le dit, plutôt que de mentir sur le mode.
 */
export function modeAffichable(distanceM: number, souhaite: Mode): Mode {
  if (souhaite !== 'pied') return souhaite
  return minutes(distanceM, 'pied') <= MARCHE_MAX_MIN ? 'pied' : 'voiture'
}

const LIBELLE: Record<Mode, [string, string]> = {
  pied: ['à pied', 'walk'],
  voiture: ['en voiture', 'by car'],
  transports: ['en transports', 'by transit'],
}

/**
 * Le temps de trajet, avec son mode — la seule forme autorisée à l'écran.
 * `depuisCentre` bascule le repère sur le centre-ville (fiche destination).
 */
export function trajet(distanceM: number, souhaite: Mode, en: boolean, depuisCentre = false): string {
  const m = modeAffichable(distanceM, souhaite)
  const min = minutes(distanceM, m)
  const suffixe = depuisCentre ? (en ? ' from the centre' : ' du centre') : ''
  return `≈ ${min} min ${LIBELLE[m][en ? 1 : 0]}${suffixe}`
}

/**
 * LE RAYON QUI A DU SENS, en mètres, selon la NATURE de la demande et le
 * mode de déplacement. C'est le cœur du « chirurgical » : ces plafonds
 * sont ce qui empêche une pâtisserie à 90 minutes de sortir.
 *
 * Exprimés d'abord en MINUTES — c'est ainsi qu'on raisonne quand on a
 * faim —, puis convertis en mètres pour l'appel réseau.
 */
/**
 * ════════ 15 AOÛT — ON CHERCHE LARGE DU PREMIER COUP ════════
 *
 * Ordre de Mohamed : « Quand je cherche une mosquée ou un restaurant, on me
 * répond "je n'ai pas trouvé, veux-tu élargir à 16 km ?". C'est une question
 * de trop. Le visiteur a déjà demandé — lui refaire payer un clic pour
 * obtenir une réponse évidente, c'est mauvais. On cherche D'EMBLÉE dans un
 * rayon de 20 KM. Le visiteur décide lui-même ce qui est trop loin — ce
 * n'est pas au site de décider à sa place. »
 *
 * CE QUI CHANGE, ET CE QUI NE CHANGE PAS. Les plafonds serrés par nature de
 * demande (10 min pour un café, 15 pour un repas) disparaissent : ils
 * étaient la cause des écrans vides et de la question d'élargissement. Mais
 * la règle qui les avait fait naître, elle, reste intacte : « 91 min à
 * pied » n'existe toujours pas — au-delà de 20 minutes de marche on bascule
 * sur la voiture (`modeAffichable`), et chaque adresse porte son temps de
 * trajet AVEC son mode. Une pâtisserie à 18 km reste affichée, mais elle
 * est affichée en dernier et annoncée « ≈ 35 min en voiture ». Le visiteur
 * voit ce que ça coûte et tranche lui-même.
 */
const RAYON_LARGE_M = 20_000

/** Rayon de recherche en mètres : 20 km pour tout le monde, d'emblée. */
export function rayonM(c: Criteres, _mode: Mode): number {
  // Le bonus vient de la feuille d'envies (« élargis le rayon ? +5 km ») —
  // borné : on n'envoie personne à 50 km sur une envie de sushi.
  const bonus = Math.min(10, Math.max(0, c.rayonBonusKm ?? 0)) * 1000
  return RAYON_LARGE_M + bonus
}

/** Le rayon exprimé en minutes de trajet, pour l'écrire à l'écran quand il
 *  n'y a vraiment rien : « aucun lieu de prière trouvé jusqu'à 20 km ». */
export function plafondMin(_c: Criteres, mode: Mode): number {
  return minutes(RAYON_LARGE_M, mode)
}

/** Le rayon en kilomètres — c'est ainsi qu'on l'annonce quand c'est vide. */
export const RAYON_KM = RAYON_LARGE_M / 1000

/**
 * La proposition d'élargissement, chiffrée (§5.5) : « Aucune pâtisserie à
 * moins de 10 minutes à pied. Élargir à 15 minutes en voiture ?
 * (4 adresses) ». Le visiteur décide au lieu de subir une liste qui
 * s'allonge toute seule — et on ne lui promet un nombre que si on l'a
 * réellement compté.
 */
export function modeSuivant(mode: Mode): Mode | null {
  if (mode === 'pied') return 'voiture'
  if (mode === 'transports') return 'voiture'
  return null
}
