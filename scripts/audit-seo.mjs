#!/usr/bin/env node
// 🔍 RELECTURE COMPLÈTE DES DEUX DOMAINES — À LANCER À LA MAIN.
//
// Ce n'est PAS un second robot : rien ne le déclenche, il ne sort pas de la
// machine, et il ne regarde pas les sites en ligne. Il lit les pages produites
// par `next start` en local, comme Google les recevrait, AVANT qu'elles ne
// partent. La surveillance des sites en ligne reste le travail de la ronde,
// qui existe déjà.
//
//   npm run build && npx next start -p 4211 &
//   node scripts/audit-seo.mjs
//
// ⚠️ DEUX PIÈGES DE MESURE, rencontrés tous les deux en écrivant ce fichier.
// Ils sont documentés parce qu'ils m'ont fait annoncer deux défauts graves
// qui n'existaient pas :
//   1. `fetch` de Node SUPPRIME l'en-tête Host → un audit bi-domaine écrit
//      avec fetch mesure DEUX FOIS le même domaine. J'ai cru voir « 812 pages
//      en mauvaise langue » : c'étaient 812 pages françaises relues ;
//   2. le HTML échappe les apostrophes en « &#x27; » → compter la source
//      brute ajoute 5 caractères par apostrophe. J'ai cru voir 39
//      descriptions trop longues : elles tenaient toutes.
// La règle qui en sort : quand un instrument annonce une catastrophe, on
// soupçonne d'abord l'instrument.

// Contrôle interne : on lit NOS pages depuis NOTRE serveur, comme Google les
// reçoit. Ce n'est pas une seconde ronde : le robot regarde les sites en
// ligne, celui-ci regarde le code avant qu'il ne parte en ligne.
import http from 'node:http'
const B = 'http://127.0.0.1:4211'
const PORT = 4211

// ⚠️ `fetch` de Node SUPPRIME l'en-tête Host (nom d'en-tête interdit par la
// spécification). Un audit bi-domaine écrit avec fetch mesure donc DEUX FOIS
// le même domaine sans prévenir — c'est ce qui m'a fait annoncer « 812 pages
// en mauvaise langue » qui n'existaient pas. On passe par http.request, qui
// laisse fixer le Host.
function lire(chemin, hote) {
  return new Promise((res, rej) => {
    const req = http.request({ host: '127.0.0.1', port: PORT, path: chemin, headers: { Host: hote } }, (r) => {
      let d = ''
      r.on('data', (c) => { d += c })
      r.on('end', () => {
        if ([301, 302, 307, 308].includes(r.statusCode) && r.headers.location) {
          const suite = r.headers.location.startsWith('http') ? new URL(r.headers.location).pathname : r.headers.location
          return lire(suite, hote).then((x) => res({ ...x, redirige: true })).catch(rej)
        }
        res({ statut: r.statusCode, corps: d, redirige: false })
      })
    })
    req.on('error', rej); req.end()
  })
}
const HOTES = { fr: 'www.voyageshalal.fr', en: 'www.gohalaltravel.com' }

async function urls(hote) {
  const x = (await lire('/sitemap.xml', hote)).corps
  const l = [...x.matchAll(/<loc>([^<]+)<\/loc>/g)].map(m => m[1])
  const bonDomaine = l.filter((u) => u.includes(hote)).length
  console.log(`  (sitemap ${hote} : ${l.length} URL, dont ${bonDomaine} sur le bon domaine)`)
  return l.map((u) => new URL(u).pathname || '/')
}
// ⚠️ Google compte le texte DÉCODÉ. Le HTML, lui, écrit « &#x27; » (6
// caractères) là où le lecteur voit « ' » (1). Mesurer la source brute fait
// donc apparaître des dépassements qui n'existent pas : c'est ce qui m'a
// fait annoncer 39 descriptions trop longues qui tenaient toutes.
const decode = (t) => t
  .replace(/&#x27;|&#39;|&apos;/g, "'").replace(/&quot;|&#34;/g, '"')
  .replace(/&#x2019;/g, '\u2019').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
  .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&')
const champ = (h, re) => { const m = h.match(re); return m ? decode(m[1]) : null }

async function audit(hote, chemins) {
  const out = []
  const file = [...chemins]
  const worker = async () => {
    while (file.length) {
      const c = file.pop()
      try {
        const t0 = Date.now()
        const r = await lire(c, hote)
        const h = r.corps
        const ms = Date.now() - t0
        out.push({
          c, statut: r.statut, ms, redirige: r.redirige,
          titre: champ(h, /<title>([^<]*)<\/title>/) || '',
          desc: champ(h, /<meta name="description" content="([^"]*)"/) || '',
          h1: (h.match(/<h1[\s>]/g) || []).length,
          jsonld: (h.match(/application\/ld\+json/g) || []).length,
          mots: h.replace(/<script[\s\S]*?<\/script>/g, '').replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length,
          lang: champ(h, /<html lang="([^"]*)"/),
        })
      } catch (e) { out.push({ c, statut: 0, err: String(e).slice(0, 60) }) }
    }
  }
  await Promise.all(Array.from({ length: 12 }, worker))
  return out
}

for (const [code, hote] of Object.entries(HOTES)) {
  const u = await urls(hote)
  const r = await audit(hote, u)
  const titresLongs = r.filter(x => x.titre.length > 60)
  const sansDesc = r.filter(x => !x.desc)
  const descLongues = r.filter(x => x.desc.length > 160)
  const sansH1 = r.filter(x => x.h1 === 0 && x.statut === 200)
  const plusieursH1 = r.filter(x => x.h1 > 1)
  const vides = r.filter(x => x.statut === 200 && x.mots < 300)
  const lentes = r.filter(x => x.ms > 1500)
  const mauvaiseLangue = r.filter(x => x.statut === 200 && x.lang !== (code === 'en' ? 'en' : 'fr'))
  const casses = r.filter(x => x.statut !== 200)
  const redirigees = r.filter(x => x.redirige)
  console.log(`\n═══ ${hote} — ${r.length} pages du sitemap ═══`)
  const l = (n, a) => console.log(`  ${String(a.length).padStart(4)} ${n}${a.length ? '   ex: ' + a.slice(0,3).map(x=>x.c).join(' · ') : ''}`)
  l('titres > 60 caractères', titresLongs)
  l('descriptions absentes', sansDesc)
  l('descriptions > 160 caractères', descLongues)
  l('aucun H1', sansH1)
  l('plusieurs H1', plusieursH1)
  l('pages quasi vides (<300 mots)', vides)
  l('pages lentes (>1,5 s)', lentes)
  l('MAUVAISE LANGUE SERVIE', mauvaiseLangue)
  l('statut != 200', casses)
  l('URL du sitemap qui REDIRIGE', redirigees)
  if (titresLongs.length) { console.log('  → les 5 plus longs :'); titresLongs.sort((a,b)=>b.titre.length-a.titre.length).slice(0,5).forEach(x=>console.log(`     ${x.titre.length} ${x.c}\n        « ${x.titre} »`)) }
}
