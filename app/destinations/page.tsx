import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { destinations } from '@/lib/data'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Destinations Voyage Halal — Meilleures Villes du Monde',
  description:
    'Toutes les destinations halal du monde : Istanbul, Marrakech, Dubaï, Kuala Lumpur et bien plus. Restaurants halal, mosquées et guides pour chaque ville.',
  path: '/destinations',
})

export default function DestinationsPage() {
  return (
    <main style={{ backgroundColor: '#faf8f4' }}>
      {/* Hero */}
      <section style={{ backgroundColor: '#1a3a2a' }} className="px-4 pt-14 pb-16 text-center">
        <p style={{ color: '#c9a870' }} className="text-xs font-semibold uppercase tracking-widest mb-4">
          ◆ Explorez le monde halal
        </p>
        <h1 className="text-3xl sm:text-5xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
          Destinations halal
        </h1>
        <p className="text-white/50 max-w-xl mx-auto text-base">
          Restaurants, mosquées et guides pratiques pour {destinations.length} villes du monde.
        </p>
      </section>

      {/* Grid */}
      <section className="max-w-5xl mx-auto px-4 py-12">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {destinations.map((d) => (
            <Link
              key={d.slug}
              href={`/destinations/${d.slug}`}
              className="group block relative overflow-hidden rounded-3xl rounded-tl-[9999px] rounded-tr-[9999px] aspect-[3/4]"
            >
              <Image
                src={d.coverImage}
                alt={d.city}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent" />
              <div className="absolute bottom-0 left-0 right-0 p-4">
                <div className="text-white font-bold text-base">{d.city}</div>
                <div className="text-white/60 text-xs mt-0.5">{d.country}</div>
                <div className="mt-2 flex gap-2 text-xs text-white/50">
                  <span>🍽 {d.restaurantHalalCount.toLocaleString('fr-FR')}+</span>
                  <span>🕌 {d.mosqueeCount.toLocaleString('fr-FR')}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
