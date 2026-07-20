'use client'
import { useEffect, useRef, useState } from 'react'

// Connexion légère (bottom sheet). Méthode PRINCIPALE : « Continuer avec
// Google » (1 tap, zéro spam). Secours : email → code 6 chiffres → pseudo.
declare global {
  interface Window {
    google?: { accounts: { id: {
      initialize: (cfg: { client_id: string; callback: (r: { credential: string }) => void }) => void
      renderButton: (el: HTMLElement, cfg: Record<string, unknown>) => void
    } } }
  }
}

const GOOGLE_CLIENT_ID = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID

export default function AuthSheet({
  open, onClose, onDone, sendCode, verify, googleLogin, en = false,
}: {
  open: boolean
  onClose: () => void
  onDone: () => void
  sendCode: (email: string) => Promise<void>
  verify: (email: string, code: string, pseudo: string) => Promise<unknown>
  googleLogin?: (credential: string) => Promise<unknown>
  en?: boolean
}) {
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const googleBtn = useRef<HTMLDivElement>(null)

  // Bouton Google officiel (GIS) — rendu quand la sheet s'ouvre
  useEffect(() => {
    if (!open || !GOOGLE_CLIENT_ID || !googleLogin) return
    let cancelled = false
    const render = () => {
      if (cancelled || !window.google || !googleBtn.current || googleBtn.current.childElementCount > 0) return
      window.google.accounts.id.initialize({
        client_id: GOOGLE_CLIENT_ID,
        callback: async (resp) => {
          setBusy(true); setErr('')
          try { await googleLogin(resp.credential); onDone() }
          catch (ex) { setErr(String((ex as Error).message)) }
          finally { setBusy(false) }
        },
      })
      window.google.accounts.id.renderButton(googleBtn.current, {
        theme: 'outline', size: 'large', shape: 'pill', width: 300,
        text: 'continue_with', locale: en ? 'en' : 'fr',
      })
    }
    if (window.google) { render(); return }
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.onload = render
    document.head.appendChild(s)
    return () => { cancelled = true }
  }, [open, en, googleLogin, onDone])

  if (!open) return null

  const input = { width: '100%', padding: '16px', borderRadius: 14, border: '1.5px solid rgba(27,67,50,0.25)', fontSize: 16, background: '#fff' } as const
  const btn = { width: '100%', minHeight: 56, borderRadius: 18, border: 'none', background: 'var(--foret)', color: '#fff', fontWeight: 800, fontSize: 16, cursor: 'pointer' } as const

  return (
    <div onClick={onClose} style={{ position: 'fixed', inset: 0, zIndex: 300, background: 'rgba(11,26,15,0.6)' }}>
      <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: 'var(--creme, #FDFAF3)', borderRadius: '24px 24px 0 0', padding: '24px 20px calc(env(safe-area-inset-bottom, 0px) + 24px)', maxWidth: 480, margin: '0 auto' }}>
        <p style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, color: '#0b1a0f', margin: '0 0 4px' }}>
          {step === 'email' ? (en ? 'Join the community 🤝' : 'Rejoins la communauté 🤝') : (en ? 'Your code 📬' : 'Ton code 📬')}
        </p>
        <p style={{ fontSize: 14, color: '#4b5563', margin: '0 0 16px' }}>
          {step === 'email'
            ? (en ? 'One tap with Google — or an email code. No password, ever.' : 'Un tap avec Google — ou un code par email. Jamais de mot de passe.')
            : (en ? `Code sent to ${email}` : `Code envoyé à ${email}`)}
        </p>

        {/* Méthode principale : Google (1 tap) */}
        {step === 'email' && GOOGLE_CLIENT_ID && googleLogin && (
          <>
            <div ref={googleBtn} style={{ display: 'flex', justifyContent: 'center', minHeight: 44, marginBottom: 14 }} />
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, margin: '0 0 14px' }}>
              <span style={{ flex: 1, height: 1, background: 'rgba(27,67,50,0.15)' }} />
              <span style={{ fontSize: 13, color: '#9ca3af' }}>{en ? 'or get a code by email' : 'ou reçois un code par email'}</span>
              <span style={{ flex: 1, height: 1, background: 'rgba(27,67,50,0.15)' }} />
            </div>
          </>
        )}

        {step === 'email' ? (
          <form onSubmit={async (e) => {
            e.preventDefault(); setBusy(true); setErr('')
            try { await sendCode(email); setStep('code') } catch (ex) { setErr(String((ex as Error).message)) } finally { setBusy(false) }
          }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)} placeholder={en ? 'your@email.com' : 'ton@email.com'} style={input} />
            <button type="submit" disabled={busy} style={btn}>{busy ? '…' : (en ? 'Get my code' : 'Recevoir mon code')}</button>
          </form>
        ) : (
          <form onSubmit={async (e) => {
            e.preventDefault(); setBusy(true); setErr('')
            try { await verify(email, code, pseudo); onDone() } catch (ex) { setErr(String((ex as Error).message)) } finally { setBusy(false) }
          }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input inputMode="numeric" pattern="[0-9]{6}" maxLength={6} required autoFocus value={code} onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
              placeholder="123456" style={{ ...input, textAlign: 'center', letterSpacing: 8, fontSize: 24, fontWeight: 800 }} />
            <input value={pseudo} onChange={(e) => setPseudo(e.target.value)} maxLength={24}
              placeholder={en ? 'Your nickname (e.g. Ahmed75)' : 'Ton pseudo (ex. Ahmed75)'} style={input} />
            <button type="submit" disabled={busy || code.length !== 6} style={btn}>{busy ? '…' : (en ? "Let's go ✨" : 'C\'est parti ✨')}</button>
            <p style={{ fontSize: 13, color: '#6b7280', margin: 0, textAlign: 'center' }}>
              {en ? 'Nothing after 1 min? Check your spam folder.' : 'Rien après 1 min ? Regarde dans tes spams.'}
            </p>
            <button type="button" onClick={() => setStep('email')} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 14, cursor: 'pointer', minHeight: 44 }}>
              ← {en ? 'Change email' : 'Changer d\'email'}
            </button>
          </form>
        )}
        {err && <p style={{ color: '#b91c1c', fontSize: 14, marginTop: 10 }}>{err}</p>}
        <p style={{ fontSize: 12, color: '#9ca3af', marginTop: 12, textAlign: 'center' }}>
          {en ? 'No spam, ever. Your email stays private.' : 'Jamais de spam. Ton email reste privé.'}
        </p>
      </div>
    </div>
  )
}
