'use client'
import { useState } from 'react'
import { PRIX_BUCKETS, prixResume } from '@/lib/community'

// 💶 « L'addition, s'il te plaît » — le prix réellement payé par personne,
// voté en 1 tap. Fourchette médiane affichée, jamais un chiffre inventé.
export default function PrixSpot({ spotId, votes, en = false, dark = false }: { spotId: string; votes?: Record<string, number>; en?: boolean; dark?: boolean }) {
  const [local, setLocal] = useState<Record<string, number> | undefined>(votes)
  const [done, setDone] = useState(false)
  const [open, setOpen] = useState(false)
  const resume = prixResume(local, en)

  const voter = async (bucket: string) => {
    setDone(true); setOpen(false)
    setLocal((v) => ({ ...(v ?? {}), [bucket]: ((v ?? {})[bucket] ?? 0) + 1 }))
    try {
      const token = localStorage.getItem('vh_token')
      const r = await fetch('/api/community/prix', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ spotId, bucket }),
      })
      const j = await r.json()
      if (r.ok && j.prixVotes) setLocal(j.prixVotes)
    } catch { /* le vote local reste affiché */ }
  }

  const fg = dark ? '#fdfaf3' : '#1b4332'
  const sub = dark ? 'rgba(253,250,243,0.6)' : '#6b7280'
  const border = dark ? 'rgba(201,168,76,0.4)' : 'rgba(27,67,50,0.25)'

  return (
    <div style={{ margin: '8px 0 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
        {resume && (
          <span style={{ fontWeight: 800, fontSize: 13.5, color: fg }}>
            💶 ~{resume.label}/{en ? 'pers' : 'pers'} <span style={{ color: sub, fontWeight: 600, fontSize: 12.5 }}>· {en ? `${resume.n} traveler${resume.n > 1 ? 's' : ''}` : `selon ${resume.n} voyageur${resume.n > 1 ? 's' : ''}`}</span>
          </span>
        )}
        {!done && !open && (
          <button onClick={() => setOpen(true)} style={{ minHeight: 38, padding: '0 12px', borderRadius: 999, border: `1.5px solid ${border}`, background: 'transparent', color: fg, fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
            💶 {en ? 'How much did you pay?' : 'T\'as payé combien ?'}
          </button>
        )}
        {done && <span style={{ fontSize: 12.5, color: sub, fontWeight: 700 }}>✓ {en ? 'thanks!' : 'merci !'}</span>}
      </div>
      {open && (
        <div style={{ display: 'flex', gap: 6, marginTop: 8, flexWrap: 'wrap' }}>
          {PRIX_BUCKETS.map((b) => (
            <button key={b.id} onClick={() => voter(b.id)}
              style={{ minHeight: 42, padding: '0 14px', borderRadius: 999, border: `1.5px solid ${border}`, background: 'transparent', color: fg, fontWeight: 800, fontSize: 13.5, cursor: 'pointer' }}>
              {en ? b.en : b.fr}
            </button>
          ))}
          <span style={{ alignSelf: 'center', fontSize: 11.5, color: sub }}>{en ? 'per person' : 'par personne'}</span>
        </div>
      )}
    </div>
  )
}
