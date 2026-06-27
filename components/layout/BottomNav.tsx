'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function BottomNav() {
  const pathname = usePathname()
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  return (
    <nav className="bottom-nav">
      <Link href="/" className={`bottom-nav-item ${pathname === '/' ? 'active' : ''}`}>
        <span className="bottom-nav-icon">🏠</span>
        <span className="bottom-nav-label">Accueil</span>
      </Link>
      <Link
        href="/destinations"
        className={`bottom-nav-item ${isActive('/destinations') ? 'active' : ''}`}
      >
        <span className="bottom-nav-icon">🗺️</span>
        <span className="bottom-nav-label">Destinations</span>
      </Link>
      <Link
        href="/horaires-priere"
        className={`bottom-nav-item ${isActive('/horaires-priere') ? 'active' : ''}`}
      >
        <span className="bottom-nav-icon">🕐</span>
        <span className="bottom-nav-label">Prière</span>
      </Link>
      <Link href="/qibla" className={`bottom-nav-item ${isActive('/qibla') ? 'active' : ''}`}>
        <span className="bottom-nav-icon">🧭</span>
        <span className="bottom-nav-label">Qibla</span>
      </Link>
      <Link href="/blog" className={`bottom-nav-item ${isActive('/blog') ? 'active' : ''}`}>
        <span className="bottom-nav-icon">📖</span>
        <span className="bottom-nav-label">Blog</span>
      </Link>
    </nav>
  )
}
