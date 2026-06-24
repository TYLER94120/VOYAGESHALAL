import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Voyages Halal — Trouvez où manger et prier en voyage',
  description: 'Assistant de voyage halal : trouvez instantanément des restaurants halal et des mosquées partout dans le monde.',
}

const DESTINATIONS = [
  { slug: 'istanbul', city: 'Istanbul', country: 'Turquie', emoji: '🕌' },
  { slug: 'marrakech', city: 'Marrakech', country: 'Maroc', emoji: '🏮' },
  { slug: 'dubai', city: 'Dubaï', country: 'Émirats', emoji: '🏙' },
  { slug: 'kuala-lumpur', city: 'Kuala Lumpur', country: 'Malaisie', emoji: '🌆' },
  { slug: 'le-caire', city: 'Le Caire', country: 'Égypte', emoji: '🏛' },
  { slug: 'medine', city: 'Médine', country: 'Arabie Saoudite', emoji: '☪️' },
]

export default function HomePage() {
  return (
    <main>
      {/* Hero */}
      <section className="bg-white pt-16 pb-20 px-4">
        <div className="max-w-2xl mx-auto text-center">
          <p className="text-emerald-600 font-semibold text-sm uppercase tracking-widest mb-4">
            Assistant de voyage halal
          </p>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 leading-tight mb-5">
            Trouvez où manger halal<br />
            et prier, en un instant
          </h1>
          <p className="text-lg text-gray-500 mb-10">
            Un outil simple pour voyager sereinement en tant que musulman.
          </p>

          <form action="/search" method="GET" className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <input
              type="text"
              name="q"
              placeholder="Istanbul, Paris, Tokyo…"
              autoComplete="off"
              className="flex-1 px-5 py-4 text-gray-900 bg-gray-50 border border-gray-200 rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
            />
            <button
              type="submit"
              className="bg-emerald-600 text-white px-8 py-4 rounded-2xl font-semibold text-base hover:bg-emerald-700 transition-colors whitespace-nowrap"
            >
              Rechercher
            </button>
          </form>

          <div className="mt-5 flex flex-wrap justify-center gap-3 text-sm">
            {['Istanbul', 'Marrakech', 'Dubaï'].map((city) => (
              <a
                key={city}
                href={`/search?q=${encodeURIComponent(city)}`}
                className="text-gray-400 hover:text-emerald-600 transition-colors"
              >
                {city} →
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Destinations */}
      <section className="bg-gray-50 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-xl font-bold text-gray-900">Destinations populaires</h2>
            <Link href="/destinations" className="text-sm text-emerald-600 hover:underline font-medium">
              Voir tout →
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {DESTINATIONS.map((d) => (
              <Link
                key={d.slug}
                href={`/destinations/${d.slug}`}
                className="bg-white rounded-2xl p-5 flex items-center gap-4 border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all group"
              >
                <span className="text-3xl">{d.emoji}</span>
                <div>
                  <div className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors text-sm sm:text-base">
                    {d.city}
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">{d.country}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Promesse */}
      <section className="bg-white py-16 px-4">
        <div className="max-w-3xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10 text-center">
          {[
            { icon: '🍽', title: 'Restaurants halal', desc: 'Trouvez les adresses certifiées halal près de vous.' },
            { icon: '🕌', title: 'Mosquées proches', desc: 'Localisez la mosquée la plus proche en quelques secondes.' },
            { icon: '✈️', title: 'Voyagez serein', desc: 'Plus de stress. Concentrez-vous sur votre voyage.' },
          ].map((item) => (
            <div key={item.title}>
              <div className="text-4xl mb-3">{item.icon}</div>
              <div className="font-bold text-gray-900 mb-2">{item.title}</div>
              <div className="text-sm text-gray-500 leading-relaxed">{item.desc}</div>
            </div>
          ))}
        </div>
      </section>
    </main>
  )
}
