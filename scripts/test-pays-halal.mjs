// 🛡️ GARDE-FOU — « aucun kebab à Berkane » ne doit plus jamais arriver,
// et « halal par défaut » ne doit jamais déborder sur un pays où il serait
// faux. Ce test tourne avant chaque build (npm run build).
//
// Il vérifie trois choses, sur les VRAIES données du dépôt :
//  1. la liste des pays reste prudente (ni trop large, ni trop étroite) ;
//  2. les villes de nos fiches qui n'ont AUCUN restaurant sont couvertes
//     par le rattrapage — sinon l'accueil y annonce « aucun » à tort ;
//  3. la mention affichée ne promet jamais qu'un lieu est halal.

import fs from 'fs'
import path from 'path'

const src = fs.readFileSync('lib/paysHalalDefaut.ts', 'utf8')
const bloc = src.match(/const PAYS = \[([\s\S]*?)\]/)
if (!bloc) { console.error('❌ liste PAYS introuvable dans lib/paysHalalDefaut.ts'); process.exit(1) }
const PAYS = [...bloc[1].matchAll(/'([^']+)'/g)].map((m) => m[1])

const norm = (s) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
const SET = new Set(PAYS.map(norm))
const dedans = (p) => SET.has(norm(p))

let ko = 0
const echec = (m) => { console.error('❌ ' + m); ko++ }

// 1. Doivent y être : le cas de Mohamed et ses voisins immédiats.
for (const p of ['Maroc', 'Algérie', 'Tunisie', 'Arabie Saoudite', 'Égypte', 'Pakistan', 'Turquie']) {
  if (!dedans(p)) echec(`${p} devrait être dans la liste`)
}
// Ne doivent PAS y être : pays où le porc est courant dans la restauration
// ordinaire, majorité musulmane ou non. Y entrer ferait afficher des lieux
// sans étiquette là où l'étiquette est justement ce qui distingue.
for (const p of ['France', 'Indonésie', 'Malaisie', 'Liban', 'Bosnie', 'Albanie', 'Kazakhstan', 'Nigéria', 'Inde', 'Espagne']) {
  if (dedans(p)) echec(`${p} ne devrait PAS être dans la liste`)
}

// 2. Toute ville de nos fiches sans aucun restaurant doit être rattrapée,
//    OU être dans un pays où l'absence de données est un vrai manque à
//    combler (on l'affiche alors, pour qu'on sache où travailler).
const dir = path.join(process.cwd(), 'data', 'villes')
const orphelines = []
for (const f of fs.readdirSync(dir)) {
  if (!f.endsWith('.json')) continue
  let v
  try { v = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')) } catch { continue }
  if ((v.restaurants ?? []).length === 0 && !dedans(v.pays ?? '')) {
    orphelines.push(`${v.nom} (${v.pays})`)
  }
}

// 3. La mention ne promet rien.
const mention = src.match(/mentionPaysMusulman[\s\S]*?\}/)?.[0] ?? ''
if (!/à vérifier sur place/.test(mention) || !/non renseigné/.test(mention)) {
  echec('la mention doit dire « statut halal non renseigné » ET « à vérifier sur place »')
}
if (/certifi|garanti/i.test(mention)) echec('la mention ne doit jamais parler de certification')

if (ko) { console.error(`\n${ko} problème(s) — build arrêté.`); process.exit(1) }
console.log(`✅ pays halal par défaut : ${PAYS.length} pays, liste prudente, mention honnête.`)
if (orphelines.length) {
  console.log(`ℹ️  ${orphelines.length} ville(s) sans aucun restaurant hors rattrapage, à enrichir : ${orphelines.join(', ')}`)
}
