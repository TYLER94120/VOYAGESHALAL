// 🥇 LES 3 MEILLEURS DE LA CARTE — le barème, ET SEULEMENT LE BARÈME.
//
// Correction 4 du 18 août : sur la carte, chaque onglet montre exactement
// trois adresses, classées par le meilleur ÉQUILIBRE — pas seulement la
// plus proche. Les poids vivent ICI, commentés, jamais en dur dans un
// composant : pour changer l'équilibre, on change ce fichier, et le test
// (scripts/test-top3.mjs) dit si on a cassé une promesse.
//
// La note est PONDÉRÉE PAR LE VOLUME D'AVIS (moyenne bayésienne simple) :
// un 4,9 avec 3 avis ne bat pas un 4,5 avec 500 avis — trois personnes ne
// sont pas une preuve, c'est la même prudence que partout sur le site.

/** Poids par mode. Chaque ligne somme à 1. */
export const POIDS = {
  // Manger : l'équilibre du brief — 40 % note, 40 % proximité, 20 % prix.
  manger: { note: 0.4, proximite: 0.4, prix: 0.2 },
  // Prier : distance et ouverture priment — le prix n'existe pas.
  mosquee: { note: 0.15, proximite: 0.85, prix: 0 },
  // Que faire : note et distance.
  activite: { note: 0.5, proximite: 0.5, prix: 0 },
}

/** Moyenne bayésienne : la note est tirée vers PRIOR tant qu'il y a peu
 *  d'avis. M = le nombre d'avis à partir duquel la note commence à parler
 *  vraiment pour elle-même. */
export const BAYES = { M: 50, PRIOR: 3.8 }

export function noteBayes(note, nbAvis) {
  if (typeof note !== 'number' || note <= 0) return BAYES.PRIOR
  const n = typeof nbAvis === 'number' && nbAvis > 0 ? nbAvis : 0
  return (n * note + BAYES.M * BAYES.PRIOR) / (n + BAYES.M)
}

/**
 * Classe des fiches { note, nbAvis, distanceM, prix (1–4), ouvert } pour un
 * mode, et rend les 3 meilleures AVEC leur étiquette :
 *   - la n°1 porte « equilibre » (c'est la définition du classement) ;
 *   - « mieux-note » et « plus-proche » ne s'affichent que quand c'est
 *     VRAI (la mieux notée / la plus proche du lot) et différent de la n°1.
 * Une adresse fermée ne prend jamais une place du podium en mode Prier.
 */
export function top3(fiches, mode) {
  const p = POIDS[mode] ?? POIDS.manger
  const L = fiches.filter((f) => typeof f.lat === 'number' && typeof f.lng === 'number')
  if (!L.length) return []
  // ⏱️ Itération 3 : quand les minutes RÉELLES existent, la proximité du
  // score se mesure en temps — marche si ≤ 15 min, sinon voiture (converti
  // en équivalent-mètres pour rester comparable aux fiches sans minutes).
  const equivM = (f) => {
    if (typeof f.marcheMin === 'number' && f.marcheMin <= 15) return f.marcheMin * 75
    if (typeof f.voitureMin === 'number') return f.voitureMin * 400
    if (typeof f.marcheMin === 'number') return f.marcheMin * 75
    return f.distanceM
  }
  const dMax = Math.max(...L.map((f) => equivM(f) ?? 0), 1)
  const score = (f) => {
    const note = noteBayes(f.note, f.nbAvis) / 5
    const prox = 1 - (equivM(f) ?? dMax) / dMax
    // prix 1–4 (niveaux Google) ; inconnu = neutre 0,5 pour ne pas punir
    // une adresse dont Google ne connaît pas le niveau de prix.
    const prix = typeof f.prix === 'number' && f.prix > 0 ? 1 - f.prix / 4 : 0.5
    let s = p.note * note + p.proximite * prox + p.prix * prix
    // Prier : une salle fermée maintenant ne sert pas le besoin du moment.
    if (mode === 'mosquee' && f.ouvert === false) s -= 0.5
    return s
  }
  const classees = [...L].sort((a, b) => score(b) - score(a)).slice(0, 3)
  const mieuxNote = [...classees].sort((a, b) => noteBayes(b.note, b.nbAvis) - noteBayes(a.note, a.nbAvis))[0]
  const plusProche = [...classees].sort((a, b) => (a.distanceM ?? 1e9) - (b.distanceM ?? 1e9))[0]
  return classees.map((f, i) => ({
    ...f,
    etiquette: i === 0 ? 'equilibre'
      : f === mieuxNote && typeof f.note === 'number' ? 'mieux-note'
      : f === plusProche ? 'plus-proche' : null,
  }))
}

export const ETIQUETTES = {
  equilibre: { fr: 'Meilleur équilibre', en: 'Best balance' },
  'mieux-note': { fr: 'Mieux noté', en: 'Top rated' },
  'plus-proche': { fr: 'Le plus proche', en: 'Closest' },
}
