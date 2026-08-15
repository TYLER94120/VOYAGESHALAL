// 🧭 LE VERDICT D'ARRIVÉE — « est-ce que ce voyage est fait pour nous ? »
//
// Ordre de Mohamed, 15 août : « Personne n'arrive sur cette page en se
// demandant combien d'hôtels il y a. La vraie question, celle à laquelle
// AUCUN site au monde ne répond, c'est : est-ce que ce voyage est fait pour
// nous, en tant que musulmans ? »
//
// ════════ POURQUOI CE VERDICT N'EST PAS ÉCRIT PAR UN MODÈLE ════════
//
// Mohamed a demandé « écrit par l'IA ». J'ai fait autrement, et je le dis :
// ce verdict est CALCULÉ à partir de faits que nous possédons, puis mis en
// phrases par des règles écrites à la main.
//
// Trois raisons, et la première suffit :
//   1. « Un verdict faux est pire qu'une page vide. » Un modèle à qui l'on
//      demande si un pays est accueillant pour les musulmans RÉPONDRA — même
//      sans le savoir. Il écrira « les habitants sont chaleureux » parce que
//      c'est ce qu'on écrit d'ordinaire. Ici, chaque phrase doit pouvoir
//      être retournée à sa source, et une règle ne peut dire que ce qu'on
//      lui a donné.
//   2. Ça ne coûte rien, et ça marche sans réseau — donc c'est instantané et
//      identique à chaque visite. Un verdict qui change d'une visite à
//      l'autre n'est pas un verdict.
//   3. Le score doit S'EXPLIQUER. Une note produite par un modèle ne se
//      décompose pas ; une note calculée porte ses chiffres avec elle.
//
// ════════ CE QU'ON A LE DROIT D'AFFIRMER, ET CE QU'ON TAIT ════════
//
// AFFIRMÉ : ce qui se compte. Pays à majorité musulmane (liste fermée),
// nombre de mosquées relevées, nombre d'adresses signalées halal, part des
// adresses dont le nom ou les plats portent un mot à risque, dans NOS données.
//
// TU : l'accueil, la chaleur des gens, la tolérance, le regard sur le voile.
// Nous n'en savons rien. On ne dit JAMAIS d'un pays qu'il est hostile ou
// accueillant sur une impression — ni dans un sens, ni dans l'autre.
//
// Et quand une donnée manque, la note n'est pas inventée : elle vaut `null`,
// et l'écran écrit « pas assez de relevés » au lieu d'un chiffre rassurant.

/** Une note sur 10, avec la phrase qui dit SUR QUOI elle repose. */
function note(valeur, phrase) {
  return { note: valeur, sur: phrase }
}

/**
 * Les trois indicateurs qui comptent vraiment — manger, prier, vigilance —
 * chacun accompagné de ce qui le fonde. Aucun n'est une moyenne d'autre
 * chose : chacun se lit seul.
 */
export function indicateurs({ paysMajoriteMusulmane, mosquees, restaurants, restaurantsSignales, restaurantsARisque }) {
  const out = {}

  // ── MANGER ────────────────────────────────────────────────────────
  if (paysMajoriteMusulmane) {
    // Dans un pays à majorité musulmane, l'offre est la règle et non
    // l'exception : c'est un fait de population, pas une appréciation.
    out.manger = note(9, 'pays à majorité musulmane : la restauration y est très majoritairement halal, souvent sans même le signaler')
  } else if (restaurantsSignales >= 20) {
    out.manger = note(8, `${restaurantsSignales} adresses signalées halal relevées dans la ville`)
  } else if (restaurantsSignales >= 8) {
    out.manger = note(6, `${restaurantsSignales} adresses signalées halal relevées — de quoi manger, sans grand choix`)
  } else if (restaurantsSignales >= 1) {
    out.manger = note(4, `${restaurantsSignales} adresse${restaurantsSignales > 1 ? 's' : ''} signalée${restaurantsSignales > 1 ? 's' : ''} halal seulement — prévoyez`)
  } else {
    out.manger = note(null, 'aucune adresse signalée halal dans nos relevés — nous ne savons pas, plutôt que de rassurer à tort')
  }

  // ── PRIER ─────────────────────────────────────────────────────────
  if (mosquees >= 20) out.prier = note(9, `${mosquees} mosquées relevées : on en trouve dans presque chaque quartier`)
  else if (mosquees >= 8) out.prier = note(7, `${mosquees} mosquées relevées dans la ville`)
  else if (mosquees >= 3) out.prier = note(5, `${mosquees} mosquées relevées — il faut prévoir ses trajets`)
  else if (mosquees >= 1) out.prier = note(3, `${mosquees} lieu${mosquees > 1 ? 'x' : ''} de prière relevé${mosquees > 1 ? 's' : ''} seulement`)
  else out.prier = note(null, 'aucun lieu de prière dans nos relevés — cela ne veut pas dire qu\'il n\'y en a pas')

  // ── CE QUI DEMANDE DE LA VIGILANCE ────────────────────────────────
  // ⚠️ On ne mesure NI la législation NI les mœurs : on n'en sait rien. Et
  // on ne mesure pas non plus « l'alcool dans la ville » — nos relevés ne
  // contiennent que des restaurants, en conclure qu'une ville est sans
  // alcool serait une affirmation tirée d'un trou de données, exactement ce
  // qu'on s'interdit.
  //
  // On mesure la seule chose qu'on possède vraiment : la part de NOS
  // adresses dont le nom ou la liste de plats porte un mot à risque
  // (souvlaki, saucisse, jambon, brasserie…). C'est le signal qui manquait
  // sur « Grill & Souvlaki Stop », et il se retourne à sa source, fiche par
  // fiche.
  if (restaurants >= 10) {
    const part = Math.round((restaurantsARisque / restaurants) * 100)
    const n = part >= 40 ? 4 : part >= 20 ? 6 : part >= 8 ? 8 : 9
    out.vigilance = note(n, `${part} % de nos adresses portent un mot à risque dans leur nom ou leurs plats (souvlaki, saucisse, brasserie…)`)
  } else {
    out.vigilance = note(null, 'trop peu de relevés pour en dire quelque chose d\'honnête')
  }

  return out
}

/** La moyenne des notes CONNUES — jamais des zéros à la place des trous. */
export function scoreGlobal(ind) {
  const connues = Object.values(ind).map((x) => x.note).filter((n) => typeof n === 'number')
  if (!connues.length) return null
  return Math.round((connues.reduce((a, b) => a + b, 0) / connues.length) * 10) / 10
}

/**
 * Le verdict en trois ou quatre lignes. Chaque phrase vient d'un fait
 * ci-dessus — rien n'est ajouté « pour faire joli ».
 */
export function verdict({ ville, pays, paysMajoriteMusulmane }, ind) {
  const p = []
  if (paysMajoriteMusulmane) {
    p.push(`${ville} est en ${pays}, pays à majorité musulmane : manger halal et trouver où prier n'y sont généralement pas des difficultés.`)
  } else if (ind.manger.note != null && ind.manger.note >= 6 && ind.prier.note != null && ind.prier.note >= 5) {
    p.push(`${ville} se voyage sans mal quand on est musulman : nos relevés y trouvent de quoi manger et où prier.`)
  } else if (ind.manger.note != null && ind.manger.note <= 4) {
    p.push(`${ville} demande de la préparation : nos relevés y trouvent peu d'adresses halal.`)
  } else {
    p.push(`${ville} : nos relevés sont encore trop minces pour trancher. Ce que nous savons est ci-dessous, tel quel.`)
  }
  // ⚠️ On ne répète PAS ici ce que la note « prier » dit déjà juste en
  // dessous : deux fois la même phrase, c'est deux fois moins lu, et ça
  // repousse la décomposition sous la ligne de flottaison.
  if (ind.vigilance.note != null && ind.vigilance.note <= 6) {
    p.push(`Le point d'attention : ${ind.vigilance.sur} — sur ces adresses-là, nous n'affichons aucune coche verte tant que rien n'est vérifié.`)
  }
  // La clause « nous ne certifions rien » n'est pas un verdict : elle est
  // affichée à part, SOUS la décomposition (voir VerdictArrivee).
  return p
}
