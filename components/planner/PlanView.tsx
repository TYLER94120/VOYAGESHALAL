'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import { defaultMethodForCountry } from '@/lib/prayer'
import { hotelBookingUrl } from '@/lib/affiliate'
import type { TripPlan, PlanAlternates, PlanDay } from '@/lib/planner'

// Vue d'un itinéraire généré — partagée entre le wizard (/planificateur) et
// la page SSR /plan/[id]. Les horaires de prière sont récupérés côté
// navigateur (AlAdhan, comme /horaires-priere) pour chaque date réelle.

interface Timings { Fajr: string; Dhuhr: string; Asr: string; Maghrib: string; Isha: string }

const GREEN = '#1a3a2a'
const GOLD = '#c9a870'

function fmtDate(d: string, en: boolean) {
  try {
    return new Date(`${d}T12:00:00Z`).toLocaleDateString(en ? 'en-GB' : 'fr-FR', { weekday: 'long', day: 'numeric', month: 'long', timeZone: 'UTC' })
  } catch { return d }
}

function usePrayerTimes(plan: TripPlan) {
  const [times, setTimes] = useState<Record<string, Timings>>({})
  useEffect(() => {
    if (!plan.coord) return
    let cancelled = false
    const method = defaultMethodForCountry(plan.pays)
    ;(async () => {
      for (const day of plan.days) {
        const [y, m, dd] = day.date.split('-')
        try {
          const res = await fetch(`https://api.aladhan.com/v1/timings/${dd}-${m}-${y}?latitude=${plan.coord!.lat}&longitude=${plan.coord!.lng}&method=${method}`)
          if (!res.ok) continue
          const json = await res.json()
          const t = json?.data?.timings
          if (t && !cancelled) {
            setTimes((prev) => ({ ...prev, [day.date]: { Fajr: t.Fajr, Dhuhr: t.Dhuhr, Asr: t.Asr, Maghrib: t.Maghrib, Isha: t.Isha } }))
          }
        } catch { /* horaires indisponibles → ligne masquée */ }
      }
    })()
    return () => { cancelled = true }
  }, [plan])
  return times
}

export default function PlanView({
  plan,
  alternates,
  onSwap,
}: {
  plan: TripPlan
  alternates?: PlanAlternates
  onSwap?: (dayIdx: number, kind: 'resto' | 'activite', itemIdx: number) => void
}) {
  const { lang } = useLanguage()
  const en = lang === 'en'
  const times = usePrayerTimes(plan)
  const editable = Boolean(onSwap && alternates)
  const hotel = hotelBookingUrl(plan.villeNom)
  const flightsUrl = en
    ? `https://www.skyscanner.net/flights-to/${plan.villeSlug}`
    : `https://www.skyscanner.fr/vols-vers/${plan.villeSlug}`

  const PRAYERS: [keyof Timings, string][] = [['Fajr', 'Fajr'], ['Dhuhr', 'Dhuhr'], ['Asr', 'Asr'], ['Maghrib', 'Maghrib'], ['Isha', 'Isha']]

  return (
    <div className="plan-view" style={{ maxWidth: 760, margin: '0 auto' }}>
      {/* En-tête */}
      <div className="text-center mb-8">
        <p style={{ color: GOLD }} className="text-xs font-semibold uppercase tracking-[0.2em] mb-2">
          {en ? 'Your halal itinerary' : 'Votre itinéraire halal'}
        </p>
        <h2 className="text-3xl font-bold mb-1" style={{ fontFamily: 'var(--font-playfair), Georgia, serif', color: GREEN }}>
          {plan.villeNom} — {plan.nbJours} {en ? (plan.nbJours > 1 ? 'days' : 'day') : (plan.nbJours > 1 ? 'jours' : 'jour')}
        </h2>
        <p className="text-gray-500 text-sm">
          {fmtDate(plan.dateStart, en)} → {fmtDate(plan.dateEnd, en)} · {plan.profil} · {plan.interets.join(', ')}
        </p>
        {plan.ramadan && (
          <p className="text-sm mt-2 inline-block px-3 py-1 rounded-full" style={{ backgroundColor: '#f5f0e8', color: GREEN }}>
            🌙 {en ? 'Your trip overlaps Ramadan — see the checklist' : 'Votre séjour tombe pendant le Ramadan — voir la checklist'}
          </p>
        )}
      </div>

      {/* Jours */}
      {plan.days.map((day: PlanDay, di: number) => (
        <section key={day.date} className="mb-6 bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
          <h3 className="font-bold text-lg mb-3" style={{ color: GREEN }}>
            {en ? 'Day' : 'Jour'} {di + 1} — <span className="capitalize">{fmtDate(day.date, en)}</span>
          </h3>

          {/* Horaires de prière du jour (AlAdhan, date réelle) */}
          <div className="mb-4 rounded-xl px-4 py-3" style={{ backgroundColor: '#f5f0e8', minHeight: 44 }}>
            {times[day.date] ? (
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm" style={{ color: GREEN }}>
                {PRAYERS.map(([k, label]) => (
                  <span key={k}><strong>{label}</strong> {times[day.date][k]}</span>
                ))}
              </div>
            ) : (
              <p className="text-xs text-gray-400">
                🕐 {en ? 'Prayer times load for this date…' : 'Horaires de prière en cours de chargement…'}
              </p>
            )}
          </div>

          {/* Activités */}
          {day.activites.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">{en ? 'Activities' : 'Activités'}</p>
              <ul className="space-y-3">
                {day.activites.map((a, ai) => (
                  <li key={`${a.nom}-${ai}`} className="flex items-start gap-2">
                    <span aria-hidden>🎯</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">
                        {a.nom}
                        {a.categorie && <span className="ml-2 text-xs font-normal text-gray-400">{a.categorie}</span>}
                        {(a.duree || a.prix) && <span className="ml-2 text-xs font-normal text-gray-400">{[a.duree, a.prix].filter(Boolean).join(' · ')}</span>}
                      </p>
                      {a.description && <p className="text-xs text-gray-500 leading-relaxed">{a.description}</p>}
                      {a.conseil && <p className="text-xs mt-0.5" style={{ color: '#1a6b3c' }}>💡 {a.conseil}</p>}
                    </div>
                    {editable && (
                      <button onClick={() => onSwap!(di, 'activite', ai)} title={en ? 'Replace' : 'Remplacer'}
                        className="text-gray-300 hover:text-gray-600 text-sm shrink-0" aria-label={en ? 'Replace this activity' : 'Remplacer cette activité'}>↻</button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Restaurants halal proches */}
          {day.restos.length > 0 && (
            <div className="mb-4">
              <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">{en ? 'Halal restaurants' : 'Restaurants halal'}</p>
              <ul className="space-y-2">
                {day.restos.map((r, ri) => (
                  <li key={`${r.nom}-${ri}`} className="flex items-start gap-2">
                    <span aria-hidden>🍽️</span>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900 text-sm">
                        {r.nom}
                        {r.priceRange && <span className="ml-2 text-xs font-normal text-gray-400">{r.priceRange}</span>}
                        {typeof r.score === 'number' && <span className="ml-2 text-xs font-normal text-gray-400">★ {r.score}</span>}
                      </p>
                      <p className="text-xs text-gray-500">
                        <span className="px-1.5 py-0.5 rounded-full mr-1" style={{ backgroundColor: '#fdf6e3', color: '#8a6d1f' }}>
                          {en ? (r.statutHalal.startsWith('Halal') ? 'Reported halal · verify' : 'Verify on site') : r.statutHalal}
                        </span>
                        {r.adresse}
                      </p>
                    </div>
                    {r.mapsUrl && (
                      <a href={r.mapsUrl} target="_blank" rel="noopener noreferrer" className="text-xs shrink-0 underline" style={{ color: GREEN }}>Maps</a>
                    )}
                    {editable && (
                      <button onClick={() => onSwap!(di, 'resto', ri)} title={en ? 'Replace' : 'Remplacer'}
                        className="text-gray-300 hover:text-gray-600 text-sm shrink-0" aria-label={en ? 'Replace this restaurant' : 'Remplacer ce restaurant'}>↻</button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Mosquée */}
          {day.mosquee && (
            <p className="text-sm text-gray-700">
              🕌 <strong>{day.mosquee.nom}</strong>
              {day.mosquee.adresse && <span className="text-gray-500"> — {day.mosquee.adresse}</span>}
            </p>
          )}
        </section>
      ))}

      {/* Budget estimé */}
      <section className="mb-6 rounded-2xl p-5" style={{ backgroundColor: GREEN }}>
        <h3 className="font-bold text-lg mb-3 text-white">{en ? 'Estimated budget' : 'Budget estimé'}</h3>
        <ul className="text-sm text-white/85 space-y-1.5">
          {plan.budget.repasParJour && <li>🍽️ {en ? 'Meals' : 'Repas'} : {plan.budget.repasParJour} / {en ? 'day' : 'jour'}</li>}
          {plan.budget.hotelParNuit && <li>🏨 {en ? 'Hotel' : 'Hôtel'} : {plan.budget.hotelParNuit}</li>}
          <li>🚇 {en ? 'Local transport' : 'Transport local'} : {plan.budget.transportParJour}</li>
        </ul>
        <p className="text-xs text-white/50 mt-3">{plan.budget.note}</p>
        <div className="flex flex-wrap gap-2 mt-4">
          <a href={hotel.url} target="_blank" rel="noopener noreferrer sponsored"
            className="text-xs font-bold px-4 py-2 rounded-full" style={{ backgroundColor: GOLD, color: GREEN }}>
            🏨 {en ? `Book a hotel in ${plan.villeNom}` : `Réserver un hôtel à ${plan.villeNom}`}
          </a>
          <a href={flightsUrl} target="_blank" rel="noopener noreferrer sponsored"
            className="text-xs font-bold px-4 py-2 rounded-full border border-white/30 text-white">
            ✈️ {en ? `Flights to ${plan.villeNom}` : `Vols vers ${plan.villeNom}`}
          </a>
        </div>
      </section>

      {/* Checklist */}
      <section className="mb-6 bg-white rounded-2xl border border-gray-100 p-5">
        <h3 className="font-bold text-lg mb-3" style={{ color: GREEN }}>✅ {en ? 'Preparation checklist' : 'Checklist de préparation'}</h3>
        <ul className="space-y-2 text-sm text-gray-700">
          {plan.checklist.map((c, i) => (
            <li key={i} className="flex items-start gap-2"><span aria-hidden>☐</span><span>{c}</span></li>
          ))}
        </ul>
      </section>

      <p className="text-xs text-gray-400 text-center mb-6">
        {en
          ? 'We never certify the halal status of a place — statuses are reported and must be verified on site.'
          : 'Nous ne certifions jamais le statut halal d\'un lieu — les statuts sont signalés et à vérifier sur place.'}
        {' '}<Link href={`/destinations/${plan.villeSlug}`} className="underline">{en ? `Full ${plan.villeNom} guide` : `Guide complet ${plan.villeNom}`}</Link>
      </p>
    </div>
  )
}
