import type { Metadata } from 'next'
import Link from 'next/link'
import { destinations } from '@/lib/data'

export const metadata: Metadata = { title: 'Recherche', robots: { index: false } }

type Filter = 'all' | 'restaurants' | 'mosques'

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string; type?: string }> }) {
  const { q = '', type = 'all' } = await searchParams
  const filter = (type as Filter) || 'all'
  const query = q.trim().toLowerCase()
  const match = query ? destinations.find((d) => d.city.toLowerCase().includes(query) || d.slug.includes(query) || d.country.toLowerCase().includes(query)) : null
  const restaurants = match ? match.restaurants : []
  const mosques = match ? match.mosques : []
  const showRestaurants = filter === 'all' || filter === 'restaurants'
  const showMosques = filter === 'all' || filter === 'mosques'
  const totalResults = (showRestaurants ? restaurants.length : 0) + (showMosques ? mosques.length : 0)

  function filterUrl(t: Filter) {
    const p = new URLSearchParams()
    if (query) p.set('q', q)
    if (t !== 'all') p.set('type', t)
    return `/search?${p.toString()}`
  }

  return (
    <main style={{ backgroundColor: '#faf8f4' }} className="min-h-screen">
      <section style={{ backgroundColor: '#1a3a2a' }} className="px-8 sm:px-16 pt-16 pb-20">
        <p style={{ color: '#c9a870' }} className="text-xs font-semibold uppercase tracking-[0.2em] mb-5">Recherche</p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5 max-w-2xl" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>Trouver halal en voyage</h1>
        <p className="text-white/50 text-base max-w-lg leading-relaxed">Restaurants certifiés, mosquées et lieux adaptés aux voyageurs musulmans dans le monde entier.</p>
      </section>

      <div className="bg-white border-b border-gray-100 px-4 sm:px-16 py-8">
        <div className="max-w-2xl">
          <form action="/search" method="GET" className="flex gap-0">
            <input type="text" name="q" defaultValue={q} placeholder="Istanbul, Paris, Tokyo, Londres..." autoComplete="off"
              className="flex-1 px-5 py-4 bg-[#faf8f4] border border-gray-200 rounded-l-2xl text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a2a] focus:border-transparent" />
            <button type="submit" style={{ backgroundColor: '#1a3a2a' }} className="text-white px-7 py-4 rounded-r-2xl font-semibold hover:opacity-90 transition-opacity whitespace-nowrap">Rechercher</button>
          </form>
          <div className="mt-5 flex items-center gap-3 flex-wrap">
            <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Type :</span>
            {([{ key: 'all', label: 'Tout' }, { key: 'restaurants', label: 'Restaurants halal' }, { key: 'mosques', label: 'Mosquées' }] as { key: Filter; label: string }[]).map(({ key, label }) => (
              <a key={key} href={filterUrl(key)} className="px-4 py-2 rounded-full text-sm font-medium border transition-all"
                style={filter === key ? { backgroundColor: '#1a3a2a', color: 'white', borderColor: '#1a3a2a' } : { backgroundColor: 'white', color: '#555', borderColor: '#e5e7eb' }}>{label}</a>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-10">
        {!query && (
          <div className="py-12">
            <p className="text-gray-500 text-base mb-6">Destinations suggérées :</p>
            <div className="flex flex-wrap gap-2">{destinations.map((d) => <a key={d.slug} href={`/search?q=${encodeURIComponent(d.city)}`} className="bg-white border border-gray-200 hover:border-[#c9a870] text-gray-700 hover:text-[#1a3a2a] px-4 py-2 rounded-full text-sm font-medium transition-all">{d.city}</a>)}</div>
          </div>
        )}
        {query && !match && (
          <div className="py-16 text-center">
            <div className="text-5xl mb-4">😕</div>
            <p className="text-gray-700 font-semibold text-lg mb-2">Aucun résultat pour &ldquo;{q}&rdquo;</p>
            <p className="text-gray-500 mb-6">Essayez Istanbul, Marrakech ou Dubaï</p>
            <div className="flex flex-wrap justify-center gap-2">{destinations.map((d) => <a key={d.slug} href={`/search?q=${encodeURIComponent(d.city)}`} className="bg-white border border-gray-200 hover:border-[#c9a870] text-gray-700 px-4 py-2 rounded-full text-sm font-medium transition-all">{d.city}</a>)}</div>
          </div>
        )}
        {match && (
          <>
            <div className="mb-8">
              <div className="flex items-baseline justify-between gap-4 mb-2">
                <h2 className="text-3xl font-bold" style={{ fontFamily: 'var(--font-playfair), Georgia, serif', color: '#1a3a2a' }}>Résultats pour « {match.city} »</h2>
                <span className="text-sm text-gray-400 shrink-0">{totalResults} résultats</span>
              </div>
              <p className="text-gray-500 text-sm">{match.country} · {match.restaurantHalalCount.toLocaleString('fr-FR')}+ restaurants · {match.mosqueeCount.toLocaleString('fr-FR')} mosquées</p>
              <Link href={`/destinations/${match.slug}`} className="inline-block mt-2 text-sm font-medium hover:underline" style={{ color: '#c9a870' }}>Voir le guide complet →</Link>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {showRestaurants && restaurants.map((r, i) => (
                <div key={`r-${i}`} className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#c9a870]/30 hover:shadow-sm transition-all">
                  <p style={{ color: '#c9a870' }} className="text-[10px] font-bold uppercase tracking-widest mb-2">Restaurant halal</p>
                  <h3 className="font-semibold text-gray-900 text-base mb-1">{r.name}</h3>
                  <p className="text-xs text-gray-400 mb-2">📍 {r.address}</p>
                  <div className="flex items-center gap-1 text-xs"><span style={{ color: '#c9a870' }}>★</span><span className="text-gray-500">{r.rating}/5</span></div>
                </div>
              ))}
              {showMosques && mosques.map((m, i) => (
                <div key={`m-${i}`} className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-blue-100 hover:shadow-sm transition-all">
                  <p style={{ color: '#3b82f6' }} className="text-[10px] font-bold uppercase tracking-widest mb-2">Mosquée</p>
                  <h3 className="font-semibold text-gray-900 text-base mb-1">{m.name}</h3>
                  <p className="text-xs text-gray-400 mb-2">📍 {m.address}</p>
                  <div className="flex items-center gap-1 text-xs"><span style={{ color: '#c9a870' }}>★</span><span className="text-gray-500">{m.rating}/5</span></div>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
