'use client'
// Bouton Itinéraire avec beacon d'usage (« X voyageurs y sont allés »)
export default function ItineraireButton({ spotId, lat, lng, en = false }: { spotId: string; lat: number; lng: number; en?: boolean }) {
  return (
    <a
      href={`https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`}
      target="_blank" rel="noopener noreferrer"
      onClick={() => {
        try {
          navigator.sendBeacon?.('/api/community/itineraire', new Blob([JSON.stringify({ spotId })], { type: 'application/json' }))
            || fetch('/api/community/itineraire', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ spotId }), keepalive: true })
        } catch { /* best-effort */ }
      }}
      style={{ display: 'block', textAlign: 'center', minHeight: 56, lineHeight: '56px', borderRadius: 18, background: '#fff', border: '1.5px solid rgba(27,67,50,0.3)', color: '#1b4332', fontWeight: 800, fontSize: 15, textDecoration: 'none', marginBottom: 18 }}>
      🗺 {en ? 'Google Maps directions' : 'Itinéraire Google Maps'}
    </a>
  )
}
