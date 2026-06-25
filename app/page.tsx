import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import JsonLd from '@/components/seo/JsonLd'
import EmailCapture from '@/components/ui/EmailCapture'
import { buildWebSiteSchema, buildMetadata } from '@/lib/seo'
import { guides } from '@/lib/data'

export const metadata: Metadata = buildMetadata({
  title: 'Voyages Halal — Voyagez halal, voyagez serein',
  description: 'Restaurants halal certifiés, mosquées, hébergements et guides pratiques dans plus de 50 destinations — pour les musulmans du monde entier.',
  path: '/',
})

const DESTINATIONS = [
  { slug: 'istanbul', city: 'Istanbul', country: 'Turquie', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80', badge: 'INCONTOURNABLE' },
  { slug: 'marrakech', city: 'Marrakech', country: 'Maroc', image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&q=80', badge: 'POPULAIRE' },
  { slug: 'dubai', city: 'Dubaï', country: 'Émirats', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80', badge: 'LUXE' },
  { slug: 'kuala-lumpur', city: 'Kuala Lumpur', country: 'Malaisie', image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600&q=80', badge: 'TENDANCE' },
  { slug: 'le-caire', city: 'Le Caire', country: 'Égypte', image: 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=600&q=80', badge: 'CULTURELLE' },
  { slug: 'medine', city: 'Médine', country: 'Arabie Saoudite', image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=600&q=80', badge: 'SPIRITUELLE' },
]

const FEATURES = [
  { icon: '🍽', title: 'Restaurants halal', desc: 'Adresses certifiées halal avec avis vérifiés et notes de la communauté.' },
  { icon: '🕌', title: 'Mosquées proches', desc: 'Localisez la mosquée la plus proche, avec horaires de prière.' },
  { icon: '🧭', title: 'Guides pratiques', desc: 'Conseils culturels, visa, transports — tout pour voyager l\'esprit libre.' },
]

export default function HomePage() {
  const websiteSchema = buildWebSiteSchema()
  const featuredGuides = guides.slice(0, 3)

  return (
    <>
    <JsonLd data={websiteSchema} />
    <main style={{ backgroundColor: '#faf8f4' }}>
      {/* Hero split */}
      <section className="min-h-[90vh] grid grid-cols-1 lg:grid-cols-2">
        {/* Left: text */}
        <div style={{ backgroundColor: '#faf8f4' }} className="flex flex-col justify-center px-8 sm:px-16 lg:px-20 py-20 lg:py-32">
          <div className="flex items-center gap-3 mb-8">
            <div style={{ width: 32, height: 1, backgroundColor: '#c9a870' }} />
            <span style={{ color: '#c9a870' }} className="text-xs font-semibold uppercase tracking-[0.2em]">
              Le guide de référence mondial
            </span>
          </div>
          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold leading-[1.05] mb-8" style={{ fontFamily: 'var(--font-playfair), Georgia, serif', color: '#1a3a2a' }}>
            Voyagez halal,<br />
            voyagez <em style={{ color: '#c9a870', fontStyle: 'italic' }}>serein</em>
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed mb-10 max-w-md">
            Restaurants halal certifiés, mosquées, hébergements et guides pratiques dans plus de 50 destinations — pour les musulmans du monde entier.
          </p>
          <form action="/search" method="GET" className="flex gap-0 max-w-md">
            <div className="relative flex-1">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-lg">🔍</span>
              <input
                type="text"
                name="q"
                placeholder="Istanbul, Marrakech, Dubaï..."
                autoComplete="off"
                className="w-full pl-11 pr-4 py-4 bg-white border border-gray-200 rounded-l-2xl text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a2a] focus:border-transparent"
              />
            </div>
            <button
              type="submit"
              style={{ backgroundColor: '#1a3a2a' }}
              className="text-white px-7 py-4 rounded-r-2xl font-semibold text-base hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Rechercher
            </button>
          </form>
          <div className="mt-8 flex gap-8">
            {[
              { value: '50+', label: 'destinations' },
              { value: '3', label: 'continents' },
              { value: '4 ans', label: "d'expérience" },
            ].map((s) => (
              <div key={s.label}>
                <div className="text-2xl font-bold" style={{ color: '#1a3a2a' }}>{s.value}</div>
                <div className="text-xs text-gray-400 mt-0.5">{s.label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right: photo */}
        <div className="relative hidden lg:block">
          <Image
            src="https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&q=85"
            alt="Istanbul — Voyages Halal"
            fill
            className="object-cover"
            priority
          />
        </div>
      </section>

      {/* Destinations populaires */}
      <section style={{ backgroundColor: '#f5f0e8' }} className="py-20 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <p style={{ color: '#c9a870' }} className="text-xs font-semibold uppercase tracking-[0.2em] mb-2">Explorez</p>
              <h2 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-playfair), Georgia, serif', color: '#1a3a2a' }}>
                Destinations halal populaires
              </h2>
            </div>
            <Link href="/destinations" className="text-sm font-medium hover:underline" style={{ color: '#1a3a2a' }}>
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
                    <span style={{ backgroundColor: 'rgba(201,168,112,0.9)', color: '#1a3a2a' }} className="text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap tracking-widest">
                      {d.badge}
                    </span>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 p-4 text-center">
                    <div className="text-white font-bold text-base">{d.city}</div>
                    <div className="text-white/60 text-xs mt-0.5">{d.country}</div>
                    <div style={{ color: '#c9a870' }} className="text-xs mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      Guide complet →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Voyager Halal, simplifié */}
      <section className="py-20 px-4 bg-white">
        <div className="max-w-5xl mx-auto text-center mb-14">
          <p style={{ color: '#c9a870' }} className="text-xs font-semibold uppercase tracking-[0.2em] mb-3">Notre promesse</p>
          <h2 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-playfair), Georgia, serif', color: '#1a3a2a' }}>
            Voyager Halal, simplifié
          </h2>
        </div>
        <div className="max-w-5xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10">
          {FEATURES.map((f) => (
            <div key={f.title} className="text-center">
              <div className="text-4xl mb-4">{f.icon}</div>
              <div className="font-bold mb-2 text-lg" style={{ color: '#1a3a2a' }}>{f.title}</div>
              <div className="text-sm text-gray-500 leading-relaxed">{f.desc}</div>
            </div>
          ))}
        </div>
      </section>

      {/* App CTA */}
      <section style={{ backgroundColor: '#1a3a2a' }} className="py-20 px-4">
        <div className="max-w-4xl mx-auto flex flex-col lg:flex-row items-center gap-12">
          <div className="flex-1">
            <p style={{ color: '#c9a870' }} className="text-xs font-semibold uppercase tracking-[0.2em] mb-4">Bientôt disponible</p>
            <h2 className="text-3xl font-bold text-white mb-5" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
              Voyages Halal dans votre poche
            </h2>
            <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-md">
              Géolocalisation, boussole Qibla, horaires de prière, restaurants proches — tout ce dont vous avez besoin, même sans connexion.
            </p>
            <Link
              href="/application"
              style={{ backgroundColor: '#c9a870', color: '#1a3a2a' }}
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
              <p style={{ color: '#c9a870' }} className="text-xs font-semibold uppercase tracking-[0.2em] mb-2">Nos guides</p>
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair), Georgia, serif', color: '#1a3a2a' }}>
                Tout pour voyager halal sereinement
              </h2>
            </div>
            <Link href="/guides" className="text-sm font-medium hover:underline" style={{ color: '#1a3a2a' }}>
              Voir tous les guides →
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {featuredGuides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="group bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#c9a870]/40 hover:shadow-sm transition-all"
              >
                <span style={{ backgroundColor: '#f5f0e8', color: '#1a3a2a' }} className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">
                  {guide.category}
                </span>
                <h3 className="font-bold text-gray-900 mt-3 mb-2 text-sm leading-snug group-hover:text-[#1a3a2a]">
                  {guide.title}
                </h3>
                <p className="text-xs text-gray-400">⏱ {guide.readTime} de lecture</p>
                <p style={{ color: '#c9a870' }} className="text-xs font-medium mt-3">Lire le guide →</p>
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
