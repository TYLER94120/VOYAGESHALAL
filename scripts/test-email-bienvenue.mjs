#!/usr/bin/env node
// ✉️ LE GARDE-FOU DE L'EMAIL DE BIENVENUE.
//
// POURQUOI CE FICHIER EXISTE. Mohamed, 12 août : « les personnes laissent
// leur mail pour avoir un guide gratuit. Je ne veux pas qu'ils soient
// déçus. » Vérifié le jour même : l'email partait avec **un lien mort dans
// chaque langue**. Le premier lien de la liste française,
// `/guides/voyager-pendant-ramadan-guide-complet`, renvoyait une 404 —
// l'article est dans `/blog`, pas dans `/guides`. Côté anglais,
// `/nearby-mosque` n'existe pas non plus : le slug est `/mosque-near-me`.
//
// C'était le tout premier message reçu par quelqu'un qui venait de nous
// confier son adresse. Un lien mort à cet instant-là vaut mieux qu'aucun
// email : il dit au lecteur que personne ne relit ce qu'on lui envoie.
//
// CE QUE CE TEST VÉRIFIE, sans réseau ni serveur :
//   1. chaque chemin cité dans l'email correspond à une route réelle ou à
//      une entrée de contenu existante ;
//   2. les chemins anglais sont bien des slugs anglais.
//
// Usage : node scripts/test-email-bienvenue.mjs

import { readFileSync, existsSync, readdirSync } from 'node:fs'

const lis = (f) => readFileSync(new URL(f, import.meta.url), 'utf8')

const email = lis('../app/api/waitlist/route.ts')
const data = lis('../lib/data.ts')
const guidesEn = lis('../lib/guidesEn.ts')
const slugs = lis('../lib/slugs.ts')

// Les chemins cités dans l'email, tels qu'ils partent réellement.
const chemins = [...email.matchAll(/\$\{link\('([^']+)'/g)].map((m) => m[1])
if (chemins.length === 0) {
  console.error("✗ Aucun lien trouvé dans l'email de bienvenue — le test ne sert plus à rien.")
  process.exit(1)
}

// Les routes servies par app/ (page.tsx), y compris les slugs anglais du
// middleware, qui sont des URL publiques réelles.
const routes = new Set(['/'])
const explore = (dir, base = '') => {
  for (const e of readdirSync(new URL(dir, import.meta.url), { withFileTypes: true })) {
    if (e.isDirectory()) {
      if (e.name.startsWith('[') || e.name.startsWith('(') || e.name === 'api') continue
      explore(`${dir}/${e.name}`, `${base}/${e.name}`)
    } else if (e.name === 'page.tsx') routes.add(base || '/')
  }
}
explore('../app')
// Les slugs anglais du middleware sont eux aussi des URL publiques réelles.
for (const [, en] of slugs.matchAll(/'\/[a-z0-9-]+':\s*'(\/[a-z0-9-]+)'/g)) routes.add(en)

// Les contenus : slugs de guides et d'articles réellement définis.
const slugsContenu = new Set([
  ...[...data.matchAll(/^\s*slug: ["']([^"']+)["']/gm)].map((m) => m[1]),
  ...[...guidesEn.matchAll(/^\s*slug: '([^']+)'/gm)].map((m) => m[1]),
])

let echecs = 0
console.log(`\nEmail de bienvenue — ${chemins.length} liens`)
for (const c of chemins) {
  const m = c.match(/^\/(guides|blog)\/(.+)$/)
  const ok = m ? slugsContenu.has(m[2]) : routes.has(c)
  console.log(`   ${ok ? '✓' : '✗'} ${c}`)
  if (!ok) {
    echecs++
    console.error(`       ↑ cette adresse n'existe pas. L'inscrit reçoit une page d'erreur.`)
  }
}

if (echecs) {
  console.error(`\n❌ ${echecs} lien(s) mort(s) dans l'email de bienvenue.\n`)
  process.exit(1)
}
console.log("✅ email de bienvenue : tous les liens mènent quelque part.\n")
