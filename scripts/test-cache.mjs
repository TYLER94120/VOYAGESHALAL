// 🗄 LE CHANTIER CACHE — pourquoi le compte Vercel s'est mis en pause.
//
// Mesuré le 22 août sur le serveur de production local, en-tête Host des
// deux domaines :
//
//   page                     HTML       Cache-Control
//   /destinations            544 Ko     private, no-cache, no-store
//   /guides                  205 Ko     private, no-cache, no-store
//   /destinations/istanbul   152 Ko     private, no-cache, no-store
//   accueil                   64 Ko     private, no-cache, no-store
//
// Aucune page n'a le droit d'être gardée en cache. Ce n'est pas une
// décision de Vercel : c'est ce que Next.js écrit sur une page calculée à
// la demande. Résultat, chaque visite et chaque passage de robot retire
// ces octets de notre serveur — 10,77 Go sur 10 Go inclus, et les trois
// sites tombent ensemble.
//
// 🔴 LA CAUSE TIENT EN UNE LIGNE, dans app/layout.tsx :
//     export const dynamic = 'force-dynamic'
// Elle a été écrite pour une raison juste — « qu'aucune page ne soit
// servie depuis un cache figé sur la mauvaise langue ». Servir une page
// française à un anglophone serait pire que la facture. Mais elle
// s'applique au site ENTIER, et interdit le cache de tout.
//
// LA SORTIE : que la langue vienne de la ROUTE et non de l'en-tête Host.
// Une page dont la réponse ne dépend que de son adresse peut être
// fabriquée à la construction et servie depuis le cache — sans aucun
// risque de langue, par construction.
//
// Ce fichier tient la première brique : les 354 fiches de ville.
import { readFileSync, existsSync } from 'node:fs'

let fautes = 0
const casse = (m) => { console.error(`❌ ${m}`); fautes++ }

const FR = 'app/destinations/[city]/page.tsx'
const EN = 'app/en/destinations/[city]/page.tsx'
const RENDU = 'components/villes/DestinationRoute.tsx'

for (const f of [FR, EN, RENDU]) {
  if (!existsSync(f)) { casse(`${f} manque : la fiche de ville n'a plus ses deux langues`); process.exit(1) }
}

// ── 1. le rendu ne lit plus la requête ──
// C'est TOUTE la correction : tant qu'un en-tête est lu, la page reste
// recalculée à chaque visite et le cache reste interdit.
const rendu = readFileSync(RENDU, 'utf8')
for (const [motif, quoi] of [[/getDomainSEO/, 'getDomainSEO'], [/\bheaders\(\)/, 'headers()'], [/\bcookies\(\)/, 'cookies()']]) {
  if (motif.test(rendu.replace(/^\s*\/\/.*$/gm, ''))) {
    casse(`la fiche de ville lit encore ${quoi} : elle repartirait de notre serveur à chaque visite`)
  }
}

// ── 2. chaque langue a sa route, et sa langue est écrite en dur ──
const fr = readFileSync(FR, 'utf8')
const en = readFileSync(EN, 'utf8')
if (!/en: false/.test(fr) || !/en={false}/.test(fr)) casse('la route française ne force plus le français')
if (!/en: true/.test(en) || !/en={true}/.test(en)) casse('la route anglaise ne force plus l\'anglais')
for (const [f, s] of [[FR, fr], [EN, en]]) {
  if (!/generateStaticParams/.test(s)) casse(`${f} ne liste plus ses villes : elles ne pourraient pas être fabriquées d'avance`)
}

// ── 3. l'URL publique ne change pas ──
// /en/... est un chemin INTERNE. S'il devenait visible, Google indexerait
// deux adresses pour la même page.
const mw = readFileSync('middleware.ts', 'utf8')
if (!/NextResponse\.rewrite/.test(mw) || !/`\/en\$\{pathname\}`/.test(mw)) {
  casse('le middleware ne sert plus la fiche anglaise depuis son chemin interne')
}
if (!/pathname\.startsWith\('\/en\/'\)[\s\S]{0,240}redirect\(url, 301\)/.test(mw)) {
  casse('/en/... tapé à la main ne renvoie plus vers l\'URL publique — Google verrait un doublon')
}

// ── 4. le verrou qui reste, et qui est connu ──
// Tant que cette ligne est là, les fiches restent dynamiques MALGRÉ le
// travail ci-dessus : le layout racine lit l'en-tête pour toute route.
// Ce test ne la casse pas — il refuse qu'on l'oublie.
const layout = readFileSync('app/layout.tsx', 'utf8')
if (/force-dynamic/.test(layout) && !/CHANTIER CACHE/.test(layout)) {
  casse('app/layout.tsx force le rendu dynamique du site entier sans dire où en est le chantier — la facture reviendra sans que personne sache pourquoi')
}

if (fautes) { console.error(`\n${fautes} faute(s) — build arrêté.`); process.exit(1) }
console.log('✅ cache : la fiche de ville a ses deux langues par la route, sans lire la requête ; l\'URL publique et le canonique ne bougent pas.')
