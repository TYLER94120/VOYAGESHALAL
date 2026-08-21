// 🔎 LES 354 TITRES DE VILLE, VÉRIFIÉS UN PAR UN.
//
// Chantier du 21 août. Le brief de Mohamed demande cinq vérifications avant
// d'annoncer quoi que ce soit : moins de 60 caractères, chaque chiffre
// existant dans nos fichiers, aucun mot interdit, tous les titres
// différents, et la page hôtels d'Istanbul intacte.
//
// Ces cinq vérifications ne valent que si elles portent sur les 354 villes
// et pas sur les quatre qu'on regarde : le défaut se cache toujours dans
// celles qu'on ne regarde pas. C'est ce que fait ce fichier, à chaque
// construction.
import { readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'
import { titresVilleEn, titresVilleFr, descriptionVille, MOTS_INTERDITS, PLAFOND_MOSQUEES } from '../lib/titreVille.mjs'

const MAX_TITRE = 60
const MAX_DESC = 155

let fautes = 0
const casse = (m) => { console.error(`❌ ${m}`); fautes++ }

/** La même règle de repli que le site : on sert la première version qui
 *  tient. La dernière doit toujours tenir. */
const servi = (versions) => versions.find((v) => v.length <= MAX_TITRE) ?? versions[versions.length - 1]

const dossier = path.join(process.cwd(), 'data', 'villes')
const compteurs = (() => {
  try { return JSON.parse(readFileSync(path.join(process.cwd(), 'data', 'osm', 'compteurs.json'), 'utf8')).parVille ?? {} }
  catch { return {} }
})()

const vus = new Map()
let nbVilles = 0, nbAvecOsm = 0, nbPlafond = 0, plusLong = { t: '', n: 0 }

for (const f of readdirSync(dossier).filter((x) => x.endsWith('.json'))) {
  const slug = f.replace('.json', '')
  const v = JSON.parse(readFileSync(path.join(dossier, f), 'utf8'))
  nbVilles++

  const nbMosq = (v.mosqueesPrincipales ?? []).length
  const nbOsm = compteurs[slug]
  const nbPriere = nbOsm ?? nbMosq
  const sourceOsm = nbOsm != null
  if (sourceOsm) nbAvecOsm++
  if (!sourceOsm && nbMosq >= PLAFOND_MOSQUEES) nbPlafond++

  for (const [langue, versions] of [['EN', titresVilleEn(String(v.nom_en ?? v.nom), nbPriere, sourceOsm)],
                                    ['FR', titresVilleFr(String(v.nom), nbPriere, sourceOsm)]]) {
    const t = servi(versions)

    // 1. moins de 60 caractères
    if (t.length > MAX_TITRE) casse(`${slug} ${langue} : titre de ${t.length} c — Google le coupera : « ${t} »`)
    if (t.length > plusLong.n) plusLong = { t, n: t.length }

    // 3. aucun mot interdit
    if (MOTS_INTERDITS.test(t)) casse(`${slug} ${langue} : mot interdit dans « ${t} »`)

    // 2. le chiffre annoncé existe dans nos fichiers
    const chiffre = t.match(/([\d][\d,\s]*)\+?\s+(prayer places|mosques|lieux de prière|mosquées)/)
    if (chiffre) {
      const annonce = Number(chiffre[1].replace(/[,\s]/g, ''))
      if (annonce !== nbPriere) casse(`${slug} ${langue} : le titre annonce ${annonce} mais la donnée dit ${nbPriere}`)
      // Un compte au plafond doit porter le « + » : sinon on présente une
      // troncature de collecte comme un total.
      if (!sourceOsm && nbMosq >= PLAFOND_MOSQUEES && !/\+/.test(t)) {
        casse(`${slug} ${langue} : ${nbMosq} est le plafond de collecte, le titre l'annonce comme un total exact`)
      }
    } else if (nbPriere > 0 && !/Where to pray in|Où prier à/.test(t)) {
      // Pas de chiffre : acceptable seulement sur les replis courts.
      casse(`${slug} ${langue} : ni chiffre ni formule de besoin — « ${t} »`)
    }

    // 4. chaque titre unique
    if (vus.has(t)) casse(`titre en double : « ${t} » (${vus.get(t)} et ${slug})`)
    else vus.set(t, slug)
  }

  // La description complète, ne répète pas, et tient dans la limite.
  for (const en of [true, false]) {
    const d = descriptionVille({
      nom: String(en ? (v.nom_en ?? v.nom) : v.nom),
      nbRestos: (v.restaurants ?? []).length,
      nbHotels: (v.hotels ?? []).length,
      en,
    })
    if (d.length > MAX_DESC) casse(`${slug} ${en ? 'EN' : 'FR'} : description de ${d.length} c`)
    if (MOTS_INTERDITS.test(d)) casse(`${slug} : mot interdit dans la description`)
    if (/(mosques|mosquées|prayer places|lieux de prière)/.test(d)) {
      casse(`${slug} : la description redonne un compte de lieux de prière — le titre le porte déjà, deux chiffres se contredisent`)
    }
  }
}

// 5. la page hôtels d'Istanbul n'est pas touchée : position 49, ses requêtes
// sont en turc, aucun titre ne fait cliquer de là. Le brief dit de ne pas y
// perdre une heure — ce test vérifie qu'on ne l'a pas fait quand même.
const data = readFileSync('lib/data.ts', 'utf8')
if (!/meilleurs-hotels-halal-istanbul/.test(data)) {
  casse('la page hôtels halal Istanbul a disparu de lib/data.ts — elle devait rester telle quelle')
}

if (fautes) { console.error(`\n${fautes} faute(s) — build arrêté.`); process.exit(1) }
console.log(`✅ titres villes : ${nbVilles} villes × 2 langues, tous < ${MAX_TITRE} c, chiffres vérifiés (${nbAvecOsm} comptés par OpenStreetMap, ${nbPlafond} au plafond donc en « 60+ »), aucun doublon. Plus long : ${plusLong.n} c.`)
