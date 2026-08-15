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
const INTERDIT = /dépêche|vite|cours\b|tu dois|il faut absolument|valide|invalide|péché|obligatoire|tu peux prier plus tard/i
for (const cas of [m, proche, loin, croisement({ distanceM: 900, mode: 'voiture', finPriere: t(21, 6), maintenant: t(21, 0), categorie: 'manger' })]) {
  for (const p of ['Maghrib', 'Asr'].map((n) => phraseCroisement(cas, n))) {
    if (p && INTERDIT.test(p)) casse(`une phrase donne un ordre ou tranche une question religieuse : « ${p} »`)
    if (p && !/\d/.test(p)) casse(`une phrase sans aucun chiffre : « ${p} » — on donne des faits, pas des impressions`)
  }
}

// Le mode change vraiment le calcul : 3 km à pied ≠ 3 km en voiture.
const pied = croisement({ distanceM: 3000, mode: 'pied', finPriere: t(21, 6), maintenant: t(20, 35) })
const auto = croisement({ distanceM: 3000, mode: 'voiture', finPriere: t(21, 6), maintenant: t(20, 35) })
if (!(auto.trajetMin < pied.trajetMin)) casse('la voiture ne va pas plus vite que la marche dans notre calcul')

if (fautes) { console.error(`\n${fautes} faute(s) — build arrêté.`); process.exit(1) }
console.log('✅ croisement : la soustraction est juste, et aucune phrase ne tranche à la place du visiteur.')
