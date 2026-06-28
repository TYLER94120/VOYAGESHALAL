'use client'
import { useState, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import type { Map as LeafletMap, Marker } from 'leaflet'
import IslamicPattern from '@/components/ui/IslamicPattern'

interface Mosque {
  id: number
  lat: number
  lng: number
  name: string
  distance: number
  address?: string
}

export default function MosqueeProchePage() {
  const [step, setStep] = useState<'idle' | 'loading' | 'results' | 'error'>('idle')
  const [mosques, setMosques] = useState<Mosque[]>([])
  const [selectedMosque, setSelectedMosque] = useState<Mosque | null>(null)
  const [radius, setRadius] = useState(2000)
  const mapRef = useRef<LeafletMap | null>(null)
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const markersRef = useRef<Marker[]>([])

  function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
    const R = 6371000
    const φ1 = (lat1 * Math.PI) / 180
    const φ2 = (lat2 * Math.PI) / 180
    const Δφ = ((lat2 - lat1) * Math.PI) / 180
    const Δλ = ((lng2 - lng1) * Math.PI) / 180
    const a = Math.sin(Δφ / 2) ** 2 + Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) ** 2
    return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  }

  function fmt(m: number): string {
    return m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`
  }

  function findMosques() {
    setStep('loading')
    if (!navigator.geolocation) {
      setStep('error')
      return
    }
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const { latitude: lat, longitude: lng } = pos.coords
        const query = `[out:json][timeout:25];(node["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});way["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng});relation["amenity"="place_of_worship"]["religion"="muslim"](around:${radius},${lat},${lng}););out center;`
        try {
          const res = await fetch('https://overpass-api.de/api/interpreter', {
            method: 'POST',
            body: `data=${encodeURIComponent(query)}`,
          })
          const data = await res.json()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const results: Mosque[] = (data.elements as any[])
            .map((el) => {
              const elLat = el.lat ?? el.center?.lat
              const elLng = el.lon ?? el.center?.lon
              if (!elLat || !elLng) return null
              return {
                id: el.id,
                lat: elLat,
                lng: elLng,
                name: el.tags?.name || el.tags?.['name:fr'] || el.tags?.['name:ar'] || 'Mosquée',
                distance: haversine(lat, lng, elLat, elLng),
                address: [el.tags?.['addr:housenumber'], el.tags?.['addr:street'], el.tags?.['addr:city']].filter(Boolean).join(' ') || undefined,
              } as Mosque
            })
            .filter((m): m is Mosque => m !== null)
            .sort((a, b) => a.distance - b.distance)
            .slice(0, 20)
          setMosques(results)
          setStep('results')
          setTimeout(() => initMap(lat, lng, results), 100)
        } catch {
          setStep('error')
        }
      },
      () => setStep('error'),
      { enableHighAccuracy: true, timeout: 10000 }
    )
  }

  async function initMap(lat: number, lng: number, list: Mosque[]) {
    if (!mapContainerRef.current || mapRef.current) return
    const L = (await import('leaflet')).default
    const map = L.map(mapContainerRef.current, { center: [lat, lng], zoom: 14 })
    mapRef.current = map
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map)

    const userIcon = L.divIcon({
      html: `<div style="width:16px;height:16px;background:#1B4332;border:3px solid white;border-radius:50%;box-shadow:0 2px 8px rgba(0,0,0,0.3)"></div>`,
      className: '', iconAnchor: [8, 8],
    })
    L.marker([lat, lng], { icon: userIcon }).addTo(map).bindPopup('📍 Votre position')
    L.circle([lat, lng], { radius, color: '#1B4332', fillColor: '#1B4332', fillOpacity: 0.05, weight: 1.5 }).addTo(map)

    list.forEach((m, index) => {
      const first = index === 0
      const icon = L.divIcon({
        html: `<div style="width:${first ? 36 : 28}px;height:${first ? 36 : 28}px;background:${first ? '#C9A84C' : '#1B4332'};border:${first ? 3 : 2}px solid white;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 8px rgba(0,0,0,0.25);display:flex;align-items:center;justify-content:center"><span style="transform:rotate(45deg);font-size:${first ? 16 : 12}px">🕌</span></div>`,
        className: '', iconAnchor: [first ? 18 : 14, first ? 36 : 28],
      })
      const marker = L.marker([m.lat, m.lng], { icon }).addTo(map).bindPopup(
        `<div style="font-family:'DM Sans',sans-serif;min-width:180px"><strong style="color:#1B4332;font-size:14px">${m.name}</strong><br/><span style="color:#6B7280;font-size:12px">📍 ${fmt(m.distance)}</span>${m.address ? `<br/><span style="color:#6B7280;font-size:12px">${m.address}</span>` : ''}<br/><br/><a href="https://maps.google.com/?q=${m.lat},${m.lng}" target="_blank" style="background:#1B4332;color:white;padding:6px 12px;border-radius:8px;text-decoration:none;font-size:12px;font-weight:600">🗺️ Itinéraire</a></div>`
      )
      markersRef.current.push(marker)
      if (first) marker.openPopup()
    })
  }

  function selectMosque(m: Mosque) {
    setSelectedMosque(m)
    if (mapRef.current) mapRef.current.setView([m.lat, m.lng], 17, { animate: true })
  }

  function reset() {
    setStep('idle')
    setMosques([])
    setSelectedMosque(null)
    markersRef.current = []
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--creme)' }}>
      <section className="relative overflow-hidden text-center" style={{ background: 'var(--nuit)', padding: '4rem 1.5rem 3rem' }}>
        <IslamicPattern opacity={0.06} />
        <div className="relative z-10">
          <p style={{ color: 'var(--or)', fontSize: '11px', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '1rem' }}>✦ Outils musulmans</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: 'white', marginBottom: '0.75rem', lineHeight: 1.1 }}>
            Mosquée la plus
            <br />
            <em style={{ color: 'var(--or)' }}>proche</em>
          </h1>
          <p style={{ color: 'var(--or-clair)', opacity: 0.85 }}>Trouvez une mosquée partout dans le monde — en quelques secondes</p>
        </div>
      </section>

      <section style={{ maxWidth: '900px', margin: '0 auto', padding: '2rem 1.5rem' }}>
        {step === 'idle' && (
          <div>
            <div style={{ background: 'white', borderRadius: '16px', padding: '1.25rem', marginBottom: '1rem', border: '1px solid rgba(27,67,50,0.1)' }}>
              <p style={{ fontWeight: 600, color: 'var(--foret)', marginBottom: '0.75rem', fontSize: '14px' }}>Rayon de recherche</p>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                {[500, 1000, 2000, 5000].map((r) => (
                  <button key={r} onClick={() => setRadius(r)} style={{ padding: '0.4rem 1rem', borderRadius: '20px', border: 'none', background: radius === r ? 'var(--foret)' : 'rgba(27,67,50,0.07)', color: radius === r ? 'white' : 'var(--foret)', fontWeight: 600, fontSize: '13px', cursor: 'pointer' }}>
                    {r < 1000 ? `${r}m` : `${r / 1000}km`}
                  </button>
                ))}
              </div>
            </div>
            <button onClick={findMosques} style={{ width: '100%', padding: '1.1rem', background: 'var(--foret)', color: 'white', border: 'none', borderRadius: '14px', fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer', boxShadow: '0 4px 20px rgba(27,67,50,0.3)' }}>
              🕌 Trouver les mosquées proches
            </button>
          </div>
        )}

        {step === 'loading' && (
          <div style={{ textAlign: 'center', padding: '4rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'mpulse 1.5s ease-in-out infinite' }}>🕌</div>
            <p style={{ color: 'var(--foret)', fontWeight: 600, fontSize: '1.1rem' }}>Recherche des mosquées…</p>
            <p style={{ color: 'var(--texte-2)', fontSize: '13px', marginTop: '0.5rem' }}>Données OpenStreetMap — couverture mondiale</p>
            <style>{`@keyframes mpulse { 0%,100%{transform:scale(1)} 50%{transform:scale(1.15)} }`}</style>
          </div>
        )}

        {step === 'results' && (
          <div>
            <div ref={mapContainerRef} style={{ height: 380, borderRadius: '20px', overflow: 'hidden', marginBottom: '1.5rem', boxShadow: '0 4px 20px rgba(0,0,0,0.12)', border: '2px solid rgba(201,168,76,0.3)' }} />

            <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1.25rem', flexWrap: 'wrap' }}>
              <div style={{ flex: 1, background: 'var(--foret)', borderRadius: '12px', padding: '0.875rem', textAlign: 'center', minWidth: '140px' }}>
                <p style={{ color: 'white', fontSize: '1.5rem', fontFamily: "'Playfair Display', serif", fontWeight: 700, margin: 0 }}>{mosques.length}</p>
                <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: 0 }}>mosquées trouvées</p>
              </div>
              {mosques[0] && (
                <div style={{ flex: 1, background: 'rgba(201,168,76,0.1)', borderRadius: '12px', padding: '0.875rem', textAlign: 'center', minWidth: '140px', border: '1px solid rgba(201,168,76,0.3)' }}>
                  <p style={{ color: 'var(--or)', fontSize: '1.5rem', fontFamily: "'Playfair Display', serif", fontWeight: 700, margin: 0 }}>{fmt(mosques[0].distance)}</p>
                  <p style={{ color: 'var(--texte-2)', fontSize: '12px', margin: 0 }}>la plus proche</p>
                </div>
              )}
            </div>

            {mosques.length === 0 && (
              <p style={{ textAlign: 'center', color: 'var(--texte-2)', padding: '1rem' }}>Aucune mosquée trouvée dans ce rayon. Essayez un rayon plus large.</p>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {mosques.map((m, index) => (
                <div key={m.id} onClick={() => selectMosque(m)}
                  className="mosque-card"
                  style={{ animationDelay: `${index * 50}ms`, background: selectedMosque?.id === m.id ? 'rgba(27,67,50,0.05)' : 'white', borderRadius: '14px', padding: '1rem 1.25rem', border: `1.5px solid ${selectedMosque?.id === m.id ? 'var(--foret)' : 'rgba(27,67,50,0.1)'}`, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: index === 0 ? 'var(--or)' : 'rgba(27,67,50,0.08)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: index === 0 ? '16px' : '13px', fontWeight: 700, color: index === 0 ? '#0B1A0F' : 'var(--foret)' }}>
                    {index === 0 ? '🕌' : index + 1}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontWeight: 700, color: 'var(--texte)', fontSize: '15px', margin: 0, fontFamily: "'Playfair Display', serif", overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{m.name}</p>
                    {m.address && <p style={{ color: 'var(--texte-2)', fontSize: '12px', margin: '2px 0 0' }}>📍 {m.address}</p>}
                  </div>
                  <div style={{ textAlign: 'right', flexShrink: 0 }}>
                    <p style={{ fontWeight: 700, color: index === 0 ? 'var(--or)' : 'var(--foret)', fontSize: '14px', margin: 0 }}>{fmt(m.distance)}</p>
                    <a href={`https://maps.google.com/?q=${m.lat},${m.lng}&travelmode=walking`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ fontSize: '11px', color: 'var(--foret)', fontWeight: 600, textDecoration: 'none' }}>Itinéraire →</a>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={reset} style={{ width: '100%', marginTop: '1.5rem', padding: '0.875rem', background: 'rgba(27,67,50,0.08)', color: 'var(--foret)', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>🔄 Nouvelle recherche</button>
            <style>{`@keyframes slideUp { from { opacity:0; transform:translateY(20px); } to { opacity:1; transform:translateY(0); } } .mosque-card { animation: slideUp 0.4s ease both; }`}</style>
          </div>
        )}

        {step === 'error' && (
          <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>📍</p>
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: 'var(--foret)' }}>Localisation impossible</h3>
            <p style={{ color: 'var(--texte-2)', fontSize: '14px', marginBottom: '1.5rem' }}>Activez la localisation dans les paramètres de votre téléphone.</p>
            <button onClick={() => setStep('idle')} style={{ padding: '0.75rem 2rem', background: 'var(--foret)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>Réessayer</button>
          </div>
        )}
      </section>
    </main>
  )
}
