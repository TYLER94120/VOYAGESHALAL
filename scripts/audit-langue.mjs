// 🔎 AUDIT « MAUVAISE LANGUE SERVIE » — le défaut le plus grave d'un site
// bi-domaine, et le seul qu'on ne voit pas depuis son propre navigateur.
//
// DEUX PIÈGES DE MESURE, appris à nos dépens, et évités ici :
//  1. `fetch` de Node SUPPRIME l'en-tête Host (en-tête interdit). Un audit
//     bi-domaine écrit avec fetch mesure DEUX FOIS le même domaine et jure
//     que tout va bien. On passe donc par `http.request`.
//  2. Le HTML échappe les apostrophes en `&#x27;`. Compter ou chercher dans
//     la source brute fausse tout. On décode avant d'analyser.
//
// MÉTHODE : on ne juge pas sur un mot isolé (« Paris », « halal », le nom
// d'un plat sont les mêmes dans les deux langues). On compte des MOTS
// OUTILS — articles, prépositions, conjonctions — qui n'existent que dans
// une langue et qui reviennent forcément dans un vrai paragraphe. Un texte
// anglais qui contient dix fois « les », « des », « pour » n'est pas
// anglais, quelle que soit l'excuse.
//
// Usage : node scripts/audit-langue.mjs [http://127.0.0.1:3120] [limite]

import http from 'http'

const BASE = process.argv[2] ?? 'http://127.0.0.1:3120'
const LIMITE = Number(process.argv[3] ?? 60)
const { hostname, port } = new URL(BASE)

const FR_HOST = 'www.voyageshalal.fr'
const EN_HOST = 'www.gohalaltravel.com'

function demander(host, chemin) {
  return new Promise((res) => {
    const req = http.request(
      { host: hostname, port, path: chemin, headers: { Host: host } },
      (r) => {
        let b = ''
        r.on('data', (d) => (b += d))
        r.on('end', () => res({ code: r.statusCode, html: b }))
      },
    )
    req.on('error', () => res({ code: 0, html: '' }))
    req.setTimeout(25000, () => { req.destroy(); res({ code: 0, html: '' }) })
    req.end()
  })
}

const decoder = (s) =>
  s.replace(/&#x27;|&#39;|&rsquo;/g, "'").replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"').replace(/&#x2F;/g, '/').replace(/&nbsp;/g, ' ')
    .replace(/&eacute;/g, 'é').replace(/&egrave;/g, 'è').replace(/&agrave;/g, 'à')

/** Texte visible : sans script, sans style, sans balises, décodé. */
function texteVisible(html) {
  return decoder(
    html
      .replace(/<script[\s\S]*?<\/script>/gi, ' ')
      .replace(/<style[\s\S]*?<\/style>/gi, ' ')
      .replace(/<[^>]+>/g, ' '),
  ).replace(/\s+/g, ' ').trim()
}

// Mots outils exclusifs à une langue. Volontairement courts et fréquents :
// leur absence dans un texte de 200 mots serait anormale.
const MOTS_FR = ['les', 'des', 'une', 'pour', 'avec', 'dans', 'vous', 'nous', 'est', 'sur', 'plus', 'sont', 'aux', 'cette', 'tout', 'où']
const MOTS_EN = ['the', 'and', 'with', 'for', 'you', 'your', 'this', 'from', 'are', 'have', 'what', 'where', 'they', 'their']

function compter(texte, mots) {
  const bas = texte.toLowerCase()
  let n = 0
  for (const m of mots) {
    const re = new RegExp(`(?<![a-zà-ÿ])${m}(?![a-zà-ÿ])`, 'g')
    n += (bas.match(re) || []).length
  }
  return n
}

/** Chemins à auditer, lus dans le sitemap du domaine (pas devinés). */
async function cheminsDe(host) {
  const { html } = await demander(host, '/sitemap.xml')
  const urls = [...html.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1])
  return urls.map((u) => { try { return new URL(u).pathname } catch { return null } }).filter(Boolean)
}

/** Échantillon régulier : on couvre tout le sitemap sans tout charger. */
function echantillon(liste, n) {
  if (liste.length <= n) return liste
  const pas = liste.length / n
  return Array.from({ length: n }, (_, i) => liste[Math.floor(i * pas)])
}

async function auditer(host, langueAttendue) {
  const tous = await cheminsDe(host)
  const chemins = echantillon(tous, LIMITE)
  const defauts = []
  for (const chemin of chemins) {
    const { code, html } = await demander(host, chemin)
    if (code !== 200) { defauts.push({ chemin, quoi: `code ${code}` }); continue }
    const lang = (html.match(/<html[^>]*lang="([^"]*)"/) || [])[1] ?? ''
    const texte = texteVisible(html)
    const nMots = texte.split(' ').filter(Boolean).length
    if (nMots < 120) { defauts.push({ chemin, quoi: `page quasi vide (${nMots} mots)` }); continue }
    if (!lang.startsWith(langueAttendue)) defauts.push({ chemin, quoi: `lang="${lang}" au lieu de ${langueAttendue}` })
    const fr = compter(texte, MOTS_FR)
    const en = compter(texte, MOTS_EN)
    // Le verdict se prend sur le RAPPORT, pas sur un seuil absolu : une page
    // longue a plus de mots outils qu'une page courte, dans les deux langues.
    const attenduGagne = langueAttendue === 'fr' ? fr > en : en > fr
    if (!attenduGagne) defauts.push({ chemin, quoi: `texte servi en ${langueAttendue === 'fr' ? 'anglais' : 'français'} (fr:${fr} en:${en}, ${nMots} mots)` })
    if (!/<h1[^>]*>/.test(html)) defauts.push({ chemin, quoi: 'aucun H1' })
    const desc = (html.match(/<meta name="description" content="([^"]*)"/) || [])[1]
    if (!desc) defauts.push({ chemin, quoi: 'description absente' })
  }
  return { host, testees: chemins.length, total: tous.length, defauts }
}

const rapports = []
for (const [host, langue] of [[FR_HOST, 'fr'], [EN_HOST, 'en']]) {
  const r = await auditer(host, langue)
  rapports.push(r)
  console.log(`\n=== ${host} — ${r.testees} pages testées sur ${r.total} du sitemap`)
  if (!r.defauts.length) console.log('   aucun défaut')
  for (const d of r.defauts) console.log(`   ✗ ${d.chemin} — ${d.quoi}`)
}
const total = rapports.reduce((n, r) => n + r.defauts.length, 0)
console.log(`\n${total} défaut(s) au total.`)
process.exit(total ? 1 : 0)
