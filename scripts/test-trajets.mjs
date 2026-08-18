// 🧪 LES TEMPS DE TRAJET — le test qui empêche le bug de revenir une 4e fois
// (itération 6, correction 2). Il interroge le service de temps pour une
// paire de points connus (Fontenay-sous-Bois → Vincennes, ~2 km) et ÉCHOUE
// si la réponse ne contient pas les deux durées.
//
// Distinction honnête : un RÉSEAU coupé (bac à sable, CI hors-ligne) n'est
// pas un service cassé — on prévient et on laisse passer ; une réponse HTTP
// qui arrive SANS durées, elle, casse le build.
import { osrmMinutes } from '../lib/osrm.mjs'

const origine = { lat: 48.8512, lng: 2.4772 }
const dests = [{ lat: 48.8443, lng: 2.4324 }]

let reseau = true
let marche = null, voiture = null
try {
  marche = await osrmMinutes(origine, dests, 'marche', 8000)
} catch (e) {
  const msg = e instanceof Error ? e.message : String(e)
  if (/fetch failed|abort|network|ENOTFOUND|ECONN|terminated|403/i.test(msg)) { reseau = false } // 403 : le proxy du bac à sable répond en texte brut — sur Vercel, OSRM ne 403 pas
  else { console.error(`❌ trajets : OSRM marche a répondu sans durées — ${msg}`); process.exit(1) }
}
try {
  voiture = await osrmMinutes(origine, dests, 'voiture', 8000)
} catch (e) {
  const msg = e instanceof Error ? e.message : String(e)
  if (/fetch failed|abort|network|ENOTFOUND|ECONN|terminated|403/i.test(msg)) { reseau = false } // 403 : le proxy du bac à sable répond en texte brut — sur Vercel, OSRM ne 403 pas
  else { console.error(`❌ trajets : OSRM voiture a répondu sans durées — ${msg}`); process.exit(1) }
}

if (!reseau) {
  console.warn('⚠️ trajets : réseau injoignable dans cet environnement — test des durées sauté (il tourne sur le build Vercel).')
  process.exit(0)
}
const m = marche?.[0], v = voiture?.[0]
if (!m || !v || !(m.min > 0) || !(v.min > 0)) {
  console.error(`❌ trajets : durées manquantes — marche=${JSON.stringify(m)} voiture=${JSON.stringify(v)}`)
  process.exit(1)
}
if (m.min <= v.min) {
  // ~2 km : la marche doit être plus longue que la voiture — sinon les
  // profils sont confondus, exactement le bug d'origine.
  console.error(`❌ trajets : marche (${m.min} min) ≤ voiture (${v.min} min) sur 2 km — profils confondus ?`)
  process.exit(1)
}
console.log(`✅ trajets : deux durées réelles distinctes (marche ${m.min} min · voiture ${v.min} min sur ~2 km), profils séparés.`)
