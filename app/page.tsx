import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Voyages Halal — Voyagez halal, voyagez serein',
  description: 'Trouvez instantanément restaurants halal et mosquées partout dans le monde. Le guide de confiance pour le voyageur musulman.',
}

const DESTINATIONS = [
  { slug: 'istanbul', city: 'Istanbul', country: 'Turquie', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80' },
  { slug: 'marrakech', city: 'Marrakech', country: 'Maroc', image: 'https://images.unsplash.com/photo-1539037116277-4db20889f2d4?w=600&q=80' },
  { slug: 'dubai', city: 'Dubaï', country: 'Émirats', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80' },
  { slug: 'kuala-lumpur', city: 'Kuala Lumpur', country: 'Malaisie', image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600&q=80' },
  { slug: 'le-caire', city: 'Le Caire', country: 'Égypte', image: 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=600&q=80' },
  { slug: 'medine', city: 'Médine', country: 'Arabie Saoudite', image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=600&q=80' },
]

const FEATURES = [
  { icon: '🍽', title: 'Restaurants halal', desc: 'Adresses certifiées halal dans chaque ville, avec avis et notes.' },
  { icon: '🕌', title: 'Mosquées proches', desc: 'Localisez la mosquée la plus proche en quelques secondes.' },
  { icon: '🧭', title: 'Guides pratiques', desc: 'Conseils culturels, horaires, transports — tout pour voyager serein.' },
  { icon: '✈️', title: 'Voyagez serein', desc: "Plus de stress. Concentrez-vous sur l'essentiel : votre voyage." },
]

export default function HomePage() {
  return (
    <main style={{ backgroundColor: '#faf8f4' }}>
      {/* Hero */}
      <section style={{ backgroundColor: '#1a3a2a' }} className="relative px-4 pt-20 pb-24 overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-1/4 w-96 h-96 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 right-1/4 w-64 h-64 rounded-full bg-white blur-2xl" />
        </div>
        <div className="relative max-w-3xl mx-auto text-center">
          <p style={{ color: '#c9a870' }} className="text-sm font-semibold uppercase tracking-widest mb-6">
            ◆ Guide de voyage halal
          </p>
          <h1 className="text-4xl sm:text-6xl font-bold text-white leading-tight mb-6" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
            Voyagez halal,<br />voyagez serein
          </h1>
          <p className="text-white/60 text-lg mb-10 max-w-xl mx-auto">
            Restaurants halal, mosquées et conseils pratiques pour le voyageur musulman du monde entier.
          </p>

          <form action="/search" method="GET" className="flex flex-col sm:flex-row gap-3 max-w-xl mx-auto">
            <input
              type="text"
              name="q"
              placeholder="Istanbul, Paris, Tokyo…"
              autoComplete="off"
              className="flex-1 px-5 py-4 text-gray-900 bg-white rounded-2xl text-base focus:outline-none focus:ring-2 focus:ring-[#c9a870]"
            />
            <button
              type="submit"
              style={{ backgroundColor: '#c9a870' }}
              className="text-[#1a3a2a] px-8 py-4 rounded-2xl font-bold text-base hover:opacity-90 transition-opacity whitespace-nowrap"
            >
              Rechercher
            </button>
          </form>

          <div className="mt-5 flex flex-wrap justify-center gap-4 text-sm">
            {['Istanbul', 'Marrakech', 'Dubaï'].map((city) => (
              <a
                key={city}
                href={`/search?q=${encodeURIComponent(city)}`}
                className="text-white/40 hover:text-white/80 transition-colors"
              >
                {city} →
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Stats bar */}
      <section style={{ backgroundColor: '#f5f0e8' }} className="border-b border-[#e8d5a3]/50">
        <div className="max-w-4xl mx-auto px-4 py-5 flex flex-wrap justify-center gap-8 text-sm">
          {[
            { value: '50+', label: 'destinations' },
            { value: '10 000+', label: 'restaurants halal' },
            { value: '5 000+', label: 'mosquées référencées' },
            { value: '100%', label: 'gratuit' },
          ].map((stat) => (
            <div key={stat.label} className="text-center">
              <span className="font-bold text-[#1a3a2a] text-lg">{stat.value}</span>
              <span className="text-gray-500 ml-2">{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Destinations */}
      <section className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-10">
            <div>
              <p style={{ color: '#c9a870' }} className="text-xs font-semibold uppercase tracking-widest mb-1">Explorez</p>
              <h2 className="text-2xl font-bold text-[#1a3a2a]" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                Destinations populaires
              </h2>
            </div>
            <Link href="/destinations" className="text-sm text-[#1a3a2a] hover:underline font-medium">
              Voir tout →
            </Link>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
            {DESTINATIONS.map((d) => (
              <Link
                key={d.slug}
                href={`/destinations/${d.slug}`}
                className="group block relative overflow-hidden rounded-3xl rounded-tl-[9999px] rounded-tr-[9999px] aspect-[3/4] sm:aspect-[4/5]"
              >
                <Image
                  src={d.image}
                  alt={d.city}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="text-white font-bold text-base">{d.city}</div>
                  <div className="text-white/60 text-xs mt-0.5">{d.country}</div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section style={{ backgroundColor: '#1a3a2a' }} className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <p style={{ color: '#c9a870' }} className="text-xs font-semibold uppercase tracking-widest mb-3">Pourquoi nous ?</p>
            <h2 className="text-2xl font-bold text-white" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
              Tout ce qu'il faut pour voyager halal
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} style={{ backgroundColor: '#2d5a3d' }} className="rounded-2xl p-6">
                <div className="text-3xl mb-3">{f.icon}</div>
                <div className="font-bold text-white mb-2">{f.title}</div>
                <div className="text-sm text-white/50 leading-relaxed">{f.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA app */}
      <section style={{ backgroundColor: '#f5f0e8' }} className="py-16 px-4 text-center">
        <p style={{ color: '#c9a870' }} className="text-xs font-semibold uppercase tracking-widest mb-3">Bientôt disponible</p>
        <h2 className="text-2xl font-bold text-[#1a3a2a] mb-4" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
          L'application mobile arrive
        </h2>
        <p className="text-gray-500 mb-8 max-w-md mx-auto text-sm">
          Géolocalisation, boussole Qibla, horaires de prière — tout dans votre poche.
        </p>
        <Link
          href="/application"
          style={{ backgroundColor: '#1a3a2a' }}
          className="inline-block text-white px-8 py-3 rounded-full font-semibold text-sm hover:opacity-90 transition-opacity"
        >
          En savoir plus
        </Link>
      </section>
    </main>
  )
}
