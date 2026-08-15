// 🔴 LE TEST QUI EMPÊCHE « KEBAB → MASTER POULET » DE REVENIR.
//
// Mohamed, 15 août : « Je tape kebab → Master Poulet. Je tape pizza →
// Master Poulet. Je tape autre chose → Master Poulet. »
//
// La cause était que le mot tapé n'arrivait jamais jusqu'à Google. Ce
// défaut est invisible en relecture (le code avait l'air correct : il
// construisait bien une requête) et évident à l'usage. Donc il se teste,
// avant chaque build.
//
// Ce que le test garantit :
//   1. le mot tapé EST DANS la requête envoyée ;
//   2. deux demandes différentes produisent deux requêtes différentes —
//      c'est exactement ce qui manquait ;
//   3. les mots de contexte (« pas cher », « pas loin ») ne polluent pas ;
//   4. « halal » n'est jamais collé à une recherche de mosquée.

import { requeteGoogle, motsUtiles } from '../lib/requete.mjs'

const fautes = []
const v = (cond, msg) => { if (!cond) fautes.push(msg) }

// ── 1. Le mot tapé arrive intact ─────────────────────────────────────
const CAS = [
  ['kebab', 'manger', 'kebab'],
  ['pizza', 'manger', 'pizza'],
  ['une pâtisserie orientale', 'manger', 'orientale'],
  ['je veux un couscous pas cher', 'manger', 'couscous'],
  ['tacos', 'manger', 'tacos'],
  ['poulet braisé', 'manger', 'braisé'],
  ['a cheap kebab nearby', 'manger', 'kebab'],
  ['un musée pour les enfants', 'activite', 'musée'],
]
for (const [phrase, categorie, attendu] of CAS) {
  const r = requeteGoogle({ categorie, quoi: 'peu-importe', motsCles: phrase })
  if (!r.toLowerCase().includes(attendu.toLowerCase())) {
    fautes.push(`« ${phrase} » → « ${r} » : le mot « ${attendu} » a disparu de la requête`)
  }
}

// ── 2. Deux demandes différentes → deux requêtes différentes ─────────
// C'EST LE CŒUR DU DÉFAUT : avant, « kebab » et « pizza » produisaient la
// même recherche générique, donc le même établissement en tête.
const distinctes = ['kebab', 'pizza', 'pâtisserie orientale', 'couscous', 'burger']
  .map((p) => requeteGoogle({ categorie: 'manger', quoi: 'peu-importe', motsCles: p }))
const uniques = new Set(distinctes)
v(uniques.size === distinctes.length,
  `${distinctes.length} demandes différentes ne produisent que ${uniques.size} requêtes : ${[...uniques].join(' | ')}`)

// ── 3. Les mots de contexte ne polluent pas ──────────────────────────
v(motsUtiles('un kebab pas cher pas loin') === 'kebab',
  `« un kebab pas cher pas loin » → « ${motsUtiles('un kebab pas cher pas loin')} » au lieu de « kebab »`)
v(motsUtiles('je cherche quelque chose') !== '',
  'une phrase vague ne doit pas tout perdre, mais garder ce qui reste')

// ── 4. Jamais « halal » sur une mosquée ──────────────────────────────
const m = requeteGoogle({ categorie: 'mosquee', quoi: 'peu-importe', motsCles: 'mosquée halal pas loin' })
v(!/halal/i.test(m), `recherche de mosquée : « ${m} » contient « halal », ce qui est absurde`)

// ── 5. Rien d'écrit → le repli par catégorie, honnêtement ────────────
v(requeteGoogle({ categorie: 'manger', quoi: 'kebab', motsCles: '' }) === 'halal kebab',
  'sans mots écrits, la tuile choisie doit servir de repli')

if (fautes.length) {
  console.error(`\n❌ REQUÊTE — ${fautes.length} défaut(s) : le mot tapé n'arrive pas jusqu'à Google\n`)
  for (const f of fautes) console.error('   · ' + f)
  console.error('')
  process.exit(1)
}
console.log(`✅ requête : ${CAS.length} phrases arrivent intactes chez Google, ${uniques.size} requêtes distinctes sur ${distinctes.length} demandes.`)
