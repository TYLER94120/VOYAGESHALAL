'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'

interface GeoData {
  cityName: string
  timings: Record<string, string>
  mosques: any[]
  qiblaAngle: number
  lat: number
  lng: number
}

const PRAYER_KEYS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
function getNextPrayer(timings: Record<string, string>): string {
  const now = new Date()
  const cur = now.getHours() * 60 + now.getMinutes()
  for (const k of PRAYER_KEYS) {
    const [h, m] = (timings[k] || '').split(':').map(Number)
    if (Number.isFinite(h) && h * 60 + m > cur) return `${k} ${(timings[k] || '').slice(0, 5)}`
  }
  return `Fajr ${(timings['Fajr'] || '').slice(0, 5)}`
}

export default function GeoDashboard() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'ready' | 'error'>('idle')
  const [data, setData] = useState<GeoData | null>(null)

  const handleGeolocate = async () => {
    setStatus('loading')
    try {
      const pos = await new Promise<GeolocationPosition>((res, rej) =>
        navigator.geolocation.getCurrentPosition(res, rej, { timeout: 10000 })
      )
      const { latitude: lat, longitude: lng } = pos.coords

      const geo = await fetch(`https://nominatim.openstreetmap.org/reverse?lat=${lat}&lon=${lng}&format=json`).then((r) => r.json()).catch(() => null)
      const a = geo?.address ?? {}
      const cityName = a.city || a.town || a.village || a.county || a.state || 'Votre position'

      const prayer = await fetch(`https://api.aladhan.com/v1/timings?latitude=${lat}&longitude=${lng}&method=2`).then((r) => r.json())
      const timings = prayer?.data?.timings ?? {}

      let mosques: any[] = []
      try {
        const q = `[out:json][timeout:10];node["amenity"="place_of_worship"]["religion"="muslim"](around:2500,${lat},${lng});out 3;`
        const mosq = await fetch(`https://overpass-api.de/api/interpreter?data=${encodeURIComponent(q)}`).then((r) => r.json())
        mosques = (mosq?.elements ?? []).slice(0, 3)
      } catch { /* mosquées optionnelles */ }

      const meccaLat = 21.4225, meccaLng = 39.8262
      const dLng = ((meccaLng - lng) * Math.PI) / 180
      const lat1 = (lat * Math.PI) / 180, lat2 = (meccaLat * Math.PI) / 180
      const y = Math.sin(dLng) * Math.cos(lat2)
      const x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng)
      const qiblaAngle = Math.round(((Math.atan2(y, x) * 180) / Math.PI + 360) % 360)

      setData({ cityName, timings, mosques, qiblaAngle, lat, lng })
      setStatus('ready')
    } catch {
      setStatus('error')
    }
  }

  if (status === 'loading') {
    return (
      <div style={{ textAlign: 'center', padding: '40px', background: 'var(--nuit)', borderRadius: '20px', margin: '0 0 4px' }}>
        <div style={{ fontSize: '40px', animation: 'spin 1.2s linear infinite' }}>🕌</div>
        <p style={{ color: 'var(--or)', marginTop: '14px' }}>Localisation en cours…</p>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div style={{ background: '#fff7e6', border: '1px solid rgba(201,168,76,0.4)', borderRadius: '16px', padding: '20px', textAlign: 'center' }}>
        <p style={{ color: '#8A6D1E' }}>❌ Localisation indisponible. Activez le GPS / autorisez la position, puis réessayez.</p>
        <button onClick={() => setStatus('idle')} style={{ marginTop: '12px', padding: '10px 20px', background: 'var(--foret)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>Réessayer</button>
      </div>
    )
  }

  if (status === 'ready' && data) {
    return (
      <div style={{ background: 'var(--nuit)', borderRadius: '20px', padding: '22px', border: '1px solid rgba(201,168,76,0.3)' }}>
        <h3 style={{ color: 'var(--or)', fontFamily: "'Playfair Display', serif", marginBottom: '16px', fontSize: '18px', fontWeight: 700 }}>📍 {data.cityName} — Guide halal instantané</h3>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '16px' }}>
          <div style={{ background: 'rgba(201,168,76,0.1)', borderRadius: '14px', padding: '14px', border: '1px solid rgba(201,168,76,0.2)' }}>
            <div style={{ fontSize: '22px' }}>🕐</div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', marginTop: '4px' }}>Prochaine prière</div>
            <div style={{ color: 'var(--or)', fontWeight: 700, fontSize: '16px' }}>{getNextPrayer(data.timings)}</div>
          </div>
          <div style={{ background: 'rgba(201,168,76,0.1)', borderRadius: '14px', padding: '14px', border: '1px solid rgba(201,168,76,0.2)' }}>
            <div style={{ fontSize: '22px' }}>🧭</div>
            <div style={{ color: 'rgba(255,255,255,0.75)', fontSize: '12px', marginTop: '4px' }}>Direction Qibla</div>
            <div style={{ color: 'var(--or)', fontWeight: 700, fontSize: '16px' }}>{data.qiblaAngle}°</div>
          </div>
        </div>

        {data.mosques.length > 0 && (
          <div style={{ marginBottom: '14px' }}>
            <h4 style={{ color: 'white', fontSize: '14px', marginBottom: '10px' }}>🕌 Mosquées les plus proches</h4>
            {data.mosques.map((m: any, i: number) => (
              <a key={i} href={`https://maps.google.com/?q=${m.lat},${m.lon}`} target="_blank" rel="noopener noreferrer"
                style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '10px 12px', background: 'rgba(255,255,255,0.05)', borderRadius: '10px', marginBottom: '8px', textDecoration: 'none' }}>
                <span style={{ color: 'var(--or)', fontSize: '18px' }}>🕌</span>
                <span style={{ color: 'white', fontSize: '14px' }}>{m.tags?.name || 'Mosquée'}</span>
                <span style={{ marginLeft: 'auto', color: 'var(--or)', fontSize: '12px' }}>→</span>
              </a>
            ))}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
          <a href="/horaires-priere" style={{ padding: '12px', background: 'var(--foret)', color: 'white', textAlign: 'center', borderRadius: '12px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>🕐 Tous les horaires</a>
          <a href="/mosquee-proche" style={{ padding: '12px', background: 'rgba(201,168,76,0.2)', color: 'var(--or)', textAlign: 'center', borderRadius: '12px', textDecoration: 'none', fontSize: '13px', border: '1px solid rgba(201,168,76,0.4)', fontWeight: 600 }}>🕌 Plus de mosquées</a>
          <a href="/qibla" style={{ padding: '12px', background: 'rgba(201,168,76,0.2)', color: 'var(--or)', textAlign: 'center', borderRadius: '12px', textDecoration: 'none', fontSize: '13px', border: '1px solid rgba(201,168,76,0.4)', fontWeight: 600 }}>🧭 Compas Qibla</a>
          <a href="/destinations" style={{ padding: '12px', background: 'var(--foret)', color: 'white', textAlign: 'center', borderRadius: '12px', textDecoration: 'none', fontSize: '13px', fontWeight: 600 }}>🍽 Restos halal</a>
        </div>
      </div>
    )
  }

  // idle
  return (
    <div style={{ background: 'linear-gradient(135deg, var(--foret), var(--nuit))', borderRadius: '20px', padding: '30px 24px', textAlign: 'center', border: '1px solid rgba(201,168,76,0.3)' }}>
      <div style={{ fontSize: '46px', marginBottom: '14px' }}>📍</div>
      <h2 style={{ color: 'white', fontFamily: "'Playfair Display', serif", fontSize: '22px', marginBottom: '8px', fontWeight: 700 }}>Tout le halal autour de vous</h2>
      <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '22px', fontSize: '14px' }}>Mosquées, horaires de prière et Qibla — en un clic</p>
      <button onClick={handleGeolocate} style={{ background: 'var(--or)', color: 'var(--nuit)', border: 'none', padding: '16px 32px', borderRadius: '14px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', width: '100%', animation: 'breathe 3s ease-in-out infinite' }}>
        📍 Me géolocaliser maintenant
      </button>
    </div>
  )
}
