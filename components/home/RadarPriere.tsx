'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useInstantPosition } from '@/lib/useInstantPosition'
import { computePrayerTimesFull } from '@/lib/prayerCalc'
import { useLanguage } from '@/components/i18n/LanguageProvider'

// 🧭 RADAR PRIÈRE — répond à LA question du voyageur : « ai-je encore le temps
// d'arriver à la mosquée avant la fin du créneau ? ». Croise les horaires
// calculés localement (lib adhan, zéro appel réseau) avec le lieu de prière le
// plus proche (mosquées OSM + coins prière communautaires). 3 états :
// 🟢 large · 🟠 pars maintenant · 🔴 prie où tu peux (Qibla en un tap).
// Aucune donnée inventée : si aucun lieu connu → invitation communauté.

const FR_NAMES: Record<string, string> = { Fajr: 'Fajr', Dhuhr: 'Dhuhr', Asr: 'Asr', Maghrib: 'Maghrib', Isha: 'Isha' }

interface Lieu { nom: string; lat: number; lng: number; source: 'osm' | 'communaute'; distM: number; spotId?: string }

function hav(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000, p = Math.PI / 180
  const a = Math.sin(((lat2 - lat1) * p) / 2) ** 2 + Math.cos(lat1 * p) * Math.cos(lat2 * p) * Math.sin(((lng2 - lng1) * p) / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
const fmtMin = (m: number, en: boolean) => {
  if (m >= 120) return en ? `${Math.floor(m / 60)} h ${m % 60 ? `${m % 60} min` : ''}`.trim() : `${Math.floor(m / 60)} h ${m % 60 ? `${String(m % 60).padStart(2, '0')}` : ''}`.trim()
  return `${m} min`
}

export default function RadarPriere() {
  const { lang } = useLanguage()
  const en = lang === 'en'
  const { pos } = useInstantPosition(en)
  const [now, setNow] = useState(() => Date.now())
  const [lieu, setLieu] = useState<Lieu | null | undefined>(undefined) // undefined = chargement
  const [resto, setResto] = useState<Lieu | null | undefined>(undefined) // resto signalé halal le plus proche

  const [fastTick, setFastTick] = useState(false)
  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), fastTick ? 1000 : 30_000)
    return () => clearInterval(id)
  }, [fastTick])

  // Fenêtre de prière courante : début = heure de la prière, fin = prière
  // suivante (Fajr → lever du soleil ; Isha → Fajr du lendemain)
  const fenetre = useMemo(() => {
    if (!pos) return null
    try {
      const today = computePrayerTimesFull(pos.lat, pos.lng, 3, 0, new Date(now))
      const tomorrow = computePrayerTimesFull(pos.lat, pos.lng, 3, 0, new Date(now + 86_400_000))
      const seq: { key: string; start: Date; end: Date }[] = [
        { key: 'Fajr', start: today.Fajr, end: today.Sunrise },
        { key: 'Dhuhr', start: today.Dhuhr, end: today.Asr },
        { key: 'Asr', start: today.Asr, end: today.Maghrib },
        { key: 'Maghrib', start: today.Maghrib, end: today.Isha },
        { key: 'Isha', start: today.Isha, end: tomorrow.Fajr },
      ]
      const cur = seq.find((s) => now >= s.start.getTime() && now < s.end.getTime())
      const fallback = { key: 'Fajr', start: tomorrow.Fajr, end: tomorrow.Sunrise }
      const nextIdx = seq.findIndex((s) => now < s.start.getTime())
      const next = nextIdx >= 0 ? seq[nextIdx] : fallback
      if (cur) return { ...cur, mode: 'current' as const, next }
      // Hors fenêtre (ex. entre minuit et Fajr) : la carte « suivant » montre
      // la prière d'APRÈS, jamais la même que la carte principale
      const after = nextIdx >= 0 ? (seq[nextIdx + 1] ?? fallback) : { key: 'Dhuhr', start: tomorrow.Dhuhr, end: tomorrow.Asr }
      return { ...next, mode: 'upcoming' as const, next: after }
    } catch { return null }
  }, [pos, now])

  // Lieu de prière le plus proche : mosquées OSM (Overpass) + coins prière communauté
  useEffect(() => {
    if (!pos) return
    let cancelled = false
    const cands: Lieu[] = []
    const done = () => {
      if (cancelled) return
      cands.sort((a, b) => a.distM - b.distM)
      setLieu(cands[0] ?? null)
    }
    const q = `[out:json][timeout:12];(node["amenity"="place_of_worship"]["religion"="muslim"](around:5000,${pos.lat},${pos.lng});way["amenity"="place_of_worship"]["religion"="muslim"](around:5000,${pos.lat},${pos.lng}););out center 25;`
    const p1 = fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: `data=${encodeURIComponent(q)}` })
      .then((r) => r.json())
      .then((d) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const el of (d.elements as any[]) ?? []) {
          const la = el.lat ?? el.center?.lat, lo = el.lon ?? el.center?.lon
          if (la && lo && el.tags?.name) cands.push({ nom: el.tags.name, lat: la, lng: lo, source: 'osm', distM: hav(pos.lat, pos.lng, la, lo) })
        }
      }).catch(() => {})
    const p2 = fetch(`/api/spots?lat=${pos.lat}&lng=${pos.lng}&radius=5`)
      .then((r) => r.json())
      .then((j) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const s of (j.spots as any[]) ?? []) {
          if (s.categorie && s.categorie !== 'coin_priere') continue
          if (s.lat && s.lng) cands.push({ nom: s.nom, lat: s.lat, lng: s.lng, source: 'communaute', distM: hav(pos.lat, pos.lng, s.lat, s.lng), spotId: s.id })
        }
      }).catch(() => {})
    Promise.allSettled([p1, p2]).then(done)
    // Resto signalé halal le plus proche (OSM diet:halal + spots communauté) —
    // vocabulaire honnête : « signalé halal · à vérifier », jamais « certifié »
    const rc: Lieu[] = []
    const qr = `[out:json][timeout:12];(node["amenity"~"restaurant|fast_food"]["diet:halal"~"yes|only"](around:3000,${pos.lat},${pos.lng});way["amenity"~"restaurant|fast_food"]["diet:halal"~"yes|only"](around:3000,${pos.lat},${pos.lng}););out center 25;`
    const r1 = fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: `data=${encodeURIComponent(qr)}` })
      .then((r) => r.json())
      .then((d) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const el of (d.elements as any[]) ?? []) {
          const la = el.lat ?? el.center?.lat, lo = el.lon ?? el.center?.lon
          if (la && lo && el.tags?.name) rc.push({ nom: el.tags.name, lat: la, lng: lo, source: 'osm', distM: hav(pos.lat, pos.lng, la, lo) })
        }
      }).catch(() => {})
    const r2 = fetch(`/api/spots?lat=${pos.lat}&lng=${pos.lng}&radius=3`)
      .then((r) => r.json())
      .then((j) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const s of (j.spots as any[]) ?? []) {
          if (s.categorie !== 'resto') continue
          if (s.lat && s.lng) rc.push({ nom: s.nom, lat: s.lat, lng: s.lng, source: 'communaute', distM: hav(pos.lat, pos.lng, s.lat, s.lng), spotId: s.id })
        }
      }).catch(() => {})
    Promise.allSettled([r1, r2]).then(() => {
      if (cancelled) return
      rc.sort((a, b) => a.distM - b.distM)
      setResto(rc[0] ?? null)
    })
    return () => { cancelled = true }
  }, [pos])

  // compte à rebours à la seconde quand une échéance est < 5 min
  const nearestSec = fenetre ? Math.min(
    Math.max(0, Math.round(((fenetre.mode === 'current' ? fenetre.end.getTime() : fenetre.start.getTime()) - now) / 1000)),
    Math.max(0, Math.round((fenetre.next.start.getTime() - now) / 1000)),
  ) : 9999
  useEffect(() => { setFastTick(nearestSec < 300) }, [nearestSec < 300])

  if (!pos || !fenetre) return null

  const nomPriere = FR_NAMES[fenetre.key] ?? fenetre.key
  const boundary = fenetre.mode === 'current' ? fenetre.end.getTime() : fenetre.start.getTime()
  const secLeft = Math.max(0, Math.round((boundary - now) / 1000))
  const minLeft = Math.max(0, Math.round(secLeft / 60))
  const nextStart = fenetre.next.start
  const nextSec = Math.max(0, Math.round((nextStart.getTime() - now) / 1000))
  const walkMin = lieu ? Math.max(1, Math.round(lieu.distM / 80)) : null // ~4,8 km/h
  // Statut UNIQUEMENT pendant une fenêtre en cours, avec un lieu connu
  const statut = fenetre.mode === 'current' && walkMin != null
    ? (minLeft > walkMin + 25 ? 'vert' : minLeft > walkMin + 5 ? 'orange' : 'rouge')
    : null
  const pct = fenetre.mode === 'current'
    ? Math.max(3, Math.min(100, Math.round((minLeft / Math.max(1, (fenetre.end.getTime() - fenetre.start.getTime()) / 60000)) * 100)))
    : null

  const C = { vert: '#3BD17A', orange: '#F2A93B', rouge: '#E5484D' } as const
  const barColor = statut ? C[statut] : 'var(--or)'
  const mapsHref = lieu ? `https://www.google.com/maps/dir/?api=1&destination=${lieu.lat},${lieu.lng}&travelmode=walking` : null
  const fmtClock = (d: Date) => d.toLocaleTimeString(en ? 'en-GB' : 'fr-FR', { hour: '2-digit', minute: '2-digit' })
  const fmtCompte = (sec: number) => sec < 300
    ? `${Math.floor(sec / 60)}m ${String(sec % 60).padStart(2, '0')}s`
    : fmtMin(Math.round(sec / 60), en)

  return (
    <section style={{ background: 'var(--nuit)', padding: '18px 16px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 20, padding: '16px 18px' }}>
        {/* Ville utilisée pour le calcul — visible et corrigeable en un tap */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
          <p style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(253,250,243,0.45)', margin: 0 }}>
            {en ? 'Prayer times' : 'Horaires de prière'}
          </p>
          <Link href="/horaires-priere" style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--or)', textDecoration: 'none' }}>
            📍 {pos.label} ▾
          </Link>
        </div>
        {/* Double carte « Maintenant / Suivant » (pattern Muslim Pro) */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '11px 14px' }}>
            <p style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: statut ? barColor : 'var(--or)', margin: '0 0 2px' }}>
              {fenetre.mode === 'current' ? (en ? '● Now' : '● Maintenant') : (en ? 'Upcoming' : 'À venir')} · {nomPriere}
            </p>
            <p style={{ fontFamily: "'Playfair Display', serif", color: '#fdfaf3', fontSize: 26, fontWeight: 900, margin: 0, lineHeight: 1.1 }}>
              {fmtClock(fenetre.start)}
            </p>
            <p style={{ fontSize: 12, color: 'rgba(253,250,243,0.6)', margin: '2px 0 0' }}>
              {fenetre.mode === 'current'
                ? (en ? `ends in ${fmtCompte(secLeft)}` : `se termine dans ${fmtCompte(secLeft)}`)
                : (en ? `in ${fmtCompte(secLeft)}` : `dans ${fmtCompte(secLeft)}`)}
            </p>
          </div>
          <div style={{ background: 'rgba(255,255,255,0.06)', borderRadius: 14, padding: '11px 14px' }}>
            <p style={{ fontSize: 11.5, fontWeight: 800, letterSpacing: 1, textTransform: 'uppercase', color: 'rgba(253,250,243,0.55)', margin: '0 0 2px' }}>
              {en ? 'Next' : 'Suivant'} · {FR_NAMES[fenetre.next.key] ?? fenetre.next.key}
            </p>
            <p style={{ fontFamily: "'Playfair Display', serif", color: '#fdfaf3', fontSize: 26, fontWeight: 900, margin: 0, lineHeight: 1.1 }}>
              {fmtClock(nextStart)}
            </p>
            <p style={{ fontSize: 12, color: 'var(--or)', fontWeight: 700, margin: '2px 0 0' }}>
              {en ? `in ${fmtCompte(nextSec)}` : `dans ${fmtCompte(nextSec)}`}
            </p>
          </div>
        </div>
        {statut && (
          <p style={{ fontSize: 13.5, fontWeight: 800, color: barColor, margin: '0 0 8px' }}>
            {statut === 'vert' ? (en ? '🟢 You have time to reach the mosque' : '🟢 Tu as le temps d\'arriver à la mosquée')
              : statut === 'orange' ? (en ? '🟠 Leave now' : '🟠 Pars maintenant')
              : (en ? '🔴 Pray where you can' : '🔴 Prie où tu peux')}
          </p>
        )}
        {/* Barre de temps qui se vide */}
        {pct != null && (
          <div style={{ height: 6, borderRadius: 99, background: 'rgba(255,255,255,0.12)', margin: '10px 0 12px', overflow: 'hidden' }} aria-hidden>
            <div style={{ height: '100%', width: `${pct}%`, borderRadius: 99, background: barColor, transition: 'width .4s' }} />
          </div>
        )}

        {/* Ligne 2 : le lieu le plus proche */}
        {lieu === undefined && <p style={{ color: 'rgba(253,250,243,0.5)', fontSize: 13.5, margin: '8px 0 0' }}>{en ? 'Finding the nearest prayer place…' : 'Recherche du lieu de prière le plus proche…'}</p>}
        {lieu && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
            <p style={{ flex: 1, minWidth: 180, color: '#fdfaf3', fontSize: 14.5, margin: 0, lineHeight: 1.5 }}>
              {lieu.source === 'communaute' ? '🤝' : '🕌'} <strong>{lieu.nom}</strong>
              <span style={{ color: 'rgba(253,250,243,0.6)' }}> · {walkMin} {en ? 'min walk' : 'min à pied'}{lieu.source === 'communaute' ? (en ? ' · community' : ' · communauté') : ' · OSM'}</span>
            </p>
            <span style={{ display: 'flex', gap: 8 }}>
              {mapsHref && (
                <a href={mapsHref} target="_blank" rel="noopener noreferrer" style={{ padding: '10px 16px', borderRadius: 999, background: 'var(--or)', color: '#0b1a0f', fontWeight: 800, fontSize: 13.5, textDecoration: 'none' }}>
                  🚶 {en ? 'Directions' : 'Itinéraire'}
                </a>
              )}
              {statut === 'rouge' && (
                <Link href="/qibla" style={{ padding: '10px 16px', borderRadius: 999, border: '1.5px solid rgba(201,168,76,0.5)', color: '#fdfaf3', fontWeight: 700, fontSize: 13.5, textDecoration: 'none' }}>
                  🧭 Qibla
                </Link>
              )}
            </span>
          </div>
        )}
        {/* Ligne 3 : où manger halal maintenant (signalé, jamais « certifié ») */}
        {resto && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, paddingTop: 10, borderTop: '1px solid rgba(255,255,255,0.08)', flexWrap: 'wrap' }}>
            <p style={{ flex: 1, minWidth: 180, color: '#fdfaf3', fontSize: 14.5, margin: 0, lineHeight: 1.5 }}>
              🍽 <strong>{resto.nom}</strong>
              <span style={{ color: 'rgba(253,250,243,0.6)' }}> · {Math.max(1, Math.round(resto.distM / 80))} {en ? 'min walk' : 'min à pied'} · {resto.source === 'communaute' ? (en ? 'community · to confirm' : 'communauté · à confirmer') : (en ? 'reported halal · to verify' : 'signalé halal · à vérifier')}</span>
            </p>
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${resto.lat},${resto.lng}&travelmode=walking`} target="_blank" rel="noopener noreferrer" style={{ padding: '10px 16px', borderRadius: 999, border: '1.5px solid rgba(201,168,76,0.5)', color: '#fdfaf3', fontWeight: 700, fontSize: 13.5, textDecoration: 'none' }}>
              🚶 {en ? 'Directions' : 'Itinéraire'}
            </a>
          </div>
        )}
        {lieu === null && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
            <p style={{ flex: 1, minWidth: 180, color: 'rgba(253,250,243,0.7)', fontSize: 14, margin: 0, lineHeight: 1.5 }}>
              {en ? 'No known prayer place within 5 km. Found one? Share it for the next traveler 🤲' : 'Aucun lieu de prière connu à moins de 5 km. Tu en as trouvé un ? Partage-le pour le prochain 🤲'}
            </p>
            <span style={{ display: 'flex', gap: 8 }}>
              <Link href="/communaute/ajouter" style={{ padding: '10px 16px', borderRadius: 999, background: 'var(--or)', color: '#0b1a0f', fontWeight: 800, fontSize: 13.5, textDecoration: 'none' }}>
                ➕ {en ? 'Share a spot' : 'Partager un spot'}
              </Link>
              <Link href="/qibla" style={{ padding: '10px 16px', borderRadius: 999, border: '1.5px solid rgba(201,168,76,0.5)', color: '#fdfaf3', fontWeight: 700, fontSize: 13.5, textDecoration: 'none' }}>
                🧭 Qibla
              </Link>
            </span>
          </div>
        )}
      </div>
    </section>
  )
}
