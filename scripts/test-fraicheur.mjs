// 📅 LA DATE QU'ON ANNONCE À GOOGLE — jamais inventée, jamais oubliée.
//
// Capture de Search Console, 29 août, 28 derniers jours, voyageshalal.fr :
//
//   Salle de prière à Disneyland Paris : où p…   47 clics   ↑ 1 075 %
//   Parc Astérix : pas de salle de prière, où…   23 clics   (précédent : 0)
//   Où prier dans les gares de Paris : 6 gar…     7 clics
//   Salle de prière à l'aéroport d'Orly : où p…   4 clics
//   Salle de prière au Puy du Fou : où prier…     3 clics
//
// Deux titres réécrits le 27 août. Un seul est arrivé dans Google :
// **Parc Astérix**, publié le 6 août. Disneyland et Orly, publiés le
// 20 juillet, affichaient encore leur ANCIEN titre — celui qui promettait
// une salle de prière que l'article dit inexistante.
//
// La cause, dans app/sitemap.ts :
//     lastModified: new Date(p.publishedAt)
// Le sitemap annonçait la date de PUBLICATION. Un titre changé ne
// produisait donc aucun signal de fraîcheur : Google repassait à son
// rythme — vite sur les pages récentes, lentement sur les autres.
//
// 🔴 LA RÈGLE QUE CE TEST TIENT. Une date de modification ne s'écrit que
// sur un article réellement modifié. Poser `updatedAt` partout « pour
// faire remonter » serait exactement inventer une date : Google mesure la
// constance de ces annonces, et une page déclarée modifiée sans l'être
// perd sa crédibilité de fraîcheur — pour toutes les autres avec elle.
import { readFileSync } from 'node:fs'

let fautes = 0
const casse = (m) => { console.error(`❌ ${m}`); fautes++ }

const src = readFileSync('lib/data.ts', 'utf8')
const sitemap = readFileSync('app/sitemap.ts', 'utf8')
const types = readFileSync('lib/types.ts', 'utf8')

// ── 1. le sitemap sert bien la date de modification ──
if (!/lastModified: new Date\(p\.updatedAt \?\? p\.publishedAt\)/.test(sitemap)) {
  casse('le sitemap annonce de nouveau la date de publication : un titre réécrit resterait invisible pour Google')
}
if (!/updatedAt\?: string/.test(types)) casse('le champ updatedAt a disparu du type')

// ── 2. aucune date inventée ──
const AUJOURDHUI = new Date()
let avec = 0, total = 0
for (const m of src.matchAll(/publishedAt: '(\d{4}-\d{2}-\d{2})',(?:\s*|\n\s*)(?:updatedAt: '(\d{4}-\d{2}-\d{2})',)?/g)) {
  total++
  const [, publie, modifie] = m
  if (!modifie) continue
  avec++
  if (modifie < publie) casse(`un article annonce avoir été modifié (${modifie}) AVANT d'être publié (${publie})`)
  if (new Date(modifie) > AUJOURDHUI) casse(`un article annonce une modification dans le futur : ${modifie}`)
}
if (total < 50) casse(`seuls ${total} articles relus — la lecture de lib/data.ts a dû casser`)

// ── 3. la date de modification reste l'exception ──
// Si TOUS les articles en portent une, c'est qu'on a cessé de la mériter.
if (avec > total * 0.6) {
  casse(`${avec} articles sur ${total} annoncent une modification : une date posée partout n'est plus une information`)
}

if (fautes) { console.error(`\n${fautes} faute(s) — build arrêté.`); process.exit(1) }
console.log(`✅ fraîcheur : ${avec} articles sur ${total} portent une date de modification réelle, aucune antérieure à la publication ni dans le futur.`)
