// 🎬 GARDE-FOUS DE L'EXPÉRIENCE IMMERSION.
//
// 1. Le tirage (lib/immersionTirage) : composition imposée respectée,
//    jamais deux catégories consécutives, exclusion du déjà-vu, tirages
//    différents — testé sur 200 tirages d'un pool synthétique (structure
//    pure, aucune donnée métier).
// 2. Les engagements du pipeline, dans le source : seuils d'entrée
//    présents (4.5 / 1000 / 300), photo obligatoire, écriture latine
//    obligatoire, aucune donnée métier en dur, jamais « certifié »,
//    liste de sources extensible, contradictions collectées.
import { readFileSync, existsSync } from 'node:fs'
import { fichierRoute } from './_routes.mjs'
import { tirer, sansDoublonsConsecutifs } from '../lib/immersionTirage.mjs'

let fautes = 0
const casse = (m) => { console.error('❌ ' + m); fautes++ }

// ── 1. le tirage ──
const pool = []
const cats = { monument: 8, table: 6, experience: 4, hotel: 3, joker: 5 }
for (const [cat, n] of Object.entries(cats)) for (let i = 0; i < n; i++) pool.push({ id: `${cat}${i}`, cat })

const signatures = new Set()
for (let essai = 0; essai < 200; essai++) {
  const { panneaux } = tirer(pool)
  if (panneaux.length !== 7) { casse(`tirage de ${panneaux.length} panneaux au lieu de 7`); break }
  const parCat = {}
  panneaux.forEach((p) => { parCat[p.cat] = (parCat[p.cat] ?? 0) + 1 })
  if ((parCat.monument ?? 0) < 2 || (parCat.monument ?? 0) > 3) { casse(`monuments hors 2–3 : ${parCat.monument}`); break }
  if ((parCat.table ?? 0) < 1 || (parCat.table ?? 0) > 2) { casse(`tables hors 1–2 : ${parCat.table}`); break }
  if ((parCat.experience ?? 0) !== 1 || (parCat.hotel ?? 0) !== 1 || (parCat.joker ?? 0) !== 1) { casse(`expérience/hôtel/joker ≠ 1 : ${JSON.stringify(parCat)}`); break }
  if (panneaux.some((p, i) => i > 0 && p.cat === panneaux[i - 1].cat)) { casse('deux catégories identiques consécutives'); break }
  signatures.add(panneaux.map((p) => p.id).join(','))
}
if (signatures.size < 20) casse(`le tirage ne varie pas assez : ${signatures.size} ordres distincts sur 200`)

// exclusion du déjà-vu
const vus = pool.filter((p) => p.cat === 'monument').slice(0, 6).map((p) => p.id)
for (let i = 0; i < 30; i++) {
  const { panneaux } = tirer(pool, vus)
  if (panneaux.some((p) => vus.includes(p.id))) { casse('un lieu déjà vu ressort malgré l\'exclusion'); break }
}
// catégorie vide : le tirage est plus court, jamais comblé
const sansHotel = pool.filter((p) => p.cat !== 'hotel')
if (tirer(sansHotel).panneaux.some((p) => p.cat === 'hotel')) casse('un hôtel sort d\'un pool sans hôtel')
// pool homogène : meilleur effort sans plantage
sansDoublonsConsecutifs([{ cat: 'a' }, { cat: 'a' }, { cat: 'a' }])

// ── 2. les engagements du pipeline ──
const api = readFileSync('app/api/immersion/route.ts', 'utf8')
if (!/minRating: 4\.5/.test(api)) casse('le seuil ★ ≥ 4,5 a disparu de la requête Places')
if (!/< 1000\)/.test(api)) casse('le seuil ≥ 1 000 avis (monuments/expériences) a disparu')
if (!/SEUIL_AVIS_TABLE = 120/.test(api)) casse('le seuil d\'avis des tables (120) a disparu ou a bougé sans décision')
if (!/< 300\)/.test(api)) casse('le seuil ≥ 300 avis (hôtels) a disparu')
// Flux Eat : plusieurs intentions culinaires + halal toujours obligatoire.
if ((api.match(/halal/gi) ?? []).length < 6 || !/REQUETES_MANGER/.test(api)) casse('les requêtes multiples du flux Eat ont disparu')
if (!/!base && !mention/.test(api)) casse('une table sans halal vérifié NI signalé pourrait entrer dans le flux Eat')
if (!/PLAFOND/.test(api) || /panneaux: panneaux\.slice/.test(api)) casse('le plafond PAR CATÉGORIE a disparu — le flux Eat pourrait être tronqué')
if (!/photoRef\) return/.test(api)) casse('la photo obligatoire a disparu — un panneau sans photo redeviendrait possible')
if (!/estLatinLisible/.test(api)) casse('le filtre d\'écriture latine a disparu du pool')
if (!/contradictions\.push/.test(api)) casse('les contradictions entre sources ne sont plus collectées')
if (!/sources:/.test(api)) casse('la liste de sources (couche de confiance extensible) a disparu')
if (/['"]certifié/i.test(api)) casse('le mot interdit « certifié » apparaît dans le pipeline')
const comp = readFileSync('components/villes/Immersion.tsx', 'utf8')
if (!/contributeurs OpenStreetMap/.test(comp)) casse('le crédit ODbL a disparu du flux')
if (!/imm-js/.test(comp) || !/clearTimeout\(filet\)/.test(comp)) casse('le filet de résilience sans JavaScript a disparu')
if (!/\?lieu=/.test(comp)) casse('le lien profond de partage par lieu a disparu')

// ── 3. le World feed (GoHalalTravel phase 1) ──
const mw = readFileSync('middleware.ts', 'utf8')
if (!/pathname === '\/'\s*\)/.test(mw) || !/\/world/.test(mw)) casse('la réécriture accueil EN → /world a disparu du middleware')
const wp = readFileSync(fichierRoute('world/page.tsx'), 'utf8')
if (/halalScore\s*[:=]\s*\d/.test(wp) || /score:\s*\d/.test(wp)) casse('un HalalScore en dur dans le World feed — interdit (Règle B)')
if (!/description_en/.test(wp)) casse('l\'accroche ne vient plus de la base (description_en)')
if (!/compteurVille/.test(wp)) casse('le compteur OSM de lieux de prière a disparu du World feed')
for (const s of ['istanbul', 'marrakech', 'kuala-lumpur', 'dubai', 'doha', 'le-caire', 'sarajevo', 'londres', 'paris', 'bangkok']) {
  if (!existsSync(`data/villes/${s}.json`)) casse(`ville de lancement absente de la base : ${s}`)
}


// ── 4. phase 2 : flux Eat/Sleep/Do + carnet unique ──
const comp2 = readFileSync('components/villes/Immersion.tsx', 'utf8')
if (!/fluxDispo\.eat\.length >= 3/.test(comp2)) casse('la pilule Eat s\'affiche sans le plancher de 3 lieux — bouton sans destination possible')
if (!/panneauxVisibles/.test(comp2)) casse('les flux Eat/Sleep/Do ne filtrent plus le pool')
if (!existsSync(fichierRoute('saves/page.tsx')) || !existsSync('components/flux/MySaves.tsx')) casse('le carnet My saves a disparu')
const ms = readFileSync('components/flux/MySaves.tsx', 'utf8')
if (!/vh_wishlist_villes/.test(ms) || !/vh_immersion_gardes:/.test(ms)) casse('My saves ne lit plus les deux clés du carnet unique')
if (!/construire=1/.test(ms)) casse('« Build my days » depuis My saves a perdu sa destination')

// ── 5. mosquées, hôtels Places et recherche de ville ──
const api2 = readFileSync('app/api/immersion/route.ts', 'utf8')
if (!/prochesOsm\(l\.lat, l\.lng, 60, 1\)/.test(api2)) casse('les mosquées Places ne sont plus croisées avec notre base OSM')
if (!/AUCUNE\n    \/\/ promesse « sans alcool »|on ne l'invente/.test(api2)) casse('la garde « pas de promesse sans alcool sur un hôtel Places » a disparu')
const imm = readFileSync('components/villes/Immersion.tsx', 'utf8')
if (/hotel: en \? 'ALCOHOL-FREE'|hotel:.*SANS ALCOOL/.test(imm)) casse('« SANS ALCOOL » est redevenu l\'étiquette par défaut des hôtels — invention interdite')
const wf = readFileSync('components/flux/WorldFeed.tsx', 'utf8')
if (!/Find a city/.test(wf) || !/index\.filter/.test(wf)) casse('la recherche de ville a disparu du World feed')

if (fautes) { console.error(`${fautes} faute(s) — build arrêté.`); process.exit(1) }
console.log(`✅ immersion + flux : ${signatures.size} tirages distincts, seuils, Eat/Sleep/Do planchonnés, carnet unique en place.`)
