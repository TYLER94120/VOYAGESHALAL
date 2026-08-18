'use client'
import { useMemo, useState } from 'react'
import { computePrayerTimesFull } from '@/lib/prayerCalc'

// 🗓 « SÉJOUR JOUR PAR JOUR » (maquettes 3b/3d) — la seconde vue de la
// page ville : un planning de 3 jours ORGANISÉ AUTOUR DES 5 PRIÈRES.
//
// Règles :
// - les horaires de prière sont CALCULÉS pour la ville (prayerCalc, comme
//   partout) — réels, et NON DÉPLAÇABLES par la réorganisation ;
// - chaque étape vient des DONNÉES de la ville (activités, restaurants,
//   mosquées relevées) — jamais un lieu inventé ; s'il n'y a pas assez de
//   matière, la journée est plus courte, honnêtement ;
// - « Réorganiser » envoie le planning à Claude (/api/sejour, JSON strict,
//   prières réimposées côté serveur) ; s'il est muet, les journées types
//   restent — jamais bloqué.

export interface EtapeSejour { t: string; type: 'prayer' | 'visit' | 'meal'; title: string; sub?: string }
interface Lieu { nom: string; description?: string; duree?: string; prix?: string }

function Ic({ d, size = 20 }: { d: string; size?: number }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth={1.6}
      strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ display: 'inline-block', flexShrink: 0 }}>
      <path d={d} />
    </svg>
  )
}
const D_MOSQUEE = 'M12 3c3.2 2.4 5 4.7 5 7.2V20H7v-9.8C7 7.7 8.8 5.4 12 3zM4 20h16M10 20v-3.4a2 2 0 0 1 4 0V20'
const D_VISITE = 'M12 21s7-5.1 7-11a7 7 0 0 0-14 0c0 5.9 7 11 7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z'
const D_REPAS = 'M7 3v7a2.5 2.5 0 0 0 2.5 2.5V21M4.5 3v5M9.5 3v5M17 3c-1.7 1.5-2.5 3.4-2.5 5.5S15.8 12 17.5 12V21'
const D_ETINCELLE = 'M12 3l1.6 4.6L18 9.2l-4.4 1.6L12 15.4l-1.6-4.6L6 9.2l4.4-1.6zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z'

const fmt = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

export default function Sejour({ nom, lat, lng, activites, restaurants, mosquees, en = false }: {
  nom: string; lat: number; lng: number
  activites: Lieu[]; restaurants: Lieu[]; mosquees: { nom: string }[]
  en?: boolean
}) {
  const t = (fr: string, an: string) => (en ? an : fr)
  const [jour, setJour] = useState(0)
  const [demande, setDemande] = useState('')
  const [enCours, setEnCours] = useState(false)
  const [message, setMessage] = useState('')
  const [plans, setPlans] = useState<EtapeSejour[][] | null>(null)

  // Les 5 prières RÉELLES de la ville — le squelette de chaque journée.
  const prieres = useMemo(() => {
    try {
      const meth = Number((typeof localStorage !== 'undefined' && localStorage.getItem('vh_prayer_method')) || 3)
      const ecole = Number((typeof localStorage !== 'undefined' && localStorage.getItem('vh_prayer_school')) || 0)
      const p = computePrayerTimesFull(lat, lng, meth, ecole, new Date())
      return { Dhuhr: fmt(p.Dhuhr as Date), Asr: fmt(p.Asr as Date), Maghrib: fmt(p.Maghrib as Date) }
    } catch { return null }
  }, [lat, lng])

  // Journées types : construites depuis les DONNÉES locales, 3 étapes de
  // visite par jour maximum + repas — rien d'inventé, jamais de vide forcé.
  const defauts = useMemo<EtapeSejour[][]>(() => {
    const jours: EtapeSejour[][] = []
    for (let j = 0; j < 3; j++) {
      const a = activites.slice(j * 3, j * 3 + 3)
      const r = restaurants[j]
      const m1 = mosquees[j % Math.max(1, mosquees.length)]
      const etapes: EtapeSejour[] = []
      if (a[0]) etapes.push({ t: '10:00', type: 'visit', title: a[0].nom, sub: [a[0].description, a[0].duree].filter(Boolean).join(' · ').slice(0, 90) })
      if (prieres && m1) etapes.push({ t: prieres.Dhuhr, type: 'prayer', title: `Dhuhr — ${m1.nom}`, sub: t('Mosquée relevée dans la ville', 'Mosque listed in the city') })
      if (r) etapes.push({ t: '13:00', type: 'meal', title: r.nom, sub: (r.description ?? '').slice(0, 90) || undefined })
      if (a[1]) etapes.push({ t: '15:00', type: 'visit', title: a[1].nom, sub: [a[1].description, a[1].duree].filter(Boolean).join(' · ').slice(0, 90) })
      if (prieres && m1) etapes.push({ t: prieres.Maghrib, type: 'prayer', title: `Maghrib — ${m1.nom}`, sub: t('Mosquée relevée dans la ville', 'Mosque listed in the city') })
      if (a[2]) etapes.push({ t: '20:30', type: 'visit', title: a[2].nom, sub: [a[2].description, a[2].duree].filter(Boolean).join(' · ').slice(0, 90) })
      jours.push(etapes)
    }
    return jours
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activites, restaurants, mosquees, prieres])

  const planning = plans ?? defauts

  async function reorganiser() {
    if (!demande.trim() || enCours) return
    setEnCours(true); setMessage('')
    try {
      const ac = new AbortController()
      const to = setTimeout(() => ac.abort(), 15000)
      const r = await fetch('/api/sejour', {
        method: 'POST', signal: ac.signal, headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ville: nom, demande: demande.trim(), planning, lang: en ? 'en' : 'fr' }),
      })
      clearTimeout(to)
      const j = await r.json() as { plans?: EtapeSejour[][]; erreur?: string }
      if (r.ok && Array.isArray(j.plans) && j.plans.length === 3) {
        setPlans(j.plans)
        setDemande('')
      } else {
        setMessage(t('La réorganisation est indisponible — les journées types restent.', 'Reorganizing is unavailable — the default days remain.'))
      }
    } catch {
      setMessage(t('La réorganisation est indisponible — les journées types restent.', 'Reorganizing is unavailable — the default days remain.'))
    } finally { setEnCours(false) }
  }

  const THEMES = [t('Jour 1', 'Day 1'), t('Jour 2', 'Day 2'), t('Jour 3', 'Day 3')]
  const etapes = planning[jour] ?? []

  if (!etapes.length) {
    return <p style={{ color: 'rgba(253,250,243,0.6)', fontSize: 14 }}>{t('Pas encore assez de données locales pour un planning honnête ici.', 'Not enough local data for an honest itinerary here yet.')}</p>
  }

  return (
    <div>
      <p style={{ color: 'rgba(253,250,243,0.75)', fontSize: 14.5, margin: '0 0 14px' }}>
        {t('Chaque journée respecte les 5 prières — horaires réels de la ville.', 'Each day honours the 5 prayers — the city’s real times.')}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 10, marginBottom: 18 }}>
        {THEMES.map((th, i) => (
          <button key={th} onClick={() => setJour(i)} aria-pressed={jour === i}
            style={{ minHeight: 56, borderRadius: 14, border: `1.5px solid ${jour === i ? 'rgba(201,168,76,0.5)' : 'rgba(253,250,243,0.14)'}`, background: jour === i ? 'rgba(201,168,76,0.14)' : 'rgba(253,250,243,0.035)', color: jour === i ? 'var(--or-clair, #E9D9A6)' : 'rgba(253,250,243,0.75)', fontWeight: 700, fontSize: 15, cursor: 'pointer' }}>
            {th}
          </button>
        ))}
      </div>

      <div style={{ display: 'grid', gap: 10 }}>
        {etapes.map((e, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'stretch', gap: 12 }}>
            <span style={{ flexShrink: 0, width: 52, textAlign: 'right', fontSize: 14.5, fontWeight: 700, color: e.type === 'prayer' ? 'var(--or)' : 'rgba(253,250,243,0.6)', paddingTop: 14 }}>{e.t}</span>
            <div style={{ flex: 1, borderRadius: 16, padding: '12px 14px', display: 'flex', alignItems: 'center', gap: 11, border: `1px solid ${e.type === 'prayer' ? 'rgba(201,168,76,0.32)' : 'rgba(253,250,243,0.1)'}`, background: e.type === 'prayer' ? 'rgba(201,168,76,0.09)' : 'rgba(253,250,243,0.035)' }}>
              <span style={{ color: e.type === 'prayer' ? 'var(--or)' : 'rgba(253,250,243,0.65)' }}>
                <Ic d={e.type === 'prayer' ? D_MOSQUEE : e.type === 'meal' ? D_REPAS : D_VISITE} />
              </span>
              <span style={{ minWidth: 0 }}>
                <span style={{ display: 'block', color: '#FDFAF3', fontWeight: 700, fontSize: 16, lineHeight: 1.25 }}>{e.title}</span>
                {e.sub && <span style={{ display: 'block', color: 'rgba(253,250,243,0.65)', fontSize: 13, marginTop: 2 }}>{e.sub}</span>}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
        <input value={demande} onChange={(e) => setDemande(e.target.value)}
          placeholder={t('« plutôt shopping le jour 2, et un hammam »', '“more shopping on day 2, and a hammam”')}
          aria-label={t('Réorganiser le séjour', 'Reorganize the trip')}
          onKeyDown={(e) => { if (e.key === 'Enter') void reorganiser() }}
          style={{ flex: 1, minHeight: 56, borderRadius: 16, border: '1px solid rgba(253,250,243,0.16)', background: 'rgba(253,250,243,0.05)', color: '#FDFAF3', padding: '0 16px', fontSize: 15 }} />
        <button onClick={() => void reorganiser()} disabled={enCours || !demande.trim()}
          aria-label={t('Réorganiser', 'Reorganize')}
          style={{ flexShrink: 0, minWidth: 56, minHeight: 56, padding: '0 18px', borderRadius: 16, border: 'none', background: 'linear-gradient(135deg, #D9BE6C, var(--or))', color: '#0A1509', fontWeight: 700, fontSize: 15, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8, opacity: enCours ? 0.6 : 1 }}>
          <Ic d={D_ETINCELLE} size={18} /> {enCours ? t('Je réorganise…', 'Reorganizing…') : t('Réorganiser', 'Reorganize')}
        </button>
      </div>
      {message && <p style={{ color: 'rgba(253,250,243,0.65)', fontSize: 13.5, margin: '8px 0 0' }}>{message}</p>}
      <p style={{ color: 'rgba(253,250,243,0.4)', fontSize: 12, margin: '8px 0 0' }}>
        {t('Les 5 prières restent fixes — la réorganisation ne les déplace jamais.', 'The 5 prayers stay fixed — reorganizing never moves them.')}
      </p>
    </div>
  )
}
