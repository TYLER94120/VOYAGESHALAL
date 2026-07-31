'use client'
import { useState } from 'react'

// 👋 Salam de passage — « tu ne voyages pas seul ». Un tap, pas de texte,
// pas de compte requis. Affiche les derniers passants.
interface Salam { pseudo: string; date: string }

export default function SalamBar({ spotId, initial, en = false }: { spotId: string; initial: Salam[]; en?: boolean }) {
  const [salams, setSalams] = useState<Salam[]>(initial)
  const [sent, setSent] = useState(false)
  const [busy, setBusy] = useState(false)

  const envoyer = async () => {
    if (sent || busy) return
    setBusy(true)
    try {
      const token = localStorage.getItem('vh_token')
      const r = await fetch('/api/community/salam', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ spotId }),
      })
      const j = await r.json()
      if (r.ok) { setSent(true); if (j.salams) setSalams(j.salams) }
    } catch { /* réseau */ } finally { setBusy(false) }
  }

  const noms = salams.slice(0, 3).map((s) => s.pseudo)
  const reste = Math.max(0, salams.length - 3)

  return (
    <div style={{ background: '#fff', border: '1px solid rgba(27,67,50,0.12)', borderRadius: 16, padding: '14px 16px', margin: '10px 0 6px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <p style={{ flex: 1, minWidth: 170, margin: 0, fontSize: 14.5, color: '#374151', lineHeight: 1.5 }}>
          {salams.length === 0
            ? (en ? 'Passed by here? Leave a salam — you never travel alone 🤍' : 'Passé par ici ? Laisse un salam — on ne voyage jamais seul 🤍')
            : (en
              ? <>👋 Salam from <strong>{noms.join(', ')}</strong>{reste > 0 ? ` and ${reste} other traveler${reste > 1 ? 's' : ''}` : ''}</>
              : <>👋 Salam de <strong>{noms.join(', ')}</strong>{reste > 0 ? ` et ${reste} autre${reste > 1 ? 's' : ''} voyageur${reste > 1 ? 's' : ''}` : ''}</>)}
        </p>
        <button onClick={envoyer} disabled={sent || busy}
          style={{ minHeight: 48, padding: '0 18px', borderRadius: 999, border: sent ? 'none' : '1.5px solid rgba(27,67,50,0.3)', background: sent ? 'rgba(59,209,122,0.15)' : '#fff', color: sent ? '#1a6b3c' : '#1b4332', fontWeight: 800, fontSize: 14, cursor: sent ? 'default' : 'pointer' }}>
          {sent ? (en ? '👋 Salam sent!' : '👋 Salam envoyé !') : (en ? '👋 Leave a salam' : '👋 Laisser un salam')}
        </button>
      </div>
    </div>
  )
}
