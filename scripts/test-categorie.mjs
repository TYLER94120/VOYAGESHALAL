// 🔴🔴 LE TEST QUI CASSE LE BUILD SI « PRIER » RENVOIE UN RESTAURANT.
//
// Ordre de Mohamed, 15 août, après avoir reçu un traiteur libanais en
// cherchant où prier : « Écris un test automatique qui casse le build si un
// résultat de type restaurant/traiteur/café sort en mode Prier. Ce défaut
// ne doit jamais pouvoir revenir. »
//
// Le cas exact qu'il a rencontré est le premier de la liste.

import { accepte, estLieuDePriere, sertAManger } from '../lib/categorie.mjs'

const fautes = []

// ── 1. EN MODE PRIER, CES LIEUX NE PASSENT JAMAIS ────────────────────
const INTERDITS_EN_PRIERE = [
  ['AL AMIR — traiteur libanais', 'catering_service', ['catering_service', 'food', 'point_of_interest']],
  ['Master Poulet', 'restaurant', ['restaurant', 'food']],
  ['Boulangerie Al Baraka', 'bakery', ['bakery', 'store', 'food']],
  ['Café des Amis', 'cafe', ['cafe', 'food']],
  ['Boucherie Halal Bismillah', 'butcher_shop', ['butcher_shop', 'store']],
  ['Épicerie Madina', 'grocery_store', ['grocery_store', 'store']],
  ['Restaurant Le Baraka', 'turkish_restaurant', ['turkish_restaurant', 'restaurant']],
  ['Salon de thé Marrakech', 'tea_house', ['tea_house', 'cafe']],
  ['Snack Istanbul', 'fast_food_restaurant', ['fast_food_restaurant', 'restaurant']],
  // Un lieu SANS type connu : on ne devine pas que c'est une mosquée.
  ['Espace Al-Nour (type inconnu)', undefined, []],
  ['Association culturelle', 'point_of_interest', ['point_of_interest', 'establishment']],
]
for (const [nom, primaire, types] of INTERDITS_EN_PRIERE) {
  if (accepte('mosquee', primaire, types)) {
    fautes.push(`PRIER accepte « ${nom} » (${primaire ?? 'aucun type'}) — c'est exactement la faute du 15 août`)
  }
}

// ── 2. EN MODE PRIER, CES LIEUX DOIVENT PASSER ───────────────────────
const ATTENDUS_EN_PRIERE = [
  ['Grande Mosquée de Paris', 'mosque', ['mosque', 'place_of_worship']],
  ['Salle de prière', 'place_of_worship', ['place_of_worship']],
  ['Masjid Al-Rahma', 'mosque', ['mosque']],
]
for (const [nom, primaire, types] of ATTENDUS_EN_PRIERE) {
  if (!accepte('mosquee', primaire, types)) {
    fautes.push(`PRIER refuse « ${nom} » (${primaire}) — un vrai lieu de prière doit passer`)
  }
}

// ── 3. LE NOM NE DÉCIDE JAMAIS ───────────────────────────────────────
// Un nom à consonance musulmane n'est pas un lieu de prière, et un nom
// quelconque n'empêche pas d'en être un. La règle ne lit que le TYPE.
if (accepte('mosquee', 'restaurant', ['restaurant']) !== accepte('mosquee', 'restaurant', ['restaurant'])) {
  fautes.push('la règle n’est pas déterministe')
}
if (estLieuDePriere('restaurant', ['restaurant'])) {
  fautes.push('un restaurant est reconnu comme lieu de prière')
}

// ── 4. « QUE FAIRE » NE PROPOSE PAS DE RESTAURANTS ───────────────────
const INTERDITS_EN_ACTIVITE = [
  ['Master Poulet', 'restaurant', ['restaurant']],
  ['Café des Amis', 'cafe', ['cafe']],
  ['AL AMIR traiteur', 'catering_service', ['catering_service']],
  ['Bar du Coin', 'bar', ['bar']],
  ['Pizzeria Roma', 'pizza_restaurant', ['pizza_restaurant']],
]
for (const [nom, primaire, types] of INTERDITS_EN_ACTIVITE) {
  if (accepte('activite', primaire, types)) fautes.push(`QUE FAIRE accepte « ${nom} » — un lieu qui sert à manger n'est pas une activité`)
}
const ATTENDUS_EN_ACTIVITE = [
  ['Musée du Louvre', 'museum', ['museum', 'tourist_attraction']],
  ['Parc de la Villette', 'park', ['park']],
  ['Aquarium de Paris', 'aquarium', ['aquarium']],
  ['Jardin des Plantes', 'garden', ['garden', 'park']],
]
for (const [nom, primaire, types] of ATTENDUS_EN_ACTIVITE) {
  if (!accepte('activite', primaire, types)) fautes.push(`QUE FAIRE refuse « ${nom} » (${primaire}) — c'est pourtant une activité`)
}

// ── 5. Cohérence : un lieu ne peut pas être les deux ─────────────────
for (const [, primaire, types] of INTERDITS_EN_PRIERE) {
  if (sertAManger(primaire, types) && estLieuDePriere(primaire, types)) {
    fautes.push(`« ${primaire} » est reconnu à la fois comme nourriture et comme lieu de prière`)
  }
}

const total = INTERDITS_EN_PRIERE.length + ATTENDUS_EN_PRIERE.length + INTERDITS_EN_ACTIVITE.length + ATTENDUS_EN_ACTIVITE.length
if (fautes.length) {
  console.error(`\n❌ CATÉGORIES — ${fautes.length} faute(s) sur ${total} cas :\n`)
  for (const f of fautes) console.error('   · ' + f)
  console.error('')
  process.exit(1)
}
console.log(`✅ catégories : ${total} cas — aucun restaurant ne peut sortir en mode Prier, aucun en mode Que faire.`)
