'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { track } from '@vercel/analytics'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import { QUIZ_DESTS, type QuizDest, type QuizBudget, type QuizCompagnie, type QuizAmbiance, type QuizVol, type QuizSaison } from '@/lib/quizData'
import { cityEn } from '@/lib/poiI18n'

// Quiz « Quelle destination halal pour toi ? » (P5) — 5 questions, 3 recos.
// Résultat partageable via ?r=slug,slug,slug (relu au chargement).

const GREEN = '#1a3a2a'
const GOLD = '#c9a870'

interface Answers { budget?: QuizBudget; compagnie?: QuizCompagnie; ambiance?: QuizAmbiance; vol?: QuizVol; saison?: QuizSaison }

function scoreDest(d: QuizDest, a: Answers): number {
  let s = 0
  if (a.budget != null) s += d.budget === a.budget ? 3 : Math.abs(d.budget - a.budget) === 1 ? 1 : -1
  if (a.compagnie && d.compagnies.includes(a.compagnie)) s += 3
  if (a.ambiance && d.ambiances.includes(a.ambiance)) s += 3
  if (a.vol) s += d.vol === a.vol ? 2 : 0
  if (a.saison && d.saisons.includes(a.saison)) s += 2
  return s
}

export default function QuizClient() {
  const { lang } = useLanguage()
  const en = lang === 'en'
  const [step, setStep] = useState(0)
  const [answers, setAnswers] = useState<Answers>({})
  const [results, setResults] = useState<QuizDest[] | null>(null)
  const [email, setEmail] = useState('')
  const [emailMsg, setEmailMsg] = useState('')
  const [shareMsg, setShareMsg] = useState('')

  // Résultat partagé (?r=) → affichage direct
  useEffect(() => {
    const r = new URLSearchParams(window.location.search).get('r')
    if (r) {
      const found = r.split(',').map((s) => QUIZ_DESTS.find((d) => d.slug === s)).filter(Boolean) as QuizDest[]
      if (found.length) setResults(found.slice(0, 3))
    }
  }, [])

  function finish(a: Answers) {
    const top = [...QUIZ_DESTS]
      .map((d) => ({ d, s: scoreDest(d, a) }))
      .sort((x, y) => y.s - x.s)
      .slice(0, 3)
      .map((x) => x.d)
    setResults(top)
    const url = new URL(window.location.href)
    url.searchParams.set('r', top.map((d) => d.slug).join(','))
    window.history.replaceState(null, '', url.toString())
    try { track('quiz_completed', { top: top[0]?.slug ?? '' }) } catch { /* best-effort */ }
  }

  const Q: { key: keyof Answers; title: string; options: { v: unknown; fr: string; en: string; icon: string }[] }[] = [
    {
      key: 'budget',
      title: en ? 'Your budget?' : 'Ton budget ?',
      options: [
        { v: 1, fr: 'Éco — je compte chaque euro', en: 'Budget — every euro counts', icon: '🪙' },
        { v: 2, fr: 'Moyen — confort sans folie', en: 'Mid-range — comfy, not crazy', icon: '💶' },
        { v: 3, fr: 'Confort — on se fait plaisir', en: 'Comfort — treat yourself', icon: '💎' },
      ],
    },
    {
      key: 'compagnie',
      title: en ? 'Traveling with?' : 'Tu pars avec qui ?',
      options: [
        { v: 'famille', fr: 'En famille', en: 'Family', icon: '👨‍👩‍👧' },
        { v: 'couple', fr: 'En couple', en: 'As a couple', icon: '💑' },
        { v: 'solo', fr: 'En solo', en: 'Solo', icon: '🎒' },
        { v: 'amis', fr: 'Entre amis', en: 'With friends', icon: '👋' },
      ],
    },
    {
      key: 'ambiance',
      title: en ? 'Your vibe?' : 'Ton ambiance ?',
      options: [
        { v: 'culture', fr: 'Culture & histoire', en: 'Culture & history', icon: '🏛️' },
        { v: 'plage', fr: 'Plage & lagons', en: 'Beach & lagoons', icon: '🏖️' },
        { v: 'ville', fr: 'Grande ville qui vibre', en: 'Buzzing big city', icon: '🌆' },
        { v: 'nature', fr: 'Nature & paysages', en: 'Nature & landscapes', icon: '🏔️' },
      ],
    },
    {
      key: 'vol',
      title: en ? 'How far can you fly?' : 'Tu peux voler combien de temps ?',
      options: [
        { v: 'court', fr: 'Court (< 3 h depuis l\'Europe)', en: 'Short (< 3 h from Europe)', icon: '🛫' },
        { v: 'moyen', fr: 'Moyen (3-6 h)', en: 'Medium (3-6 h)', icon: '✈️' },
        { v: 'long', fr: 'Long (> 6 h, pourquoi pas)', en: 'Long haul (> 6 h, why not)', icon: '🌏' },
      ],
    },
    {
      key: 'saison',
      title: en ? 'When do you leave?' : 'Tu pars quand ?',
      options: [
        { v: 'printemps', fr: 'Printemps', en: 'Spring', icon: '🌸' },
        { v: 'ete', fr: 'Été', en: 'Summer', icon: '☀️' },
        { v: 'automne', fr: 'Automne', en: 'Autumn', icon: '🍂' },
        { v: 'hiver', fr: 'Hiver', en: 'Winter', icon: '❄️' },
      ],
    },
  ]

  async function saveEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!email || !results) return
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'quiz', city: results[0]?.slug, lang }),
      })
      if (!res.ok) throw new Error()
      try { track('lead', { type: 'email', source: 'quiz' }) } catch { /* best-effort */ }
      setEmailMsg(en ? '✓ Sent! Check your inbox.' : '✓ Envoyé ! Vérifiez votre boîte mail.')
    } catch { setEmailMsg(en ? 'Error, please retry.' : 'Erreur, réessayez.') }
  }

  async function share() {
    const url = window.location.href
    try {
      if (navigator.share) await navigator.share({ title: en ? 'My halal destinations' : 'Mes destinations halal', url })
      else { await navigator.clipboard.writeText(url); setShareMsg(en ? 'Link copied!' : 'Lien copié !') }
    } catch { /* annulé */ }
  }

  // ── Résultats ──
  if (results) {
    return (
      <div className="max-w-lg mx-auto">
        <h2 className="text-2xl font-bold mb-1 text-center" style={{ fontFamily: 'var(--font-playfair), Georgia, serif', color: GREEN }}>
          {en ? 'Your 3 destinations' : 'Tes 3 destinations'}
        </h2>
        <p className="text-center text-xs text-gray-400 mb-6">
          {en ? 'Editorial guidance — details & things to verify on each city page.' : 'Repères éditoriaux — détails et points à vérifier sur chaque fiche.'}
        </p>
        <div className="space-y-3 mb-6">
          {results.map((d, i) => (
            <Link key={d.slug} href={`/destinations/${d.slug}`}
              className="block bg-white rounded-2xl border border-gray-100 p-5 hover:border-[#c9a870] transition-colors">
              <p className="font-bold text-lg" style={{ color: GREEN }}>
                {['🥇', '🥈', '🥉'][i]} {en ? cityEn(d.nom, true) : d.nom}
              </p>
              <p className="text-sm text-gray-500">{en ? d.atoutEn : d.atoutFr}</p>
              <p className="text-xs font-bold mt-2" style={{ color: '#1a6b3c' }}>{en ? 'See the halal guide →' : 'Voir le guide halal →'}</p>
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap justify-center gap-2 mb-6">
          <button onClick={share} className="text-sm font-bold px-5 py-2.5 rounded-full text-white" style={{ backgroundColor: GREEN }}>
            🔗 {en ? 'Share my result' : 'Partager mon résultat'}
          </button>
          <button onClick={() => { setResults(null); setStep(0); setAnswers({}); window.history.replaceState(null, '', window.location.pathname) }}
            className="text-sm px-5 py-2.5 rounded-full border border-gray-200 text-gray-500">
            ↺ {en ? 'Retake the quiz' : 'Refaire le quiz'}
          </button>
        </div>
        {shareMsg && <p className="text-center text-sm mb-4" style={{ color: '#1a6b3c' }}>{shareMsg}</p>}

        {/* Sauvegarde / capture */}
        <form onSubmit={saveEmail} className="bg-white rounded-2xl border border-gray-200 p-4">
          <p className="font-bold text-sm mb-2" style={{ color: GREEN }}>
            {en ? 'Get the guides of your 3 destinations by email 📬' : 'Reçois les guides de tes 3 destinations par email 📬'}
          </p>
          <div className="flex flex-col sm:flex-row gap-2">
            <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
              placeholder={en ? 'your@email.com' : 'ton@email.com'}
              className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm" />
            <button type="submit" className="text-white text-sm font-bold px-5 py-2.5 rounded-full" style={{ backgroundColor: GREEN }}>
              {en ? 'Send' : 'Recevoir'}
            </button>
          </div>
          {emailMsg && <p className="text-xs mt-2" style={{ color: emailMsg.startsWith('✓') ? '#1a6b3c' : '#dc2626' }}>{emailMsg}</p>}
        </form>

        <p className="text-center mt-6">
          <Link href={en ? '/trip-planner' : '/planificateur'} className="text-sm font-bold underline" style={{ color: GREEN }}>
            🗺️ {en ? `Plan my trip to ${cityEn(results[0].nom, en)} day by day` : `Planifier mon séjour à ${results[0].nom} jour par jour`}
          </Link>
        </p>
      </div>
    )
  }

  // ── Questions ──
  const q = Q[step]
  return (
    <div className="max-w-lg mx-auto">
      <div className="flex items-center gap-2 mb-6" aria-hidden>
        {Q.map((_, i) => (
          <div key={i} className="h-1.5 flex-1 rounded-full" style={{ backgroundColor: i <= step ? GOLD : '#e5e7eb' }} />
        ))}
      </div>
      <h2 className="text-2xl font-bold mb-5" style={{ fontFamily: 'var(--font-playfair), Georgia, serif', color: GREEN }}>
        {step + 1}/5 — {q.title}
      </h2>
      <div className="space-y-2" style={{ minHeight: 280 }}>
        {q.options.map((o) => (
          <button key={String(o.v)}
            onClick={() => {
              const next = { ...answers, [q.key]: o.v }
              setAnswers(next)
              if (step < Q.length - 1) setStep(step + 1)
              else finish(next)
            }}
            className="w-full text-left bg-white rounded-2xl border border-gray-200 px-4 py-3.5 text-sm font-semibold hover:border-[#c9a870] transition-colors"
            style={{ color: GREEN }}>
            <span className="mr-2" aria-hidden>{o.icon}</span>{en ? o.en : o.fr}
          </button>
        ))}
      </div>
      {step > 0 && (
        <button onClick={() => setStep(step - 1)} className="mt-4 text-sm text-gray-400">← {en ? 'Back' : 'Retour'}</button>
      )}
    </div>
  )
}
