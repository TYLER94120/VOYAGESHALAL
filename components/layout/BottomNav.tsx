'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import { useLocation } from '@/components/location/LocationProvider'
import { localizedHref } from '@/lib/slugs'

// Barre mobile — parité avec le desktop : 5 onglets max (design system),
// dont 🤝 Communauté et 🧰 Outils (panneau avec TOUS les outils).
export default function BottomNav() {
  const pathname = usePathname()
  const { t, lang } = useLanguage()
  const en = lang === 'en'
  const { city } = useLocation()
  const [toolsOpen, setToolsOpen] = useState(false)
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  // Fermer le panneau Outils à chaque navigation
  useEffect(() => { setToolsOpen(false) }, [pathname])

  // « Restos » mène à la ville mémorisée (onglet restos), sinon à la liste des destinations
  const restosHref = city ? `/destinations/${city.slug}` : '/destinations'

  const tools = [
    // 🔎 et non 📍 : c'est la ville qu'on CONSULTE, pas là où l'on est.
    // Sur une capture de Mohamed, ce bouton affichait « 📍 Marrakech »
    // pendant que la barre de position affichait « 📍 Houara Oulad Raho ».
    // Les deux étaient justes ; c'est l'épingle commune qui mentait.
    { href: restosHref, icon: city ? '🔎' : '🗺️', label: city ? `${en ? 'City' : 'Ville'} : ${city.nom}` : 'Destinations' },
    { href: localizedHref('/mosquee-proche', en), icon: '🕌', label: t('nav.mosque') },
    { href: '/qibla', icon: '🧭', label: t('nav.qibla') },
    { href: localizedHref('/planificateur', en), icon: '🗺️', label: en ? 'Trip planner' : 'Planificateur' },
    { href: '/quiz', icon: '🎯', label: en ? 'Destination quiz' : 'Quiz destination' },
    { href: '/autour-de-moi', icon: '📍', label: en ? 'Around me' : 'Autour de moi' },
    { href: '/audio', icon: '🎧', label: en ? 'Audio · Spiritual' : 'Audio · Spirituel' },
    { href: localizedHref('/omra', en), icon: '🕋', label: en ? 'Umrah & Hajj' : 'Omra & Hajj' },
    // Favoris déplacés en fin de menu secondaire (remplacés par Audio)
    { href: localizedHref('/carnet', en), icon: '❤️', label: en ? 'My spots' : 'Mes spots' },
  ]
  const toolsActive = tools.some((tl) => isActive(tl.href.split('?')[0]))

  return (
    <>
      {/* Panneau Outils (bottom sheet au-dessus de la barre) */}
      {toolsOpen && (
        <>
          {/* Le voile s'arrête AU-DESSUS de la barre : les 5 onglets restent cliquables */}
          <div onClick={() => setToolsOpen(false)} style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 'calc(86px + env(safe-area-inset-bottom, 0px))', background: 'rgba(0,0,0,0.45)', zIndex: 98 }} />
          <div style={{ position: 'fixed', left: 10, right: 10, bottom: 'calc(86px + env(safe-area-inset-bottom, 0px))', zIndex: 99, background: '#fff', borderRadius: 22, padding: '14px 14px calc(10px)', boxShadow: '0 -10px 40px rgba(0,0,0,0.2)' }}>
            <p style={{ margin: '2px 4px 10px', fontWeight: 900, fontSize: 15, color: '#0b1a0f' }}>🧰 {en ? 'All tools' : 'Tous les outils'}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {tools.map((tl) => (
                <Link key={tl.href} href={tl.href} onClick={() => setToolsOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, minHeight: 56, padding: '0 14px', borderRadius: 14, background: '#FDFAF3', border: '1px solid rgba(27,67,50,0.12)', textDecoration: 'none', color: '#0b1a0f', fontWeight: 700, fontSize: 14.5 }}>
                  <span style={{ fontSize: 20 }}>{tl.icon}</span> {tl.label}
                </Link>
              ))}
            </div>
          </div>
        </>
      )}

      <nav className="bottom-nav">
        <Link href="/" className={`bottom-nav-item ${pathname === '/' ? 'active' : ''}`}>
          <span className="bottom-nav-icon">🏠</span>
          <span className="bottom-nav-label">{t('bottom.home')}</span>
        </Link>
        {/* Virage Spots : le feed devient l'onglet central ; « Ville » passe
            dans le panneau Outils (les pages destinations restent en ligne) */}
        <Link href="/spots" className={`bottom-nav-item ${isActive('/spots') || isActive('/communaute') || isActive('/spot') ? 'active' : ''}`}>
          <span className="bottom-nav-icon">💎</span>
          <span className="bottom-nav-label">Spots</span>
        </Link>
        <Link href="/communaute/ajouter" className={`bottom-nav-item bottom-nav-plus ${isActive('/communaute/ajouter') ? 'active' : ''}`}>
          <span className="bottom-nav-icon" aria-hidden>+</span>
          <span className="bottom-nav-label">{en ? 'Add' : 'Ajouter'}</span>
        </Link>
        <Link href={localizedHref('/horaires-priere', en)} className={`bottom-nav-item ${isActive('/horaires-priere') ? 'active' : ''}`}>
          <span className="bottom-nav-icon">🕐</span>
          <span className="bottom-nav-label">{t('bottom.prayer')}</span>
        </Link>
        <button type="button" onClick={() => setToolsOpen(!toolsOpen)} className={`bottom-nav-item ${toolsOpen || toolsActive ? 'active' : ''}`} style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}>
          <span className="bottom-nav-icon">🧰</span>
          <span className="bottom-nav-label">{en ? 'Tools' : 'Outils'}</span>
        </button>
      </nav>
    </>
  )
}
