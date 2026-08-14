#!/usr/bin/env node
// 🚦 LE GARDE-FOU DES PAGES « OÙ PRIER ».
//
// POURQUOI IL EST SÉPARÉ DE test-titres.mjs. Celui-là éprouve les gabarits
// sur les 354 noms de villes du dépôt — des valeurs connues à la
// construction. Ici, le nom du lieu est **saisi par un visiteur** : il
// n'existe pas encore quand on construit le site. Aucun test hors ligne ne
// pouvait donc voir les 73 titres coupés du 13 août ; seule la ronde, qui
// regarde les pages en ligne, le pouvait.
//
// D'où le changement d'approche : on n'éprouve pas les pages, on éprouve la
// RÈGLE. Si le gabarit tient sur les cas les plus durs qu'on puisse
// imaginer, il tiendra sur ce qu'un visiteur saisira demain.
//
// LES CAS DURS, tirés de ce que la ronde a réellement trouvé :
//   · un nom descriptif en français (« Mosquée magnifique ») ;
//   · un nom très long ;
//   · une ville au nom long (Bandar Seri Begawan, Charm el-Cheikh) ;
//   · les deux à la fois.
//
// Usage : node scripts/test-titres-spots.mjs

import { readFileSync } from 'node:fs'

const TITRE_MAX = 60
const DESCRIPTION_MAX = 160

// On importe la VRAIE règle, pas une copie : Node lit le TypeScript
// directement (--experimental-strip-types). Une copie recopiée à la main
// finirait par diverger du fichier qu'elle prétend éprouver — et un test
// qui teste autre chose que le code servi ne protège personne.
const { titreSpot, descriptionSpot, replier, contientDuFrancais } = await import('../lib/titreSpot.ts')

const NOMS = [
  'Parc Astérix',
  'Westfield',
  'Mosquée magnifique',
  'Salle de prière derrière le centre commercial',
  'Grande mosquée du quartier nord, à côté de la gare routière',
  'Aéroport Roissy-Charles-de-Gaulle Terminal 2E porte L',
  'Carrefour',
]
const VILLES = ['Berkane', 'Marrakech', 'Bandar Seri Begawan', 'Charm el-Cheikh', 'Paris']
const MARQUES = { fr: 'VoyagesHalal.fr', en: 'GoHalalTravel' }
const LIEUX = { fr: 'Centre commercial', en: 'Shopping mall' }

// Mots français qui ne doivent JAMAIS apparaître dans un titre anglais.
const FR_DANS_EN = /mosqu|pri[èe]re|salle|derri[èe]re|a[ée]roport|c[ôo]t[ée]|quartier|routi[èe]re/i

let echecs = 0
const rate = (quoi, texte, max) => {
  echecs++
  console.error(`  ✗ ${String(texte.length).padStart(3)}/${max}  ${quoi}\n       « ${texte} »`)
}

let pireFr = { n: 0 }, pireEn = { n: 0 }, cas = 0
for (const nom of NOMS) {
  for (const villeNom of VILLES) {
    for (const isEN of [false, true]) {
      cas++
      const marque = isEN ? MARQUES.en : MARQUES.fr
      const t = titreSpot({ nom, villeNom, marque, isEN, typeLieuEn: LIEUX.en })
      const d = descriptionSpot({ nom, villeNom, lieu: isEN ? LIEUX.en : LIEUX.fr, isEN })
      if (t.length > TITRE_MAX) rate(`titre ${isEN ? 'EN' : 'FR'} — ${nom} / ${villeNom}`, t, TITRE_MAX)
      if (d.length > DESCRIPTION_MAX) rate(`description ${isEN ? 'EN' : 'FR'} — ${nom} / ${villeNom}`, d, DESCRIPTION_MAX)
      if (isEN && FR_DANS_EN.test(t)) {
        echecs++
        console.error(`  ✗ français dans un titre ANGLAIS — ${nom} / ${villeNom}\n       « ${t} »`)
      }
      if (isEN && FR_DANS_EN.test(d)) {
        echecs++
        console.error(`  ✗ français dans une description ANGLAISE — ${nom} / ${villeNom}\n       « ${d} »`)
      }
      const pire = isEN ? pireEn : pireFr
      if (t.length > pire.n) Object.assign(pire, { n: t.length, t, nom, villeNom })
    }
  }
}

// ── Les QUATRE AUTRES gabarits bâtis sur des valeurs non maîtrisées ───────
// Mesuré le 14 août, avant correction : 75 titres coupés et 22 titres
// français servis en anglais, sur les mêmes cas durs. La cause du 13 août
// ne touchait pas que « où prier ».
const PSEUDOS = ['ahmed', 'oummxmarrakech2026', 'le_voyageur_qui_partage_ses_bons_plans']
const CAT = { fr: 'Coin prière', en: 'Prayer spot' }

const AUTRES = [
  {
    nom: '/priere/[ville]',
    titres: (v, en, marque) => replier(en
      ? [`Where to pray in ${v} — prayer spots | ${marque}`, `Where to pray in ${v} — prayer spots`, `Where to pray in ${v}`]
      : [`Où prier à ${v} — coins prière | ${marque}`, `Où prier à ${v} — coins prière`, `Où prier à ${v}`]),
    cas: VILLES.map((v) => [v]),
  },
  {
    nom: '/guide-vivant/[ville]',
    titres: (v, en) => replier(en
      ? [`Living halal guide to ${v} — by the Muslim community (7 spots)`, `Living halal guide to ${v} — 7 community spots`, `Living halal guide to ${v} (7 spots)`, `Living halal guide to ${v}`]
      : [`Guide vivant halal de ${v} — par la communauté (7 spots)`, `Guide vivant halal de ${v} — 7 spots partagés`, `Guide vivant halal de ${v} (7 spots)`, `Guide vivant halal de ${v}`]),
    cas: VILLES.map((v) => [v]),
  },
  {
    nom: '/communaute/[pseudo]',
    titres: (p, en) => replier(en
      ? [`${p} — community contributor`, `${p} — contributor`, `${p}`]
      : [`${p} — contributeur de la communauté`, `${p} — contributeur`, `${p}`]),
    cas: PSEUDOS.map((p) => [p]),
  },
]

for (const g of AUTRES) {
  for (const [v] of g.cas) {
    for (const isEN of [false, true]) {
      cas++
      const t = g.titres(v, isEN, isEN ? MARQUES.en : MARQUES.fr)
      if (t.length > TITRE_MAX) rate(`titre ${isEN ? 'EN' : 'FR'} — ${g.nom} / ${v}`, t, TITRE_MAX)
    }
  }
}

// /spot/[id] : le pire du lot, jusqu'à 123 caractères, avec le nom saisi.
for (const nom of NOMS) {
  for (const villeNom of VILLES) {
    for (const isEN of [false, true]) {
      cas++
      const nomEnAnglais = !contientDuFrancais(nom)
      const t = replier(isEN
        ? (nomEnAnglais
            ? [`${nom} — ${CAT.en} in ${villeNom} (community-shared)`, `${nom} — ${CAT.en} in ${villeNom}`, `${nom} — ${villeNom}`, `${nom}`]
            : [`${CAT.en} in ${villeNom} — shared by the community`, `${CAT.en} in ${villeNom} — community-shared`, `${CAT.en} in ${villeNom}`])
        : [`${nom} — ${CAT.fr} à ${villeNom} (partagé par la communauté)`, `${nom} — ${CAT.fr} à ${villeNom}`, `${nom} — ${villeNom}`, `${nom}`])
      if (t.length > TITRE_MAX) rate(`titre ${isEN ? 'EN' : 'FR'} — /spot/[id] / ${nom} / ${villeNom}`, t, TITRE_MAX)
      if (isEN && FR_DANS_EN.test(t)) {
        echecs++
        console.error(`  ✗ français dans un titre ANGLAIS — /spot/[id] / ${nom} / ${villeNom}\n       « ${t} »`)
      }
    }
  }
}

console.log(`\nPages « où prier » et gabarits voisins — ${cas} combinaisons`)
console.log(`   ${echecs ? '✗' : '✓'} pire titre FR ${pireFr.n}/${TITRE_MAX} — ${pireFr.nom} / ${pireFr.villeNom}`)
console.log(`   ${echecs ? '✗' : '✓'} pire titre EN ${pireEn.n}/${TITRE_MAX} — ${pireEn.nom} / ${pireEn.villeNom}`)

if (echecs) {
  console.error(`\n❌ ${echecs} problème(s) sur le gabarit des pages « où prier ».\n`)
  process.exit(1)
}
console.log('✅ les gabarits bâtis sur des valeurs saisies tiennent tous.\n')
