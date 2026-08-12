#!/usr/bin/env node
// 🚦 LE GARDE-FOU DES TITRES ET DES DESCRIPTIONS.
//
// POURQUOI CE FICHIER EXISTE. Mohamed : « Je n'arrête pas de remonter des
// problèmes avec des captures d'écran. Ce n'est pas normal. » Il a raison, et
// un défaut de titre est le pire du genre : invisible sur le site, visible
// seulement dans les résultats Google, des semaines plus tard.
//
// CE QU'IL VÉRIFIE, sans réseau et sans serveur — donc lançable à chaque
// modification :
//   1. les GABARITS se replient sur les noms de villes les plus longs
//      (c'est le défaut réel : un gabarit juste pour « Dubaï » et faux pour
//      « Bandar Seri Begawan ») ;
//   2. les titres ÉCRITS À LA MAIN dans lib/data.ts et lib/guidesEn.ts
//      tiennent dans ce que Google affiche ;
//   3. les descriptions aussi.
//
// Il sort en code 1 si un seul dépasse : la construction s'arrête, et la page
// fautive ne part jamais en ligne.
//
// Usage : node scripts/test-titres.mjs

import { readFileSync, readdirSync } from 'node:fs'

const TITRE_MAX = 60
const DESCRIPTION_MAX = 160

let echecs = 0
const rate = (quoi, longueur, max, texte) => {
  echecs++
  console.error(`  ✗ ${String(longueur).padStart(3)}/${max}  ${quoi}\n       « ${texte} »`)
}

// ── 1. Les gabarits, éprouvés sur les vrais noms de villes ────────────────
// On rejoue la règle de lib/titre-seo (copiée ici : le test ne doit pas
// dépendre d'un compilateur TypeScript pour tourner).
const titreSeo = (versions, max = TITRE_MAX) =>
  versions.find((v) => v.trim().length <= max) ?? null

const villes = JSON.parse(readFileSync(new URL('../lib/cityCoords.json', import.meta.url), 'utf8'))
const nomsEn = (() => {
  // nom_en quand il existe, sinon le nom français (c'est ce que font les
  // gabarits eux-mêmes via `ville.nom_en ?? ville.nom`).
  const m = {}
  for (const v of villes) m[v.slug] = v.nom
  return m
})()

const GABARITS = [
  {
    nom: 'hôtels (FR)',
    versions: (v) => [
      `Hôtels halal ${v} 2026 : sans alcool, mosquée proche`,
      `Hôtels halal ${v} : sans alcool, mosquée proche`,
      `Hôtels halal ${v} 2026 : sans alcool`,
      `Hôtels halal ${v}`,
    ],
  },
  {
    nom: 'hôtels (EN)',
    versions: (v) => [
      `Halal Hotels in ${v} 2026: Alcohol-Free, Near a Mosque`,
      `Halal Hotels in ${v} 2026: Alcohol-Free`,
      `Halal Hotels in ${v}: Alcohol-Free`,
      `Halal Hotels in ${v}`,
    ],
  },
  {
    nom: 'destinations (FR)',
    versions: (v) => [
      `${v} Halal 2026 : Restaurants, Mosquées & Prière`,
      `${v} Halal 2026 : Restaurants & Mosquées`,
      `${v} Halal : Restaurants & Mosquées`,
      `${v} Halal 2026`,
    ],
  },
  {
    nom: 'destinations (EN)',
    versions: (v) => [
      `${v} Halal Guide 2026: Restaurants, Mosques & Prayer`,
      `${v} Halal Guide 2026: Restaurants & Mosques`,
      `${v} Halal Guide: Restaurants & Mosques`,
      `${v} Halal Guide 2026`,
    ],
  },
]

// Les gabarits de DESCRIPTION, éprouvés eux aussi : c'est le même défaut,
// il déborde sur les mêmes villes, et il touchait 33 pages hôtels.
const GABARITS_DESC = [
  {
    nom: 'hôtels (FR)',
    versions: (v) => [
      `99+ hôtels halal-friendly à ${v} : options sans alcool, proches des mosquées, adaptés aux familles. Comparez et réservez pour votre voyage musulman.`,
      `99+ hôtels halal-friendly à ${v} : options sans alcool, proches des mosquées, adaptés aux familles. Comparez et réservez.`,
      `99+ hôtels halal-friendly à ${v} : options sans alcool, proches des mosquées, adaptés aux familles.`,
      `99+ hôtels halal-friendly à ${v} : options sans alcool, proches des mosquées.`,
    ],
  },
  {
    nom: 'hôtels (EN)',
    versions: (v) => [
      `99+ halal-friendly hotels in ${v}: alcohol-free options, near mosques, family-friendly. Compare and book for your Muslim trip.`,
      `99+ halal-friendly hotels in ${v}: alcohol-free options, near mosques, family-friendly.`,
      `99+ halal-friendly hotels in ${v}: alcohol-free options, near mosques.`,
    ],
  },
]

console.log(`\n1. Gabarits éprouvés sur les ${villes.length} villes réelles`)
for (const g of GABARITS) {
  let pire = { n: 0, nom: '', titre: '' }
  for (const v of villes) {
    const nom = g.nom.includes('EN') ? (nomsEn[v.slug] ?? v.nom) : v.nom
    const t = titreSeo(g.versions(nom))
    if (t === null) {
      rate(`gabarit « ${g.nom} » ne se replie pas pour « ${nom} »`, g.versions(nom).at(-1).length, TITRE_MAX, g.versions(nom).at(-1))
    } else if (t.length > pire.n) pire = { n: t.length, nom, titre: t }
  }
  console.log(`   ✓ ${g.nom.padEnd(20)} pire cas ${pire.n}/${TITRE_MAX} — ${pire.nom}`)
}

for (const g of GABARITS_DESC) {
  let pire = { n: 0, nom: '' }
  for (const v of villes) {
    const t = titreSeo(g.versions(v.nom), DESCRIPTION_MAX)
    if (t === null) rate(`description « ${g.nom} » ne se replie pas pour « ${v.nom} »`, g.versions(v.nom).at(-1).length, DESCRIPTION_MAX, g.versions(v.nom).at(-1))
    else if (t.length > pire.n) pire = { n: t.length, nom: v.nom }
  }
  console.log(`   ✓ description ${g.nom.padEnd(8)} pire cas ${pire.n}/${DESCRIPTION_MAX} — ${pire.nom}`)
}

// ── 2 et 3. Les titres et descriptions écrits à la main ───────────────────
const sources = ['../lib/data.ts', '../lib/guidesEn.ts']

// ⚠️ On ne relève QUE les titres et descriptions de PAGES.
// Premier jet du test : je comptais aussi les `description` des restaurants
// et des mosquées à l'intérieur des fiches villes. Ce ne sont pas des
// méta-descriptions, elles n'ont aucune limite à respecter, et les compter
// aurait rendu le test bruyant — donc ignoré, donc inutile.
// Une entrée de page se reconnaît à son `slug:` ; on lit le `title:` et la
// `description:` qui la suivent immédiatement.
function pages(src) {
  const t = readFileSync(new URL(src, import.meta.url), 'utf8')
  const lignes = t.split('\n')
  const out = []
  for (let i = 0; i < lignes.length; i++) {
    if (!/^\s*slug: /.test(lignes[i])) continue
    const bloc = lignes.slice(i, i + 10).join('\n')
    const lis = (cle) => {
      // `\\s*` et non un simple espace : la valeur est souvent sur la LIGNE
      // SUIVANTE (prettier la renvoie à la ligne quand elle est longue), et
      // c'est précisément ce qui faisait passer 41 descriptions au travers
      // du premier jet de ce test.
      const m = bloc.match(new RegExp(`^\\s*${cle}:\\s*(["'\`])((?:\\\\.|(?!\\1).)*)\\1,`, 'm'))
      return m ? m[2].replace(/\\"/g, '"').replace(/\\'/g, "'") : null
    }
    const titre = lis('title'), desc = lis('description')
    // Une entrée de PAGE a un `title:`. Les fiches destinations, elles, ont
    // un `nom:` et une `description:` qui est un texte d'introduction de 600
    // caractères — pas une méta-description, aucune limite à respecter.
    // Sans ce filtre, le test hurlait sur six textes parfaitement corrects,
    // et un test qui crie à tort finit par ne plus être lu.
    if (titre) out.push({ titre, desc, fichier: src.replace('../', ''), slug: (lignes[i].match(/["'](.*?)["']/) || [])[1] })
  }
  return out
}
const TOUTES = sources.flatMap(pages)

console.log(`\n2. Titres écrits à la main`)
const titres = TOUTES.filter((x) => x.titre && !x.titre.includes('${'))
const titresLongs = titres.filter((x) => x.titre.length > TITRE_MAX)
titresLongs.forEach((x) => rate(`${x.slug} (${x.fichier})`, x.titre.length, TITRE_MAX, x.titre))
console.log(`   ${titresLongs.length ? '✗' : '✓'} ${titres.length} titres de pages relus, ${titresLongs.length} trop longs`)

console.log(`\n3. Descriptions écrites à la main`)
const descs = TOUTES.filter((x) => x.desc && !x.desc.includes('${'))
const descsLongues = descs.filter((x) => x.desc.length > DESCRIPTION_MAX)
descsLongues.forEach((x) => rate(`${x.slug} (${x.fichier})`, x.desc.length, DESCRIPTION_MAX, x.desc))
console.log(`   ${descsLongues.length ? '✗' : '✓'} ${descs.length} descriptions de pages relues, ${descsLongues.length} trop longues`)

// ── 4. Les titres et descriptions écrits DANS les pages app/ ──────────────
// LE TROU QUE CE BLOC BOUCHE, trouvé le 12 août : les points 2 et 3 ne
// lisent que lib/data.ts et lib/guidesEn.ts. Or beaucoup de pages écrivent
// leur `title` directement dans leur `generateMetadata()`. C'est ainsi que
// /hotels — la page qui mène aux deux meilleures pages du site, Istanbul et
// Dubaï — servait un titre de 80 caractères sans que rien ne le signale.
// Google en coupait 20 : « ...souvent moins cher sur HalalBooking » n'était
// jamais lu.
console.log(`\n4. Titres et descriptions écrits dans les pages app/`)
const fichiersApp = []
const explore = (dir) => {
  for (const e of readdirSync(new URL(dir, import.meta.url), { withFileTypes: true })) {
    if (e.isDirectory()) explore(`${dir}/${e.name}`)
    else if (e.name === 'page.tsx' || e.name === 'layout.tsx') fichiersApp.push(`${dir}/${e.name}`)
  }
}
explore('../app')

let litterauxRelus = 0
for (const f of fichiersApp) {
  const src = readFileSync(new URL(f, import.meta.url), 'utf8')
  // On lit les BLOCS `const title = ...` / `title: ...`, puis toutes les
  // chaînes littérales qu'ils contiennent. Il faut aller jusque-là parce que
  // la forme réelle du dépôt est un ternaire bi-domaine sur trois lignes :
  //     const title = isEN
  //       ? 'Halal hotels ...'
  //       : 'Hôtels halal ...'
  // Une expression simple sur une ligne ne l'aurait pas vue — et c'est
  // exactement la forme qu'avait le titre de 80 caractères de /hotels.
  // ⚠️ On ne regarde QUE l'intérieur de `generateMetadata()` ou de
  // `export const metadata`. Deuxième leçon du 12 août : en scannant tout le
  // fichier, le test relevait les `title:` des cartes de la page d'accueil et
  // les étapes de l'Omra — 42 alertes dont aucune n'était une balise <title>.
  // Ce ne sont pas des méta-titres, ils n'ont aucune limite à respecter.
  const toutesLignes = src.split('\n')
  const lignes = []
  let dedans = false
  for (const l of toutesLignes) {
    if (/export (async function generateMetadata|const metadata)/.test(l)) dedans = true
    else if (dedans && /^\}/.test(l)) dedans = false
    if (dedans) lignes.push(l)
    else lignes.push('')
  }
  for (let i = 0; i < lignes.length; i++) {
    const debut = lignes[i].match(/\b(?:const\s+)?(title|description)\s*[:=]/)
    if (!debut) continue
    const cle = debut[1]
    const max = cle === 'title' ? TITRE_MAX : DESCRIPTION_MAX
    // On s'arrête à la clé suivante. Sans cette borne, le bloc de `title`
    // avalait la `description` de la ligne d'après et la jugeait avec la
    // limite des titres : 106 fausses alertes au premier jet. Un test qui
    // crie à tort finit par ne plus être lu — c'est déjà écrit plus haut
    // dans ce fichier, et je viens de me refaire prendre.
    const suite = []
    for (let k = i; k < Math.min(i + 4, lignes.length); k++) {
      if (k > i && /\b(?:const\s+)?(?:title|description|openGraph|alternates|keywords|return)\s*[:=]/.test(lignes[k])) break
      suite.push(lignes[k])
    }
    const bloc = suite.join('\n')
    for (const [, , brut] of bloc.matchAll(/(['"])((?:\\.|(?!\1)[^\n])*)\1/g)) {
      // \' compte pour UN caractère à l'écran, pas deux : sans ce
      // dé-échappement le test réclamerait de raccourcir des titres qui
      // tiennent déjà.
      const texte = brut.replace(/\\(['"\\])/g, '$1')
      // ${...} : valeur construite à partir d'un nom de ville, donc couverte
      // par le point 1. Moins de 25 caractères : un fragment, pas un titre.
      if (texte.includes('${') || texte.length < 25) continue
      litterauxRelus++
      if (texte.length > max) rate(`${cle} (${f.replace('../', '')})`, texte.length, max, texte)
    }
  }
}
console.log(`   ${echecs ? '' : '✓ '}${litterauxRelus} valeurs littérales relues dans ${fichiersApp.length} fichiers app/`)

console.log()
if (echecs) {
  console.error(`❌ ${echecs} problème(s). Google couperait ces pages.`)
  console.error(`   Un titre se raccourcit ; un gabarit se replie (lib/titre-seo.ts).\n`)
  process.exit(1)
}
console.log('✅ Tout tient dans ce que Google affiche.\n')
