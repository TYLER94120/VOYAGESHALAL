import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import JsonLd from '@/components/seo/JsonLd'
import EmailCapture from '@/components/ui/EmailCapture'
import { buildWebSiteSchema, buildOrganizationSchema } from '@/lib/seo'
import { guides } from '@/lib/data'
import HomeHeroActions from '@/components/home/HomeHeroActions'
import FollowInstall from '@/components/capture/FollowInstall'
import { JeVoyageMaintenant } from '@/components/JeVoyageMaintenant'
import { HomeScoreRanking } from '@/components/HomeScoreRanking'
import IslamicPattern from '@/components/ui/IslamicPattern'
import { getDomainSEO, FR_URL, EN_URL } from '@/lib/domain'

// Métadonnées par domaine : anglais sur gohalaltravel.com, français sur voyageshalal.fr
export async function generateMetadata(): Promise<Metadata> {
  const { isEN, siteUrl } = await getDomainSEO()
  const title = isEN
    ? 'GoHalalTravel — #1 Halal Travel Guide | Restaurants, Mosques & Destinations'
    : 'VoyagesHalal.fr — Guide Voyage Halal #1 | Restaurants, Mosquées & Destinations'
  const description = isEN
    ? 'Halal restaurants, mosques, prayer times and practical guides in 354+ destinations worldwide — for Muslim travelers.'
    : 'Restaurants halal signalés, mosquées, hébergements et guides pratiques dans 354+ destinations — pour les musulmans du monde entier.'
  const keywords = isEN
    ? ['halal travel', 'halal travel guide', 'halal restaurants', 'halal destinations', 'muslim travel', 'prayer times', 'mosques near me', 'muslim friendly hotels']
    : ['voyage halal', 'tourisme halal', 'destinations halal', 'restaurant halal', 'hébergement halal', 'guide voyage musulman', 'horaires de prière']
  return {
    title: { absolute: title },
    description,
    keywords,
    alternates: {
      canonical: siteUrl,
      languages: { fr: FR_URL, en: EN_URL, 'x-default': EN_URL },
    },
    openGraph: { title, description, url: siteUrl },
  }
}

const DESTINATIONS = [
  { slug: 'istanbul', city: 'Istanbul', country: 'Turquie', countryEn: 'Turkey', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80', badge: 'INCONTOURNABLE', badgeEn: 'MUST-SEE' },
  { slug: 'marrakech', city: 'Marrakech', cityEn: 'Marrakesh', country: 'Maroc', countryEn: 'Morocco', image: 'https://images.unsplash.com/photo-1597211684565-dca64d72bdfe?w=600&q=80', badge: 'POPULAIRE', badgeEn: 'POPULAR' },
  { slug: 'dubai', city: 'Dubaï', cityEn: 'Dubai', country: 'Émirats', countryEn: 'UAE', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80', badge: 'LUXE', badgeEn: 'LUXURY' },
  { slug: 'kuala-lumpur', city: 'Kuala Lumpur', country: 'Malaisie', countryEn: 'Malaysia', image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600&q=80', badge: 'TENDANCE', badgeEn: 'TRENDING' },
  { slug: 'le-caire', city: 'Le Caire', cityEn: 'Cairo', country: 'Égypte', countryEn: 'Egypt', image: 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=600&q=80', badge: 'CULTURELLE', badgeEn: 'CULTURAL' },
  { slug: 'medine', city: 'Médine', cityEn: 'Medina', country: 'Arabie Saoudite', countryEn: 'Saudi Arabia', image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=600&q=80', badge: 'SPIRITUELLE', badgeEn: 'SPIRITUAL' },
]

const FEATURES = [
  { icon: '🍽', title: 'Restaurants halal', titleEn: 'Halal restaurants', desc: 'Options halal et adresses signalées — chaque adresse porte sa source.', descEn: 'Halal options and reported spots — every listing carries its source.' },
  { icon: '🕌', title: 'Mosquées proches', titleEn: 'Nearby mosques', desc: 'Localisez la mosquée la plus proche, avec horaires de prière.', descEn: 'Find the nearest mosque, with prayer times.' },
  { icon: '🧭', title: 'Guides pratiques', titleEn: 'Practical guides', desc: 'Conseils culturels, visa, transports — tout pour voyager l\'esprit libre.', descEn: 'Cultural tips, visas, transport — everything for worry-free travel.' },
]

function getVillesStats() {
  try {
    const dir = path.join(process.cwd(), 'data', 'villes')
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'))
    const continents = new Set<string>()
    for (const f of files) {
      try {
        const v = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'))
        if (v.continent) continents.add(v.continent)
      } catch {
        // skip
      }
    }
    return { totalVilles: files.length, totalContinents: continents.size }
  } catch {
    return { totalVilles: 0, totalContinents: 0 }
  }
}

export default async function HomePage() {
  const { isEN, brand, siteUrl } = await getDomainSEO()
  const websiteSchema = buildWebSiteSchema({ en: isEN, siteUrl, name: isEN ? brand : undefined })
  const orgSchema = buildOrganizationSchema({ en: isEN, siteUrl, name: isEN ? brand : undefined })
  const featuredGuides = guides.slice(0, 3)
  const { totalVilles } = getVillesStats()

  // Toutes les chaînes de l'accueil, bilingues selon le domaine (P0-1)
  const t = {
    heroEyebrow: isEN ? 'Travel with faith' : 'Voyagez avec foi',
    heroTitlePre: isEN ? 'Islam guides your ' : "L'Islam guide votre ",
    heroTitleGold: isEN ? 'journey' : 'voyage',
    heroSub: isEN
      ? `Halal restaurants, mosques and prayer times in ${totalVilles}+ destinations — in one tap.`
      : `Restaurants halal, mosquées et horaires de prière dans ${totalVilles}+ destinations — en un clic.`,
    qaDestinations: isEN ? 'Destinations' : 'Destinations',
    qaPrayer: isEN ? 'Prayer' : 'Horaires',
    qaBlog: 'Blog',
    explore: isEN ? 'Explore' : 'Explorez',
    popularTitle: isEN ? 'Popular halal destinations' : 'Destinations halal populaires',
    seeAll: isEN ? 'See all →' : 'Voir tout →',
    fullGuide: isEN ? 'Full guide →' : 'Guide complet →',
    promise: isEN ? 'Our promise' : 'Notre promesse',
    promiseTitle: isEN ? 'Halal travel, made simple' : 'Voyager Halal, simplifié',
    appEyebrow: isEN ? 'Coming soon' : 'Bientôt disponible',
    appTitle: isEN ? `${brand} in your pocket` : 'Voyages Halal dans votre poche',
    appSub: isEN
      ? 'Geolocation, Qibla compass, prayer times, nearby restaurants — everything you need, even offline.'
      : 'Géolocalisation, boussole Qibla, horaires de prière, restaurants proches — tout ce dont vous avez besoin, même sans connexion.',
    learnMore: isEN ? 'Learn more' : 'En savoir plus',
    ourGuides: isEN ? 'Our guides' : 'Nos guides',
    guidesTitle: isEN ? 'Everything for stress-free halal travel' : 'Tout pour voyager halal sereinement',
    seeAllGuides: isEN ? 'See all guides →' : 'Voir tous les guides →',
    readTime: isEN ? 'read' : 'de lecture',
    readGuide: isEN ? 'Read the guide →' : 'Lire le guide →',
    emailTitle: isEN ? 'Get our free halal travel guide' : 'Recevez notre guide voyage halal gratuit',
    emailSub: isEN
      ? '20+ pages of tips, the best destinations and must-visit addresses — straight to your inbox.'
      : '20+ pages de conseils, les meilleures destinations et adresses incontournables — directement dans votre boîte mail.',
  }

  return (
    <>
    <JsonLd data={websiteSchema} />
    <JsonLd data={orgSchema} />
    {/* Design unifié : même accueil sur mobile et desktop */}
    <main style={{ backgroundColor: '#fdfaf3' }}>
      {/* Hero plein écran minimaliste */}
      <section
        className="relative overflow-hidden flex items-center justify-center text-center px-6"
        style={{ minHeight: '90vh', backgroundColor: '#0b1a0f' }}
      >
        {/* Image d'architecture islamique (sans personne) + voile sombre */}
        <Image
          src="https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=1920&q=80"
          alt={isEN ? "Green dome of the Prophet's Mosque in Medina" : 'Dôme vert de la Mosquée du Prophète à Médine'}
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', opacity: 0.42 }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(11,26,15,0.7) 0%, rgba(11,26,15,0.85) 100%)' }} />
        <IslamicPattern opacity={0.06} />

        <div className="relative z-10 max-w-3xl mx-auto w-full">
          <p style={{ color: '#c9a84c' }} className="text-xs sm:text-sm font-semibold uppercase tracking-[0.35em] mb-7">
            {t.heroEyebrow}
          </p>
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.04] mb-7"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 900 }}
          >
            {t.heroTitlePre}<span className="gold-em">{t.heroTitleGold}</span>
          </h1>
          <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            {t.heroSub}
          </p>

          <HomeHeroActions />
        </div>
      </section>

      {/* Accès rapide */}
      <section className="px-4 pt-10">
        <div className="quick-access">
          <Link href="/destinations" className="qa-btn">
            <span>🗺️</span>
            <span>{t.qaDestinations}</span>
          </Link>
          <Link href="/horaires-priere" className="qa-btn qa-btn-green">
            <span>🕐</span>
            <span>{t.qaPrayer}</span>
          </Link>
          <Link href="/qibla" className="qa-btn qa-btn-green">
            <span>🧭</span>
            <span>Qibla</span>
          </Link>
          <Link href="/blog" className="qa-btn">
            <span>📖</span>
            <span>{t.qaBlog}</span>
          </Link>
        </div>
      </section>

      {/* Destinations populaires */}
      <section style={{ backgroundColor: '#f5f0e8' }} className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p style={{ color: '#c9a84c' }} className="text-xs font-semibold uppercase tracking-[0.2em] mb-2">{t.explore}</p>
              <h2 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-playfair), Georgia, serif', color: '#1b4332' }}>
                {t.popularTitle}
              </h2>
            </div>
            <Link href="/destinations" className="text-sm font-medium hover:underline" style={{ color: '#1b4332' }}>
              {t.seeAll}
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {DESTINATIONS.map((d) => (
              <Link
                key={d.slug}
                href={`/destinations/${d.slug}`}
                className="group block relative overflow-hidden"
                style={{ borderRadius: '9999px 9999px 1.5rem 1.5rem' }}
              >
                <div className="relative aspect-[3/4]">
                  <Image
                    src={d.image}
                    alt={isEN ? (d.cityEn ?? d.city) : d.city}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute top-4 left-1/2 -translate-x-1/2">
                    <span style={{ backgroundColor: 'rgba(201,168,112,0.9)', color: '#1b4332' }} className="text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap tracking-widest">
                      {isEN ? d.badgeEn : d.badge}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                    <div className="text-white font-bold text-base">{isEN ? (d.cityEn ?? d.city) : d.city}</div>
                    <div className="text-white/60 text-xs mt-0.5">{isEN ? (d.countryEn ?? d.country) : d.country}</div>
                    <div style={{ color: '#c9a84c' }} className="text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      {t.fullGuide}
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Halal Trust Score™ ranking */}
      <HomeScoreRanking en={isEN} />

      {/* Je voyage maintenant — widget prière temps réel */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <JeVoyageMaintenant />
        </div>
      </section>

      {/* Voyager Halal, simplifié */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto text-center mb-14">
          <p style={{ color: '#c9a84c' }} className="text-xs font-semibold uppercase tracking-[0.2em] mb-3">{t.promise}</p>
          <h2 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-playfair), Georgia, serif', color: '#1b4332' }}>
            {t.promiseTitle}
          </h2>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10">
          {FEATURES.map((f) => (
            <div key={f.title} className="text-center">
              <div className="text-4xl mb-4">{f.icon}</div>
              <div className="font-bold mb-2 text-lg" style={{ color: '#1b4332' }}>{isEN ? f.titleEn : f.title}</div>
              <div className="text-sm text-gray-500 leading-relaxed">{isEN ? f.descEn : f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* App CTA */}
      <section className="islamic-hero py-20 px-4">
        <div className="max-w-4xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <p style={{ color: '#c9a84c' }} className="text-xs font-semibold uppercase tracking-[0.2em] mb-4">{t.appEyebrow}</p>
            <h2 className="text-3xl font-bold text-white mb-5" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
              {t.appTitle}
            </h2>
            <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-md">
              {t.appSub}
            </p>
            <Link
              href="/application"
              style={{ backgroundColor: '#c9a84c', color: '#1b4332' }}
              className="inline-block font-bold text-sm px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
            >
              {t.learnMore}
            </Link>
          </div>
          <div style={{ backgroundColor: '#2d5a3d' }} className="w-48 h-80 rounded-3xl flex items-center justify-center text-6xl shrink-0">
            📱
          </div>
        </div>
        <div className="max-w-4xl mx-auto mt-12 px-4">
          <FollowInstall source="home" />
        </div>
      </section>

      {/* Guides — maillage interne vers blog */}
      <section style={{ backgroundColor: '#faf8f4' }} className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p style={{ color: '#c9a84c' }} className="text-xs font-semibold uppercase tracking-[0.2em] mb-2">{t.ourGuides}</p>
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair), Georgia, serif', color: '#1b4332' }}>
                {t.guidesTitle}
              </h2>
            </div>
            <Link href="/guides" className="text-sm font-medium hover:underline" style={{ color: '#1b4332' }}>
              {t.seeAllGuides}
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {featuredGuides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="group bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#c9a84c]/40 hover:shadow-sm transition-all"
              >
                <span style={{ backgroundColor: '#f5f0e8', color: '#1b4332' }} className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">
                  {guide.category}
                </span>
                <h3 className="font-bold text-gray-900 mt-3 mb-2 text-sm leading-snug group-hover:text-[#1b4332]">
                  {guide.title}
                </h3>
                <p className="text-xs text-gray-400">⏱ {guide.readTime} {t.readTime}</p>
                <p style={{ color: '#c9a84c' }} className="text-xs font-medium mt-3">{t.readGuide}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Email capture — lead magnet */}
      <EmailCapture
        title={t.emailTitle}
        subtitle={t.emailSub}
        source="homepage"
      />
    </main>
    </>
  )
}
