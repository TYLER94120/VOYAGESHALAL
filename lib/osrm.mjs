// 🗺️ OSRM — le REPLI GRATUIT des temps de trajet (itération 6, correction 2).
//
// Troisième itération où les temps 🚶/🚗 manquent : quand l'API Routes de
// Google refuse (service non activé sur la clé, facturation), l'app n'avait
// QUE les mètres. OSRM (le moteur de routage d'OpenStreetMap) rend des
// durées RÉELLES, sans clé et sans facturation — suffisant pour démarrer,
// auto-hébergeable plus tard.
//
// Serveurs publics : routing.openstreetmap.de expose un profil PIÉTON et un
// profil VOITURE distincts (router.project-osrm.org ne route que la
// voiture). Deux profils = deux appels — le temps d'un mode ne sert jamais
// à l'autre, même règle que Google.
//
// En .mjs : le test scripts/test-trajets.mjs interroge ce module AVANT
// chaque build — c'est lui qui empêche ce bug de revenir une 4e fois.

const HOTES = {
  marche: 'https://routing.openstreetmap.de/routed-foot',
  voiture: 'https://routing.openstreetmap.de/routed-car',
}

/**
 * Durées réelles OSRM pour 1 origine → N destinations, un mode.
 * Rend [{ min, metres } | null] — null quand OSRM n'a pas de route.
 * Lance une exception si le SERVICE est injoignable ou répond n'importe
 * quoi : c'est à l'appelant de décider du repli.
 */
export async function osrmMinutes(origine, dests, mode, delaiMs = 2500) {
  const hote = HOTES[mode]
  if (!hote) throw new Error(`mode inconnu : ${mode}`)
  const coords = [origine, ...dests].map((p) => `${p.lng},${p.lat}`).join(';')
  const sources = '0'
  const destinations = dests.map((_, i) => i + 1).join(';')
  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), delaiMs)
  try {
    // /table : UNE requête pour toutes les destinations du mode.
    const r = await fetch(`${hote}/table/v1/driving/${coords}?sources=${sources}&destinations=${destinations}&annotations=duration,distance`, { signal: ac.signal })
    if (!r.ok) throw new Error(`osrm ${mode} ${r.status}`)
    const j = await r.json()
    if (j.code !== 'Ok' || !Array.isArray(j.durations?.[0])) throw new Error(`osrm ${mode} : réponse sans durées (${j.code ?? '?'})`)
    return j.durations[0].map((s, i) => (typeof s === 'number'
      ? { min: Math.max(1, Math.round(s / 60)), metres: Math.round(j.distances?.[0]?.[i] ?? 0) }
      : null))
  } finally { clearTimeout(t) }
}
