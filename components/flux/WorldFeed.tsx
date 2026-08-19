'use client'
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'

// 🌍 LE WORLD FEED — on swipe les villes (maquette moteur universel,
// classes imm- : le MÊME contrat visuel que le City feed). Tout le texte
// est rendu côté serveur (SSR) et reste visible sans JavaScript ; le
// script n'ajoute que les gestes : double-tap = wishlist, fil de
// progression, toast. « Explore » ouvre le City feed de la ville — le
// même moteur Immersion, en anglais sur ce domaine.
//
// Sélecteur de flux : seul « World » existe en phase 1 — un bouton sans
// destination n'existe pas, Eat/Sleep/Do arriveront en phase 2.

export interface VillePanneau {
  slug: string
  nom: string
  pays: string
  score: number | null
  image: string | null
  accroche: string | null
  lieuxPriere: number | null
}

const CLE_WISHLIST = 'vh_wishlist_villes'

export default function WorldFeed({ villes }: { villes: VillePanneau[] }) {
  const [wishlist, setWishlist] = useState<string[]>([])
  const [toast, setToast] = useState('')
  const [actif, setActif] = useState(0)
  const fluxRef = useRef<HTMLDivElement>(null)
  const toastTm = useRef<ReturnType<typeof setTimeout> | null>(null)
  const dernierTap = useRef(0)

  useEffect(() => {
    try { setWishlist(JSON.parse(localStorage.getItem(CLE_WISHLIST) ?? '[]')) } catch { /* vide */ }
    const flux = fluxRef.current
    if (!flux) return
    const sections = [...flux.querySelectorAll('.imm-panneau')]
    const obs = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) setActif(sections.indexOf(e.target)) })
    }, { threshold: 0.55 })
    sections.forEach((s) => obs.observe(s))
    return () => obs.disconnect()
  }, [])

  const direToast = (msg: string) => {
    setToast(msg)
    if (toastTm.current) clearTimeout(toastTm.current)
    toastTm.current = setTimeout(() => setToast(''), 1400)
  }

  const garder = (v: VillePanneau) => {
    if (wishlist.includes(v.slug)) return
    const n = [...wishlist, v.slug]
    setWishlist(n)
    try { localStorage.setItem(CLE_WISHLIST, JSON.stringify(n)) } catch { /* plein */ }
    direToast(`♡ ${v.nom} saved to your list`)
  }

  const doubleTap = (e: React.PointerEvent, v: VillePanneau) => {
    if ((e.target as HTMLElement).closest('button,a')) return
    const now = Date.now()
    if (now - dernierTap.current < 320) {
      const c = document.createElement('div')
      c.className = 'imm-burst'; c.textContent = '♥'
      const cadre = (e.currentTarget as HTMLElement).getBoundingClientRect()
      c.style.left = `${e.clientX - cadre.left}px`; c.style.top = `${e.clientY - cadre.top}px`
      e.currentTarget.appendChild(c)
      setTimeout(() => c.remove(), 750)
      garder(v)
    }
    dernierTap.current = now
  }

  const tonScore = (s: number) => (s >= 9 ? 'vert-fonce' : s >= 8 ? 'vert' : s >= 7 ? 'orange' : 'gris')

  return (
    <div style={{ position: 'relative' }}>
      {/* Seul flux existant en phase 1 : World. */}
      <nav className="imm-selecteur" aria-label="Feeds">
        <span className="imm-sel on">World</span>
        <Link className="imm-sel" href="/saves" style={{ textDecoration: 'none' }}>♡ My saves</Link>
      </nav>
      <div className="imm-fil" aria-hidden>
        {villes.map((v, i) => <i key={v.slug} className={i === actif ? 'on' : undefined} />)}
      </div>

      <div className="imm-flux" ref={fluxRef}>
        {villes.map((v, i) => (
          <section key={v.slug} className="imm-panneau imm-stable" onPointerUp={(e) => doubleTap(e, v)}>
            <div className="imm-fond" style={{ background: 'linear-gradient(180deg,#0E2A3F,#123227 55%,#060E08)' }} />
            {v.image && <img className="imm-photo" src={v.image} alt="" loading={i < 2 ? 'eager' : 'lazy'} onError={(e) => e.currentTarget.remove()} />}
            {/* 1er panneau : de l'air pour l'indice « Swipe » sous les actions */}
            <div className="imm-contenu" style={i === 0 ? { paddingBottom: 'calc(148px + env(safe-area-inset-bottom))' } : undefined}>
              <span className="imm-etiquette imm-et-type">DESTINATION</span>
              <h2 className="imm-h1">{v.nom}</h2>
              {v.score != null && (
                <div className="imm-score"><b data-ton={tonScore(v.score)}>✦ {v.score.toLocaleString('en-GB')}</b></div>
              )}
              {v.accroche && <p className="imm-ia">{v.accroche}</p>}
              <p className="imm-meta">
                {v.pays}
                {typeof v.lieuxPriere === 'number' ? ` · ${v.lieuxPriere.toLocaleString('en-GB')} prayer places across the city` : ''}
              </p>
              <div className="imm-actions">
                <Link className="imm-b-or" href={`/destinations/${v.slug}`}>Explore {v.nom}</Link>
                <button className="imm-b-verre" data-garde={wishlist.includes(v.slug) ? '1' : undefined} aria-label="Save" onClick={() => garder(v)}>
                  {wishlist.includes(v.slug) ? '♥' : '♡'}
                </button>
              </div>
            </div>
            {i === 0 && (
              <div className="imm-indice">Swipe to explore · double-tap = ♡<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="m6 9 6 6 6-6" /></svg></div>
            )}
          </section>
        ))}
      </div>

      {toast && <div className="imm-toast">{toast}</div>}
      <p style={{ position: 'fixed', bottom: 2, left: 0, right: 0, textAlign: 'center', zIndex: 50, fontSize: 10.5, color: 'rgba(253,250,243,.35)', margin: 0 }}>
        Map data © OpenStreetMap contributors
      </p>
    </div>
  )
}
