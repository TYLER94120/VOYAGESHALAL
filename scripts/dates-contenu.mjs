#!/usr/bin/env node
// 📅 LES VRAIES DATES DE MISE À JOUR, LUES DANS L'HISTORIQUE GIT.
//
// Jusqu'ici, chaque article affichait « Mis à jour en juillet 2026 » :
// une date de révision globale posée à la main dans lib/freshness.ts,
// identique pour les 93 contenus. C'était commode et faux — un article
// retouché hier et un autre jamais rouvert affichaient la même chose.
//
// Ce script lit la date du dernier commit ayant réellement modifié CHAQUE
// bloc de contenu, et l'écrit dans data/dates-contenu.json.
//
// LE PIÈGE, ET IL EST RÉEL : `git log -S<motif>` ne remonte que les
// commits où le motif APPARAÎT ou DISPARAÎT — donc la création, jamais les
// enrichissements suivants. Il faut `git log -L <début>,<fin>:<fichier>`,
// qui suit l'évolution d'une plage de lignes à travers l'historique.
//
// Autre piège, découvert ici : l'environnement clone en superficiel
// (142 commits sur 540). Sans `git fetch --unshallow`, toutes les dates
// remonteraient au début de l'historique tronqué. Le script refuse donc
// de tourner sur un dépôt superficiel plutôt que d'écrire des dates fausses.

import fs from 'fs'
import path from 'path'
import { execSync } from 'child_process'

const racine = process.cwd()

if (fs.existsSync(path.join(racine, '.git', 'shallow'))) {
  console.error('✗ Dépôt superficiel : lancez `git fetch --unshallow` d’abord.')
  console.error('  Sans historique complet, les dates seraient fausses — on préfère ne rien écrire.')
  process.exit(1)
}

const git = (cmd) => execSync(cmd, { cwd: racine, encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 })

/** Date du dernier commit ayant touché les lignes [debut, fin] du fichier. */
function derniereDate(fichier, debut, fin) {
  try {
    const sortie = git(`git log -L ${debut},${fin}:${fichier} --format=%cI --max-count=1 2>/dev/null | head -1`)
    const d = sortie.trim().split('\n')[0]
    return /^\d{4}-\d{2}-\d{2}/.test(d) ? d.slice(0, 10) : null
  } catch { return null }
}

// ── 1. Articles et guides : chaque bloc `slug: "…"` de lib/data.ts ──
const fichierData = 'lib/data.ts'
const lignes = fs.readFileSync(path.join(racine, fichierData), 'utf8').split('\n')
const blocs = []
for (let i = 0; i < lignes.length; i++) {
  const m = lignes[i].match(/^\s*slug: ['"]([a-z0-9-]+)['"],/)
  if (m) blocs.push({ slug: m[1], debut: i + 1 })
}
// La fin d'un bloc est le début du suivant (ou la fin du fichier)
blocs.forEach((b, i) => { b.fin = i + 1 < blocs.length ? blocs[i + 1].debut - 1 : lignes.length })

const dates = {}
let trouves = 0
for (const b of blocs) {
  const d = derniereDate(fichierData, b.debut, b.fin)
  if (d) { dates[b.slug] = d; trouves++ }
  process.stdout.write(`\r  ${trouves}/${blocs.length} contenus datés…`)
}
process.stdout.write('\n')

// ── 2. Fiches villes : un fichier = un contenu, donc le log suffit ──
const dirVilles = path.join(racine, 'data', 'villes')
let villes = 0
for (const f of fs.readdirSync(dirVilles).filter((x) => x.endsWith('.json'))) {
  try {
    const d = git(`git log -1 --format=%cI -- data/villes/${f}`).trim().slice(0, 10)
    if (/^\d{4}-\d{2}-\d{2}$/.test(d)) { dates[`ville:${f.replace('.json', '')}`] = d; villes++ }
  } catch { /* fichier non suivi */ }
}

const sortie = path.join(racine, 'data', 'dates-contenu.json')
fs.writeFileSync(sortie, JSON.stringify({
  _doc: 'Dates de dernière modification RÉELLES, lues par scripts/dates-contenu.mjs dans l’historique git (git log -L). Ne jamais éditer à la main.',
  _genereLe: new Date().toISOString().slice(0, 10),
  dates: Object.fromEntries(Object.entries(dates).sort()),
}, null, 2))

const parAnnee = {}
for (const d of Object.values(dates)) { const a = d.slice(0, 7); parAnnee[a] = (parAnnee[a] ?? 0) + 1 }
console.log(`✓ ${trouves} articles/guides + ${villes} fiches villes datés → data/dates-contenu.json`)
console.log('  Répartition par mois :', parAnnee)
