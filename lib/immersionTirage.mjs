// 🎲 LE TIRAGE DU FLUX IMMERSION — pur, donc testé au build.
//
// Composition imposée d'un tirage de 7 panneaux (brief) :
//   2–3 lieux cultes/monuments · 1–2 tables · 1 expérience signature ·
//   1 hôtel remarquable · 1 joker (marché, point de vue, hammam…)
// Contraintes : jamais deux panneaux de même catégorie consécutifs ·
// nouveau tirage à chaque ouverture · « d'autres pépites » exclut le déjà
// vu dans la session. Une catégorie vide ne s'invente pas : le tirage est
// simplement plus court — les seuils d'entrée priment sur le remplissage.

const QUOTAS = [
  { cat: 'monument', min: 2, max: 3 },
  { cat: 'table', min: 1, max: 2 },
  { cat: 'experience', min: 1, max: 1 },
  { cat: 'hotel', min: 1, max: 1 },
  { cat: 'joker', min: 1, max: 1 },
]
const TAILLE = 7

function melange(liste) {
  const l = [...liste]
  for (let i = l.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[l[i], l[j]] = [l[j], l[i]]
  }
  return l
}

/** Réordonne pour ne jamais coller deux catégories identiques ; si c'est
 *  impossible (pool trop homogène), rend le meilleur effort. */
export function sansDoublonsConsecutifs(liste) {
  // Comme la maquette : on remélange jusqu'à un ordre sans voisins de même
  // catégorie (60 essais suffisent largement pour 7 panneaux) ; pool trop
  // homogène = meilleur effort, jamais un plantage.
  let l = [...liste]
  for (let essai = 0; essai < 60; essai++) {
    if (!l.some((p, i) => i > 0 && p.cat === l[i - 1].cat)) return l
    l = melange(l)
  }
  return l
}

/**
 * Tire un flux depuis le pool. `dejaVus` : ids à exclure (session).
 * Rend { panneaux, epuise } — epuise = plus assez de lieux jamais vus.
 */
export function tirer(pool, dejaVus = []) {
  const vus = new Set(dejaVus)
  const frais = pool.filter((p) => !vus.has(p.id))
  const dispo = frais.length >= 4 ? frais : pool // pool épuisé : on ré-ouvre tout
  const parCat = {}
  for (const p of melange(dispo)) (parCat[p.cat] ??= []).push(p)

  const pris = []
  // les minimums d'abord…
  for (const q of QUOTAS) for (let i = 0; i < q.min; i++) { const p = parCat[q.cat]?.shift(); if (p) pris.push(p) }
  // …puis on complète jusqu'à 7 en respectant les maximums.
  for (const q of melange(QUOTAS)) {
    while (pris.length < TAILLE && pris.filter((x) => x.cat === q.cat).length < q.max) {
      const p = parCat[q.cat]?.shift()
      if (!p) break
      pris.push(p)
    }
  }
  return { panneaux: sansDoublonsConsecutifs(melange(pris)), epuise: frais.length < 4 && pool.length > 0 }
}
