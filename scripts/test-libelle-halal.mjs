// 🏷️ LE LIBELLÉ ÉTAIT À L'ENVERS — 2 344 adresses déclarées affichées
//    « à vérifier », 14 168 déductions affichées « signalé halal ».
//
// Trouvé le 13 octobre en comptant ce que les données portent réellement.
// `components/villes/PageVille.tsx` comparait `halalConfidence === 'verified'`
// à quatre endroits. **Cette valeur n'existe nulle part.** Relevé sur les
// 354 fiches, 16 512 adresses :
//
//   likely     14 168   (85,8 %)   déduit du type de cuisine (kebab, indian…)
//   yes         1 425              tag explicite d'un contributeur OSM
//   high          692
//   only          167
//   certified      60
//
// Donc le dernier cas du ternaire — « à vérifier » — attrapait les 2 344
// adresses les MIEUX sourcées, et « signalé halal » allait aux 14 168 simples
// déductions. Le tri « vérifiées d'abord » ne déplaçait rien non plus.
//
// 🔴 CE QUE CE TEST TIENT. Deux choses, et la seconde est la vraie :
//   1. la valeur fantôme ne revient pas dans le code ;
//   2. **aucune valeur présente dans les données n'est inconnue du libellé.**
//      C'est ce contrôle-là qui aurait trouvé la faute en août. Une liste de
//      valeurs écrite à la main vieillit ; les données, non.
//
// ⚠️ Et ce que le libellé n'écrira jamais : ni « certifié » (une certification
// concerne une cuisine ou un produit, pas une ligne de base de données), ni
// « vérifié » pour un tag OSM — nous ne l'avons pas vérifié nous-mêmes. Un tag
// de contributeur est une source, donc « signalé ». Une déduction faite par
// nous à partir du mot « kebab » n'est pas une source : « à confirmer ».
import { readFileSync, readdirSync } from 'node:fs'
import { libelleHalal, halalDeclare, HALAL_DECLARE } from '../lib/libelleHalal.mjs'

let fautes = 0
const casse = (m) => { console.error(`❌ ${m}`); fautes++ }

// ── 1. le libellé lui-même, dans les deux langues ──
for (const [v, fr, en] of [
  ['certified', 'signalé halal', 'reported halal'],
  ['only', 'signalé halal', 'reported halal'],
  ['yes', 'signalé halal', 'reported halal'],
  ['high', 'signalé halal', 'reported halal'],
  ['likely', 'à confirmer', 'to confirm'],
  [undefined, 'à confirmer', 'to confirm'],
  ['n_importe_quoi', 'à confirmer', 'to confirm'],
]) {
  if (libelleHalal(v, false) !== fr) casse(`libelleHalal('${v}', fr) rend « ${libelleHalal(v, false)} » au lieu de « ${fr} »`)
  if (libelleHalal(v, true) !== en) casse(`libelleHalal('${v}', en) rend « ${libelleHalal(v, true)} » au lieu de « ${en} »`)
}

// ── 2. les mots interdits ne sortent jamais du libellé ──
for (const v of [...HALAL_DECLARE, 'likely', undefined]) {
  for (const en of [false, true]) {
    const l = libelleHalal(v, en)
    if (/certifi|certified/i.test(l)) casse(`le libellé écrit « ${l} » : « certifié » est interdit pour un établissement.`)
    if (/^vérifié$|^verified$/i.test(l)) casse(`le libellé écrit « ${l} » pour un tag OSM — nous ne l'avons pas vérifié nous-mêmes.`)
  }
}

// ── 3. la valeur fantôme ne revient pas dans le code ──
const src = readFileSync('components/villes/PageVille.tsx', 'utf8')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n').filter((l) => !/^\s*(\/\/|\*)/.test(l)).join('\n')
if (/halalConfidence\s*===\s*['"]verified['"]/.test(src)) {
  casse("PageVille.tsx compare encore halalConfidence à 'verified' — une valeur qui n'existe pas dans les données.")
}

// ── 4. LE CONTRÔLE QUI COMPTE : aucune valeur des données n'est inconnue ──
const vues = new Map()
for (const f of readdirSync('data/villes').filter((x) => x.endsWith('.json'))) {
  const ville = JSON.parse(readFileSync(`data/villes/${f}`, 'utf8'))
  for (const r of ville.restaurants ?? []) {
    const v = r.halalConfidence === undefined ? '(absent)' : String(r.halalConfidence)
    vues.set(v, (vues.get(v) ?? 0) + 1)
  }
}
const CONNUES = new Set([...HALAL_DECLARE, 'likely', '(absent)'])
for (const [v, n] of vues) {
  if (!CONNUES.has(v)) {
    casse(`les données portent halalConfidence = « ${v} » (${n} adresses) et le libellé ne le connaît pas : il sortirait « à confirmer » par défaut.\n   Ajoute-le à HALAL_DECLARE dans lib/conformite.ts s'il s'agit d'une déclaration de source, sinon laisse-le ici.`)
  }
}

const total = [...vues.values()].reduce((a, b) => a + b, 0)
const declarees = [...vues].filter(([v]) => halalDeclare(v)).reduce((a, [, n]) => a + n, 0)
if (fautes) { console.error(`\n${fautes} faute(s) — build arrêté.`); process.exit(1) }
console.log(`✅ libellé halal : ${total.toLocaleString('fr-FR')} adresses, ${declarees.toLocaleString('fr-FR')} déclarées par une source et ${(total - declarees).toLocaleString('fr-FR')} déduites — aucune valeur inconnue, jamais « certifié ».`)
