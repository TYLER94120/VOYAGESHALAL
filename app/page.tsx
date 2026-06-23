import Link from 'next/link'
import type { Metadata } from 'next'
import { destinations, guides } from '@/lib/data'
import DestinationCard from '@/components/destination/DestinationCard'
import GuideCard from '@/components/ui/GuideCard'
import AppCTA from '@/components/ui/AppCTA'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Voyage Halal — Destinations, Guides & Conseils pour Voyageurs Musulmans',
  description:
    'Découvrez les meilleures destinations halal dans le monde. Guides pratiques, restaurants halal, mosquées, conseils pour voyager en accord avec vos valeurs islamiques.',
})

const stats = [
  { value: '50+', label: 'Destinations' },
  { value: '100+', label: 'Guides pratiques' },
  { value: '10k+', label: 'Voyageurs aidés' },
  { value: '5★', label: 'Note moyenne' },
]

export default function HomePage() {
  const featuredDestinations = destinations.slice(0, 6)
  const latestGuides = guides.slice(0, 3)

  return (
    <>
      {/* Hero */}
      <section className="relative bg-gradient-to-br from-emerald-900 via-emerald-800 to-teal-900 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 left-10 text-9xl">🕌</div>
          <div className="absolute bottom-10 right-10 text-9xl">🌙</div>
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-9xl opacity-20">✨</div>
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 text-sm mb-8">
            <span>🌟</span>
            <span>Le guide de référence du voyage halal</span>
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
            Voyage halal simplifié{' '}
            <span className="text-emerald-300">dans le monde entier</span>
          </h1>

          <p className="text-xl text-emerald-100 max-w-2xl mx-auto mb-10">
            Destinations, restaurants halal, mosquées, guides pratiques — tout ce qu&apos;il
            faut pour voyager sereinement en accord avec vos valeurs.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/destinations"
              className="bg-white text-emerald-800 px-8 py-4 rounded-full font-bold text-lg hover:bg-emerald-50 transition-colors"
            >
              Explorer les destinations
            </Link>
            <Link
              href="/application"
              className="border-2 border-white/50 text-white px-8 py-4 rounded-full font-semibold text-lg hover:border-white hover:bg-white/10 transition-colors"
            >
              📱 Télécharger l&apos;app
            </Link>
          </div>

          <div className="mt-16 grid grid-cols-2 sm:grid-cols-4 gap-8">
            {stats.map((stat) => (
              <div key={stat.label}>
                <div className="text-3xl font-extrabold text-emerald-300">{stat.value}</div>
                <div className="text-sm text-emerald-200 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations populaires */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-emerald-600 font-semibold text-sm uppercase tracking-wide mb-2">
              Destinations
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Destinations halal populaires
            </h2>
            <p className="text-gray-500 mt-2 max-w-lg">
              Les meilleures villes pour voyager halal, sélectionnées et vérifiées par notre équipe.
            </p>
          </div>
          <Link
            href="/destinations"
            className="hidden sm:flex items-center gap-2 text-emerald-600 font-semibold hover:gap-3 transition-all"
          >
            Voir tout
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {featuredDestinations.map((destination) => (
            <DestinationCard key={destination.slug} destination={destination} featured />
          ))}
        </div>

        <div className="mt-8 text-center sm:hidden">
          <Link
            href="/destinations"
            className="inline-flex items-center gap-2 text-emerald-600 font-semibold"
          >
            Voir toutes les destinations →
          </Link>
        </div>
      </section>

      {/* Why section */}
      <section className="bg-gray-50 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-extrabold text-gray-900 mb-4">
              Voyagez halal, voyagez serein
            </h2>
            <p className="text-gray-500 max-w-xl mx-auto">
              Nous vérifions chaque information pour que vous puissiez profiter de votre voyage sans compromis.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8">
            {[
              {
                icon: '🍽',
                title: 'Restaurants halal vérifiés',
                desc: 'Chaque restaurant est vérifié et certifié halal avant d\'être référencé sur notre plateforme.',
              },
              {
                icon: '🕌',
                title: 'Mosquées et lieux de prière',
                desc: 'Trouvez facilement les mosquées et salles de prière dans chaque ville du monde.',
              },
              {
                icon: '📋',
                title: 'Guides pratiques complets',
                desc: 'Des guides rédigés par des voyageurs musulmans pour des voyageurs musulmans.',
              },
            ].map((feature) => (
              <div key={feature.title} className="text-center p-6">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="font-bold text-lg text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-500 text-sm">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Guides récents */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-end justify-between mb-10">
          <div>
            <p className="text-emerald-600 font-semibold text-sm uppercase tracking-wide mb-2">
              Guides
            </p>
            <h2 className="text-3xl font-extrabold text-gray-900">
              Guides de voyage halal
            </h2>
          </div>
          <Link
            href="/guides"
            className="hidden sm:flex items-center gap-2 text-emerald-600 font-semibold"
          >
            Tous les guides →
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
          {latestGuides.map((guide) => (
            <GuideCard key={guide.slug} guide={guide} />
          ))}
        </div>
      </section>

      {/* CTA Application */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <AppCTA />
      </section>
    </>
  )
}
