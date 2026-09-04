// 🇫🇷 « À LE CAIRE » — la faute était dans le titre, la seule ligne que Google affiche.
//
// Trouvée le 4 septembre en vérifiant les titres SERVIS après le
// rafraîchissement automatique de la base OSM. Trois surfaces, la même faute,
// sur la même page :
//
//   titre  Où prier à Le Caire : 463 lieux de prière, restos halal
//   desc   33 adresses halal et 106 hôtels à Le Caire, horaires…
//   h1     Où prier à Le Caire : 463 lieux de prière et 33 adresses halal
//
// Le site anglais était juste (« in Cairo », « in Cape Town ») : la faute
// n'existait qu'en français.
//
// Deux villes sur 354 — mais Le Caire est une destination majeure, et une
// faute d'accord dans un titre coûte des clics avant même d'être lue.
//
// 🔴 CE QUE CE TEST TIENT VRAIMENT : que la règle reste à UN SEUL ENDROIT.
// « à ${nom} » était écrit dans quinze gabarits (titre, description, h1, h2,
// FAQ, liens internes). Corriger deux noms dans les données aurait laissé la
// faute revenir au premier gabarit ajouté. C'est la forme de défaut trouvée
// quatre nuits d'affilée : une règle vraie quelque part, fausse ailleurs.
//
// Le 28 août, la même faute sur les PAYS (« en Maroc ») a été réglée en
// retirant la préposition du gabarit. Ici c'est impossible : « Où prier Le
// Caire » ne se dit pas.
import { readFileSync } from 'node:fs'
import { aVille, deVille } from '../lib/prepositionVille.mjs'

let fautes = 0
const casse = (m) => { console.error(`❌ ${m}`); fautes++ }

// ── 1. la contraction, et surtout ce qu'elle NE fait PAS ──
// Le féminin ne se contracte jamais : une règle trop large casserait
// « à La Mecque », qui est la ville la plus importante du site.
for (const [nom, attenduA, attenduDe] of [
  ['Le Caire', 'au Caire', 'du Caire'],
  ['Le Cap', 'au Cap', 'du Cap'],
  ['Les Sables', 'aux Sables', 'des Sables'],
  ['La Mecque', 'à La Mecque', 'de La Mecque'],
  ['La Havane', 'à La Havane', 'de La Havane'],
  ['La Haye', 'à La Haye', 'de La Haye'],
  ['Paris', 'à Paris', 'de Paris'],
  // « La » collé n'est pas un article : ces villes ne doivent pas bouger.
  ['Lahore', 'à Lahore', 'de Lahore'],
  ['Lagos', 'à Lagos', 'de Lagos'],
  ['Larache', 'à Larache', 'de Larache'],
  ['Laâyoune', 'à Laâyoune', 'de Laâyoune'],
  ['Las Vegas', 'à Las Vegas', 'de Las Vegas'],
]) {
  if (aVille(nom) !== attenduA) casse(`aVille('${nom}') rend « ${aVille(nom)} » au lieu de « ${attenduA} »`)
  if (deVille(nom) !== attenduDe) casse(`deVille('${nom}') rend « ${deVille(nom)} » au lieu de « ${attenduDe} »`)
}

// ── 2. aucun gabarit français ne réécrit « à ${nom} » à la main ──
// C'est ici que la faute reviendrait : un gabarit ajouté demain, sans passer
// par le service commun.
const FICHIERS = [
  'lib/titreVille.mjs',
  'components/villes/SocleVille.tsx',
  'lib/villeFaq.ts',
]
for (const f of FICHIERS) {
  const src = readFileSync(f, 'utf8')
    .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
    .split('\n').filter((l) => !/^\s*(\/\/|\*)/.test(l)).join('\n')
  // On ne cherche que le FRANÇAIS : « in ${nom} » est correct en anglais.
  // ⚠️ Pas de \b devant « à » : en JavaScript, \b est ASCII et ne voit aucune
  // frontière de mot avant un caractère accentué — le contrôle ne se
  // déclenchait jamais. Vérifié en réintroduisant la faute.
  for (const m of src.matchAll(/(^|[^a-zA-Zà-ÿ])à \$\{(nom|p\.nom|ville\.nom)[^}]*\}/g)) {
    casse(`${f} écrit « ${m[0].trim()} » à la main — passe par aVille(), sinon « à Le Caire » revient`)
  }
  if (!/aVille\(/.test(src)) casse(`${f} n'utilise plus aVille() : la contraction n'est plus appliquée`)
}

// ── 3. les deux villes concernées existent toujours ──
// Si elles étaient renommées, ce test garderait une règle sans objet — et il
// vaut mieux le savoir que le croire.
const noms = []
for (const slug of ['le-caire', 'le-cap']) {
  try { noms.push(JSON.parse(readFileSync(`data/villes/${slug}.json`, 'utf8')).nom) } catch { /* absente */ }
}
if (!noms.includes('Le Caire')) {
  casse('la fiche « le-caire » ne s\'appelle plus « Le Caire » — la règle de contraction doit être revérifiée sur le nouveau nom')
}

if (fautes) { console.error(`\n${fautes} faute(s) — build arrêté.`); process.exit(1) }
console.log(`✅ préposition : « au Caire », « au Cap », et « à La Mecque » intact — la contraction vit à un seul endroit.`)
