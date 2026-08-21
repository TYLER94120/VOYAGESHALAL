// 🧭 PAS D'ONGLET FANTÔME DERRIÈRE L'ITINÉRAIRE.
//
// Mohamed, 21 août, capture à l'appui : « je clique sur itinéraire, ça me
// donne l'itinéraire, je reviens sur le site et j'ai ça » — une page
// blanche avec un bouton « OK ». C'était l'onglet que le site avait
// ouvert : iOS passe la main à l'app Plans, et la fenêtre laissée derrière
// reste vide. Elle ne se referme pas seule, et c'est elle qu'on retrouve.
//
// LA RÈGLE, et elle tient en une phrase : un lien d'itinéraire est un lien
// UNIVERSEL https suivi DANS L'ONGLET COURANT.
//   · pas de window.open — c'est lui qui laisse l'onglet vide ;
//   · pas de target="_blank" — même effet par un autre chemin ;
//   · pas de schéma d'application (maps://, google.navigation:) — celui-là
//     casse la page au retour, c'était le défaut de l'itération 6.
import { readFileSync, readdirSync, statSync } from 'node:fs'
import path from 'node:path'

let fautes = 0
const casse = (m) => { console.error(`❌ ${m}`); fautes++ }

const fichiers = []
const parcourir = (d) => {
  for (const e of readdirSync(d)) {
    const p = path.join(d, e)
    if (statSync(p).isDirectory()) { if (e !== 'node_modules' && e !== '.next') parcourir(p) }
    else if (/\.(tsx|ts)$/.test(e)) fichiers.push(p)
  }
}
for (const racine of ['components', 'app', 'lib']) parcourir(racine)

for (const f of fichiers) {
  const src = readFileSync(f, 'utf8')
  // On ne juge que le code, pas les commentaires qui racontent l'histoire.
  const code = src.split('\n').filter((l) => !/^\s*(\/\/|\*|\/\*)/.test(l)).join('\n')

  for (const balise of code.match(/<a[^>]*>/g) ?? []) {
    if (/maps\/dir/.test(balise) && /target=["']_blank/.test(balise)) {
      casse(`${f} : un lien d'itinéraire s'ouvre dans un nouvel onglet — c'est l'onglet blanc du 21 août`)
    }
  }
  if (/window\.open\([^)]*maps/.test(code)) {
    casse(`${f} : window.open vers une carte — laisse une fenêtre vide derrière`)
  }
  if (/location\.href\s*=\s*[`'"](maps:|comgooglemaps:|google\.navigation:)/.test(code)) {
    casse(`${f} : schéma d'application dans l'URL courante — casse la page au retour (défaut de l'itération 6)`)
  }
}

const lanceur = readFileSync('lib/itineraire.ts', 'utf8')
if (/window\.open/.test(lanceur.split('\n').filter((l) => !/^\s*(\/\/|\*)/.test(l)).join('\n'))) {
  casse('lib/itineraire.ts ouvre de nouveau un onglet')
}
if (!/window\.location\.href = lienItineraire/.test(lanceur)) {
  casse('lib/itineraire.ts ne suit plus le lien universel dans l\'onglet courant')
}

if (fautes) { console.error(`\n${fautes} faute(s) — build arrêté.`); process.exit(1) }
console.log(`✅ itinéraire : ${fichiers.length} fichiers vérifiés, aucun onglet ouvert, aucun schéma d'application — on revient sur le site, pas sur une page blanche.`)
