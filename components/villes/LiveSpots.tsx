'use client'
import { useEffect, useState } from 'react'

type Kind = 'restaurants' | 'mosquees' | 'activites'

interface Spot {
  id: number
  lat: number
  lng: number
  name: string
  subtitle?: string
  distance: number
  halal?: 'only' | 'yes' | 'likely'
}

// Cuisines très majoritairement halal (sert à élargir les résultats dans les villes
// non-musulmanes où le tag diet:halal est rare). Affichées avec la mention « à vérifier ».
const HALAL_CUISINE = /kebab|turkish|lebanese|arab|syrian|persian|iranian|afghan|pakistani|bangladeshi|indian|egyptian|moroccan|uyghur|uighur|halal|doner|shawarma|tagine|biryani/i

// Données réelles depuis OpenStreetMap (vrais noms + vraies coordonnées, monde entier).
// Aucune donnée inventée : on n'affiche que ce qu'OSM connaît, avec un rappel de vérification.
const CONF: Record<Kind, { radius: number; query: (r: number, lat: number, lng: number) => string; title: string; icon: string; empty: string }> = {
  restaurants: {
    radius: 8000,
    query: (r, lat, lng) =>
      `[out:json][timeout:25];(` +
      `node["amenity"~"restaurant|fast_food"]["diet:halal"~"yes|only"](around:${r},${lat},${lng});` +
      `way["amenity"~"restaurant|fast_food"]["diet:halal"~"yes|only"](around:${r},${lat},${lng});` +
      `node["amenity"~"restaurant|fast_food"]["cuisine"~"kebab|turkish|lebanese|arab|syrian|persian|iranian|afghan|pakistani|bangladeshi|egyptian|moroccan|uyghur|halal|doner|shawarma|biryani",i](around:${r},${lat},${lng});` +
      `way["amenity"~"restaurant|fast_food"]["cuisine"~"kebab|turkish|lebanese|arab|syrian|persian|iranian|afghan|pakistani|bangladeshi|egyptian|moroccan|uyghur|halal|doner|shawarma|biryani",i](around:${r},${lat},${lng});` +
      `);out center 70;`,
    title: 'Restaurants halal & halal-friendly à proximité',
    icon: '🍽️',
    empty: "OpenStreetMap ne référence pas encore de restaurant halal ici. Utilise l'outil Mosquée la plus proche et les applications locales sur place.",
  },
  mosquees: {
    radius: 5000,
    query: (r, lat, lng) =>
      `[out:json][timeout:25];(node["amenity"="place_of_worship"]["religion"="muslim"](around:${r},${lat},${lng});way["amenity"="place_of_worship"]["religion"="muslim"](around:${r},${lat},${lng}););out center 40;`,
    title: 'Mosquées & lieux de prière à proximité',
    icon: '🕌',
    empty: 'Aucune mosquée référencée dans ce rayon sur OpenStreetMap. Élargis la recherche via la page Mosquée la plus proche.',
  },
  activites: {
    radius: 4000,
    query: (r, lat, lng) =>
      `[out:json][timeout:25];(node["tourism"~"attraction|museum|gallery|viewpoint|artwork"](around:${r},${lat},${lng});way["tourism"~"attraction|museum|gallery|viewpoint"](around:${r},${lat},${lng});node["historic"~"monument|memorial|castle|monastery"](around:${r},${lat},${lng}););out center 30;`,
    title: 'À voir & à faire à proximité',
    icon: '🎯',
    empty: 'Aucune activité référencée dans ce rayon sur OpenStreetMap.',
  },
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const φ1 = (lat1 * Math.PI) / 180, φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180, Δλ = ((lng2 - lng1) * Math.PI) / 180
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
const fmt = (m: number) => (m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`)

const card: React.CSSProperties = { background: '#fff', borderRadius: 16, padding: '16px 18px', border: '1px solid rgba(27,67,50,0.1)' }

export default function LiveSpots({ kind, lat, lng, ville }: { kind: Kind; lat: number; lng: number; ville: string }) {
  const [state, setState] = useState<'loading' | 'ok' | 'empty' | 'error'>('loading')
  const [spots, setSpots] = useState<Spot[]>([])
  const conf = CONF[kind]

  useEffect(() => {
    let cancelled = false
    async function run() {
      setState('loading')
      try {
        const res = await fetch('https://overpass-api.de/api/interpreter', {
          method: 'POST',
          body: `data=${encodeURIComponent(conf.query(conf.radius, lat, lng))}`,
        })
        const data = await res.json()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const list: Spot[] = (data.elements as any[])
          .map((el) => {
            const elLat = el.lat ?? el.center?.lat
            const elLng = el.lon ?? el.center?.lon
            const name = el.tags?.name || el.tags?.['name:fr'] || el.tags?.['name:en']
            if (!elLat || !elLng || !name) return null
            const t = el.tags || {}
            const sub =
              kind === 'restaurants' ? (t.cuisine ? String(t.cuisine).replace(/_/g, ' ').replace(/;/g, ', ') : 'Restaurant halal')
              : kind === 'mosquees' ? (t['addr:street'] ? `${t['addr:housenumber'] ? t['addr:housenumber'] + ' ' : ''}${t['addr:street']}` : 'Lieu de prière')
              : (t.tourism || t.historic || 'Site').toString().replace(/_/g, ' ')
            const halal: Spot['halal'] =
              t['diet:halal'] === 'only' ? 'only'
              : t['diet:halal'] === 'yes' ? 'yes'
              : kind === 'restaurants' && HALAL_CUISINE.test(String(t.cuisine || '')) ? 'likely'
              : undefined
            return {
              id: el.id, lat: elLat, lng: elLng, name, subtitle: sub,
              distance: haversine(lat, lng, elLat, elLng), halal,
            } as Spot
          })
          .filter((s): s is Spot => s !== null)
          // confirmés halal d'abord, puis « à vérifier », puis par distance
          .sort((a, b) => {
            const rank = (h: Spot['halal']) => (h === 'only' || h === 'yes' ? 0 : h === 'likely' ? 1 : 2)
            return rank(a.halal) - rank(b.halal) || a.distance - b.distance
          })
          .slice(0, 36)
        if (cancelled) return
        setSpots(list)
        setState(list.length ? 'ok' : 'empty')
      } catch {
        if (!cancelled) setState('error')
      }
    }
    run()
    return () => { cancelled = true }
  }, [kind, lat, lng, conf])

  if (state === 'loading') {
    return (
      <div style={{ ...card, textAlign: 'center', padding: '34px 22px' }}>
        <div style={{ fontSize: 30, marginBottom: 8 }}>{conf.icon}</div>
        <p style={{ color: 'var(--foret)', fontWeight: 700, margin: 0 }}>Recherche en temps réel…</p>
        <p style={{ color: 'var(--texte-2)', fontSize: 13, margin: '4px 0 0' }}>Données OpenStreetMap — couverture mondiale</p>
      </div>
    )
  }

  if (state === 'empty' || state === 'error') {
    return (
      <div style={{ ...card, textAlign: 'center', padding: '36px 22px' }}>
        <div style={{ fontSize: 32, marginBottom: 8 }}>{conf.icon}</div>
        <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: 'var(--nuit)', fontSize: 17, margin: '0 0 6px' }}>
          {state === 'error' ? 'Recherche momentanément indisponible' : `Rien trouvé près de ${ville}`}
        </p>
        <p style={{ color: 'var(--texte-2)', fontSize: 13.5, lineHeight: 1.6, margin: 0 }}>{state === 'error' ? 'Réessaie dans un instant.' : conf.empty}</p>
      </div>
    )
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 14 }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 800, color: 'var(--nuit)', margin: 0 }}>{conf.title}</h3>
        <span style={{ fontSize: 12.5, color: 'var(--texte-2)' }}>{spots.length} via OpenStreetMap</span>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 14 }}>
        {spots.map((s) => (
          <div key={s.id} style={{ ...card, display: 'flex', gap: 12 }}>
            <div style={{ width: 46, height: 46, borderRadius: 12, background: 'var(--nuit)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{conf.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 16.5, color: 'var(--texte)', margin: 0, lineHeight: 1.2 }}>{s.name}</p>
              <p style={{ fontSize: 12.5, color: 'var(--texte-2)', margin: '2px 0 8px', textTransform: 'capitalize', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.subtitle}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                {s.halal === 'likely'
                  ? <span style={{ background: 'rgba(201,168,76,0.18)', color: '#8A6D1E', fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '3px 9px' }}>≈ Halal courant · à vérifier</span>
                  : s.halal && <span style={{ background: 'var(--halal-bg)', color: 'var(--halal-tx)', fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '3px 9px' }}>{s.halal === 'only' ? '✓ 100% halal' : '✓ Halal'}</span>}
                <span style={{ fontSize: 12.5, color: 'var(--foret)', fontWeight: 700 }}>📍 {fmt(s.distance)}</span>
                <a href={`https://maps.google.com/?q=${s.lat},${s.lng}`} target="_blank" rel="noopener noreferrer" style={{ fontSize: 12, color: 'var(--foret)', fontWeight: 700, textDecoration: 'none', marginLeft: 'auto' }}>Itinéraire →</a>
              </div>
            </div>
          </div>
        ))}
      </div>
      <p style={{ fontSize: 11.5, color: 'var(--texte-2)', textAlign: 'center', marginTop: 14, lineHeight: 1.5 }}>
        Données OpenStreetMap (contributeurs). {kind === 'restaurants' && '« ✓ Halal » = signalé halal dans OSM ; « ≈ à vérifier » = cuisine généralement halal, confirmez sur place. '}Liste mise à jour en direct.
      </p>
    </div>
  )
}
