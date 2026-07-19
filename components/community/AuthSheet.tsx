'use client'
import { useState } from 'react'

// Connexion légère (bottom sheet) : email → code 6 chiffres → pseudo. 3 champs max.
export default function AuthSheet({
  open, onClose, onDone, sendCode, verify, en = false,
}: {
  open: boolean
  onClose: () => void
  onDone: () => void
  sendCode: (email: string) => Promise<void>
  verify: (email: string, code: string, pseudo: string) => Promise<unknown>
  en?: boolean
}) {
  const [step, setStep] = useState<'email' | 'code'>('email')
  const [email, setEmail] = useState('')
  const [code, setCode] = useState('')
  const [pseudo, setPseudo] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')

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
            ? (en ? 'One email, one code — 20 seconds, no password.' : 'Un email, un code — 20 secondes, pas de mot de passe.')
            : (en ? `Code sent to ${email}` : `Code envoyé à ${email}`)}
        </p>

        {step === 'email' ? (
          <form onSubmit={async (e) => {
            e.preventDefault(); setBusy(true); setErr('')
            try { await sendCode(email); setStep('code') } catch (ex) { setErr(String((ex as Error).message)) } finally { setBusy(false) }
          }} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <input type="email" required autoFocus value={email} onChange={(e) => setEmail(e.target.value)} placeholder={en ? 'your@email.com' : 'ton@email.com'} style={input} />
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
