// ⏱️ LE CROISEMENT PRIÈRE × DISTANCE — le garde-fou.
//
// C'est ce que personne d'autre ne peut écrire : Google Maps a la distance
// sans la prière, une application de prière a la prière sans le restaurant.
// Nous avons les deux. Ce test protège la seule chose qui compte ici : que
// la phrase affichée soit VRAIE.
//
// Il casse le build si :
//   1. on affiche quelque chose sans connaître l'heure de fin ou la distance ;
//   2. le temps qu'il reste pour partir n'est pas une vraie soustraction ;
//   3. « trop tard » est écrit alors qu'on arrive avant la fin ;
//   4. une phrase tranche une question religieuse ou pousse à se presser ;
//   5. une mosquée se voit compter un trajet retour qu'elle n'a pas.

import { readFileSync } from 'node:fs'
import { croisement, phraseCroisement } from '../lib/croisementPriere.mjs'

let fautes = 0
const casse = (m) => { console.error('❌ ' + m); fautes++ }
const t = (h, m) => new Date(2026, 7, 15, h, m)

// ── 1. Sans données, RIEN. Jamais une phrase rassurante sur une inconnue.
if (croisement({ distanceM: 500, finPriere: undefined }) !== null) casse('sans heure de fin, on affiche quand même quelque chose')
if (croisement({ distanceM: NaN, finPriere: t(21, 6) }) !== null) casse('sans distance, on affiche quand même quelque chose')
if (phraseCroisement(null, 'Maghrib') !== null) casse('une phrase sort d\'un croisement inexistant')

// ── 2. La soustraction est juste ───────────────────────────────────────
// 1 500 m à pied = 20 min. Mosquée : aller seul. Reste 31 min → 11 min.
const m = croisement({ distanceM: 1500, mode: 'pied', finPriere: t(21, 6), maintenant: t(20, 35), categorie: 'mosquee', aller: true })
if (m.trajetMin !== 20) casse(`1 500 m à pied donnent ${m.trajetMin} min au lieu de 20`)
if (m.partirAvantMin !== 11) casse(`il devrait rester 11 min pour partir, on annonce ${m.partirAvantMin}`)
if (m.etat !== 'large') casse(`11 minutes de marge devraient être « large », on dit « ${m.etat} »`)
if (m.arrivee.getHours() !== 20 || m.arrivee.getMinutes() !== 55) casse('l\'heure d\'arrivée est fausse')

// ── 5. Une mosquée ne compte pas de retour ─────────────────────────────
const sansAller = croisement({ distanceM: 1500, mode: 'pied', finPriere: t(21, 6), maintenant: t(20, 35), categorie: 'mosquee' })
if (sansAller.besoinMin !== m.besoinMin) casse('une mosquée se voit compter un trajet retour : on y prie, on ne revient pas pour prier')

// ── 3. « Trop tard » ne s'écrit que si on arrive APRÈS ─────────────────
// 380 m, restaurant : on y est à 20 h 40, largement avant 21 h 06 — mais on
// n'aura pas fini. La phrase doit le dire, pas crier « trop tard ».
const proche = croisement({ distanceM: 380, mode: 'pied', finPriere: t(21, 6), maintenant: t(20, 35), categorie: 'manger' })
const pProche = phraseCroisement(proche, 'Maghrib')
if (/trop tard/i.test(pProche)) casse(`« trop tard » alors qu'on arrive à l'heure : « ${pProche} »`)
if (!/prier sur place/i.test(pProche)) casse(`on n'explique pas ce qui coince réellement : « ${pProche} »`)

// Loin : là, c'est vraiment trop tard, et on le dit.
const loin = croisement({ distanceM: 3200, mode: 'pied', finPriere: t(21, 6), maintenant: t(20, 35), categorie: 'manger' })
if (!/trop tard/i.test(phraseCroisement(loin, 'Maghrib'))) casse('une adresse hors d\'atteinte n\'est pas signalée comme telle')

// ── 4. Aucune phrase ne tranche, aucune ne presse ──────────────────────
//
// 🇬🇧 1er septembre : CETTE RÈGLE NE VOYAIT QUE LE FRANÇAIS.
// `phraseCroisement(c, nom, en)` a une branche anglaise complète — et les
// quatre appels de ce test l'omettaient, donc `en` valait toujours false.
// La branche anglaise n'a JAMAIS été vérifiée. Elle portait deux fautes :
//
//   « 15 min left to DECIDE »      le nombre est une heure de DÉPART ;
//                                   la branche voisine disait « to leave ».
//   « Maghrib is SAFE »            « est large » parle de l'horloge ;
//                                   « safe » se lit comme un verdict sur la
//                                   prière — ce que cette règle interdit.
//
// On teste donc les DEUX langues, avec la liste de mots de chacune. Une
// règle écrite dans une seule langue ne protège qu'un seul site.
const INTERDIT = /dépêche|vite|cours\b|tu dois|il faut absolument|valide|invalide|péché|obligatoire|tu peux prier plus tard/i
const INTERDIT_EN = /\bhurry|\brush\b|\brun\b|you must\b|you have to\b|obligatory|mandatory|sinful|\bsin\b|invalid|\bvalid\b|\bsafe\b|pray later/i
const CAS = [m, proche, loin, croisement({ distanceM: 900, mode: 'voiture', finPriere: t(21, 6), maintenant: t(21, 0), categorie: 'manger' })]
for (const cas of CAS) {
  for (const nom of ['Maghrib', 'Asr']) {
    for (const en of [false, true]) {
      const p = phraseCroisement(cas, nom, en)
      if (!p) continue
      const interdit = en ? INTERDIT_EN : INTERDIT
      if (interdit.test(p)) casse(`(${en ? 'EN' : 'FR'}) une phrase donne un ordre ou tranche une question religieuse : « ${p} »`)
      if (!/\d/.test(p)) casse(`(${en ? 'EN' : 'FR'}) une phrase sans aucun chiffre : « ${p} » — on donne des faits, pas des impressions`)
    }
  }
}

// ── 6. Le même chiffre dit la même chose dans les deux langues ─────────
// `partirAvantMin` est une heure de DÉPART. Une traduction qui le présente
// comme un délai « pour décider » ne dit pas la même chose au lecteur.
for (const cas of [m, croisement({ distanceM: 2600, mode: 'pied', finPriere: t(21, 6), maintenant: t(20, 35), categorie: 'manger' })]) {
  const en = phraseCroisement(cas, 'Maghrib', true)
  if (en && /min left/.test(en) && !/left to leave/.test(en)) {
    casse(`(EN) le délai de départ est présenté autrement que comme un départ : « ${en} »`)
  }
}

// Le mode change vraiment le calcul : 3 km à pied ≠ 3 km en voiture.
const pied = croisement({ distanceM: 3000, mode: 'pied', finPriere: t(21, 6), maintenant: t(20, 35) })
const auto = croisement({ distanceM: 3000, mode: 'voiture', finPriere: t(21, 6), maintenant: t(20, 35) })
if (!(auto.trajetMin < pied.trajetMin)) casse('la voiture ne va pas plus vite que la marche dans notre calcul')

// ── 7. ⚠️ CE TEST GARDE-T-IL QUELQUE CHOSE DE SERVI ? ──────────────────
// Mesuré le 1er septembre : `phraseCroisement` n'est appelée que par
// components/home/EcranCiel.tsx, monté par components/home/AccueilCiel.tsx,
// que PLUS AUCUNE ROUTE n'importe. La fonctionnalité que ce fichier appelle
// « ce que personne d'autre ne peut écrire » n'est donc servie à personne,
// et ce test passe à chaque construction en donnant l'apparence d'une
// garantie. On ne casse pas le build pour autant — rebrancher ou retirer
// l'écran est une décision de produit, pas de test — mais on le DIT, fort,
// à chaque passage. Un test muet sur son inutilité est un test qui ment.
import { readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
const fichiers = []
const parcourir = (d) => {
  for (const f of readdirSync(d)) {
    if (f === 'node_modules' || f.startsWith('.')) continue
    const p = join(d, f)
    if (statSync(p).isDirectory()) parcourir(p)
    else if (/\.(tsx?|mjs)$/.test(f)) fichiers.push(p)
  }
}
for (const racine of ['app', 'components']) { try { parcourir(racine) } catch { /* absent */ } }
const importeParUneRoute = fichiers.some((f) => {
  if (f.includes('AccueilCiel') || f.includes('EcranCiel')) return false
  return /AccueilCiel/.test(readFileSync(f, 'utf8'))
})
if (!importeParUneRoute) {
  console.warn('⚠️  croisement : AccueilCiel n\'est importé par AUCUN fichier — l\'écran « croisement prière × distance » n\'est servi à personne. Ce test vérifie du code que les visiteurs ne voient pas. À rebrancher ou à retirer : décision de Mohamed.')
}

if (fautes) { console.error(`\n${fautes} faute(s) — build arrêté.`); process.exit(1) }
console.log('✅ croisement : la soustraction est juste, et aucune phrase ne tranche à la place du visiteur — vérifié en français ET en anglais.')
