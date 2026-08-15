// 💶 📍 ⭐ TROIS FILTRES, UNE LIGNE, AUCUNE IA.
//
// Ordre de Mohamed, 16 août : « Les propositions sont trop longues,
// prennent quatre lignes sur téléphone, et sont lentes — parce qu'elles
// sont rédigées à chaque affichage. On remplace tout par trois filtres sur
// UNE seule ligne : Pas cher · Proche · Bien noté. »
//
// Ce test casse le build si :
//   1. il y a autre chose que ces trois filtres ;
//   2. un filtre s'affiche sans aucune adresse derrière lui ;
//   3. les filtres cessent de SE CUMULER ;
//   4. le tri cesse de placer les ouverts avant les fermés ;
//   5. un filtre déclenche un appel réseau ou passe par l'IA ;
//   6. « choisis pour moi » ou une piste écrite en dur revient.

import { FILTRES, filtresDisponibles, appliquer } from '../lib/propositions.mjs'
import { readFileSync } from 'fs'

let fautes = 0
const casse = (m) => { console.error('❌ ' + m); fautes++ }

// ── 1. Trois filtres, pas quatre ───────────────────────────────────────
const ids = FILTRES.map((f) => f.id)
if (ids.join(',') !== 'pas-cher,proche,bien-note') {
  casse(`les filtres ne sont plus les trois attendus : ${ids.join(', ')}`)
}

const quartier = [
  { nom: 'A', distanceM: 120, ouvert: true, prix: 1, note: 4.5, nbAvis: 300 },
  { nom: 'B', distanceM: 260, ouvert: true, prix: 3, note: 4.4, nbAvis: 120 },
  { nom: 'C', distanceM: 900, ouvert: false, prix: 1, note: 4.6, nbAvis: 90 },
  { nom: 'D', distanceM: 1500, ouvert: true, prix: 2, note: 3.5, nbAvis: 400 },
  { nom: 'E', distanceM: 2400, ouvert: false },
]

// ── 2. Aucun filtre affiché sans résultat derrière ─────────────────────
const dispo = filtresDisponibles(quartier)
if (!dispo.length) casse('aucun filtre proposable sur cinq adresses variées')
for (const f of dispo) {
  const l = appliquer(quartier, [f.id])
  if (!l.length) casse(`« ${f.fr} » ne rend AUCUNE adresse`)
  if (l.length === quartier.length) casse(`« ${f.fr} » garde toute la liste : il ne filtre rien`)
  if (l.length !== f.n) casse(`« ${f.fr} » annonce ${f.n} adresses et en rend ${l.length}`)
}
// Un critère qu'aucune adresse ne remplit ne s'affiche pas.
const sansPrix = quartier.map((x) => ({ ...x, prix: undefined }))
if (filtresDisponibles(sansPrix).some((f) => f.id === 'pas-cher')) {
  casse('« Pas cher » s\'affiche alors qu\'aucune adresse n\'a de niveau de prix')
}

// ── 3. Les filtres se cumulent ─────────────────────────────────────────
const cheap = appliquer(quartier, ['pas-cher']).map((x) => x.nom)
const pres = appliquer(quartier, ['proche']).map((x) => x.nom)
const deux = appliquer(quartier, ['pas-cher', 'proche']).map((x) => x.nom)
if (deux.length > Math.min(cheap.length, pres.length)) {
  casse('« pas cher + proche » rend plus d\'adresses que chacun seul : les filtres ne se cumulent pas')
}
for (const n of deux) {
  if (!cheap.includes(n) || !pres.includes(n)) casse(`« ${n} » sort du cumul sans satisfaire les deux critères`)
}
if (deux.join(',') !== 'A') casse(`« pas cher + proche » devrait rendre A seul, rend « ${deux.join(', ')} »`)

// ── 4. Les ouverts avant les fermés ────────────────────────────────────
const ordre = appliquer(quartier, []).map((x) => x.nom)
const premierFerme = ordre.findIndex((n) => quartier.find((x) => x.nom === n).ouvert === false)
const dernierOuvert = ordre.map((n) => quartier.find((x) => x.nom === n).ouvert !== false).lastIndexOf(true)
if (premierFerme !== -1 && premierFerme < dernierOuvert) {
  casse(`une adresse fermée passe devant une ouverte : ${ordre.join(' → ')}`)
}
// À état égal, la plus proche d'abord.
if (ordre[0] !== 'A') casse(`la plus proche des ouvertes n'est pas en tête : ${ordre.join(' → ')}`)

// ── 5 et 6. Ni IA, ni réseau, ni pistes ressuscitées ───────────────────
const source = readFileSync(new URL('../lib/propositions.mjs', import.meta.url), 'utf-8')
for (const interdit of ['fetch(', 'assistant', 'anthropic', 'await ']) {
  if (source.includes(interdit)) casse(`lib/propositions.mjs contient « ${interdit} » : un filtre doit être instantané et gratuit`)
}
const compBrut = readFileSync(new URL('../components/lieux/SurMesure.tsx', import.meta.url), 'utf-8')
const comp = compBrut.replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/\/\*[\s\S]*?\*\//g, '').replace(/^\s*\/\/[^\n]*$/gm, '')
for (const interdit of ['choisis pour moi', 'abri s’il pleut', 'espace pour les femmes', 'Sans rien dépenser', 'En deux heures']) {
  if (comp.includes(interdit)) casse(`« ${interdit} » est revenu à l'écran`)
}
if (!compBrut.includes('lesFiltres')) casse('la ligne des trois filtres a disparu du composant')

if (fautes) { console.error(`\n${fautes} faute(s) — build arrêté.`); process.exit(1) }
console.log('✅ filtres : trois, cumulables, instantanés, les ouverts devant.')
