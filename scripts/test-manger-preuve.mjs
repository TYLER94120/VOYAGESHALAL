// 🍽️ « MANGER » N'ENVOIE EN TÊTE QUE CE QUI A UNE PREUVE HALAL.
//
// Hoi An, 17 octobre : un restaurant sans aucune mention halal (ni dans le nom,
// ni dans le résumé, ni dans un avis) remontait parmi les trois premiers de
// « manger halal ». Ce test échoue si la liste de tête pour « manger » reçoit
// de nouveau les résultats Google sans mention.
import { readFileSync } from 'node:fs'

let fautes = 0
const casse = (m) => { console.error(`❌ ${m}`); fautes++ }

const src = readFileSync('app/api/lieux/route.ts', 'utf8')

// Seule la branche « mosquée OSM » (une fois, au début) peut écrire
// `fiches = [...spots, ...enrichies]`. Une seconde occurrence serait la branche
// « manger » qui court-circuite le filtre des mentions.
const nbFiches = (src.match(/fiches\s*=\s*\[\s*\.\.\.spots\s*,\s*\.\.\.enrichies\s*\]/g) || []).length
if (nbFiches !== 1) {
  casse(`fiches = [...spots, ...enrichies] apparaît ${nbFiches} fois (1 attendue, branche mosquée OSM) : un restaurant sans mention halal peut remonter en tête.`)
}
if (!/const\s+signales\s*=\s*c\.categorie\s*===\s*'manger'/.test(src)) {
  casse("le filtre « signales » pour la catégorie manger a disparu de app/api/lieux/route.ts")
}
if (!/non vérifié — ne le prends pas pour halal/.test(src)) {
  casse('les résultats sans preuve ne portent plus le libellé « non vérifié — ne le prends pas pour halal »')
}

if (fautes) {
  console.error(`\n${fautes} faute(s) — build arrêté.`)
  process.exit(1)
}
console.log('✅ manger : seuls les lieux avec une mention halal vont en tête ; les autres sont marqués non vérifiés.')
