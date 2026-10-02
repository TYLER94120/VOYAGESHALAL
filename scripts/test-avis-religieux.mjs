// 🕌 LE SITE NE REND PAS D'AVIS RELIGIEUX — et il en rendait quarante.
//
// Le protocole l'interdit depuis le premier jour : « Ne rends jamais un avis
// religieux : renvoie la question, ne la tranche pas. » Les 29 septembre et
// 1er octobre, j'en ai trouvé un par hasard chaque soir, en traduisant un
// vieil article pour une autre raison :
//
//   « En déplacement, raccourcis et regroupe. »              (centre commercial)
//   « Tu peux raccourcir et regrouper tes prières. »         (week-end musulman)
//
// Deux trouvailles fortuites en deux nuits ne sont pas un hasard. Le
// 2 octobre, balayage systématique des 69 articles : **40 passages dans
// 9 articles**, dans les deux langues. Dont une section entière intitulée
// « Les facilités du voyageur » qui prescrivait « raccourcir les prières de
// 4 à 2 rakats », et six FAQ qui répondaient « Oui, en cas de nécessité »,
// « la prière reste valable », « le tayammoum est permis ».
//
// 🔴 CE QUE CE TEST TIENT VRAIMENT. Pas l'orthographe d'une phrase : la
// FRONTIÈRE. Notre travail s'arrête à la moitié pratique — où, quand,
// comment s'organiser. Dès qu'une page dit ce qui est permis, obligatoire,
// valable ou licite, elle a franchi une ligne que nous ne savons pas tenir,
// et aucun lecteur ne nous a demandé de la franchir.
//
// ⚠️ Le test lit le CONTENU SERVI, pas nos commentaires de code : sans ça il
// se déclencherait sur les exemples ci-dessus, comme deux tests l'ont déjà
// fait cette année (`'use client'`, `score_halal`).
//
// ⚠️ Les motifs cherchent la POSTURE, pas le vocabulaire. Un article a tout
// à fait le droit d'écrire le mot « regroupement » pour dire qu'il ne le
// tranche pas — c'est même ce que fait le bloc de renvoi. Ce qui est
// interdit, c'est l'impératif et le verdict.
import { readFileSync } from 'node:fs'

let fautes = 0
const casse = (m) => { console.error(`❌ ${m}`); fautes++ }

const src = readFileSync('lib/data.ts', 'utf8')

// Un article = du slug au slug suivant.
const reperes = [...src.matchAll(/slug: "([a-z0-9-]+)"/g)].map((m) => ({ slug: m[1], i: m.index }))
const articles = reperes.map((a, k) => ({
  slug: a.slug,
  // on retire les commentaires de ligne : ce test parle du texte publié
  corps: src.slice(a.i, k + 1 < reperes.length ? reperes[k + 1].i : src.length).replace(/\/\/[^\n]*/g, ' '),
}))

// Le site tranche-t-il ? Chaque motif est une POSTURE, pas un mot.
const VERDICTS = [
  [/\btu peux (raccourcir|regrouper|rassembler|rattraper|omettre|sauter)/i, 'dit au lecteur ce qu’il PEUT faire'],
  [/\b(raccourcis|regroupe|rassemble|rattrape)\b(?![a-zà-ÿ])/i, 'impératif religieux'],
  [/raccourci[rs]? (les prières )?de 4 à 2|de quatre à deux rakat/i, 'prescrit un nombre de rakats'],
  [/shortening 4-rakat prayers to 2|shorten(ing)? (your )?prayers to two/i, 'prescribes a number of rakats'],
  [/\ble tayammoum (est )?(permis|autorisé|possible)/i, 'statue sur le tayammoum'],
  [/\btayammum is (permitted|allowed)/i, 'rules on tayammum'],
  [/en cas d(?:'|’)impossibilité, le tayammoum/i, 'prescrit le tayammoum'],
  [/\b(oui|non), en cas de nécessité/i, 'statue par oui/non sur un acte'],
  [/\byes, when necessary/i, 'rules yes/no on an act'],
  [/la prière reste valable/i, 'déclare une prière valable'],
  [/the prayer remains valid/i, 'declares a prayer valid'],
  [/\bles facilités du voyageur\b/i, 'invoque les facilités du voyageur comme argument'],
  [/\btraveller(?:'|’)s concessions?\b|\bas a travel(?:l)?er, you may\b/i, 'invokes the traveller concession'],
  [/\bregroupant (dhuhr|maghrib)|ou regroupe avec\b/i, 'conseille de regrouper'],
  [/\boui, dhuhr\/asr\b|\byes, dhuhr\/asr\b/i, 'répond oui à une question de regroupement'],
  [/\byou (can|may) (shorten|combine|skip|make up)/i, 'tells the reader what is allowed'],
  [/\bit is (permitted|allowed|obligatory) to (shorten|combine|skip)/i, 'rules on permission'],
  [/\bc(?:'|’)est (permis|autorisé|obligatoire|licite) (de|d’)/i, 'qualifie un acte'],
]

for (const a of articles) {
  for (const [re, quoi] of VERDICTS) {
    const m = a.corps.match(re)
    if (!m) continue
    const extrait = a.corps.slice(Math.max(0, m.index - 70), m.index + 90).replace(/\s+/g, ' ')
    casse(`${a.slug} ${quoi} — « …${extrait}… »\n   La moitié pratique est à nous ; celle-là se renvoie à quelqu'un de qualifié.`)
  }
}

// Les articles qui PARLENT de ces sujets doivent porter le renvoi explicite.
// Un article qui mentionne le regroupement ou le tayammoum sans dire qu'il ne
// tranche pas laisse le lecteur croire que le site a répondu.
const SUJETS = /regroup|raccourci|tayammoum|tayammum|shorten|combin(e|ing) (dhuhr|prayers)/i
const RENVOI = /nous ne tranchons pas|n(?:'|’)y répondons pas|we do not rule|we do not answer them|pas une question de voyage|not a travel one|question religieuse|religious question/i
for (const a of articles) {
  // le corps d'article seulement : un slug sans contenu n'est pas concerné
  if (!/content:/.test(a.corps)) continue
  if (SUJETS.test(a.corps) && !RENVOI.test(a.corps)) {
    casse(`${a.slug} aborde le regroupement ou le tayammoum SANS porter le renvoi — le lecteur croira que nous avons répondu.`)
  }
}

if (fautes) {
  console.error(`\n${fautes} faute(s) — build arrêté.`)
  console.error('Rappel du protocole : « Ne rends jamais un avis religieux : renvoie la question, ne la tranche pas. »')
  process.exit(1)
}
console.log(`✅ avis religieux : ${articles.length} articles relus, aucun ne tranche — et ceux qui abordent le sujet portent le renvoi.`)
