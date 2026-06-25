import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { destinations, getDestinationBySlug } from '@/lib/data'
import { buildMetadata, buildDestinationSchema, buildBreadcrumbSchema } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'

interface Props {
  params: Promise<{ city: string }>
  searchParams: Promise<{ tab?: string }>
}

export async function generateStaticParams() {
  return destinations.map((d) => ({ city: d.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params
  const destination = getDestinationBySlug(city)
  if (!destination) return {}

  return buildMetadata({
    title: `Voyage Halal à ${destination.city} — Restaurants, Mosquées & Guide ${new Date().getFullYear()}`,
    description: `Restaurants halal et mosquées à ${destination.city}. Guide complet pour voyager sereinement en tant que musulman.`,
    path: `/destinations/${destination.slug}`,
    type: 'article',
  })
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} style={{ color: i < Math.floor(rating) ? '#c9a870' : '#e5e7eb' }}>★</span>
      ))}
      <span className="text-xs text-gray-400 ml-1">{rating}/5</span>
    </div>
  )
}

type Tab = 'restaurants' | 'mosques' | 'activities'

export default async function DestinationPage({ params, searchParams }: Props) {
  const { city } = await params
  const { tab = 'restaurants' } = await searchParams
  const destination = getDestinationBySlug(city)

  if (!destination) notFound()

  const activeTab = (tab as Tab) || 'restaurants'
  const destinationSchema = buildDestinationSchema(destination)
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Destinations', url: '/destinations' },
    { name: destination.city, url: `/destinations/${destination.slug}` },
  ])

  function tabUrl(t: Tab) {
    return `/destinations/${destination!.slug}?tab=${t}`
  }

  return (
    <>
      <JsonLd data={destinationSchema} />
      <JsonLd data={breadcrumbSchema} />

      <main style={{ backgroundColor: '#faf8f4' }} className="min-h-screen">
        {/* Hero */}
        <div className="relative h-64 sm:h-80 overflow-hidden">
          <Image
            src={destination.coverImage}
            alt={`${destination.city}, ${destination.country}`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/80" />
          <div className="absolute inset-0 flex flex-col justify-end px-4 pb-6 max-w-5xl mx-auto w-full">
            <nav className="flex items-center gap-1.5 text-xs text-white/60 mb-3">
              <Link href="/" className="hover:text-white">Accueil</Link>
              <span>/</span>
              <Link href="/destinations" className="hover:text-white">Destinations</Link>
              <span>/</span>
              <span className="text-white">{destination.city}</span>
            </nav>
            <h1 className="text-3xl sm:text-5xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
              {destination.city}
            </h1>
            <p className="text-white/60 text-sm mt-2">{destination.country} · {destination.shortDescription}</p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-5xl mx-auto px-4 py-3 flex flex-wrap gap-6 text-sm text-gray-500">
            <span>🕌 {destination.mosqueeCount.toLocaleString('fr-FR')} mosquées</span>
            <span>🍽 {destination.restaurantHalalCount.toLocaleString('fr-FR')}+ restaurants</span>
            <span style={{ color: '#2d5a3d' }} className="font-medium">
              {'★'.repeat(destination.halalScore)} Score halal
            </span>
          </div>
        </div>

        <div className="max-w-5xl mx-auto px-4 py-8 lg:grid lg:grid-cols-3 lg:gap-10">
          {/* Main content */}
          <div className="lg:col-span-2">
            {/* Tabs */}
            <div className="flex gap-1 mb-6 bg-white rounded-2xl p-1 border border-gray-100">
              {([
                { key: 'restaurants', label: '🍽 Restaurants', count: destination.restaurants.length },
                { key: 'mosques', label: '🕌 Mosquées', count: destination.mosques.length },
                { key: 'activities', label: '🎯 Activités', count: destination.activities.length },
              ] as { key: Tab; label: string; count: number }[]).map(({ key, label, count }) => (
                <Link
                  key={key}
                  href={tabUrl(key)}
                  className={`flex-1 text-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors ${
                    activeTab === key
                      ? 'text-white'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                  style={activeTab === key ? { backgroundColor: '#1a3a2a' } : {}}
                >
                  {label} <span className="text-xs opacity-60">({count})</span>
                </Link>
              ))}
            </div>

            <div className="space-y-3">
              {/* Restaurants */}
              {activeTab === 'restaurants' && destination.restaurants.map((r, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#c9a870]/30 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{r.name}</span>
                        <span style={{ backgroundColor: '#f0faf5', color: '#1a6b3c' }} className="text-xs font-medium px-2 py-0.5 rounded-full">
                          Halal ✓
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">📍 {r.address}</p>
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">{r.description}</p>
                    </div>
                    <div className="shrink-0">
                      <StarRating rating={r.rating} />
                    </div>
                  </div>
                </div>
              ))}

              {/* Mosquées */}
              {activeTab === 'mosques' && destination.mosques.map((m, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-semibold text-gray-900">{m.name}</span>
                        <span className="bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                          Mosquée
                        </span>
                      </div>
                      <p className="text-xs text-gray-400 mt-1">📍 {m.address}</p>
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">{m.description}</p>
                    </div>
                    <div className="shrink-0">
                      <StarRating rating={m.rating} />
                    </div>
                  </div>
                </div>
              ))}

              {/* Activités */}
              {activeTab === 'activities' && destination.activities.map((a, i) => (
                <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-sm transition-all">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                      <span className="font-semibold text-gray-900">{a.name}</span>
                      <p className="text-sm text-gray-600 mt-2 leading-relaxed">{a.description}</p>
                    </div>
                    <span style={{ backgroundColor: '#f5f0e8', color: '#1a3a2a' }} className="shrink-0 text-xs font-medium px-2 py-1 rounded-full whitespace-nowrap">
                      ⏱ {a.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Sidebar */}
          <aside className="mt-8 lg:mt-0 space-y-4">
            {/* Infos pratiques */}
            <div style={{ backgroundColor: '#1a3a2a' }} className="rounded-2xl p-5 text-white">
              <h2 className="font-bold text-sm uppercase tracking-wide mb-4" style={{ color: '#c9a870' }}>
                Infos pratiques
              </h2>
              <dl className="space-y-3 text-sm">
                <div>
                  <dt className="text-white/40 text-xs">Meilleure période</dt>
                  <dd className="text-white mt-0.5">{destination.bestTime}</dd>
                </div>
                <div>
                  <dt className="text-white/40 text-xs">Population</dt>
                  <dd className="text-white mt-0.5">{destination.population}</dd>
                </div>
                <div>
                  <dt className="text-white/40 text-xs">Score halal</dt>
                  <dd className="mt-0.5" style={{ color: '#c9a870' }}>
                    {'★'.repeat(destination.halalScore)} {destination.halalScore}/5
                  </dd>
                </div>
              </dl>
            </div>

            {/* Conseils */}
            {destination.tips.length > 0 && (
              <div style={{ backgroundColor: '#f5f0e8' }} className="rounded-2xl p-5 border border-[#e8d5a3]/50">
                <h2 className="font-bold text-[#1a3a2a] text-sm uppercase tracking-wide mb-4">
                  💡 Bon à savoir
                </h2>
                <ul className="space-y-2.5">
                  {destination.tips.map((tip, i) => (
                    <li key={i} className="flex gap-2 text-sm text-gray-600">
                      <span style={{ color: '#c9a870' }} className="shrink-0 mt-0.5">→</span>
                      {tip}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Tags */}
            {destination.tags && destination.tags.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <h2 className="font-bold text-gray-700 text-sm uppercase tracking-wide mb-3">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {destination.tags.map((tag) => (
                    <span key={tag} style={{ backgroundColor: '#f5f0e8', color: '#1a3a2a' }} className="text-xs font-medium px-3 py-1 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Search CTA */}
            <Link
              href={`/search?q=${encodeURIComponent(destination.city)}`}
              style={{ backgroundColor: '#c9a870' }}
              className="block text-center text-[#1a3a2a] font-bold text-sm px-6 py-3 rounded-full hover:opacity-90 transition-opacity"
            >
              🔍 Rechercher à {destination.city}
            </Link>
          </aside>
        </div>
      </main>
    </>
  )
}
