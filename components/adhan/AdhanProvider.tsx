'use client'
import { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react'
import { useLocation } from '@/components/location/LocationProvider'
import { MUEZZINS, PRAYER_KEYS, PRAYER_LABELS, type PrayerKey } from '@/lib/adhan'

type PerPrayer = Record<PrayerKey, boolean>

interface Ctx {
  enabled: boolean
  muezzin: string
  volume: number
  perPrayer: PerPrayer
  nextInfo: { key: PrayerKey; time: string } | null
  setEnabled: (v: boolean) => void
  setMuezzin: (id: string) => void
  setVolume: (v: number) => void
  togglePrayer: (k: PrayerKey) => void
  test: () => void
}

const allOn = (): PerPrayer => ({ Fajr: true, Dhuhr: true, Asr: true, Maghrib: true, Isha: true })

const AdhanContext = createContext<Ctx>({
  enabled: false, muezzin: 'makkah', volume: 1, perPrayer: allOn(), nextInfo: null,
  setEnabled: () => {}, setMuezzin: () => {}, setVolume: () => {}, togglePrayer: () => {}, test: () => {},
})

export function AdhanProvider({ children }: { children: React.ReactNode }) {
  const { city } = useLocation()
  const [enabled, setEnabledState] = useState(false)
  const [muezzin, setMuezzinState] = useState('makkah')
  const [volume, setVolumeState] = useState(1)
  const [perPrayer, setPerPrayer] = useState<PerPrayer>(allOn())
  const [nextInfo, setNextInfo] = useState<{ key: PrayerKey; time: string } | null>(null)
  const [playing, setPlaying] = useState<PrayerKey | null>(null)
  const [dayTick, setDayTick] = useState(0)

  const audioRef = useRef<HTMLAudioElement | null>(null)
  const timersRef = useRef<ReturnType<typeof setTimeout>[]>([])

  // Audio unique réutilisé
  useEffect(() => {
    if (typeof Audio !== 'undefined' && !audioRef.current) audioRef.current = new Audio()
  }, [])

  // Restaure les préférences
  useEffect(() => {
    try {
      const s = localStorage.getItem('vh_adhan')
      if (s) {
        const o = JSON.parse(s)
        if (typeof o.enabled === 'boolean') setEnabledState(o.enabled)
        if (o.muezzin) setMuezzinState(o.muezzin)
        if (typeof o.volume === 'number') setVolumeState(o.volume)
        if (o.perPrayer) setPerPrayer({ ...allOn(), ...o.perPrayer })
      }
    } catch {}
  }, [])

  const persist = useCallback((patch: Partial<{ enabled: boolean; muezzin: string; volume: number; perPrayer: PerPrayer }>) => {
    try {
      const cur = { enabled, muezzin, volume, perPrayer, ...patch }
      localStorage.setItem('vh_adhan', JSON.stringify(cur))
    } catch {}
  }, [enabled, muezzin, volume, perPrayer])

  const muezzinUrl = useCallback((id: string) => MUEZZINS.find((m) => m.id === id)?.url ?? MUEZZINS[0].url, [])

  // Débloque l'audio (politique navigateur : nécessite un geste utilisateur)
  const unlock = useCallback(() => {
    const a = audioRef.current
    if (!a) return
    a.src = muezzinUrl(muezzin)
    a.volume = 0
    a.play().then(() => { a.pause(); a.currentTime = 0; a.volume = volume }).catch(() => {})
  }, [muezzin, volume, muezzinUrl])

  // Déverrouillage de l'audio au 1er geste utilisateur quand l'adhan est activé
  // (sinon, après un rechargement sans interaction, le navigateur bloque la lecture).
  const unlockedRef = useRef(false)
  useEffect(() => {
    if (!enabled) return
    const onGesture = () => {
      if (unlockedRef.current) return
      unlockedRef.current = true
      unlock()
      window.removeEventListener('pointerdown', onGesture)
      window.removeEventListener('touchstart', onGesture)
    }
    window.addEventListener('pointerdown', onGesture)
    window.addEventListener('touchstart', onGesture)
    return () => {
      window.removeEventListener('pointerdown', onGesture)
      window.removeEventListener('touchstart', onGesture)
    }
  }, [enabled, unlock])

  const playAdhan = useCallback((key: PrayerKey) => {
    const a = audioRef.current
    if (!a) return
    a.src = muezzinUrl(muezzin)
    a.volume = volume
    a.currentTime = 0
    setPlaying(key)
    a.onended = () => setPlaying(null)
    a.play().catch(() => setPlaying(null))
  }, [muezzin, volume, muezzinUrl])

  const stop = useCallback(() => {
    const a = audioRef.current
    if (a) { a.pause(); a.currentTime = 0 }
    setPlaying(null)
  }, [])

  // Programme l'adhan pour les prières restantes du jour
  useEffect(() => {
    timersRef.current.forEach(clearTimeout)
    timersRef.current = []
    setNextInfo(null)
    if (!enabled || !city || city.lat == null || city.lng == null) return

    let cancelled = false
    const method = Number(localStorage.getItem('vh_prayer_method') || 3)
    const school = Number(localStorage.getItem('vh_prayer_school') || 0)
    const ts = Math.floor(Date.now() / 1000)
    fetch(`https://api.aladhan.com/v1/timings/${ts}?latitude=${city.lat}&longitude=${city.lng}&method=${method}&school=${school}`)
      .then((r) => r.json())
      .then((data) => {
        if (cancelled) return
        const t = data?.data?.timings as Record<string, string> | undefined
        if (!t) return
        const now = Date.now()
        let next: { key: PrayerKey; time: string } | null = null
        for (const key of PRAYER_KEYS) {
          const hhmm = (t[key] || '').slice(0, 5)
          const [h, m] = hhmm.split(':').map(Number)
          if (Number.isNaN(h)) continue
          const when = new Date(); when.setHours(h, m, 0, 0)
          const diff = when.getTime() - now
          if (diff > 0) {
            if (!next) next = { key, time: hhmm }
            if (perPrayer[key]) {
              timersRef.current.push(setTimeout(() => playAdhan(key), diff))
            }
          }
        }
        setNextInfo(next)
      })
      .catch(() => {})

    // Recalcule au prochain minuit (nouvelle journée de prières)
    const midnight = new Date(); midnight.setHours(24, 0, 30, 0)
    timersRef.current.push(setTimeout(() => setDayTick((d) => d + 1), midnight.getTime() - Date.now()))

    return () => { cancelled = true; timersRef.current.forEach(clearTimeout); timersRef.current = [] }
  }, [enabled, city, perPrayer, muezzin, volume, dayTick, playAdhan])

  const setEnabled = (v: boolean) => { setEnabledState(v); persist({ enabled: v }); if (v) unlock() }
  const setMuezzin = (id: string) => { setMuezzinState(id); persist({ muezzin: id }) }
  const setVolume = (v: number) => { setVolumeState(v); persist({ volume: v }) }
  const togglePrayer = (k: PrayerKey) => { const np = { ...perPrayer, [k]: !perPrayer[k] }; setPerPrayer(np); persist({ perPrayer: np }) }
  const test = () => { unlock(); setTimeout(() => playAdhan(nextInfo?.key ?? 'Dhuhr'), 120) }

  return (
    <AdhanContext.Provider value={{ enabled, muezzin, volume, perPrayer, nextInfo, setEnabled, setMuezzin, setVolume, togglePrayer, test }}>
      {children}
      {playing && (
        <div style={{ position: 'fixed', left: 12, right: 12, bottom: 'calc(env(safe-area-inset-bottom, 0px) + 74px)', zIndex: 400, background: 'var(--nuit)', border: '1px solid rgba(201,168,76,0.5)', borderRadius: 16, padding: '14px 16px', boxShadow: '0 12px 40px rgba(0,0,0,0.45)', display: 'flex', alignItems: 'center', gap: 12, maxWidth: 520, margin: '0 auto' }}>
          <div style={{ fontSize: 28 }}>🕌</div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ color: 'var(--or)', fontWeight: 800, margin: 0, fontSize: 15 }}>Adhan — {PRAYER_LABELS[playing]}</p>
            <p style={{ color: 'rgba(243,236,224,0.7)', margin: '2px 0 0', fontSize: 12 }}>C’est l’heure de la prière 🤲</p>
          </div>
          <button onClick={stop} style={{ background: 'var(--or)', color: 'var(--nuit)', border: 'none', borderRadius: 10, padding: '9px 16px', fontWeight: 800, fontSize: 13, cursor: 'pointer' }}>Arrêter</button>
        </div>
      )}
    </AdhanContext.Provider>
  )
}

export function useAdhan() {
  return useContext(AdhanContext)
}
