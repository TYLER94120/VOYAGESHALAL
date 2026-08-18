import { Redis } from '@upstash/redis'
import { osrmMinutes } from '@/lib/osrm.mjs'

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
//   - cascade (itération 6) : Google Routes → OSRM (gratuit, sans clé) →
//     mètres, chaque échec JOURNALISÉ ;
//   - cache Redis 10 minutes par lieu + position (la position exacte entre
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
      // 🚗 Itération 4, correction 5 : le temps voiture tient compte du
      // TRAFIC MAINTENANT (departure = maintenant implicite avec
      // TRAFFIC_AWARE) — « ≈ 5 min » calculés qui font 10 en vrai, terminé.
      ...(mode === 'DRIVE' ? { routingPreference: 'TRAFFIC_AWARE' } : {}),
    }),
  })
  if (!r.ok) {
    // 🔊 Le repli en mètres est HONNÊTE mais il doit se VOIR côté serveur :
    // une API Routes pas activée sur la clé resterait sinon invisible.
    const corps = await r.text().catch(() => '')
    console.error(`[trajets] Routes API ${mode} a refusé : ${r.status} — ${corps.slice(0, 300).replace(/[A-Za-z0-9_-]{30,}/g, '···')}`)
    throw new Error(`routes ${r.status}`)
  }
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

  const cacheCle = (d: Dest) => `vh:trajet:v3:${origine.lat},${origine.lng}:${d.lat},${d.lng}`
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

  // ── 1. GOOGLE ROUTES — la source préférée (trafic pour la voiture) ──
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
    })
  } catch (e) {
    console.error('[trajets] Google Routes indisponible, on tente OSRM :', e instanceof Error ? e.message : e)
  } finally { clearTimeout(t) }

  // ── 2. OSRM — le repli gratuit, pour ce que Google n'a pas donné ──
  const sansTemps = restants.filter((f) => f.marcheMin == null || f.voitureMin == null)
  if (sansTemps.length) {
    try {
      const [om, ov] = await Promise.all([
        osrmMinutes(origine, sansTemps, 'marche').catch((e) => { console.error('[trajets] OSRM marche muet :', e instanceof Error ? e.message : e); return null }),
        osrmMinutes(origine, sansTemps, 'voiture').catch((e) => { console.error('[trajets] OSRM voiture muet :', e instanceof Error ? e.message : e); return null }),
      ])
      sansTemps.forEach((f, i) => {
        const m = om?.[i], v = ov?.[i]
        if (f.marcheMin == null && m) {
          if (marcheCoherente(m.min, m.metres)) f.marcheMin = m.min
          else console.error(`[trajets] OSRM piéton incohérent jeté : ${m.min} min pour ${m.metres} m`)
        }
        if (f.voitureMin == null && v) f.voitureMin = v.min
      })
    } catch { /* déjà journalisé */ }
  }

  // ── 3. Ce qui reste sans temps s'affichera en mètres — et ça se voit ──
  for (const f of restants) {
    if (f.marcheMin == null && f.voitureMin == null) console.error(`[trajets] aucun temps trouvé (Google + OSRM) pour ${f.lat},${f.lng} — mètres à l'écran`)
    if (r && (f.marcheMin != null || f.voitureMin != null)) {
      r.set(cacheCle(f), { ...(f.marcheMin != null ? { m: f.marcheMin } : {}), ...(f.voitureMin != null ? { v: f.voitureMin } : {}) }, { ex: 600 }).catch(() => {})
    }
  }
}
