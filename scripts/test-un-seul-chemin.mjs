// 🔴🔴 UN SEUL CHEMIN VERS LE MOTEUR, UNE SEULE ENTRÉE DE CACHE PAR DEMANDE.
//
// Constat de Mohamed, 16 août : « Quatre correctifs, quatre retours. Tu
// bouches des trous sur une conduite percée. » La cause qu'il désigne est
// juste : dès qu'il existe DEUX chemins vers /api/lieux, l'un transporte
// une partie de l'intention et l'autre en perd une — et un cinquième défaut
// naît au prochain changement.
//
// Ce test verrouille les deux invariants qui l'empêchent :
//   D. il n'existe qu'UN SEUL appel à /api/lieux dans tout le code ;
//   C. deux demandes différentes ne partagent JAMAIS une entrée de cache —
//      donc tout ce qui décrit la demande entre dans l'empreinte.
//
// Il ne remplace pas la refonte de l'objet Demande : il empêche seulement
// que la situation empire pendant qu'elle se fait.

import { readFileSync, readdirSync, statSync } from 'fs'
import { join } from 'path'

const RACINE = new URL('..', import.meta.url).pathname
let fautes = 0
const casse = (m) => { console.error('❌ ' + m); fautes++ }

function fichiers(dir) {
  const out = []
  for (const e of readdirSync(dir)) {
    if (e === 'node_modules' || e === '.next' || e.startsWith('.')) continue
    const p = join(dir, e)
    if (statSync(p).isDirectory()) out.push(...fichiers(p))
    else if (/\.(ts|tsx|mjs)$/.test(e)) out.push(p)
  }
  return out
}

// ── D. Un seul point d'appel ───────────────────────────────────────────
const appelants = []
for (const f of fichiers(join(RACINE, 'components')).concat(fichiers(join(RACINE, 'app')), fichiers(join(RACINE, 'lib')))) {
  if (f.includes('/app/api/')) continue                     // le serveur, pas un appelant
  const src = readFileSync(f, 'utf-8')
  for (const l of src.split('\n')) {
    if (/^\s*(\/\/|\*)/.test(l)) continue
    if (/fetch\(\s*['"`]\/api\/lieux['"`]/.test(l)) appelants.push(f.replace(RACINE, ''))
  }
}
if (appelants.length === 0) casse('plus aucun appel à /api/lieux : le moteur n\'est plus branché')
if (appelants.length > 1) {
  casse(`${appelants.length} chemins vers /api/lieux : ${appelants.join(', ')} — il en faut UN, sinon l'intention se perd en route`)
}

// ── C. L'empreinte du cache contient TOUT ce qui décrit la demande ─────
const route = readFileSync(join(RACINE, 'app/api/lieux/route.ts'), 'utf-8')
const emp = route.match(/const empreinte = `([^`]*)`/)
if (!emp) casse('app/api/lieux : l\'empreinte de cache est introuvable')
else {
  // Chacun de ces éléments change ce que le visiteur doit voir. S'il manque
  // de l'empreinte, deux demandes différentes partagent une réponse — c'est
  // « kebab » qui ressert la liste de « pizza ».
  for (const [quoi, motif] of [
    ['les mots tapés', /motsCles/],
    ['la catégorie', /categorie/],
    ['le type demandé', /\.quoi/],
    ['la zone', /zone/],
    ['la version du moteur', /VERSION_MOTEUR/],
    ['l\'ouverture', /ouvertMaintenant/],
    ['la langue', /lang/],
  ]) {
    if (!motif.test(emp[1])) casse(`l'empreinte de cache ignore ${quoi} : deux demandes différentes se partageraient une réponse`)
  }
}

// La zone arrondie n'entre QUE dans l'empreinte — jamais dans ce qu'on
// cherche ni dans ce qu'on affiche.
const lignesZone = route.split('\n').filter((l) => /\bzone\b/.test(l) && !/^\s*(\/\/|\*)/.test(l))
for (const l of lignesZone) {
  // Une STATISTIQUE peut se compter par zone arrondie — c'est même le seul
  // usage honnête d'un arrondi hors cache : savoir dans quels quartiers on
  // relâche des critères. Ce chiffre ne ressort jamais à l'écran.
  if (/zincrby|zadd|zincr/.test(l)) continue
  if (!/const zone =|empreinte/.test(l)) {
    casse(`la zone arrondie sert ailleurs que dans la clé de cache → ${l.trim().slice(0, 90)}`)
  }
}

if (fautes) { console.error(`\n${fautes} faute(s) — build arrêté.`); process.exit(1) }
console.log(`✅ un seul chemin vers /api/lieux (${appelants[0]}), et l'empreinte de cache porte toute la demande.`)
