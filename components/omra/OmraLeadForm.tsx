'use client'
import { useState, type FormEvent } from 'react'
import { track } from '@vercel/analytics'

// Formulaire de demande de devis Omra/Hajj — revenu n°2 du business plan.
// Lead qualifié → /api/omra-lead (Redis + Formspree). Chaque envoi est tracké.
export default function OmraLeadForm() {
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')
  const [form, setForm] = useState({ name: '', email: '', phone: '', departureCity: '', period: '', travelers: '2', budget: '', type: 'omra' })

  const set = (k: string, v: string) => setForm((f) => ({ ...f, [k]: v }))

  async function submit(e: FormEvent) {
    e.preventDefault()
    if (!form.email || status === 'loading') return
    setStatus('loading')
    try {
      const res = await fetch('/api/omra-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(form),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setMessage(data.message || 'Demande envoyée !')
        track('omra_lead_submit', { type: form.type, budget: form.budget || 'na' })
      } else {
        setStatus('error'); setMessage(data.error || 'Une erreur est survenue.')
      }
    } catch {
      setStatus('error'); setMessage('Impossible de contacter le serveur. Réessayez.')
    }
  }

  const inputStyle: React.CSSProperties = { width: '100%', padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(27,67,50,0.2)', fontSize: 15, background: '#fff', color: '#1a1a1a' }
  const labelStyle: React.CSSProperties = { fontSize: 13, fontWeight: 700, color: 'var(--foret, #1b4332)', marginBottom: 6, display: 'block' }

  if (status === 'success') {
    return (
      <div style={{ background: '#fff', border: '1px solid rgba(27,67,50,0.15)', borderRadius: 18, padding: '32px 24px', textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 10 }}>🕋</div>
        <p style={{ fontWeight: 800, fontSize: 18, color: 'var(--foret, #1b4332)', margin: '0 0 6px' }}>{message}</p>
        <p style={{ color: '#6b7280', fontSize: 14, margin: 0 }}>Vous recevrez plusieurs propositions d’agences partenaires, sans engagement.</p>
      </div>
    )
  }

  return (
    <form onSubmit={submit} style={{ background: '#fff', border: '1px solid rgba(27,67,50,0.12)', borderRadius: 18, padding: '24px', display: 'grid', gap: 14 }}>
      <div style={{ display: 'flex', gap: 8 }}>
        {(['omra', 'hajj'] as const).map((tp) => (
          <button key={tp} type="button" onClick={() => set('type', tp)}
            style={{ flex: 1, padding: '10px', borderRadius: 12, border: `1.5px solid ${form.type === tp ? 'var(--foret,#1b4332)' : 'rgba(27,67,50,0.2)'}`, background: form.type === tp ? 'var(--foret,#1b4332)' : '#fff', color: form.type === tp ? '#fff' : 'var(--foret,#1b4332)', fontWeight: 700, cursor: 'pointer' }}>
            {tp === 'omra' ? '🕋 Omra' : '🕋 Hajj'}
          </button>
        ))}
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
        <div><label style={labelStyle}>Nom</label><input style={inputStyle} value={form.name} onChange={(e) => set('name', e.target.value)} placeholder="Votre nom" /></div>
        <div><label style={labelStyle}>Email *</label><input required type="email" style={inputStyle} value={form.email} onChange={(e) => set('email', e.target.value)} placeholder="votre@email.com" /></div>
        <div><label style={labelStyle}>Téléphone</label><input style={inputStyle} value={form.phone} onChange={(e) => set('phone', e.target.value)} placeholder="+33…" /></div>
        <div><label style={labelStyle}>Ville de départ</label><input style={inputStyle} value={form.departureCity} onChange={(e) => set('departureCity', e.target.value)} placeholder="Paris, Bruxelles…" /></div>
        <div><label style={labelStyle}>Période</label><input style={inputStyle} value={form.period} onChange={(e) => set('period', e.target.value)} placeholder="Ramadan 2027, été…" /></div>
        <div><label style={labelStyle}>Voyageurs</label><input type="number" min={1} style={inputStyle} value={form.travelers} onChange={(e) => set('travelers', e.target.value)} /></div>
      </div>
      <div>
        <label style={labelStyle}>Budget par personne</label>
        <select style={inputStyle} value={form.budget} onChange={(e) => set('budget', e.target.value)}>
          <option value="">Indifférent</option>
          <option value="<2000">Moins de 2 000 €</option>
          <option value="2000-3500">2 000 – 3 500 €</option>
          <option value="3500-6000">3 500 – 6 000 €</option>
          <option value=">6000">Plus de 6 000 €</option>
        </select>
      </div>
      <button type="submit" disabled={status === 'loading' || !form.email}
        style={{ padding: '14px', borderRadius: 12, border: 'none', background: 'var(--or, #c9a84c)', color: '#1b4332', fontWeight: 800, fontSize: 16, cursor: 'pointer', opacity: status === 'loading' ? 0.7 : 1 }}>
        {status === 'loading' ? 'Envoi…' : 'Recevoir des devis gratuits'}
      </button>
      {status === 'error' && <p style={{ color: '#dc2626', fontSize: 14, margin: 0 }}>{message}</p>}
      <p style={{ fontSize: 12, color: '#9ca3af', margin: 0, textAlign: 'center' }}>Gratuit et sans engagement · Vos données ne sont transmises qu’aux agences partenaires.</p>
    </form>
  )
}
