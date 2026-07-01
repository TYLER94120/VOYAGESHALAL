'use client'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import { useLocation } from '@/components/location/LocationProvider'
import { localizedHref } from '@/lib/slugs'

export default function BottomNav() {
  const pathname = usePathname()
  const { t, lang } = useLanguage()
  const en = lang === 'en'
  const { city } = useLocation()
  const isActive = (path: string) => pathname === path || pathname.startsWith(path + '/')

  // « Restos » mène à la ville mémorisée (onglet restos), sinon à la liste des destinations
  const restosHref = city ? `/destinations/${city.slug}` : '/destinations'

  return (
    <nav className="bottom-nav">
      <Link href="/" className={`bottom-nav-item ${pathname === '/' ? 'active' : ''}`}>
        <span className="bottom-nav-icon">🏠</span>
        <span className="bottom-nav-label">{t('bottom.home')}</span>
      </Link>
      <Link href={restosHref} className={`bottom-nav-item ${isActive('/destinations') ? 'active' : ''}`}>
        <span className="bottom-nav-icon">{city ? '📍' : '🏙️'}</span>
        <span className="bottom-nav-label" style={{ maxWidth: 64, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{city ? city.nom : (en ? 'City' : 'Ville')}</span>
      </Link>
      <Link href={localizedHref('/mosquee-proche', en)} className={`bottom-nav-item ${isActive('/mosquee-proche') ? 'active' : ''}`}>
        <span className="bottom-nav-icon">🕌</span>
        <span className="bottom-nav-label">{t('bottom.mosque')}</span>
      </Link>
      <Link href={localizedHref('/horaires-priere', en)} className={`bottom-nav-item ${isActive('/horaires-priere') ? 'active' : ''}`}>
        <span className="bottom-nav-icon">🕐</span>
        <span className="bottom-nav-label">{t('bottom.prayer')}</span>
      </Link>
      <Link href="/qibla" className={`bottom-nav-item ${isActive('/qibla') ? 'active' : ''}`}>
        <span className="bottom-nav-icon">🧭</span>
        <span className="bottom-nav-label">{t('bottom.qibla')}</span>
      </Link>
    </nav>
  )
}
