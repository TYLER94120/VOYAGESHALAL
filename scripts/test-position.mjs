// 🔴🔴🔴 LA POSITION EXACTE SERT À TOUT. L'ARRONDI NE SERT QU'À UNE CLÉ.
//
// Ordre de Mohamed, 16 août : « Je suis à Fontenay-sous-Bois. Le site me
// place à Paris. C'est le défaut le plus grave du site : une position
// fausse rend faux les horaires de prière, la Qibla, toutes les distances
// et tous les résultats. »
//
// La règle, sans exception :
//   · la position EXACTE nomme le lieu, calcule les distances, interroge
//     Google, donne les horaires de prière et la Qibla ;
//   · l'arrondi ne fabrique QU'UNE CLÉ DE CACHE. Il n'en ressort jamais.
//
// Ce test casse le build si :
//   A. des coordonnées arrondies à plus de 110 m servent à autre chose
//      qu'une clé de cache ;
//   B. le souvenir du nom d'un lieu est rangé sous une case trop large —
//      c'était le défaut : une case de 1,1 km, donc le nom du voisin ;
//   C. la demande de position au navigateur disparaît (getCurrentPosition,
//      enableHighAccuracy) ;
//   D. « exacte ✓ » peut s'afficher sur autre chose qu'une position GPS.

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

// ── A. Tout arrondi de coordonnées doit fabriquer une clé, et rien d'autre
// Une ligne qui arrondit lat/lng doit affecter une variable dont le nom dit
// que c'est une clé de cache. Sinon, l'approximation part dans l'affichage.
const NOMS_DE_CLE = /\b(cle|key|cacheKey|zone|empreinte|cachekey)\b/i
// On ne s'intéresse qu'aux arrondis GROSSIERS : au-delà de trois décimales
// (~110 m), ce n'est plus une approximation, c'est de la précision d'API.
// En deçà, un point peut changer de commune — c'est ça, le danger.
const ARRONDI = /\b(?:lat|lng|lon|latitude|longitude)\w*\.toFixed\(([0-2])\)/i

for (const f of fichiers(join(RACINE, 'lib')).concat(fichiers(join(RACINE, 'app')), fichiers(join(RACINE, 'components')))) {
  const court = f.replace(RACINE, '')
  for (const ligne of readFileSync(f, 'utf-8').split('\n')) {
    const m = ligne.match(ARRONDI)
    if (!m) continue
    if (/^\s*(\/\/|\*)/.test(ligne)) continue          // un commentaire n'arrondit rien
    if (!NOMS_DE_CLE.test(ligne)) {
      casse(`${court} : des coordonnées sont arrondies hors d'une clé de cache → ${ligne.trim().slice(0, 90)}`)
      continue
    }
    // B. Même dans une clé, une case trop large finit par nommer le voisin
    // quand la valeur mise en cache est un NOM de commune.
    if (/nomsConnus|reverse|commune|ville/i.test(ligne) && Number(m[1]) < 4) {
      casse(`${court} : un nom de lieu est mis en cache sur une case de plus de 100 m → ${ligne.trim().slice(0, 90)}`)
    }
  }
}

// ── B bis. Le souvenir des noms est précis au mètre ────────────────────
const pos = readFileSync(join(RACINE, 'lib/useInstantPosition.ts'), 'utf-8')
const cleNoms = pos.match(/const cle = `\$\{lat\.toFixed\((\d)\)\}/)
if (!cleNoms) casse('lib/useInstantPosition.ts : la clé du souvenir des noms est introuvable')
else if (Number(cleNoms[1]) < 5) {
  casse(`le nom d'un lieu est mémorisé sur une case de ~${Math.round(111000 / 10 ** Number(cleNoms[1]))} m : à la frontière d'une commune, on affiche celle du voisin`)
}

// ── C. On demande toujours sa position au navigateur, en haute précision ─
if (!/getCurrentPosition/.test(readFileSync(join(RACINE, 'lib/geo.ts'), 'utf-8'))) {
  casse('lib/geo.ts : getCurrentPosition a disparu — le site ne demande plus sa position au navigateur')
}
if (!/enableHighAccuracy/.test(readFileSync(join(RACINE, 'lib/geo.ts'), 'utf-8'))) {
  casse('lib/geo.ts : enableHighAccuracy a disparu — la position redevient approximative')
}
if (!/highAccuracy: true/.test(pos)) {
  casse('lib/useInstantPosition.ts : la position n\'est plus demandée en haute précision')
}

// ── D. « exacte ✓ » n'est réservé qu'au GPS ────────────────────────────
const badge = readFileSync(join(RACINE, 'components/location/PositionBadge.tsx'), 'utf-8')
if (!/const exacte = source === 'gps'/.test(badge)) {
  casse('PositionBadge : « exacte ✓ » ne dépend plus du seul GPS — une position déduite pourrait s\'afficher comme exacte')
}

// ── E. Le nom ne s'adopte que d'un vrai géocodeur ──────────────────────
if (!/j\.source === 'google' \|\| j\.source === 'nominatim'/.test(pos)) {
  casse('useInstantPosition : le nom du lieu est adopté sans vérifier qu\'il vient d\'un géocodeur — « notre ville la plus proche à 9 km » deviendrait le nom affiché')
}

if (fautes) { console.error(`\n${fautes} faute(s) — build arrêté.`); process.exit(1) }
console.log('✅ position : l\'exacte sert à tout, l\'arrondie ne sort jamais de sa clé de cache.')
