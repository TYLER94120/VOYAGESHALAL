// ⏱️ LES MINUTES RÉELLES — API Routes (computeRouteMatrix), décision actée
// par Mohamed (itération 2, correction 3) : « toujours des minutes réelles,
// jamais des kilomètres seuls ».
//
// Discipline de coût, la même que Places :
//   - au plus 3 destinations par recherche, marche + voiture = 6 éléments ;
//   - la réponse /api/lieux est déjà mise en cache avec ses fiches — les
//     minutes voyagent dedans, donc un cache-hit ne rappelle pas Routes ;
//   - délai maximum 1 500 ms et échec SILENCIEUX : le client sait calculer
//     des minutes estimées depuis la distance (components/lieux/TrajetMin),
//     personne n'attend jamais Routes.
// La clé reste côté serveur, comme partout.

interface Dest { lat: number; lng: number; marcheMin?: number; voitureMin?: number }

async function matrice(cle: string, origine: { lat: number; lng: number }, dests: Dest[], mode: 'WALK' | 'DRIVE', signal: AbortSignal): Promise<(number | null)[]> {
  const r = await fetch('https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix', {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': cle,
      'X-Goog-FieldMask': 'originIndex,destinationIndex,duration,condition',
    },
    body: JSON.stringify({
      origins: [{ waypoint: { location: { latLng: { latitude: origine.lat, longitude: origine.lng } } } }],
      destinations: dests.map((d) => ({ waypoint: { location: { latLng: { latitude: d.lat, longitude: d.lng } } } })),
      travelMode: mode,
    }),
  })
  if (!r.ok) throw new Error(`routes ${r.status}`)
  const rows = (await r.json()) as { destinationIndex?: number; duration?: string; condition?: string }[]
  const out: (number | null)[] = dests.map(() => null)
  for (const el of rows ?? []) {
    if (el.condition !== 'ROUTE_EXISTS' || typeof el.destinationIndex !== 'number') continue
    const s = parseInt(String(el.duration ?? '').replace(/s$/, ''), 10)
    if (Number.isFinite(s)) out[el.destinationIndex] = Math.max(1, Math.round(s / 60))
  }
  return out
}

/** Écrit marcheMin/voitureMin sur les fiches (3 max). Jamais bloquant. */
export async function ajouterMinutes(fiches: Dest[], origine: { lat: number; lng: number }): Promise<void> {
  const cle = process.env.GOOGLE_PLACES_KEY
  const dests = fiches.slice(0, 3).filter((f) => typeof f.lat === 'number' && typeof f.lng === 'number')
  if (!cle || !dests.length) return
  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), 1500)
  try {
    const [marche, voiture] = await Promise.all([
      matrice(cle, origine, dests, 'WALK', ac.signal),
      matrice(cle, origine, dests, 'DRIVE', ac.signal),
    ])
    dests.forEach((f, i) => {
      if (marche[i] != null) f.marcheMin = marche[i]!
      if (voiture[i] != null) f.voitureMin = voiture[i]!
    })
  } catch { /* Routes muet : les minutes estimées prennent le relais */ } finally { clearTimeout(t) }
}
