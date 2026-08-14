#!/usr/bin/env node
// 🔴 LE GARDE-FOU DE L'ALERTE ROUGE DU 16 AOÛT.
//
// Mohamed : « Le widget m'a proposé un BISTROT. C'est la faute la plus
// grave que ce site puisse commettre. » Et : « Une règle écrite dans un
// document se perd en trois nuits. Un test, non. C'est la seule façon que
// cette alerte ne se répète pas dans un mois, sur une ville que personne
// n'aura testée. »
//
// Ce test éprouve la RÈGLE (lib/alcool.mjs) sur les lieux exacts qui ont
// causé l'alerte, plus tous les pièges auxquels on peut penser. Il fait
// ÉCHOUER LA CONSTRUCTION si un seul passe.
//
// ⚠️ En .mjs, et c'est délibéré : un garde-fou branché sur le build ne
// doit jamais dépendre d'un drapeau expérimental de Node.

const { verdictAlcool, ligneAlcool } = await import('../lib/alcool.mjs')

let echecs = 0
const rate = (msg) => { echecs++; console.error(`  ✗ ${msg}`) }

// ── DOIVENT ÊTRE ÉCARTÉS ────────────────────────────────────────────
const INTERDITS = [
  // Le cas qui a déclenché l'alerte.
  { nom: 'Le Bistrot du Coin', primaryType: 'restaurant' },
  { nom: 'Bistro Parisien', primaryType: 'restaurant' },
  { nom: 'Brasserie Lipp', primaryType: 'restaurant' },
  // Types de boisson : barrage immédiat, quel que soit le nom.
  { nom: 'Chez Ahmed', primaryType: 'bar' },
  { nom: 'Halal Grill', primaryType: 'pub' },
  { nom: 'Le Palais', primaryType: 'wine_bar' },
  { nom: 'Snack', primaryType: 'night_club' },
  { nom: 'Épicerie', primaryType: 'liquor_store' },
  { nom: 'Restaurant', types: ['restaurant', 'bar'] },
  { nom: 'Grill', primaryType: 'bar_and_grill' },
  { nom: 'Maison', primaryType: 'brewery' },
  { nom: 'Fortune', primaryType: 'casino' },
  // Attributs de service : un seul « vrai » suffit.
  { nom: 'Restaurant Halal Al Amine', primaryType: 'restaurant', servesBeer: true },
  { nom: 'Kebab House', primaryType: 'restaurant', servesWine: true },
  { nom: 'Pizzeria Bella', primaryType: 'restaurant', servesCocktails: true },
  // Signal dans le nom SANS confirmation explicite → doute → refus.
  { nom: 'Le Bistrot Halal', primaryType: 'restaurant' },
  { nom: 'Pub Grill', primaryType: 'restaurant' },
  { nom: 'La Taverne', primaryType: 'restaurant' },
  { nom: 'Lounge Oriental', primaryType: 'restaurant' },
  { nom: 'Tapas y Mas', primaryType: 'restaurant' },
  { nom: 'Craft Beer Kitchen', primaryType: 'restaurant' },
  // Confirmation PARTIELLE : ce n'est pas assez.
  { nom: 'Bistrot Vert', primaryType: 'restaurant', servesBeer: false },
  { nom: 'Brasserie du Port', primaryType: 'restaurant', servesBeer: false, servesWine: false },
  // Porc.
  { nom: 'Charcuterie Fine', primaryType: 'restaurant' },
  { nom: 'Le Cochon Rose', primaryType: 'restaurant' },
  { nom: 'Chez Momo', primaryType: 'restaurant', avis: ['le jambon était excellent'] },
]

for (const l of INTERDITS) {
  const v = verdictAlcool(l)
  if (v.garde) rate(`laissé passer : « ${l.nom} » (${l.primaryType ?? l.types?.join('/')})`)
}

// ── DOIVENT PASSER ──────────────────────────────────────────────────
// Un filtre qui écarte tout ne protège personne : il laisse un écran vide
// et le visiteur va chercher ailleurs. Ces cas doivent passer.
const AUTORISES = [
  { nom: 'Restaurant Al Baraka', primaryType: 'restaurant' },
  { nom: 'Kebab Istanbul', primaryType: 'meal_takeaway' },
  { nom: 'Pâtisserie Orientale', primaryType: 'bakery' },
  { nom: 'Café des Délices', primaryType: 'cafe' },
  // ⚠️ Pièges de frontière de mot : « bar » est dedans, mais ce ne sont
  // pas des bars. Une première version les aurait écartés.
  { nom: 'Barbès Grill', primaryType: 'restaurant' },
  { nom: 'Baraka', primaryType: 'restaurant' },
  { nom: 'Le Barbecue Halal', primaryType: 'barbecue_restaurant' },
  { nom: 'Barbara Pizza', primaryType: 'pizza_restaurant' },
  // Bistrot AVEC confirmation explicite des trois : il peut passer.
  { nom: 'Bistrot Sans Alcool', primaryType: 'restaurant', servesBeer: false, servesWine: false, servesCocktails: false },
]

for (const l of AUTORISES) {
  const v = verdictAlcool(l)
  if (!v.garde) rate(`écarté à tort : « ${l.nom} » — motif ${v.motif}`)
}

// ── L'ÉTAT AFFICHÉ doit être honnête ────────────────────────────────
const sur = verdictAlcool({ nom: 'Halal Grill', primaryType: 'restaurant', servesBeer: false, servesWine: false, servesCocktails: false })
if (!sur.garde || sur.alcool !== 'non') rate('trois « non » de Google devraient donner l\'état « non »')
const flou = verdictAlcool({ nom: 'Halal Grill', primaryType: 'restaurant' })
if (!flou.garde || flou.alcool !== 'inconnu') rate('sans information, l\'état doit rester « inconnu »')
for (const en of [false, true]) {
  if (!ligneAlcool('inconnu', en).includes('⚠')) rate('la ligne « inconnu » doit porter un avertissement visible')
  if (!ligneAlcool('non', en).includes('✓')) rate('la ligne « non » doit porter une confirmation visible')
}

console.log(`\nFiltre alcool & porc — ${INTERDITS.length} cas interdits, ${AUTORISES.length} cas autorisés`)
if (echecs) {
  console.error(`\n❌ ${echecs} défaillance(s) du filtre. AUCUN établissement servant de l'alcool ne doit être proposé.\n`)
  process.exit(1)
}
console.log('✅ aucun lieu de boisson ne franchit la porte, et rien de sûr n\'est écarté à tort.\n')
