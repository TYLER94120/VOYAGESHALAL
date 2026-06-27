'use client'
import { useState } from 'react'
import Link from 'next/link'

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false)

  return (
    <header className="header-premium">
      <div className="header-inner">
        {/* Logo */}
        <Link href="/" className="header-logo">
          <span className="logo-icon">🕌</span>
          <span className="logo-text">
            VoyagesHalal<span className="logo-dot">.fr</span>
          </span>
        </Link>

        {/* Nav desktop */}
        <nav className="header-nav-desktop">
          <Link href="/destinations" className="nav-link">
            Destinations
          </Link>
          <Link href="/horaires-priere" className="nav-link nav-link-highlight">
            🕐 Horaires
          </Link>
          <Link href="/qibla" className="nav-link nav-link-highlight">
            🧭 Qibla
          </Link>
          <Link href="/blog" className="nav-link">
            Blog
          </Link>
          <Link href="/omra" className="nav-link">
            Omra &amp; Hajj
          </Link>
        </nav>

        {/* Actions */}
        <div className="header-actions">
          <div className="lang-switcher">
            <span>FR</span>
            <span>·</span>
            <span>EN</span>
          </div>
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
          <Link href="/destinations" onClick={() => setMenuOpen(false)}>
            🗺️ Destinations
          </Link>
          <Link href="/horaires-priere" onClick={() => setMenuOpen(false)}>
            🕐 Horaires de prière
          </Link>
          <Link href="/qibla" onClick={() => setMenuOpen(false)}>
            🧭 Calculateur Qibla
          </Link>
          <Link href="/blog" onClick={() => setMenuOpen(false)}>
            📖 Blog &amp; Guides
          </Link>
          <Link href="/omra" onClick={() => setMenuOpen(false)}>
            🕌 Omra &amp; Hajj
          </Link>
          <Link href="/contact" onClick={() => setMenuOpen(false)}>
            ✉️ Contact
          </Link>
        </div>
      )}
    </header>
  )
}
