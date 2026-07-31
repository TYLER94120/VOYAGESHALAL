'use client'
import { useState } from 'react'
import { useLocation } from '@/components/location/LocationProvider'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import { hotelBookingUrl } from '@/lib/affiliate'

// 🧞 « Trouve ta pépite » — 3 questions, des réponses fondées sur nos données
// vérifiées (jamais de score inventé : chaque raison = une donnée réelle).
interface Pepite { nom: string; categorie?: string; priceRange?: string; raisons: string[]; verifie: boolean; halalBookingUrl?: string }

export default function PepiteFinder() {
  const { lang } = useLanguage()
  const en = lang === 'en'
  const { city } = useLocation()
  const [ville, setVille] = useState(city?.slug ?? '')
  const [villeNom, setVilleNom] = useState(city?.nom ?? '')
  const [qui, setQui] = useState('famille')
  const [prios, setPrios] = useState<string[]>([])
  const [res, setRes] = useState<Pepite[] | null>(null)
  const [busy, setBusy] = useState(false)

  const PRIOS = [
    { id: 'piscine_femmes', fr: '🏊 Piscine femmes', en: '🏊 Women pool' },
    { id: 'plage', fr: '🏖️ Plage privée', en: '🏖️ Private beach' },
    { id: 'sans_alcool', fr: '🚫 Sans alcool', en: '🚫 No alcohol' },
    { id: 'budget', fr: '💰 Petit budget', en: '💰 Budget' },
  ]
  const QUI = [
    { id: 'famille', fr: '👨‍👩‍👦 En famille', en: '👨‍👩‍👦 Family' },
    { id: 'couple', fr: '💑 En couple', en: '💑 Couple' },
    { id: 'solo', fr: '🧳 Solo', en: '🧳 Solo' },
  ]

  const chercher = async () => {
    const slug = (ville || villeNom).toLowerCase().trim().replace(/\s+/g, '-').normalize('NFD').replace(/[̀-ͯ]/g, '')
    if (!slug) return
    setBusy(true)
    try {
      const r = await fetch(`/api/hotels/pepites?ville=${encodeURIComponent(slug)}&qui=${qui}&prios=${prios.join(',')}`)
      const j = await r.json()
      setRes(j.pepites ?? [])
      if (j.villeNom) setVilleNom(j.villeNom)
    } catch { setRes([]) } finally { setBusy(false) }
  }

  const chip = (active: boolean) => ({
    minHeight: 46, padding: '0 16px', borderRadius: 999, cursor: 'pointer', fontWeight: 700 as const, fontSize: 14,
    border: `1.5px solid ${active ? 'var(--or)' : 'rgba(201,168,76,0.35)'}`,
    background: active ? 'var(--or)' : 'transparent', color: active ? '#0b1a0f' : 'var(--creme)',
  })

  return (
    <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 20, padding: '18px 16px' }}>
      <p style={{ margin: '0 0 10px', color: '#fdfaf3', fontWeight: 900, fontSize: 18 }}>
        🧞 {en ? 'Find YOUR gem' : 'Trouve TA pépite'}
      </p>
      <input value={villeNom} onChange={(e) => { setVilleNom(e.target.value); setVille('') }}
        placeholder={en ? 'Which city? (e.g. Marrakesh)' : 'Quelle ville ? (ex. Marrakech)'}
        style={{ width: '100%', minHeight: 50, padding: '0 14px', borderRadius: 12, border: '1px solid rgba(201,168,76,0.35)', background: 'rgba(255,255,255,0.07)', color: '#fdfaf3', fontSize: 15.5, marginBottom: 10 }} />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 8 }}>
        {QUI.map((q) => <button key={q.id} onClick={() => setQui(q.id)} style={chip(qui === q.id)}>{en ? q.en : q.fr}</button>)}
      </div>
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
        {PRIOS.map((p) => (
          <button key={p.id} onClick={() => setPrios((c) => c.includes(p.id) ? c.filter((x) => x !== p.id) : [...c, p.id])} style={chip(prios.includes(p.id))}>
            {en ? p.en : p.fr}
          </button>
        ))}
      </div>
      <button onClick={chercher} disabled={busy} style={{ width: '100%', minHeight: 54, borderRadius: 14, border: 'none', background: 'var(--or)', color: '#0b1a0f', fontWeight: 900, fontSize: 16, cursor: 'pointer' }}>
        {busy ? '…' : (en ? '✨ Show my gems' : '✨ Montre-moi mes pépites')}
      </button>

      {res !== null && (
        <div style={{ marginTop: 14, display: 'grid', gap: 10 }}>
          {res.length === 0 && (
            <p style={{ color: 'rgba(253,250,243,0.7)', fontSize: 14.5, margin: 0, lineHeight: 1.6 }}>
              {en
                ? 'No verified match in our data for this city yet — search directly on HalalBooking (halal filters included):'
                : 'Pas encore de pépite vérifiée dans nos données pour cette ville — cherche directement sur HalalBooking (filtres halal inclus) :'}
            </p>
          )}
          {res.map((p) => (
            <div key={p.nom} style={{ background: 'rgba(255,255,255,0.06)', border: `1px solid ${p.verifie ? 'rgba(201,168,76,0.55)' : 'rgba(255,255,255,0.12)'}`, borderRadius: 14, padding: '12px 14px' }}>
              <p style={{ margin: 0, color: '#fdfaf3', fontWeight: 800, fontSize: 15.5 }}>
                {p.nom} {p.verifie && '✅'} <span style={{ color: 'rgba(253,250,243,0.5)', fontWeight: 600, fontSize: 13 }}>{p.priceRange ?? ''}</span>
              </p>
              <ul style={{ margin: '6px 0 0', paddingLeft: 18, color: 'rgba(253,250,243,0.75)', fontSize: 13.5, lineHeight: 1.6 }}>
                {p.raisons.slice(0, 3).map((r) => <li key={r}>{r}</li>)}
              </ul>
              <a href={p.halalBookingUrl ?? hotelBookingUrl(villeNom).url} target="_blank" rel="noopener noreferrer sponsored"
                style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, padding: '0 16px', marginTop: 8, borderRadius: 999, background: 'var(--or)', color: '#0b1a0f', fontWeight: 800, fontSize: 13.5, textDecoration: 'none' }}>
                {en ? 'Today\'s price on HalalBooking →' : 'Prix du jour sur HalalBooking →'}
              </a>
            </div>
          ))}
          <a href={hotelBookingUrl(villeNom || 'Marrakech').url} target="_blank" rel="noopener noreferrer sponsored"
            style={{ textAlign: 'center', color: 'var(--or)', fontWeight: 800, fontSize: 14, textDecoration: 'none', padding: '8px 0' }}>
            {en ? `All ${villeNom} hotels on HalalBooking →` : `Tous les hôtels ${villeNom} sur HalalBooking →`}
          </a>
        </div>
      )}
    </div>
  )
}
