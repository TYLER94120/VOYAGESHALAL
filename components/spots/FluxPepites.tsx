'use client'
import { useEffect, useMemo, useRef, useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import { CATEGORIES, SEUIL_CONFIANCE } from '@/lib/community'
import type { PrayerSpot } from '@/lib/villeTypes'

// 🧿 FLUX « PÉPITES » — un spot = un écran, swipe vertical (brief 2a).
//
// Trois réponses en deux secondes : c'est QUOI (badge type + nom + la phrase
// « pourquoi c'est une pépite »), c'est OÙ/COMBIEN (distance ou ville, la
// ligne IA si Claude a VRAIMENT lu un menu), QUI CONFIRME (« 3 voyageurs
// confirment »). Un seul CTA : Itinéraire. Le reste tient dans un rail de
// trois icônes.
//
// RÈGLES REPRISES DU DÉPÔT, pas renégociées ici :
// - À l'arrivée : TOUS les spots, aucun filtre pré-activé. « Près de moi »
//   est un chip comme les autres, qui demande la position AU TAP — plus
//   jamais de géoloc silencieuse au chargement.
// - Jamais d'écran vide : s'il n'y a rien dans le rayon, on montre les
//   spots des autres villes (récence), leur ville en badge, et on le DIT.
// - Photo générique interdite : un spot sans média est une carte texte sur
//   fond forêt — plus de « photo d'illustration » de la ville qui pouvait
//   passer pour le lieu malgré son label.
// - La ligne « Claude a lu le menu » ne s'affiche QUE si l'extraction a
//   réussi (champ s.ia écrit par /api/spots/ia) — jamais estimée.
// - Aucun emoji : SVG en ligne (même règle que la nav et les tris).

type Spot = PrayerSpot & { distKm?: number }

const CHIP_CATS = ['coin_priere', 'resto', 'pepite'] as const
const BADGE: Record<string, [string, string]> = {
  coin_priere: ['COIN PRIÈRE', 'PRAYER SPOT'], resto: ['RESTO HALAL', 'HALAL RESTO'],
  boucherie: ['BOUCHERIE', 'BUTCHER'], pepite: ['PÉPITE', 'HIDDEN GEM'],
  espace_femmes: ['ESPACE FEMMES', 'WOMEN SPACE'], autre: ['SPOT', 'SPOT'],
}

function Ic({ d, size = 22, fill = false }: { d: string; size?: number; fill?: boolean }) {
  return (
    <svg viewBox="0 0 24 24" width={size} height={size} fill={fill ? 'currentColor' : 'none'}
      stroke="currentColor" strokeWidth={1.7} strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={d} />
    </svg>
  )
}
const D_OEIL = 'M2 12s3.5-6.5 10-6.5S22 12 22 12s-3.5 6.5-10 6.5S2 12 2 12zm10 2.8a2.8 2.8 0 1 0 0-5.6 2.8 2.8 0 0 0 0 5.6z'
const D_COCHE = 'M12 2.6l2 1.9 2.7-.5 1 2.6 2.6 1-.5 2.7 1.9 2-1.9 2 .5 2.7-2.6 1-1 2.6-2.7-.5-2 1.9-2-1.9-2.7.5-1-2.6-2.6-1 .5-2.7-1.9-2 1.9-2-.5-2.7 2.6-1 1-2.6 2.7.5zM9 12.2l2.1 2.1 4-4.3'
const D_PARTAGE = 'M12 15V3.5M8.5 6.5L12 3l3.5 3.5M5 11v8.5h14V11'
const D_ITIN = 'M12 2.5l9.5 9.5-9.5 9.5L2.5 12zM9 13.5v-2h5M12 9.5l2 2-2 2'
const D_ETINCELLE = 'M12 3l1.6 4.6L18 9.2l-4.4 1.6L12 15.4l-1.6-4.6L6 9.2l4.4-1.6zM19 15l.8 2.2L22 18l-2.2.8L19 21l-.8-2.2L16 18l2.2-.8z'

function FondTexte({ s, en }: { s: Spot; en: boolean }) {
  return (
    <div className="flux-carte-texte">
      <div style={{ textAlign: 'center', maxWidth: 340 }}>
        <p style={{ color: 'rgba(253,250,243,.55)', fontSize: 12, fontWeight: 800, letterSpacing: 3, margin: 0 }}>
          {(BADGE[s.categorie ?? 'autre'] ?? BADGE.autre)[en ? 1 : 0]}
        </p>
        <p style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#FDFAF3', fontSize: 30, fontWeight: 700, margin: '10px 0 0', lineHeight: 1.2 }}>{s.nom}</p>
        {s.description && <p style={{ color: 'rgba(253,250,243,.75)', fontSize: 16, margin: '14px 0 0', lineHeight: 1.5 }}>{s.description}</p>}
      </div>
    </div>
  )
}

function Media({ s, proche }: { s: Spot; proche: boolean }) {
  const { lang } = useLanguage()
  const [muet, setMuet] = useState(true)
  const [duree, setDuree] = useState<number | null>(null)
  const [imgKo, setImgKo] = useState(false)
  const ref = useRef<HTMLVideoElement | null>(null)
  useEffect(() => {
    const v = ref.current
    if (!v) return
    const io = new IntersectionObserver(([e]) => { if (e.isIntersecting) v.play().catch(() => {}); else v.pause() }, { threshold: 0.6 })
    io.observe(v)
    return () => io.disconnect()
  }, [s.video])
  if (s.video) {
    return (
      <>
        <video ref={ref} src={s.video} muted={muet} loop playsInline
          preload={proche ? 'auto' : 'metadata'}
          onLoadedMetadata={(e) => setDuree(Math.round(e.currentTarget.duration))}
          onClick={() => { setMuet((m) => !m); if (ref.current) ref.current.muted = !muet }}
          style={{ cursor: 'pointer' }} />
        <span style={{ position: 'absolute', top: 64, right: 12, zIndex: 3, background: 'rgba(11,26,15,.55)', color: '#FDFAF3', borderRadius: 999, padding: '4px 10px', fontSize: 12, fontWeight: 700 }}>
          {muet ? (lang === 'en' ? 'tap for sound' : 'tap pour le son') : ''}{muet && duree ? ' · ' : ''}{duree ? `${duree}s` : ''}
        </span>
      </>
    )
  }
  const img = s.photos?.[0] ?? s.photo
  if (img && !imgKo) {
    // eslint-disable-next-line @next/next/no-img-element
    return <img src={img} alt="" loading={proche ? 'eager' : 'lazy'} onError={() => setImgKo(true)} />
  }
  return <FondTexte s={s} en={lang === 'en'} />
}

function Ecran({ s, en, proche, thanked, confirmed, busy, onUtile, onConfirm, onShare, onItin, horsZone }: {
  s: Spot; en: boolean; proche: boolean
  thanked: boolean; confirmed: boolean; busy: boolean; horsZone: boolean
  onUtile: () => void; onConfirm: () => void; onShare: () => void; onItin: () => void
}) {
  const conf = s.confirmations ?? 0
  const badge = (BADGE[s.categorie ?? 'autre'] ?? BADGE.autre)[en ? 1 : 0]
  const ou = s.distKm != null
    ? (s.distKm < 1 ? `${en ? 'at' : 'à'} ${Math.round(s.distKm * 1000)} m` : `${en ? 'at' : 'à'} ${s.distKm} km`)
    : s.villeNom
  return (
    <section className="flux-slide" aria-label={s.nom}>
      <Media s={s} proche={proche} />
      <div className="flux-voile" />
      <div className="flux-rail">
        <div>
          <button onClick={onUtile} disabled={thanked} aria-label={en ? 'Helpful' : 'Utile'}
            style={thanked ? { color: '#C9A84C' } : undefined}><Ic d={D_OEIL} /></button>
          <span className="lbl">{s.utiles ?? 0}</span>
        </div>
        <div>
          <button onClick={onConfirm} disabled={confirmed || busy} aria-label={en ? 'I went there' : 'J\'y suis allé'}
            style={{ color: confirmed ? '#7FBF8F' : 'var(--creme)' }}><Ic d={D_COCHE} /></button>
          <span className="lbl">{confirmed ? (en ? 'thanks' : 'merci') : (en ? 'I went' : 'j\'y suis allé')}</span>
        </div>
        <div>
          <button onClick={onShare} aria-label={en ? 'Share' : 'Partager'}><Ic d={D_PARTAGE} /></button>
          <span className="lbl">{en ? 'share' : 'partager'}</span>
        </div>
      </div>
      <div className="flux-info">
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <span style={{ background: '#C9A84C', color: '#0B1A0F', fontSize: 11, fontWeight: 700, letterSpacing: 1, borderRadius: 8, padding: '4px 9px' }}>{badge}</span>
          <span style={{ color: '#FDFAF3', fontSize: 13, fontWeight: 600 }}>{ou}</span>
          {horsZone && s.distKm == null && (
            <span style={{ color: 'rgba(253,250,243,.6)', fontSize: 12 }}>{en ? 'other city' : 'autre ville'}</span>
          )}
        </div>
        <Link href={`/spot/${s.id}`} style={{ textDecoration: 'none' }}>
          <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#FDFAF3', fontSize: 22, fontWeight: 700, margin: '6px 0 0', lineHeight: 1.2 }}>{s.nom}</h2>
        </Link>
        {s.description && <p className="flux-pourquoi">{s.description}</p>}
        {s.ia?.texte && (
          <p style={{ color: '#C9A84C', fontSize: 12, fontWeight: 700, margin: '7px 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Ic d={D_ETINCELLE} size={14} /> {en ? 'Claude read the menu: ' : 'Claude a lu le menu : '}{s.ia.texte}
          </p>
        )}
        {conf > 0 && (
          <p style={{ color: '#7FBF8F', fontSize: 13, fontWeight: 600, margin: '7px 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Ic d={D_COCHE} size={15} />
            {en ? `${conf} traveler${conf > 1 ? 's' : ''} confirm` : `${conf} ${conf > 1 ? 'voyageurs confirment' : 'voyageur confirme'}`}
            {conf >= SEUIL_CONFIANCE ? (en ? ' · community-confirmed' : ' · confirmé par la communauté') : ''}
          </p>
        )}
        <div className="flux-cta-zone">
          <a href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`} target="_blank" rel="noopener noreferrer" onClick={onItin}
            style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 9, height: 54, marginTop: 12, borderRadius: 16, background: '#C9A84C', color: '#0B1A0F', fontWeight: 800, fontSize: 16.5, textDecoration: 'none' }}>
            <Ic d={D_ITIN} size={20} /> {en ? 'Directions' : 'Itinéraire'}
          </a>
          <p style={{ textAlign: 'center', color: 'rgba(253,250,243,.45)', fontSize: 12, margin: '8px 0 0' }}>
            {en ? 'swipe up for the next spot' : 'swipe vers le haut pour le spot suivant'}
          </p>
        </div>
      </div>
    </section>
  )
}

export default function FluxPepites({ initialSpots }: { initialSpots?: Spot[] }) {
  const { lang } = useLanguage()
  const en = lang === 'en'
  const [spots, setSpots] = useState<Spot[] | null>(initialSpots?.length ? initialSpots : null)
  const [chip, setChip] = useState<string | null>(null) // null = Tous — le défaut, TOUJOURS
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null)
  const [horsZone, setHorsZone] = useState(false)
  const [idx, setIdx] = useState(0)
  const [thanked, setThanked] = useState<Record<string, boolean>>({})
  const [confirmed, setConfirmed] = useState<Record<string, boolean>>({})
  const [busy, setBusy] = useState<string | null>(null)
  const [pleinDesktop, setPleinDesktop] = useState<number | null>(null)
  const fluxRef = useRef<HTMLDivElement | null>(null)

  const charger = async (c: string | null, p: { lat: number; lng: number } | null) => {
    setSpots(null); setHorsZone(false); setIdx(0)
    const q = new URLSearchParams()
    if (c && c !== 'near') q.set('categorie', c)
    if (c === 'near' && p) { q.set('lat', String(p.lat)); q.set('lng', String(p.lng)); q.set('radius', '80') }
    try {
      const j = await (await fetch(`/api/community/spots?${q}`)).json()
      let liste: Spot[] = j.spots ?? []
      // Zéro écran vide : rien dans le rayon (ou dans le type) → on montre
      // tout, trié par récence, et on annonce la couleur.
      if (liste.length === 0) {
        const j2 = await (await fetch('/api/community/spots')).json()
        liste = j2.spots ?? []
        setHorsZone(true)
      }
      setSpots(liste)
    } catch { setSpots(initialSpots ?? []) }
  }

  const tapChip = (id: string | null) => {
    if (id === chip) return
    if (id === 'near') {
      navigator.geolocation?.getCurrentPosition(
        (p) => { const xy = { lat: p.coords.latitude, lng: p.coords.longitude }; setPos(xy); setChip('near'); void charger('near', xy) },
        () => { /* refus : on reste où on est, sans écran vide ni reproche */ },
        { timeout: 8000 },
      )
      return
    }
    setChip(id)
    void charger(id, pos)
  }

  const utile = (s: Spot) => {
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
        method: 'POST', headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
        body: JSON.stringify({ spotId: s.id }),
      })
      const j = await r.json()
      if (r.ok && j.ok !== false) {
        setConfirmed((c) => ({ ...c, [s.id]: true }))
        setSpots((cur) => cur?.map((x) => (x.id === s.id ? { ...x, confirmations: j.confirmations ?? ((x.confirmations ?? 0) + 1) } : x)) ?? cur)
      } else if (r.status === 401) window.location.href = '/communaute?connexion=1'
    } catch { /* réseau */ } finally { setBusy(null) }
  }
  const partager = (s: Spot) => {
    const url = `${window.location.origin}/spot/${s.id}`
    if (navigator.share) navigator.share({ title: s.nom, url }).catch(() => {})
    else navigator.clipboard?.writeText(url).catch(() => {})
  }
  const itin = (s: Spot) => {
    fetch('/api/community/itineraire', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ spotId: s.id }) }).catch(() => {})
  }

  // Serveur muet (Redis absent, build froid) → le client charge lui-même.
  // Toujours « Tous », jamais de géoloc ici.
  useEffect(() => {
    if (!initialSpots?.length) void charger(null, null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Ouverture du plein écran desktop AU spot cliqué, pas au premier.
  useEffect(() => {
    if (pleinDesktop == null) return
    const el = fluxRef.current
    if (el) el.scrollTop = pleinDesktop * el.clientHeight
  }, [pleinDesktop])

  const surScroll = () => {
    const el = fluxRef.current
    if (!el || !el.clientHeight) return
    setIdx(Math.round(el.scrollTop / el.clientHeight))
  }

  const chips = useMemo(() => [
    { id: null as string | null, label: en ? 'All' : 'Tous' },
    { id: 'near', label: en ? 'Near me' : 'Près de moi' },
    ...CHIP_CATS.map((id) => { const c = CATEGORIES.find((x) => x.id === id)!; return { id: id as string, label: en ? c.en : c.fr } }),
  ], [en])

  const liste = spots ?? []
  const dots = liste.slice(0, 8)

  const flux = (
    <div className="flux" ref={fluxRef} onScroll={surScroll}>
      <div className="flux-chips" role="group" aria-label={en ? 'Filters' : 'Filtres'}>
        {chips.map((c) => (
          <button key={c.id ?? 'all'} className="flux-chip" aria-pressed={chip === c.id} onClick={() => tapChip(c.id)}>{c.label}</button>
        ))}
      </div>
      {dots.length > 1 && (
        <div className="flux-dots" style={{ position: 'fixed' }} aria-hidden>
          {dots.map((s, i) => <span key={s.id} className={`flux-dot${i === Math.min(idx, dots.length - 1) ? ' on' : ''}`} />)}
        </div>
      )}
      {horsZone && (
        <p style={{ position: 'absolute', top: 62, left: 12, right: 12, zIndex: 4, margin: 0, textAlign: 'center', color: 'rgba(253,250,243,.75)', fontSize: 12.5, fontWeight: 600, textShadow: '0 1px 4px rgba(0,0,0,.6)' }}>
          {en ? 'Nothing right here yet — spots from other cities:' : 'Rien juste ici pour l\'instant — les spots des autres villes :'}
        </p>
      )}
      {spots === null && (
        <div className="flux-slide" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <p style={{ color: 'rgba(253,250,243,.55)' }}>{en ? 'Loading…' : 'Chargement…'}</p>
        </div>
      )}
      {liste.map((s, i) => (
        <Ecran key={s.id} s={s} en={en} proche={Math.abs(i - idx) <= 1} horsZone={horsZone}
          thanked={!!thanked[s.id]} confirmed={!!confirmed[s.id]} busy={busy === s.id}
          onUtile={() => utile(s)} onConfirm={() => void confirmer(s)} onShare={() => partager(s)} onItin={() => itin(s)} />
      ))}
    </div>
  )

  return (
    <>
      <div className="flux-solo">{flux}</div>

      {/* Desktop : la même donnée en grille — le clic ouvre le flux plein écran */}
      <div className="flux-grille">
        {liste.map((s, i) => {
          const img = s.photos?.[0] ?? s.photo
          const conf = s.confirmations ?? 0
          return (
            <button key={s.id} onClick={() => { setPleinDesktop(i); setIdx(i) }}
              style={{ textAlign: 'left', border: '1px solid rgba(253,250,243,.12)', borderRadius: 18, overflow: 'hidden', background: 'rgba(255,255,255,.04)', cursor: 'pointer', padding: 0 }}>
              {img
                // eslint-disable-next-line @next/next/no-img-element
                ? <img src={img} alt="" loading="lazy" style={{ width: '100%', height: 240, objectFit: 'cover', display: 'block' }} />
                : <div style={{ height: 240, background: '#1B4332', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 18 }}>
                    <span style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#FDFAF3', fontSize: 21, fontWeight: 700, textAlign: 'center' }}>{s.nom}</span>
                  </div>}
              <div style={{ padding: '12px 14px 14px' }}>
                <span style={{ background: '#C9A84C', color: '#0B1A0F', fontSize: 11, fontWeight: 700, letterSpacing: 1, borderRadius: 8, padding: '3px 8px' }}>
                  {(BADGE[s.categorie ?? 'autre'] ?? BADGE.autre)[en ? 1 : 0]}
                </span>
                <p style={{ color: '#FDFAF3', fontWeight: 800, fontSize: 16.5, margin: '8px 0 0' }}>{s.nom}</p>
                {s.description && <p style={{ color: 'rgba(253,250,243,.7)', fontSize: 13.5, margin: '4px 0 0', lineHeight: 1.45 }}>{s.description}</p>}
                <p style={{ color: 'rgba(253,250,243,.55)', fontSize: 12.5, margin: '8px 0 0' }}>
                  {s.villeNom}{s.distKm != null ? ` · ${s.distKm} km` : ''}{conf > 0 ? ` · ${conf} ${en ? 'confirm' : conf > 1 ? 'confirment' : 'confirme'}` : ''}
                </p>
              </div>
            </button>
          )
        })}
      </div>
      {pleinDesktop != null && (
        <div className="flux-plein-desktop" onClick={(e) => { if (e.target === e.currentTarget) setPleinDesktop(null) }}>
          <button onClick={() => setPleinDesktop(null)} aria-label={en ? 'Close' : 'Fermer'}
            style={{ position: 'absolute', top: 16, right: 16, zIndex: 5, width: 44, height: 44, borderRadius: 999, border: 'none', background: 'rgba(255,255,255,.12)', color: '#FDFAF3', cursor: 'pointer' }}>
            <Ic d="M6 6l12 12M18 6L6 18" size={20} />
          </button>
          {flux}
        </div>
      )}

      {/* Ajouter — flottant, bas centre. DESKTOP SEULEMENT (brief 2a) : sur
          mobile il recouvrirait le CTA Itinéraire, et l'ajout passe déjà par
          le dock. */}
      <Link href="/communaute/ajouter" className="flux-ajouter"
        style={{ position: 'fixed', bottom: 'calc(84px + env(safe-area-inset-bottom))', left: '50%', transform: 'translateX(-50%)', zIndex: 95, display: 'inline-flex', alignItems: 'center', gap: 8, height: 46, padding: '0 18px', borderRadius: 999, background: '#C9A84C', color: '#0B1A0F', fontWeight: 800, fontSize: 14, textDecoration: 'none', boxShadow: '0 6px 20px rgba(0,0,0,.4)' }}>
        <Ic d="M12 5v14M5 12h14" size={18} /> {en ? 'Add a spot · 15 s' : 'Ajouter un spot · 15 s'}
      </Link>
    </>
  )
}
