// 🔴🔴 LE TEST QUI EMPÊCHE UNE COCHE VERTE SUR UN SOUVLAKI.
//
// Mohamed, Tirana, 15 août : « "Grill & Souvlaki Stop" est marqué "✓ signalé
// halal · OSM". Le souvlaki est traditionnellement du PORC. »
//
// Le cas exact qu'il a photographié est le premier de la liste, avec les
// valeurs RÉELLES de data/villes/tirana.json.

import { readFileSync, readdirSync } from 'node:fs'
import { verdictHalal, motARisque, familleDepuisType } from '../lib/halalPrudent.mjs'

const fautes = []

// ── 1. LE CAS DE MOHAMED, valeurs réelles ────────────────────────────
const souvlaki = { nom: 'Grill & Souvlaki Stop', type: 'souvlaki, pizza, burger, chicken', halalConfidence: 'yes', source: 'osm' }
const v = verdictHalal(souvlaki)
if (v.coche) fautes.push('« Grill & Souvlaki Stop » porte encore une coche verte — c\'est la faute du 15 août')
if (v.etat !== 'a-confirmer') fautes.push(`« Grill & Souvlaki Stop » → « ${v.etat} » au lieu de « a-confirmer »`)

// ── 2. AUCUN MOT À RISQUE NE PASSE AVEC UNE COCHE ────────────────────
const A_RISQUE = [
  ['Taverna Ellinika', 'greek, taverna', 'yes'],
  ['Gyros Express', 'gyros', 'yes'],
  ['Brasserie du Centre', 'brasserie, regional', 'yes'],
  ['Tapas y Vino', 'tapas, spanish', 'yes'],
  ['Chez Jambon', 'sandwich', 'yes'],
  ['Bacon Burger House', 'burger', 'yes'],
  ['Charcuterie Fine', 'deli', 'yes'],
  ['Le Wine Bar', 'bar, wine', 'yes'],
  ['Sausage Corner', 'sausage, hot dog', 'yes'],
]
for (const [nom, type, hc] of A_RISQUE) {
  const r = verdictHalal({ nom, type, halalConfidence: hc, source: 'osm' })
  if (r.coche) fautes.push(`« ${nom} » (${type}) porte une coche verte sur la seule foi d'OSM`)
  if (r.etat !== 'a-confirmer') fautes.push(`« ${nom} » → « ${r.etat} » : un mot à risque impose « a-confirmer »`)
}

// ── 3. CE QUI DOIT RESTER « SIGNALÉ » (sans coche) ───────────────────
for (const [nom, type] of [['Istanbul Kebab', 'kebab, turkish'], ['Chez Fatima', 'moroccan'], ['Pizzeria Napoli', 'pizza']]) {
  const r = verdictHalal({ nom, type, halalConfidence: 'yes', source: 'osm' })
  if (r.etat !== 'signale') fautes.push(`« ${nom} » → « ${r.etat} » au lieu de « signale »`)
  if (r.coche) fautes.push(`« ${nom} » ne doit pas porter de coche : OpenStreetMap n'est pas une vérification`)
}

// ── 4. SEULE NOTRE VÉRIFICATION MÉRITE LA COCHE ──────────────────────
const nous = verdictHalal({ nom: 'Chez Karim', type: 'kebab', source: 'community' })
if (!nous.coche || nous.etat !== 'verifie') fautes.push('un lieu vérifié par la communauté doit porter la coche')
// …et même vérifié, un mot à risque reste prioritaire ? Non : si NOUS
// l'avons vérifié sur place, notre relevé prime — c'est le seul cas.

// ── 5. « likely » n'est pas « halal » ────────────────────────────────
const faible = verdictHalal({ nom: 'Resto du Coin', type: 'regional', halalConfidence: 'likely', source: 'osm' })
if (faible.etat !== 'a-confirmer') fautes.push(`« likely » → « ${faible.etat} » : une supposition n'est pas une déclaration`)

// ── 6. LES CATÉGORIES NE SONT PLUS DÉCORATIVES ───────────────────────
const CATS = [
  ['pizza, regional, sandwich', 'Pizza & italien'],
  // ⚠️ J'avais d'abord écrit « Pizza & italien » ici — c'est-à-dire que
  // j'avais encodé le DÉFAUT comme attendu. C'est exactement ce que
  // Mohamed reprochait : « Grill & Souvlaki Stop » classé en italien
  // parce que « pizza » apparaît plus loin dans la liste. Le premier type
  // déclaré est « souvlaki » : ce sont des grillades.
  ['souvlaki, pizza, burger, chicken', 'Kebab & grillades'],
  ['kebab, souvlaki', 'Kebab & grillades'],
  ['lebanese', 'Cuisine orientale'],
  ['indian', 'Cuisine asiatique'],
  ['regional', 'Cuisine locale'],
]
for (const [type, attendu] of CATS) {
  const f = familleDepuisType(type)
  if (f !== attendu) fautes.push(`type « ${type} » → « ${f} » au lieu de « ${attendu} »`)
}
if (familleDepuisType('') !== null) fautes.push('un type vide doit rendre null, pas une famille inventée')
if (familleDepuisType('quelque chose d\'inconnu') !== null) fautes.push('un type non reconnu doit rendre null')

// ── 7. BALAYAGE DES 354 VILLES : aucune coche sur un mot à risque ────
let examines = 0, risques = 0
for (const f of readdirSync('data/villes').filter((x) => x.endsWith('.json'))) {
  let ville
  try { ville = JSON.parse(readFileSync(`data/villes/${f}`, 'utf-8')) } catch { continue }
  for (const r of ville.restaurants ?? []) {
    examines++
    if (!motARisque(r.nom, r.type)) continue
    risques++
    const d = verdictHalal({ ...r })
    if (d.coche) fautes.push(`${ville.nom} — « ${r.nom} » porte une coche malgré un mot à risque`)
  }
}

if (fautes.length) {
  console.error(`\n❌ HALAL PRUDENT — ${fautes.length} faute(s) :\n`)
  for (const f of fautes.slice(0, 25)) console.error('   · ' + f)
  console.error('')
  process.exit(1)
}
console.log(`✅ halal prudent : ${examines} restaurants balayés dans les 354 villes, ${risques} portent un mot à risque — aucun ne peut afficher de coche verte.`)
