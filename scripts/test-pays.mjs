// 🌍 LES PAGES PAYS — DEUX RÈGLES DE LA MAISON, TENUES ICI.
//
// Ronde du 28 août. Ces 19 pages × 2 domaines étaient passées à côté des
// deux passes précédentes :
//
//  1. « UN BOUTON SANS DESTINATION N'EXISTE PAS. » Mesuré : 21 des 70
//     villes citées renvoyaient vers une fiche inexistante — Pétra, Wadi
//     Rum, les trois villes des Maldives, les trois de Zanzibar. La fiche
//     de ville a `dynamicParams = false` : ces liens rendaient un 404.
//     Trois n'étaient que des identifiants mal orthographiés (riyad →
//     riyadh, charm-el-cheikh → sharm-el-sheikh, edinburgh → edimbourg) ;
//     les 18 autres n'ont pas de fiche du tout. Leur nom et leur texte
//     restent — ce sont de vraies villes — mais le lien disparaît tant que
//     la fiche n'existe pas, et reviendra tout seul quand elle sera écrite.
//
//  2. AUCUN MOT CREUX DANS UN TITRE. « Halal Travel in Türkiye — Complete
//     Guide 2026 » et « Voyage Halal en Maroc — Guide Complet 2026 » : les
//     mots bannis le 20 août, restés ici parce qu'ils viennent d'un
//     gabarit et non d'un fichier de titres. Ce sont exactement ceux qui
//     ont fait zéro clic sur Marrakech en première page.
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { fichierRoute } from './_routes.mjs'

let fautes = 0
const casse = (m) => { console.error(`❌ ${m}`); fautes++ }

const src = readFileSync('lib/countriesData.ts', 'utf8')
const page = readFileSync(fichierRoute('destinations/pays/[pays]/page.tsx'), 'utf8')

// ── 1. aucun lien de ville ne peut mener à une fiche absente ──
const fiches = new Set(readdirSync('data/villes').filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', '')))

// La page ne lie que si la fiche existe : c'est cette garde qu'on vérifie,
// pas l'absence de villes sans fiche (le contenu éditorial reste légitime).
if (!/aUneFiche/.test(page) || !/fichesExistantes/.test(page)) {
  casse('la page pays lie de nouveau toutes les villes citées : celles sans fiche rendraient un 404')
}
if (!/readdirSync\(path\.join\(process\.cwd\(\), 'data', 'villes'\)\)/.test(page)) {
  casse('la page pays ne lit plus les fiches réellement présentes — la garde serait fondée sur rien')
}

// Les identifiants réparables, eux, doivent l'être : un lien qui POURRAIT
// mener quelque part et n'y mène pas est une perte sèche de maillage.
const REPARES = [['Riyad', 'riyadh'], ['Charm el-Cheikh', 'sharm-el-sheikh'], ['Édimbourg', 'edimbourg']]
for (const [nom, slug] of REPARES) {
  if (!fiches.has(slug)) { casse(`la fiche ${slug} a disparu — le lien « ${nom} » redeviendrait mort`); continue }
  if (!new RegExp(`name: '${nom.replace(/[.*+?^${}()|[\\]\\\\]/g, '\\\\$&')}', slug: '${slug}'`).test(src)) {
    casse(`« ${nom} » ne pointe plus vers ${slug} : le lien est de nouveau mort`)
  }
}

// Compte informatif : combien de villes citées n'ont pas encore de fiche.
let cites = 0, sansFiche = 0
for (const m of src.matchAll(/mainCities: \[([\s\S]*?)\n {4}\],/g)) {
  for (const e of m[1].matchAll(/\{ name: '[^']+', slug: '([a-z0-9-]+)'/g)) {
    cites++
    if (!fiches.has(e[1])) sansFiche++
  }
}

// ── 2. aucun mot creux dans le titre servi ──
const CREUX = /complete guide|guide complet|ultimate guide|tout savoir|découvrez/i
const bloc = page.slice(page.indexOf('title: isEN'), page.indexOf('title: isEN') + 900)
if (CREUX.test(bloc)) casse(`le titre des pages pays contient de nouveau un mot creux`)
if (!/titreSeo\(\[/.test(bloc)) casse('le titre pays ne se replie plus : il dépasserait 60 caractères sur les noms longs')

// ── 3. le titre ne promet pas un nombre de villes que la page n'affiche pas ──
// Chaque page pays n'en montre que 3 ou 4 : annoncer « 34 villes » serait
// une promesse qu'elle ne tient pas.
if (/\$\{[a-zA-Z.]*[Cc]ities?\.length\}|\d+ villes|\d+ cities/.test(bloc)) {
  casse('le titre pays annonce un nombre de villes — la page n\'en affiche que 3 ou 4')
}

if (fautes) { console.error(`\n${fautes} faute(s) — build arrêté.`); process.exit(1) }
console.log(`✅ pays : ${cites} villes citées, ${sansFiche} sans fiche ne sont plus des liens morts, titres sans mot creux.`)
