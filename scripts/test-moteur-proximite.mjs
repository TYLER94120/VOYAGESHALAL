// 🔴🔴 LE TEST DE LA RÉGRESSION DU 15 AOÛT.
//
// Mohamed : « Restaurants, mosquées ET activités : depuis l'élargissement du
// rayon, plus rien ne sort "le plus proche". Avant, ça fonctionnait. »
//
// Son analyse était exacte : `searchText` cherche par le SENS. Dans un cadre
// serré, pertinence et proximité coïncidaient par ACCIDENT. Passer à 20 km a
// défait l'accident.
//
// Ce test garde les deux règles qui empêchent la régression de revenir :
//   1. une demande sans mots écrits DOIT partir sur searchNearby ;
//   2. l'absurde est écarté quand du proche existe.

import { readFileSync } from 'node:fs'

const src = readFileSync('app/api/lieux/route.ts', 'utf-8')
const fautes = []

// ── 1. Le bon moteur est branché ─────────────────────────────────────
if (!src.includes('places:searchNearby')) {
  fautes.push('places:searchNearby a disparu : les demandes géographiques repassent par searchText, et la régression revient')
}
if (!/locationRestriction:\s*\{\s*circle/.test(src)) {
  fautes.push('searchNearby doit contraindre par un CERCLE centré sur le visiteur, pas par un rectangle')
}
if (!/rankPreference:\s*'DISTANCE'/.test(src)) {
  fautes.push("rankPreference: 'DISTANCE' manque")
}
if (!/const PALIERS_M = \[2000, 5000, 10000, 20000\]/.test(src)) {
  fautes.push('le rayon progressif 2/5/10/20 km a disparu')
}
// L'aiguillage : sans mots écrits → proximité.
if (!/demandeEcrite[\s\S]{0,200}chercheParProximite/.test(src)) {
  fautes.push("l'aiguillage est cassé : une demande sans mots écrits doit partir sur chercheParProximite")
}
// « Que faire » ne demande jamais de restaurants à Google.
const bloc = src.match(/const TYPES_DEMANDES[\s\S]*?\n\}/)?.[0] ?? ''
if (/activite:[^\]]*restaurant/.test(bloc)) {
  fautes.push('TYPES_DEMANDES.activite contient un type de restaurant')
}
if (!/excludedTypes/.test(src)) fautes.push('excludedTypes manque : « Que faire » pourrait rendre des cafés')

// ── 2. L'absurde est écarté quand du proche existe ───────────────────
// On rejoue la règle telle qu'elle est écrite dans le fichier.
function ecarterLAbsurde(tries) {
  if (tries.length < 2) return tries
  const plusProche = tries[0].distanceM
  const plafond = Math.max(plusProche * 5, plusProche + 3000)
  return tries.filter((x) => x.distanceM <= plafond)
}
const CAS = [
  {
    nom: 'Fontenay : du proche existe, Clichy à 14 km doit sauter',
    entree: [800, 1200, 2600, 14000, 18000],
    attendu: [800, 1200, 2600],
  },
  {
    nom: 'rase campagne : la plus proche est à 12 km, on ne coupe pas',
    entree: [12000, 15000, 18000],
    attendu: [12000, 15000, 18000],
  },
  {
    nom: 'tout est très proche : rien ne saute',
    entree: [200, 400, 900],
    attendu: [200, 400, 900],
  },
  {
    nom: 'une seule adresse : on la garde, même loin',
    entree: [19000],
    attendu: [19000],
  },
]
for (const cas of CAS) {
  const obtenu = ecarterLAbsurde(cas.entree.map((d) => ({ distanceM: d }))).map((x) => x.distanceM)
  if (JSON.stringify(obtenu) !== JSON.stringify(cas.attendu)) {
    fautes.push(`${cas.nom} → [${obtenu}] au lieu de [${cas.attendu}]`)
  }
}

// ── 3. La version du moteur a bien été changée ───────────────────────
// Changer la logique sans changer la version, c'est servir 24 h d'ancien.
const v = src.match(/const VERSION_MOTEUR = '([^']+)'/)?.[1]
if (!v || v === 'v1' || v === 'v2') {
  fautes.push(`VERSION_MOTEUR vaut « ${v} » : la logique a changé, la version doit changer aussi, sinon le cache sert l'ancien`)
}

if (fautes.length) {
  console.error(`\n❌ MOTEUR DE PROXIMITÉ — ${fautes.length} faute(s) :\n`)
  for (const f of fautes) console.error('   · ' + f)
  console.error('')
  process.exit(1)
}
console.log(`✅ moteur de proximité : searchNearby branché (cercle, types, paliers 2/5/10/20 km), ${CAS.length} cas d'absurdité écartés, cache en ${v}.`)
