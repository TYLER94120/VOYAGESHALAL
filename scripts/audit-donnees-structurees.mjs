#!/usr/bin/env node
// 🔍 LES DONNÉES STRUCTURÉES SONT-ELLES LISIBLES PAR GOOGLE ?
//
// ⚠️ CE SCRIPT A BESOIN D'UN SERVEUR : il interroge les pages servies, il
// ne peut donc pas être branché sur `npm run build` comme les autres
// garde-fous. Usage :
//     npm run build && PORT=3100 npm run start &
//     node scripts/audit-donnees-structurees.mjs
//
// Résultat du 14 août, premier passage : **4 588 blocs sur 1 634 pages,
// zéro illisible, zéro incomplet.** Rien à corriger — mais l'outil reste
// ici pour que la prochaine vérification coûte une minute au lieu d'une
// heure.
//
// C'est l'un des défauts que la ronde surveille et que je n'ai jamais
// vérifié. Un bloc JSON-LD invalide ne casse rien à l'écran : la page
// s'affiche normalement, et l'on perd simplement les résultats enrichis
// dans Google, sans jamais le savoir.
//
// On contrôle, sur tout le sitemap des deux domaines :
//   1. le JSON est-il analysable ;
//   2. @context et @type sont-ils présents ;
//   3. les champs obligatoires des types que nous émettons ;
//   4. une FAQPage ne doit pas être vide ;
//   5. un Article doit avoir un titre, une date et un auteur.
import http from 'node:http'
const PORT = 3100

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

;(async () => {
  for (const host of ['voyageshalal.fr', 'gohalaltravel.com']) {
    const sm = await get(host, '/sitemap.xml')
    const urls = [...sm.t.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(/^https?:\/\/[^/]+/, ''))
    const defauts = { illisible: [], sansType: [], faqVide: [], articleIncomplet: [], aucun: [] }
    let blocs = 0
    for (const u of urls) {
      const r = await get(host, u)
      if (r.code !== 200) continue
      const bruts = [...r.t.matchAll(/<script type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/g)].map((m) => m[1])
      if (!bruts.length) { defauts.aucun.push(u); continue }
      for (const b of bruts) {
        blocs++
        let o
        try { o = JSON.parse(b) } catch { defauts.illisible.push(u); continue }
        const liste = Array.isArray(o) ? o : [o]
        for (const n of liste) {
          if (!n['@context'] || !n['@type']) { defauts.sansType.push(u + ' (' + (n['@type'] || 'sans type') + ')'); continue }
          if (n['@type'] === 'FAQPage' && !(n.mainEntity || []).length) defauts.faqVide.push(u)
          if (n['@type'] === 'Article' || n['@type'] === 'BlogPosting') {
            const manque = ['headline', 'datePublished', 'author'].filter((c) => !n[c])
            if (manque.length) defauts.articleIncomplet.push(u + ' → manque ' + manque.join(', '))
          }
        }
      }
    }
    console.log(`\n===== ${host} — ${urls.length} pages, ${blocs} blocs de données structurées`)
    for (const [k, v] of Object.entries(defauts)) {
      console.log('  ' + k.padEnd(18) + ' : ' + v.length)
      ;[...new Set(v)].slice(0, 8).forEach((x) => console.log('      ' + x))
      if (new Set(v).size > 8) console.log('      … et ' + (new Set(v).size - 8) + ' autres')
    }
  }
})()
