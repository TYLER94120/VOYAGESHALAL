// 📤 CE QU'ON DÉCLARE À GOOGLE NE PEUT PAS ÊTRE PLUS PERMISSIF QUE CE QU'ON AFFICHE.
//
// Ronde du 2 septembre. La donnée structurée (JSON-LD) est la seule chose du
// site que personne ne relit jamais : elle ne se voit pas à l'écran, et c'est
// pourtant ce que Google lit en premier. Trois défauts y vivaient.
//
// ── 1. UNE NOTE D'UTILISATEURS QUI N'EXISTENT PAS ─────────────────────
// Le schéma de chaque fiche ville envoyait :
//     ratingValue : ville.score_halal        → NOTRE score, calculé par nous
//     ratingCount : restaurants_halal ?? 50  → un nombre de RESTAURANTS
// `ratingCount` désigne un nombre d'AVIS. Vérifié sur les 354 fiches : aucune
// ne porte le moindre champ d'avis ou de note d'utilisateur. On présentait
// donc notre propre note éditoriale comme la moyenne d'avis inexistants, sur
// 354 pages × 2 domaines.
//
// Et le repli `?? 50` était le jumeau exact du `ratingCount: h.avis_count ?? 20`
// retiré des hôtels le 24 août. Il ne s'était jamais déclenché — les 354 villes
// ont la statistique — mais il attendait la première ville publiée sans elle.
// La correction de 24 août n'avait jamais été portée aux villes : deux fichiers,
// un seul relu.
//
// ── 2. 150 ADRESSES REFUSÉES À L'ÉCRAN, ANNONCÉES À GOOGLE ────────────
// `restaurantSchemas` prenait les 20 premiers restaurants SANS passer par
// `conforme()`, le filtre que `SocleVille` et `DestinationRoute` appliquent.
// Mesure : 150 sur 5 276 (2,8 %) — un « Bar And Restaurant » à Accra, des
// adresses à tapas à Addis-Abeba. Le site refusait de les montrer et disait
// quand même à Google qu'elles sont dans son guide halal.
//
// ⚠️ Ce test lit la SOURCE : le JSON-LD ne se voit qu'à l'exécution, et
// l'importer ici demanderait --experimental-strip-types, qui a déjà cassé un
// déploiement Vercel. On vérifie donc les règles là où elles se perdent.
import { readFileSync, readdirSync } from 'node:fs'

let fautes = 0
const casse = (m) => { console.error(`❌ ${m}`); fautes++ }

// Le code SANS ses commentaires : l'explication qui dit « ce bloc envoyait
// score_halal » ne doit pas être lue comme un bloc qui l'envoie. (Un test qui
// invente des fautes est aussi nuisible qu'un test absent — 29 août.)
const schema = readFileSync('components/SchemaOrg.tsx', 'utf8')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .replace(/\/\*[\s\S]*?\*\//g, '')
  .split('\n').filter((l) => !/^\s*(\/\/|\*)/.test(l)).join('\n')

// ── 1. aucune note ni aucun compte inventés ──
if (/aggregateRating/.test(schema)) {
  // Toléré UNIQUEMENT si la note ET le nombre d'avis viennent d'une source
  // réelle — c'est le cas du bloc restaurant, gardé par `r.source === 'google'`.
  const blocs = [...schema.matchAll(/aggregateRating[\s\S]{0,260}/g)].map((m) => m[0])
  for (const b of blocs) {
    if (/score_halal/.test(b)) {
      casse('le schéma ville renvoie score_halal comme aggregateRating : c\'est notre note éditoriale, pas une moyenne d\'avis')
    }
    if (/ratingCount:[^,\n]*\?\?\s*\d+/.test(b)) {
      casse('un ratingCount se replie sur un nombre en dur — c\'est le défaut du 24 août (« ?? 20 » sur 33 322 hôtels), réapparu ailleurs')
    }
    if (/ratingCount/.test(b) && !/source === 'google'|nombreAvis|avis_count/.test(b)) {
      casse('un ratingCount est publié sans venir d\'un vrai nombre d\'avis')
    }
  }
}

// Aucune fiche ville ne porte d'avis : la règle doit rester vraie, sinon
// le raisonnement ci-dessus s'écroule et il faudra le refaire.
let avecAvis = 0, villes = 0
for (const f of readdirSync('data/villes').filter((x) => x.endsWith('.json'))) {
  villes++
  let v; try { v = JSON.parse(readFileSync(`data/villes/${f}`, 'utf8')) } catch { continue }
  if (Object.keys(v).some((k) => /^(avis|nombreAvis|avis_count|ratingCount)$/i.test(k))) avecAvis++
}
if (avecAvis > 0) {
  casse(`${avecAvis} fiche(s) ville portent maintenant un champ d'avis : la règle « aucun aggregateRating ville » doit être réexaminée, pas contournée`)
}

// ── 2. la donnée structurée passe par le MÊME filtre que l'affichage ──
if (!/from '@\/lib\/conformite'/.test(schema)) {
  casse('components/SchemaOrg.tsx n\'importe plus le filtre de conformité : il annoncerait à Google des adresses que le site refuse d\'afficher')
}
if (!/\.filter\(\(r: any\) => conforme\(/.test(schema)) {
  casse('les restaurants du JSON-LD ne passent plus par conforme() — 150 adresses refusées à l\'écran repartiraient chez Google')
}
// L'ordre compte : filtrer APRÈS avoir coupé à 20 laisserait des trous.
const iFiltre = schema.indexOf('.filter((r: any) => conforme(')
const iSlice = schema.indexOf('.slice(0, 20)', iFiltre > 0 ? iFiltre : 0)
if (iFiltre > 0 && iSlice > 0 && iSlice < iFiltre) {
  casse('le JSON-LD coupe à 20 AVANT de filtrer : les adresses écartées mangeraient des places au lieu d\'être remplacées')
}

// ── 3. LA FAQ NE PEUT PAS CONTREDIRE LA PAGE ──────────────────────────
// Ronde du 3 septembre. `DestinationSchema` et `DestinationFaqSchema`
// recevaient la ville BRUTE, quand l'affichage reçoit `restaurantsConformes`.
// Mesuré sur les 354 fiches :
//   · 159 villes (45 %) annonçaient un nombre de restaurants supérieur à ce
//     que la page montre — 407 de trop au total ;
//   · 27 villes NOMMAIENT dans leur réponse FAQ une adresse que la page
//     refuse — « Chicha Châtelet » (Annaba), « Cloud Lounge » (Bagdad),
//     « 114 Group Tea & Lounge » (Bakou). Des lounges à chicha, écartés de
//     l'écran par lib/conformite.ts, et cités à Google comme nos adresses.
// Une seule ville part maintenant partout : celle qu'on affiche.
const route = readFileSync('components/villes/DestinationRoute.tsx', 'utf8')
  .replace(/\{\/\*[\s\S]*?\*\/\}/g, '')
  .split('\n').filter((l) => !/^\s*(\/\/|\*)/.test(l)).join('\n')

if (!/const villeAffichee = \{ \.\.\.ville, restaurants: restaurantsConformes/.test(route)) {
  casse('la ville affichée n\'est plus construite en un seul endroit : les compteurs de la FAQ vont redivergér de la page')
}
for (const [balise, quoi] of [['DestinationSchema', 'le schéma ville'], ['DestinationFaqSchema', 'la FAQ envoyée à Google']]) {
  const m = route.match(new RegExp(`<${balise} ville=\\{([a-zA-Z]+)\\}`))
  if (!m) { casse(`${balise} a disparu de la page ville, ou son appel a changé de forme`); continue }
  if (m[1] !== 'villeAffichee') {
    casse(`${quoi} reçoit « ${m[1] === 'ville' ? 'ville' : m[1]} » et non la ville affichée — il annoncerait à Google des adresses et des comptes que la page ne montre pas`)
  }
}
// La FAQ tire ses chiffres ET ses noms de la même liste : si elle allait les
// chercher ailleurs, filtrer la ville ne servirait plus à rien.
const faq = readFileSync('lib/villeFaq.ts', 'utf8')
if (!/ville\.restaurants\?\.length/.test(faq) || !/\(ville\.restaurants \?\? \[\]\)\.slice\(0, 3\)/.test(faq)) {
  casse('lib/villeFaq.ts ne compte plus depuis ville.restaurants : le filtre appliqué en amont ne l\'atteindrait plus')
}

if (fautes) { console.error(`\n${fautes} faute(s) — build arrêté.`); process.exit(1) }
console.log(`✅ données structurées : aucune note ni aucun compte d'avis inventés (${villes} fiches ville relues), et le JSON-LD n'annonce que ce que le site ose afficher.`)
