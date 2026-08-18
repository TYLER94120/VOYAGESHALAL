// ✦ AUCUN SCORE INVENTÉ, AUCUN SCORE EN DUR, AUCUN SCORE ABERRANT.
//
// Brief du 16 août : « Les scores de la maquette sont des valeurs de
// démonstration. Ne les reprends sous aucun prétexte. Aucun score ne doit
// être écrit en dur dans un composant. »
//
// Ce test casse le build si :
//   1. une ville porte un score hors de 0–10 ;
//   2. une ville sainte descend sous le seuil de sa catégorie ;
//   3. un score est écrit en dur dans un composant au lieu d'être lu ;
//   4. l'affichage cesse d'être « ✦ 9,6 » — symbole, une décimale, virgule ;
//   5. les valeurs de démonstration de la maquette reviennent dans le code.

import { readFileSync, readdirSync } from 'fs'
import { join } from 'path'
import { valider, afficher, couleurBadge, niveauDe } from '../lib/halalScore.mjs'

const RACINE = new URL('..', import.meta.url).pathname
let fautes = 0
const casse = (m) => { console.error('❌ ' + m); fautes++ }

// ── 1 et 2. Les 354 villes passent la validation ───────────────────────
let n = 0
for (const f of readdirSync(join(RACINE, 'data/villes'))) {
  if (!f.endsWith('.json')) continue
  const slug = f.replace('.json', '')
  const d = JSON.parse(readFileSync(join(RACINE, 'data/villes', f), 'utf-8'))
  const v = valider(slug, d.halalScore)
  if (!v.ok) casse(v.erreur)
  n++
}
if (n < 300) casse(`seulement ${n} villes lues — la source de données a bougé`)

// ── 4. L'affichage, écrit une seule fois ───────────────────────────────
if (afficher(9.6) !== '✦ 9,6') casse(`l'affichage rend « ${afficher(9.6)} » au lieu de « ✦ 9,6 »`)
if (afficher(10) !== '✦ 10,0') casse(`10 s'affiche « ${afficher(10)} »`)
if (afficher(null) !== null) casse('une ville sans score obtient quand même un affichage')
if (couleurBadge(9.4) !== '#146B41' || couleurBadge(8.2) !== '#1F7A4A' || couleurBadge(7.1) !== '#C77A1E' || couleurBadge(6) !== '#6B7075') {
  casse('les couleurs du badge ne suivent plus les paliers 9 / 8 / 7')
}
if (niveauDe(9.8) !== 'Ville sainte' || niveauDe(8.7) !== 'Très bon') casse('le barème ne classe plus correctement')

// ── 1 bis. La validation refuse bien ce qu'elle doit refuser ───────────
if (valider('x', 11).ok) casse('un score de 11 est accepté')
if (valider('x', -1).ok) casse('un score négatif est accepté')
if (valider('x', null).ok) casse('une ville sans score est acceptée')
if (valider('la-mecque', 9.4).ok) casse('La Mecque à 9,4 est acceptée alors que c\'est une ville sainte (≥ 9,5)')

// ── 3 et 5. Rien en dur dans les composants ────────────────────────────
const DEMO = ['9,4', '9,1', '9,0', '8,7', '8,8', '9,2', '8,1'] // valeurs de la maquette
function fichiers(dir) {
  const out = []
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    if (e.name === 'node_modules' || e.name.startsWith('.')) continue
    const p = join(dir, e.name)
    if (e.isDirectory()) out.push(...fichiers(p))
    else if (/\.tsx$/.test(e.name)) out.push(p)
  }
  return out
}
for (const f of fichiers(join(RACINE, 'components')).concat(fichiers(join(RACINE, 'app')))) {
  const src = readFileSync(f, 'utf-8').replace(/\{\/\*[\s\S]*?\*\/\}/g, '').replace(/^\s*\/\/[^\n]*$/gm, '')
  for (const d of DEMO) {
    if (src.includes(`✦ ${d}`)) casse(`${f.replace(RACINE, '')} : « ✦ ${d} » est écrit en dur — c'est une valeur de démonstration de la maquette`)
  }
}

if (fautes) { console.error(`\n${fautes} faute(s) — build arrêté.`); process.exit(1) }
console.log(`✅ HalalScore : ${n} villes valides, aucune note inventée, aucune écrite en dur.`)
