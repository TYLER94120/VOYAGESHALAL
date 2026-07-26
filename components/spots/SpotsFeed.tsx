'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import { CATEGORIES, SEUIL_CONFIANCE } from '@/lib/community'
import MediaCapture from '@/components/spots/MediaCapture'
import type { PrayerSpot } from '@/lib/villeTypes'

// 🧿 FEED « Découvrir les spots » — la page VEDETTE du virage Spots.
// Fil vertical scrollable de pépites partagées par la communauté : photo/vidéo
// quand il y en a, carte élégante sinon. AUCUN spot inventé : tout vient des
// utilisateurs. Filtres : proximité / type / ville.

type Spot = PrayerSpot & { distKm?: number }

const CAT_STYLE: Record<string, { bg: string }> = {
  coin_priere: { bg: 'linear-gradient(135deg, #1B4332, #0B1A0F)' },
  resto: { bg: 'linear-gradient(135deg, #3d2f10, #1a1408)' },
  espace_femmes: { bg: 'linear-gradient(135deg, #1f3a4d, #0d1a22)' },
  boucherie: { bg: 'linear-gradient(135deg, #4d1f1f, #220d0d)' },
  pepite: { bg: 'linear-gradient(135deg, #C9A84C, #7a6320)' },
  autre: { bg: 'linear-gradient(135deg, #333, #111)' },
}
// Icônes du feed : jamais un pin isolé (📍 « Autre » → ⭐)
const FEED_ICON: Record<string, string> = { autre: '⭐' }
const catOf = (id?: string) => {
  const c = CATEGORIES.find((x) => x.id === (id ?? 'coin_priere')) ?? CATEGORIES[5]
  return { ...c, icon: FEED_ICON[c.id] ?? c.icon }
}

// Vidéo façon reels : autoplay muet quand visible, son au tap, trim léger via
// métadonnées (videoDebut/videoFin), légende à l'écran.
function ReelVideo({ src, texte, debut, fin }: { src: string; texte?: string; debut?: number; fin?: number }) {
  const ref = useRef<HTMLVideoElement | null>(null)
  const [muted, setMuted] = useState(true)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) v.play().catch(() => {})
      else v.pause()
    }, { threshold: 0.5 })
    io.observe(v)
    const onTime = () => {
      if (debut != null && v.currentTime < debut - 0.3) v.currentTime = debut
      if (fin != null && v.currentTime > fin) v.currentTime = debut ?? 0
    }
    v.addEventListener('timeupdate', onTime)
    if (debut != null) v.currentTime = debut
    return () => { io.disconnect(); v.removeEventListener('timeupdate', onTime) }
  }, [debut, fin])
  return (
    <div style={{ position: 'relative' }} onClick={() => { setMuted((m) => !m); ref.current && (ref.current.muted = !muted) }}>
      <video ref={ref} src={src} muted={muted} loop playsInline preload="metadata"
        style={{ width: '100%', height: 420, objectFit: 'cover', display: 'block', background: '#000', cursor: 'pointer' }} />
      <span style={{ position: 'absolute', top: 10, right: 12, background: 'rgba(0,0,0,0.55)', color: '#fff', borderRadius: 999, padding: '5px 10px', fontSize: 13 }}>
        {muted ? '🔇' : '🔊'}
      </span>
      {texte && (
        <p style={{ position: 'absolute', bottom: 16, left: 14, right: 14, margin: 0, color: '#fff', fontWeight: 800, fontSize: 18, textShadow: '0 2px 10px rgba(0,0,0,0.85)', textAlign: 'center', pointerEvents: 'none' }}>{texte}</p>
      )}
    </div>
  )
}

export default function SpotsFeed() {
  const { lang } = useLanguage()
  const en = lang === 'en'
  const [spots, setSpots] = useState<Spot[] | null>(null)
  const [cat, setCat] = useState<string | null>(null)
  const [near, setNear] = useState(false)
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null)
  const [busy, setBusy] = useState<string | null>(null)
  const [thanked, setThanked] = useState<Record<string, boolean>>({})
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({})
  const [enriching, setEnriching] = useState<string | null>(null)
  const [astuce, setAstuce] = useState('')
  const [mediaFor, setMediaFor] = useState<string | null>(null)

  // Défaut = « Près de moi » si la permission géoloc est DÉJÀ accordée
  // (jamais de prompt surprise) — sinon « Tous les spots ».
  useEffect(() => {
    try {
      navigator.permissions?.query({ name: 'geolocation' as PermissionName }).then((st) => {
        if (st.state === 'granted') {
          navigator.geolocation.getCurrentPosition(
            (p) => { setPos({ lat: p.coords.latitude, lng: p.coords.longitude }); setNear(true) },
            () => {}, { timeout: 6000 },
          )
        }
      }).catch(() => {})
    } catch { /* Safari sans permissions API */ }
  }, [])

  useEffect(() => {
    const q = new URLSearchParams()
    if (cat) q.set('categorie', cat)
    if (near && pos) { q.set('lat', String(pos.lat)); q.set('lng', String(pos.lng)); q.set('radius', '80') }
    setSpots(null)
    fetch(`/api/community/spots?${q}`)
      .then((r) => r.json())
      .then((j) => setSpots(j.spots ?? []))
      .catch(() => setSpots([]))
  }, [cat, near, pos])

  const askNear = () => {
    if (near) { setNear(false); return }
    navigator.geolocation?.getCurrentPosition(
      (p) => { setPos({ lat: p.coords.latitude, lng: p.coords.longitude }); setNear(true) },
      () => setNear(false),
      { timeout: 8000 },
    )
  }

  const utile = async (s: Spot) => {
    if (thanked[s.id]) return
    setThanked((t) => ({ ...t, [s.id]: true }))
    setSpots((cur) => cur?.map((x) => (x.id === s.id ? { ...x, utiles: (x.utiles ?? 0) + 1 } : x)) ?? cur)
    fetch('/api/community/utile', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ spotId: s.id }) }).catch(() => {})
  }

  const confirmer = async (s: Spot) => {
    if (confirmed[s.id] || busy) return
    setBusy(s.id)
    try {
      const token = localStorage.getItem('vh_token')
      const r = await fetch('/api/community/confirm', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ spotId: s.id }),
      })
      const j = await r.json()
      if (r.ok && j.ok !== false) {
        setConfirmed((c) => ({ ...c, [s.id]: true }))
        setSpots((cur) => cur?.map((x) => (x.id === s.id ? { ...x, confirmations: j.confirmations ?? (x.confirmations + 1) } : x)) ?? cur)
      } else if (r.status === 401) {
        window.location.href = '/communaute?connexion=1'
      }
    } catch { /* réseau */ } finally { setBusy(null) }
  }

  const envoyerEnrich = async (s: Spot, extra?: Record<string, unknown>) => {
    const body: Record<string, unknown> = { spotId: s.id, ...extra }
    if (astuce.trim()) body.astuce = astuce.trim()
    if (!body.astuce && !body.photo && !body.video) { setEnriching(null); return }
    const token = localStorage.getItem('vh_token')
    const r = await fetch('/api/community/enrich', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
      body: JSON.stringify(body),
    }).catch(() => null)
    if (r?.ok) {
      const j = await r.json()
      setSpots((cur) => cur?.map((x) => (x.id === s.id ? { ...x, ...j.spot } : x)) ?? cur)
    }
    setAstuce(''); setMediaFor(null); setEnriching(null)
  }

  const chips = useMemo(() => [
    { id: null as string | null, icon: '✨', label: en ? 'All' : 'Tous' },
    ...CATEGORIES.map((c) => ({ id: c.id as string | null, icon: c.icon, label: en ? c.en : c.fr })),
  ], [en])

  return (
    <div style={{ maxWidth: 560, margin: '0 auto', padding: '0 14px 40px' }}>
      {/* Phrase d'accueil + ce qu'on regarde (jamais de doute sur « c'est où ? ») */}
      <p style={{ color: 'rgba(253,250,243,0.7)', fontSize: 14, margin: '0 2px 8px', lineHeight: 1.5 }}>
        {en ? 'Scroll the gems near you, or share yours in 15 sec.' : 'Scrolle les pépites près de toi, ou partage la tienne en 15 sec.'}
      </p>
      <p style={{ color: 'var(--or)', fontSize: 13, fontWeight: 800, letterSpacing: 1.5, textTransform: 'uppercase', margin: '0 2px 8px' }}>
        {near ? (en ? '📍 Spots near you' : '📍 Spots près de toi') : (en ? '🌍 All spots' : '🌍 Tous les spots')}
      </p>
      {/* Filtres : proximité + type */}
      <div style={{ display: 'flex', gap: 8, overflowX: 'auto', padding: '4px 2px 12px', scrollbarWidth: 'none' }}>
        <button onClick={askNear} style={{ flexShrink: 0, minHeight: 40, padding: '0 14px', borderRadius: 999, border: `1.5px solid ${near ? 'var(--or)' : 'rgba(201,168,76,0.35)'}`, background: near ? 'var(--or)' : 'transparent', color: near ? '#0b1a0f' : 'var(--creme)', fontWeight: 800, fontSize: 13.5, cursor: 'pointer' }}>
          📍 {en ? 'Near me' : 'Près de moi'}
        </button>
        {chips.map((c) => (
          <button key={c.id ?? 'all'} onClick={() => setCat(c.id)} style={{ flexShrink: 0, minHeight: 40, padding: '0 14px', borderRadius: 999, border: `1.5px solid ${cat === c.id ? 'var(--or)' : 'rgba(201,168,76,0.35)'}`, background: cat === c.id ? 'var(--or)' : 'transparent', color: cat === c.id ? '#0b1a0f' : 'var(--creme)', fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}>
            {c.icon} {c.label}
          </button>
        ))}
      </div>

      {spots === null && <p style={{ color: 'rgba(253,250,243,0.55)', textAlign: 'center', padding: '30px 0' }}>{en ? 'Loading gems…' : 'Chargement des pépites…'}</p>}

      {spots?.length === 0 && (
        <div style={{ textAlign: 'center', padding: '36px 16px', border: '1px dashed rgba(201,168,76,0.4)', borderRadius: 18 }}>
          <p style={{ color: '#fdfaf3', fontWeight: 800, fontSize: 17, margin: 0 }}>
            {en ? 'No spots here yet.' : 'Aucun spot ici pour l\'instant.'}
          </p>
          <p style={{ color: 'rgba(253,250,243,0.6)', fontSize: 14.5, margin: '8px 0 16px' }}>
            {en ? 'Be the first — your spot will guide travelers after you 🤲' : 'Sois le premier — ton spot guidera les voyageurs après toi 🤲'}
          </p>
          <Link href="/communaute/ajouter" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 52, padding: '0 22px', borderRadius: 999, background: 'var(--or)', color: '#0b1a0f', fontWeight: 800, textDecoration: 'none' }}>
            ➕ {en ? 'Add a spot' : 'Ajouter un spot'}
          </Link>
        </div>
      )}

      <div style={{ display: 'grid', gap: 16 }}>
        {spots?.map((s) => {
          const c = catOf(s.categorie)
          const conf = s.confirmations ?? 0
          const trusted = conf >= SEUIL_CONFIANCE
          const img = s.photos?.[0] ?? s.photo
          return (
            <article key={s.id} style={{ borderRadius: 20, overflow: 'hidden', border: `1px solid ${trusted ? 'rgba(201,168,76,0.55)' : 'rgba(255,255,255,0.1)'}`, background: 'rgba(255,255,255,0.04)' }}>
              {/* MÉDIA plein cadre façon reels : vidéo autoplay muette > photo >
                  fond dégradé typé (jamais un pin isolé qui fait cassé) */}
              {s.video ? (
                <ReelVideo src={s.video} texte={s.videoTexte} debut={s.videoDebut} fin={s.videoFin} />
              ) : (
                <Link href={`/spot/${s.id}`} style={{ display: 'block', textDecoration: 'none', position: 'relative' }}>
                  {img ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={img} alt="" loading="lazy" style={{ width: '100%', height: 320, objectFit: 'cover', display: 'block' }} onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
                  ) : (
                    {/* label remonté + zone basse réservée au titre : plus de collision */}
                    <div style={{ height: 190, paddingBottom: 62, background: CAT_STYLE[s.categorie ?? 'autre']?.bg ?? CAT_STYLE.autre.bg, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                      <span style={{ fontSize: 52, filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.4))' }}>{c.icon}</span>
                      <span style={{ color: 'rgba(255,255,255,0.85)', fontWeight: 800, fontSize: 13, letterSpacing: 2, textTransform: 'uppercase' }}>{en ? c.en : c.fr}</span>
                    </div>
                  )}
                  {/* Texte PAR-DESSUS le média (voile dégradé lisible) */}
                  <div style={{ position: 'absolute', left: 0, right: 0, bottom: 0, padding: '26px 14px 10px', background: 'linear-gradient(180deg, transparent, rgba(0,0,0,0.72))' }}>
                    <p style={{ margin: 0, color: '#fff', fontWeight: 900, fontSize: 18, textShadow: '0 1px 6px rgba(0,0,0,0.5)' }}>
                      {s.nom} {trusted && '🛡️'}
                    </p>
                    <p style={{ margin: '2px 0 0', color: 'rgba(255,255,255,0.85)', fontSize: 13 }}>
                      {c.icon} {en ? c.en : c.fr} · {s.villeNom}{s.distKm != null ? ` · ${s.distKm} km` : ''} · {en ? 'by' : 'par'} {s.auteurPseudo ?? (en ? 'A traveler' : 'Un voyageur')}
                    </p>
                  </div>
                </Link>
              )}
              <div style={{ padding: '12px 14px 14px' }}>
                {s.video && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    <Link href={`/spot/${s.id}`} style={{ color: '#fdfaf3', fontWeight: 800, fontSize: 16.5, textDecoration: 'none', flex: 1, minWidth: 140 }}>{s.nom}</Link>
                    {trusted && <span style={{ background: 'rgba(201,168,76,0.18)', border: '1px solid rgba(201,168,76,0.6)', color: 'var(--or)', borderRadius: 999, padding: '3px 10px', fontSize: 12, fontWeight: 800 }}>🛡️ {en ? 'Trusted' : 'Confiance'}</span>}
                  </div>
                )}
                {conf > 0 && (
                  <p style={{ margin: '6px 0 0', color: '#3BD17A', fontSize: 13.5, fontWeight: 700 }}>
                    ✅ {en ? `Confirmed by ${conf} Muslim${conf > 1 ? 's' : ''}` : `Confirmé par ${conf} musulman${conf > 1 ? 's' : ''}`}
                  </p>
                )}
                {s.astuces && s.astuces.length > 0 && (
                  <p style={{ margin: '8px 0 0', color: 'rgba(253,250,243,0.85)', fontSize: 14, lineHeight: 1.55, fontStyle: 'italic' }}>
                    « {s.astuces[s.astuces.length - 1].texte} » — {s.astuces[s.astuces.length - 1].pseudo}
                  </p>
                )}
                {/* Actions légères */}
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  <button onClick={() => utile(s)} disabled={!!thanked[s.id]} style={{ minHeight: 42, padding: '0 14px', borderRadius: 999, border: '1.5px solid rgba(201,168,76,0.4)', background: thanked[s.id] ? 'rgba(201,168,76,0.2)' : 'transparent', color: 'var(--creme)', fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}>
                    🤲 {en ? 'Helpful' : 'Utile'}{(s.utiles ?? 0) > 0 ? ` · ${s.utiles}` : ''}
                  </button>
                  <button onClick={() => confirmer(s)} disabled={!!confirmed[s.id] || busy === s.id} style={{ minHeight: 42, padding: '0 14px', borderRadius: 999, border: '1.5px solid rgba(59,209,122,0.5)', background: confirmed[s.id] ? 'rgba(59,209,122,0.18)' : 'transparent', color: confirmed[s.id] ? '#3BD17A' : 'var(--creme)', fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}>
                    ✅ {confirmed[s.id] ? (en ? 'Thanks!' : 'Merci !') : (en ? 'I went, it\'s good' : 'J\'y suis allé, c\'est bon')}
                  </button>
                  <button onClick={() => setEnriching(enriching === s.id ? null : s.id)} style={{ minHeight: 42, padding: '0 14px', borderRadius: 999, border: '1.5px solid rgba(201,168,76,0.4)', background: 'transparent', color: 'var(--creme)', fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}>
                    ➕ {en ? 'Enrich' : 'Enrichir'}
                  </button>
                  <a href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`} target="_blank" rel="noopener noreferrer" style={{ minHeight: 42, padding: '0 14px', borderRadius: 999, background: 'var(--or)', color: '#0b1a0f', fontWeight: 800, fontSize: 13.5, textDecoration: 'none', display: 'inline-flex', alignItems: 'center' }}>
                    🚶 {en ? 'Go' : 'Itinéraire'}
                  </a>
                </div>
                {/* Enrichissement collectif : astuce + photo/reel — tout optionnel */}
                {enriching === s.id && (
                  <div style={{ marginTop: 10, display: 'grid', gap: 8 }}>
                    {mediaFor === s.id ? (
                      <MediaCapture
                        onSkip={() => setMediaFor(null)}
                        onDone={(m) => {
                          const extra = m.kind === 'photo'
                            ? { photo: m.payload }
                            : { video: m.payload, videoTexte: m.videoTexte, videoDebut: m.videoDebut, videoFin: m.videoFin }
                          envoyerEnrich(s, extra)
                        }}
                      />
                    ) : (
                      <>
                        <input value={astuce} onChange={(e) => setAstuce(e.target.value)} maxLength={280} placeholder={en ? 'A tip for the next traveler… (optional)' : 'Une astuce pour le prochain… (optionnel)'} style={{ minHeight: 46, padding: '0 14px', borderRadius: 12, border: '1px solid rgba(201,168,76,0.35)', background: 'rgba(255,255,255,0.06)', color: '#fdfaf3', fontSize: 14.5 }} />
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
                          <button onClick={() => setMediaFor(s.id)} style={{ minHeight: 46, borderRadius: 12, border: '1.5px solid rgba(201,168,76,0.45)', background: 'transparent', color: 'var(--creme)', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
                            📷🎥 {en ? 'Photo / reel' : 'Photo / reel'}
                          </button>
                          <button onClick={() => envoyerEnrich(s)} style={{ minHeight: 46, borderRadius: 12, border: 'none', background: 'var(--or)', color: '#0b1a0f', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
                            {en ? 'Add' : 'Ajouter'}
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </div>
            </article>
          )
        })}
      </div>
    </div>
  )
}
