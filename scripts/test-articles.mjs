// 🕌 UN TITRE NE PROMET JAMAIS UNE SALLE DE PRIÈRE QUE L'ARTICLE DIT ABSENTE.
//
// Trouvé le 25 août en travaillant les articles. Quatre pages portaient un
// titre qui affirmait ce que leur propre texte niait :
//
//   titre    « Salle de prière au Futuroscope : où prier ? — guide 2026 »
//   article  « Pas de salle de prière officielle à notre connaissance. »
//
// Les descriptions, elles, étaient honnêtes (« Pas de salle de prière
// officielle au Futuroscope — voici les solutions… »). Seul le titre
// mentait — c'est-à-dire la seule ligne que Google affiche, et la seule sur
// laquelle on clique. Un lecteur arrivait en croyant qu'une salle existait.
//
// C'est la règle la plus ancienne de la maison, prise par la porte de
// derrière : « jamais inventer une salle de prière ». Elle était tenue dans
// le corps du texte et perdue dans le titre.
//
// Ce fichier la tient là où elle se perdait. Il ne juge pas le style : il
// vérifie qu'aucun article ne se contredit entre son titre et son texte.
import { readFileSync } from 'node:fs'

let fautes = 0
const casse = (m) => { console.error(`❌ ${m}`); fautes++ }

const src = readFileSync('lib/data.ts', 'utf8')

/** Le texte dit qu'il n'y a PAS de salle. */
const NIE = /(pas de salle de pri[èe]re|n'existe pas de salle de pri[èe]re|n'ont pas de salle de pri[èe]re|ne dispose pas de salle de pri[èe]re|aucune salle de pri[èe]re)/i
/** Le titre AFFIRME qu'il y en a une (« Salle de prière à X : … »). */
const AFFIRME = /^\s*Salle de pri[èe]re (à|au|aux|en|dans)\b/i

// 🇬🇧 31 août : LA RÈGLE NE VALAIT QU'EN FRANÇAIS.
// Les deux expressions ci-dessus sont françaises. Le site anglais compte
// 831 pages et n'était donc tenu par rien — alors que c'est exactement le
// même piège : un titre qui promet une salle que l'article dit inexistante.
// Trouvé en écrivant les jumeaux anglais de Parc Astérix et du Puy du Fou.
const NIE_EN = /(no official,? (signposted )?prayer room|there is no prayer room|has no prayer room|no official prayer room)/i
const AFFIRME_EN = /^\s*Prayer Rooms? (at|in)\b/i
/** Les mots qui ne donnent aucune raison de cliquer (règle du 20 août). */
const CREUX = /guide complet|complete guide|ultimate guide|tout savoir|découvrez|everything you need to know/i

const MAX_TITRE = 60

const blocs = src.split(/\n {2}\{\n {4}slug: /).slice(1)
let nb = 0, nies = 0
const titres = new Map()

for (const b of blocs) {
  const slug = b.match(/^['"]([^'"]+)['"]/)?.[1]
  // ⚠️ « Où prier à l'aéroport de Lyon » : l'apostrophe est DANS le titre.
  // Une lecture naïve coupait à l'apostrophe et voyait cinq titres
  // identiques (« Où prier à l ») là où il y en avait cinq différents. Un
  // test qui invente des fautes est aussi nuisible qu'un test absent.
  const titre = (b.match(/title:\s*"((?:[^"\\]|\\.)*)"/) ?? b.match(/title:\s*'((?:[^'\\]|\\.)*)'/))?.[1]?.replace(/\\(['"])/g, '$1')
  if (!slug || !titre) continue
  // Le corps de l'article : assez pour couvrir « l'essentiel en 30 secondes ».
  const corps = b.slice(0, 12000)
  const estArticle = /content:\s*`/.test(b)
  if (!estArticle) continue
  nb++

  // ── 1. le titre ne contredit pas le texte ──
  if (NIE.test(corps)) {
    nies++
    if (AFFIRME.test(titre)) {
      casse(`« ${slug} » : le titre annonce une salle de prière que l'article dit inexistante — « ${titre} »`)
    }
  }
  if (NIE_EN.test(corps)) {
    nies++
    if (AFFIRME_EN.test(titre)) {
      casse(`« ${slug} » : the title promises a prayer room the article says does not exist — « ${titre} »`)
    }
  }

  // ── 2. aucun mot creux dans un titre servi ──
  if (CREUX.test(titre)) casse(`« ${slug} » : mot creux dans le titre — « ${titre} »`)

  // ── 3. Google coupe à 60 caractères ──
  if (titre.length > MAX_TITRE) casse(`« ${slug} » : titre de ${titre.length} c — Google le coupera`)

  // ── 4. deux pages ne se présentent pas sous le même titre ──
  // « Deux pages moyennes valent moins qu'une bonne » : quand deux adresses
  // portent le même titre, Google en choisit une et l'autre est perdue.
  if (titres.has(titre)) casse(`titre en double : « ${titre} » (${titres.get(titre)} et ${slug})`)
  else titres.set(titre, slug)
}

if (nb < 50) casse(`seuls ${nb} articles relus : la lecture de lib/data.ts a dû casser`)

if (fautes) { console.error(`\n${fautes} faute(s) — build arrêté.`); process.exit(1) }
console.log(`✅ articles : ${nb} relus, ${nies} disent honnêtement qu'il n'y a pas de salle de prière et aucun titre ne prétend le contraire.`)
