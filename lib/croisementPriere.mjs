// ⏱️ LE CROISEMENT PRIÈRE × DISTANCE — ce que personne d'autre ne peut écrire.
//
// Google Maps connaît la distance, mais pas ta prière.
// Une application de prière connaît ta prière, mais pas le restaurant.
// Nous avons les deux dans le même écran, et nous ne nous en servions pas.
//
// ════════ CE QU'ON CALCULE, ET RIEN DE PLUS ════════
//
// À partir de trois choses que nous possédons déjà — la distance réelle,
// le mode de trajet, l'heure de fin de la fenêtre de prière — on répond à
// la seule question que le visiteur se pose vraiment :
//
//     « Est-ce que j'ai le temps ? »
//
// Et sa suite, que personne ne pense à poser :
//
//     « Combien de temps me reste-t-il pour me décider ? »
//
// C'est ça, la surprise. Un écran qui dit « à 20 minutes » laisse quelqu'un
// hésiter dix minutes puis partir pour rien. Un écran qui dit « il te reste
// 11 minutes pour partir » transforme une distance en décision. Et quand le
// compte tombe à zéro, il le DIT — au lieu de laisser croire.
//
// ⚠️ ON NE TRANCHE JAMAIS UNE QUESTION RELIGIEUSE. On ne dit pas si la
// prière est valide, on ne dit pas de se dépêcher, on ne dit pas « tu as le
// droit ». On donne deux heures et une soustraction. Le reste appartient au
// visiteur, et à lui seul.
//
// ⚠️ ET ON NE DEVINE PAS. Sans heure de fin connue, sans distance, la
// fonction rend `null` : l'écran n'affiche alors rien du tout. Une phrase
// rassurante bâtie sur une inconnue serait pire que le silence.

/** Vitesses retenues partout dans le site. Mètres par minute. */
const VITESSE = { pied: 75, velo: 250, transports: 300, voiture: 500 }

/** Le temps qu'on passe sur place, par nature de lieu. Volontairement bas :
 *  mieux vaut se tromper en laissant de la marge qu'en la mangeant. */
const SUR_PLACE_MIN = { mosquee: 12, manger: 25, activite: 30 }

/**
 * @param distanceM   distance réelle, recalculée par nous
 * @param mode        'pied' | 'velo' | 'transports' | 'voiture'
 * @param finPriere   Date de fin de la fenêtre courante (ou début de la
 *                    suivante) — jamais devinée
 * @param maintenant  Date
 * @param categorie   'mosquee' | 'manger' | 'activite'
 * @param aller       true = on ne compte que l'aller (une mosquée : on y
 *                    prie, on ne revient pas pour prier)
 */
export function croisement({ distanceM, mode = 'pied', finPriere, maintenant = new Date(), categorie = 'manger', aller = false }) {
  const v = VITESSE[mode] ?? VITESSE.pied
  if (!Number.isFinite(distanceM) || !(finPriere instanceof Date) || Number.isNaN(finPriere.getTime())) return null

  const trajetMin = Math.max(1, Math.round(distanceM / v))
  const surPlace = SUR_PLACE_MIN[categorie] ?? 20
  // Une mosquée : on y va, on y prie, l'affaire est finie sur place.
  // Un restaurant : il faut pouvoir rentrer, ou au moins prier après.
  const besoinMin = aller || categorie === 'mosquee' ? trajetMin : trajetMin * 2 + surPlace

  const resteMin = Math.round((finPriere.getTime() - maintenant.getTime()) / 60_000)
  // 🔴 LE CHIFFRE QUI N'EXISTE NULLE PART : le temps qu'il reste pour PARTIR.
  const partirAvantMin = resteMin - besoinMin
  const arrivee = new Date(maintenant.getTime() + trajetMin * 60_000)

  let etat
  if (partirAvantMin < 0) etat = 'trop-tard'
  else if (partirAvantMin <= 5) etat = 'juste'
  else etat = 'large'

  return { trajetMin, besoinMin, resteMin, partirAvantMin, arrivee, etat }
}

/** L'heure écrite comme on la lit : 20 h 55. */
function heure(d) {
  return `${d.getHours()} h ${String(d.getMinutes()).padStart(2, '0')}`
}

/**
 * La phrase affichée. Elle énonce des faits et une soustraction — jamais un
 * conseil religieux, jamais une injonction à se presser.
 */
export function phraseCroisement(c, nomPriere, en = false) {
  if (!c) return null
  const a = heure(c.arrivee)
  if (c.etat === 'trop-tard') {
    // ⚠️ DEUX SITUATIONS TRÈS DIFFÉRENTES, et les confondre serait faux.
    // Soit on n'y est même pas ARRIVÉ avant la fin — là, c'est trop tard.
    // Soit on y arrive largement, mais on n'aura pas FINI : dans un
    // restaurant, ça ne veut pas dire renoncer, ça veut dire savoir qu'on
    // priera là-bas ou après. On le dit tel quel, sans dramatiser.
    if (c.trajetMin <= c.resteMin) {
      return en
        ? `You get there at ${a}, but you will not be done before ${nomPriere} — plan to pray there.`
        : `Tu y es à ${a}, mais tu n'auras pas fini avant ${nomPriere} — prévois de prier sur place.`
    }
    return en
      ? `You would arrive at ${a}, after ${nomPriere}. Too late for this one.`
      : `Tu arriverais à ${a}, après ${nomPriere}. Trop tard pour celle-ci.`
  }
  if (c.etat === 'juste') {
    return en
      ? `You arrive at ${a}. ${c.partirAvantMin} min left to leave — it is tight.`
      : `Tu arrives à ${a}. Il te reste ${c.partirAvantMin} min pour partir — c'est juste.`
  }
  // 🇬🇧 1er septembre — DEUX DÉFAUTS DANS CETTE SEULE LIGNE ANGLAISE,
  // invisibles parce que la règle §4 du test était écrite en français.
  //
  //   « ${c.partirAvantMin} min left to DECIDE »
  //     Le nombre est une heure de DÉPART, calculée par soustraction. « Pour
  //     décider » est une autre consigne, et la branche « juste » disait déjà
  //     « to leave » : le même chiffre changeait de sens selon la marge.
  //
  //   « ${nomPriere} is SAFE »
  //     Le français « est large » parle de l'HORLOGE. « Safe » en anglais se
  //     lit comme un verdict sur la prière elle-même — exactement ce que la
  //     règle « aucune phrase ne tranche une question religieuse » interdit.
  //     On décrit le temps qui reste, jamais la validité de la prière.
  return en
    ? `You arrive at ${a}. ${c.partirAvantMin} min left to leave — plenty of time before ${nomPriere}.`
    : `Tu arrives à ${a}. Il te reste ${c.partirAvantMin} min pour partir, ${nomPriere} est large.`
}
