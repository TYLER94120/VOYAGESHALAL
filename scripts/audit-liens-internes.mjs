// 🔗 AUDIT DES LIENS INTERNES QUI REDIRIGENT — surtout sur le domaine anglais.
//
// POURQUOI : un lien interne vers une URL qui fait une 301 coûte deux fois.
// Pour le visiteur, un aller-retour de plus ; pour Google, du budget
// d'exploration gaspillé et un signal brouillé sur l'URL canonique. Et sur
// gohalaltravel.com, ces liens affichaient en plus une adresse FRANÇAISE
// (/horaires-priere, /application) à un public anglophone.
//
// Trouvé le 11 août : 6 adresses distinctes, dont /horaires-priere présente
// dans la barre de prière — donc sur les 816 pages du domaine anglais.
//
// MÊME PIÈGE QUE L'AUDIT DE LANGUE : `fetch` de Node supprime l'en-tête Host.
// On passe par `http.request`, sinon on mesure deux fois le même domaine.
//
// Usage : node scripts/audit-liens-internes.mjs [http://127.0.0.1:3124]

import http from 'http'

const BASE = process.argv[2] ?? 'http://127.0.0.1:3124'
const { hostname, port } = new URL(BASE)

const DOMAINES = [
  ['www.voyageshalal.fr', 'fr'],
  ['www.gohalaltravel.com', 'en'],
]

// Pages d'entrée : celles qui portent la navigation, plus un échantillon de
// chaque grande famille de gabarits.
const ENTREES = {
  fr: ['/', '/blog', '/guides', '/spots', '/destinations', '/destinations/istanbul', '/hotels/dubai', '/blog/ou-prier-aeroports', '/qibla', '/contact', '/priere/paris'],
  en: ['/', '/blog', '/guides', '/spots', '/destinations', '/destinations/istanbul', '/hotels/dubai', '/blog/where-to-pray-paris-airports', '/qibla', '/contact', '/priere/paris'],
}

function demander(host, chemin) {
  return new Promise((res) => {
    const req = http.request({ host: hostname, port, path: chemin, headers: { Host: host } }, (r) => {
      let b = ''
      r.on('data', (d) => (b += d))
      r.on('end', () => res({ code: r.statusCode, html: b, vers: r.headers.location }))
    })
    req.on('error', () => res({ code: 0, html: '' }))
    req.setTimeout(20000, () => { req.destroy(); res({ code: 0, html: '' }) })
    req.end()
  })
}

let total = 0
for (const [host, langue] of DOMAINES) {
  const liens = new Set()
  for (const p of ENTREES[langue]) {
    const { html } = await demander(host, p)
    for (const m of html.matchAll(/href="(\/[^"#?]*)"/g)) liens.add(m[1])
  }
  const mauvais = []
  for (const u of liens) {
    if (u.startsWith('/_next') || u.startsWith('/icon') || u.startsWith('/api')) continue
    const r = await demander(host, u)
    if (r.code === 301 || r.code === 308) mauvais.push(`${u} → ${r.vers}`)
    else if (r.code >= 400) mauvais.push(`${u} → code ${r.code}`)
  }
  total += mauvais.length
  console.log(`\n=== ${host} — ${liens.size} liens internes distincts`)
  if (!mauvais.length) console.log('   aucun lien redirigé ni cassé')
  for (const m of mauvais) console.log(`   ✗ ${m}`)
}
console.log(`\n${total} lien(s) à corriger.`)
process.exit(total ? 1 : 0)
