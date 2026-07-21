'use client'
import Link from 'next/link'
import { useLocation } from '@/components/location/LocationProvider'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import { cityEn } from '@/lib/poiI18n'

// Cercles-villes (inspiré des « stories » Muslim Pro, mais UTILE) : ta ville
// mémorisée puis les villes guidées — vraies photos de monuments déjà
// auto-hébergées (/guides/<slug>-j1.jpg). Un tap → le guide complet.
const GUIDED: { slug: string; nom: string; img?: string }[] = [
  { slug: 'medine', nom: 'Médine' },
  { slug: 'la-mecque', nom: 'La Mecque', img: '/guides/la-mecque-j2.jpg' },
  { slug: 'istanbul', nom: 'Istanbul' },
  { slug: 'marrakech', nom: 'Marrakech' },
  { slug: 'dubai', nom: 'Dubaï' },
  { slug: 'doha', nom: 'Doha' },
  { slug: 'sarajevo', nom: 'Sarajevo' },
  { slug: 'fes', nom: 'Fès' },
  { slug: 'amman', nom: 'Amman' },
  { slug: 'singapour', nom: 'Singapour' },
  { slug: 'kuala-lumpur', nom: 'Kuala Lumpur' },
  { slug: 'tanger', nom: 'Tanger' },
  { slug: 'abu-dhabi', nom: 'Abu Dhabi' },
  { slug: 'antalya', nom: 'Antalya' },
  { slug: 'le-caire', nom: 'Le Caire' },
  { slug: 'casablanca', nom: 'Casablanca' },
  { slug: 'paris', nom: 'Paris' },
  { slug: 'londres', nom: 'Londres' },
  { slug: 'new-york', nom: 'New York' },
]

export default function VilleCircles() {
  const { city } = useLocation()
  const { lang } = useLanguage()
  const en = lang === 'en'
  const items = [
    ...(city && !GUIDED.some((g) => g.slug === city.slug) ? [{ slug: city.slug, nom: city.nom, img: undefined as string | undefined, mine: true }] : []),
    ...GUIDED.map((g) => ({ ...g, mine: city?.slug === g.slug })),
  ]

  return (
    <section style={{ background: 'var(--nuit)', padding: '14px 0 2px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', gap: 14, overflowX: 'auto', padding: '2px 16px 10px', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
        {items.map((v) => (
          <Link key={v.slug} href={`/destinations/${v.slug}`} style={{ textDecoration: 'none', textAlign: 'center', flexShrink: 0, width: 68 }}>
            <span style={{ display: 'block', width: 62, height: 62, margin: '0 auto', borderRadius: '50%', padding: 3, background: v.mine ? 'linear-gradient(135deg, #C9A84C, #e9dcbe)' : 'rgba(201,168,76,0.45)' }}>
              <span style={{ display: 'block', width: '100%', height: '100%', borderRadius: '50%', overflow: 'hidden', background: '#1B4332' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={('img' in v && v.img) ? v.img : `/guides/${v.slug}-j1.jpg`} alt="" loading="lazy" width={56} height={56}
                  style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  onError={(e) => { (e.target as HTMLImageElement).style.display = 'none' }} />
              </span>
            </span>
            <span style={{ display: 'block', marginTop: 5, fontSize: 11.5, fontWeight: 700, color: v.mine ? 'var(--or)' : 'rgba(253,250,243,0.8)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {v.mine ? `📍 ${cityEn(v.nom, en)}` : cityEn(v.nom, en)}
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
