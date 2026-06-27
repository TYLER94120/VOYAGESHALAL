'use client'
import { useState } from 'react'

export function QiblaCalculator() {
  const [direction, setDirection] = useState<number | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const calculer = () => {
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
            <div className="qibla-arrow" style={{ transform: `rotate(${direction}deg)` }}>
              🕌
            </div>
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
      )}
    </div>
  )
}
