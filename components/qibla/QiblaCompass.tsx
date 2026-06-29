'use client'
import { useState, useEffect, useRef } from 'react'
import 'leaflet/dist/leaflet.css'
import type { Map as LeafletMap } from 'leaflet'
import { useLocation } from '@/components/location/LocationProvider'
import { getPosition, describeGeoError, type GeoError, type GeoErrorCode } from '@/lib/geo'

// Coordonnées de La Mecque (Kaaba)
const MECCA_LAT = 21.4225
const MECCA_LNG = 39.8262

function calculateQibla(userLat: number, userLng: number): number {
  const φ1 = (userLat * Math.PI) / 180
  const φ2 = (MECCA_LAT * Math.PI) / 180
  const Δλ = ((MECCA_LNG - userLng) * Math.PI) / 180
  const y = Math.sin(Δλ) * Math.cos(φ2)
  const x = Math.cos(φ1) * Math.sin(φ2) - Math.sin(φ1) * Math.cos(φ2) * Math.cos(Δλ)
  return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360
}

function calcDistance(lat: number, lng: number): number {
  const R = 6371
  const dLat = ((MECCA_LAT - lat) * Math.PI) / 180
  const dLng = ((MECCA_LNG - lng) * Math.PI) / 180
  const a = Math.sin(dLat / 2) ** 2 + Math.cos((lat * Math.PI) / 180) * Math.cos((MECCA_LAT * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
}

function getCardinal(deg: number): string {
  const dirs = ['Nord', 'Nord-Est', 'Est', 'Sud-Est', 'Sud', 'Sud-Ouest', 'Ouest', 'Nord-Ouest']
  return dirs[Math.round(deg / 45) % 8]
}

interface Pos { lat: number; lng: number; label: string }
type Mode = 'boussole' | 'direction' | 'carte'

export default function QiblaCompass() {
  const { city } = useLocation()
  const [pos, setPos] = useState<Pos | null>(null)
  const [loading, setLoading] = useState(false)
  const [geoErr, setGeoErr] = useState<GeoError | null>(null)
  const [mode, setMode] = useState<Mode>('boussole')

  // Boussole live
  const [compassAngle, setCompassAngle] = useState(0)
  const [hasSensor, setHasSensor] = useState(false)
  const [sensorAsked, setSensorAsked] = useState(false)

  const qibla = pos ? calculateQibla(pos.lat, pos.lng) : null
  const distance = pos ? calcDistance(pos.lat, pos.lng) : null
  const needleAngle = qibla !== null ? qibla - compassAngle : 0
  const aligned = qibla !== null && (Math.abs(((needleAngle % 360) + 360) % 360) <= 6 || Math.abs(((needleAngle % 360) + 360) % 360) >= 354)

  // Ville mémorisée → position de départ automatique
  useEffect(() => {
    if (city && city.lat != null && city.lng != null && !pos) {
      setPos({ lat: city.lat, lng: city.lng, label: city.nom })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city])

  // Position GPS précise
  const usePrecise = async () => {
    setLoading(true); setGeoErr(null)
    try {
      const { lat, lng } = await getPosition({ highAccuracy: true })
      setPos({ lat, lng, label: 'Ma position exacte' })
    } catch (code) {
      setGeoErr(describeGeoError(code as GeoErrorCode))
    } finally {
      setLoading(false)
    }
  }

  // Capteur de boussole (orientation appareil) — permission iOS au clic
  const startSensor = async () => {
    setSensorAsked(true)
    const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
    if (typeof DOE.requestPermission === 'function') {
      try { if ((await DOE.requestPermission()) !== 'granted') return } catch { return }
    }
    const handler = (e: DeviceOrientationEvent) => {
      const ev = e as DeviceOrientationEvent & { webkitCompassHeading?: number }
      const heading = ev.webkitCompassHeading ?? (e.alpha != null ? 360 - e.alpha : null)
      if (heading != null) { setHasSensor(true); setCompassAngle(heading) }
    }
    window.addEventListener('deviceorientationabsolute', handler, true)
    window.addEventListener('deviceorientation', handler, true)
  }

  useEffect(() => {
    if (aligned && typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(120)
  }, [aligned])

  // ----- Pas encore de position -----
  if (!pos) {
    return (
      <section style={{ maxWidth: 480, margin: '0 auto', padding: '2rem 1.5rem', textAlign: 'center' }}>
        <div style={{ width: 200, height: 200, margin: '0 auto 1.5rem', position: 'relative', opacity: 0.4 }}>
          <CompassSVG angle={0} animated={false} />
        </div>
        <button onClick={usePrecise} disabled={loading} style={btnPrimary}>
          {loading ? '📍 Localisation…' : '📍 Trouver la Qibla (position précise)'}
        </button>
        {geoErr && (
          <div style={{ background: 'rgba(255,100,100,0.12)', border: '1px solid rgba(255,100,100,0.3)', borderRadius: 12, padding: '12px 16px', marginTop: 16, textAlign: 'left' }}>
            <p style={{ color: '#b91c1c', fontWeight: 700, margin: 0, fontSize: 14 }}>{geoErr.message}</p>
            <p style={{ color: 'var(--texte-2)', fontSize: 13, margin: '4px 0 0' }}>{geoErr.detail}</p>
          </div>
        )}
        <p style={{ color: 'var(--texte-2)', fontSize: 13, marginTop: 14 }}>Votre position GPS reste privée — jamais stockée ni partagée.</p>
      </section>
    )
  }

  return (
    <section style={{ maxWidth: 480, margin: '0 auto', padding: '1.5rem 1.5rem' }}>
      {/* Sélecteur de mode */}
      <div style={{ display: 'flex', gap: 6, background: '#fff', padding: 6, borderRadius: 14, border: '1px solid rgba(27,67,50,0.12)', marginBottom: 20 }}>
        {([['boussole', '🧭 Boussole'], ['direction', '📐 Direction'], ['carte', '🗺️ Carte']] as [Mode, string][]).map(([m, label]) => (
          <button key={m} onClick={() => setMode(m)} style={{ flex: 1, padding: '10px 8px', borderRadius: 10, border: 'none', cursor: 'pointer', fontSize: 13.5, fontWeight: 700, background: mode === m ? 'var(--foret)' : 'transparent', color: mode === m ? '#fff' : 'var(--texte-2)' }}>
            {label}
          </button>
        ))}
      </div>

      {/* En-tête commun : angle + distance */}
      <div style={{ background: 'var(--nuit)', borderRadius: 18, padding: '1.25rem', marginBottom: 18, textAlign: 'center', border: '1px solid rgba(201,168,76,0.3)' }}>
        <p style={{ color: 'var(--or)', fontSize: 11, fontWeight: 600, letterSpacing: 2, textTransform: 'uppercase', margin: 0 }}>Direction Qibla</p>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '2.6rem', fontWeight: 900, color: '#fff', margin: '2px 0 0', lineHeight: 1 }}>{Math.round(qibla!)}°</p>
        <p style={{ color: 'var(--or-clair)', fontSize: 15, margin: '2px 0 0' }}>{getCardinal(qibla!)} · 📍 {pos.label}</p>
        {distance && <p style={{ color: 'rgba(253,250,243,0.6)', fontSize: 13, margin: '6px 0 0' }}>🕋 La Mecque est à {distance.toLocaleString('fr-FR')} km</p>}
        <button onClick={usePrecise} style={{ marginTop: 10, background: 'none', border: '1px solid rgba(201,168,76,0.4)', color: 'var(--or-clair)', borderRadius: 20, padding: '5px 14px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>📍 Affiner avec ma position exacte</button>
      </div>

      {/* MODE BOUSSOLE — compas live */}
      {mode === 'boussole' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 260, height: 260, margin: '0 auto 1rem', position: 'relative' }}>
            <CompassSVG angle={needleAngle} animated />
          </div>
          {!sensorAsked && (
            <button onClick={startSensor} style={btnPrimary}>🧭 Activer la boussole</button>
          )}
          {sensorAsked && !hasSensor && (
            <div style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.35)', borderRadius: 12, padding: '12px 16px', fontSize: 13, color: 'var(--foret)' }}>
              <strong>Calibrez votre boussole :</strong> bougez le téléphone en formant un <strong>8</strong> dans l’air, loin de tout objet métallique. <br />Si rien ne bouge, votre appareil n’a pas de capteur — utilisez le mode <strong>Direction</strong>.
            </div>
          )}
          {hasSensor && (
            <p style={{ color: aligned ? 'var(--or)' : 'var(--texte-2)', fontWeight: 700, fontSize: aligned ? '1.15rem' : 14, fontFamily: aligned ? "'Playfair Display', serif" : undefined }}>
              {aligned ? '✦ Vous êtes aligné vers la Qibla' : 'Tournez doucement jusqu’à aligner l’aiguille dorée vers le haut'}
            </p>
          )}
        </div>
      )}

      {/* MODE DIRECTION — statique, sans capteur (marche sur ordinateur) */}
      {mode === 'direction' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 240, height: 240, margin: '0 auto 1rem', position: 'relative' }}>
            <CompassSVG angle={qibla!} animated={false} />
          </div>
          <div style={{ background: '#fff', borderRadius: 14, padding: '1rem 1.25rem', border: '1px solid rgba(27,67,50,0.1)', fontSize: 14, color: 'var(--texte)', lineHeight: 1.6 }}>
            Placez-vous face au <strong>Nord</strong>, puis tournez de <strong>{Math.round(qibla!)}°</strong> vers la <strong>{qibla! <= 180 ? 'droite (sens horaire)' : 'gauche'}</strong> — vous faites alors face à la <strong>Qibla ({getCardinal(qibla!)})</strong>.
          </div>
        </div>
      )}

      {/* MODE CARTE — trait vers la Kaaba */}
      {mode === 'carte' && <QiblaMap pos={pos} />}

      {/* Partage + info */}
      <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <a href={`https://wa.me/?text=${encodeURIComponent(`🕋 Ma Qibla depuis ${pos.label} : ${Math.round(qibla!)}° ${getCardinal(qibla!)} — via VoyagesHalal.fr`)}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '0.75rem', background: '#25D366', color: '#fff', borderRadius: 12, textAlign: 'center', fontWeight: 600, fontSize: 14, textDecoration: 'none' }}>📱 Partager</a>
        <button onClick={() => { setPos(null); setSensorAsked(false); setHasSensor(false) }} style={{ flex: 1, padding: '0.75rem', background: 'rgba(27,67,50,0.1)', color: 'var(--foret)', border: 'none', borderRadius: 12, fontWeight: 600, fontSize: 14, cursor: 'pointer' }}>🔄 Changer de lieu</button>
      </div>

      <div style={{ marginTop: 20, padding: '1.1rem', background: '#fff', borderRadius: 16, border: '1px solid rgba(27,67,50,0.08)' }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', color: 'var(--foret)', marginBottom: 6 }}>🧭 Pour une précision maximale</h3>
        <p style={{ fontSize: 13.5, color: 'var(--texte-2)', lineHeight: 1.7, margin: 0 }}>
          Calibrez la boussole (mouvement en 8), éloignez le téléphone des objets métalliques et des aimants, et posez-le à plat. La boussole magnétique peut dévier ; le mode <strong>Direction</strong> (angle fixe par rapport au Nord) reste fiable partout.
        </p>
      </div>
    </section>
  )
}

// Carte Leaflet : votre position → Kaaba
function QiblaMap({ pos }: { pos: Pos }) {
  const ref = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)

  useEffect(() => {
    let cancelled = false
    ;(async () => {
      if (!ref.current || mapRef.current) return
      const L = (await import('leaflet')).default
      if (cancelled || !ref.current) return
      const map = L.map(ref.current, { center: [pos.lat, pos.lng], zoom: 4, scrollWheelZoom: false })
      mapRef.current = map
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map)
      const me = L.divIcon({ html: `<div style="width:14px;height:14px;background:#1B4332;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>`, className: '', iconAnchor: [7, 7] })
      const kaaba = L.divIcon({ html: `<div style="font-size:22px">🕋</div>`, className: '', iconAnchor: [11, 11] })
      L.marker([pos.lat, pos.lng], { icon: me }).addTo(map).bindPopup('📍 Vous')
      L.marker([MECCA_LAT, MECCA_LNG], { icon: kaaba }).addTo(map).bindPopup('🕋 La Mecque')
      L.polyline([[pos.lat, pos.lng], [MECCA_LAT, MECCA_LNG]], { color: '#C9A84C', weight: 3, dashArray: '6 6' }).addTo(map)
      map.fitBounds([[pos.lat, pos.lng], [MECCA_LAT, MECCA_LNG]], { padding: [40, 40] })
    })()
    return () => { cancelled = true; if (mapRef.current) { mapRef.current.remove(); mapRef.current = null } }
  }, [pos])

  return <div ref={ref} style={{ height: 320, borderRadius: 18, overflow: 'hidden', border: '2px solid rgba(201,168,76,0.3)' }} />
}

const btnPrimary: React.CSSProperties = {
  width: '100%', padding: '1.1rem', background: 'var(--foret)', color: 'white', border: 'none',
  borderRadius: '14px', fontSize: '1.05rem', fontWeight: 700, cursor: 'pointer',
  boxShadow: '0 4px 20px rgba(27,67,50,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.75rem',
}

function CompassSVG({ angle, animated }: { angle: number; animated: boolean }) {
  return (
    <svg viewBox="0 0 260 260" style={{ width: '100%', height: '100%' }}>
      <circle cx="130" cy="130" r="125" fill="none" stroke="rgba(201,168,76,0.2)" strokeWidth="1" />
      <circle cx="130" cy="130" r="118" fill="#0B1A0F" stroke="rgba(201,168,76,0.4)" strokeWidth="1.5" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map((a) => (
        <line key={a}
          x1={130 + 110 * Math.sin((a * Math.PI) / 180)} y1={130 - 110 * Math.cos((a * Math.PI) / 180)}
          x2={130 + 118 * Math.sin((a * Math.PI) / 180)} y2={130 - 118 * Math.cos((a * Math.PI) / 180)}
          stroke="#C9A84C" strokeWidth="2" />
      ))}
      {[['N', 130, 18], ['S', 130, 246], ['E', 246, 134], ['O', 14, 134]].map(([l, x, y]) => (
        <text key={l as string} x={x as number} y={y as number} textAnchor="middle" fill={l === 'N' ? '#C9A84C' : 'rgba(253,250,243,0.5)'} fontSize="14" fontWeight="700">{l}</text>
      ))}
      {Array.from({ length: 72 }).map((_, i) => {
        const a = (i * 5 * Math.PI) / 180
        const r1 = i % 6 === 0 ? 100 : 104
        return (
          <line key={i} x1={130 + 108 * Math.sin(a)} y1={130 - 108 * Math.cos(a)} x2={130 + r1 * Math.sin(a)} y2={130 - r1 * Math.cos(a)} stroke="rgba(201,168,76,0.3)" strokeWidth={i % 6 === 0 ? 1.5 : 0.7} />
        )
      })}
      <g style={{ transform: `rotate(${angle}deg)`, transformOrigin: '130px 130px', transition: animated ? 'transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)' : 'none' }}>
        <polygon points="130,40 136,130 130,120 124,130" fill="#C9A84C" />
        <polygon points="130,220 136,130 130,140 124,130" fill="rgba(107,114,128,0.5)" />
        <text x="130" y="44" textAnchor="middle" fontSize="13">🕋</text>
      </g>
      <circle cx="130" cy="130" r="10" fill="#C9A84C" opacity="0.9" />
      <circle cx="130" cy="130" r="5" fill="#0B1A0F" />
    </svg>
  )
}
