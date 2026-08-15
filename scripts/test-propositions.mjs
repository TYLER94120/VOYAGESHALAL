// ✨ TOUTE PROPOSITION AFFICHÉE EST UN ENGAGEMENT.
//
// Ordre de Mohamed, 16 août : « Je clique. Il ne se passe RIEN, ou j'obtiens
// la même liste générique. Ce sont des coquilles vides. Une coquille vide
// coûte plus cher qu'une absence : elle promet, puis elle déçoit. »
//
// Ce test casse le build si :
//   1. une proposition s'affiche sans au moins une adresse derrière elle ;
//   2. deux propositions rendent exactement la même liste ;
//   3. une proposition rend TOUTE la liste (elle ne trie rien) ;
//   4. le libellé ne porte pas son compte ;
//   5. « un café » s'affiche là où il n'y a aucun café ;
//   6. la prière proche n'est pas prise en compte ;
//   7. une piste écrite en dur, sans filtre Google derrière, revient dans
//      le composant.

import { propositions, filtrer } from '../lib/propositions.mjs'
import { readFileSync } from 'fs'

let fautes = 0
const casse = (m) => { console.error('❌ ' + m); fautes++ }

const quartier = [
  { nom: 'A', distanceM: 120, ouvert: true, prix: 1, note: 4.5, nbAvis: 300, famille: 'meal_takeaway' },
  { nom: 'B', distanceM: 260, ouvert: true, prix: 2, note: 4.4, nbAvis: 120, famille: 'restaurant' },
  { nom: 'C', distanceM: 900, ouvert: false, prix: 3, note: 3.9, nbAvis: 60, famille: 'restaurant' },
  { nom: 'D', distanceM: 1500, ouvert: true, prix: 4, note: 4.8, nbAvis: 15, famille: 'bakery' },
  { nom: 'E', distanceM: 2400, ouvert: false, famille: 'restaurant' },
  { nom: 'F', distanceM: 3100, ouvert: true, prix: 2, note: 4.3, nbAvis: 900, famille: 'bakery' },
]

for (const [titre, ctx] of [
  ['sans prière proche', { priere: null }],
  ['Maghrib dans 40 min', { priere: { nom: 'Maghrib', minutes: 40 } }],
]) {
  const props = propositions(quartier, ctx, false)
  if (!props.length) casse(`${titre} : aucune proposition sur six adresses variées — le calcul ne rend plus rien`)
  const vues = new Map()
  for (const pr of props) {
    const l = filtrer(quartier, pr.id, ctx)
    // 1. jamais vide
    if (!l.length) casse(`${titre} : « ${pr.libelle} » ne rend AUCUNE adresse — c'est exactement la coquille vide`)
    // 3. jamais toute la liste
    if (l.length === quartier.length) casse(`${titre} : « ${pr.libelle} » rend toute la liste — elle ne trie rien`)
    // 4. le compte est écrit, et il est juste
    if (!/\(\d+\)$/.test(pr.libelle)) casse(`${titre} : « ${pr.libelle} » n'affiche pas son compte`)
    if (l.length !== pr.n) casse(`${titre} : « ${pr.libelle} » annonce ${pr.n} adresses et en rend ${l.length}`)
    // 2. deux propositions identiques = une de trop
    const signature = l.map((x) => x.nom).sort().join('|')
    if (vues.has(signature)) casse(`${titre} : « ${pr.libelle} » rend exactement la même liste que « ${vues.get(signature)} »`)
    vues.set(signature, pr.libelle)
  }
}

// ── 5. Pas de café ici → pas de proposition « café » ───────────────────
if (propositions(quartier, { priere: null }, false).some((p) => p.id === 'fam:cafe')) {
  casse('« un café » est proposé alors qu\'aucune adresse n\'est un café')
}
const avecCafes = quartier.concat([
  { nom: 'G', distanceM: 300, ouvert: true, famille: 'cafe' },
  { nom: 'H', distanceM: 500, ouvert: true, famille: 'cafe' },
  { nom: 'I', distanceM: 700, ouvert: true, famille: 'cafe' },
])
if (!propositions(avecCafes, { priere: null }, false).some((p) => p.id === 'fam:cafe')) {
  casse('trois cafés autour et « un café » n\'est pas proposé')
}

// ── 6. La prière proche change les propositions ────────────────────────
const sans = propositions(quartier, { priere: null }, false).map((p) => p.id)
const avec = propositions(quartier, { priere: { nom: 'Maghrib', minutes: 25 } }, false).map((p) => p.id)
if (!avec.includes('avant-priere')) casse('Maghrib dans 25 min : rien ne le prend en compte dans les propositions')
if (sans.includes('avant-priere')) casse('« avant la prière » s\'affiche alors qu\'aucune prière n\'approche')
// Une prière trop lointaine ne doit rien déclencher.
if (propositions(quartier, { priere: { nom: 'Isha', minutes: 200 } }, false).some((p) => p.id === 'avant-priere')) {
  casse('une prière dans plus de trois heures déclenche encore la proposition « avant la prière »')
}
// Et si la prière est trop imminente pour atteindre quoi que ce soit, la
// proposition disparaît au lieu de promettre l'impossible.
if (propositions(quartier, { priere: { nom: 'Maghrib', minutes: 5 } }, false).some((p) => p.id === 'avant-priere')) {
  casse('à 5 minutes de la prière, on propose encore d\'atteindre une adresse à pied')
}

// ── 7. Les coquilles vides ne reviennent pas dans le composant ─────────
// On lit le composant SANS ses commentaires : expliquer pourquoi une
// coquille vide a été supprimée n'est pas la réafficher.
const compBrut = readFileSync(new URL('../components/lieux/SurMesure.tsx', import.meta.url), 'utf-8')
const comp = compBrut.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/[^\n]*$/gm, '')
for (const interdit of ['abri s’il pleut', 'abri s\'il pleut', 'espace pour les femmes', 'Sans rien dépenser', 'En deux heures']) {
  if (comp.includes(interdit)) casse(`« ${interdit} » est revenu à l'écran : Google n'expose aucun filtre derrière`)
}
if (!compBrut.includes('lesPropositions')) casse('les propositions calculées ont disparu du composant')

// Une liste trop courte ne se propose pas : rien à trier.
if (propositions([quartier[0]], { priere: null }, false).length) casse('une seule adresse produit encore des propositions')

if (fautes) { console.error(`\n${fautes} faute(s) — build arrêté.`); process.exit(1) }
console.log('✅ propositions : chacune a des adresses derrière elle, aucune n\'en double une autre.')
