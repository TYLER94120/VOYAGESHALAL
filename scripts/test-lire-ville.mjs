// 🗺️ LE TEST DE LA BARRE UNIQUE — il tourne AVANT le build.
//
// Une seule barre doit comprendre trois choses différentes. Si elle se
// trompe, le visiteur qui écrit « un kebab pas loin » se retrouve sur le
// guide d'une ville où il n'est pas — et celui qui écrit « Istanbul » ne
// voit jamais son guide. Ces deux fautes sont invisibles en relecture et
// évidentes à l'usage : elles se testent.
//
// On teste sur les VRAIES 354 villes, pas sur un échantillon : les faux
// positifs viennent justement des noms rares (Nice, Porto, Gênes, Goa)
// qu'un échantillon choisi n'aurait pas contenus.

import { readFileSync } from 'node:fs'
import { indexerVilles, lireIntention } from '../lib/lireVille.mjs'

const villes = JSON.parse(readFileSync(new URL('../lib/cityCoords.json', import.meta.url), 'utf-8'))
const INDEX = indexerVilles(villes)

// ── 1. AUCUNE VILLE : on cherche autour du visiteur ────────────────────
// Ce sont les phrases du quotidien. Une seule qui bascule vers un guide
// de ville et la fonction principale du site est cassée.
const AUTOUR = [
  'un kebab pas loin',
  'une pâtisserie ouverte maintenant',
  'a cheap kebab nearby',
  'a nice place to eat with my family',
  'un endroit calme pour dîner en famille',
  'je sors de la salle de sport, je veux manger sain et protéiné',
  'où prier maintenant',
  'un resto pas cher tout près',
  'quelque chose à emporter',
  'un café et une pâtisserie',
  'je cherche un porto sans alcool',
  'mosquée la plus proche à pied',
  'somewhere to pray right now',
  'des gênes de poulet grillé',
  'un bath rapide',
]

// ── 2. LA VILLE SEULE : on ouvre son guide ─────────────────────────────
const GUIDE = [
  ['Istanbul', 'istanbul'],
  ['istanbul', 'istanbul'],
  ['Dubaï', 'dubai'],
  ['Kuala Lumpur', 'kuala-lumpur'],
  ['marrakech', 'marrakech'],
  ['Le Caire', 'le-caire'],
  ['Nice', 'nice'],
  ['tokyo', 'tokyo'],
]

// ── 3. UN BESOIN ET UNE VILLE : on cherche là-bas ──────────────────────
const DANS_VILLE = [
  ['une pâtisserie à Tirana', 'tirana'],
  ['un kebab à Istanbul', 'istanbul'],
  ['where to pray in Tokyo', 'tokyo'],
  ['un restaurant halal à Nice', 'nice'],
  ['que faire à Dubaï en famille', 'dubai'],
  ['a halal restaurant in Kuala Lumpur', 'kuala-lumpur'],
]

// ── 4. AMBIGU : on ne tranche pas, on propose les deux ─────────────────
const AMBIGU = [
  ['kebab Istanbul', 'istanbul'],
  ['Marrakech pas cher', 'marrakech'],
]

const fautes = []

for (const p of AUTOUR) {
  const r = lireIntention(p, INDEX)
  if (r.quoi !== 'autour') fautes.push(`AUTOUR attendu — « ${p} » → ${r.quoi} (${r.ville?.nom})`)
}
for (const [p, slug] of GUIDE) {
  const r = lireIntention(p, INDEX)
  if (r.quoi !== 'guide') fautes.push(`GUIDE attendu — « ${p} » → ${r.quoi}`)
  else if (r.ville.slug !== slug) fautes.push(`GUIDE — « ${p} » → ${r.ville.slug} au lieu de ${slug}`)
}
for (const [p, slug] of DANS_VILLE) {
  const r = lireIntention(p, INDEX)
  if (r.quoi !== 'dans-ville') fautes.push(`DANS-VILLE attendu — « ${p} » → ${r.quoi}`)
  else if (r.ville.slug !== slug) fautes.push(`DANS-VILLE — « ${p} » → ${r.ville.slug} au lieu de ${slug}`)
  else if (!r.ville.reste) fautes.push(`DANS-VILLE — « ${p} » : le besoin a disparu`)
}
for (const [p, slug] of AMBIGU) {
  const r = lireIntention(p, INDEX)
  if (r.quoi !== 'ambigu') fautes.push(`AMBIGU attendu — « ${p} » → ${r.quoi}`)
  else if (r.ville.slug !== slug) fautes.push(`AMBIGU — « ${p} » → ${r.ville.slug} au lieu de ${slug}`)
}

const total = AUTOUR.length + GUIDE.length + DANS_VILLE.length + AMBIGU.length
if (fautes.length) {
  console.error(`\n❌ BARRE UNIQUE — ${fautes.length} cas sur ${total} mal lus :\n`)
  for (const f of fautes) console.error('   · ' + f)
  console.error('')
  process.exit(1)
}
console.log(`✅ Barre unique : ${total} phrases lues correctement (${villes.length} villes indexées).`)
