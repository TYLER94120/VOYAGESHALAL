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
import { fichierRoute } from './_routes.mjs'

let fautes = 0
const casse = (m) => { console.error(`❌ ${m}`); fautes++ }

if (!existsSync('app/not-found.tsx') || !existsSync('components/erreur/Contenu404.tsx')) {
  casse('app/not-found.tsx a disparu : le 404 d\'usine revient, sans un seul lien de sortie')
  process.exit(1)
}
// Le contenu vit dans un composant CLIENT depuis le 25 août : le 404
// global fait partie de l'arbre de toutes les routes, et une lecture
// d'en-tête ici rendait le site entier dynamique (donc non cachable).
const SRC = 'components/erreur/Contenu404.tsx'
const src = readFileSync(SRC, 'utf8')
const route = readFileSync('app/not-found.tsx', 'utf8')
for (const [motif, quoi] of [[/getDomainSEO/, 'getDomainSEO'], [/\bheaders\(\)/, 'headers()'], [/\bcookies\(\)/, 'cookies()']]) {
  if (motif.test(route) || motif.test(src)) {
    casse(`le 404 lit ${quoi} : il est dans l'arbre de TOUTES les routes, le site entier redeviendrait non cachable`)
  }
}
// Le contenu reçoit sa langue de la route ; le 404 global, qui ne peut pas
// la connaître côté serveur, rend les DEUX et masque la mauvaise avant le
// premier affichage.
if (!/lang === 'en'/.test(src)) casse('le contenu du 404 ne reçoit plus sa langue de la route')
for (const l of ['fr', 'en']) {
  if (!route.includes(`lang="${l}"`)) casse(`le 404 global ne rend plus la version ${l} : un visiteur verrait l'autre langue`)
}
if (!/gohalaltravel/.test(route)) casse('le 404 global ne distingue plus les deux domaines')
// Mesuré le 25 août : avec plusieurs layouts racine, Next sert TOUJOURS le
// 404 de la racine — y compris pour un notFound() lancé depuis une page de
// groupe — et il le rend hors des layouts. Des not-found par groupe
// seraient donc du code mort : on n'en garde qu'un, celui qui rend.

// ── 1. les deux langues, décidées par le domaine ──
for (const [mot, quoi] of [['Cette page n’existe pas', 'français'], ['This page does not exist', 'anglais']]) {
  if (!src.includes(mot)) casse(`le 404 n'a plus de titre en ${quoi}`)
}

// ── 2. chaque porte mène à une route qui existe ──
// 🗄 Les groupes de routes — (dyn), (fr) — n'existent pas dans l'URL :
// app/(dyn)/guides sert bien /guides. Sans cette ouverture, ce test
// déclarait mortes huit portes parfaitement vivantes.
const dossiers = (base) => readdirSync(base, { withFileTypes: true }).filter((d) => d.isDirectory())
const routes = new Set(dossiers('app').flatMap((d) => (
  d.name.startsWith('(') && d.name.endsWith(')')
    ? dossiers(`app/${d.name}`).map((s) => `/${s.name}`)
    : [`/${d.name}`]
)))
routes.add('/')
const liens = [...src.matchAll(/href: '([^']+)'/g)].map((m) => m[1])
if (liens.length < 4) casse(`le 404 ne propose que ${liens.length} porte(s) de sortie`)
for (const l of liens) {
  if (!routes.has(l)) casse(`le 404 propose « ${l} », qui n'est pas une route du site — une erreur menant à une erreur`)
}
// Le lien de contact, hors de la liste des portes.
if (!/href="\/contact"/.test(src)) casse('le 404 n\'offre plus de dire que l\'adresse devrait exister')

// ── 3. pas dans l'index de Google, mais les liens circulent ──
if (!/index: false/.test(route)) casse('le 404 s\'indexe : Google référencerait une page d\'erreur')
if (!/follow: true/.test(route)) casse('le 404 coupe le maillage interne (follow)')

// ── 4. l'adresse de démarrage de Mohamed mène à l'accueil ──
// « Le site s'ouvre sur cette page, c'est pas la bonne page d'accueil » :
// /accueil-gohalal-travel est sa page d'ouverture de navigateur. Elle doit
// arriver sur l'accueil, pas sur un 404 — aussi bien fait soit-il.
const conf = readFileSync('next.config.ts', 'utf8')
if (!/source: '\/accueil-gohalal-travel'[\s\S]{0,120}destination: '\/'/.test(conf)) {
  casse('l\'adresse de démarrage /accueil-gohalal-travel ne renvoie plus vers l\'accueil')
}

// ── 5. le filet d'erreur parle la langue du domaine ──
const filet = readFileSync(fichierRoute('error.tsx'), 'utf8')
if (!/gohalaltravel/.test(filet)) casse('le filet d\'erreur parle français sur le site anglais')
if (!/Try again/.test(filet)) casse('le bouton du filet d\'erreur n\'a pas de version anglaise')

if (fautes) { console.error(`\n${fautes} faute(s) — build arrêté.`); process.exit(1) }
console.log(`✅ 404 : ${liens.length} portes de sortie, toutes vers des routes réelles, deux langues, hors index.`)
