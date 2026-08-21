// 🍣 « QUAND ON VEUT DES SUSHI ON DOIT PAS TOMBER SUR DES PIZZAS. »
//
// Mohamed, 20 août, capture à l'appui : envie « Pizza » à Fontenay-sous-Bois,
// « Les 3 meilleurs — Pizza », et en dessous : rien, avec le message
// « aucune adresse jusqu'à 2 km ».
//
// Deux défauts distincts derrière cet écran :
//   1. le rayon. Une envie précise se cherchait dans un cercle de 2 km,
//      taillé pour la question « le plus proche » — pas pour « où trouver
//      des sushi ». Une envie part maintenant à 10 km.
//   2. la relecture. Le mot partait à Google et TOUT ce qu'il rendait
//      était affiché : sa recherche textuelle complète volontiers une
//      liste courte avec les restaurants du quartier. Rien ne vérifiait
//      que l'adresse servait bien le plat demandé.
//
// Ce test tient la deuxième règle : un résultat qui n'est pas le plat
// demandé n'est pas montré. Il vaut mieux un écran qui dit « aucun sushi
// à 10 km » qu'un écran qui propose une pizza à quelqu'un qui veut des
// sushi.
import { readFileSync } from 'node:fs'
import { forceEnvieGoogle, ENVIES, REQUETES_PLAT } from '../lib/envies.mjs'

let fautes = 0
const casse = (m) => { console.error(`❌ ${m}`); fautes++ }

// ── 1. le plat demandé passe, le voisin est écarté ──
const CAS = [
  // [envie, primaryType, types, nom, force attendue]
  ['sushi', 'sushi_restaurant', ['sushi_restaurant', 'restaurant'], 'Sushi Yama', 2],
  ['sushi', 'japanese_restaurant', ['japanese_restaurant'], 'Kyoto', 1],
  ['sushi', 'pizza_restaurant', ['pizza_restaurant', 'restaurant'], 'Pizza Roma', 0],
  ['sushi', 'restaurant', ['restaurant'], 'Le Comptoir', 0],
  ['pizza', 'pizza_restaurant', ['pizza_restaurant'], 'Bella Napoli', 2],
  ['pizza', 'italian_restaurant', ['italian_restaurant'], 'Trattoria', 1],
  ['pizza', 'sushi_restaurant', ['sushi_restaurant'], 'Sushi Yama', 0],
  ['pizza', 'chicken_restaurant', ['chicken_restaurant'], 'Master Poulet', 0],
  ['burger', 'hamburger_restaurant', ['hamburger_restaurant'], 'Smash', 2],
  ['burger', 'pizza_restaurant', ['pizza_restaurant'], 'Pizza Roma', 0],
  ['kebab', 'turkish_restaurant', ['turkish_restaurant'], 'Anatolia', 2],
  ['kebab', 'pizza_restaurant', ['pizza_restaurant'], 'Pizza Roma', 0],
  // Le nom nomme le plat, même si Google ne range pas le lieu : on accepte.
  ['pizza', 'restaurant', ['restaurant'], 'Pizzeria del Sole', 2],
]
for (const [envie, primaryType, types, nom, attendu] of CAS) {
  const f = forceEnvieGoogle(primaryType, types, nom, envie)
  if (f !== attendu) casse(`envie « ${envie} » + ${primaryType} « ${nom} » → force ${f}, attendu ${attendu}`)
}

// Le cas nommé par Mohamed, en une ligne : une pizzeria ne sort JAMAIS
// sur une envie de sushi, quel que soit l'angle par lequel on la regarde.
if (forceEnvieGoogle('pizza_restaurant', ['pizza_restaurant', 'restaurant', 'food'], 'Pizza Hut', 'sushi') !== 0) {
  casse('une pizzeria passe encore le filtre « sushi »')
}

// ── 2. chaque envie proposée sait se filtrer ──
for (const e of ENVIES) {
  if (!e.typesSurs?.length) casse(`l'envie « ${e.id} » n'a aucun type Google : elle ne pourrait rien filtrer`)
}
const envies = readFileSync('app/api/lieux/envies/route.ts', 'utf8')
for (const m of envies.matchAll(/id: '([a-z]+)'/g)) {
  if (!ENVIES.some((e) => e.id === m[1])) casse(`la case d'envie « ${m[1] }» ne correspond à aucune envie de lib/envies.ts`)
}

// ── 3. chaque envie a des mots de PLAT pour le repli ──
// « Restaurant asiatique » ne trouve rien parce que personne n'appelle son
// enseigne comme ça. Sans mots de plat, l'envie retombe dans l'écran vide
// du 21 août.
for (const e of ENVIES) {
  const r = REQUETES_PLAT[e.id]
  if (!r?.length) casse(`l'envie « ${e.id} » n'a aucune requête de plat pour le repli`)
  if (r?.some((q) => /^restaurant [a-zéèê]+$/.test(q) && r.length === 1)) {
    casse(`l'envie « ${e.id} » ne se replie que sur un mot de catégorie — c'est le défaut d'origine`)
  }
}

// ── 4. le moteur applique bien le filtre, le rayon et le tri ──
const moteur = readFileSync('app/api/lieux/route.ts', 'utf8')
if (!/forceEnvieGoogle/.test(moteur)) casse('le moteur n\'écarte plus les adresses hors sujet : une envie de sushi pourrait rendre une pizza')
if (!/PALIERS_ENVIE_M = \[10000/.test(moteur)) casse('une envie précise ne part plus à 10 km — l\'écran vide de Fontenay reviendrait')
if (!/nbAvis \?\? 0\) >= 20/.test(moteur)) casse('le tri au mérite a disparu : une note sur trois avis pourrait passer en tête')
const ui = readFileSync('components/lieux/SurMesure.tsx', 'utf8')
if (!/envieId: e\?\.id/.test(ui)) casse('l\'identifiant d\'envie ne part plus vers l\'API : le filtre serait inerte')
if (!/REQUETES_PLAT/.test(moteur)) casse('le repli par mots de plat a disparu — « asiatique » redeviendrait introuvable')
// Un écran vide ne doit JAMAIS affirmer une cause qu'on n'a pas mesurée.
if (/le reste du quartier ne correspond pas/i.test(ui)) casse('le message d\'écran vide réaffirme une cause non mesurée')
if (!/ecartesEnvie/.test(ui)) casse('l\'écran vide ne dit plus combien d\'adresses ont été écartées, ni pourquoi')

if (fautes) { console.error(`\n${fautes} faute(s) — build arrêté.`); process.exit(1) }
console.log(`✅ envie précise : ${CAS.length} cas vérifiés, ${ENVIES.length} envies filtrables, rayon 10 km et tri au mérite en place.`)
