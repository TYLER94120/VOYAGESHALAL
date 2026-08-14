#!/usr/bin/env node
// 👻 LA PAGE QUI RÉPOND 200 MAIS QUI EST VIDE.
//
// Le dernier des défauts surveillés par la ronde que je n'avais jamais
// vérifié. Il est sournois : la page s'affiche parfaitement dans un
// navigateur — le JavaScript la remplit — mais ce que Google reçoit
// d'abord, c'est le HTML servi. Si ce HTML est vide, la page est indexée
// vide, et personne ne s'en aperçoit avant des semaines.
//
// ⚠️ CE SCRIPT A BESOIN D'UN SERVEUR, comme audit-donnees-structurees.mjs :
//     npm run build && PORT=3100 npm run start &
//     node scripts/audit-pages-vides.mjs
//
// CE QU'IL MESURE, sur tout le sitemap des deux domaines : le nombre de
// mots du HTML servi, une fois retirés les scripts, les styles, l'en-tête
// de navigation et le pied de page. C'est ce que voit un moteur qui
// n'exécute pas — ou exécute mal — le JavaScript.
import http from 'node:http'

const PORT = process.env.PORT_AUDIT || 3100
// Sous ce seuil, il n'y a rien à indexer : c'est une coquille.
const MOTS_MINIMUM = 120

const get = (host, path) =>
  new Promise((res) =>
    http
      .request({ host: 'localhost', port: PORT, path, headers: { Host: host } }, (x) => {
        let d = ''
        x.on('data', (c) => (d += c))
        x.on('end', () => res({ code: x.statusCode, t: d }))
      })
      .on('error', () => res({ code: 0, t: '' }))
      .end()
  )

/** Le texte réellement lisible dans le HTML servi, sans JavaScript. */
function motsVisibles(html) {
  const corps = html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<nav[\s\S]*?<\/nav>/gi, ' ')
    .replace(/<footer[\s\S]*?<\/footer>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;|&#x?[0-9a-f]+;/gi, ' ')
  return corps.split(/\s+/).filter(Boolean).length
}

const total = { pages: 0, vides: 0 }
for (const host of ['voyageshalal.fr', 'gohalaltravel.com']) {
  const sm = await get(host, '/sitemap.xml')
  const urls = [...sm.t.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^https?:\/\/[^/]+/, ''))
  const vides = []
  let n = 0
  for (const u of urls) {
    const r = await get(host, u)
    if (r.code !== 200) continue
    n++
    const mots = motsVisibles(r.t)
    if (mots < MOTS_MINIMUM) vides.push({ u, mots })
  }
  total.pages += n
  total.vides += vides.length
  console.log(`\n===== ${host} — ${n} pages`)
  console.log(`  pages sous ${MOTS_MINIMUM} mots visibles sans JavaScript : ${vides.length}`)
  vides.sort((a, b) => a.mots - b.mots).slice(0, 15).forEach((v) => console.log(`      ${String(v.mots).padStart(4)} mots  ${v.u}`))
  if (vides.length > 15) console.log(`      … et ${vides.length - 15} autres`)
}
console.log(`\nTOTAL : ${total.vides} page(s) quasi vide(s) sur ${total.pages}`)
