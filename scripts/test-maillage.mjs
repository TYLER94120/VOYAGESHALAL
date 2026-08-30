// 🕸 LE MAILLAGE INTERNE — ce qui a été rattaché ne doit plus se détacher.
//
// Mesure du 30 août (scratchpad/maillage.mjs : les 1 633 pages des deux
// sitemaps demandées au serveur de production, en-tête Host transmis par
// node:http parce que `fetch` le refuse) :
//
//   voyageshalal.fr    281 orphelines · 581 inatteignables depuis /
//   gohalaltravel.com  280 orphelines · 344 inatteignables depuis /
//
// Une page ORPHELINE ne reçoit aucun lien d'une autre page. Une page
// INATTEIGNABLE n'a aucun chemin de liens depuis l'accueil. Ces pages sont au
// sitemap et servies en 200 — mais un robot arrive par les liens. C'est la
// cause la plus probable du fait qu'environ 30 pages sur 810 seulement
// obtiennent un affichage.
//
// Trois causes mesurées, trois règles tenues ici :
//
//  1. LE HUB HÔTELS NE LIAIT AUCUNE PAGE HÔTEL. Ses liens sortants partaient
//     tous chez HalalBooking : 333 pages /hotels/[ville] orphelines. Et le
//     hub lui-même, servi en 200, n'était annoncé à aucun sitemap.
//  2. LA GRILLE DES DESTINATIONS EST RENDUE PAR LE CLIENT. Elle ne posait que
//     111 liens dans le HTML servi sur 354 villes : 248 fiches sans chemin
//     depuis l'accueil. Un lien que seul le navigateur écrit ne raccroche rien.
//  3. LE SITE ANGLAIS ÉCRIVAIT DES URL FRANÇAISES. Au moins 75 liens internes
//     partaient en 301 (/guides/top-destinations-halal-2026 ×16,
//     /horaires-priere ×8…), et les pages pays affichaient en plus des titres
//     de guides en français à des lecteurs anglais.
//
// ⚠️ Ce test tourne à la CONSTRUCTION, sans serveur : il ne peut pas compter
// les orphelines. Il vérifie donc les MÉCANISMES qui les ont rattachées, là
// où ils peuvent disparaître — un composant retiré, un `use client` ajouté.
import { readFileSync } from 'node:fs'
import { fichierRoute } from './_routes.mjs'

let fautes = 0
const casse = (m) => { console.error(`❌ ${m}`); fautes++ }

// Le code SANS ses commentaires : le commentaire qui explique « ce composant
// n'a pas de 'use client' » ne doit pas être lu comme un 'use client'.
// (Un test qui invente des fautes est aussi nuisible qu'un test absent.)
const codeSeul = (f) => readFileSync(f, 'utf8')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n').filter((l) => !/^\s*(\/\/|\*)/.test(l)).join('\n')

const index = codeSeul('components/maillage/IndexLiens.tsx')
const hotels = readFileSync(fichierRoute('hotels/page.tsx'), 'utf8')
const dest = readFileSync(fichierRoute('destinations/page.tsx'), 'utf8')
const pays = readFileSync(fichierRoute('destinations/pays/[pays]/page.tsx'), 'utf8')
const sitemap = readFileSync('app/sitemap.ts', 'utf8')
const slugs = readFileSync('lib/slugs.ts', 'utf8')

// ── 1. l'index est rendu par le SERVEUR ──
// C'est toute sa raison d'être : c'est exactement la faute qu'il répare.
if (/'use client'/.test(index)) {
  casse('IndexLiens est devenu un composant client — ses liens ne seraient plus dans le HTML servi, et les pages redeviendraient orphelines')
}
if (!/<Link/.test(index)) casse('IndexLiens ne pose plus de <Link> : il ne raccroche plus rien')

// ── 2. le hub hôtels lie ses villes, avec LE MÊME seuil que le sitemap ──
if (!/<IndexLiens[\s/>]/.test(hotels)) casse('le hub /hotels ne liste plus ses villes — les 333 pages /hotels/[ville] redeviennent orphelines')
if (!/HOTELS_MIN_INDEX/.test(hotels)) {
  casse('le hub /hotels n\'applique plus le seuil d\'indexation : il lierait des pages qui se déclarent noindex')
}
if (!/\$\{SITE_URL\}\/hotels`/.test(sitemap)) {
  casse('le hub /hotels a disparu du sitemap — la seule porte d\'entrée de 333 pages n\'est plus annoncée')
}

// ── 3. la page destinations pose ses liens côté serveur ──
if (!/<IndexLiens[\s/>]/.test(dest)) {
  casse('la page /destinations ne rend plus l\'index serveur — 243 fiches ville n\'auraient plus de chemin depuis l\'accueil')
}
// `villes` est la liste COMPLÈTE lue dans data/villes : c'est elle qu'on
// parcourt, pas une tranche filtrée ou une première page.
if (!/liens=\{villes\.map\(/.test(dest) || !/href: `\/destinations\/\$\{v\.slug\}`/.test(dest)) {
  casse('l\'index des destinations ne parcourt plus TOUTES les villes lues : il n\'en poserait qu\'une partie')
}

// ── 4. aucun lien interne français servi sur le domaine anglais ──
if (!/export function lienGuideLocalise/.test(slugs)) casse('lienGuideLocalise a disparu : les pages pays relieraient des slugs FR sur le domaine EN')
if (!/export function liensArticleLocalises/.test(slugs)) casse('liensArticleLocalises a disparu : les articles EN réémettraient des URL FR en 301')
if (!/lienGuideLocalise/.test(pays)) casse('la page pays n\'utilise plus lienGuideLocalise — 16 pages repointeraient vers /guides/top-destinations-halal-2026 (301)')
if (/href=\{`\/\$\{g\.type === 'blog' \? 'blog' : 'guides'\}\/\$\{g\.slug\}`\}/.test(pays)) {
  casse('la page pays reconstruit un chemin de guide à la main : le slug français reviendrait sur le domaine anglais')
}
for (const f of [fichierRoute('blog/[slug]/page.tsx'), fichierRoute('guides/[slug]/page.tsx')]) {
  if (!/liensArticleLocalises\(/.test(readFileSync(f, 'utf8'))) {
    casse(`${f} rend le corps de l'article sans localiser ses liens : les 14 articles EN concernés repartiraient en 301`)
  }
}

// ── 5. la traduction ne s'invente pas ──
// Un guide sans jumeau anglais n'est PAS listé sur le domaine EN : la
// fonction doit pouvoir rendre `null`, sinon elle fabriquerait une URL.
if (!/return en \? `\/guides\/\$\{en\}` : null/.test(slugs)) {
  casse('lienGuideLocalise ne rend plus null quand le jumeau anglais n\'existe pas — il inventerait une traduction pour sauver un lien')
}

if (fautes) { console.error(`\n${fautes} faute(s) — build arrêté.`); process.exit(1) }
console.log('✅ maillage : index serveur en place sur /hotels et /destinations, hub hôtels au sitemap, aucun lien FR servi sur le domaine EN.')
