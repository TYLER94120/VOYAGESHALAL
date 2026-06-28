import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import JsonLd from '@/components/seo/JsonLd'
import EmailCapture from '@/components/ui/EmailCapture'
import { buildWebSiteSchema, buildOrganizationSchema, buildMetadata } from '@/lib/seo'
import { guides } from '@/lib/data'
import HomeHeroActions from '@/components/home/HomeHeroActions'
import { JeVoyageMaintenant } from '@/components/JeVoyageMaintenant'
import { HomeScoreRanking } from '@/components/HomeScoreRanking'
import IslamicPattern from '@/components/ui/IslamicPattern'
import MobileHome from '@/components/mobile/MobileHome'

// Destinations mises en avant sur l'accueil mobile (app-style)
const MOBILE_DESTINATIONS = [
  { slug: 'istanbul', city: 'Istanbul', country: 'Turquie', flag: '🇹🇷', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=300&q=70', score: '9.0', mosquees: '3 113' },
  { slug: 'medine', city: 'Médine', country: 'Arabie Saoudite', flag: '🇸🇦', image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=300&q=70', score: '9.8', mosquees: 'Umrah' },
  { slug: 'dubai', city: 'Dubaï', country: 'Émirats', flag: '🇦🇪', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=300&q=70', score: '9.4', mosquees: '700' },
  { slug: 'kuala-lumpur', city: 'Kuala Lumpur', country: 'Malaisie', flag: '🇲🇾', image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=300&q=70', score: '9.0', mosquees: '1 200' },
]

export const metadata: Metadata = {
  ...buildMetadata({
    title: 'VoyagesHalal.fr — Guide Voyage Halal #1',
    description: 'Restaurants halal certifiés, mosquées, hébergements et guides pratiques dans 88+ destinations — pour les musulmans du monde entier.',
    path: '/',
  }),
  // Titre absolu pour l'accueil (pas de suffixe « | VoyagesHalal.fr »)
  title: { absolute: 'VoyagesHalal.fr — Guide Voyage Halal #1 | Restaurants, Mosquées & Destinations' },
}

const DESTINATIONS = [
  { slug: 'istanbul', city: 'Istanbul', country: 'Turquie', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80', badge: 'INCONTOURNABLE' },
  { slug: 'marrakech', city: 'Marrakech', country: 'Maroc', image: 'https://images.unsplash.com/photo-1597211684565-dca64d72bdfe?w=600&q=80', badge: 'POPULAIRE' },
  { slug: 'dubai', city: 'Dubaï', country: 'Émirats', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80', badge: 'LUXE' },
  { slug: 'kuala-lumpur', city: 'Kuala Lumpur', country: 'Malaisie', image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600&q=80', badge: 'TENDANCE' },
  { slug: 'le-caire', city: 'Le Caire', country: 'Égypte', image: 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=600&q=80', badge: 'CULTURELLE' },
  { slug: 'medine', city: 'Médine', country: 'Arabie Saoudite', image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=600&q=80', badge: 'SPIRITUELLE' },
]

const FEATURES = [
  { icon: '🍽', title: 'Restaurants halal', desc: 'Adresses certifiées halal avec avis vérifiés et notes de la communauté.' },
  { icon: '🕌', title: 'Mosquées proches', desc: 'Localisez la mosquée la plus proche, avec horaires de prière.' },
  { icon: '🧭', title: 'Guides pratiques', desc: 'Conseils culturels, visa, transports — tout pour voyager l\'esprit libre.' },
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

export default function HomePage() {
  const websiteSchema = buildWebSiteSchema()
  const orgSchema = buildOrganizationSchema()
  const featuredGuides = guides.slice(0, 3)
  const { totalVilles } = getVillesStats()

  return (
    <>
    <JsonLd data={websiteSchema} />
    <JsonLd data={orgSchema} />
    {/* Accueil app-style — < 1024px */}
    <MobileHome totalVilles={totalVilles} destinations={MOBILE_DESTINATIONS} />
    <main className="hidden lg:block" style={{ backgroundColor: '#fdfaf3' }}>
      {/* Hero plein écran minimaliste */}
      <section
        className="relative overflow-hidden flex items-center justify-center text-center px-6"
        style={{ minHeight: '90vh', backgroundColor: '#0b1a0f' }}
      >
        {/* Image d'architecture islamique (sans personne) + voile sombre */}
        <Image
          src="https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1920&q=80"
          alt="Architecture islamique"
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', opacity: 0.34 }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(11,26,15,0.7) 0%, rgba(11,26,15,0.85) 100%)' }} />
        <IslamicPattern opacity={0.06} />

        <div className="relative z-10 max-w-3xl mx-auto w-full">
          <p style={{ color: '#c9a84c' }} className="text-xs sm:text-sm font-semibold uppercase tracking-[0.35em] mb-7">
            Voyagez avec foi
          </p>
          <h1
            className="text-5xl sm:text-6xl lg:text-7xl text-white leading-[1.04] mb-7"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 900 }}
          >
            L&apos;Islam guide votre <span className="gold-em">voyage</span>
          </h1>
          <p className="text-white/70 text-lg leading-relaxed mb-10 max-w-xl mx-auto">
            Restaurants halal, mosquées et horaires de prière dans {totalVilles}+ destinations — en un clic.
          </p>

          <HomeHeroActions />
        </div>
      </section>

      {/* Accès rapide */}
      <section className="px-4 pt-10">
        <div className="quick-access">
          <Link href="/destinations" className="qa-btn">
            <span>🗺️</span>
            <span>Destinations</span>
          </Link>
          <Link href="/horaires-priere" className="qa-btn qa-btn-green">
            <span>🕐</span>
            <span>Horaires</span>
          </Link>
          <Link href="/qibla" className="qa-btn qa-btn-green">
            <span>🧭</span>
            <span>Qibla</span>
          </Link>
          <Link href="/blog" className="qa-btn">
            <span>📖</span>
            <span>Blog</span>
          </Link>
        </div>
      </section>

      {/* Destinations populaires */}
      <section style={{ backgroundColor: '#f5f0e8' }} className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p style={{ color: '#c9a84c' }} className="text-xs font-semibold uppercase tracking-[0.2em] mb-2">Explorez</p>
              <h2 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-playfair), Georgia, serif', color: '#1b4332' }}>
                Destinations halal populaires
              </h2>
            </div>
            <Link href="/destinations" className="text-sm font-medium hover:underline" style={{ color: '#1b4332' }}>
              Voir tout →
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
                    alt={d.city}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  <div className="absolute top-4 left-1/2 -translate-x-1/2">
                    <span style={{ backgroundColor: 'rgba(201,168,112,0.9)', color: '#1b4332' }} className="text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap tracking-widest">
                      {d.badge}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                    <div className="text-white font-bold text-base">{d.city}</div>
                    <div className="text-white/60 text-xs mt-0.5">{d.country}</div>
                    <div style={{ color: '#c9a84c' }} className="text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      Guide complet →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Halal Trust Score™ ranking */}
      <HomeScoreRanking />

      {/* Je voyage maintenant — widget prière temps réel */}
      <section className="py-16 px-4 bg-white">
        <div className="max-w-3xl mx-auto">
          <JeVoyageMaintenant />
        </div>
      </section>

      {/* Voyager Halal, simplifié */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto text-center mb-14">
          <p style={{ color: '#c9a84c' }} className="text-xs font-semibold uppercase tracking-[0.2em] mb-3">Notre promesse</p>
          <h2 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-playfair), Georgia, serif', color: '#1b4332' }}>
            Voyager Halal, simplifié
          </h2>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10">
          {FEATURES.map((f) => (
            <div key={f.title} className="text-center">
              <div className="text-4xl mb-4">{f.icon}</div>
              <div className="font-bold mb-2 text-lg" style={{ color: '#1b4332' }}>{f.title}</div>
              <div className="text-sm text-gray-500 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* App CTA */}
      <section className="islamic-hero py-20 px-4">
        <div className="max-w-4xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <p style={{ color: '#c9a84c' }} className="text-xs font-semibold uppercase tracking-[0.2em] mb-4">Bientôt disponible</p>
            <h2 className="text-3xl font-bold text-white mb-5" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
              Voyages Halal dans votre poche
            </h2>
            <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-md">
              Géolocalisation, boussole Qibla, horaires de prière, restaurants proches — tout ce dont vous avez besoin, même sans connexion.
            </p>
            <Link
              href="/application"
              style={{ backgroundColor: '#c9a84c', color: '#1b4332' }}
              className="inline-block font-bold text-sm px-8 py-3 rounded-full hover:opacity-90 transition-opacity"
            >
              En savoir plus
            </Link>
          </div>
          <div style={{ backgroundColor: '#2d5a3d' }} className="w-48 h-80 rounded-3xl flex items-center justify-center text-6xl shrink-0">
            📱
          </div>
        </div>
      </section>

      {/* Guides — maillage interne vers blog */}
      <section style={{ backgroundColor: '#faf8f4' }} className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p style={{ color: '#c9a84c' }} className="text-xs font-semibold uppercase tracking-[0.2em] mb-2">Nos guides</p>
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair), Georgia, serif', color: '#1b4332' }}>
                Tout pour voyager halal sereinement
              </h2>
            </div>
            <Link href="/guides" className="text-sm font-medium hover:underline" style={{ color: '#1b4332' }}>
              Voir tous les guides →
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
                <p className="text-xs text-gray-400">⏱ {guide.readTime} de lecture</p>
                <p style={{ color: '#c9a84c' }} className="text-xs font-medium mt-3">Lire le guide →</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Email capture — lead magnet */}
      <EmailCapture
        title="Recevez notre guide voyage halal gratuit"
        subtitle="20+ pages de conseils, les meilleures destinations et adresses incontournables — directement dans votre boîte mail."
        source="homepage"
      />
    </main>
    </>
  )
}
