// 🏙️ DEUX FICHES, UN SEUL NOM — et sur le domaine anglais, deux titres
// strictement identiques.
//
// Mesuré le 6 octobre en balayant les **1 409 titres réellement servis** sur
// les deux domaines (354 villes × /hotels et /destinations × 2 domaines) :
//
//   www.voyageshalal.fr    705 titres indexables   0 en double
//   www.gohalaltravel.com  704 titres indexables   1 en double
//
//   « Halal Hotels in Samarkand 2026: Alcohol-Free, Near a Mosque »
//     /hotels/samarcande  +  /hotels/samarkand
//
// La cause est dans les données, pas dans les gabarits : `samarcande.json`
// porte `nom: "Samarcande"` + `nom_en: "Samarkand"`, et `samarkand.json`
// porte `nom: "Samarkand"`. Le titre anglais prend `nom_en ?? nom` — les deux
// fiches rendent donc le même nom, donc le même titre. En français elles se
// distinguent (« Samarcande » / « Samarkand »), ce qui explique que le défaut
// ne se voie QUE sur le site anglais.
//
// 🔴 CE QUE CE TEST FAIT, ET CE QU'IL NE FAIT PAS.
// Il interdit **toute nouvelle collision** de nom affiché, dans les deux
// langues. Il ne fusionne pas Samarcande : choisir quelles adresses survivent
// (50 restos + 120 hôtels d'un côté, 40 + 117 de l'autre) est une décision de
// donnée, elle appartient à Mohamed. Le doublon connu est donc inscrit
// ci-dessous comme **dette explicite**, et le test le rappelle à chaque
// construction au lieu de le laisser dormir.
//
// ⚠️ Vérifié sur page SERVIE avant d'écrire ce test : les quatre URL
// répondent 200 et sont toutes `index, follow`. Ce ne sont donc pas des pages
// fantômes — Google peut voir les deux.
import { readFileSync, readdirSync } from 'node:fs'

let fautes = 0
const casse = (m) => { console.error(`❌ ${m}`); fautes++ }

// La dette connue, nommée. Retirer cette entrée le jour où la fusion est
// faite — et le test vérifiera alors qu'elle l'est vraiment.
const DETTE = [
  {
    nom: 'Samarkand',
    langue: 'en',
    fiches: ['samarcande', 'samarkand'],
    pourquoi: 'fusion en attente de décision : quelles adresses survivent (50 restos + 120 hôtels contre 40 + 117)',
  },
]

const fiches = readdirSync('data/villes').filter((f) => f.endsWith('.json'))
const vus = { fr: new Map(), en: new Map() }

for (const f of fiches) {
  const j = JSON.parse(readFileSync(`data/villes/${f}`, 'utf8'))
  const slug = f.replace(/\.json$/, '')
  if (!j.nom) { casse(`data/villes/${f} n'a pas de champ \`nom\` — le titre servi serait vide`); continue }
  // exactement la règle des gabarits : `nom_en ?? nom` côté anglais.
  for (const [langue, nom] of [['fr', j.nom], ['en', j.nom_en || j.nom]]) {
    if (!vus[langue].has(nom)) vus[langue].set(nom, [])
    vus[langue].get(nom).push(slug)
  }
}

for (const langue of ['fr', 'en']) {
  for (const [nom, slugs] of vus[langue]) {
    if (slugs.length < 2) continue
    const connue = DETTE.find((d) => d.nom === nom && d.langue === langue &&
      d.fiches.length === slugs.length && d.fiches.every((s) => slugs.includes(s)))
    if (connue) {
      console.log(`⏳ dette connue : « ${nom} » (${langue}) est rendu par ${slugs.join(' et ')} — ${connue.pourquoi}`)
      continue
    }
    casse(`« ${nom} » (${langue}) est le nom affiché de ${slugs.length} fiches : ${slugs.join(', ')}.\n   Deux fiches au même nom rendent le MÊME titre sur /hotels et /destinations — nos pages se concurrencent.`)
  }
}

// Une dette inscrite mais réparée doit être retirée d'ici, sinon la liste
// devient un cimetière où un vrai doublon pourrait se cacher.
for (const d of DETTE) {
  const slugs = vus[d.langue].get(d.nom) ?? []
  if (slugs.length < 2) {
    casse(`la dette « ${d.nom} » (${d.langue}) n'existe plus dans les données : retire-la de DETTE dans ce fichier.`)
  }
}

const total = vus.fr.size + vus.en.size
if (fautes) { console.error(`\n${fautes} faute(s) — build arrêté.`); process.exit(1) }
console.log(`✅ noms de villes : ${fiches.length} fiches, ${total} noms affichés (FR + EN), aucune collision nouvelle.`)
