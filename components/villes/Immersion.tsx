'use client'
/* eslint-disable @next/next/no-img-element */
import { useEffect, useMemo, useRef, useState } from 'react'
import { tirer } from '@/lib/immersionTirage.mjs'
import type { PanneauImmersion } from '@/app/api/immersion/route'

// 🎬 IMMERSION — la ville se découvre en plein écran, un lieu par écran,
// en swipe vertical (chantier validé le 19 août, Étape 0 approuvée).
// CSS contractuel de maquette-immersion.html (classes imm-, globals.css).
//
// Règle B : tout vient du pool serveur (/api/immersion — Places + notre
// base + OSM, en cache 7 j) ; un champ absent ne s'affiche pas. Le flux
// ne contient JAMAIS les listes : la feuille « ☰ Pratique » renvoie vers
// la couche pratique de la page (hôtels, adresses, planning, à savoir).
// Résilience : le contenu est visible MÊME sans JavaScript — la classe
// imm-js (posée par effet, retirée par filet de sécurité) ne fait
// qu'ajouter l'entrée en cascade.

interface Ia {
  faits?: { avant: string; nuance?: string; ton: 'vert' | 'orange' }[]
}
export interface Pool { ville: string; panneaux: PanneauImmersion[]; contradictions?: unknown[] }
interface Garde { id: string; nom: string; lat: number; lng: number }

const CLE_GARDES = (slug: string) => `vh_immersion_gardes:${slug}`
const CLE_VUS = (slug: string) => `vh_immersion_vus:${slug}`

function IcPin() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ display: 'inline-block' }}><path d="M12 21s7-5.1 7-11a7 7 0 0 0-14 0c0 5.9 7 11 7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" /></svg>
}
function IcPartage() {
  return <svg width="21" height="21" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M12 3v12M8 7l4-4 4 4M5 13v6h14v-6" /></svg>
}

const ETIQUETTES_DEFAUT: Record<string, string> = {
  monument: 'LIEU EMBLÉMATIQUE', experience: 'EXPÉRIENCE', joker: 'À NE PAS RATER', hotel: 'SANS ALCOOL', table: 'TABLE HALAL',
}

export default function Immersion({ slug, nom, score, ton, niveau, pool, onOuvrir, en = false }: {
  slug: string; nom: string
  score: number | null; ton: string | null; niveau: string | null
  pool: Pool
  /** Ouvre une section de la couche pratique PAR-DESSUS le flux
   *  ('hotels' | 'adresses' | 'planning' | 'savoir'). */
  onOuvrir: (section: string) => void
  en?: boolean
}) {
  const t = (fr: string, an: string) => (en ? an : fr)
  const [ia, setIa] = useState<Ia | null>(null)
  const [panneaux, setPanneaux] = useState<PanneauImmersion[]>([])
  const [gardes, setGardes] = useState<Garde[]>([])
  const [feuille, setFeuille] = useState(false)
  const [toast, setToast] = useState('')
  const [actif, setActif] = useState(0)
  const fluxRef = useRef<HTMLDivElement>(null)
  const toastTm = useRef<ReturnType<typeof setTimeout> | null>(null)

  // ── le verdict IA (même source que la couche pratique, cache serveur) ──
  useEffect(() => {
    const ac = new AbortController()
    fetch(`/api/ville-ia?slug=${encodeURIComponent(slug)}&lang=${en ? 'en' : 'fr'}`, { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : null)).then(setIa).catch(() => {})
    try { setGardes(JSON.parse(localStorage.getItem(CLE_GARDES(slug)) ?? '[]')) } catch { /* vide */ }
    return () => ac.abort()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // ── tirage (nouveau à chaque ouverture ; lien profond ?lieu= en tête) ──
  const nouveauTirage = (p: Pool) => {
    let vus: string[] = []
    try { vus = JSON.parse(sessionStorage.getItem(CLE_VUS(slug)) ?? '[]') } catch { /* première visite */ }
    const { panneaux: tires } = tirer(p.panneaux as never[], vus) as unknown as { panneaux: PanneauImmersion[] }
    const cible = new URLSearchParams(window.location.search).get('lieu')
    if (cible) {
      const lieu = p.panneaux.find((x) => x.id === cible)
      if (lieu) {
        const sans = tires.filter((x) => x.id !== cible)
        tires.length = 0
        tires.push(lieu, ...sans)
      }
    }
    try { sessionStorage.setItem(CLE_VUS(slug), JSON.stringify([...vus, ...tires.map((x) => x.id)].slice(-200))) } catch { /* plein */ }
    setPanneaux(tires)
    fluxRef.current?.scrollTo({ top: 0 })
  }
  useEffect(() => { nouveauTirage(pool) }, [pool]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── entrée en cascade : bonus AVEC filet — sans script, tout est visible ──
  useEffect(() => {
    if (!panneaux.length) return
    const flux = fluxRef.current
    if (!flux) return
    flux.classList.add('imm-js')
    const filet = setTimeout(() => { if (!flux.querySelector('.imm-vu')) flux.classList.remove('imm-js') }, 800)
    const sections = [...flux.querySelectorAll('.imm-panneau')]
    const obs = new IntersectionObserver((es) => {
      es.forEach((e) => {
        if (!e.isIntersecting) return
        e.target.classList.add('imm-vu')
        setActif(sections.indexOf(e.target))
      })
    }, { threshold: 0.55 })
    sections.forEach((s) => obs.observe(s))
    sections[0]?.classList.add('imm-vu')
    return () => { clearTimeout(filet); obs.disconnect() }
  }, [panneaux])

  const direToast = (msg: string) => {
    setToast(msg)
    if (toastTm.current) clearTimeout(toastTm.current)
    toastTm.current = setTimeout(() => setToast(''), 1400)
  }

  const garder = (p: PanneauImmersion) => {
    if (gardes.some((g) => g.id === p.id)) return
    const n = [...gardes, { id: p.id, nom: p.nom, lat: p.lat, lng: p.lng }]
    setGardes(n)
    try { localStorage.setItem(CLE_GARDES(slug), JSON.stringify(n)) } catch { /* plein */ }
    direToast(`♡ ${p.nom} ${t('gardé', 'saved')}`)
  }

  // double-tap = ♡ + cœur qui éclot à l'endroit du tap
  const dernierTap = useRef(0)
  const doubleTap = (e: React.PointerEvent, p: PanneauImmersion) => {
    if ((e.target as HTMLElement).closest('button,a')) return
    const now = Date.now()
    if (now - dernierTap.current < 320) {
      const c = document.createElement('div')
      c.className = 'imm-burst'; c.textContent = '♥'
      const cadre = (e.currentTarget as HTMLElement).getBoundingClientRect()
      c.style.left = `${e.clientX - cadre.left}px`; c.style.top = `${e.clientY - cadre.top}px`
      e.currentTarget.appendChild(c)
      setTimeout(() => c.remove(), 750)
      garder(p)
    }
    dernierTap.current = now
  }

  const partager = (p: PanneauImmersion) => {
    // Lien profond vers CE lieu dans CETTE ville — le moteur de croissance.
    const url = `${window.location.origin}/destinations/${slug}?lieu=${encodeURIComponent(p.id)}`
    if (navigator.share) {
      navigator.share({ title: `${p.nom} — VoyagesHalal`, text: t(`Regarde cette pépite à ${nom} : ${p.nom}`, `Look at this gem in ${nom}: ${p.nom}`), url }).catch(() => {})
    } else {
      void navigator.clipboard?.writeText(url)
      direToast(t(`Lien de « ${p.nom} » copié`, `Link for “${p.nom}” copied`))
    }
  }

  const aller = (p: PanneauImmersion) => `https://www.google.com/maps/dir/?api=1&destination=${p.lat},${p.lng}`

  const avecOsm = useMemo(() => pool.panneaux.some((p) => p.sources.includes('base_vh') || p.osmId), [pool])

  if (!panneaux.length) return null

  const totalPanneaux = panneaux.length + 2

  return (
    <div style={{ position: 'relative' }}>
      <button className="imm-pratique" onClick={() => setFeuille(true)}>☰ {t('Pratique', 'Essentials')}</button>
      <div className="imm-fil" aria-hidden>
        {Array.from({ length: totalPanneaux }).map((_, i) => <i key={i} className={i === actif ? 'on' : undefined} />)}
      </div>

      <div className="imm-flux" ref={fluxRef}>
        {/* ===== 1. LE VERDICT (fixe) — jamais animé : le premier écran
            doit être net à 100 % dès la première image (retour du 19 août,
            « la première page s'affiche mal »). ===== */}
        <section className="imm-panneau imm-stable">
          <div className="imm-fond" style={{ background: 'linear-gradient(180deg,#0E2A3F,#123227 50%,#060E08)' }} />
          {/* de l'air au-dessus de l'indice « Swipe » : il chevauchait le 3e fait */}
          <div className="imm-contenu" style={{ paddingBottom: 'calc(148px + env(safe-area-inset-bottom))' }}>
            <span className="imm-etiquette imm-et-type">{t('GUIDE HALAL', 'HALAL GUIDE')}</span>
            <h1 className="imm-h1">{nom}</h1>
            {score != null && (
              <div className="imm-score"><b data-ton={ton ?? undefined}>✦ {score.toLocaleString(en ? 'en-GB' : 'fr-FR')}</b><span style={{ fontWeight: 600 }}>{niveau}</span></div>
            )}
            {(ia?.faits?.length ?? 0) > 0 && (
              <div className="imm-v-faits">
                {ia!.faits!.slice(0, 3).map((f, i) => (
                  <div key={i} className="imm-fait"><span className={`imm-pt${f.ton === 'orange' ? ' o' : ''}`} />{f.avant}{f.nuance ? ` — ${f.nuance}` : ''}</div>
                ))}
              </div>
            )}
          </div>
          <div className="imm-indice">{t('Swipe pour découvrir · double-tap = ♡', 'Swipe to explore · double-tap = ♡')}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="m6 9 6 6 6-6" /></svg></div>
        </section>

        {/* ===== 2..N-1 : LE POOL, tiré au sort ===== */}
        {panneaux.map((p, i) => (
          <section key={p.id} className="imm-panneau" onPointerUp={(e) => doubleTap(e, p)}>
            <div className="imm-fond" style={{ background: 'linear-gradient(180deg,#14263B,#060E08)' }} />
            <img className="imm-photo" src={p.photo} alt="" loading={i < 2 ? 'eager' : 'lazy'} fetchPriority={i === 0 ? 'high' : i === 1 ? 'auto' : 'low'}
              onError={(e) => e.currentTarget.remove()} />
            <div className="imm-contenu">
              <span className={`imm-etiquette ${p.badge ? 'imm-et-halal' : 'imm-et-type'}`} data-badge={p.badge}>
                {p.badge ? `✓ ${p.badge === 'vert' ? t('HALAL VÉRIFIÉ', 'VERIFIED HALAL') : t('SIGNALÉ HALAL', 'REPORTED HALAL')}` : (p.etiquette ?? ETIQUETTES_DEFAUT[p.cat])}
              </span>
              <h2 className="imm-h2">{p.nom}</h2>
              {p.conseil && <p className="imm-ia">{p.conseil}</p>}
              <p className="imm-meta">
                {[
                  p.quartier,
                  typeof p.note === 'number' ? `★ ${p.note.toLocaleString(en ? 'en-GB' : 'fr-FR')}` : null,
                  typeof p.nbAvis === 'number' ? `${p.nbAvis.toLocaleString(en ? 'en-GB' : 'fr-FR')} ${t('avis', 'reviews')}` : null,
                  typeof p.prix === 'number' && p.prix > 0 ? '€'.repeat(p.prix) : null,
                ].filter(Boolean).join(' · ')}
              </p>
              <div className="imm-actions">
                <a className="imm-b-or" href={aller(p)} target="_blank" rel="noopener noreferrer"><IcPin /> {p.cat === 'hotel' ? t('Réserver', 'Book') : t('Y aller', 'Go')}</a>
                <button className="imm-b-verre" data-garde={gardes.some((g) => g.id === p.id) ? '1' : undefined} aria-label={t('Garder', 'Save')} onClick={() => garder(p)}>
                  {gardes.some((g) => g.id === p.id) ? '♥' : '♡'}
                </button>
                <button className="imm-b-verre" aria-label={t('Partager', 'Share')} onClick={() => partager(p)}><IcPartage /></button>
              </div>
            </div>
          </section>
        ))}

        {/* ===== N : LA SUITE (fixe) ===== */}
        <section className="imm-panneau imm-final">
          <div className="imm-contenu">
            <div className="imm-orn">۞</div>
            <h2 className="imm-h2">{t(`${nom} te plaît ?`, `Like ${nom}?`)}</h2>
            <p>{t('Tes coups de cœur sont gardés.', 'Your favourites are saved.')}<br />{t('On peut maintenant construire tes journées,', 'Now we can build your days,')}<br />{t('rythmées par les 5 prières.', 'shaped around the 5 prayers.')}</p>
            <div className="imm-compteur">♡ {gardes.length} {t(`lieu${gardes.length > 1 ? 'x' : ''} gardé${gardes.length > 1 ? 's' : ''}`, `place${gardes.length > 1 ? 's' : ''} saved`)}</div>
            <div className="imm-chips">{gardes.map((g) => <span key={g.id} className="imm-chip">{g.nom}</span>)}</div>
            <div className="imm-actions" style={{ flexDirection: 'column' }}>
              <button className="imm-b-or" style={{ flex: 'none', width: '100%' }} onClick={() => onOuvrir('planning')}>✦ {t('Construire mes journées', 'Build my days')}</button>
              <button className="imm-b-verre" style={{ width: '100%', fontSize: 15, fontWeight: 600 }} onClick={() => nouveauTirage(pool)}>↺ {t('Me montrer d’autres pépites', 'Show me other gems')}</button>
            </div>
            {avecOsm && <p style={{ fontSize: 11.5, color: 'rgba(253,250,243,.35)', marginTop: 18 }}>{t('Données cartographiques © les contributeurs OpenStreetMap', 'Map data © OpenStreetMap contributors')}</p>}
          </div>
        </section>
      </div>

      {/* ===== feuille « Pratique » — les listes vivent ICI, jamais dans le flux ===== */}
      {feuille && (
        <div className="imm-voile" onClick={() => setFeuille(false)}>
          <div className="imm-feuille" onClick={(e) => e.stopPropagation()}>
            <div className="imm-poignee" />
            <h3>{nom} {t('pratique', 'essentials')}</h3>
            <button className="imm-f-item" onClick={() => { setFeuille(false); onOuvrir('hotels') }}><span>{t('Tous les hôtels', 'All hotels')}<small>{t('choisir par priorité', 'choose by priority')}</small></span></button>
            <button className="imm-f-item" onClick={() => { setFeuille(false); onOuvrir('adresses') }}><span>{t('Toutes les tables halal', 'All halal tables')}<small>{t('l’annuaire complet', 'the full directory')}</small></span></button>
            <a className="imm-f-item" href={`/priere/${slug}`}><span>{t('Mosquées & horaires de prière', 'Mosques & prayer times')}<small>{t(`calculés pour ${nom}`, `computed for ${nom}`)}</small></span></a>
            <button className="imm-f-item" onClick={() => { setFeuille(false); onOuvrir('savoir') }}><span>{t('À savoir avant de partir', 'Before you land')}<small>{t('monnaie · transport · mots utiles', 'currency · transit · useful words')}</small></span></button>
          </div>
        </div>
      )}
      {toast && <div className="imm-toast">{toast}</div>}
    </div>
  )
}
