// ⏱ LE GPS NE BLOQUE JAMAIS L'ÉCRAN.
//
// Mohamed, 21 août : « le temps de recherche et le temps d'ouverture de la
// page d'accueil, ça met du temps. Disons trois, quatre secondes. »
//
// MESURE D'ABORD (serveur, build de production) : accueil français 0,29 s,
// page ville 0,06 s, autour de moi 0,02 s ; en 4G simulée, premier affichage
// à 564 ms pour 289 Ko. Le serveur n'était pas en cause.
//
// LES DEUX ATTENTES ÉTAIENT DANS LE PARCOURS :
//   1. « Autour de moi » attendait le GPS jusqu'à VINGT secondes avant
//      d'appeler quoi que ce soit ;
//   2. le bouton de l'accueil attendait le GPS HAUTE PRÉCISION (cache
//      ignoré) avant même de changer de page — et la page suivante
//      redemandait la position derrière.
//
// Mesuré après correction, avec un GPS simulé à 4 s : la recherche part à
// 1 269 ms au lieu de 4 000+, puis se corrige toute seule quand le GPS
// arrive et qu'il déplace le point de plus de 300 m.
//
// Ce test tient la règle, pas les millisecondes : un chiffre de temps
// dépend de la machine, une règle non.
import { readFileSync } from 'node:fs'

let fautes = 0
const casse = (m) => { console.error(`❌ ${m}`); fautes++ }

const surMesure = readFileSync('components/lieux/SurMesure.tsx', 'utf8')

// 1. L'attente avant de chercher reste courte, et nommée.
if (!/ATTENTE_GPS_MS = (\d{3,4})\b/.test(surMesure)) {
  casse('l\'attente GPS avant recherche n\'est plus une constante nommée')
} else {
  const ms = Number(surMesure.match(/ATTENTE_GPS_MS = (\d+)/)[1])
  if (ms > 2000) casse(`l'attente GPS avant recherche est remontée à ${ms} ms — l'écran redeviendrait long`)
}
if (/await gps\(forcerGPS \? 25_000 : 20_000\)/.test(surMesure)) {
  casse('la recherche attend de nouveau le GPS jusqu\'à 20 s')
}
// Le bouton « ma position exacte » a le droit d'attendre : c'est demandé.
if (!/forcerGPS \? 25_000 : ATTENTE_GPS_MS/.test(surMesure)) {
  casse('le compromis attente courte / GPS forcé a disparu')
}

// 2. Une position approchée ne reste pas approchée en silence.
if (!/relanceFaite/.test(surMesure)) casse('la correction automatique après arrivée du GPS a disparu')
if (!/> 300/.test(surMesure)) casse('le seuil de correction (300 m) a disparu : une liste fausse pourrait rester affichée')

// 3. L'accueil n'attend plus le GPS pour ouvrir la page.
const hero = readFileSync('components/accueil/HeroDepart.tsx', 'utf8')
if (/await getPosition\(/.test(hero)) {
  casse('le bouton « Autour de moi » attend de nouveau la position avant de changer de page')
}
if (!/router\.push\('\/autour-de-moi'\)/.test(hero)) casse('le bouton « Autour de moi » ne mène plus nulle part')

if (fautes) { console.error(`\n${fautes} faute(s) — build arrêté.`); process.exit(1) }
console.log('✅ vitesse : le GPS ne bloque ni la recherche ni l\'ouverture, et une position approchée se corrige seule.')
