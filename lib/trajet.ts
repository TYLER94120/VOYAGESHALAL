import type { Criteres, Quoi } from '@/lib/criteres'

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
const MINUTES_MAX: Record<'snack' | 'repas' | 'large', Record<Mode, number>> = {
  // Café, pâtisserie, petit-déjeuner : on ne traverse pas une ville.
  snack: { pied: 10, voiture: 8, transports: 12 },
  // Restaurant où l'on s'assoit : on accepte un peu plus.
  repas: { pied: 15, voiture: 10, transports: 18 },
  // Hôtel, activité, « que faire » : le large est légitime.
  large: { pied: 25, voiture: 25, transports: 30 },
}

function nature(quoi: Quoi): 'snack' | 'repas' | 'large' {
  if (quoi === 'patisserie' || quoi === 'petit-dejeuner') return 'snack'
  return 'repas'
}

/** Rayon de recherche en mètres — jamais plus loin que le sens commun. */
export function rayonM(c: Criteres, mode: Mode): number {
  const min = MINUTES_MAX[nature(c.quoi)][mode]
  return Math.round((min * VITESSE[mode]) / DETOUR[mode])
}

/** Le même plafond, en minutes : sert à ÉCRIRE le message d'élargissement. */
export function plafondMin(c: Criteres, mode: Mode): number {
  return MINUTES_MAX[nature(c.quoi)][mode]
}

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
