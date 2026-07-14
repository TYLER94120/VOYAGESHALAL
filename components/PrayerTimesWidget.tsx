'use client'
import { useState, useEffect } from 'react'

interface PrayerTime {
  name: string
  nameAr: string
  emoji: string
  time: string
  isNext?: boolean
}

interface Props {
  ville: string
  pays: string
  countryCode: string
  lat?: number
  lng?: number
  method?: number
  school?: number
  en?: boolean
}

// Cache localStorage des réponses Aladhan (par position arrondie + date +
// méthode + école) → affichage INSTANTANÉ au retour, rafraîchi en arrière-plan.
function cacheKey(p: Props): string {
  const loc = p.lat != null && p.lng != null ? `${p.lat.toFixed(1)},${p.lng!.toFixed(1)}` : p.ville
  return `vh_pt:${loc}:${new Date().toISOString().slice(0, 10)}:${p.method ?? 3}:${p.school ?? 0}`
}
function readCache(key: string): Record<string, string> | null {
  try { return JSON.parse(localStorage.getItem(key) || 'null') } catch { return null }
}
function writeCache(key: string, t: Record<string, string>) {
  try {
    // Purge des entrées des jours précédents pour ne pas gonfler le stockage
    for (let i = localStorage.length - 1; i >= 0; i--) {
      const k = localStorage.key(i)
      if (k?.startsWith('vh_pt:') && k !== key) localStorage.removeItem(k)
    }
    localStorage.setItem(key, JSON.stringify(t))
  } catch { /* stockage plein/privé */ }
}

const PRAYERS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const

function nextOf(t: Record<string, string>, now: Date): { name: string; diffSec: number } {
  const cur = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds()
  for (const prayer of PRAYERS) {
    const [h, m] = (t[prayer] || '').split(':').map(Number)
    if (Number.isNaN(h)) continue
    const sec = h * 3600 + m * 60
    if (sec > cur) return { name: prayer, diffSec: sec - cur }
  }
  // Toutes passées → Fajr demain (approximation : Fajr du jour + 24 h)
  const [h, m] = (t.Fajr || '05:00').split(':').map(Number)
  return { name: 'Fajr', diffSec: h * 3600 + m * 60 + 86400 - cur }
}

function fmtCountdown(diffSec: number, en: boolean): string {
  const h = Math.floor(diffSec / 3600), m = Math.floor((diffSec % 3600) / 60), s = diffSec % 60
  const p = (n: number) => String(n).padStart(2, '0')
  return h > 0 ? `${h}h ${p(m)}min` : m > 0 ? `${m}min ${p(s)}s` : en ? `${s}s` : `${s} s`
}

export function PrayerTimesWidget({ ville, countryCode, lat, lng, method = 3, school = 0, en = false }: Props) {
  const [timings, setTimings] = useState<Record<string, string> | null>(null)
  const [loading, setLoading] = useState(true)
  const [now, setNow] = useState<Date>(() => new Date())

  const props = { ville, pays: '', countryCode, lat, lng, method, school }

  useEffect(() => {
    let cancelled = false
    const key = cacheKey(props)

    // 1) Cache → affichage instantané (stale-while-revalidate)
    const cached = readCache(key)
    if (cached) { setTimings(cached); setLoading(false) }
    else setLoading(true)

    // 2) Réseau → données fraîches (mêmes en général) sans bloquer l'affichage
    const ts = Math.floor(Date.now() / 1000)
    const url = (lat != null && lng != null)
      ? `https://api.aladhan.com/v1/timings/${ts}?latitude=${lat}&longitude=${lng}&method=${method}&school=${school}`
      : `https://api.aladhan.com/v1/timingsByCity/${ts}?city=${encodeURIComponent(ville)}&country=${countryCode}&method=${method}&school=${school}`
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        if (data.data?.timings) {
          const raw = data.data.timings as Record<string, string>
          const clean: Record<string, string> = {}
          for (const k of Object.keys(raw)) clean[k] = (raw[k] || '').slice(0, 5)
          setTimings(clean)
          writeCache(key, clean)
        }
        setLoading(false)
      })
      .catch(() => { if (!cancelled) setLoading(false) })
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [ville, countryCode, lat, lng, method, school])

  // Compte à rebours vivant (comme Muslim Pro) — 1 tick/seconde
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(id)
  }, [])

  const next = timings ? nextOf(timings, now) : null

  const prayers: PrayerTime[] = timings
    ? [
        { name: 'Fajr', nameAr: 'الفجر', emoji: '🌙', time: timings.Fajr, isNext: next?.name === 'Fajr' },
        { name: 'Dhuhr', nameAr: 'الظهر', emoji: '☀️', time: timings.Dhuhr, isNext: next?.name === 'Dhuhr' },
        { name: 'Asr', nameAr: 'العصر', emoji: '🌤️', time: timings.Asr, isNext: next?.name === 'Asr' },
        { name: 'Maghrib', nameAr: 'المغرب', emoji: '🌅', time: timings.Maghrib, isNext: next?.name === 'Maghrib' },
        { name: 'Isha', nameAr: 'العشاء', emoji: '🌃', time: timings.Isha, isNext: next?.name === 'Isha' },
      ]
    : []

  const today = new Date().toLocaleDateString(en ? 'en-GB' : 'fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  })

  if (loading && !timings)
    return (
      <div className="prayer-widget prayer-loading" style={{ minHeight: 220 }}>
        <div className="prayer-widget-header">
          <span>🕌 {en ? 'Loading times…' : 'Chargement des horaires…'}</span>
        </div>
      </div>
    )

  if (!timings)
    return (
      <div className="prayer-widget" style={{ minHeight: 120 }}>
        <div className="prayer-widget-header">
          <span>🕌 {en ? 'Times unavailable right now — please retry.' : 'Horaires indisponibles pour le moment — réessayez.'}</span>
        </div>
      </div>
    )

  return (
    <div className="prayer-widget">
      {/* Bandeau « prochaine prière » — l'info n°1, toujours en tête */}
      {next && (
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 8, flexWrap: 'wrap', padding: '4px 0 12px', textAlign: 'center' }}>
          <span style={{ fontWeight: 800, fontSize: 17, color: 'var(--foret, #1b4332)' }}>📍 {ville}</span>
          <span style={{ fontSize: 15, color: 'var(--texte-2, #666)' }}>·</span>
          <span style={{ fontSize: 17, fontWeight: 800, color: '#8A6D1E' }}>
            {en ? 'Next:' : 'Prochaine :'} {next.name} {en ? 'in' : 'dans'} {fmtCountdown(next.diffSec, en)}
          </span>
        </div>
      )}

      <div className="prayer-widget-header">
        <div>
          <h3>🕌 {en ? `Prayer times — ${ville}` : `Horaires de prière — ${ville}`}</h3>
          <p className="prayer-date">{today}</p>
        </div>
      </div>

      <div className="prayer-grid">
        {prayers.map((p) => (
          <div key={p.name} className={`prayer-card ${p.isNext ? 'prayer-card-next' : ''}`}>
            <div className="prayer-emoji">{p.emoji}</div>
            <div className="prayer-name">{p.name}</div>
            <div className="prayer-name-ar font-arabic" dir="rtl">{p.nameAr}</div>
            <div className="prayer-time">{p.time}</div>
            {p.isNext && <div className="prayer-next-indicator">→ {en ? 'Next' : 'Prochaine'}</div>}
          </div>
        ))}
      </div>
      <p className="prayer-credit">
        {en ? 'Times by Aladhan.com — adjust the calculation method in settings below.' : 'Horaires fournis par Aladhan.com — méthode de calcul réglable ci-dessous.'}
      </p>
    </div>
  )
}
