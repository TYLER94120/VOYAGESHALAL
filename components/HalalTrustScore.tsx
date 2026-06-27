'use client'

import type { HalalScore } from '@/lib/villeTypes'

interface ScoreProps {
  score: HalalScore
  compact?: boolean
}

export function HalalTrustScore({ score, compact = false }: ScoreProps) {
  const getBadgeColor = (badge: string) => {
    if (badge.includes('EXCELLENCE')) return { bg: '#166534', text: '#86efac', border: '#15803d' }
    if (badge.includes('VÉRIFIÉ')) return { bg: '#14532d', text: '#4ade80', border: '#16a34a' }
    if (badge.includes('DÉCLARÉ')) return { bg: '#713f12', text: '#fbbf24', border: '#ca8a04' }
    return { bg: '#1e1b4b', text: '#a5b4fc', border: '#4338ca' }
  }

  const colors = getBadgeColor(score.badge)
  const scorePercent = (score.global / 10) * 100

  if (compact) {
    return (
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: '6px',
          background: colors.bg,
          border: `1px solid ${colors.border}`,
          borderRadius: '20px',
          padding: '3px 10px',
        }}
      >
        <span style={{ fontSize: '12px', fontWeight: 800, color: colors.text }}>
          {score.global.toFixed(1)} ★
        </span>
        <span style={{ fontSize: '10px', color: colors.text, opacity: 0.8 }}>Halal Score</span>
      </div>
    )
  }

  return (
    <div className="halal-trust-card">
      <div className="htc-header" style={{ background: colors.bg, borderColor: colors.border }}>
        <div className="htc-badge" style={{ color: colors.text }}>
          {score.badge.includes('EXCELLENCE') && '🏆'}
          {score.badge.includes('VÉRIFIÉ') && '✅'}
          {score.badge.includes('DÉCLARÉ') && '⚠️'}
          {score.badge.includes('VÉRIFIER') && 'ℹ️'} {score.badge}
        </div>
        <div className="htc-score" style={{ color: colors.text }}>
          {score.global.toFixed(1)}
          <span>/10</span>
        </div>
      </div>

      <div className="htc-bar-container">
        <div
          className="htc-bar"
          style={{
            width: `${scorePercent}%`,
            background:
              score.global >= 9
                ? '#4ade80'
                : score.global >= 7.5
                ? '#86efac'
                : score.global >= 6
                ? '#fbbf24'
                : '#f87171',
          }}
        />
      </div>

      <div className="htc-details">
        <div className="htc-item">
          <span>{score.sourceViande >= 4 ? '✅' : score.sourceViande >= 2 ? '⚠️' : '❓'}</span>
          <span>Source viande tracée</span>
          <span className="htc-points">{score.sourceViande}/5 pts</span>
        </div>
        <div className="htc-item">
          <span>{score.certifie ? '✅' : '❌'}</span>
          <span>
            Certification officielle
            {score.organisationCertification ? ` (${score.organisationCertification})` : ''}
          </span>
        </div>
        <div className="htc-item">
          <span>{score.sansAlcool ? '✅' : '❌'}</span>
          <span>Zéro alcool sur place</span>
        </div>
        <div className="htc-item">
          <span>{score.proprietaireMusulman ? '✅' : '❓'}</span>
          <span>Propriétaire/gérant musulman</span>
        </div>
        <div className="htc-item">
          <span>👥</span>
          <span>{score.avisMusulmans.toLocaleString('fr-FR')} avis de voyageurs musulmans</span>
        </div>
        <div className="htc-item">
          <span>🗓️</span>
          <span>Dernière vérification : {score.derniereVerification}</span>
        </div>
      </div>
    </div>
  )
}
