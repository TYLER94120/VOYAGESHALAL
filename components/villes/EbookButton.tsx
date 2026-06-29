'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import { generateEbook } from '@/lib/ebook'

// Bouton « Guide PDF gratuit » → pop-up email (RGPD) → stockage email + téléchargement instantané.
export default function EbookButton({ ville }: { ville: any }) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [consent, setConsent] = useState(false)
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'error'>('idle')
  const [msg, setMsg] = useState('')

  const brand = typeof window !== 'undefined' && window.location.hostname.includes('gohalaltravel') ? 'GoHalalTravel' : 'VoyagesHalal.fr'
  const siteUrl = brand === 'GoHalalTravel' ? 'https://www.gohalaltravel.com' : 'https://www.voyageshalal.fr'

  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !consent) { setMsg('Email et consentement requis.'); return }
    setStatus('loading'); setMsg('')
    try {
      await fetch('/api/waitlist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'ebook', city: ville.slug }),
      }).catch(() => {})
      await generateEbook(ville, brand, siteUrl)
      setStatus('done'); setMsg('✅ Téléchargement lancé ! Bon voyage 🤲')
      setTimeout(() => setOpen(false), 1800)
    } catch {
      setStatus('error'); setMsg('Une erreur est survenue. Réessaie.')
    }
  }

  return (
    <>
      <button onClick={() => setOpen(true)} className="ville-action ville-action-primary" style={{ cursor: 'pointer' }}>
        <span className="ico">📖</span>Guide PDF gratuit
      </button>

      {open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(11,26,15,0.7)', zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fff', borderRadius: 20, maxWidth: 420, width: '100%', padding: 26, boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ fontSize: 40, textAlign: 'center', marginBottom: 6 }}>📖</div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, color: 'var(--nuit)', fontSize: 21, textAlign: 'center', margin: '0 0 6px' }}>Guide Halal {ville.nom} — gratuit</h3>
            <p style={{ color: 'var(--texte-2)', fontSize: 13.5, textAlign: 'center', lineHeight: 1.6, margin: '0 0 18px' }}>
              Restaurants, mosquées, à voir + <strong>3 road trips</strong> (famille / amis / solo). Reçois-le en PDF tout de suite.
            </p>
            {status === 'done' ? (
              <p style={{ textAlign: 'center', color: '#16a34a', fontWeight: 700, padding: '14px 0' }}>{msg}</p>
            ) : (
              <form onSubmit={submit}>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ton@email.com"
                  style={{ width: '100%', padding: '14px 16px', borderRadius: 12, border: '1.5px solid rgba(27,67,50,0.3)', fontSize: 15, marginBottom: 12, boxSizing: 'border-box' }} />
                <label style={{ display: 'flex', gap: 9, alignItems: 'flex-start', fontSize: 12, color: 'var(--texte-2)', marginBottom: 14, cursor: 'pointer' }}>
                  <input type="checkbox" checked={consent} onChange={(e) => setConsent(e.target.checked)} style={{ marginTop: 2 }} />
                  <span>J&apos;accepte de recevoir des conseils voyage halal par email. (Désinscription à tout moment.)</span>
                </label>
                {msg && <p style={{ color: '#b91c1c', fontSize: 12.5, margin: '0 0 10px' }}>{msg}</p>}
                <button type="submit" disabled={status === 'loading'} style={{ width: '100%', padding: 15, borderRadius: 12, border: 'none', background: 'var(--or)', color: 'var(--nuit)', fontWeight: 800, fontSize: 15.5, cursor: 'pointer' }}>
                  {status === 'loading' ? 'Préparation…' : '⬇️ Télécharger mon guide gratuit'}
                </button>
                <button type="button" onClick={() => setOpen(false)} style={{ width: '100%', marginTop: 8, padding: 8, background: 'none', border: 'none', color: 'var(--texte-2)', fontSize: 13, cursor: 'pointer' }}>Plus tard</button>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  )
}
