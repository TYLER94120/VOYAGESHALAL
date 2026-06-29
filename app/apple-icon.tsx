import { ImageResponse } from 'next/og'

export const size = { width: 180, height: 180 }
export const contentType = 'image/png'

// Icône iOS « Ajouter à l'écran d'accueil » : étoile dorée (SVG) + nom sur fond vert nuit
export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', background: '#0b1a0f',
        }}
      >
        <svg width="96" height="96" viewBox="0 0 100 100">
          <path d="M50 4 L60 40 L96 50 L60 60 L50 96 L40 60 L4 50 L40 40 Z" fill="#c9a84c" />
        </svg>
        <div style={{ fontSize: 24, color: '#f3ece0', fontWeight: 700, marginTop: 8 }}>Halal</div>
      </div>
    ),
    size
  )
}
