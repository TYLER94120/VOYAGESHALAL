// 💶 📍 ⭐ TROIS TRIS, UN SEUL À LA FOIS, AUCUNE IA.
//
// Brief de Mohamed, 17 août : les puces deviennent des TRIS exclusifs —
// « choix unique, re-tap = retirer ». Pas cher = prix ascendant, Proche =
// distance ascendante, Bien noté = note descendante avec 20 avis minimum.
// (La veille elles étaient des filtres cumulables : changement ASSUMÉ, la
// consigne la plus récente gagne.)
//
// Ce test casse le build si :
//   1. il y a autre chose que ces trois tris ;
//   2. un tri exclut des adresses au lieu de les réordonner ;
//   3. un lieu fermé passe devant un ouvert, quel que soit le tri ;
//   4. « Bien noté » laisse un 5,0 sur trois avis prendre la tête ;
//   5. une adresse sans prix se classe comme un petit prix ;
//   6. un tri fait un appel réseau ou passe par l'IA ;
//   7. l'écran cesse d'imposer le choix unique.

import { TRIS, trisDisponibles, appliquer } from '../lib/propositions.mjs'
import { readFileSync } from 'fs'

let fautes = 0
const casse = (m) => { console.error('❌ ' + m); fautes++ }

// ── 1. Trois tris, pas quatre ──────────────────────────────────────────
if (TRIS.map((t) => t.id).join(',') !== 'pas-cher,proche,bien-note') {
  casse(`les tris ne sont plus les trois attendus : ${TRIS.map((t) => t.id).join(', ')}`)
}

const quartier = [
  { nom: 'A', distanceM: 120, ouvert: true, prix: 3, note: 4.5, nbAvis: 300 },
  { nom: 'B', distanceM: 260, ouvert: true, prix: 1, note: 4.1, nbAvis: 120 },
  { nom: 'C', distanceM: 900, ouvert: false, prix: 1, note: 4.9, nbAvis: 500 },
  { nom: 'D', distanceM: 1500, ouvert: true, prix: 2, note: 5.0, nbAvis: 3 },
  { nom: 'E', distanceM: 700, ouvert: true, note: 4.6, nbAvis: 80 },
]

// ── 2. Un tri réordonne, il n'exclut jamais ────────────────────────────
for (const t of ['pas-cher', 'proche', 'bien-note', null]) {
  const l = appliquer(quartier, t)
  if (l.length !== quartier.length) casse(`le tri « ${t} » a fait disparaître ${quartier.length - l.length} adresse(s) — un tri réordonne, il n'exclut pas`)
}

// ── 3. Les ouverts d'abord, même quand le fermé gagnerait le tri ───────
// C est fermé ET le moins cher ET le mieux noté : il ne prend jamais la tête.
for (const t of ['pas-cher', 'bien-note', 'proche']) {
  const l = appliquer(quartier, t)
  if (l[0].nom === 'C') casse(`tri « ${t} » : une adresse FERMÉE sort en tête`)
  if (l[l.length - 1].nom !== 'C') casse(`tri « ${t} » : la fermée n'est pas reléguée en fin de liste`)
}

// ── Pas cher : prix ascendant ; sans prix = derrière, pas « petit prix »
const cheap = appliquer(quartier, 'pas-cher').map((x) => x.nom)
if (cheap[0] !== 'B') casse(`« Pas cher » met ${cheap[0]} en tête au lieu de B (prix 1, ouvert)`)
if (cheap.indexOf('E') < cheap.indexOf('A')) casse('une adresse SANS prix passe devant une adresse qui en a un')

// ── 4. Bien noté : note descendante, 20 avis minimum ───────────────────
const top = appliquer(quartier, 'bien-note').map((x) => x.nom)
if (top[0] !== 'E') casse(`« Bien noté » met ${top[0]} en tête au lieu de E (4,6 sur 80 avis)`)
if (top.indexOf('D') < top.indexOf('B')) casse('un 5,0 sur TROIS avis passe devant un 4,1 sur 120 — le seuil de 20 avis a sauté')

// ── Proche : distance ascendante ───────────────────────────────────────
const pres = appliquer(quartier, 'proche').map((x) => x.nom)
if (pres[0] !== 'A') casse(`« Proche » met ${pres[0]} en tête au lieu de A (120 m, ouvert)`)

// ── Sans tri actif : le défaut reste le plus proche, ouverts devant ────
if (appliquer(quartier, null)[0].nom !== 'A') casse('sans tri actif, le plus proche des ouverts n\'est plus en tête')

// ── Un tri sans donnée ne se propose pas ───────────────────────────────
const sansPrix = quartier.map((x) => ({ ...x, prix: undefined }))
if (trisDisponibles(sansPrix).some((t) => t.id === 'pas-cher')) {
  casse('« Pas cher » est proposé alors qu\'aucune adresse n\'a de niveau de prix')
}

// ── 6. Ni IA, ni réseau ────────────────────────────────────────────────
const source = readFileSync(new URL('../lib/propositions.mjs', import.meta.url), 'utf-8')
for (const interdit of ['fetch(', 'assistant', 'await ']) {
  if (source.includes(interdit)) casse(`lib/propositions.mjs contient « ${interdit} » : un tri doit être instantané et gratuit`)
}

// ── 7. L'écran impose le choix unique ──────────────────────────────────
const comp = readFileSync(new URL('../components/lieux/SurMesure.tsx', import.meta.url), 'utf-8')
if (!/triActif/.test(comp)) casse('le composant ne porte plus l\'état « triActif » : le choix unique a disparu')
if (/setFiltres\(\(v\) => \(v\.includes/.test(comp)) casse('le cumul de filtres est revenu dans le composant')

if (fautes) { console.error(`\n${fautes} faute(s) — build arrêté.`); process.exit(1) }
console.log('✅ tris : trois, exclusifs, instantanés — les ouverts devant, les trous derrière.')
