'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import 'leaflet/dist/leaflet.css'
import type { Map as LeafletMap, Marker } from 'leaflet'
import { useLocation } from '@/components/location/LocationProvider'
import { getPosition, describeGeoError, type GeoError, type GeoErrorCode } from '@/lib/geo'
import SearchBarHome from '@/components/search/SearchBarHome'

type Cat = 'mosquees' | 'restaurants' | 'hotels' | 'boucheries'
interface Spot { id: number; lat: number; lng: number; name: string; sub?: string; dist: number; halal?: 'only' | 'yes' | 'likely' }

// Valeurs alignées sur l'application native (Claude-app)
const ME_RADIUS_M = 6000
const SELECTED_GOLD = '#c9a84c'
const CATS: { id: Cat; label: string; icon: string; color: string }[] = [
  { id: 'mosquees', label: 'Mosquées', icon: '🕌', color: '#2d6a4f' },
  { id: 'restaurants', label: 'Restaurants halal', icon: '🍽️', color: '#c05621' },
  { id: 'hotels', label: 'Hôtels', icon: '🏨', color: '#2b6cb0' },
  { id: 'boucheries', label: 'Boucheries halal', icon: '🥩', color: '#97266d' },
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
    return `[out:json][timeout:15];(node["amenity"="place_of_worship"]["religion"="muslim"](around:${r},${lat},${lng});way["amenity"="place_of_worship"]["religion"="muslim"](around:${r},${lat},${lng}););out center;`
  if (cat === 'hotels')
    return `[out:json][timeout:15];(node["tourism"~"hotel|guest_house|hostel"](around:${r},${lat},${lng});way["tourism"~"hotel|guest_house|hostel"](around:${r},${lat},${lng}););out center;`
  if (cat === 'boucheries')
    return `[out:json][timeout:15];(node["shop"="butcher"]["diet:halal"~"yes|only"](around:${r},${lat},${lng});node["shop"="butcher"]["halal"~"yes|only"](around:${r},${lat},${lng});way["shop"="butcher"]["diet:halal"~"yes|only"](around:${r},${lat},${lng}););out center;`
  return `[out:json][timeout:15];(node["amenity"~"restaurant|fast_food"]["diet:halal"~"yes|only"](around:${r},${lat},${lng});way["amenity"~"restaurant|fast_food"]["diet:halal"~"yes|only"](around:${r},${lat},${lng});node["amenity"~"restaurant|fast_food"]["cuisine"~"${HALAL_CUISINE}",i](around:${r},${lat},${lng});way["amenity"~"restaurant|fast_food"]["cuisine"~"${HALAL_CUISINE}",i](around:${r},${lat},${lng}););out center;`
}

// Interroge TOUS les miroirs Overpass EN PARALLÈLE et garde le premier qui répond
// (les serveurs Overpass sont souvent surchargés → une requête séquentielle peut
// bloquer plusieurs minutes). Timeout client strict à 10 s pour rester réactif.
async function overpass(query: string) {
  const endpoints = [
    'https://overpass.kumi.systems/api/interpreter',
    'https://overpass-api.de/api/interpreter',
    'https://overpass.private.coffee/api/interpreter',
  ]
  const ctrl = new AbortController()
  const timer = setTimeout(() => ctrl.abort(), 10000)
  const attempts = endpoints.map(async (url) => {
    const res = await fetch(url, { method: 'POST', body: `data=${encodeURIComponent(query)}`, signal: ctrl.signal })
    if (!res.ok) throw new Error(String(res.status))
    const j = await res.json()
    return j.elements || []
  })
  try {
    // Promise.any → le PREMIER miroir qui réussit gagne
    const els = await Promise.any(attempts)
    return els
  } catch {
    return null
  } finally {
    clearTimeout(timer)
    ctrl.abort() // annule les requêtes miroirs encore en vol
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pinIcon(L: any, color: string, icon: string, selected: boolean) {
  const size = selected ? 34 : 28
  const border = selected ? SELECTED_GOLD : '#fff'
  const bw = selected ? 3 : 2
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;background:${color};border:${bw}px solid ${border};border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;transform:scale(${selected ? 1.25 : 1})"><span style="font-size:${selected ? 15 : 13}px">${icon}</span></div>`,
    className: '', iconAnchor: [size / 2, size / 2],
  })
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
  const markersRef = useRef<{ id: number; marker: Marker }[]>([])
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LRef = useRef<any>(null)

  useEffect(() => {
    let done = false
    ;(async () => {
      try { const p = await getPosition(); if (!done) { setPos({ lat: p.lat, lng: p.lng }); setGeoErr(null) } }
      catch (code) {
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
    // Marqueur « Moi » : cercle blanc, bordure bleue, 🧍, étiquette « Moi »
    const me = L.divIcon({
      html: `<div style="display:flex;flex-direction:column;align-items:center"><div style="width:26px;height:26px;background:#fff;border:3px solid #2563eb;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 6px rgba(37,99,235,.18);font-size:14px">🧍</div><span style="margin-top:3px;background:#2563eb;color:#fff;font-size:10px;font-weight:700;border-radius:8px;padding:1px 7px">Moi</span></div>`,
      className: '', iconAnchor: [13, 13],
    })
    L.marker([lat, lng], { icon: me, zIndexOffset: 1000 }).addTo(mapRef.current)
  }, [])

  const paint = useCallback((selId: number | null) => {
    const L = LRef.current; if (!L) return
    const conf = CATS.find((x) => x.id === cat)!
    markersRef.current.forEach(({ id, marker }) => marker.setIcon(pinIcon(L, conf.color, conf.icon, id === selId)))
  }, [cat])

  const select = useCallback((s: Spot, scroll = false) => {
    setSelected(s.id); paint(s.id)
    mapRef.current?.setView([s.lat, s.lng], 16, { animate: true })
    if (scroll) window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [paint])

  const search = useCallback(async (lat: number, lng: number, c: Cat) => {
    setLoading(true); setSelected(null)
    const els = await overpass(buildQuery(c, lat, lng, ME_RADIUS_M))
    const conf = CATS.find((x) => x.id === c)!
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const list: Spot[] = (els || []).map((el: any) => {
      const elat = el.lat ?? el.center?.lat, elng = el.lon ?? el.center?.lng ?? el.center?.lon
      const name = el.tags?.name || el.tags?.['name:fr'] || el.tags?.['name:en']
      if (!elat || !elng || !name) return null
      const t = el.tags || {}
      const halal = c === 'restaurants' ? (t['diet:halal'] === 'only' ? 'only' : t['diet:halal'] === 'yes' ? 'yes' : 'likely') : undefined
      const sub = c === 'restaurants' ? (t.cuisine ? String(t.cuisine).replace(/_/g, ' ').replace(/;/g, ', ') : 'Restaurant')
        : c === 'hotels' ? (t.stars ? `${t.stars}★` : 'Hôtel')
        : c === 'boucheries' ? 'Boucherie halal'
        : (t['addr:street'] || 'Lieu de prière')
      return { id: el.id, lat: elat, lng: elng, name, sub, dist: haversine(lat, lng, elat, elng), halal }
    }).filter(Boolean).sort((a: Spot, b: Spot) => a.dist - b.dist).slice(0, 40)
    setSpots(list)
    const L = LRef.current
    if (L && mapRef.current) {
      markersRef.current.forEach(({ marker }) => marker.remove()); markersRef.current = []
      list.forEach((s) => {
        const mk = L.marker([s.lat, s.lng], { icon: pinIcon(L, conf.color, conf.icon, false) }).addTo(mapRef.current)
        mk.on('click', () => select(s))
        markersRef.current.push({ id: s.id, marker: mk })
      })
    }
    setLoading(false)
  }, [select])

  useEffect(() => {
    if (!pos) return
    ;(async () => { await initMap(pos.lat, pos.lng); await search(pos.lat, pos.lng, cat) })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos])

  useEffect(() => {
    if (pos) search(pos.lat, pos.lng, cat)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat])

  const searchHere = () => { const c = mapRef.current?.getCenter(); if (c) search(c.lat, c.lng, cat) }
  const retry = async () => {
    setGeoErr(null); setLoading(true)
    try { const p = await getPosition(); setPos({ lat: p.lat, lng: p.lng }) } catch (code) { setGeoErr(describeGeoError(code as GeoErrorCode)); setLoading(false) }
  }

  const conf = CATS.find((x) => x.id === cat)!

  return (
    <main style={{ background: 'var(--creme)', minHeight: '100vh' }}>
      <div style={{ position: 'relative' }}>
        <div ref={mapEl} style={{ height: '62vh', minHeight: 380, width: '100%', background: '#dfe6e2', zIndex: 1 }} />

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

      {/* Bascule des 4 catégories (comme l'accueil de l'app) */}
      <div style={{ display: 'flex', gap: 8, padding: '14px 14px 4px', overflowX: 'auto' }}>
        {CATS.map((x) => {
          const on = x.id === cat
          return (
            <button key={x.id} onClick={() => setCat(x.id)} style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 30, border: `1.5px solid ${on ? x.color : 'rgba(27,67,50,0.2)'}`, background: on ? x.color : '#fff', color: on ? '#fff' : 'var(--foret)', fontWeight: 700, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' }}>
              <span>{x.icon}</span>{x.label}
            </button>
          )
        })}
      </div>

      <div style={{ padding: '10px 14px 90px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {spots.map((s, i) => (
          <div key={s.id} onClick={() => select(s, true)}
            style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', border: `1.5px solid ${selected === s.id ? SELECTED_GOLD : 'rgba(27,67,50,0.1)'}`, cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: conf.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{conf.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--texte)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {s.name}{i === 0 && <span style={{ marginLeft: 6, background: SELECTED_GOLD, color: '#0B1A0F', fontSize: 10, fontWeight: 800, borderRadius: 10, padding: '1px 7px' }}>la + proche</span>}
              </p>
              <p style={{ fontSize: 12.5, color: 'var(--texte-2)', margin: '2px 0 0', textTransform: 'capitalize' }}>
                {s.halal === 'likely' ? '≈ halal à vérifier · ' : s.halal ? '✓ halal · ' : ''}{s.sub} · <strong style={{ color: 'var(--foret)' }}>{fmt(s.dist)}</strong>
              </p>
            </div>
            <a href={`https://maps.google.com/?q=${s.lat},${s.lng}&travelmode=walking`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0, background: 'var(--foret)', color: '#fff', fontWeight: 700, fontSize: 13, borderRadius: 10, padding: '9px 12px', textDecoration: 'none' }}>Y aller ›</a>
          </div>
        ))}
        {!loading && !geoErr && spots.length === 0 && (
          <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--texte-2)', padding: 20 }}>Rien trouvé dans cette zone. Déplace la carte puis « Rechercher dans cette zone ».</p>
        )}
      </div>
    </main>
  )
}
