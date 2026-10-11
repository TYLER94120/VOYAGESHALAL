#!/usr/bin/env node
// ⛪️ 166 ÉGLISES, CATHÉDRALES ET SYNAGOGUES ÉTAIENT LISTÉES COMME MOSQUÉES.
//
// Trouvé le 9 octobre, et par accident. Je préparais un article classant les
// villes par temps de marche jusqu'à une mosquée — chiffre rendu possible par
// l'enrichissement de la veille — quand le classement a sorti **Milan 3 min,
// Florence 3 min, Malaga 3 min**, devant presque toutes les villes de pays
// musulmans. Un résultat invraisemblable est un résultat à vérifier.
//
// `data/villes/milan.json`, champ `mosqueesPrincipales` :
//
//   { "nom": "Chiesa di San Gottardo in Corte", "type": "Mosquée",
//     "description": "Lieu de prière (OpenStreetMap)." }
//   { "nom": "Cattedrale di Santa Maria del Fiore", "type": "Mosquée" }   (Florence)
//   { "nom": "Iglesia del Santo Cristo de la Salud", "type": "Mosquée" }  (Malaga)
//
// Un import en amont a pris `amenity=place_of_worship` **sans filtrer
// `religion=muslim`**. Relevé sur tout le corpus : **166 entrées suspectes
// dans 55 villes**, dont Venise 14 sur 17, Rio de Janeiro 10 sur 10,
// Florence 9 sur 11, Milan 19 sur 39. Ces lieux étaient comptés dans les
// titres (« Où prier à Venise : 17 mosquées ») et, depuis le 8 octobre,
// nommés sur les fiches d'hôtels comme « mosquée la plus proche ».
//
// 🔴 CE N'EST PAS UNE DÉCISION DE DONNÉE, C'EST UNE FAUTE. Une cathédrale
// n'est pas une mosquée. Je ne tranche donc rien en les retirant — je retire
// ce qui n'aurait jamais dû entrer. Ce qui serait une décision, en revanche,
// c'est de deviner : d'où la double condition ci-dessous.
//
// ⚠️ LE GARDE-FOU DE MA PROPRE RÈGLE. Un nom d'église suffit à écarter, SAUF
// s'il porte aussi un marqueur musulman. Sans cette seconde condition, huit
// vraies mosquées disparaissaient — « Kerk Street Mosque » (Johannesburg),
// « Mosquée de Saint-Fons » (Lyon), « Ermita Mosque » (Manille), « Église
// musulmane » (Kinshasa). Vérifié en listant les gardes avant d'écrire.
//
// Rien n'est perdu : les entrées retirées sont écrites dans
// `data/purge-non-mosquees.json` avec leur ville et leur identifiant OSM, de
// sorte qu'un relevé ultérieur puisse les réexaminer une par une.
//
// Usage : node scripts/purger-non-mosquees.mjs [--dry]
import fs from 'node:fs'
import path from 'node:path'

const DRY = process.argv.includes('--dry')

/** Noms qui désignent un lieu de culte NON musulman. Liste volontairement
 *  conservatrice : on préfère laisser passer un doute que retirer une mosquée. */
// 11 octobre : élargi après un contrôle par échantillon AVANT publication.
// Le classement prêt à publier donnait « Venise : 1 mosquée » — et cette
// unique entrée restante était l'« Oratorio di Santa Maria Assunta e
// Sant'Eurosia ». Un oratoire. Le balayage complet a alors sorti 42 autres
// cas dans d'autres langues : `templom` (Budapest, 12), `kościół` et
// `kaplica` (Cracovie 9, Gdańsk 8), `oratorio` (Florence 2, Venise 1),
// `basílica`, `biserica`, `paróquia`, `abadía`, `stupa` (Katmandou 2).
// Ma première liste ne connaissait que les langues romanes et germaniques.
const NON_MUSULMAN = /\b(chiesa|iglesia|igreja|cattedrale|catedral|cathedral|cath[ée]drale|bas[ií]lica|basilique|duomo|battistero|baptistery|[ée]glise|church|chapel|chapelle|cappella|kapelle|kaplica|kaplnka|kapela|kerk|kirche|kirke|kyrka|ko[sś]ci[oó][lł]|templom|sziklatemplom|biseric[aă]|cerkwa|cerkev|crkva|kostel|synagogue|sinagoga|temple|temppeli|tempio|pagoda|pagode|stupa|vihara|gurdwara|mandir|wat |monast|abbey|abbaye|abbazia|abad[ií]a|convent|couvent|klooster|klasztor|oratorio|oratoire|oratory|par[oó]quia|santuario|sanctuaire|ermita|parroquia|paroisse|notre-dame|saint-|sankt |st\.? mary|our lady|sacre[- ]coeur|sacro|basilika)\b/i

/** Marqueurs qui prouvent qu'on a bien affaire à un lieu musulman : ils
 *  PRIMENT sur la liste ci-dessus. */
// 11 octobre : élargi aussi, et c'est le plus important des deux. Cinq
// entrées légitimes seraient tombées sans ça — quatre « Comunitat Islámica …
// de **Santa Coloma** » (Barcelone : Santa Coloma est un nom de commune) et
// le « Centre De Mémorisation Du **Saint** Coran » d'Abidjan. « islam » ne
// couvre pas « Islámica » (l'accent casse le motif), et « Coran » n'y était
// pas du tout.
const MUSULMAN = /(mosqu|masjid|masdjid|masjeed|mesjid|mescit|m[eé]scid|cami|camii|jami|jame|jumu|jamaa|jamat|musalla|musallah|mushola|musholla|surau|d[žz]amija|xhamia|msikiti|dargah|moskee|moschee|mezquita|mesquita|moschea|meskita|isl[aá]m|muslim|musulman|imam|zaouia|zawiya|madrasa|medersa|cor[aâ]n|qur.?an|koran|salle de pri[eè]re|prayer room|namaz|مسجد|جامع)/i

/** Un nom qui COMMENCE par « San / Santa / São / Sant' / St. » désigne en
 *  pratique un saint chrétien. Relevé avant d'ajouter cette règle : 10 entrées
 *  concernées (« San Pedro de Abrisketa », « Santa Maria della Salute »…) et
 *  **zéro** mosquée parmi elles. Le marqueur musulman prime quand même. */
/** ⚠️ Les mots à lettres non-ASCII ont leur propre motif, SANS `\b`.
 *  En JavaScript, `\b` est ASCII : il ne voit aucune frontière de mot après
 *  un « ł », donc `\bkościół\b` ne se déclenchait jamais et les sept églises
 *  de Cracovie survivaient à la purge. C'est exactement le piège noté au
 *  carnet le 4 septembre, à propos de « à Le Caire ». Troisième fois. */
const NON_MUSULMAN_SANS_FRONTIERE = /(ko[sś]ci[oó][lł]|templom|sziklatemplom|kaplnka|kaplica)/i

const SAINT_EN_TETE = /^(san|santa|santo|s[ãa]o|sant'|sankt|st\.?)\s/i

export function estNonMusulman(nom) {
  const n = String(nom ?? '')
  if (MUSULMAN.test(n)) return false
  return NON_MUSULMAN.test(n) || NON_MUSULMAN_SANS_FRONTIERE.test(n) || SAINT_EN_TETE.test(n)
}

// ⚠️ Ce fichier est IMPORTÉ par scripts/test-non-mosquees.mjs, qui ne veut
// que la règle. Sans cette garde, chaque construction relançait la purge et
// réécrivait 354 fiches — un test qui modifie les données qu'il contrôle est
// pire qu'aucun test. Trouvé en lançant le test juste après l'avoir écrit.
const LANCE_DIRECTEMENT = process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)
if (!LANCE_DIRECTEMENT) {
  // importé : on n'expose que `estNonMusulman`.
} else {

const dossier = path.join(process.cwd(), 'data', 'villes')
const trace = []
let villesTouchees = 0, retires = 0

for (const f of fs.readdirSync(dossier).filter((x) => x.endsWith('.json'))) {
  const chemin = path.join(dossier, f)
  const ville = JSON.parse(fs.readFileSync(chemin, 'utf8'))
  const M = ville.mosqueesPrincipales
  if (!Array.isArray(M) || !M.length) continue

  const garde = [], jete = []
  for (const m of M) (estNonMusulman(m.nom) ? jete : garde).push(m)
  if (!jete.length) continue

  villesTouchees++
  retires += jete.length
  for (const m of jete) trace.push({ ville: ville.slug ?? f.replace(/\.json$/, ''), nom: m.nom, id: m.id ?? null, lat: m.lat, lng: m.lng })
  console.log(`${DRY ? '·' : '✓'} ${(ville.nom || f).padEnd(22)} ${M.length} → ${garde.length}  (retirés : ${jete.map((m) => m.nom).join(' · ')})`)

  if (!DRY) {
    ville.mosqueesPrincipales = garde
    ville.mosqueesPurgeesAt = new Date().toISOString().slice(0, 10)
    fs.writeFileSync(chemin, JSON.stringify(ville, null, 2))
  }
}

if (!DRY) {
  // ⚠️ On AJOUTE à la trace, on ne la remplace pas. Au premier essai, un
  // second passage (après élargissement de la règle aux noms « San… ») a
  // écrasé le fichier et fait passer la trace de 158 entrées à 10. « Rien
  // n'est perdu » doit être vrai, pas écrit.
  const f = path.join(process.cwd(), 'data', 'purge-non-mosquees.json')
  let avant = []
  try { avant = JSON.parse(fs.readFileSync(f, 'utf8')).entrees ?? [] } catch { /* première fois */ }
  const vu = new Set(avant.map((e) => `${e.ville}|${e.nom}`))
  const fusion = [...avant, ...trace.filter((e) => !vu.has(`${e.ville}|${e.nom}`))]
  fs.writeFileSync(f, JSON.stringify({ purgeLe: new Date().toISOString().slice(0, 10), combien: fusion.length, entrees: fusion }, null, 2))
}


// ── Second chemin : la base OSM par pays ──
// 10 octobre. Après la purge des fiches, j'ai vérifié si le même import non
// filtré avait contaminé `data/osm/mosquees/*.json`, qui alimente les
// compteurs de titres et /mosquee-proche. **Bonne nouvelle mesurée : non.**
// 2 suspects sur 159 150 lieux (0,00 %) — cet import-là filtrait bien
// `religion=muslim`. Les deux restants sont retirés ici, et le test garde
// désormais ce chemin aussi.
let paysTouches = 0, retiresPays = 0
const dossierPays = path.join(process.cwd(), 'data', 'osm', 'mosquees')
if (fs.existsSync(dossierPays)) {
  for (const f of fs.readdirSync(dossierPays).filter((x) => x.endsWith('.json'))) {
    const chemin = path.join(dossierPays, f)
    const base = JSON.parse(fs.readFileSync(chemin, 'utf8'))
    const liste = Array.isArray(base) ? base : base.lieux
    if (!Array.isArray(liste)) continue
    const jete = liste.filter((p) => estNonMusulman(p.nom))
    if (!jete.length) continue
    paysTouches++
    retiresPays += jete.length
    for (const m of jete) trace.push({ ville: `osm:${f.replace(/\.json$/, '')}`, nom: m.nom, id: m.id ?? null, lat: m.lat, lng: m.lng })
    console.log(`${DRY ? '·' : '✓'} ${('osm/' + f).padEnd(22)} ${liste.length} → ${liste.length - jete.length}  (retirés : ${jete.map((m) => m.nom).join(' · ')})`)
    if (!DRY) {
      const garde = liste.filter((p) => !estNonMusulman(p.nom))
      if (Array.isArray(base)) fs.writeFileSync(chemin, JSON.stringify(garde, null, 2))
      else { base.lieux = garde; base.total = garde.length; fs.writeFileSync(chemin, JSON.stringify(base, null, 2)) }
    }
  }
}

console.log(`\n${retires} entrée(s) retirée(s) dans ${villesTouchees} ville(s) et ${retiresPays} dans ${paysTouches} base(s) pays${DRY ? ' (essai à blanc)' : ''}.`)
if (!DRY) console.log('Trace conservée dans data/purge-non-mosquees.json — rien n\'est perdu.')

}
