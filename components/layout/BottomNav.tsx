'use client'
import { useEffect, useState } from 'react'
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

  const tools = [
    // La ville a quitté cette liste : Mohamed — « je ne vois pas à quoi sert
    // la ville dans Outils ». Il avait raison, elle doublonnait le menu
    // Destinations. La météo prend sa place, parce qu'en voyage on veut
    // savoir s'il va pleuvoir avant de sortir pour Maghrib.
    { href: localizedHref('/meteo', en), icon: '🌤️', label: en ? 'Weather' : 'Météo' },
    // 📐 15 août — Mohamed : « vérifie tous les écarts » PC/téléphone.
    // Diff complet des deux menus Outils : il manquait ici Destinations,
    // Communauté et Horaires de prière, présents sur PC. Les deux menus
    // listent désormais les MÊMES outils.
    { href: '/destinations', icon: '🗺️', label: t('nav.destinations') },
    { href: '/communaute', icon: '🤝', label: en ? 'Community · profiles' : 'Communauté · profils' },
    { href: localizedHref('/horaires-priere', en), icon: '🕐', label: t('nav.prayer') },
    { href: localizedHref('/mosquee-proche', en), icon: '🕌', label: t('nav.mosque') },
    { href: '/qibla', icon: '🧭', label: t('nav.qibla') },
    { href: localizedHref('/planificateur', en), icon: '🗺️', label: en ? 'Trip planner' : 'Planificateur' },
    { href: '/quiz', icon: '🎯', label: en ? 'Destination quiz' : 'Quiz destination' },
    { href: '/autour-de-moi', icon: '📍', label: en ? 'Around me' : 'Autour de moi' },
    { href: '/audio', icon: '🎧', label: en ? 'Audio · Spiritual' : 'Audio · Spirituel' },
    { href: localizedHref('/omra', en), icon: '🕋', label: en ? 'Umrah & Hajj' : 'Omra & Hajj' },
    // Favoris déplacés en fin de menu secondaire (remplacés par Audio)
    // « Mes spots » ne veut rien dire pour quelqu'un qui arrive : ce sont
    // les adresses qu'il a gardées. On l'écrit comme ça.
    { href: localizedHref('/carnet', en), icon: '❤️', label: en ? 'My saved places' : 'Mes adresses gardées' },
    // Descendus du dock : utiles, mais pas ce qu'on vient chercher.
    { href: '/spots', icon: '💎', label: en ? 'Community finds' : 'Les trouvailles de la communauté' },
    { href: '/communaute/ajouter', icon: '➕', label: en ? 'Add a place' : 'Ajouter une adresse' },
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
        <Link href={localizedHref('/horaires-priere', en)} className={`bottom-nav-item ${isActive('/horaires-priere') ? 'active' : ''}`}>
          <span className="bottom-nav-icon">🕌</span>
          <span className="bottom-nav-label">{t('bottom.prayer')}</span>
        </Link>
        {/* 🔴 LE BOUTON CENTRAL CHANGE DE MÉTIER — Mohamed, 16 août :
            « Le "＋ Ajouter" occupait la place la plus accessible du pouce
            pour une action que 99 % des visiteurs ne feront jamais. »
            Elle revient à « Autour de moi », qui est ce que le site fait de
            plus utile et ce qu'on vient y chercher. Ajouter et Mes adresses
            descendent dans Outils, où on les cherche quand on en a besoin. */}
        <Link href="/autour-de-moi" className={`bottom-nav-item bottom-nav-plus ${isActive('/autour-de-moi') ? 'active' : ''}`}>
          <span className="bottom-nav-icon" aria-hidden>📍</span>
          <span className="bottom-nav-label">{en ? 'Around me' : 'Autour de moi'}</span>
        </Link>
        <Link href="/destinations" className={`bottom-nav-item ${isActive('/destinations') || isActive('/spots') || isActive('/spot') ? 'active' : ''}`}>
          <span className="bottom-nav-icon">🌍</span>
          <span className="bottom-nav-label">{en ? 'Travel' : 'Voyages'}</span>
        </Link>
        <button type="button" onClick={() => setToolsOpen(!toolsOpen)} className={`bottom-nav-item ${toolsOpen || toolsActive ? 'active' : ''}`} style={{ background: 'none', border: 'none', cursor: 'pointer', font: 'inherit' }}>
          <span className="bottom-nav-icon">🧰</span>
          <span className="bottom-nav-label">{en ? 'Tools' : 'Outils'}</span>
        </button>
      </nav>
    </>
  )
}
