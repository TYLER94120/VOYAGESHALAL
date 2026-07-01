'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import 'leaflet/dist/leaflet.css'
import type { Map as LeafletMap, Marker } from 'leaflet'
import { useLocation } from '@/components/location/LocationProvider'
import { getPosition, describeGeoError, type GeoError, type GeoErrorCode } from '@/lib/geo'
import SearchBarHome from '@/components/search/SearchBarHome'

type Cat = 'mosquees' | 'restaurants' | 'hotels'
interface Spot { id: number; lat: number; lng: number; name: string; sub?: string; dist: number; halal?: 'only' | 'yes' | 'likely' }

const CATS: { id: Cat; label: string; icon: string; color: string }[] = [
  { id: 'mosquees', label: 'Mosquées', icon: '🕌', color: '#1B4332' },
  { id: 'restaurants', label: 'Restaurants halal', icon: '🍽️', color: '#B8860B' },
  { id: 'hotels', label: 'Hôtels', icon: '🏨', color: '#1d4e6f' },
]
const HALAL_CUISINE = 'kebab|turkish|lebanese|arab|syrian|persian|iranian|afghan|pakistani|bangladeshi|egyptian|moroccan|uyghur|halal|doner|shawarma|biryani|indian'

function haversine(a: number, b: number, c: number, d: number) {
  const R = 6371000, p = Math.PI / 180
  const x = Math.sin(((c - a) * p) / 2) ** 2 + Math.cos(a * p) * Math.cos(c * p) * Math.sin(((d - b) * p) / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}
const fmt = (m: number) => (m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`)

function buildQuery(cat: Cat, lat: number, lng: number, r: number) {
  if (cat === 'mosquees')
    return `[out:json][timeout:25];(node["amenity"="place_of_worship"]["religion"="muslim"](around:${r},${lat},${lng});way["amenity"="place_of_worship"]["religion"="muslim"](around:${r},${lat},${lng}););out center;`
  if (cat === 'hotels')
    return `[out:json][timeout:25];(node["tourism"~"hotel|guest_house|hostel"](around:${r},${lat},${lng});way["tourism"~"hotel|guest_house|hostel"](around:${r},${lat},${lng}););out center;`
  return `[out:json][timeout:25];(node["amenity"~"restaurant|fast_food"]["diet:halal"~"yes|only"](around:${r},${lat},${lng});way["amenity"~"restaurant|fast_food"]["diet:halal"~"yes|only"](around:${r},${lat},${lng});node["amenity"~"restaurant|fast_food"]["cuisine"~"${HALAL_CUISINE}",i](around:${r},${lat},${lng});way["amenity"~"restaurant|fast_food"]["cuisine"~"${HALAL_CUISINE}",i](around:${r},${lat},${lng}););out center;`
}

async function overpass(query: string) {
  const endpoints = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter']
  for (let i = 0; i < endpoints.length; i++) {
    try {
      const res = await fetch(endpoints[i], { method: 'POST', body: `data=${encodeURIComponent(query)}` })
      if (!res.ok) continue
      const j = await res.json()
      return j.elements || []
    } catch { /* try next */ }
  }
  return null
}

export default function AutourDeMoiPage() {
  const { city } = useLocation()
  const [cat, setCat] = useState<Cat>('mosquees')
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null)
  const [spots, setSpots] = useState<Spot[]>([])
  const [loading, setLoading] = useState(true)
  const [geoErr, setGeoErr] = useState<GeoError | null>(null)
  const [selected, setSelected] = useState<number | null>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const mapEl = useRef<HTMLDivElement>(null)
  const markersRef = useRef<Marker[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LRef = useRef<any>(null)

  // Localisation au chargement (repli sur la ville mémorisée)
  useEffect(() => {
    let done = false
    ;(async () => {
      try {
        const p = await getPosition()
        if (!done) { setPos({ lat: p.lat, lng: p.lng }); setGeoErr(null) }
      } catch (code) {
        if (city?.lat != null && city?.lng != null) setPos({ lat: city.lat, lng: city.lng })
        else { setGeoErr(describeGeoError(code as GeoErrorCode)); setLoading(false) }
      }
    })()
    return () => { done = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const initMap = useCallback(async (lat: number, lng: number) => {
    if (!mapEl.current) return
    const L = LRef.current || (await import('leaflet')).default
    LRef.current = L
    if (!mapRef.current) {
      const map = L.map(mapEl.current, { center: [lat, lng], zoom: 14, zoomControl: true })
      mapRef.current = map
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map)
    } else {
      mapRef.current.setView([lat, lng], 14)
    }
    // marqueur position
    const me = L.divIcon({ html: `<div style="width:18px;height:18px;background:#2f6df6;border:3px solid #fff;border-radius:50%;box-shadow:0 0 0 6px rgba(47,109,246,0.25)"></div>`, className: '', iconAnchor: [9, 9] })
    L.marker([lat, lng], { icon: me }).addTo(mapRef.current)
  }, [])

  const search = useCallback(async (lat: number, lng: number, c: Cat) => {
    setLoading(true); setSelected(null)
    const els = await overpass(buildQuery(c, lat, lng, 5000))
    const conf = CATS.find((x) => x.id === c)!
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const list: Spot[] = (els || []).map((el: any) => {
      const elat = el.lat ?? el.center?.lat, elng = el.lon ?? el.center?.lon
      const name = el.tags?.name || el.tags?.['name:fr'] || el.tags?.['name:en']
      if (!elat || !elng || !name) return null
      const t = el.tags || {}
      const halal = c === 'restaurants' ? (t['diet:halal'] === 'only' ? 'only' : t['diet:halal'] === 'yes' ? 'yes' : 'likely') : undefined
      const sub = c === 'restaurants' ? (t.cuisine ? String(t.cuisine).replace(/_/g, ' ').replace(/;/g, ', ') : 'Restaurant') : c === 'hotels' ? (t.stars ? `${t.stars}★` : 'Hôtel') : (t['addr:street'] || 'Lieu de prière')
      return { id: el.id, lat: elat, lng: elng, name, sub, dist: haversine(lat, lng, elat, elng), halal }
    }).filter(Boolean).sort((a: Spot, b: Spot) => a.dist - b.dist).slice(0, 60)
    setSpots(list)
    // (re)dessine les marqueurs
    const L = LRef.current
    if (L && mapRef.current) {
      markersRef.current.forEach((m) => m.remove()); markersRef.current = []
      list.forEach((s, i) => {
        const first = i === 0
        const icon = L.divIcon({ html: `<div style="width:${first ? 34 : 28}px;height:${first ? 34 : 28}px;background:${first ? 'var(--or,#C9A84C)' : conf.color};border:2px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center"><span style="transform:rotate(45deg);font-size:${first ? 15 : 12}px">${conf.icon}</span></div>`, className: '', iconAnchor: [first ? 17 : 14, first ? 34 : 28] })
        const mk = L.marker([s.lat, s.lng], { icon }).addTo(mapRef.current)
        mk.on('click', () => { setSelected(s.id); mapRef.current!.setView([s.lat, s.lng], 16, { animate: true }) })
        markersRef.current.push(mk)
      })
    }
    setLoading(false)
  }, [])

  // Quand la position est prête → init carte + 1re recherche
  useEffect(() => {
    if (!pos) return
    ;(async () => { await initMap(pos.lat, pos.lng); await search(pos.lat, pos.lng, cat) })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos])

  // Changement de catégorie → nouvelle recherche
  useEffect(() => {
    if (pos) search(pos.lat, pos.lng, cat)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat])

  const searchHere = () => {
    const c = mapRef.current?.getCenter()
    if (c) search(c.lat, c.lng, cat)
  }
  const retry = async () => {
    setGeoErr(null); setLoading(true)
    try { const p = await getPosition(); setPos({ lat: p.lat, lng: p.lng }) } catch (code) { setGeoErr(describeGeoError(code as GeoErrorCode)); setLoading(false) }
  }

  const conf = CATS.find((x) => x.id === cat)!

  return (
    <main style={{ background: 'var(--creme)', minHeight: '100vh' }}>
      <div style={{ position: 'relative' }}>
        {/* Carte */}
        <div ref={mapEl} style={{ height: '62vh', minHeight: 380, width: '100%', background: '#dfe6e2', zIndex: 1 }} />

        {/* Barre du haut : recherche + compteur + rechercher ici */}
        <div style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 500, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
          <div style={{ pointerEvents: 'auto', boxShadow: '0 6px 20px rgba(0,0,0,.15)', borderRadius: 14 }}>
            <SearchBarHome />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ pointerEvents: 'auto', background: 'var(--foret)', color: '#fff', fontWeight: 700, fontSize: 13.5, borderRadius: 30, padding: '8px 14px', boxShadow: '0 4px 14px rgba(0,0,0,.18)' }}>
              {loading ? 'Recherche…' : `${spots.length} ${conf.label} à proximité`}
            </span>
            <button onClick={searchHere} style={{ pointerEvents: 'auto', background: '#fff', color: 'var(--nuit)', fontWeight: 700, fontSize: 13.5, border: 'none', borderRadius: 30, padding: '8px 14px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,.18)' }}>
              🔄 Rechercher dans cette zone
            </button>
          </div>
        </div>

        {/* Erreur géoloc */}
        {geoErr && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(11,26,15,0.55)', padding: 24 }}>
            <div style={{ background: '#fff', borderRadius: 18, padding: '28px 24px', maxWidth: 420, textAlign: 'center' }}>
              <div style={{ fontSize: 34, marginBottom: 8 }}>📍</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", color: 'var(--foret)', fontSize: 20, margin: '0 0 6px' }}>{geoErr.message}</h2>
              <p style={{ color: 'var(--texte-2)', fontSize: 14, margin: '0 0 16px' }}>{geoErr.detail}</p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={retry} style={{ padding: '10px 18px', background: 'var(--foret)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>Réessayer</button>
                <a href="/destinations?all=1" style={{ padding: '10px 18px', background: 'rgba(27,67,50,0.08)', color: 'var(--foret)', borderRadius: 12, fontWeight: 700, textDecoration: 'none' }}>Choisir une ville</a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Bascule catégories */}
      <div style={{ display: 'flex', gap: 8, padding: '14px 14px 4px', overflowX: 'auto' }}>
        {CATS.map((x) => {
          const on = x.id === cat
          return (
            <button key={x.id} onClick={() => setCat(x.id)} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 30, border: `1.5px solid ${on ? x.color : 'rgba(27,67,50,0.2)'}`, background: on ? x.color : '#fff', color: on ? '#fff' : 'var(--foret)', fontWeight: 700, fontSize: 14, cursor: 'pointer' }}>
              <span>{x.icon}</span>{x.label}
            </button>
          )
        })}
      </div>

      {/* Liste triée par distance */}
      <div style={{ padding: '10px 14px 90px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {spots.map((s, i) => (
          <div key={s.id} onClick={() => { setSelected(s.id); mapRef.current?.setView([s.lat, s.lng], 16, { animate: true }); window.scrollTo({ top: 0, behavior: 'smooth' }) }}
            style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', border: `1.5px solid ${selected === s.id ? conf.color : 'rgba(27,67,50,0.1)'}`, cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: i === 0 ? 'var(--or)' : 'rgba(27,67,50,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{conf.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--texte)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.name}{i === 0 && <span style={{ marginLeft: 6, background: 'var(--or)', color: '#0B1A0F', fontSize: 10, fontWeight: 800, borderRadius: 10, padding: '1px 7px' }}>la + proche</span>}</p>
              <p style={{ fontSize: 12.5, color: 'var(--texte-2)', margin: '2px 0 0', textTransform: 'capitalize' }}>
                {s.halal === 'likely' ? '≈ halal à vérifier · ' : s.halal ? '✓ halal · ' : ''}{s.sub} · <strong style={{ color: 'var(--foret)' }}>{fmt(s.dist)}</strong>
              </p>
            </div>
            <a href={`https://maps.google.com/?q=${s.lat},${s.lng}&travelmode=walking`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0, background: 'var(--foret)', color: '#fff', fontWeight: 700, fontSize: 13, borderRadius: 10, padding: '9px 12px', textDecoration: 'none' }}>Y aller ›</a>
          </div>
        ))}
        {!loading && !geoErr && spots.length === 0 && (
          <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--texte-2)', padding: 20 }}>Rien trouvé dans cette zone. Élargis en déplaçant la carte puis « Rechercher dans cette zone ».</p>
        )}
      </div>
    </main>
  )
}
