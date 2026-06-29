'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLocation } from '@/components/location/LocationProvider'
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher'

const KEYS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const
const LABELS: Record<string, string> = { Fajr: 'Fajr', Dhuhr: 'Dhuhr', Asr: 'ʿAsr', Maghrib: 'Maghrib', Isha: 'ʿIshâ' }

// Bandeau fin, sticky, présent sur toutes les pages : prochaine prière + compte à rebours
// (+ accès langue sur mobile, où le header est masqué).
export default function PrayerCountdownBar() {
  const { city } = useLocation()
  const [timings, setTimings] = useState<Record<string, string> | null>(null)
  const [now, setNow] = useState(Date.now())

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(id)
  }, [])

  useEffect(() => {
    if (!city || city.lat == null || city.lng == null) { setTimings(null); return }
    let cancelled = false
    const method = Number((typeof localStorage !== 'undefined' && localStorage.getItem('vh_prayer_method')) || 3)
    const school = Number((typeof localStorage !== 'undefined' && localStorage.getItem('vh_prayer_school')) || 0)
    const ts = Math.floor(Date.now() / 1000)
    fetch(`https://api.aladhan.com/v1/timings/${ts}?latitude=${city.lat}&longitude=${city.lng}&method=${method}&school=${school}`)
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return
        const t = d?.data?.timings as Record<string, string> | undefined
        if (!t) return
        const clean: Record<string, string> = {}
        for (const k of KEYS) clean[k] = (t[k] || '').slice(0, 5)
        setTimings(clean)
      })
      .catch(() => {})
    return () => { cancelled = true }
  }, [city])

  let inner: React.ReactNode
  if (!city) {
    inner = <Link href="/horaires-priere" className="prayer-bar-main">🕌 <span style={{ opacity: 0.85 }}>Choisissez votre ville pour les horaires</span></Link>
  } else if (!timings) {
    inner = <span className="prayer-bar-main">🕌 <span style={{ opacity: 0.7 }}>Chargement des horaires…</span></span>
  } else {
    const d = new Date(now)
    let nextKey = 'Fajr'
    let target: Date | null = null
    for (const k of KEYS) {
      const [h, m] = timings[k].split(':').map(Number)
      const when = new Date(d); when.setHours(h, m, 0, 0)
      if (when.getTime() > now) { nextKey = k; target = when; break }
    }
    if (!target) {
      const [h, m] = timings.Fajr.split(':').map(Number)
      target = new Date(d); target.setDate(target.getDate() + 1); target.setHours(h, m, 0, 0)
      nextKey = 'Fajr'
    }
    const diff = Math.max(0, target.getTime() - now)
    const hh = Math.floor(diff / 3600000)
    const mm = Math.floor((diff % 3600000) / 60000)
    const ss = Math.floor((diff % 60000) / 1000)
    const remaining = hh > 0 ? `${hh}h ${String(mm).padStart(2, '0')}min` : `${mm}min ${String(ss).padStart(2, '0')}s`
    inner = (
      <Link href="/horaires-priere" className="prayer-bar-main">
        <span>🕌 <strong style={{ color: 'var(--or)' }}>{LABELS[nextKey]}</strong> {timings[nextKey]}</span>
        <span style={{ opacity: 0.6 }}>·</span>
        <span>dans <strong>{remaining}</strong></span>
        <span style={{ opacity: 0.55, fontSize: 11 }}>📍 {city.nom}</span>
      </Link>
    )
  }

  return (
    <div className="prayer-bar">
      {inner}
      {/* Accès langue (surtout utile sur mobile où le header est masqué) */}
      <span className="prayer-bar-lang"><LanguageSwitcher /></span>
    </div>
  )
}
