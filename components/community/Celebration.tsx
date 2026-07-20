'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { BADGES } from '@/lib/community'

// 🎉 Moment de célébration après une contribution (BLOC 2/8).
// Confettis CSS purs (zéro dépendance), framing sadaqa jâriya authentique.
const COLORS = ['#C9A84C', '#1B4332', '#2d6a4f', '#e9dcbe', '#0B1A0F']

export default function Celebration({
  points, badges, impact, spotUrl, onClose, claimCta, en = false,
}: {
  points: number
  badges: string[]
  impact: number
  spotUrl: string
  onClose: () => void
  /* Publication sans compte : bouton « garde tes points » (optionnel) */
  claimCta?: React.ReactNode
  en?: boolean
}) {
  const [confetti] = useState(() => Array.from({ length: 60 }, (_, i) => ({
    left: Math.random() * 100, delay: Math.random() * 0.6, dur: 1.6 + Math.random() * 1.4,
    color: COLORS[i % COLORS.length], size: 6 + Math.random() * 8, rot: Math.random() * 360,
  })))
  useEffect(() => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([60, 40, 60])
  }, [])

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(11,26,15,0.88)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, overflow: 'hidden' }}>
      {confetti.map((c, i) => (
        <span key={i} style={{
          position: 'absolute', top: -20, left: `${c.left}%`, width: c.size, height: c.size * 0.6,
          background: c.color, borderRadius: 2, transform: `rotate(${c.rot}deg)`,
          animation: `vh-confetti ${c.dur}s ${c.delay}s ease-in forwards`,
        }} />
      ))}
      <style>{`@keyframes vh-confetti { to { transform: translateY(105vh) rotate(720deg); opacity: 0.9; } }`}</style>

      <div style={{ background: 'var(--creme, #FDFAF3)', borderRadius: 24, padding: '32px 24px', maxWidth: 420, width: '100%', textAlign: 'center', position: 'relative' }}>
        <div style={{ fontSize: 52, marginBottom: 8 }}>🤲</div>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 900, color: '#0b1a0f', margin: '0 0 8px' }}>
          {en ? 'Barak Allahou fik !' : 'Barak Allahou fik !'}
        </h2>
        <p style={{ fontSize: 16, color: '#1b4332', lineHeight: 1.6, margin: '0 0 16px' }}>
          {en
            ? 'Your spot is live — it will help dozens of travelers find their way. A sadaqa that keeps giving, in shā’ Allāh. 🌱'
            : 'Ton spot est en ligne — il va aider des dizaines de voyageurs. Une sadaqa jâriya qui continue, in shā’ Allāh. 🌱'}
        </p>
        {points > 0 && (
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(201,168,76,0.18)', borderRadius: 999, padding: '10px 18px', marginBottom: 14 }}>
          <span style={{ fontSize: 20 }}>✨</span>
          <span style={{ fontWeight: 800, color: '#8A6D1E', fontSize: 16 }}>+{points} points</span>
        </div>
        )}
        {claimCta}
        {impact > 0 && (
          <p style={{ fontSize: 14, color: '#4b5563', margin: '0 0 12px' }}>
            {en ? `So far, ${impact} Muslims found their way thanks to you.` : `Déjà ${impact} musulmans aidés grâce à toi.`}
          </p>
        )}
        {badges.map((b) => {
          const info = BADGES[b] ?? (b.startsWith('ambassadeur:') ? { icon: '🏙️', fr: `Ambassadeur de ${b.split(':')[2] ?? ''}`, en: `${b.split(':')[2] ?? ''} Ambassador` } : null)
          return info ? (
            <div key={b} style={{ background: '#0b1a0f', borderRadius: 16, padding: '12px 16px', margin: '0 0 10px', animation: 'vh-badge 0.5s ease' }}>
              <style>{`@keyframes vh-badge { from { transform: scale(0.6); opacity: 0; } to { transform: scale(1); opacity: 1; } }`}</style>
              <span style={{ fontSize: 22, marginRight: 8 }}>{info.icon}</span>
              <span style={{ color: '#C9A84C', fontWeight: 800, fontSize: 15 }}>{en ? 'Badge unlocked:' : 'Badge débloqué :'} {en ? info.en : info.fr}</span>
            </div>
          ) : null
        })}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 8 }}>
          <Link href={spotUrl} style={{ display: 'block', minHeight: 56, lineHeight: '56px', borderRadius: 18, background: 'var(--foret, #1B4332)', color: '#fff', fontWeight: 800, fontSize: 16, textDecoration: 'none' }}>
            {en ? 'See my spot →' : 'Voir mon spot →'}
          </Link>
          <button onClick={onClose} style={{ minHeight: 56, borderRadius: 18, border: '1.5px solid rgba(27,67,50,0.3)', background: 'transparent', color: '#1b4332', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            {en ? '+ Add another spot' : '+ Ajouter un autre spot'}
          </button>
        </div>
      </div>
    </div>
  )
}
