// 🚧 « CETTE PAGE N'EXISTE PAS » — encore faut-il qu'elle mène quelque part.
//
// Mohamed, 22 août : gohalaltravel.com/accueil-gohalal-travel rendait le 404
// d'usine de Next.js — « 404 · This page could not be found. », en anglais
// sur les deux domaines, sans un seul lien.
//
// Ce n'était pas un cas de bord : les routes du site appellent `notFound()`
// à vingt et un endroits (ville inconnue, spot retiré, article renommé,
// plan expiré). Toutes menaient à cet écran sans issue.
//
// Ce test tient trois règles :
//   1. la page existe (app/not-found.tsx) ;
//   2. elle propose de VRAIES portes — chaque lien pointe vers une route
//      qui existe dans app/. Une page d'erreur qui renvoie vers une autre
//      erreur serait pire que rien ;
//   3. elle ne s'indexe pas, mais laisse passer les liens.
// Et une quatrième, valable pour tout le site anglais : le filet d'erreur
// ne parle plus français sur gohalaltravel.com.
import { readFileSync, existsSync, readdirSync } from 'node:fs'

let fautes = 0
const casse = (m) => { console.error(`❌ ${m}`); fautes++ }

if (!existsSync('app/not-found.tsx')) {
  casse('app/not-found.tsx a disparu : le 404 d\'usine revient, sans un seul lien de sortie')
  process.exit(1)
}
const src = readFileSync('app/not-found.tsx', 'utf8')

// ── 1. les deux langues, décidées par le domaine ──
if (!/getDomainSEO/.test(src)) casse('le 404 ne regarde plus le domaine : il servirait une seule langue aux deux sites')
for (const [mot, quoi] of [['Cette page n’existe pas', 'français'], ['This page does not exist', 'anglais']]) {
  if (!src.includes(mot)) casse(`le 404 n'a plus de titre en ${quoi}`)
}

// ── 2. chaque porte mène à une route qui existe ──
const routes = new Set(readdirSync('app', { withFileTypes: true }).filter((d) => d.isDirectory()).map((d) => `/${d.name}`))
routes.add('/')
const liens = [...src.matchAll(/href: '([^']+)'/g)].map((m) => m[1])
if (liens.length < 4) casse(`le 404 ne propose que ${liens.length} porte(s) de sortie`)
for (const l of liens) {
  if (!routes.has(l)) casse(`le 404 propose « ${l} », qui n'est pas une route du site — une erreur menant à une erreur`)
}
// Le lien de contact, hors de la liste des portes.
if (!/href="\/contact"/.test(src)) casse('le 404 n\'offre plus de dire que l\'adresse devrait exister')

// ── 3. pas dans l'index de Google, mais les liens circulent ──
if (!/index: false/.test(src)) casse('le 404 s\'indexe : Google référencerait une page d\'erreur')
if (!/follow: true/.test(src)) casse('le 404 coupe le maillage interne (follow)')

// ── 4. le filet d'erreur parle la langue du domaine ──
const filet = readFileSync('app/error.tsx', 'utf8')
if (!/gohalaltravel/.test(filet)) casse('le filet d\'erreur parle français sur le site anglais')
if (!/Try again/.test(filet)) casse('le bouton du filet d\'erreur n\'a pas de version anglaise')

if (fautes) { console.error(`\n${fautes} faute(s) — build arrêté.`); process.exit(1) }
console.log(`✅ 404 : ${liens.length} portes de sortie, toutes vers des routes réelles, deux langues, hors index.`)
