'use client'
import { useState } from 'react'

// Le HalalScore n'a de valeur que s'il est EXPLICABLE. Un chiffre posé sur
// une photo, personne n'y croit — et il a raison de ne pas y croire. Au
// clic, on montre les chiffres réels d'où il sort (mosquées, restaurants
// halal recensés, part de population musulmane), et on dit franchement
// qu'il vient de nos données, pas d'une certification.
export function HalalScoreBadge({
  score,
  ville,
  stats,
}: {
  score: number
  ville?: string
  stats?: { mosquees?: number; restaurants?: number; hotels?: number; pctMusulmans?: number }
}) {
  const [ouvert, setOuvert] = useState(false)
  const lignes = [
    stats?.mosquees ? `🕌 ${stats.mosquees} mosquées recensées` : null,
    stats?.restaurants ? `🍽 ${stats.restaurants} restaurants halal recensés` : null,
    stats?.hotels ? `🏨 ${stats.hotels} hébergements` : null,
    stats?.pctMusulmans ? `👥 ${stats.pctMusulmans} % de population musulmane` : null,
  ].filter(Boolean) as string[]

  const badge = (
    <>
      <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3BD17A', display: 'block', animation: 'pulse-green 2s ease-in-out infinite' }} />
      <span style={{ color: 'var(--or-clair)', fontSize: '12.5px', fontWeight: 700 }}>Halal {score}/10</span>
    </>
  )
  const style: React.CSSProperties = {
    background: 'rgba(201,168,76,0.16)', border: '1px solid rgba(201,168,76,0.6)',
    borderRadius: '30px', padding: '7px 13px', backdropFilter: 'blur(6px)',
    display: 'flex', alignItems: 'center', gap: '7px', minHeight: 36,
  }

  if (!lignes.length) return <div style={style}>{badge}</div>

  return (
    <>
      <button onClick={() => setOuvert(true)} style={{ ...style, cursor: 'pointer' }} aria-label="D'où vient ce score ?">
        {badge}
        <span style={{ color: 'var(--or-clair)', fontSize: 12, opacity: 0.75 }}>ⓘ</span>
      </button>
      {ouvert && (
        <div onClick={() => setOuvert(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(11,26,15,0.7)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, maxWidth: 380, width: '100%', padding: 22, textAlign: 'left' }}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 19, color: 'var(--nuit)', margin: '0 0 10px' }}>
              HalalScore {score}/10{ville ? ` — ${ville}` : ''}
            </p>
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 14px' }}>
              {lignes.map((l) => (
                <li key={l} style={{ fontSize: 14, color: 'var(--texte)', padding: '6px 0', borderBottom: '1px solid rgba(11,26,15,0.06)' }}>{l}</li>
              ))}
            </ul>
            <p style={{ fontSize: 12.5, color: 'var(--texte-2)', lineHeight: 1.6, margin: '0 0 14px' }}>
              Note calculée à partir de nos données (OpenStreetMap + relevés maison). Ce n&apos;est pas une certification :
              vérifiez toujours sur place.
            </p>
            <button onClick={() => setOuvert(false)} style={{ width: '100%', minHeight: 46, borderRadius: 12, border: 'none', background: 'var(--foret)', color: 'var(--creme)', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
              Compris
            </button>
          </div>
        </div>
      )}
    </>
  )
}
