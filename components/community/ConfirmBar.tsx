'use client'
import { useState } from 'react'
import { useCommunity, authFetch } from '@/lib/useCommunity'
import AuthSheet from '@/components/community/AuthSheet'
import { useLanguage } from '@/components/i18n/LanguageProvider'

// BLOC 3 — confiance façon Waze : Confirmer / Toujours là ? / Signaler.
export default function ConfirmBar({ spotId, confirmations }: { spotId: string; confirmations: number }) {
  const { lang } = useLanguage()
  const en = lang === 'en'
  const { me, sendCode, verify, googleLogin } = useCommunity()
  const [n, setN] = useState(confirmations)
  const [msg, setMsg] = useState('')
  const [authOpen, setAuthOpen] = useState(false)
  const [pending, setPending] = useState<'confirm' | 'report' | null>(null)

  const doAction = async (action: 'confirm' | 'report') => {
    if (!me) { setPending(action); setAuthOpen(true); return }
    try {
      const r = await authFetch(`/api/community/${action}`, { method: 'POST', body: JSON.stringify({ spotId }) })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Erreur')
      if (action === 'confirm') {
        if (j.deja) setMsg(en ? 'You already confirmed this spot ✓' : 'Tu as déjà confirmé ce spot ✓')
        else { setN(j.confirmations ?? n + 1); setMsg(en ? 'Barak Allahou fik ! +2 pts ✨' : 'Barak Allahou fik ! +2 pts ✨') }
      } else {
        setMsg(en ? 'Thanks — our team will check.' : 'Merci — notre équipe va vérifier.')
      }
    } catch (ex) { setMsg(String((ex as Error).message)) }
  }

  const big = { flex: 1, minHeight: 56, borderRadius: 16, border: 'none', fontWeight: 800, fontSize: 15, cursor: 'pointer' } as const

  return (
    <div style={{ margin: '18px 0' }}>
      <p style={{ fontSize: 15, fontWeight: 700, color: n > 0 ? '#1a6b3c' : '#8A6D1E', margin: '0 0 10px' }}>
        {n > 0
          ? `✅ ${n} ${en ? (n > 1 ? 'travelers confirm' : 'traveler confirms') : (n > 1 ? 'voyageurs confirment' : 'voyageur confirme')}`
          : (en ? '🕓 Shared by the community · to confirm' : '🕓 Partagé par la communauté · à confirmer')}
      </p>
      <div style={{ display: 'flex', gap: 10 }}>
        <button onClick={() => void doAction('confirm')} style={{ ...big, background: 'var(--foret, #1B4332)', color: '#fff' }}>
          ✅ {en ? 'Still there? Confirm' : 'Toujours là ? Je confirme'}
        </button>
        <button onClick={() => void doAction('report')} aria-label={en ? 'Report' : 'Signaler'}
          style={{ minWidth: 56, minHeight: 56, borderRadius: 16, border: '1.5px solid rgba(185,28,28,0.35)', background: '#fff', color: '#b91c1c', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
          🚩
        </button>
      </div>
      {msg && <p style={{ fontSize: 14, color: '#1b4332', marginTop: 10, fontWeight: 600 }}>{msg}</p>}
      <AuthSheet open={authOpen} onClose={() => setAuthOpen(false)}
        onDone={() => { setAuthOpen(false); if (pending) void doAction(pending) }}
        sendCode={sendCode} verify={verify} googleLogin={googleLogin} en={en} />
    </div>
  )
}
