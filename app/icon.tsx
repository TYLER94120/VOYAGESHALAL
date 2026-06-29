import { ImageResponse } from 'next/og'

export const size = { width: 64, height: 64 }
export const contentType = 'image/png'

// Favicon généré : étoile dorée (SVG, sans dépendance de police) sur fond vert nuit
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', alignItems: 'center',
          justifyContent: 'center', background: '#0b1a0f',
        }}
      >
        <svg width="44" height="44" viewBox="0 0 100 100">
          <path d="M50 4 L60 40 L96 50 L60 60 L50 96 L40 60 L4 50 L40 40 Z" fill="#c9a84c" />
        </svg>
      </div>
    ),
    size
  )
}
