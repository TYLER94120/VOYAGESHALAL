'use client'
import { useState, useEffect } from 'react'
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
  const θ = Math.atan2(y, x)
  return ((θ * 180) / Math.PI + 360) % 360
}

export default function QiblaCompass() {
  const { city } = useLocation()
  const [step, setStep] = useState<'idle' | 'locating' | 'compass' | 'error'>('idle')
  const [qiblaAngle, setQiblaAngle] = useState<number | null>(null)
  const [compassAngle, setCompassAngle] = useState(0)
  const [userCity, setUserCity] = useState('')
  const [distance, setDistance] = useState<number | null>(null)
  const [accuracy, setAccuracy] = useState<'high' | 'low' | null>(null)
  const [aligned, setAligned] = useState(false)
  const [geoErr, setGeoErr] = useState<GeoError | null>(null)
  const needleAngle = qiblaAngle !== null ? qiblaAngle - compassAngle : 0

  function calcDistance(lat: number, lng: number): number {
    const R = 6371
    const dLat = ((MECCA_LAT - lat) * Math.PI) / 180
    const dLng = ((MECCA_LNG - lng) * Math.PI) / 180
    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos((lat * Math.PI) / 180) * Math.cos((MECCA_LAT * Math.PI) / 180) * Math.sin(dLng / 2) ** 2
    return Math.round(R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a)))
  }

  async function getCityName(lat: number, lng: number) {
    try {
      const r = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`)
      const d = await r.json()
      setUserCity(d.address?.city || d.address?.town || d.address?.village || d.address?.county || '')
    } catch {
      /* silencieux */
    }
  }

  async function startQibla() {
    setStep('locating')
    const DOE = DeviceOrientationEvent as unknown as { requestPermission?: () => Promise<string> }
    if (typeof DOE.requestPermission === 'function') {
      try {
        const perm = await DOE.requestPermission()
        if (perm !== 'granted') {
          setStep('error')
          return
        }
      } catch {
        setStep('error')
        return
      }
    }
    setGeoErr(null)
    try {
      const { lat: latitude, lng: longitude } = await getPosition()
      setQiblaAngle(calculateQibla(latitude, longitude))
      setDistance(calcDistance(latitude, longitude))
      setAccuracy('low')
      getCityName(latitude, longitude)
      setStep('compass')
    } catch (code) {
      setGeoErr(describeGeoError(code as GeoErrorCode))
      setStep('error')
    }
  }

  // Ville mémorisée → on affiche directement la direction de la Qibla (sans redemander la position).
  // La boussole live (capteur) reste activable via le bouton sur mobile.
  useEffect(() => {
    if (city && city.lat != null && city.lng != null && qiblaAngle === null && step === 'idle') {
      setQiblaAngle(calculateQibla(city.lat, city.lng))
      setDistance(calcDistance(city.lat, city.lng))
      setUserCity(city.nom)
      setStep('compass')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city])

  useEffect(() => {
    if (step !== 'compass') return
    const handler = (e: DeviceOrientationEvent) => {
      const ev = e as DeviceOrientationEvent & { webkitCompassHeading?: number }
      const heading = ev.webkitCompassHeading ?? (e.alpha ? 360 - e.alpha : 0)
      setCompassAngle(heading)
    }
    window.addEventListener('deviceorientationabsolute', handler, true)
    window.addEventListener('deviceorientation', handler, true)
    return () => {
      window.removeEventListener('deviceorientationabsolute', handler, true)
      window.removeEventListener('deviceorientation', handler, true)
    }
  }, [step])

  // Feedback d'alignement (±5°)
  useEffect(() => {
    if (step !== 'compass' || qiblaAngle === null) return
    const diff = Math.abs(((needleAngle % 360) + 360) % 360)
    const isAligned = diff <= 5 || diff >= 355
    if (isAligned && !aligned) {
      setAligned(true)
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(200)
    } else if (!isAligned && aligned) {
      setAligned(false)
    }
  }, [needleAngle, step, qiblaAngle, aligned])

  function getCardinal(deg: number): string {
    const dirs = ['Nord', 'Nord-Est', 'Est', 'Sud-Est', 'Sud', 'Sud-Ouest', 'Ouest', 'Nord-Ouest']
    return dirs[Math.round(deg / 45) % 8]
  }

  return (
    <section style={{ maxWidth: '480px', margin: '0 auto', padding: '2rem 1.5rem' }}>
      {step === 'idle' && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 220, height: 220, margin: '0 auto 2rem', position: 'relative' }}>
            <CompassSVG angle={0} animated={false} />
          </div>
          <button onClick={startQibla} className="btn-cta-primary" style={btnPrimary}>📍 Trouver la Qibla depuis ma position</button>
          <p style={{ color: 'var(--texte-2)', fontSize: '13px', marginTop: '1rem' }}>
            Votre position GPS reste privée — jamais stockée ni partagée.
          </p>
        </div>
      )}

      {step === 'locating' && (
        <div style={{ textAlign: 'center', padding: '3rem 0' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem', animation: 'qspin 1s linear infinite' }}>🧭</div>
          <p style={{ color: 'var(--foret)', fontWeight: 600 }}>Localisation en cours…</p>
          <p style={{ color: 'var(--texte-2)', fontSize: '13px', marginTop: '0.5rem' }}>Autorisez l&apos;accès à votre position</p>
          <style>{`@keyframes qspin { to { transform: rotate(360deg); } }`}</style>
        </div>
      )}

      {step === 'compass' && qiblaAngle !== null && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ width: 260, height: 260, margin: '0 auto 1rem', position: 'relative' }}>
            <CompassSVG angle={needleAngle} animated />
          </div>

          {aligned && (
            <p style={{ color: 'var(--or)', fontWeight: 700, fontSize: '1.1rem', marginBottom: '1rem', fontFamily: "'Playfair Display', serif" }}>
              Vous êtes aligné ✦
            </p>
          )}

          <div style={{ background: 'var(--nuit)', borderRadius: '20px', padding: '1.5rem', marginBottom: '1rem', border: '1px solid rgba(201,168,76,0.3)' }}>
            <p style={{ color: 'var(--or)', fontSize: '11px', fontWeight: 600, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>Direction Qibla</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '3rem', fontWeight: 900, color: 'white', margin: 0, lineHeight: 1 }}>{Math.round(qiblaAngle)}°</p>
            <p style={{ color: 'var(--or-clair)', fontSize: '1rem', marginTop: '0.25rem' }}>{getCardinal(qiblaAngle)}</p>
            {userCity && <p style={{ color: 'var(--texte-2)', fontSize: '13px', marginTop: '0.75rem' }}>📍 Depuis {userCity}</p>}
            {distance && <p style={{ color: 'var(--or-clair)', fontSize: '14px', marginTop: '0.25rem' }}>🕌 La Mecque est à {distance.toLocaleString('fr-FR')} km</p>}
          </div>

          {accuracy === 'high' && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', background: 'rgba(27,67,50,0.1)', borderRadius: '20px', padding: '0.35rem 0.875rem', marginBottom: '1rem' }}>
              <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', display: 'block' }} />
              <span style={{ fontSize: '12px', color: 'var(--foret)', fontWeight: 600 }}>GPS haute précision</span>
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`🕌 Ma Qibla depuis ${userCity} : ${Math.round(qiblaAngle)}° ${getCardinal(qiblaAngle)} — Via VoyagesHalal.fr`)}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{ flex: 1, padding: '0.75rem', background: '#25D366', color: 'white', borderRadius: '12px', textAlign: 'center', fontWeight: 600, fontSize: '14px', textDecoration: 'none' }}
            >
              📱 WhatsApp
            </a>
            <button onClick={startQibla} style={{ flex: 1, padding: '0.75rem', background: 'rgba(27,67,50,0.1)', color: 'var(--foret)', border: 'none', borderRadius: '12px', fontWeight: 600, fontSize: '14px', cursor: 'pointer' }}>🔄 Recalculer</button>
          </div>
        </div>
      )}

      {step === 'error' && (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <h3 style={{ fontFamily: "'Playfair Display', serif", color: 'var(--foret)', marginBottom: '0.5rem' }}>{geoErr?.message ?? '📍 Position non disponible'}</h3>
          <p style={{ color: 'var(--texte-2)', fontSize: '14px', margin: '0 auto 1.5rem', maxWidth: 420 }}>{geoErr?.detail ?? 'Vérifiez que la localisation est activée dans les paramètres de votre téléphone.'}</p>
          <button onClick={() => { setGeoErr(null); setStep('idle') }} style={{ padding: '0.75rem 2rem', background: 'var(--foret)', color: 'white', border: 'none', borderRadius: '12px', fontWeight: 600, cursor: 'pointer' }}>Réessayer</button>
        </div>
      )}

      <div style={{ marginTop: '2rem', padding: '1.25rem', background: 'white', borderRadius: '16px', border: '1px solid rgba(27,67,50,0.08)' }}>
        <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1rem', color: 'var(--foret)', marginBottom: '0.5rem' }}>🕌 Qu&apos;est-ce que la Qibla ?</h3>
        <p style={{ fontSize: '14px', color: 'var(--texte-2)', lineHeight: 1.7, margin: 0 }}>
          La Qibla est la direction vers laquelle tout musulman se tourne pour la prière. Elle pointe vers la Kaaba, à La Mecque en Arabie Saoudite. Notre outil calcule cette direction avec précision depuis n&apos;importe où dans le monde.
        </p>
      </div>
    </section>
  )
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
