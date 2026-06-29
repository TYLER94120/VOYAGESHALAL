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
}

export function PrayerTimesWidget({ ville, countryCode, lat, lng, method = 3, school = 0 }: Props) {
  const [timings, setTimings] = useState<Record<string, string> | null>(null)
  const [loading, setLoading] = useState(true)
  const [nextPrayer, setNextPrayer] = useState<string | null>(null)
  const [countdown, setCountdown] = useState<string>('')

  useEffect(() => {
    let cancelled = false
    setLoading(true)
    // Date du jour (timestamp) pour des horaires exacts du jour même.
    const ts = Math.floor(Date.now() / 1000)
    // Coordonnées précises (GPS/ville) → horaires « à la minute » ; sinon par nom de ville.
    const url = (lat != null && lng != null)
      ? `https://api.aladhan.com/v1/timings/${ts}?latitude=${lat}&longitude=${lng}&method=${method}&school=${school}`
      : `https://api.aladhan.com/v1/timingsByCity/${ts}?city=${encodeURIComponent(ville)}&country=${countryCode}&method=${method}&school=${school}`
    fetch(url)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        if (data.data?.timings) {
          // Nettoie « 05:12 (CET) » → « 05:12 » pour un affichage/décompte exacts
          const raw = data.data.timings as Record<string, string>
          const clean: Record<string, string> = {}
          for (const k of Object.keys(raw)) clean[k] = (raw[k] || '').slice(0, 5)
          setTimings(clean)
          calculateNext(clean)
        }
        setLoading(false)
      })
      .catch(() => {
        if (!cancelled) setLoading(false)
      })
    return () => {
      cancelled = true
    }
  }, [ville, countryCode, lat, lng, method, school])

  const calculateNext = (t: Record<string, string>) => {
    const prayers = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']
    const now = new Date()
    const currentMinutes = now.getHours() * 60 + now.getMinutes()

    for (const prayer of prayers) {
      const [h, m] = t[prayer].split(':').map(Number)
      const prayerMinutes = h * 60 + m
      if (prayerMinutes > currentMinutes) {
        setNextPrayer(prayer)
        const diff = prayerMinutes - currentMinutes
        setCountdown(`${Math.floor(diff / 60)}h ${diff % 60}min`)
        return
      }
    }
    setNextPrayer('Fajr')
    setCountdown('')
  }

  const prayers: PrayerTime[] = timings
    ? [
        { name: 'Fajr', nameAr: 'الفجر', emoji: '🌙', time: timings.Fajr, isNext: nextPrayer === 'Fajr' },
        { name: 'Dhuhr', nameAr: 'الظهر', emoji: '☀️', time: timings.Dhuhr, isNext: nextPrayer === 'Dhuhr' },
        { name: 'Asr', nameAr: 'العصر', emoji: '🌤️', time: timings.Asr, isNext: nextPrayer === 'Asr' },
        { name: 'Maghrib', nameAr: 'المغرب', emoji: '🌅', time: timings.Maghrib, isNext: nextPrayer === 'Maghrib' },
        { name: 'Isha', nameAr: 'العشاء', emoji: '🌃', time: timings.Isha, isNext: nextPrayer === 'Isha' },
      ]
    : []

  const today = new Date().toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  })

  if (loading)
    return (
      <div className="prayer-widget prayer-loading">
        <div className="prayer-widget-header">
          <span>🕌 Chargement des horaires...</span>
        </div>
      </div>
    )

  if (!timings) return null

  return (
    <div className="prayer-widget">
      <div className="prayer-widget-header">
        <div>
          <h3>🕌 Horaires de prière — {ville}</h3>
          <p className="prayer-date">{today}</p>
        </div>
        {nextPrayer && countdown && (
          <div className="prayer-next-badge">
            <div className="prayer-next-label">Prochaine prière</div>
            <div className="prayer-next-name">{nextPrayer}</div>
            <div className="prayer-next-countdown">dans {countdown}</div>
          </div>
        )}
      </div>

      <div className="prayer-grid">
        {prayers.map((p) => (
          <div key={p.name} className={`prayer-card ${p.isNext ? 'prayer-card-next' : ''}`}>
            <div className="prayer-emoji">{p.emoji}</div>
            <div className="prayer-name">{p.name}</div>
            <div className="prayer-name-ar font-arabic" dir="rtl">{p.nameAr}</div>
            <div className="prayer-time">{p.time}</div>
            {p.isNext && <div className="prayer-next-indicator">→ Prochaine</div>}
          </div>
        ))}
      </div>
      <p className="prayer-credit">
        Horaires fournis par Aladhan.com · Méthode UOIF (France) / Umm al-Qura (Moyen-Orient)
      </p>
    </div>
  )
}
