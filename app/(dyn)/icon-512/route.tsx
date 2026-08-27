import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'

// Icône PWA 512×512 (référencée par le manifest, sert aussi de maskable)
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', background: '#0b1a0f',
        }}
      >
        <svg width="300" height="300" viewBox="0 0 100 100">
          <path d="M50 4 L60 40 L96 50 L60 60 L50 96 L40 60 L4 50 L40 40 Z" fill="#c9a84c" />
        </svg>
        <div style={{ fontSize: 76, color: '#f3ece0', fontWeight: 700, marginTop: 14 }}>Halal</div>
      </div>
    ),
    { width: 512, height: 512 }
  )
}
