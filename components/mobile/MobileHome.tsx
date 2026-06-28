'use client'
import Link from 'next/link'
import Image from 'next/image'
import { useEffect, useState } from 'react'
import SearchBarHome from '@/components/search/SearchBarHome'
import IslamicPattern from '@/components/ui/IslamicPattern'
import GeoDashboard from '@/components/mobile/GeoDashboard'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import LocationBar from '@/components/location/LocationBar'
import { useLocation, type City } from '@/components/location/LocationProvider'

interface Destination {
  slug: string
  city: string
  country: string
  flag: string
  image: string
  score: string
  mosquees: string
}

const PRAYERS = [
  { key: 'Fajr', label: 'Fajr' },
  { key: 'Dhuhr', label: 'Dhuhr' },
  { key: 'Asr', label: 'ʿAsr' },
  { key: 'Maghrib', label: 'Maghrib' },
  { key: 'Isha', label: 'ʿIsha' },
]

// Bandeau prochaine prière — AlAdhan géolocalisé, repli silencieux si refus
function NextPrayerBanner({ city }: { city: City | null }) {
  const { t } = useLanguage()
  const [info, setInfo] = useState<{ name: string; time: string; city: string } | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load(lat: number, lng: number, cityName: string) {
      try {
        const d = new Date()
        const url = `https://api.aladhan.com/v1/timings/${Math.floor(d.getTime() / 1000)}?latitude=${lat}&longitude=${lng}&method=3`
        const res = await fetch(url)
        const json = await res.json()
        const tm = json?.data?.timings
        if (!tm || cancelled) return
        const now = d.getHours() * 60 + d.getMinutes()
        let next = PRAYERS[0]
        let nextTime = tm['Fajr']
        for (const p of PRAYERS) {
          const [h, m] = (tm[p.key] || '').split(':').map(Number)
          if (h * 60 + m > now) { next = p; nextTime = tm[p.key]; break }
        }
        setInfo({ name: next.label, time: (nextTime || '').slice(0, 5), city: cityName })
      } catch { /* repli silencieux */ }
    }
    // Priorité à la ville mémorisée, sinon géoloc, sinon Istanbul
    if (city?.lat != null && city?.lng != null) {
      load(city.lat, city.lng, city.nom)
    } else if (typeof navigator !== 'undefined' && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => load(pos.coords.latitude, pos.coords.longitude, 'Ma position'),
        () => load(41.0082, 28.9784, 'Istanbul'),
        { timeout: 6000 }
      )
    } else {
      load(41.0082, 28.9784, 'Istanbul')
    }
    return () => { cancelled = true }
  }, [city])

  return (
    <Link
      href="/horaires-priere"
      style={{
        display: 'block',
        background: 'linear-gradient(135deg, #1b4332 0%, #0b1a0f 100%)',
        borderRadius: '18px',
        padding: '16px 18px',
        textDecoration: 'none',
        boxShadow: '0 8px 24px rgba(11,26,15,0.18)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ color: '#c9a84c', fontSize: '10.5px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
          {t('home.next')}
        </span>
        <span style={{ color: 'rgba(255,255,255,0.6)', fontSize: '11px' }}>📍 {info?.city ?? '…'}</span>
      </div>
      <div style={{ display: 'flex', alignItems: 'baseline', gap: '10px', marginTop: '6px' }}>
        <span style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 900, fontSize: '34px', color: '#fff' }}>
          {info?.time ?? '—:—'}
        </span>
        <span style={{ color: '#e8d5a3', fontSize: '15px', fontWeight: 600 }}>{info?.name ?? ''}</span>
      </div>
      <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: '11.5px' }}>{t('home.allTimes')}</span>
    </Link>
  )
}

export default function MobileHome({ totalVilles, destinations }: { totalVilles: number; destinations: Destination[] }) {
  const { t } = useLanguage()
  const { city } = useLocation()
  const cityHref = city ? `/destinations/${city.slug}` : '/destinations'
  const dashTiles = [
    { href: cityHref, icon: '🍽', title: 'Restos', sub: city ? `Halal à ${city.nom}` : 'Choisir une ville', bg: '#EAF3DE' },
    { href: '/mosquee-proche', icon: '🕌', title: t('nav.mosque'), sub: t('tile.mosqueSub'), bg: '#EEEDFE' },
    { href: '/qibla', icon: '🧭', title: t('nav.qibla'), sub: t('tile.qiblaSub'), bg: '#E6F1FB' },
    { href: cityHref, icon: '🏨', title: 'Hôtels', sub: city ? `Halal-friendly` : 'Choisir une ville', bg: '#FAEEDA' },
  ]
  return (
    <div className="mobile-home lg:hidden" style={{ background: '#fdfaf3' }}>
      {/* Hero nuit */}
      <section style={{ position: 'relative', overflow: 'hidden', background: '#0b1a0f', padding: '20px 18px 26px' }}>
        <IslamicPattern opacity={0.07} />
        <div style={{ position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '7px', color: '#fff', fontWeight: 700, fontSize: '16px' }}>
              <span style={{ color: '#c9a84c' }}>✦</span> VoyagesHalal
            </span>
          </div>
          <div style={{ margin: '0 -4px 14px', borderRadius: '14px', overflow: 'hidden', background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(201,168,76,0.25)' }}>
            <LocationBar dark={false} />
          </div>
          <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 900, fontSize: '27px', color: '#fff', lineHeight: 1.15, marginBottom: '16px' }}>
            As-salāmu ʿalaykum,
            <br />
            <span style={{ color: '#c9a84c', fontStyle: 'italic' }}>{t('home.greet')}</span>
          </h1>
          <div style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(201,168,76,0.35)', backdropFilter: 'blur(10px)', borderRadius: '14px', padding: '4px' }}>
            <SearchBarHome />
          </div>
        </div>
      </section>

      {/* Bandeau prière + tuiles */}
      <section style={{ padding: '16px 14px 4px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <NextPrayerBanner city={city} />
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          {dashTiles.map((tile) => (
            <Link
              key={tile.title}
              href={tile.href}
              style={{ background: tile.bg, borderRadius: '18px', padding: '16px', textDecoration: 'none', display: 'block', minHeight: '92px' }}
            >
              <div style={{ fontSize: '30px', marginBottom: '8px' }}>{tile.icon}</div>
              <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: '18px', color: '#1b4332' }}>{tile.title}</div>
              <div style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>{tile.sub}</div>
            </Link>
          ))}
        </div>
      </section>

      {/* Géolocalisation 1-clic */}
      <section style={{ padding: '4px 14px 0' }}>
        <GeoDashboard />
      </section>

      {/* Destinations populaires */}
      <section style={{ padding: '18px 14px 28px' }}>
        <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9ca3af', marginBottom: '12px' }}>
          {t('home.popular')}
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {destinations.map((d) => (
            <Link
              key={d.slug}
              href={`/destinations/${d.slug}`}
              style={{ display: 'flex', alignItems: 'center', gap: '13px', background: '#fff', borderRadius: '16px', padding: '10px', textDecoration: 'none', border: '1px solid rgba(11,26,15,0.07)', boxShadow: '0 4px 14px rgba(11,26,15,0.04)' }}
            >
              <div style={{ position: 'relative', width: '64px', height: '64px', borderRadius: '13px', overflow: 'hidden', flexShrink: 0 }}>
                <Image src={d.image} alt={d.city} fill className="object-cover" sizes="64px" />
                <span style={{ position: 'absolute', top: '4px', left: '4px', background: 'rgba(11,26,15,0.8)', color: '#c9a84c', fontSize: '10px', fontWeight: 700, padding: '1px 6px', borderRadius: '20px' }}>
                  ✦ {d.score}
                </span>
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: '10px', color: '#9ca3af', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                  {d.flag} {d.country}
                </div>
                <div style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 700, fontSize: '19px', color: '#1a1a1a', lineHeight: 1.1 }}>{d.city}</div>
                <div style={{ display: 'flex', gap: '6px', marginTop: '4px' }}>
                  <span style={{ background: '#E7F4EA', color: '#1B7A47', fontSize: '10.5px', fontWeight: 700, padding: '2px 8px', borderRadius: '20px' }}>✓ Halal+</span>
                  <span style={{ background: '#f3f0e8', color: '#6b7280', fontSize: '10.5px', fontWeight: 600, padding: '2px 8px', borderRadius: '20px' }}>🕌 {d.mosquees}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
        <Link href="/destinations" style={{ display: 'block', textAlign: 'center', marginTop: '16px', color: '#1b4332', fontWeight: 700, fontSize: '13px', textDecoration: 'none' }}>
          {t('home.seeAll')}
        </Link>
      </section>
    </div>
  )
}
