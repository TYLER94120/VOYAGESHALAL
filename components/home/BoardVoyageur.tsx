'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useInstantPosition } from '@/lib/useInstantPosition'
import { computePrayerTimesFull } from '@/lib/prayerCalc'
import { useLanguage } from '@/components/i18n/LanguageProvider'

// 🎛️ BOARD VOYAGEUR (bento) — l'accueil devient un tableau de bord contextuel :
// des REPONSES deja calculees, jamais des menus. Il absorbe le Radar Priere
// (meme calcul local, memes couleurs de statut, meme honnetete « signale halal
// · a verifier ») et ajoute : la pepite du moment (meilleur spot communautaire
// avec media), le resto le plus proche, le compteur de spots autour, la bande
// de reels de la ville. Rendu 100 % client : le HTML indexe par Google (hero,
// sections serveur) ne change pas — SEO intact. Sans position : rien (repli =
// accueil classique).

interface Lieu { nom: string; lat: number; lng: number; source: 'osm' | 'communaute'; distM: number; spotId?: string }
interface FeedSpot {
  id: string; nom: string; villeNom: string; villeSlug: string; categorie?: string
  lat?: number; lng?: number; photos?: string[]; video?: string; villeImage?: string
  confirmations?: number; utiles?: number
}

function hav(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000, p = Math.PI / 180
  const a = Math.sin(((lat2 - lat1) * p) / 2) ** 2 + Math.cos(lat1 * p) * Math.cos(lat2 * p) * Math.sin(((lng2 - lng1) * p) / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}
const fmtMin = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h ${m % 60 ? String(m % 60).padStart(2, '0') : ''}`.trim() : `${m} min`)
const walk = (distM: number) => Math.max(1, Math.round(distM / 80)) // ~4,8 km/h
const itin = (lat: number, lng: number) => `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}&travelmode=walking`

export default function BoardVoyageur() {
  const { lang } = useLanguage()
  const en = lang === 'en'
  const { pos, source, geoLoading, refineGps } = useInstantPosition(en)
  const [now, setNow] = useState(() => Date.now())
  const [mosquee, setMosquee] = useState<Lieu | null | undefined>(undefined)
  const [resto, setResto] = useState<Lieu | null | undefined>(undefined)
  const [spots, setSpots] = useState<FeedSpot[] | null>(null)

  useEffect(() => {
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  // ── Fenetre de priere (identique au Radar : calcul local, zero reseau) ──
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
      const after = nextIdx >= 0 ? (seq[nextIdx + 1] ?? fallback) : { key: 'Dhuhr', start: tomorrow.Dhuhr, end: tomorrow.Asr }
      return { ...next, mode: 'upcoming' as const, next: after }
    } catch { return null }
  }, [pos, now])

  // ── Mosquee + resto les plus proches (OSM Overpass + spots communaute) ──
  useEffect(() => {
    if (!pos) return
    let cancelled = false
    const mc: Lieu[] = [], rc: Lieu[] = []
    const q = `[out:json][timeout:12];(node["amenity"="place_of_worship"]["religion"="muslim"](around:5000,${pos.lat},${pos.lng});way["amenity"="place_of_worship"]["religion"="muslim"](around:5000,${pos.lat},${pos.lng});node["amenity"~"restaurant|fast_food"]["diet:halal"~"yes|only"](around:3000,${pos.lat},${pos.lng});way["amenity"~"restaurant|fast_food"]["diet:halal"~"yes|only"](around:3000,${pos.lat},${pos.lng}););out center 40;`
    const p1 = fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: `data=${encodeURIComponent(q)}` })
      .then((r) => r.json())
      .then((d) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const el of (d.elements as any[]) ?? []) {
          const la = el.lat ?? el.center?.lat, lo = el.lon ?? el.center?.lon
          if (!la || !lo || !el.tags?.name) continue
          const lieu: Lieu = { nom: el.tags.name, lat: la, lng: lo, source: 'osm', distM: hav(pos.lat, pos.lng, la, lo) }
          if (el.tags.amenity === 'place_of_worship') mc.push(lieu)
          else rc.push(lieu)
        }
      }).catch(() => {})
    const p2 = fetch(`/api/spots?lat=${pos.lat}&lng=${pos.lng}&radius=5`)
      .then((r) => r.json())
      .then((j) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const s of (j.spots as any[]) ?? []) {
          if (!s.lat || !s.lng) continue
          const lieu: Lieu = { nom: s.nom, lat: s.lat, lng: s.lng, source: 'communaute', distM: hav(pos.lat, pos.lng, s.lat, s.lng), spotId: s.id }
          if (!s.categorie || s.categorie === 'coin_priere') mc.push(lieu)
          else if (s.categorie === 'resto') rc.push(lieu)
        }
      }).catch(() => {})
    Promise.allSettled([p1, p2]).then(() => {
      if (cancelled) return
      mc.sort((a, b) => a.distM - b.distM); rc.sort((a, b) => a.distM - b.distM)
      setMosquee(mc[0] ?? null); setResto(rc[0] ?? null)
    })
    return () => { cancelled = true }
  }, [pos])

  // ── Spots communautaires (pepite + bande de reels + compteur) ──
  useEffect(() => {
    fetch('/api/community/spots?limit=30')
      .then((r) => r.json())
      .then((j) => setSpots((j.spots as FeedSpot[]) ?? []))
      .catch(() => setSpots([]))
  }, [])

  const pres = useMemo(() => {
    if (!pos || !spots) return null
    const withDist = spots
      .filter((s) => s.lat && s.lng)
      .map((s) => ({ ...s, distM: hav(pos.lat, pos.lng, s.lat!, s.lng!) }))
    const autour = withDist.filter((s) => s.distM < 30_000).sort((a, b) => a.distM - b.distM)
    const avecMedia = autour.filter((s) => (s.photos?.length || s.video))
    // La pepite : le spot avec media le plus confirme/utile pres de toi
    const pepite = [...avecMedia].sort((a, b) =>
      ((b.confirmations ?? 0) * 3 + (b.utiles ?? 0)) - ((a.confirmations ?? 0) * 3 + (a.utiles ?? 0)))[0]
      ?? avecMedia[0] ?? null
    // Bande de reels sans la pepite (deja en grande tuile) ; compteur : les
    // spots vraiment proches (<3 km), sinon ceux de la zone (honnete : on
    // change le libelle, pas le chiffre)
    const reels = avecMedia.filter((s) => s.id !== pepite?.id).slice(0, 10)
    const proches = autour.filter((s) => s.distM < 3000)
    const restoCom = autour.find((s) => s.categorie === 'resto' && s.distM < 5000) ?? null
    return { autour, reels, pepite, proches, restoCom }
  }, [pos, spots])

  if (!pos || !fenetre) return null

  // ── Cadrans locaux supplementaires (zero reseau, zero invention) ──
  // Qibla : cap vers la Kaaba depuis la position
  const qibla = (() => {
    const p = Math.PI / 180, kLat = 21.4225 * p, kLng = 39.8262 * p
    const la = pos.lat * p, lo = pos.lng * p
    const y = Math.sin(kLng - lo)
    const x = Math.cos(la) * Math.tan(kLat) - Math.sin(la) * Math.cos(kLng - lo)
    const deg = Math.round(((Math.atan2(y, x) / p) + 360) % 360)
    const dirs = en
      ? ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW']
      : ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO']
    return { deg, dir: dirs[Math.round(deg / 22.5) % 16] }
  })()
  // Date hegirienne du jour (calendrier islamique du telephone)
  const hijri = (() => {
    try {
      return new Intl.DateTimeFormat(en ? 'en-u-ca-islamic-umalqura' : 'fr-u-ca-islamic-umalqura', { day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(now))
    } catch { return null }
  })()
  // Les 5 prieres du jour (meme calcul local que la tuile maitre)
  const journee = (() => {
    try {
      const t = computePrayerTimesFull(pos.lat, pos.lng, 3, 0, new Date(now))
      return (['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const).map((k) => ({ k, d: t[k] }))
    } catch { return null }
  })()

  const boundary = fenetre.mode === 'current' ? fenetre.end.getTime() : fenetre.start.getTime()
  const minLeft = Math.max(0, Math.round((boundary - now) / 60000))
  const walkMin = mosquee ? walk(mosquee.distM) : null
  const statut = fenetre.mode === 'current' && walkMin != null
    ? (minLeft > walkMin + 25 ? 'vert' : minLeft > walkMin + 5 ? 'orange' : 'rouge')
    : null
  const C = { vert: '#3BD17A', orange: '#F2A93B', rouge: '#E5484D' } as const
  const accent = statut ? C[statut] : 'var(--or)'
  const fmtClock = (d: Date) => d.toLocaleTimeString(en ? 'en-GB' : 'fr-FR', { hour: '2-digit', minute: '2-digit' })

  const pepite = pres?.pepite ?? null
  const pepiteImg = pepite?.photos?.[0]?.startsWith('http') ? pepite.photos[0] : pepite?.villeImage

  const T = {
    lab: { fontSize: 10.5, fontWeight: 800 as const, letterSpacing: '0.12em', textTransform: 'uppercase' as const, color: 'var(--or)', margin: 0 },
    tile: { background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(253,250,243,0.1)', borderRadius: 18, padding: '13px 14px' },
    meta: { fontSize: 12, color: 'rgba(253,250,243,0.6)', margin: 0 },
  }

  return (
    <section style={{ background: 'var(--nuit)', padding: '14px 14px 6px' }} aria-label={en ? 'Your travel board' : 'Ton tableau de bord voyage'}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        {/* Barre ville : 1 tap = GPS exact (le roaming fausse la geoloc IP) */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <button
            onClick={() => { refineGps().then((ok) => { if (!ok) window.location.href = '/horaires-priere' }) }}
            style={{ display: 'flex', alignItems: 'center', gap: 6, minHeight: 40, padding: '4px 12px', borderRadius: 999, border: '1px solid rgba(201,168,76,0.4)', background: 'transparent', color: 'var(--creme)', fontSize: 14.5, fontWeight: 800, cursor: 'pointer' }}
          >
            {geoLoading ? (en ? '📡 Locating…' : '📡 Localisation…')
              : source === 'gps' ? `📍 ${pos.label}`
              : `📍 ${pos.label} · ${en ? 'not you? Tap' : 'pas toi ? Appuie'}`}
          </button>
          <Link href="/spots" style={{ color: 'var(--or)', fontSize: 13, fontWeight: 800, textDecoration: 'none', minHeight: 40, display: 'flex', alignItems: 'center' }}>
            {en ? 'See all →' : 'Tout voir →'}
          </Link>
        </div>

        {/* ── Tuile large : la priere (le cadran maitre) ── */}
        <div style={{ ...T.tile, background: 'linear-gradient(150deg, rgba(27,67,50,0.85), rgba(255,255,255,0.04))', borderColor: 'rgba(201,168,76,0.35)' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10 }}>
            <p style={{ ...T.lab, color: accent }}>
              🕌 {fenetre.mode === 'current' ? (en ? 'Now' : 'Maintenant') : (en ? 'Next prayer' : 'Prochaine prière')} · {fenetre.key}
            </p>
            <p style={{ ...T.meta, fontWeight: 700 }}>{fmtClock(fenetre.start)}</p>
          </div>
          <p style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#fdfaf3', fontSize: 30, fontWeight: 900, margin: '2px 0 0', lineHeight: 1.05 }}>
            {fenetre.mode === 'current'
              ? (en ? `ends in ${fmtMin(minLeft)}` : `se termine dans ${fmtMin(minLeft)}`)
              : (en ? `in ${fmtMin(minLeft)}` : `dans ${fmtMin(minLeft)}`)}
          </p>
          {statut && (
            <p style={{ fontSize: 13, fontWeight: 800, color: accent, margin: '4px 0 0' }}>
              {statut === 'vert' ? (en ? '🟢 You have time to reach the mosque' : '🟢 Tu as le temps d\'arriver à la mosquée')
                : statut === 'orange' ? (en ? '🟠 Leave now' : '🟠 Pars maintenant')
                : (en ? '🔴 Pray where you can' : '🔴 Prie où tu peux')}
            </p>
          )}
          {mosquee === undefined && <p style={{ ...T.meta, marginTop: 8 }}>{en ? 'Finding the nearest prayer place…' : 'Recherche du lieu de prière le plus proche…'}</p>}
          {mosquee && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10, flexWrap: 'wrap' }}>
              <p style={{ flex: 1, minWidth: 170, color: '#fdfaf3', fontSize: 14, margin: 0, lineHeight: 1.45 }}>
                {mosquee.source === 'communaute' ? '🤝' : '🕌'} <strong><bdi>{mosquee.nom}</bdi></strong>
                <span style={{ color: 'rgba(253,250,243,0.6)' }}> · {walkMin} {en ? 'min walk' : 'min à pied'}</span>
              </p>
              <a href={itin(mosquee.lat, mosquee.lng)} target="_blank" rel="noopener noreferrer"
                style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', padding: '0 16px', borderRadius: 999, background: 'var(--or)', color: '#0b1a0f', fontWeight: 800, fontSize: 13.5, textDecoration: 'none' }}>
                🚶 {en ? 'Directions' : 'Itinéraire'}
              </a>
            </div>
          )}
          {mosquee === null && (
            <p style={{ ...T.meta, marginTop: 8 }}>
              {en ? 'No known prayer place within 5 km — ' : 'Aucun lieu de prière connu à moins de 5 km — '}
              <Link href="/qibla" style={{ color: 'var(--or)', fontWeight: 800 }}>🧭 Qibla</Link>
            </p>
          )}
        </div>

        {/* ── Rangee : pepite (media) + colonne manger / spots autour ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1.15fr 1fr', gap: 10, marginTop: 10 }}>
          {pepite ? (
            <Link href={`/spot/${pepite.id}`} style={{ ...T.tile, padding: 0, overflow: 'hidden', position: 'relative', minHeight: 172, display: 'flex', flexDirection: 'column', justifyContent: 'flex-end', textDecoration: 'none', backgroundImage: pepiteImg ? `linear-gradient(180deg, rgba(11,26,15,0.05) 30%, rgba(11,26,15,0.9)), url(${pepiteImg})` : 'linear-gradient(160deg, #1d4a35, #0e2013)', backgroundSize: 'cover', backgroundPosition: 'center' }}>
              <div style={{ padding: '10px 12px' }}>
                <p style={T.lab}>💎 {en ? 'The gem' : 'La pépite'}{pepite.video ? ' · 🎬' : ''}</p>
                <p style={{ color: '#fdfaf3', fontWeight: 800, fontSize: 14.5, margin: '2px 0 0', lineHeight: 1.25 }}>{pepite.nom}</p>
                <p style={T.meta}>{pepite.villeNom}{(pepite.confirmations ?? 0) > 0 ? ` · ${en ? 'confirmed by' : 'confirmé par'} ${pepite.confirmations}` : ''}</p>
              </div>
            </Link>
          ) : (
            <Link href="/communaute/ajouter" style={{ ...T.tile, minHeight: 172, display: 'flex', flexDirection: 'column', justifyContent: 'center', textAlign: 'center', textDecoration: 'none' }}>
              <p style={{ fontSize: 26, margin: 0 }}>💎</p>
              <p style={{ color: '#fdfaf3', fontWeight: 800, fontSize: 13.5, margin: '6px 0 2px' }}>{en ? 'No gem near you yet' : 'Pas encore de pépite près de toi'}</p>
              <p style={T.meta}>{en ? 'Be the first to share one 🤲' : 'Sois le premier à en partager une 🤲'}</p>
            </Link>
          )}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            <div style={{ ...T.tile, flex: 1 }}>
              <p style={T.lab}>🍽 {en ? 'Eat halal' : 'Manger halal'}</p>
              {(() => {
                // OSM/spots dans 3 km, sinon resto communautaire jusqu'a 5 km
                const rc = pres?.restoCom
                const best = resto ?? (rc && rc.lat && rc.lng ? { nom: rc.nom, lat: rc.lat, lng: rc.lng, source: 'communaute' as const, distM: (rc as { distM: number }).distM } : null)
                if (resto === undefined && !best) return <p style={{ ...T.meta, marginTop: 4 }}>…</p>
                if (!best) return <p style={{ ...T.meta, marginTop: 4 }}>{en ? 'None reported nearby' : 'Aucun signalé à proximité'}</p>
                return (
                  <>
                    <a href={itin(best.lat, best.lng)} target="_blank" rel="noopener noreferrer" style={{ color: '#fdfaf3', fontWeight: 800, fontSize: 13.5, textDecoration: 'none', display: 'block', margin: '3px 0 1px', lineHeight: 1.3 }}>
                      <bdi>{best.nom}</bdi> →
                    </a>
                    <p style={T.meta}>
                      {walk(best.distM)} {en ? 'min walk' : 'min à pied'} · {best.source === 'communaute' ? (en ? 'community · to confirm' : 'communauté · à confirmer') : (en ? 'reported halal · verify' : 'signalé halal · à vérifier')}
                    </p>
                  </>
                )
              })()}
            </div>
            <Link href="/autour-de-moi" style={{ ...T.tile, flex: 1, textDecoration: 'none', display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
              {(() => {
                // Compteur honnete : les spots < 3 km si possible, sinon ceux de
                // la zone (30 km) avec le nom de la ville — jamais un « 0 » sec
                const n = pres ? (pres.proches.length || pres.autour.length) : null
                const villeNom = pres?.autour[0]?.villeNom
                const labZone = pres && !pres.proches.length && villeNom
                return (
                  <p style={{ margin: 0 }}>
                    <span style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'var(--or)', fontSize: 26, fontWeight: 700 }}>{n ?? '…'}</span>
                    <span style={{ ...T.meta, marginLeft: 6 }}>
                      {labZone ? (en ? `spots in ${villeNom}` : `spots à ${villeNom}`) : (en ? 'spots around you' : 'spots autour de toi')}
                    </span>
                  </p>
                )
              })()}
              <p style={{ ...T.meta, color: 'var(--or)', fontWeight: 700 }}>{en ? 'Open the map →' : 'Ouvrir la carte →'}</p>
            </Link>
          </div>
        </div>

        {/* ── Bande de reels de la ville ── */}
        {pres && pres.reels.length > 0 && (
          <div style={{ display: 'flex', gap: 8, marginTop: 10, overflowX: 'auto', paddingBottom: 4, WebkitOverflowScrolling: 'touch' }}>
            {pres.reels.map((s) => {
              const img = s.photos?.[0]?.startsWith('http') ? s.photos[0] : s.villeImage
              return (
                <Link key={s.id} href={`/spot/${s.id}`} style={{ flex: 'none', width: 92, height: 128, borderRadius: 14, overflow: 'hidden', position: 'relative', textDecoration: 'none', border: '1px solid rgba(201,168,76,0.25)', backgroundImage: img ? `linear-gradient(180deg, rgba(11,26,15,0) 40%, rgba(11,26,15,0.9)), url(${img})` : 'linear-gradient(180deg, #1d4a35, #0e2013)', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', flexDirection: 'column', justifyContent: 'flex-end' }}>
                  {s.video && <span style={{ position: 'absolute', top: 6, left: 6, fontSize: 13 }}>🎬</span>}
                  <span style={{ padding: '5px 7px', color: '#fdfaf3', fontSize: 10.5, fontWeight: 700, lineHeight: 1.25 }}>{s.nom.slice(0, 34)}</span>
                </Link>
              )
            })}
            <Link href="/spots" style={{ flex: 'none', width: 92, height: 128, borderRadius: 14, border: '1.5px dashed rgba(201,168,76,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--or)', fontWeight: 800, fontSize: 12.5, textDecoration: 'none', textAlign: 'center' }}>
              {en ? 'All spots →' : 'Tous les spots →'}
            </Link>
          </div>
        )}

        {/* ── Rangee : Qibla + date hegirienne (calcul local) ── */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
          <Link href="/qibla" style={{ ...T.tile, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 26, transform: `rotate(${qibla.deg}deg)`, display: 'inline-block', lineHeight: 1 }} aria-hidden>🧭</span>
            <span>
              <p style={T.lab}>{en ? 'Qibla' : 'Qibla'}</p>
              <p style={{ color: '#fdfaf3', fontWeight: 800, fontSize: 15, margin: '2px 0 0' }}>{qibla.deg}° · {qibla.dir}</p>
              <p style={{ ...T.meta, color: 'var(--or)', fontWeight: 700 }}>{en ? 'Compass →' : 'Boussole →'}</p>
            </span>
          </Link>
          <div style={{ ...T.tile, display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ fontSize: 24 }} aria-hidden>🌙</span>
            <span>
              <p style={T.lab}>{en ? 'Hijri date' : 'Date hégirienne'}</p>
              <p style={{ color: '#fdfaf3', fontWeight: 800, fontSize: 14, margin: '2px 0 0', lineHeight: 1.3 }}>{hijri ?? '—'}</p>
            </span>
          </div>
        </div>

        {/* ── Bande : les 5 prieres du jour, la prochaine en or ── */}
        {journee && (
          <div style={{ ...T.tile, marginTop: 10, display: 'flex', justifyContent: 'space-between', gap: 6, padding: '11px 12px' }}>
            {journee.map(({ k, d }) => {
              const active = fenetre.key === k
              return (
                <div key={k} style={{ textAlign: 'center', flex: 1, borderRadius: 10, padding: '5px 2px', background: active ? 'rgba(201,168,76,0.16)' : 'transparent' }}>
                  <p style={{ fontSize: 10, fontWeight: 800, letterSpacing: '0.06em', textTransform: 'uppercase', color: active ? 'var(--or)' : 'rgba(253,250,243,0.55)', margin: 0 }}>{k}</p>
                  <p style={{ color: active ? '#fdfaf3' : 'rgba(253,250,243,0.75)', fontWeight: active ? 800 : 600, fontSize: 12.5, margin: '2px 0 0', fontVariantNumeric: 'tabular-nums' }}>{fmtClock(d)}</p>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </section>
  )
}
