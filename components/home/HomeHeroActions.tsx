'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SearchBarHome from '@/components/search/SearchBarHome'
import { useLocation } from '@/components/location/LocationProvider'

// Actions du hero d'accueil : « Localise-moi » (→ ville la plus proche) + recherche.
// La recherche manuelle est TOUJOURS visible dessous : si la géoloc échoue, l'utilisateur
// n'est jamais bloqué.
export default function HomeHeroActions() {
  const { geolocate, geoError } = useLocation()
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(8)

  // Décompte visuel pendant la localisation (8s max)
  useEffect(() => {
    if (!loading) return
    setCountdown(8)
    const id = setInterval(() => setCountdown((c) => (c > 1 ? c - 1 : c)), 1000)
    return () => clearInterval(id)
  }, [loading])

  const handleLocate = async () => {
    setLoading(true)
    const city = await geolocate()
    setLoading(false)
    if (city) router.push(`/destinations/${city.slug}`)
  }

  return (
    <div style={{ maxWidth: 540, margin: '0 auto', width: '100%' }}>
      <button
        onClick={handleLocate}
        disabled={loading}
        style={{
          width: '100%', height: 64, borderRadius: 16, border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.75 : 1,
          background: 'var(--or)', color: 'var(--nuit)', fontSize: 18, fontWeight: 800,
          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
          boxShadow: '0 10px 30px rgba(201,168,76,0.3)', marginBottom: 14,
        }}
      >
        {loading ? (
          <>
            <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>⏳</span>
            Localisation… ({countdown}s)
          </>
        ) : (
          <>
            <span style={{ fontSize: 24 }}>📍</span>
            Localise-moi
          </>
        )}
      </button>

      {/* Message d'erreur clair selon le cas (permission refusée, GPS off, timeout, iOS…) */}
      {geoError && !loading && (
        <div style={{ background: 'rgba(255,100,100,0.15)', border: '1px solid rgba(255,100,100,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 12 }}>
          <p style={{ color: '#ffb4b4', fontWeight: 700, margin: 0, fontSize: 14 }}>{geoError.message}</p>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 13, margin: '4px 0 0' }}>{geoError.detail}</p>
        </div>
      )}

      {/* Recherche manuelle — toujours disponible, repli automatique si la géoloc échoue */}
      <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(201,168,76,0.35)', backdropFilter: 'blur(10px)', borderRadius: 16, padding: 4 }}>
        <SearchBarHome />
      </div>

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
