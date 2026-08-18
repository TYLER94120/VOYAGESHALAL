// ✦ LE HALALSCORE — une seule source, une seule écriture, une validation.
//
// Brief du 16 août : « Les scores présents dans la maquette sont des valeurs
// de démonstration. Ne les reprends sous aucun prétexte. Aucun score ne doit
// être écrit en dur dans un composant. »
//
// La source unique est `data/villes/<slug>.json`, champ `halalScore`, sur 10.
// Neuf villes ne l'avaient pas : il a été rempli depuis `score_halal` (sur 5)
// multiplié par deux — la valeur existait déjà, elle n'était pas inventée.
//
// ⚠️ CE QUE CE FICHIER NE FAIT PAS : il n'invente aucun score, n'en estime
// aucun, n'en déduit aucun d'une réputation. Une ville sans donnée n'a pas
// de note, et l'écran n'affiche alors rien du tout — jamais un chiffre
// rassurant posé là pour remplir un trou.

/** Le barème officiel. Sert à repérer une valeur qui contredit sa catégorie. */
export const BAREME = [
  { min: 9.5, max: 10, niveau: 'Ville sainte' },
  { min: 9.0, max: 9.5, niveau: 'Excellence halal' },
  { min: 8.5, max: 9.0, niveau: 'Très bon' },
  { min: 7.5, max: 8.5, niveau: 'Bon' },
  { min: 6.5, max: 7.5, niveau: 'Acceptable' },
]

/** Les villes dont la catégorie est certaine, et qui servent de garde-fou. */
export const ATTENDU = {
  'la-mecque': 'Ville sainte',
  medine: 'Ville sainte',
}

export function niveauDe(score) {
  if (typeof score !== 'number' || Number.isNaN(score)) return null
  for (const b of BAREME) if (score >= b.min && score <= b.max) return b.niveau
  return score > 10 || score < 0 ? null : 'Hors barème'
}

/**
 * Valide un score. Rend `{ ok, erreur }` — jamais une exception silencieuse :
 * un score faux doit se voir, et dire lequel et pourquoi.
 */
export function valider(slug, score) {
  if (score == null) return { ok: false, erreur: `${slug} : aucun HalalScore. On n'affiche pas de note plutôt que d'en inventer une.` }
  if (typeof score !== 'number' || Number.isNaN(score)) return { ok: false, erreur: `${slug} : HalalScore « ${score} » n'est pas un nombre.` }
  if (score < 0 || score > 10) return { ok: false, erreur: `${slug} : HalalScore ${score} hors de l'intervalle 0–10.` }
  const attendu = ATTENDU[slug]
  if (attendu && niveauDe(score) !== attendu) {
    return { ok: false, erreur: `${slug} : ${score}/10 donne « ${niveauDe(score)} » alors que cette ville est « ${attendu} ».` }
  }
  return { ok: true }
}

/** L'affichage, écrit UNE fois : ✦ suivi du score à une décimale, virgule. */
export function afficher(score) {
  if (typeof score !== 'number' || Number.isNaN(score)) return null
  return `✦ ${score.toFixed(1).replace('.', ',')}`
}

/** La couleur du badge, par palier. Vert foncé ≥ 9 · vert ≥ 8 · orange ≥ 7 · gris en dessous. */
export function couleurBadge(score) {
  if (typeof score !== 'number' || Number.isNaN(score)) return '#6B7075'
  if (score >= 9) return '#146B41'
  if (score >= 8) return '#1F7A4A'
  if (score >= 7) return '#C77A1E'
  return '#6B7075'
}
