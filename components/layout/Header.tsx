'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import LanguageSwitcher from '@/components/i18n/LanguageSwitcher'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import { useLocation } from '@/components/location/LocationProvider'
import { localizedHref } from '@/lib/slugs'

export default function Header({ brandEN = false }: { brandEN?: boolean }) {
  const [menuOpen, setMenuOpen] = useState(false)
  // Valeur initiale fournie par le serveur (middleware/domaine) → aucun flash.
  const [isEN, setIsEN] = useState(brandEN)
  const { t } = useLanguage()
  const { city, clearLocation } = useLocation()

  // Filet de sécurité côté client (au cas où le rendu serait servi en cache générique).
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname.includes('gohalaltravel')) setIsEN(true)
  }, [])

  return (
    <header className="header-premium">
      <div className="header-inner">
        {/* Logo */}
        <Link href="/" className="header-logo">
          <span className="logo-icon" style={{ color: '#c9a84c' }}>✦</span>
          <span className="logo-text">
            {isEN ? <>GoHalal<span className="logo-dot">Travel</span></> : <>VoyagesHalal<span className="logo-dot">.fr</span></>}
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="header-nav-desktop">
          <Link href="/" className="nav-link">
            {t('nav.home')}
          </Link>
          <Link href="/destinations" className="nav-link">
            {t('nav.destinations')}
          </Link>
          <Link href={localizedHref('/horaires-priere', isEN)} className="nav-link nav-link-highlight">
            🕐 {t('nav.prayer')}
          </Link>
          <Link href="/qibla" className="nav-link nav-link-highlight">
            🧭 {t('nav.qibla')}
          </Link>
          <Link href={localizedHref('/mosquee-proche', isEN)} className="nav-link nav-link-highlight">
            🕌 {t('nav.mosque')}
          </Link>
          <Link href="/blog" className="nav-link">
            {t('nav.blog')}
          </Link>
        </nav>

        {/* Actions */}
        <div className="header-actions">
          {/* Badge ville mémorisée — visible sur toutes les pages, clic = effacer */}
          {city && (
            <button
              type="button"
              onClick={clearLocation}
              title="Changer de ville"
              aria-label={`Ville actuelle : ${city.nom}. Cliquer pour changer.`}
              style={{
                display: 'flex', alignItems: 'center', gap: '6px',
                background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.4)',
                borderRadius: '20px', padding: '5px 12px', cursor: 'pointer',
              }}
            >
              <span style={{ color: 'var(--or)', fontSize: '13px', fontWeight: 700 }}>📍 {city.nom}</span>
              <span style={{ color: 'rgba(0,0,0,0.35)', fontSize: '11px' }}>✕</span>
            </button>
          )}
          <LanguageSwitcher />
          <Link href="/application" className="btn-app-gold">
            {t('nav.app')}
          </Link>
          {/* Burger mobile */}
          <button
            className="burger-btn"
            aria-label="Menu"
            onClick={() => setMenuOpen(!menuOpen)}
          >
            {menuOpen ? '✕' : '☰'}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="mobile-menu">
          <Link href="/" onClick={() => setMenuOpen(false)}>
            🏠 {isEN ? 'Home' : 'Accueil'}
          </Link>
          <Link href="/destinations" onClick={() => setMenuOpen(false)}>
            🗺️ Destinations
          </Link>
          <Link href={localizedHref('/horaires-priere', isEN)} onClick={() => setMenuOpen(false)}>
            🕐 {isEN ? 'Prayer times' : 'Horaires de prière'}
          </Link>
          <Link href="/qibla" onClick={() => setMenuOpen(false)}>
            🧭 {isEN ? 'Qibla finder' : 'Calculateur Qibla'}
          </Link>
          <Link href={localizedHref('/mosquee-proche', isEN)} onClick={() => setMenuOpen(false)}>
            🕌 {isEN ? 'Nearest mosque' : 'Mosquée la plus proche'}
          </Link>
          <Link href="/blog" onClick={() => setMenuOpen(false)}>
            📖 Blog &amp; Guides
          </Link>
          <Link href={localizedHref('/omra', isEN)} onClick={() => setMenuOpen(false)}>
            🕌 {isEN ? 'Umrah & Hajj' : 'Omra & Hajj'}
          </Link>
          <Link href="/contact" onClick={() => setMenuOpen(false)}>
            ✉️ Contact
          </Link>
        </div>
      )}
    </header>
  )
}
