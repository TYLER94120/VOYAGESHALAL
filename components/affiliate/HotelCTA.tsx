'use client'
import { track } from '@vercel/analytics'
import { hotelBookingUrl } from '@/lib/affiliate'
import { useLanguage } from '@/components/i18n/LanguageProvider'

// CTA « Réserver un hôtel halal » — revenu n°1 du business plan.
// Placé sur chaque fiche ville. Chaque clic est tracké (Vercel Analytics) pour
// mesurer l'EPMV / le taux de conversion demandé par les KPIs du plan.
export default function HotelCTA({ cityName, variant = 'banner' }: { cityName: string; variant?: 'banner' | 'inline' }) {
  const { lang } = useLanguage()
  const en = lang === 'en'
  const { url, provider } = hotelBookingUrl(cityName)

  const onClick = () => {
    track('hotel_cta_click', { city: cityName, provider, placement: variant })
  }

  const label = en ? 'Book a halal-friendly hotel' : 'Réserver un hôtel halal'
  const sub = en
    ? `Muslim-friendly stays in ${cityName} — alcohol-free options, halal breakfast`
    : `Séjours adaptés à ${cityName} — options sans alcool, petit-déjeuner halal`

  if (variant === 'inline') {
    return (
      <a href={url} target="_blank" rel="sponsored noopener noreferrer" onClick={onClick}
        style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'var(--foret)', color: 'var(--creme)', fontWeight: 700, fontSize: 14, borderRadius: 12, padding: '11px 18px', textDecoration: 'none' }}>
        🏨 {label} ›
      </a>
    )
  }

  return (
    <a href={url} target="_blank" rel="sponsored noopener noreferrer" onClick={onClick}
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 14, background: 'linear-gradient(135deg, #1b4332, #2d6a4f)', color: '#fff', borderRadius: 18, padding: '18px 22px', textDecoration: 'none', boxShadow: '0 8px 24px rgba(27,67,50,0.25)' }}>
      <span style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
        <span style={{ fontWeight: 800, fontSize: 17 }}>🏨 {label}</span>
        <span style={{ fontSize: 13, opacity: 0.85 }}>{sub}</span>
      </span>
      <span style={{ background: 'var(--or)', color: '#1b4332', fontWeight: 800, fontSize: 14, borderRadius: 30, padding: '10px 18px', whiteSpace: 'nowrap' }}>
        {en ? 'View →' : 'Voir →'}
      </span>
    </a>
  )
}
