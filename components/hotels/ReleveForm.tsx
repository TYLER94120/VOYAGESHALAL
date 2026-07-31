'use client'
import { useState } from 'react'
import { useLanguage } from '@/components/i18n/LanguageProvider'

// 📊 « Tu as vu un écart de prix ? » — soumission d'un relevé par la
// communauté. MODÉRÉ : rien ne s'affiche sans validation humaine.
export default function ReleveForm() {
  const { lang } = useLanguage()
  const en = lang === 'en'
  const [open, setOpen] = useState(false)
  const [hotel, setHotel] = useState('')
  const [ville, setVille] = useState('')
  const [booking, setBooking] = useState('')
  const [hb, setHb] = useState('')
  const [membre, setMembre] = useState('')
  const [state, setState] = useState<'idle' | 'busy' | 'ok' | 'err'>('idle')

  const envoyer = async () => {
    setState('busy')
    try {
      const r = await fetch('/api/hotels/releves', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ hotel, ville, booking, halalbooking: hb, membre }),
      })
      setState(r.ok ? 'ok' : 'err')
    } catch { setState('err') }
  }

  const input = { minHeight: 48, padding: '0 14px', borderRadius: 12, border: '1px solid rgba(201,168,76,0.35)', background: 'rgba(255,255,255,0.07)', color: '#fdfaf3', fontSize: 15 } as const

  if (!open) {
    return (
      <button onClick={() => setOpen(true)} style={{ width: '100%', minHeight: 52, marginTop: 12, borderRadius: 14, border: '1.5px dashed rgba(201,168,76,0.5)', background: 'transparent', color: 'var(--or)', fontWeight: 800, fontSize: 14.5, cursor: 'pointer' }}>
        📊 {en ? 'Spotted a price gap? Share it' : 'Tu as vu un écart de prix ? Partage-le'}
      </button>
    )
  }
  if (state === 'ok') {
    return (
      <p style={{ marginTop: 12, background: 'rgba(59,209,122,0.12)', border: '1px solid rgba(59,209,122,0.4)', borderRadius: 14, padding: '14px 16px', color: '#3BD17A', fontWeight: 700, fontSize: 14.5 }}>
        ✓ {en ? 'Received! We verify every price check before publishing — barakAllahu fik.' : 'Reçu ! Chaque relevé est vérifié avant publication — barakAllahou fik.'}
      </p>
    )
  }
  return (
    <div style={{ marginTop: 12, display: 'grid', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 16, padding: 14 }}>
      <input style={input} value={hotel} onChange={(e) => setHotel(e.target.value)} placeholder={en ? 'Hotel (e.g. Grand Mogador Agdal)' : 'Hôtel (ex. Grand Mogador Agdal)'} maxLength={80} />
      <input style={input} value={ville} onChange={(e) => setVille(e.target.value)} placeholder={en ? 'City' : 'Ville'} maxLength={60} />
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8 }}>
        <input style={input} value={booking} onChange={(e) => setBooking(e.target.value)} inputMode="numeric" placeholder="Booking €" />
        <input style={input} value={hb} onChange={(e) => setHb(e.target.value)} inputMode="numeric" placeholder="HalalB. €" />
        <input style={input} value={membre} onChange={(e) => setMembre(e.target.value)} inputMode="numeric" placeholder={en ? 'Member €' : 'Membre €'} />
      </div>
      <p style={{ margin: 0, color: 'rgba(253,250,243,0.45)', fontSize: 12, lineHeight: 1.5 }}>
        {en ? 'Same room, same dates, prices seen TODAY — we verify before publishing.' : 'Même chambre, mêmes dates, prix vus AUJOURD\'HUI — on vérifie avant de publier.'}
      </p>
      <button onClick={envoyer} disabled={state === 'busy'} style={{ minHeight: 50, borderRadius: 12, border: 'none', background: 'var(--or)', color: '#0b1a0f', fontWeight: 900, fontSize: 15, cursor: 'pointer' }}>
        {state === 'busy' ? '…' : (en ? 'Send my price check' : 'Envoyer mon relevé')}
      </button>
      {state === 'err' && <p style={{ margin: 0, color: '#ffb4b4', fontSize: 13.5 }}>{en ? 'Check the fields and retry.' : 'Vérifie les champs et réessaie.'}</p>}
    </div>
  )
}
