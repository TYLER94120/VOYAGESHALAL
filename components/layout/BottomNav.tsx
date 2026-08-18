'use client'
import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import { localizedHref } from '@/lib/slugs'

// Barre mobile — parité avec le desktop : 5 onglets max (design system),
// dont 🤝 Communauté et 🧰 Outils (panneau avec TOUS les outils).
export default function BottomNav() {
  const pathname = usePathname()
  const { t, lang } = useLanguage()
  const en = lang === 'en'
  const [toolsOpen, setToolsOpen] = useState(false)
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  // Fermer le panneau Outils à chaque navigation
  useEffect(() => { setToolsOpen(false) }, [pathname])

  // 🚪 UNE FEUILLE MODALE SE FERME COMME PARTOUT AILLEURS (correction du
  // 18 août : « il ne se ferme qu'en réappuyant sur l'onglet ») :
  // - tap n'importe où dehors : le voile ci-dessous le fait déjà ;
  // - bouton retour du téléphone/navigateur : on pousse une entrée
  //   d'historique à l'ouverture, le retour la consomme et ferme le
  //   panneau au lieu de quitter la page ;
  // - glissement vers le bas sur la feuille : > 55 px = fermeture.
  const ouvrirOutils = () => {
    setVoirPlus(false) // le panneau rouvre toujours sur les 6 essentiels
    setToolsOpen(true)
    try { window.history.pushState({ vhOutils: true }, '') } catch { /* SSR */ }
  }
  const fermerOutils = (parHistorique = false) => {
    setToolsOpen(false)
    // On retire l'entrée d'historique qu'on avait poussée — sauf si c'est
    // justement le retour qui vient de la consommer.
    if (!parHistorique && window.history.state?.vhOutils) window.history.back()
  }
  useEffect(() => {
    const onPop = () => setToolsOpen(false)
    window.addEventListener('popstate', onPop)
    return () => window.removeEventListener('popstate', onPop)
  }, [])
  const [glisse, setGlisse] = useState<number | null>(null)
  const [voirPlus, setVoirPlus] = useState(false)

  // 📌 CORRECTION 7 — « la barre du bas disparaît parfois » (iPhone).
  // Sur Safari iOS, un élément `position: fixed` est peint par rapport au
  // LAYOUT viewport ; quand le clavier vient de se fermer ou que la barre
  // d'outils Safari se déploie, le viewport VISUEL est plus court, et la
  // nav reste dessinée sous l'écran — on n'en voit que le bord supérieur.
  // On la recale donc sur le viewport visuel à chaque changement :
  // bottom = 10px + safe-area + (hauteur cachée sous le viewport visuel).
  const navRef = useRef<HTMLElement | null>(null)
  useEffect(() => {
    const vv = window.visualViewport
    const el = navRef.current
    if (!vv || !el) return
    const cale = () => {
      const cache = Math.max(0, window.innerHeight - vv.height - vv.offsetTop)
      el.style.bottom = cache > 1 ? `${Math.round(cache)}px` : '' // collée au bord sinon
    }
    vv.addEventListener('resize', cale)
    vv.addEventListener('scroll', cale)
    cale()
    return () => { vv.removeEventListener('resize', cale); vv.removeEventListener('scroll', cale) }
  }, [])

  // 🗂 REGROUPEMENT VALIDÉ PAR MOHAMED (18 août, « OK REGROUPEMENT ») :
  // 14 entrées c'était trop. Six ESSENTIELS d'abord — ce qu'on vient
  // vraiment chercher dans Outils — et le reste sous « Plus », replié.
  // « Autour de moi » vit sous Plus : il a déjà son onglet dans la barre.
  const essentiels = [
    { href: localizedHref('/horaires-priere', en), icon: '🕐', label: t('nav.prayer') },
    { href: '/qibla', icon: '🧭', label: t('nav.qibla') },
    { href: localizedHref('/mosquee-proche', en), icon: '🕌', label: t('nav.mosque') },
    { href: '/trouvailles', icon: '💎', label: en ? 'Community finds' : 'Trouvailles' },
    // « Mes spots » ne veut rien dire pour qui arrive : ce sont les
    // adresses qu'il a gardées. On l'écrit comme ça.
    { href: localizedHref('/carnet', en), icon: '❤️', label: en ? 'My saved places' : 'Mes adresses gardées' },
    { href: '/communaute/ajouter', icon: '➕', label: en ? 'Add a find' : 'Ajouter une trouvaille' },
  ]
  const secondaires = [
    { href: localizedHref('/meteo', en), icon: '🌤️', label: en ? 'Weather' : 'Météo' },
    { href: '/destinations', icon: '🗺️', label: t('nav.destinations') },
    { href: '/communaute', icon: '🤝', label: en ? 'Community · profiles' : 'Communauté · profils' },
    { href: localizedHref('/planificateur', en), icon: '🗺️', label: en ? 'Trip planner' : 'Planificateur' },
    { href: '/quiz', icon: '🎯', label: en ? 'Destination quiz' : 'Quiz destination' },
    { href: '/audio', icon: '🎧', label: en ? 'Audio · Spiritual' : 'Audio · Spirituel' },
    { href: localizedHref('/omra', en), icon: '🕋', label: en ? 'Umrah & Hajj' : 'Omra & Hajj' },
    { href: '/autour-de-moi', icon: '📍', label: en ? 'Around me' : 'Autour de moi' },
  ]
  const tools = [...essentiels, ...secondaires]
  const toolsActive = tools.some((tl) => isActive(tl.href.split('?')[0]))

  return (
    <>
      {/* Panneau Outils (bottom sheet au-dessus de la barre) */}
      {toolsOpen && (
        <>
          {/* Le voile s'arrête AU-DESSUS de la barre : les 5 onglets restent cliquables */}
          <div onClick={() => fermerOutils()} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 'calc(76px + env(safe-area-inset-bottom, 0px))', background: 'rgba(0,0,0,0.45)', zIndex: 98 }} />
          <div
            onTouchStart={(e) => setGlisse(e.touches[0].clientY)}
            onTouchMove={(e) => { if (glisse != null && e.touches[0].clientY - glisse > 55) { setGlisse(null); fermerOutils() } }}
            onTouchEnd={() => setGlisse(null)}
            style={{ position: 'fixed', left: 10, right: 10, bottom: 'calc(76px + env(safe-area-inset-bottom, 0px))', zIndex: 99, background: '#fff', borderRadius: 22, padding: '14px 14px calc(10px)', boxShadow: '0 -10px 40px rgba(0,0,0,0.2)' }}>
            <div aria-hidden style={{ width: 44, height: 4, borderRadius: 99, background: 'rgba(11,26,15,0.25)', margin: '0 auto 10px' }} />
            <p style={{ margin: '2px 4px 10px', fontWeight: 900, fontSize: 15, color: '#0b1a0f' }}>🧰 {en ? 'All tools' : 'Tous les outils'}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {(voirPlus ? tools : essentiels).map((tl) => (
                <Link key={tl.href} href={tl.href} onClick={() => fermerOutils()} style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 56, padding: '0 14px', borderRadius: 14, background: '#FDFAF3', border: '1px solid rgba(27,67,50,0.12)', textDecoration: 'none', color: '#0b1a0f', fontWeight: 700, fontSize: 14.5 }}>
                  <span style={{ fontSize: 20 }}>{tl.icon}</span> {tl.label}
                </Link>
              ))}
              {!voirPlus && (
                <button type="button" onClick={() => setVoirPlus(true)} aria-expanded={false}
                  style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, minHeight: 56, padding: '0 14px', borderRadius: 14, background: 'none', border: '1.5px dashed rgba(27,67,50,0.3)', color: '#1b4332', fontWeight: 800, fontSize: 14.5, cursor: 'pointer', gridColumn: '1 / -1' }}>
                  {en ? `More (${secondaires.length})` : `Plus (${secondaires.length})`}
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m6 9 6 6 6-6" /></svg>
                </button>
              )}
            </div>
          </div>
        </>
      )}

      <nav className="bottom-nav" ref={navRef}>
        {/* 🔵 CINQ ENTRÉES ÉGALES — brief du 17 août : « plus de blob
            central ». Le rond doré surélevé attirait le pouce, mais il
            cassait la grille et laissait croire à une action spéciale là où
            il n'y a qu'un onglet parmi cinq. Actif = or + barrette 16×3.
            Et zéro emoji : des tracés SVG, identiques sur tous les
            appareils — un emoji change de dessin d'un téléphone à l'autre. */}
        <Link href="/" className={`bottom-nav-item ${pathname === '/' ? 'active' : ''}`}>
          <span className="bottom-nav-icon"><svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden><path d="M3.5 11 12 3.5 20.5 11" /><path d="M5.5 9.6V20.5h13V9.6" /><path d="M10 20.5v-5h4v5" /></svg></span>
          <span className="bottom-nav-label">{t('bottom.home')}</span>
        </Link>
        <Link href={localizedHref('/horaires-priere', en)} className={`bottom-nav-item ${isActive('/horaires-priere') ? 'active' : ''}`}>
          <span className="bottom-nav-icon"><svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden><circle cx="12" cy="12" r="9" /><path d="M12 6.8V12l3.5 2.1" /></svg></span>
          <span className="bottom-nav-label">{t('bottom.prayer')}</span>
        </Link>
        <Link href="/autour-de-moi" className={`bottom-nav-item ${isActive('/autour-de-moi') ? 'active' : ''}`}>
          <span className="bottom-nav-icon"><svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden><path d="M21 3 10.5 13.5M21 3l-6.5 18-3-7.5L3 10z" /></svg></span>
          <span className="bottom-nav-label">{en ? 'Around' : 'Autour'}</span>
        </Link>
        <Link href="/destinations" className={`bottom-nav-item ${isActive('/destinations') || isActive('/trouvailles') || isActive('/spot') ? 'active' : ''}`}>
          <span className="bottom-nav-icon"><svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden><circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3.5 3.8 3.5 14.2 0 18M12 3c-3.5 3.8-3.5 14.2 0 18" /></svg></span>
          <span className="bottom-nav-label">{en ? 'Travel' : 'Voyages'}</span>
        </Link>
        <button type="button" onClick={() => (toolsOpen ? fermerOutils() : ouvrirOutils())} className={`bottom-nav-item ${toolsOpen || toolsActive ? 'active' : ''}`} style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}>
          <span className="bottom-nav-icon"><svg viewBox="0 0 24 24" width="23" height="23" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden><rect x="4" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" /><rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" /><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" /></svg></span>
          <span className="bottom-nav-label">{en ? 'Tools' : 'Outils'}</span>
        </button>
      </nav>
    </>
  )
}
