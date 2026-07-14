'use client'

import { useMemo, useState } from 'react'
import { track } from '@vercel/analytics'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import PlanView from '@/components/planner/PlanView'
import type { TripPlan, PlanAlternates, PlanProfil, PlanInteret } from '@/lib/planner'
import cityCoords from '@/lib/cityCoords.json'

// Wizard 4 étapes du planificateur « Mon voyage halal ».
// Étapes à hauteur stable (mobile-first, zéro layout shift), tout client.

interface CityRef { slug: string; nom: string; pays: string }
const CITIES = cityCoords as CityRef[]
const norm = (s: string) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()

const GREEN = '#1a3a2a'
const GOLD = '#c9a870'

const INTERETS: { id: PlanInteret; fr: string; en: string; icon: string }[] = [
  { id: 'culture', fr: 'Culture & histoire', en: 'Culture & history', icon: '🏛️' },
  { id: 'detente', fr: 'Détente & nature', en: 'Relaxation & nature', icon: '🌿' },
  { id: 'gastronomie', fr: 'Gastronomie', en: 'Food', icon: '🍽️' },
  { id: 'spiritualite', fr: 'Spiritualité', en: 'Spirituality', icon: '🕌' },
  { id: 'shopping', fr: 'Shopping & souks', en: 'Shopping & souks', icon: '🛍️' },
]

const PROFILS: { id: PlanProfil; fr: string; en: string; icon: string }[] = [
  { id: 'famille', fr: 'En famille', en: 'Family', icon: '👨‍👩‍👧' },
  { id: 'couple', fr: 'En couple', en: 'Couple', icon: '💑' },
  { id: 'solo', fr: 'En solo', en: 'Solo', icon: '🎒' },
]

export default function PlannerClient() {
  const { lang } = useLanguage()
  const en = lang === 'en'
  const [step, setStep] = useState(1)
  const [query, setQuery] = useState('')
  const [city, setCity] = useState<CityRef | null>(null)
  const [dateStart, setDateStart] = useState('')
  const [dateEnd, setDateEnd] = useState('')
  const [profil, setProfil] = useState<PlanProfil>('famille')
  const [interets, setInterets] = useState<PlanInteret[]>(['culture'])
  const [plan, setPlan] = useState<TripPlan | null>(null)
  const [alternates, setAlternates] = useState<PlanAlternates | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  // Sauvegarde / partage
  const [saveOpen, setSaveOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [savedUrl, setSavedUrl] = useState('')
  const [saving, setSaving] = useState(false)
  const [saveMsg, setSaveMsg] = useState('')

  const suggestions = useMemo(() => {
    const q = norm(query.trim())
    if (q.length < 2) return []
    return CITIES.filter((c) => norm(c.nom).includes(q) || c.slug.includes(q)).slice(0, 8)
  }, [query])

  const today = new Date().toISOString().slice(0, 10)

  function toggleInteret(id: PlanInteret) {
    setInterets((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  async function generate() {
    if (!city) return
    setLoading(true); setError('')
    try {
      const res = await fetch('/api/plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'generate', villeSlug: city.slug, dateStart, dateEnd, profil, interets, en }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'error')
      setPlan(data.plan); setAlternates(data.alternates); setStep(4)
      try { track('plan_generated', { ville: city.slug, jours: data.plan.nbJours, profil }) } catch { /* best-effort */ }
    } catch {
      setError(en ? 'Generation failed. Please retry.' : 'La génération a échoué. Réessayez.')
    } finally { setLoading(false) }
  }

  // Remplacer un resto / une activité par le suivant du classement (re-engagement)
  function swap(dayIdx: number, kind: 'resto' | 'activite', itemIdx: number) {
    if (!plan || !alternates) return
    // L'élément remplacé repart en fin de pool (permet de « tourner »)
    if (kind === 'resto') {
      if (!alternates.restos.length) return
      const [next, ...rest] = alternates.restos
      const replaced = plan.days[dayIdx].restos[itemIdx]
      const days = plan.days.map((d, i) => {
        if (i !== dayIdx) return d
        const restos = [...d.restos]; restos[itemIdx] = next; return { ...d, restos }
      })
      setPlan({ ...plan, days })
      setAlternates({ ...alternates, restos: [...rest, replaced] })
    } else {
      if (!alternates.activites.length) return
      const [next, ...rest] = alternates.activites
      const replaced = plan.days[dayIdx].activites[itemIdx]
      const days = plan.days.map((d, i) => {
        if (i !== dayIdx) return d
        const activites = [...d.activites]; activites[itemIdx] = next; return { ...d, activites }
      })
      setPlan({ ...plan, days })
      setAlternates({ ...alternates, activites: [...rest, replaced] })
    }
  }

  async function savePlan(e: React.FormEvent) {
    e.preventDefault()
    if (!plan || !email) return
    setSaving(true); setSaveMsg('')
    try {
      const res = await fetch('/api/plan', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'save', plan }),
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'error')
      // Capture Phase 1 : email → Redis + Brevo + email de bienvenue
      fetch('/api/waitlist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'planificateur', city: plan.villeSlug, lang }),
      }).catch(() => {})
      try { track('lead', { type: 'email', source: 'planificateur' }) } catch { /* best-effort */ }
      const url = `${window.location.origin}${data.url}`
      setSavedUrl(url)
      setSaveMsg(en ? 'Plan saved! Your link:' : 'Plan sauvegardé ! Votre lien :')
    } catch {
      setSaveMsg(en ? 'Save failed. Please retry.' : 'La sauvegarde a échoué. Réessayez.')
    } finally { setSaving(false) }
  }

  async function share() {
    const url = savedUrl || window.location.href
    try {
      if (navigator.share) await navigator.share({ title: `Plan ${plan?.villeNom}`, url })
      else { await navigator.clipboard.writeText(url); setSaveMsg(en ? 'Link copied!' : 'Lien copié !') }
    } catch { /* annulé */ }
  }

  const stepTitle = [
    en ? 'Where are you going?' : 'Où partez-vous ?',
    en ? 'When?' : 'Quand ?',
    en ? 'Who\'s traveling — and what do you love?' : 'Qui voyage — et qu\'aimez-vous ?',
  ][step - 1]

  const btn = 'w-full text-white font-bold py-3.5 rounded-full disabled:opacity-40 transition-opacity'

  // ── Résultat ──
  if (step === 4 && plan) {
    return (
      <div>
        {/* Barre d'actions */}
        <div className="flex flex-wrap justify-center gap-2 mb-8 print:hidden">
          <button onClick={() => setSaveOpen(true)} className="text-sm font-bold px-5 py-2.5 rounded-full text-white" style={{ backgroundColor: GREEN }}>
            💾 {en ? 'Save my plan' : 'Sauvegarder mon plan'}
          </button>
          <button onClick={share} className="text-sm font-bold px-5 py-2.5 rounded-full border" style={{ borderColor: GREEN, color: GREEN }}>
            🔗 {en ? 'Share' : 'Partager'}
          </button>
          <button onClick={() => window.print()} className="text-sm font-bold px-5 py-2.5 rounded-full border" style={{ borderColor: GREEN, color: GREEN }}>
            📄 PDF
          </button>
          <button onClick={() => { setStep(1); setPlan(null); setSavedUrl(''); setSaveOpen(false) }} className="text-sm px-5 py-2.5 rounded-full text-gray-500 border border-gray-200">
            ← {en ? 'New plan' : 'Nouveau plan'}
          </button>
        </div>

        {/* Sauvegarde par email (capture) */}
        {saveOpen && (
          <div className="max-w-md mx-auto mb-8 bg-white rounded-2xl border border-gray-200 p-5 print:hidden">
            {savedUrl ? (
              <div className="text-sm">
                <p className="font-semibold mb-2" style={{ color: GREEN }}>{saveMsg}</p>
                <a href={savedUrl} className="underline break-all" style={{ color: '#1a6b3c' }}>{savedUrl}</a>
                <p className="text-xs text-gray-400 mt-2">{en ? 'Also sent to your inbox with our free guide.' : 'Envoyé aussi dans votre boîte mail avec notre guide gratuit.'}</p>
              </div>
            ) : (
              <form onSubmit={savePlan} className="space-y-2">
                <p className="font-bold text-sm" style={{ color: GREEN }}>
                  {en ? 'Your email to save & retrieve your plan' : 'Votre email pour sauvegarder et retrouver votre plan'}
                </p>
                <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                  placeholder={en ? 'your@email.com' : 'votre@email.com'}
                  className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm" />
                <button type="submit" disabled={saving} className={btn} style={{ backgroundColor: GREEN }}>
                  {saving ? (en ? 'Saving…' : 'Sauvegarde…') : (en ? 'Save my plan' : 'Sauvegarder mon plan')}
                </button>
                {saveMsg && <p className="text-xs text-red-500">{saveMsg}</p>}
                <p className="text-[11px] text-gray-400">{en ? 'No spam. Unsubscribe in one click.' : 'Pas de spam. Désinscription en 1 clic.'}</p>
              </form>
            )}
          </div>
        )}

        <PlanView plan={plan} alternates={alternates ?? undefined} onSwap={swap} />
      </div>
    )
  }

  // ── Wizard ──
  return (
    <div className="max-w-lg mx-auto">
      {/* Progression */}
      <div className="flex items-center gap-2 mb-6" aria-hidden>
        {[1, 2, 3].map((s) => (
          <div key={s} className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: s <= step ? GOLD : '#e5e7eb' }} />
        ))}
      </div>
      <h2 className="text-2xl font-bold mb-5" style={{ fontFamily: 'var(--font-playfair), Georgia, serif', color: GREEN }}>{stepTitle}</h2>

      <div style={{ minHeight: 320 }}>
        {step === 1 && (
          <div>
            <input
              type="text" value={city ? city.nom : query}
              onChange={(e) => { setCity(null); setQuery(e.target.value) }}
              placeholder={en ? 'Search among 354 cities… (e.g. Istanbul)' : 'Cherchez parmi 354 villes… (ex. Istanbul)'}
              className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-2xl text-base"
              autoFocus
            />
            <div className="mt-2 space-y-1" style={{ minHeight: 200 }}>
              {suggestions.map((c) => (
                <button key={c.slug} onClick={() => { setCity(c); setQuery(c.nom) }}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm hover:bg-gray-50 border"
                  style={{ borderColor: city?.slug === c.slug ? GREEN : 'transparent' }}>
                  <strong>{c.nom}</strong> <span className="text-gray-400">— {c.pays}</span>
                </button>
              ))}
              {city && (
                <p className="text-sm px-4 py-2" style={{ color: '#1a6b3c' }}>✓ {city.nom}, {city.pays}</p>
              )}
            </div>
            <button disabled={!city} onClick={() => setStep(2)} className={btn} style={{ backgroundColor: GREEN }}>
              {en ? 'Continue' : 'Continuer'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{en ? 'Arrival' : 'Arrivée'}</label>
            <input type="date" value={dateStart} min={today} onChange={(e) => setDateStart(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-base mb-4" />
            <label className="block text-sm font-semibold text-gray-700 mb-1">{en ? 'Departure' : 'Départ'}</label>
            <input type="date" value={dateEnd} min={dateStart || today} onChange={(e) => setDateEnd(e.target.value)}
              className="w-full px-4 py-3 bg-white border border-gray-200 rounded-2xl text-base mb-2" />
            <p className="text-xs text-gray-400 mb-4">{en ? '14 days max.' : '14 jours maximum.'}</p>
            <div className="flex gap-2">
              <button onClick={() => setStep(1)} className="px-5 py-3.5 rounded-full border border-gray-200 text-gray-500 text-sm">←</button>
              <button disabled={!dateStart || !dateEnd || dateEnd < dateStart} onClick={() => setStep(3)} className={btn} style={{ backgroundColor: GREEN }}>
                {en ? 'Continue' : 'Continuer'}
              </button>
            </div>
          </div>
        )}

        {step === 3 && (
          <div>
            <p className="text-sm font-semibold text-gray-700 mb-2">{en ? 'Traveling as' : 'Vous voyagez'}</p>
            <div className="grid grid-cols-3 gap-2 mb-5">
              {PROFILS.map((p) => (
                <button key={p.id} onClick={() => setProfil(p.id)}
                  className="rounded-2xl border py-3 text-sm font-semibold"
                  style={profil === p.id ? { borderColor: GREEN, backgroundColor: '#f5f0e8', color: GREEN } : { borderColor: '#e5e7eb', color: '#6b7280' }}>
                  <span className="block text-xl mb-1" aria-hidden>{p.icon}</span>{en ? p.en : p.fr}
                </button>
              ))}
            </div>
            <p className="text-sm font-semibold text-gray-700 mb-2">{en ? 'Your interests' : 'Vos centres d\'intérêt'}</p>
            <div className="flex flex-wrap gap-2 mb-6">
              {INTERETS.map((it) => (
                <button key={it.id} onClick={() => toggleInteret(it.id)}
                  className="rounded-full border px-4 py-2 text-sm font-medium"
                  style={interets.includes(it.id) ? { borderColor: GREEN, backgroundColor: GREEN, color: 'white' } : { borderColor: '#e5e7eb', color: '#6b7280' }}>
                  {it.icon} {en ? it.en : it.fr}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setStep(2)} className="px-5 py-3.5 rounded-full border border-gray-200 text-gray-500 text-sm">←</button>
              <button disabled={loading || interets.length === 0} onClick={generate} className={btn} style={{ backgroundColor: GREEN }}>
                {loading ? (en ? 'Generating…' : 'Génération…') : (en ? '✨ Generate my itinerary' : '✨ Générer mon itinéraire')}
              </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        )}
      </div>
    </div>
  )
}
