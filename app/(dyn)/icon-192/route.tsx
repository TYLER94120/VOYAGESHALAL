import { ImageResponse } from 'next/og'

export const runtime = 'nodejs'

// Icône PWA 192×192 (référencée par le manifest)
export function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%', height: '100%', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', background: '#0b1a0f',
        }}
      >
        <svg width="108" height="108" viewBox="0 0 100 100">
          <path d="M50 4 L60 40 L96 50 L60 60 L50 96 L40 60 L4 50 L40 40 Z" fill="#c9a84c" />
        </svg>
        <div style={{ fontSize: 28, color: '#f3ece0', fontWeight: 700, marginTop: 8 }}>Halal</div>
      </div>
    ),
    { width: 192, height: 192 }
  )
}
