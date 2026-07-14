'use client'
import { useState, useRef, useEffect, useCallback } from 'react'
import 'leaflet/dist/leaflet.css'
import type { Map as LeafletMap, Marker } from 'leaflet'
import IslamicPattern from '@/components/ui/IslamicPattern'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import { useInstantPosition } from '@/lib/useInstantPosition'

// UX « Muslim Pro » : la liste + la carte des mosquées s'affichent
// AUTOMATIQUEMENT autour de la position instantanée (dernière position →
// ville mémorisée → Paris → géoloc IP), sans aucun clic. Le GPS n'est
// qu'un affinage. Source : /api/osm (notre proxy Overpass, mis en cache),
// avec repli direct Overpass si le proxy est indisponible.

interface Mosque {
  id: number | string
  lat: number
  lng: number
  name: string
  distance: number
  address?: string
}

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const φ1 = (lat1 * Math.PI) / 180, φ2 = (lat2 * Math.PI) / 180
  const Δφ = ((lat2 - lat1) * Math.PI) / 180, Δλ = ((lng2 - lng1) * Math.PI) / 180
  const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

function fmt(m: number): string {
  return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`
}

export default function MosqueeProchePage() {
  const { lang } = useLanguage()
  const en = lang === 'en'
  const { pos, source, geoLoading, geoErr, refineGps } = useInstantPosition(en)
  const [loading, setLoading] = useState(true)
  const [mosques, setMosques] = useState<Mosque[]>([])
  const [selectedMosque, setSelectedMosque] = useState<Mosque | null>(null)
  const [radius, setRadius] = useState(2000)
  const [failed, setFailed] = useState(false)
  const mapRef = useRef<LeafletMap | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<Marker[]>([])
  const searchSeq = useRef(0)

  // Recherche autour d'une position — proxy /api/osm d'abord, Overpass direct en repli
  const searchAt = useCallback(async (lat: number, lng: number, rad: number) => {
    const seq = ++searchSeq.current
    setLoading(true); setFailed(false)
    let results: Mosque[] = []
    try {
      const res = await fetch(`/api/osm?lat=${lat}&lng=${lng}&kind=mosquees&radius=${rad}`)
      if (res.ok) {
        const j = await res.json()
        results = ((j.items || []) as { id: number; lat: number; lng: number; name: string; sub?: string; dist: number }[])
          .map((it) => ({ id: it.id, lat: it.lat, lng: it.lng, name: it.name, distance: it.dist, address: it.sub && it.sub !== 'Mosquée' ? it.sub : undefined }))
      }
    } catch { /* proxy indisponible → repli direct */ }
    if (!results.length) {
      try {
        const query = `[out:json][timeout:25];(node["amenity"="place_of_worship"]["religion"="muslim"](around:${rad},${lat},${lng});way["amenity"="place_of_worship"]["religion"="muslim"](around:${rad},${lat},${lng}););out center;`
        const res = await fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: `data=${encodeURIComponent(query)}` })
        const data = await res.json()
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        results = ((data.elements || []) as any[])
          .map((el) => {
            const elLat = el.lat ?? el.center?.lat, elLng = el.lon ?? el.center?.lon
            if (!elLat || !elLng) return null
            return {
              id: el.id, lat: elLat, lng: elLng,
              name: el.tags?.name || el.tags?.['name:fr'] || el.tags?.['name:ar'] || (en ? 'Mosque' : 'Mosquée'),
              distance: haversine(lat, lng, elLat, elLng),
              address: [el.tags?.['addr:housenumber'], el.tags?.['addr:street'], el.tags?.['addr:city']].filter(Boolean).join(' ') || undefined,
            } as Mosque
          })
          .filter((m): m is Mosque => m !== null)
      } catch { if (seq === searchSeq.current) { setFailed(true); setLoading(false) } ; return }
    }
    if (seq !== searchSeq.current) return // une recherche plus récente a pris la main
    const sorted = results.sort((a, b) => a.distance - b.distance).slice(0, 20)
    setMosques(sorted)
    setSelectedMosque(null)
    setLoading(false)
    void drawMap(lat, lng, sorted, rad)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [en])

  // Position instantanée → recherche AUTOMATIQUE (aucun clic requis)
  useEffect(() => {
    if (pos) void searchAt(pos.lat, pos.lng, radius)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, radius])

  async function drawMap(lat: number, lng: number, list: Mosque[], rad: number) {
    if (!mapContainerRef.current) return
    const L = (await import('leaflet')).default
    if (mapRef.current) { mapRef.current.remove(); mapRef.current = null; markersRef.current = [] }
    if (!mapContainerRef.current) return
    const map = L.map(mapContainerRef.current, { center: [lat, lng], zoom: 14 })
    mapRef.current = map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map)

    const userIcon = L.divIcon({
      html: `<div style="width:16px;height:16px;background:#1B4332;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
      className: '', iconAnchor: [8, 8],
    })
    L.marker([lat, lng], { icon: userIcon }).addTo(map).bindPopup(en ? '📍 Your position' : '📍 Votre position')
    L.circle([lat, lng], { radius: rad, color: '#1B4332', fillColor: '#1B4332', fillOpacity: 0.05, weight: 1.5 }).addTo(map)

    list.forEach((m, index) => {
      const first = index === 0
      const icon = L.divIcon({
        html: `<div style="width:${first ? 36 : 28}px;height:${first ? 36 : 28}px;background:${first ? '#C9A84C' : '#1B4332'};border:${first ? 3 : 2}px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center"><span style="transform:rotate(45deg);font-size:${first ? 16 : 12}px">🕌</span></div>`,
        className: '', iconAnchor: [first ? 18 : 14, first ? 36 : 28],
      })
      const marker = L.marker([m.lat, m.lng], { icon }).addTo(map).bindPopup(
        `<div style="font-family:'DM Sans',sans-serif;min-width:180px"><strong style="color:#1B4332;font-size:14px">${m.name}</strong><br/><span style="color:#6B7280;font-size:12px">📍 ${fmt(m.distance)}</span>${m.address ? `<br/><span style="color:#6B7280;font-size:12px">${m.address}</span>` : ''}<br/><br/><a href="https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}" target="_blank" style="background:#1B4332;color:white;padding:6px 12px;border-radius:8px;text-decoration:none;font-size:12px;font-weight:600">🗺️ ${en ? 'Directions' : 'Itinéraire'}</a></div>`
      )
      markersRef.current.push(marker)
    })
    if (list.length) {
      try { map.fitBounds(L.latLngBounds([[lat, lng], ...list.slice(0, 8).map((m) => [m.lat, m.lng] as [number, number])]), { padding: [40, 40], maxZoom: 15 }) } catch { /* noop */ }
    }
  }

  function selectMosque(m: Mosque) {
    setSelectedMosque(m)
    if (mapRef.current) mapRef.current.setView([m.lat, m.lng], 17, { animate: true })
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--creme)' }}>
      {/* Bandeau compact : le résultat doit être visible sans scroller */}
      <section className="relative overflow-hidden text-center" style={{ background: 'var(--nuit)', padding: '1.5rem 1.5rem 1.25rem' }}>
        <IslamicPattern opacity={0.06} />
        <div className="relative z-10">
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.5rem, 4vw, 2.1rem)', fontWeight: 900, color: 'white', lineHeight: 1.1, margin: 0 }}>
            {en ? <>Nearest <em style={{ color: 'var(--or)' }}>mosque</em></> : <>Mosquée la plus <em style={{ color: 'var(--or)' }}>proche</em></>}
          </h1>
        </div>
      </section>

      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '1.25rem 1rem 2rem' }}>
        {/* Position + affinage GPS — n'a jamais bloqué l'affichage */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginBottom: 12 }}>
          <span style={{ fontWeight: 700, color: 'var(--foret)', fontSize: 14.5 }}>
            📍 {pos ? pos.label : '…'}{source === 'ip' || source === 'default' ? (en ? ' (approximate)' : ' (approximatif)') : ''}
          </span>
          <button onClick={() => void refineGps()} disabled={geoLoading}
            style={{ marginLeft: 'auto', padding: '8px 14px', borderRadius: 20, border: 'none', background: 'var(--foret)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: geoLoading ? 'wait' : 'pointer' }}>
            {geoLoading ? (en ? 'Locating…' : 'Localisation…') : (en ? '📍 My exact position' : '📍 Ma position exacte')}
          </button>
        </div>
        {geoErr && (
          <div style={{ background: 'rgba(255,100,100,0.12)', border: '1px solid rgba(255,100,100,0.3)', borderRadius: 12, padding: '10px 14px', marginBottom: 12 }}>
            <p style={{ color: '#b91c1c', fontWeight: 700, margin: 0, fontSize: 13.5 }}>{geoErr.message}</p>
            <p style={{ color: 'var(--texte-2)', fontSize: 12.5, margin: '3px 0 0' }}>{geoErr.detail}</p>
          </div>
        )}

        {/* Carte — hauteur fixe (zéro layout shift), remplie dès la 1re réponse */}
        <div ref={mapContainerRef} style={{ height: 340, borderRadius: '20px', overflow: 'hidden', marginBottom: '1rem', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', border: '2px solid rgba(201,168,76,0.3)', background: '#dfe6e2' }} />

        {/* Rayon : re-déclenche la recherche, ne conditionne pas l'affichage initial */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
          <span style={{ fontWeight: 600, color: 'var(--foret)', fontSize: 13 }}>{en ? 'Radius' : 'Rayon'} :</span>
          {[500, 1000, 2000, 5000].map((r) => (
            <button key={r} onClick={() => setRadius(r)} style={{ padding: '0.4rem 1rem', borderRadius: '20px', border: 'none', background: radius === r ? 'var(--foret)' : 'rgba(27,67,50,0.07)', color: radius === r ? 'white' : 'var(--foret)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
              {r < 1000 ? `${r}m` : `${r / 1000}km`}
            </button>
          ))}
        </div>

        {loading && (
          <p style={{ textAlign: 'center', color: 'var(--texte-2)', padding: '0.75rem', fontSize: 14 }}>
            🕌 {en ? 'Searching mosques…' : 'Recherche des mosquées…'}
          </p>
        )}

        {!loading && failed && (
          <p style={{ textAlign: 'center', color: 'var(--texte-2)', padding: '1rem' }}>
            {en ? 'Search unavailable right now — please retry in a moment.' : 'Recherche indisponible pour le moment — réessayez dans un instant.'}
          </p>
        )}

        {!loading && !failed && (
          <>
            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, background: 'var(--foret)', borderRadius: '12px', padding: '0.875rem', textAlign: 'center', minWidth: '140px' }}>
                <p style={{ color: 'white', fontSize: '1.5rem', fontFamily: "'Playfair Display', serif", fontWeight: 700, margin: 0 }}>{mosques.length}</p>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: 0 }}>{en ? 'mosques found' : 'mosquées trouvées'}</p>
              </div>
              {mosques[0] && (
                <div style={{ flex: 1, background: 'rgba(201,168,76,0.1)', borderRadius: '12px', padding: '0.875rem', textAlign: 'center', minWidth: '140px', border: '1px solid rgba(201,168,76,0.3)' }}>
                  <p style={{ color: 'var(--or)', fontSize: '1.5rem', fontFamily: "'Playfair Display', serif", fontWeight: 700, margin: 0 }}>{fmt(mosques[0].distance)}</p>
                  <p style={{ color: 'var(--texte-2)', fontSize: '12px', margin: 0 }}>{en ? 'nearest' : 'la plus proche'}</p>
                </div>
              )}
            </div>

            {mosques.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--texte-2)', padding: '1rem' }}>
                {en ? 'No mosque found in this radius. Try a wider one.' : 'Aucune mosquée trouvée dans ce rayon. Essayez un rayon plus large.'}
              </p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {mosques.map((m, index) => (
                <div key={m.id} onClick={() => selectMosque(m)}
                  className="mosque-card"
                  style={{ animationDelay: `${index * 40}ms`, background: selectedMosque?.id === m.id ? 'rgba(27,67,50,0.05)' : 'white', borderRadius: '14px', padding: '1rem 1.25rem', border: `1.5px solid ${selectedMosque?.id === m.id ? 'var(--foret)' : 'rgba(27,67,50,0.1)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: index === 0 ? 'var(--or)' : 'rgba(27,67,50,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: index === 0 ? '16px' : '13px', fontWeight: 700, color: index === 0 ? '#0B1A0F' : 'var(--foret)' }}>
                    {index === 0 ? '🕌' : index + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, color: 'var(--texte)', fontSize: '15px', margin: 0, fontFamily: "'Playfair Display', serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</p>
                    {m.address && <p style={{ color: 'var(--texte-2)', fontSize: '12px', margin: '2px 0 0' }}>📍 {m.address}</p>}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontWeight: 700, color: index === 0 ? 'var(--or)' : 'var(--foret)', fontSize: '14px', margin: 0 }}>{fmt(m.distance)}</p>
                    <a href={`https://www.google.com/maps/dir/?api=1&destination=${m.lat},${m.lng}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ fontSize: '11px', color: 'var(--foret)', fontWeight: 600, textDecoration: 'none' }}>{en ? 'Directions →' : 'Itinéraire →'}</a>
                  </div>
                </div>
              ))}
            </div>
            <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } } .mosque-card { animation: slideUp 0.4s ease both; }`}</style>
          </>
        )}
      </section>
    </main>
  )
}
