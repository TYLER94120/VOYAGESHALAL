'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import SearchBarHome from '@/components/search/SearchBarHome'
import { useLocation } from '@/components/location/LocationProvider'

// Actions du hero d'accueil : « Localise-moi » (→ ville la plus proche) + recherche
export default function HomeHeroActions() {
  const { geolocate } = useLocation()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)

  const handleLocate = async () => {
    setLoading(true); setError(false)
    const city = await geolocate()
    setLoading(false)
    if (city) router.push(`/destinations/${city.slug}`)
    else setError(true)
  }

  return (
    <div style={{ maxWidth: 540, margin: '0 auto', width: '100%' }}>
      <button
        onClick={handleLocate}
        disabled={loading}
        style={{
          width: '100%', height: 64, borderRadius: 16, border: 'none', cursor: 'pointer',
          background: 'var(--or)', color: 'var(--nuit)', fontSize: 18, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: '0 10px 30px rgba(201,168,76,0.3)', marginBottom: 14,
        }}
      >
        <span style={{ fontSize: 24 }}>📍</span>
        {loading ? 'Localisation…' : 'Localise-moi'}
      </button>
      {error && (
        <p style={{ color: '#E8D5A3', fontSize: 13, marginBottom: 12 }}>
          Position indisponible — utilise la recherche ci-dessous.
        </p>
      )}
      <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(201,168,76,0.35)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: 4 }}>
        <SearchBarHome />
      </div>
    </div>
  )
}
