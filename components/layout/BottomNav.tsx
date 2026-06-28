'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/components/i18n/LanguageProvider'

export default function BottomNav() {
  const pathname = usePathname()
  const { t } = useLanguage()
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  return (
    <nav className="bottom-nav">
      <Link href="/" className={`bottom-nav-item ${pathname === '/' ? 'active' : ''}`}>
        <span className="bottom-nav-icon">🏠</span>
        <span className="bottom-nav-label">{t('bottom.home')}</span>
      </Link>
      <Link
        href="/destinations"
        className={`bottom-nav-item ${isActive('/destinations') ? 'active' : ''}`}
      >
        <span className="bottom-nav-icon">🗺️</span>
        <span className="bottom-nav-label">{t('bottom.destinations')}</span>
      </Link>
      <Link
        href="/horaires-priere"
        className={`bottom-nav-item ${isActive('/horaires-priere') ? 'active' : ''}`}
      >
        <span className="bottom-nav-icon">🕐</span>
        <span className="bottom-nav-label">{t('bottom.prayer')}</span>
      </Link>
      <Link href="/qibla" className={`bottom-nav-item ${isActive('/qibla') ? 'active' : ''}`}>
        <span className="bottom-nav-icon">🧭</span>
        <span className="bottom-nav-label">{t('bottom.qibla')}</span>
      </Link>
      <Link href="/mosquee-proche" className={`bottom-nav-item ${isActive('/mosquee-proche') ? 'active' : ''}`}>
        <span className="bottom-nav-icon">🕌</span>
        <span className="bottom-nav-label">{t('bottom.mosque')}</span>
      </Link>
    </nav>
  )
}
