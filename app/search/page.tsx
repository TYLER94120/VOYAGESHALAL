import type { Metadata } from 'next'
import Link from 'next/link'
import { destinations } from '@/lib/data'

export const metadata: Metadata = {
  title: 'Recherche — Voyages Halal',
  robots: { index: false },
}

type Filter = 'all' | 'restaurants' | 'mosques'

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; type?: string }>
}) {
  const { q = '', type = 'all' } = await searchParams
  const filter = (type as Filter) || 'all'
  const query = q.trim().toLowerCase()

  const match = query
    ? destinations.find(
        (d) =>
          d.city.toLowerCase().includes(query) ||
          d.slug.includes(query) ||
          d.country.toLowerCase().includes(query)
      )
    : null

  const restaurants = match ? match.restaurants : []
  const mosques = match ? match.mosques : []

  const showRestaurants = filter === 'all' || filter === 'restaurants'
  const showMosques = filter === 'all' || filter === 'mosques'

  function filterUrl(t: Filter) {
    const params = new URLSearchParams()
    if (query) params.set('q', q)
    if (t !== 'all') params.set('type', t)
    return `/search?${params.toString()}`
  }

  return (
    <main style={{ backgroundColor: '#faf8f4' }} className="min-h-screen">
      {/* Hero search bar */}
      <section style={{ backgroundColor: '#1a3a2a' }} className="px-4 pt-12 pb-10">
        <div className="max-w-2xl mx-auto text-center mb-7">
          <p style={{ color: '#c9a870' }} className="text-xs font-semibold uppercase tracking-widest mb-3">Recherche</p>
          <h1 className="text-2xl sm:text-3xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
            Trouvez restaurants halal & mosquées
          </h1>
        </div>
        <div className="max-w-xl mx-auto">
          <form action="/search" method="GET" className="flex gap-3">
            <input
              type="text"
              name="q"
              defaultValue={q}
              placeholder="Istanbul, Paris, Tokyo…"
              autoComplete="off"
              autoFocus
              className="flex-1 px-5 py-3.5 bg-white rounded-2xl text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-[#c9a870]"
            />
            <button
              type="submit"
              style={{ backgroundColor: '#c9a870' }}
              className="text-[#1a3a2a] px-6 py-3.5 rounded-2xl font-bold hover:opacity-90 transition-opacity"
            >
              →
            </button>
          </form>
        </div>
      </section>

      <div className="max-w-2xl mx-auto px-4 py-8">
        {!query && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🔍</div>
            <p className="text-gray-500 text-lg mb-6">Entrez une ville pour commencer</p>
            <div className="flex flex-wrap justify-center gap-2">
              {destinations.map((d) => (
                <a
                  key={d.slug}
                  href={`/search?q=${encodeURIComponent(d.city)}`}
                  style={{ borderColor: '#e8d5a3' }}
                  className="bg-white border hover:border-[#c9a870] text-gray-700 hover:text-[#1a3a2a] px-4 py-2 rounded-full text-sm font-medium transition-all"
                >
                  {d.city}
                </a>
              ))}
            </div>
          </div>
        )}

        {query && !match && (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">😕</div>
            <p className="text-gray-700 font-semibold text-lg">Aucun résultat pour &ldquo;{q}&rdquo;</p>
            <p className="text-gray-500 mt-2 mb-6">Essayez Istanbul, Marrakech ou Dubaï</p>
            <div className="flex flex-wrap justify-center gap-2">
              {destinations.map((d) => (
                <a
                  key={d.slug}
                  href={`/search?q=${encodeURIComponent(d.city)}`}
                  className="bg-white border border-gray-200 hover:border-[#c9a870] text-gray-700 hover:text-[#1a3a2a] px-4 py-2 rounded-full text-sm font-medium transition-all"
                >
                  {d.city}
                </a>
              ))}
            </div>
          </div>
        )}

        {match && (
          <>
            {/* City header */}
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-[#1a3a2a]" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                {match.city}
              </h2>
              <p className="text-gray-500 text-sm mt-1">
                {match.country} · {match.restaurantHalalCount.toLocaleString('fr-FR')}+ restaurants halal · {match.mosqueeCount.toLocaleString('fr-FR')} mosquées
              </p>
              <Link
                href={`/destinations/${match.slug}`}
                className="inline-block mt-3 text-sm font-medium hover:underline"
                style={{ color: '#c9a870' }}
              >
                Voir le guide complet de {match.city} →
              </Link>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-6">
              {([
                { key: 'all', label: 'Tout' },
                { key: 'restaurants', label: `🍽 Restaurants (${restaurants.length})` },
                { key: 'mosques', label: `🕌 Mosquées (${mosques.length})` },
              ] as { key: Filter; label: string }[]).map(({ key, label }) => (
                <a
                  key={key}
                  href={filterUrl(key)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    filter === key
                      ? 'text-white'
                      : 'bg-white text-gray-600 border border-gray-200 hover:border-[#c9a870]'
                  }`}
                  style={filter === key ? { backgroundColor: '#1a3a2a' } : {}}
                >
                  {label}
                </a>
              ))}
            </div>

            {/* Restaurants */}
            {showRestaurants && restaurants.length > 0 && (
              <section className="mb-6">
                {filter === 'all' && (
                  <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-widest">
                    Restaurants halal
                  </h3>
                )}
                <div className="space-y-3">
                  {restaurants.map((r, i) => (
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
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{r.description}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <div style={{ color: '#c9a870' }} className="text-sm">{'★'.repeat(Math.floor(r.rating))}</div>
                          <div className="text-xs text-gray-400">{r.rating}/5</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}

            {/* Mosquées */}
            {showMosques && mosques.length > 0 && (
              <section>
                {filter === 'all' && (
                  <h3 className="text-xs font-bold text-gray-500 mb-3 uppercase tracking-widest">
                    Mosquées
                  </h3>
                )}
                <div className="space-y-3">
                  {mosques.map((m, i) => (
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
                          <p className="text-sm text-gray-600 mt-2 line-clamp-2">{m.description}</p>
                        </div>
                        <div className="shrink-0 text-right">
                          <div style={{ color: '#c9a870' }} className="text-sm">{'★'.repeat(Math.floor(m.rating))}</div>
                          <div className="text-xs text-gray-400">{m.rating}/5</div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        )}
      </div>
    </main>
  )
}
