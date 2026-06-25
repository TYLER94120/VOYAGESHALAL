import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { destinations } from '@/lib/data'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Destinations Voyage Halal — Meilleures Villes du Monde',
  description: 'Toutes les destinations halal du monde : Istanbul, Marrakech, Dubaï, Kuala Lumpur et bien plus.',
  path: '/destinations',
})

const BADGES: Record<string, string> = {
  istanbul: 'INCONTOURNABLE',
  marrakech: 'POPULAIRE',
  dubai: 'LUXE',
  'kuala-lumpur': 'TENDANCE',
  'le-caire': 'CULTURELLE',
  medine: 'SPIRITUELLE',
}

export default function DestinationsPage() {
  return (
    <main style={{ backgroundColor: '#faf8f4' }}>
      <section style={{ backgroundColor: '#1a3a2a' }} className="px-8 sm:px-16 pt-16 pb-20">
        <p style={{ color: '#c9a870' }} className="text-xs font-semibold uppercase tracking-[0.2em] mb-5">Toutes les destinations</p>
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 max-w-2xl" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
          Destinations halal dans le monde
        </h1>
        <p className="text-white/50 text-base max-w-xl leading-relaxed">
          Plus de 50 destinations vérifiées pour voyager sereinement en tant que musulman — restaurants halal, mosquées, guides pratiques et conseils locaux.
        </p>
      </section>

      <div className="bg-white border-b border-gray-100 px-8 sm:px-16 py-3">
        <nav className="flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-[#1a3a2a]">Accueil</Link>
          <span>›</span>
          <span className="text-gray-700">Destinations</span>
        </nav>
      </div>

      <div className="px-4 sm:px-16 py-6 flex gap-2 flex-wrap">
        {['Toutes', 'Moyen-Orient', 'Afrique', 'Asie', 'Europe', 'Omra'].map((f, i) => (
          <button key={f} className="px-4 py-2 rounded-full text-sm font-medium border transition-all"
            style={i === 0 ? { backgroundColor: '#1a3a2a', color: 'white', borderColor: '#1a3a2a' } : { backgroundColor: 'white', color: '#555', borderColor: '#e5e7eb' }}>
            {f}
          </button>
        ))}
      </div>

      <section className="max-w-6xl mx-auto px-4 sm:px-8 pb-20">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
          {destinations.map((d) => (
            <Link key={d.slug} href={`/destinations/${d.slug}`} className="group block relative overflow-hidden shadow-sm hover:shadow-md transition-shadow" style={{ borderRadius: '9999px 9999px 1rem 1rem' }}>
              <div className="relative" style={{ aspectRatio: '3/4' }}>
                <Image src={d.coverImage} alt={d.city} fill className="object-cover group-hover:scale-105 transition-transform duration-500" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                {BADGES[d.slug] && (
                  <div className="absolute top-4 left-1/2 -translate-x-1/2">
                    <span style={{ backgroundColor: 'rgba(201,168,112,0.92)', color: '#1a3a2a' }} className="text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap tracking-widest">{BADGES[d.slug]}</span>
                  </div>
                )}
                <div className="absolute bottom-0 left-0 right-0 p-4">
                  <div className="text-white font-bold text-base">{d.city}</div>
                  <div className="text-white/60 text-xs mt-0.5">{d.country}</div>
                  <div className="mt-2 flex gap-0.5">{Array.from({ length: 5 }).map((_, i) => <span key={i} style={{ color: i < d.halalScore ? '#c9a870' : 'rgba(255,255,255,0.3)' }} className="text-xs">★</span>)}</div>
                  <div style={{ color: '#c9a870' }} className="text-xs mt-2 font-medium">Guide complet →</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
