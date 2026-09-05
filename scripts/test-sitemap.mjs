// 🗺 LE SITEMAP NE DIT PAS L'INVERSE DES PAGES QU'IL ANNONCE.
//
// Ronde du 30 août. En cherchant pourquoi ~30 pages sur 810 seulement
// obtiennent un affichage, j'ai mesuré combien se déclarent `noindex`.
// L'hypothèse était fausse — 4 sur 810, pas 200 — mais la mesure a trouvé
// autre chose : ces 4 pages étaient **dans le sitemap ET en noindex**.
//
//   /mentions-legales    noindex, follow
//   /hotels/berkane      noindex, follow   (2 hôtels)
//   /hotels/fezouane     noindex, follow   (0 hôtel)
//   /hotels/tafoughalt   noindex, follow   (2 hôtels)
//
// Le sitemap dit « indexe-moi », la page dit « surtout pas ». Google le
// compte comme une erreur (« Page envoyée avec balise noindex ») et dépense
// du budget de crawl pour rien — sur un site dont on cherche justement à
// faire baisser les passages de robots.
//
// La cause : la règle du seuil vivait dans la page, le sitemap listait
// toutes les villes sans la connaître. Une constante partagée
// (HOTELS_MIN_INDEX) et deux lecteurs suffisent.
//
// ⚠️ Ce test ne peut PAS demander les pages : il tourne à la construction,
// sans serveur. Il vérifie donc la RÈGLE, là où elle se perd — dans l'écart
// entre ce que le sitemap liste et ce que la page déclare.
import { readFileSync, readdirSync } from 'node:fs'
import { fichierRoute } from './_routes.mjs'

let fautes = 0
const casse = (m) => { console.error(`❌ ${m}`); fautes++ }

const sitemap = readFileSync('app/sitemap.ts', 'utf8')
const hotels = readFileSync('components/hotels/HotelsRoute.tsx', 'utf8')

// ── 1. le seuil est UNE constante, lue des deux côtés ──
const seuil = Number(hotels.match(/export const HOTELS_MIN_INDEX = (\d+)/)?.[1])
if (!seuil) casse('HOTELS_MIN_INDEX a disparu de la page hôtels : le sitemap ne peut plus appliquer sa règle')
if (!/HOTELS_MIN_INDEX/.test(sitemap)) {
  casse('le sitemap n\'applique plus le seuil d\'indexation des pages hôtels — il renverra Google vers des pages en noindex')
}
if (/n < 3 \?/.test(hotels)) casse('le seuil est de nouveau écrit en dur dans la page : les deux règles vont diverger')

// ── 2. aucune page qui se déclare noindex n'est listée en dur ──
// Les pages statiques du sitemap sont écrites une par une : on vérifie que
// celles qui portent `index: false` n'y sont pas.
const listees = [...sitemap.matchAll(/L\('(\/[a-z0-9-]+)'\)/g)].map((m) => m[1])
for (const chemin of new Set(listees)) {
  const f = fichierRoute(`${chemin.slice(1)}/page.tsx`)
  let src = ''
  try { src = readFileSync(f, 'utf8') } catch { continue }
  if (/robots:\s*\{\s*index: false/.test(src)) {
    casse(`${chemin} se déclare noindex mais reste annoncée au sitemap — Google compte une erreur et dépense du crawl pour rien`)
  }
}

// ── 3. le compte, pour que la mesure reste lisible ──
let sousSeuil = 0, villes = 0
for (const f of readdirSync('data/villes').filter((x) => x.endsWith('.json'))) {
  villes++
  const v = JSON.parse(readFileSync(`data/villes/${f}`, 'utf8'))
  if ((v.hotels?.length ?? 0) < (seuil || 3)) sousSeuil++
}

if (fautes) { console.error(`\n${fautes} faute(s) — build arrêté.`); process.exit(1) }
console.log(`✅ sitemap : aucune page en noindex n'y est annoncée (${sousSeuil} ville(s) sur ${villes} sous le seuil de ${seuil} hôtels, écartées).`)
