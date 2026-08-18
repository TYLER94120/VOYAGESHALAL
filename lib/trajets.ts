import { Redis } from '@upstash/redis'

// ⏱️ LES MINUTES RÉELLES — API Routes (computeRouteMatrix).
//
// Itération 3, correction 1 — LA LEÇON : l'app a affiché « 🚶 4 min » pour
// un lieu à 11 min de marche réelle. La cause : quand Routes ne répondait
// pas, le client CALCULAIT des minutes depuis la distance à vol d'oiseau —
// une estimation présentée comme un temps de marche. Sur une app de
// confiance, une donnée fausse coûte plus cher qu'une donnée absente.
// Depuis : AUCUNE minute estimée, nulle part. Pas de réponse Routes = des
// mètres à l'écran, honnêtes et vérifiables.
//
// Règles :
//   - DEUX appels distincts, mode WALK et mode DRIVE — jamais le temps
//     d'un mode réutilisé ni déduit pour l'autre ;
//   - GARDE-FOU : le temps piéton doit correspondre à ~4,5 km/h sur la
//     DISTANCE DU TRAJET (±40 %) ; sinon on journalise et on jette la
//     minute (le client affichera les mètres) ;
//   - cache Redis 2 minutes par lieu + position (la position exacte entre
//     entière dans la clé — l'arrondi ne sort jamais d'une clé de cache) ;
//   - 3 destinations max, 1,5 s de délai, échec silencieux.

interface Dest { lat: number; lng: number; marcheMin?: number; voitureMin?: number }
interface Mesure { min: number; metres: number }

async function matrice(cle: string, origine: { lat: number; lng: number }, dests: Dest[], mode: 'WALK' | 'DRIVE', signal: AbortSignal): Promise<(Mesure | null)[]> {
  const r = await fetch('https://routes.googleapis.com/distanceMatrix/v2:computeRouteMatrix', {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': cle,
      'X-Goog-FieldMask': 'originIndex,destinationIndex,duration,distanceMeters,condition',
    },
    body: JSON.stringify({
      origins: [{ waypoint: { location: { latLng: { latitude: origine.lat, longitude: origine.lng } } } }],
      destinations: dests.map((d) => ({ waypoint: { location: { latLng: { latitude: d.lat, longitude: d.lng } } } })),
      travelMode: mode,
    }),
  })
  if (!r.ok) throw new Error(`routes ${r.status}`)
  const rows = (await r.json()) as { destinationIndex?: number; duration?: string; distanceMeters?: number; condition?: string }[]
  const out: (Mesure | null)[] = dests.map(() => null)
  for (const el of rows ?? []) {
    if (el.condition !== 'ROUTE_EXISTS' || typeof el.destinationIndex !== 'number') continue
    const s = parseInt(String(el.duration ?? '').replace(/s$/, ''), 10)
    if (Number.isFinite(s)) out[el.destinationIndex] = { min: Math.max(1, Math.round(s / 60)), metres: el.distanceMeters ?? 0 }
  }
  return out
}

/** Le garde-fou de cohérence : ~4,5 km/h (75 m/min) sur la distance du
 *  TRAJET, tolérance ±40 %. Hors de la fourchette = temps jeté + journal. */
export function marcheCoherente(min: number, metresTrajet: number): boolean {
  if (!metresTrajet) return true // pas de distance pour juger : on fait confiance à Routes
  const attendu = metresTrajet / 75
  return min >= attendu * 0.6 && min <= attendu * 1.4
}

/** Écrit marcheMin/voitureMin sur les fiches (3 max). Jamais bloquant,
 *  jamais estimé. `r` : cache 2 min par lieu + position. */
export async function ajouterMinutes(fiches: Dest[], origine: { lat: number; lng: number }, r?: Redis | null): Promise<void> {
  const cle = process.env.GOOGLE_PLACES_KEY
  const dests = fiches.slice(0, 3).filter((f) => typeof f.lat === 'number' && typeof f.lng === 'number')
  if (!cle || !dests.length) return

  const cacheCle = (d: Dest) => `vh:trajet:v2:${origine.lat},${origine.lng}:${d.lat},${d.lng}`
  const restants: Dest[] = []
  if (r) {
    try {
      const vals = await r.mget<({ m?: number; v?: number } | null)[]>(...dests.map(cacheCle))
      dests.forEach((d, i) => {
        const c = vals[i]
        if (c && typeof c === 'object') {
          if (typeof c.m === 'number') d.marcheMin = c.m
          if (typeof c.v === 'number') d.voitureMin = c.v
        } else restants.push(d)
      })
    } catch { restants.push(...dests) }
  } else restants.push(...dests)
  if (!restants.length) return

  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), 1500)
  try {
    // Deux modes, deux appels — le temps d'un mode ne sert JAMAIS à l'autre.
    const [marche, voiture] = await Promise.all([
      matrice(cle, origine, restants, 'WALK', ac.signal),
      matrice(cle, origine, restants, 'DRIVE', ac.signal),
    ])
    restants.forEach((f, i) => {
      const m = marche[i], v = voiture[i]
      if (m) {
        if (marcheCoherente(m.min, m.metres)) f.marcheMin = m.min
        else console.error(`[trajets] temps piéton incohérent jeté : ${m.min} min pour ${m.metres} m (${f.lat},${f.lng})`)
      }
      if (v) f.voitureMin = v.min
      if (r && (f.marcheMin != null || f.voitureMin != null)) {
        r.set(cacheCle(f), { ...(f.marcheMin != null ? { m: f.marcheMin } : {}), ...(f.voitureMin != null ? { v: f.voitureMin } : {}) }, { ex: 120 }).catch(() => {})
      }
    })
  } catch { /* Routes muet : le client affichera les mètres — jamais une estimation */ } finally { clearTimeout(t) }
}
