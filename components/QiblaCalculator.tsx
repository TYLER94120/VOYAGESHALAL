'use client'
import { useState } from 'react'

export function QiblaCalculator() {
  const [direction, setDirection] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const calculer = () => {
    console.log('bouton cliqué')
    setLoading(true)
    setError('')
    setDirection(null)

    if (!navigator.geolocation) {
      setError("La géolocalisation n'est pas disponible sur ce navigateur.")
      setLoading(false)
      return
    }

    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        try {
          const { latitude, longitude } = pos.coords
          const res = await fetch(`https://api.aladhan.com/v1/qibla/${latitude}/${longitude}`)
          const data = await res.json()
          if (data.code === 200 && data.data?.direction != null) {
            setDirection(Math.round(data.data.direction))
          } else {
            setError('Impossible de calculer la direction. Réessayez.')
          }
        } catch {
          setError('Erreur de connexion. Vérifiez votre internet et réessayez.')
        }
        setLoading(false)
      },
      (err) => {
        if (err.code === 1) {
          setError(
            'Accès à la position refusé. Autorisez la géolocalisation dans votre navigateur puis réessayez.'
          )
        } else {
          setError('Position introuvable. Réessayez dans quelques secondes.')
        }
        setLoading(false)
      },
      { timeout: 10000, maximumAge: 60000 }
    )
  }

  return (
    <div className="qibla-container">
      <h2>🧭 Direction de la Qibla</h2>
      <p>Trouvez la direction exacte vers La Mecque depuis votre position actuelle</p>

      {direction === null && (
        <button onClick={calculer} disabled={loading} className="btn-qibla-primary">
          {loading ? '📡 Calcul en cours...' : '📍 Trouver la Qibla depuis ma position'}
        </button>
      )}

      {error && (
        <div className="qibla-error">
          <p>⚠️ {error}</p>
          <button onClick={calculer} className="btn-retry">
            🔄 Réessayer
          </button>
        </div>
      )}

      {direction !== null && (
        <div className="qibla-result">
          <div className="compass-rose">
            <span className="compass-n">N</span>
            <span className="compass-s">S</span>
            <span className="compass-e">E</span>
            <span className="compass-w">O</span>
            {/* Aiguille SVG animée vers la Qibla */}
            <svg
              viewBox="0 0 160 160"
              className="qibla-needle"
              style={{ transform: `rotate(${direction}deg)` }}
            >
              <defs>
                <linearGradient id="needleGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#c9a84c" />
                  <stop offset="55%" stopColor="#c9a84c" />
                  <stop offset="55%" stopColor="#1b4332" />
                  <stop offset="100%" stopColor="#1b4332" />
                </linearGradient>
              </defs>
              <polygon points="80,16 90,80 80,96 70,80" fill="url(#needleGrad)" />
              <circle cx="80" cy="80" r="7" fill="#0b1a0f" stroke="#c9a84c" strokeWidth="2" />
            </svg>
            <span className="qibla-kaaba" style={{ transform: `rotate(${direction}deg) translateY(-66px)` }}>🕋</span>
          </div>
          <div className="qibla-info">
            <div className="qibla-angle">{direction}°</div>
            <div className="qibla-label">depuis le Nord (sens horaire)</div>
            <p className="qibla-instruction">
              Orientez-vous vers le Nord, puis tournez de <strong>{direction}°</strong> vers la
              droite.
              <br />
              La Kaaba se trouve dans cette direction. بسم الله
            </p>
          </div>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            <a
              href={`https://wa.me/?text=${encodeURIComponent(`🧭 Direction de la Qibla : ${direction}° depuis le Nord. Trouvez la vôtre sur VoyagesHalal.fr/qibla`)}`}
              target="_blank"
              rel="noopener noreferrer"
              className="btn-qibla-whatsapp"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51l-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
              </svg>
              Partager sur WhatsApp
            </a>
            <button
              onClick={() => {
                setDirection(null)
                setError('')
              }}
              className="btn-recalculate"
            >
              🔄 Recalculer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default QiblaCalculator
