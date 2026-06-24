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
        <span key={i} className={i < Math.floor(rating) ? 'text-amber-400' : 'text-gray-200'}>★</span>
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

      <main className="min-h-screen bg-gray-50">
        {/* Hero image */}
        <div className="relative h-52 sm:h-64 overflow-hidden">
          <Image
            src={destination.coverImage}
            alt={`${destination.city}, ${destination.country}`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/30 to-black/70" />
          <div className="absolute inset-0 flex flex-col justify-end px-4 pb-5">
            <nav className="flex items-center gap-1.5 text-xs text-white/70 mb-3">
              <Link href="/" className="hover:text-white">Accueil</Link>
              <span>/</span>
              <Link href="/destinations" className="hover:text-white">Destinations</Link>
              <span>/</span>
              <span className="text-white">{destination.city}</span>
            </nav>
            <h1 className="text-3xl sm:text-4xl font-extrabold text-white">
              {destination.city}
            </h1>
            <p className="text-white/80 text-sm mt-1">{destination.country} · {destination.shortDescription}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="bg-white border-b border-gray-100 px-4 py-3">
          <div className="max-w-2xl mx-auto flex gap-6 text-sm text-gray-500">
            <span>🕌 {destination.mosqueeCount.toLocaleString('fr-FR')} mosquées</span>
            <span>🍽 {destination.restaurantHalalCount.toLocaleString('fr-FR')}+ restaurants</span>
            <span className="text-emerald-600 font-medium">
              {'★'.repeat(destination.halalScore)} Halal
            </span>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border-b border-gray-100 sticky top-16 z-10">
          <div className="max-w-2xl mx-auto px-4 flex gap-1">
            {([
              { key: 'restaurants', label: '🍽 Restaurants', count: destination.restaurants.length },
              { key: 'mosques', label: '🕌 Mosquées', count: destination.mosques.length },
              { key: 'activities', label: '🎯 Activités', count: destination.activities.length },
            ] as { key: Tab; label: string; count: number }[]).map(({ key, label, count }) => (
              <Link
                key={key}
                href={tabUrl(key)}
                className={`px-4 py-3.5 text-sm font-medium border-b-2 transition-colors whitespace-nowrap ${
                  activeTab === key
                    ? 'border-emerald-600 text-emerald-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
              >
                {label} <span className="text-xs opacity-60">({count})</span>
              </Link>
            ))}
          </div>
        </div>

        <div className="max-w-2xl mx-auto px-4 py-6 space-y-3">
          {/* Restaurants tab */}
          {activeTab === 'restaurants' && destination.restaurants.map((r, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-emerald-100 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-gray-900">{r.name}</span>
                    <span className="bg-emerald-50 text-emerald-700 text-xs font-medium px-2 py-0.5 rounded-full">
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

          {/* Mosquées tab */}
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

          {/* Activités tab */}
          {activeTab === 'activities' && destination.activities.map((a, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-sm transition-all">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <span className="font-semibold text-gray-900">{a.name}</span>
                  <p className="text-sm text-gray-600 mt-2 leading-relaxed">{a.description}</p>
                </div>
                <span className="shrink-0 text-xs text-emerald-600 font-medium bg-emerald-50 px-2 py-1 rounded-full whitespace-nowrap">
                  ⏱ {a.duration}
                </span>
              </div>
            </div>
          ))}

          {/* Conseils */}
          {activeTab === 'restaurants' && destination.tips.length > 0 && (
            <div className="mt-4 bg-amber-50 border border-amber-100 rounded-2xl p-5">
              <h2 className="font-bold text-gray-900 mb-3 text-sm">💡 Conseils pratiques</h2>
              <ul className="space-y-2">
                {destination.tips.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-600">
                    <span className="text-amber-500 shrink-0 mt-0.5">→</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Recherche rapide */}
          <div className="pt-4 text-center">
            <Link
              href={`/search?q=${encodeURIComponent(destination.city)}`}
              className="inline-flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-full font-semibold text-sm hover:bg-emerald-700 transition-colors"
            >
              🔍 Recherche rapide à {destination.city}
            </Link>
          </div>
        </div>
      </main>
    </>
  )
}
