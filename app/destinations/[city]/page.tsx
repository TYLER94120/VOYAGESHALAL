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
    title: `Voyage Halal à ${destination.city} — Guide Complet ${new Date().getFullYear()}`,
    description: `Restaurants halal et mosquées à ${destination.city}. Guide complet pour voyager sereinement en tant que musulman.`,
    path: `/destinations/${destination.slug}`,
    type: 'article',
  })
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
        {/* Breadcrumb above hero */}
        <div className="bg-white border-b border-gray-100 px-6 sm:px-12 py-3">
          <nav className="flex items-center gap-2 text-xs text-gray-400 max-w-6xl mx-auto">
            <Link href="/" className="hover:text-[#1a3a2a]">Accueil</Link>
            <span>›</span>
            <Link href="/destinations" className="hover:text-[#1a3a2a]">Destinations</Link>
            <span>›</span>
            <span className="text-gray-700">{destination.city}</span>
          </nav>
        </div>

        {/* Full-width hero photo */}
        <div className="relative h-[60vh] min-h-[400px] overflow-hidden">
          <Image
            src={destination.coverImage}
            alt={`${destination.city}, ${destination.country}`}
            fill
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-12 pb-10 max-w-6xl mx-auto w-full">
            <p style={{ color: '#c9a870' }} className="text-xs font-semibold uppercase tracking-[0.2em] mb-3">
              {destination.country} · {destination.tags?.[0] ?? 'Voyage halal'}
            </p>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 max-w-3xl"
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            >
              Voyage Halal à {destination.city} —<br />
              Guide Complet {new Date().getFullYear()}
            </h1>
            <p className="text-white/70 text-base max-w-2xl leading-relaxed">
              {destination.description.slice(0, 180)}…
            </p>
          </div>
        </div>

        {/* Stats bar */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6 sm:px-12 py-4 flex flex-wrap gap-8 text-sm">
            <div className="text-center">
              <div className="font-bold text-xl" style={{ color: '#1a3a2a' }}>{destination.mosqueeCount.toLocaleString('fr-FR')}</div>
              <div className="text-gray-400 text-xs mt-0.5">mosquées</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-xl" style={{ color: '#1a3a2a' }}>{destination.restaurantHalalCount.toLocaleString('fr-FR')}+</div>
              <div className="text-gray-400 text-xs mt-0.5">restaurants halal</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-xl" style={{ color: '#1a3a2a' }}>{destination.population}</div>
              <div className="text-gray-400 text-xs mt-0.5">habitants</div>
            </div>
            <div className="text-center">
              <div className="font-bold text-xl flex items-center gap-1">
                <span style={{ color: '#c9a870' }}>★</span>
                <span style={{ color: '#1a3a2a' }}>{destination.halalScore}.0</span>
              </div>
              <div className="text-gray-400 text-xs mt-0.5">score halal</div>
            </div>
          </div>
        </div>

        {/* Content + Sidebar */}
        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 lg:grid lg:grid-cols-3 lg:gap-12">
          {/* Main */}
          <div className="lg:col-span-2 space-y-8">
            {/* Tabs */}
            <div className="flex gap-1 bg-white rounded-2xl p-1 border border-gray-100">
              {([
                { key: 'restaurants', label: '🍽 Restaurants', count: destination.restaurants.length },
                { key: 'mosques', label: '🕌 Mosquées', count: destination.mosques.length },
                { key: 'activities', label: '🎯 Activités', count: destination.activities.length },
              ] as { key: Tab; label: string; count: number }[]).map(({ key, label, count }) => (
                <Link
                  key={key}
                  href={tabUrl(key)}
                  className="flex-1 text-center px-3 py-2.5 text-sm font-medium rounded-xl transition-colors"
                  style={activeTab === key ? { backgroundColor: '#1a3a2a', color: 'white' } : { color: '#6b7280' }}
                >
                  {label} <span className="text-xs opacity-60">({count})</span>
                </Link>
              ))}
            </div>

            {/* Restaurants */}
            {activeTab === 'restaurants' && (
              <div className="space-y-3">
                {destination.restaurants.map((r, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#c9a870]/40 hover:shadow-sm transition-all">
                    <div className="flex items-start gap-4">
                      <div style={{ backgroundColor: '#1a3a2a' }} className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-white text-xs">🍽</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="font-semibold text-gray-900">{r.name}</span>
                            <span style={{ backgroundColor: '#f0faf5', color: '#1a6b3c' }} className="ml-2 text-xs font-medium px-2 py-0.5 rounded-full">
                              Halal ✓
                            </span>
                          </div>
                          <div className="shrink-0 flex items-center gap-1">
                            <span style={{ color: '#c9a870' }}>★</span>
                            <span className="text-sm text-gray-600">{r.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">📍 {r.address}</p>
                        <p className="text-sm text-gray-600 mt-2 leading-relaxed">{r.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Mosquées */}
            {activeTab === 'mosques' && (
              <div className="space-y-3">
                {destination.mosques.map((m, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all">
                    <div className="flex items-start gap-4">
                      <div style={{ backgroundColor: '#1a3a2a' }} className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-0.5">
                        <span className="text-white text-xs">🕌</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <span className="font-semibold text-gray-900">{m.name}</span>
                            <span className="ml-2 bg-blue-50 text-blue-700 text-xs font-medium px-2 py-0.5 rounded-full">
                              Mosquée
                            </span>
                          </div>
                          <div className="shrink-0 flex items-center gap-1">
                            <span style={{ color: '#c9a870' }}>★</span>
                            <span className="text-sm text-gray-600">{m.rating}</span>
                          </div>
                        </div>
                        <p className="text-xs text-gray-400 mt-1">📍 {m.address}</p>
                        <p className="text-sm text-gray-600 mt-2 leading-relaxed">{m.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Activités */}
            {activeTab === 'activities' && (
              <div className="space-y-3">
                {destination.activities.map((a, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100 hover:shadow-sm transition-all">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1">
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
            )}
          </div>

          {/* Sidebar */}
          <aside className="mt-8 lg:mt-0 space-y-5">
            <div style={{ backgroundColor: '#1a3a2a' }} className="rounded-2xl p-6">
              <h2 style={{ color: '#c9a870' }} className="font-bold text-xs uppercase tracking-[0.15em] mb-5">
                Infos pratiques
              </h2>
              <dl className="space-y-4 text-sm">
                <div>
                  <dt className="text-white/40 text-xs mb-0.5">Pays</dt>
                  <dd className="text-white font-medium">{destination.country}</dd>
                </div>
                <div>
                  <dt className="text-white/40 text-xs mb-0.5">Meilleure période</dt>
                  <dd className="text-white">{destination.bestTime}</dd>
                </div>
                <div>
                  <dt className="text-white/40 text-xs mb-0.5">Population</dt>
                  <dd className="text-white">{destination.population}</dd>
                </div>
                <div>
                  <dt className="text-white/40 text-xs mb-0.5">Score halal</dt>
                  <dd className="flex gap-0.5 mt-1">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <span key={i} style={{ color: i < destination.halalScore ? '#c9a870' : 'rgba(255,255,255,0.2)' }}>★</span>
                    ))}
                  </dd>
                </div>
              </dl>
            </div>

            {destination.tips.length > 0 && (
              <div style={{ backgroundColor: '#f5f0e8' }} className="rounded-2xl p-6 border border-[#e8d5a3]/50">
                <h2 style={{ color: '#1a3a2a' }} className="font-bold text-xs uppercase tracking-[0.15em] mb-4">
                  💡 Bon à savoir
                </h2>
                <ul className="space-y-3">
                  {destination.tips.map((tip, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-gray-600">
                      <span style={{ color: '#c9a870' }} className="shrink-0 mt-0.5 font-bold">→</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {destination.tags && destination.tags.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <h2 className="font-bold text-gray-500 text-xs uppercase tracking-[0.15em] mb-3">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {destination.tags.map((tag) => (
                    <span key={tag} style={{ backgroundColor: '#f5f0e8', color: '#1a3a2a' }} className="text-xs font-medium px-3 py-1.5 rounded-full">
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <Link
              href={`/search?q=${encodeURIComponent(destination.city)}`}
              style={{ backgroundColor: '#c9a870' }}
              className="flex items-center justify-center gap-2 text-[#1a3a2a] font-bold text-sm px-6 py-3.5 rounded-full hover:opacity-90 transition-opacity"
            >
              🔍 Rechercher à {destination.city}
            </Link>
          </aside>
        </div>
      </main>
    </>
  )
}
