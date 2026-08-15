// 🔴 LE TEST QUI CASSE LE BUILD SI DEUX HÔTELS ÉLOIGNÉS AFFICHENT LE MÊME
// COMPTE DE RESTAURANTS.
//
// Mohamed, sur Tirana, 15 août : « Tirana International : 7 restos halal
// < 1 km. Oxford Hotel : 7. Sar'Otel : 7. Central Loft : 7. Quatre hôtels à
// des endroits différents, tous exactement 7. Ce chiffre ne mesure rien. »
//
// LA MESURE A DONNÉ RAISON ET TORT À LA FOIS. Le compte est bien calculé
// depuis les coordonnées de chaque hôtel — les distances aux mosquées, elles,
// diffèrent (117, 148, 207, 246 m). Les quatre hôtels de Tirana sont
// simplement dans les 400 mètres du centre. Le chiffre n'était pas faux, il
// était inutile.
//
// Ce test vérifie donc ce qui compte VRAIMENT : que deux hôtels RÉELLEMENT
// éloignés ne puissent jamais afficher le même compte. Si cela arrivait, ce
// serait la preuve d'une valeur figée ou recopiée — le mensonge que Mohamed
// soupçonnait.

import { readFileSync, readdirSync } from 'node:fs'

const R = 6371
const rad = Math.PI / 180
function distKm(a, b) {
  const h = Math.sin(((b.lat - a.lat) * rad) / 2) ** 2 +
    Math.cos(a.lat * rad) * Math.cos(b.lat * rad) * Math.sin(((b.lng - a.lng) * rad) / 2) ** 2
  return R * 2 * Math.asin(Math.sqrt(h))
}

// ⚠️ PREMIÈRE VERSION DE CE TEST : FAUSSE, ET INSTRUCTIVE.
// J'avais écrit « deux hôtels éloignés ne doivent jamais avoir le même
// compte ». Résultat : 3 428 alertes, presque toutes légitimes — deux
// hôtels distants peuvent parfaitement avoir 3 restaurants chacun dans leur
// rayon d'un kilomètre, par simple coïncidence. Un test qui crie sur du
// normal apprend à ignorer les tests.
//
// Ce que Mohamed soupçonnait, c'est une valeur FIGÉE ou RECOPIÉE. Sa
// signature n'est pas une égalité entre deux hôtels : c'est que TOUS les
// hôtels d'une ville affichent la même valeur alors qu'ils sont dispersés,
// ou que cette valeur est le total de la ville. C'est cela qu'on teste.

/** Au-delà, deux hôtels ne voient PAS le même quartier. */
const ELOIGNES_KM = 3
/** En dessous, un compte identique ne prouve rien (peu de données). */
const COMPTE_SIGNIFICATIF = 3

const fautes = []
let villesExaminees = 0

for (const f of readdirSync('data/villes').filter((x) => x.endsWith('.json'))) {
  let v
  try { v = JSON.parse(readFileSync(`data/villes/${f}`, 'utf-8')) } catch { continue }
  const restos = (v.restaurants ?? []).filter((r) => typeof r.lat === 'number').map((r) => ({ lat: r.lat, lng: r.lng }))
  const hotels = (v.hotels ?? []).filter((h) => typeof h.lat === 'number')
  if (restos.length < 5 || hotels.length < 4) continue

  const comptes = hotels.map((h) => ({
    nom: h.nom,
    c: { lat: h.lat, lng: h.lng },
    n: restos.reduce((n, r) => (distKm({ lat: h.lat, lng: h.lng }, r) <= 1 ? n + 1 : n), 0),
  }))

  // Les hôtels sont-ils réellement dispersés ? On mesure l'étalement.
  let etalement = 0
  for (let i = 0; i < comptes.length; i++) {
    for (let j = i + 1; j < comptes.length; j++) {
      const d = distKm(comptes[i].c, comptes[j].c)
      if (d > etalement) etalement = d
    }
  }
  if (etalement < ELOIGNES_KM) continue  // tous dans le même quartier : normal qu'ils voient la même chose
  villesExaminees++

  // 1. Une seule valeur pour toute une ville étalée = valeur figée.
  const valeurs = new Set(comptes.map((x) => x.n))
  if (valeurs.size === 1 && comptes[0].n >= COMPTE_SIGNIFICATIF) {
    fautes.push(`${v.nom} — les ${comptes.length} hôtels, étalés sur ${etalement.toFixed(1)} km, affichent TOUS ${comptes[0].n} restos : valeur figée`)
  }

  // 2. Le total de la ville recopié sur un hôtel qui n'est pas au centre
  //    de tout : impossible autrement que par recopie.
  for (const x of comptes) {
    if (x.n === restos.length && restos.length >= COMPTE_SIGNIFICATIF) {
      const loin = restos.filter((r) => distKm(x.c, r) > 1).length
      if (loin > 0) fautes.push(`${v.nom} — « ${x.nom} » affiche ${x.n}, soit le total de la ville, alors que ${loin} restaurants sont à plus d'1 km`)
    }
  }
}

if (fautes.length) {
  console.error(`\n❌ HÔTELS — ${fautes.length} compte(s) figé(s) ou recopié(s) :\n`)
  for (const x of fautes.slice(0, 15)) console.error('   · ' + x)
  if (fautes.length > 15) console.error(`   … et ${fautes.length - 15} autres`)
  console.error('')
  process.exit(1)
}
console.log(`✅ hôtels situés : ${villesExaminees} villes dont les hôtels s'étalent sur plus de ${ELOIGNES_KM} km — aucun compte figé ni recopié du total.`)
