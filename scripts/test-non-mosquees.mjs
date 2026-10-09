// ⛪️ UNE CATHÉDRALE N'EST PAS UNE MOSQUÉE — et 168 l'étaient.
//
// Trouvé le 9 octobre, par accident, et c'est la façon dont il a été trouvé
// qui compte : je préparais un classement des villes par temps de marche
// jusqu'à une mosquée, et le résultat sortait **Milan 3 min, Florence 3 min,
// Malaga 3 min** devant presque toutes les villes de pays musulmans.
//
// Un résultat invraisemblable est un résultat à vérifier. `milan.json` :
//
//   { "nom": "Chiesa di San Gottardo in Corte", "type": "Mosquée" }
//   { "nom": "Cattedrale di Santa Maria del Fiore", "type": "Mosquée" }
//
// Un import en amont avait pris `amenity=place_of_worship` **sans filtrer
// `religion=muslim`**. Étendue : 168 entrées dans 55 villes — Venise 14 sur
// 17, Rio 10 sur 10, Florence 9 sur 11. Elles étaient comptées dans les
// titres (« Où prier à Venise : 17 mosquées ») et, depuis la veille,
// nommées sur les fiches d'hôtels comme « mosquée la plus proche ».
//
// 🔴 CE QUE CE TEST TIENT. Que le défaut ne revienne pas au prochain import.
// Il lit les 354 fiches et casse la construction si un lieu de prière porte
// un nom d'église, de temple ou de synagogue — ET aussi si un hôtel nomme un
// tel lieu comme sa mosquée la plus proche, parce que la faute se propageait
// par ce chemin-là sans toucher aux fiches.
//
// ⚠️ LA DOUBLE CONDITION EST LE CŒUR DU TEST. Un marqueur musulman PRIME sur
// le motif d'église. Sans ça, huit vraies mosquées seraient déclarées fausses :
// « Kerk Street Mosque » (Johannesburg), « Mosquée de Saint-Fons » (Lyon),
// « Ermita Mosque » (Manille), « Église musulmane » (Kinshasa). Vérifié en
// listant les gardes avant d'écrire la règle.
//
// La règle vit dans `scripts/purger-non-mosquees.mjs` et ce test l'importe :
// une règle à deux endroits est une règle qui divergera.
import { readFileSync, readdirSync } from 'node:fs'
import { estNonMusulman } from './purger-non-mosquees.mjs'

let fautes = 0
const casse = (m) => { console.error(`❌ ${m}`); fautes++ }

// Garde de la garde : la règle doit encore faire ce qu'on croit.
for (const [nom, attendu] of [
  ['Chiesa di San Gottardo in Corte', true],
  ['Cattedrale di Santa Maria del Fiore', true],
  ['Santa Maria della Salute', true],
  ['Basilica di San Marco', true],
  ['Naung Taw Gyi Pagoda', true],
  // et surtout : ce qui ne doit JAMAIS être écarté
  ['Kerk Street Mosque', false],
  ['Mosquée de Saint-Fons', false],
  ['Ermita Mosque', false],
  ['Église musulmane', false],
  ['Mosquée Sidi Salem', false],
  ['Hacı Arif Cami', false],
  ['Zaouia Tijania', false],
]) {
  if (estNonMusulman(nom) !== attendu) {
    casse(`estNonMusulman('${nom}') rend ${!attendu} au lieu de ${attendu} — la règle ne fait plus ce que son test dit.`)
  }
}

let lieux = 0, hotels = 0
for (const f of readdirSync('data/villes').filter((x) => x.endsWith('.json'))) {
  const ville = JSON.parse(readFileSync(`data/villes/${f}`, 'utf8'))

  for (const m of ville.mosqueesPrincipales ?? []) {
    lieux++
    if (estNonMusulman(m.nom)) {
      casse(`${f} liste « ${m.nom} » parmi les lieux de prière musulmans.\n   Lance « node scripts/purger-non-mosquees.mjs » — et si c'est bien une mosquée, ajoute son marqueur à la règle.`)
    }
  }

  // Le second chemin : la faute se propageait jusqu'aux hôtels.
  for (const h of ville.hotels ?? []) {
    if (!h.mosqueeProcheNom) continue
    hotels++
    if (estNonMusulman(h.mosqueeProcheNom)) {
      casse(`${f} : l'hôtel « ${h.nom} » annonce « ${h.mosqueeProcheNom} » comme mosquée la plus proche.\n   Relance l'enrichissement après la purge : node scripts/enrich-hotels-osm.mjs --toutes --sans-overpass`)
    }
  }
}

if (fautes) { console.error(`\n${fautes} faute(s) — build arrêté.`); process.exit(1) }
console.log(`✅ lieux de prière : ${lieux} relus et ${hotels} hôtels, aucune église, synagogue ni pagode annoncée comme mosquée.`)
