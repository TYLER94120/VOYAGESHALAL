// 📊 LE TEST QUI EMPÊCHE UNE MESURE FANTÔME.
//
// DÉFAUT TROUVÉ LE 16 AOÛT. La barre unique appelait compter('barre-ville')
// et compter('barre-autour'). Ces deux clés n'étaient PAS dans la liste
// blanche de /api/lieux/mesure : l'API répondait 400 et ne comptait rien.
// Le composant croyait mesurer, le serveur jetait tout, et personne ne
// l'aurait jamais su — un appel de mesure qui échoue est silencieux par
// construction (« compter ne doit jamais faire échouer un geste du
// visiteur », et c'est la bonne règle).
//
// Une mesure qu'on CROIT avoir est pire que pas de mesure du tout : on
// prend des décisions sur un zéro qui ne veut rien dire. D'où ce test,
// lancé avant chaque build : toute clé appelée depuis un composant doit
// exister dans la liste blanche, et toute clé de la liste blanche doit
// être lisible dans /api/admin/surmesure — sinon on compte pour rien.

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'

const RACINE = new URL('..', import.meta.url).pathname

function fichiers(dir, out = []) {
  for (const f of readdirSync(dir)) {
    const p = join(dir, f)
    if (statSync(p).isDirectory()) { if (f !== 'node_modules' && f !== '.next') fichiers(p, out) }
    else if (/\.(tsx?|mjs)$/.test(f)) out.push(p)
  }
  return out
}

// ⚠️ On retire les commentaires avant d'extraire les clés : un commentaire
// français contient des apostrophes (« l'API », « n'est »), qui
// désapparient les guillemets et fabriquent des clés fantômes — le test se
// trompait lui-même, ce qui est la pire sorte de test.
const sansCommentaires = (t) => t.replace(/\/\/[^\n]*/g, '').replace(/\/\*[\s\S]*?\*\//g, '')

// ── 1. La liste blanche du serveur ────────────────────────────────────
const routeMesure = readFileSync(join(RACINE, 'app/api/lieux/mesure/route.ts'), 'utf-8')
const bloc = routeMesure.match(/const AUTORISEES = new Set\(\[([\s\S]*?)\]\)/)
if (!bloc) { console.error('❌ liste blanche AUTORISEES introuvable dans /api/lieux/mesure'); process.exit(1) }
const AUTORISEES = new Set([...sansCommentaires(bloc[1]).matchAll(/'([^']+)'/g)].map((m) => m[1]))

// ── 2. Les clés lisibles par l'écran d'administration ─────────────────
const routeAdmin = readFileSync(join(RACINE, 'app/api/admin/surmesure/route.ts'), 'utf-8')
const LISIBLES = new Set([...sansCommentaires(routeAdmin).matchAll(/'surmesure:([^']+)'/g)].map((m) => m[1]))

// ── 3. Toutes les clés réellement appelées depuis les composants ──────
const appelees = new Map() // clé (ou préfixe) → fichier
for (const f of fichiers(join(RACINE, 'components')).concat(fichiers(join(RACINE, 'app')))) {
  const src = readFileSync(f, 'utf-8')
  for (const m of src.matchAll(/compter\('([^']+)'\)/g)) appelees.set(m[1], f)
  // compter(`cat-${v}`) : on retient le préfixe statique.
  for (const m of src.matchAll(/compter\(`([^`$]*)\$\{/g)) appelees.set(m[1] + '*', f)
}

const fautes = []

for (const [cle, f] of appelees) {
  const court = f.replace(RACINE, '')
  if (cle.endsWith('*')) {
    const prefixe = cle.slice(0, -1)
    if (![...AUTORISEES].some((a) => a.startsWith(prefixe))) {
      fautes.push(`« ${prefixe}… » appelée dans ${court} : aucune clé de la liste blanche ne commence ainsi`)
    }
    continue
  }
  // 🔵 Les clés déjà préfixées « surmesure: » sont écrites DIRECTEMENT dans
  // Redis par le serveur (app/api/lieux/route.ts) : elles ne passent pas par
  // /api/lieux/mesure, donc pas par sa liste blanche. Ce qui compte pour
  // elles, c'est qu'un écran sache les lire.
  if (cle.startsWith('surmesure:')) {
    if (!LISIBLES.has(cle.slice(10))) {
      fautes.push(`« ${cle} » écrite dans ${court} : absente de /api/admin/surmesure → personne ne pourra la lire`)
    }
    continue
  }
  if (!AUTORISEES.has(cle)) {
    fautes.push(`« ${cle} » appelée dans ${court} : absente de la liste blanche → l'API répond 400, rien n'est compté`)
  }
}

// Une clé autorisée que personne ne lit ne sert à rien non plus.
for (const cle of AUTORISEES) {
  if (!LISIBLES.has(cle)) fautes.push(`« ${cle} » est comptée mais absente de /api/admin/surmesure : personne ne pourra la lire`)
}

if (fautes.length) {
  console.error(`\n❌ MESURES — ${fautes.length} compteur(s) fantôme(s) :\n`)
  for (const f of fautes) console.error('   · ' + f)
  console.error('')
  process.exit(1)
}
console.log(`✅ mesures : ${appelees.size} clés appelées, ${AUTORISEES.size} autorisées, toutes lisibles.`)
