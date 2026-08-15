// 🧭 GARDE-FOU DU VERDICT D'ARRIVÉE.
//
// Ce que ce test protège, dans l'ordre d'importance :
//   1. Une donnée manquante ne produit JAMAIS une note rassurante. Pas de
//      relevé = `null` = « pas assez de relevés » à l'écran.
//   2. Le score global ne remplace jamais un trou par un zéro ni par une
//      moyenne consolante : il ne moyenne que les notes connues.
//   3. Le verdict ne prononce jamais un jugement sur les gens — accueil,
//      chaleur, tolérance, voile. Nous n'en savons rien.
//   4. Chaque note porte une phrase qui dit sur quoi elle repose.
//
// Le build casse si l'une de ces quatre règles tombe.

import { indicateurs, scoreGlobal, verdict } from '../lib/verdictVille.mjs'
import { readFileSync } from 'fs'

let fautes = 0
const casse = (m) => { console.error('❌ ' + m); fautes++ }

// ── 1. Le vide ne se comble pas ────────────────────────────────────────
const vide = indicateurs({ paysMajoriteMusulmane: false, mosquees: 0, restaurants: 0, restaurantsSignales: 0, restaurantsARisque: 0 })
for (const [cle, i] of Object.entries(vide)) {
  if (i.note !== null) casse(`sans aucun relevé, « ${cle} » affiche ${i.note}/10 au lieu de ne rien affirmer`)
}
if (scoreGlobal(vide) !== null) casse('un score global sort de zéro donnée')

// ── 2. Les trous ne tirent pas la moyenne vers le bas non plus ─────────
const partiel = indicateurs({ paysMajoriteMusulmane: true, mosquees: 30, restaurants: 2, restaurantsSignales: 0, restaurantsARisque: 0 })
if (partiel.vigilance.note !== null) casse('2 relevés suffisent à noter la vigilance — c\'est trop peu pour être honnête')
if (scoreGlobal(partiel) !== 9) casse(`le trou « vigilance » déforme le score global (${scoreGlobal(partiel)} au lieu de 9)`)

// ── 3. Aucune phrase sur les gens ──────────────────────────────────────
const INTERDITS = /accueillant|chaleureu|hostile|tolérant|toléran|bienveillan|le voile|racis|sympathique|ouvert d'esprit/i
for (const cas of [
  { ville: 'Tirana', pays: 'Albanie', paysMajoriteMusulmane: true, f: { mosquees: 35, restaurants: 24, restaurantsSignales: 12, restaurantsARisque: 5 } },
  { ville: 'Oslo', pays: 'Norvège', paysMajoriteMusulmane: false, f: { mosquees: 1, restaurants: 30, restaurantsSignales: 0, restaurantsARisque: 20 } },
]) {
  const ind = indicateurs({ paysMajoriteMusulmane: cas.paysMajoriteMusulmane, ...cas.f })
  const lignes = verdict(cas, ind)
  for (const l of lignes) if (INTERDITS.test(l)) casse(`le verdict de ${cas.ville} juge les habitants : « ${l} »`)
  if (lignes.length < 2) casse(`le verdict de ${cas.ville} est vide`)
  // 4. chaque note porte sa raison
  for (const [cle, i] of Object.entries(ind)) {
    if (!i.sur || i.sur.length < 15) casse(`« ${cle} » (${cas.ville}) affiche une note sans dire sur quoi elle repose`)
  }
}

// ── 5. Tirana, la ville pilote : le verdict doit tenir avec les vraies données
try {
  const t = JSON.parse(readFileSync(new URL('../data/villes/tirana.json', import.meta.url), 'utf-8'))
  const restos = t.restaurants ?? []
  const ind = indicateurs({
    paysMajoriteMusulmane: true,
    mosquees: t.statistiques?.mosquees ?? (t.mosqueesPrincipales ?? []).length,
    restaurants: restos.length,
    restaurantsSignales: restos.filter((r) => r.halalConfidence === 'yes' || r.halalConfidence === 'only').length,
    restaurantsARisque: 0,
  })
  const s = scoreGlobal(ind)
  if (s == null || s < 0 || s > 10) casse(`Tirana produit un score global aberrant : ${s}`)
} catch (e) {
  casse('impossible de lire data/villes/tirana.json : ' + e.message)
}

// ── 6. La page ne doit plus afficher un chiffre non décomposé ──────────
const page = readFileSync(new URL('../components/villes/VilleDesktop.tsx', import.meta.url), 'utf-8')
if (/HalalScoreBadge/.test(page)) casse('le badge de score non décomposé est revenu sur la page destination')
if (!/VerdictArrivee/.test(page)) casse('le verdict d\'arrivée a disparu de la page destination')

if (fautes) { console.error(`\n${fautes} faute(s) — build arrêté.`); process.exit(1) }
console.log('✅ verdict ville : le vide reste vide, le score se décompose, personne n\'est jugé.')
