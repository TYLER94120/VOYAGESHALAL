// 🔢 « 1 MOSQUÉES » — dans le titre, sur 28 villes, dans les deux langues.
//
// Ronde du 5 septembre. Plutôt que deviner la prochaine faute, j'ai balayé
// les **3 153 phrases** que les gabarits produisent réellement sur les 354
// villes × 2 langues (scratchpad/grammaire.mjs) :
//
//   Où prier à Alicante : 1 mosquées et les restos halal
//   Where to pray in Alicante: 1 mosques, halal food
//
// 92 phrases, 28 villes — et dans le TITRE, la seule ligne que Google
// affiche.
//
// 🔴 LA RÈGLE EXISTAIT DÉJÀ, AILLEURS. `lib/villeFaq.ts` la tenait depuis
// toujours (`plFr`, `plEn`, avec `n > 1`) et écrivait correctement
// « 1 mosque » ; `lib/titreVille.mjs` ne l'avait pas. Sixième nuit d'affilée
// avec la même forme de défaut — une règle vraie quelque part, fausse
// ailleurs. Les deux fichiers passent maintenant par `lib/accordFr.mjs`.
//
// ⚠️ CE QUE CE TEST GARDE VRAIMENT : que l'accord reste à UN SEUL ENDROIT,
// et que les paires singulier/pluriel soient EXPLICITES. « lieux de prière »
// ne se met pas au singulier en retirant un « s » : c'est « lieu de prière ».
// Une règle naïve écrirait « 1 lieux de prière » ou « 1 lieu de prières ».
import { readFileSync } from 'node:fs'
import { accord, MOTS_ACCORDABLES } from '../lib/accordFr.mjs'
import { titresVilleFr, titresVilleEn, descriptionVille, PLAFOND_MOSQUEES } from '../lib/titreVille.mjs'

let fautes = 0
const casse = (m) => { console.error(`❌ ${m}`); fautes++ }

// ── 1. l'accord lui-même, et surtout les cas qui piègent ──
for (const [n, mot, attendu] of [
  [1, 'mosquées', 'mosquée'],
  [3, 'mosquées', 'mosquées'],
  [0, 'mosquées', 'mosquées'],          // zéro reste pluriel en français
  [1, 'lieux de prière', 'lieu de prière'],   // le pluriel porte sur le 1er mot
  [2, 'lieux de prière', 'lieux de prière'],
  [1, 'prayer places', 'prayer place'],
  [1, 'mosques', 'mosque'],
  [1, 'adresses halal', 'adresse halal'],
  [1, 'hôtels', 'hôtel'],
]) {
  const r = accord(n, mot)
  if (r !== attendu) casse(`accord(${n}, '${mot}') rend « ${r} » au lieu de « ${attendu} »`)
}
// Un compte plafonné (« 60+ ») reste toujours pluriel, même si le nombre
// brut vaut 1 — ce qui n'arrive pas, mais la garde doit exister.
if (accord(1, 'mosquées', true) !== 'mosquées') casse('un compte plafonné passe au singulier')

// ── 2. les titres servis n'écrivent plus « 1 mosquées » ──
// On teste les FONCTIONS, sur les cas limites, pas un échantillon de villes :
// c'est ce que Google recevra.
for (const [nbPriere, osm] of [[1, false], [1, true], [2, false], [2, true], [PLAFOND_MOSQUEES, false]]) {
  for (const t of [...titresVilleFr('Alicante', nbPriere, osm), ...titresVilleEn('Alicante', nbPriere, osm)]) {
    if (/\b1 (mosquées|mosques|lieux de prière|prayer places)\b/.test(t)) {
      casse(`un titre écrit un pluriel après « 1 » : « ${t} »`)
    }
    if (nbPriere === 1 && /\b1 (mosquée|mosque|lieu de prière|prayer place)\b/.test(t) === false && /\b1 /.test(t)) {
      casse(`un titre à 1 lieu n'est pas au singulier : « ${t} »`)
    }
  }
}
for (const en of [false, true]) {
  const d = descriptionVille({ nom: 'Alicante', nbRestos: 1, nbHotels: 1, en })
  if (/\b1 (adresses halal|hôtels|hotels|halal places to eat)\b/.test(d)) {
    casse(`la description écrit un pluriel après « 1 » : « ${d} »`)
  }
}

// ── 3. l'accord vit à UN SEUL endroit ──
// C'est ici que la faute reviendrait : un gabarit qui recolle un « s » à la
// main, comme le faisait villeFaq.ts avant ce soir.
for (const f of ['lib/titreVille.mjs', 'lib/villeFaq.ts']) {
  const src = readFileSync(f, 'utf8')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n').filter((l) => !/^\s*(\/\/|\*)/.test(l)).join('\n')
  if (!/accord\(/.test(src)) casse(`${f} n'utilise plus accord() : l'accord en nombre n'est plus appliqué`)
  if (/\$\{[a-zA-Z]+ > 1 \? 's' : ''\}/.test(src)) {
    casse(`${f} recolle un « s » à la main — c'est exactement ce qui a laissé « 1 mosquées » vivre dans le titre`)
  }
}

// ── 4. aucun mot de gabarit ne manque à la table des formes ──
// Un mot absent est rendu au pluriel tel quel (on ne devine pas une forme) —
// mais alors la faute revient en silence. On préfère le savoir ici.
const gabarits = readFileSync('lib/titreVille.mjs', 'utf8')
for (const m of gabarits.matchAll(/accord\([^,]+, (?:en \? )?'([^']+)'(?: : '([^']+)')?/g)) {
  for (const mot of [m[1], m[2]].filter(Boolean)) {
    if (!MOTS_ACCORDABLES.includes(mot)) {
      casse(`« ${mot} » est accordé sans figurer dans lib/accordFr.mjs : il ressortirait au pluriel après « 1 »`)
    }
  }
}

if (fautes) { console.error(`\n${fautes} faute(s) — build arrêté.`); process.exit(1) }
console.log(`✅ accord : « 1 mosquée », « 1 lieu de prière », « 1 adresse halal » — ${MOTS_ACCORDABLES.length} formes, un seul endroit.`)
