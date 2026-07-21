'use client'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import SearchBarHome from '@/components/search/SearchBarHome'
import { useLocation } from '@/components/location/LocationProvider'
import { useLanguage } from '@/components/i18n/LanguageProvider'

// Actions du hero d'accueil : « Localise-moi » (→ ville la plus proche) + recherche.
// La recherche manuelle est TOUJOURS visible dessous : si la géoloc échoue, l'utilisateur
// n'est jamais bloqué.
export default function HomeHeroActions() {
  const { geoError } = useLocation()
  const { lang } = useLanguage()
  const en = lang === 'en'
  const router = useRouter()
  const [loading] = useState(false)
  const [countdown, setCountdown] = useState(8)

  // Décompte visuel pendant la localisation (8s max)
  useEffect(() => {
    if (!loading) return
    setCountdown(8)
    const id = setInterval(() => setCountdown((c) => (c > 1 ? c - 1 : c)), 1000)
    return () => clearInterval(id)
  }, [loading])

  // « Localise-moi » → ouvre la carte « Autour de moi » (façon 1er écran de l'app),
  // qui gère elle-même la géolocalisation et affiche tous les points autour.
  const handleLocate = () => {
    router.push('/autour-de-moi')
  }

  const planTrip = () => router.push('/destinations')

  return (
    <div style={{ maxWidth: 540, margin: '0 auto', width: '100%' }}>
      {/* DEUX portes d'entrée : sur place (Localise-moi) vs planification (Organise) */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 14 }}>
        <button
          onClick={handleLocate}
          disabled={loading}
          style={{
            height: 84, borderRadius: 16, border: 'none',
            cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.75 : 1,
            background: 'var(--or)', color: 'var(--nuit)', fontSize: 16, fontWeight: 800,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
            boxShadow: '0 10px 30px rgba(201,168,76,0.3)', padding: '0 8px', textAlign: 'center', lineHeight: 1.2,
          }}
        >
          {loading ? (
            <>
              <span style={{ display: 'inline-block', animation: 'spin 1s linear infinite', fontSize: 22 }}>⏳</span>
              {en ? 'Locating' : 'Localisation'}… ({countdown}s)
            </>
          ) : (
            <>
              <span style={{ fontSize: 26 }}>📍</span>
              {en ? 'Locate me' : 'Localise-moi'}
              <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.8 }}>{en ? 'On the spot' : 'Sur place'}</span>
            </>
          )}
        </button>
        <button
          onClick={planTrip}
          style={{
            height: 84, borderRadius: 16, border: '2px solid rgba(201,168,76,0.55)',
            cursor: 'pointer', background: 'rgba(255,255,255,0.06)', color: 'var(--creme)',
            fontSize: 16, fontWeight: 800, backdropFilter: 'blur(8px)',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6,
            padding: '0 8px', textAlign: 'center', lineHeight: 1.2,
          }}
        >
          <span style={{ fontSize: 26 }}>🧭</span>
          {en ? 'Plan your trip' : 'Organise ton voyage'}
          <span style={{ fontSize: 11, fontWeight: 600, opacity: 0.75 }}>{en ? 'Destinations & guides' : 'Destinations & guides'}</span>
        </button>
      </div>

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
