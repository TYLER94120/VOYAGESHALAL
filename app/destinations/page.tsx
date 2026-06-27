import type { Metadata } from 'next'
import Link from 'next/link'
import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { destinations } from '@/lib/data'
import { buildMetadata } from '@/lib/seo'
import DestinationsClient from '@/components/destination/DestinationsClient'
import type { Destination } from '@/lib/types'

export const metadata: Metadata = buildMetadata({
  title: 'Destinations Voyage Halal — Meilleures Villes du Monde',
  description:
    'Toutes les destinations halal du monde : Istanbul, Marrakech, Dubaï, Kuala Lumpur et bien plus. Restaurants halal, mosquées et guides pour chaque ville.',
  path: '/destinations',
})

const COVER_IMAGES: Record<string, string> = {
  maldives: 'https://images.unsplash.com/photo-1514282401047-d79a71a590e8?w=800&q=80',
  bali: 'https://images.unsplash.com/photo-1537996194471-e657df975ab4?w=800&q=80',
  jakarta: 'https://images.unsplash.com/photo-1555899434-94d1368aa7af?w=800&q=80',
  amman: 'https://images.unsplash.com/photo-1539650116574-75c0c6d73f6e?w=800&q=80',
  mascate: 'https://images.unsplash.com/photo-1583417267826-aebc4d1542e1?w=800&q=80',
  'abu-dhabi': 'https://images.unsplash.com/photo-1512632578888-169bbbc64f33?w=800&q=80',
  fes: 'https://images.unsplash.com/photo-1548786811-5bcb78a0e2c1?w=800&q=80',
  tanger: 'https://images.unsplash.com/photo-1559592413-7cec4d0cae2b?w=800&q=80',
  agadir: 'https://images.unsplash.com/photo-1573843981267-be1999ff37cd?w=800&q=80',
}
const DEFAULT_COVER = 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=800&q=80'

function loadAllVilleDestinations(): Destination[] {
  const dir = join(process.cwd(), 'data', 'villes')
  const results: Destination[] = []
  try {
    for (const f of readdirSync(dir).filter((f) => f.endsWith('.json'))) {
      const slug = f.replace('.json', '')
      try {
        const v = JSON.parse(readFileSync(join(dir, f), 'utf-8'))
        const description =
          typeof v.description === 'string'
            ? v.description
            : (v.description?.long ?? v.description?.court ?? '')
        results.push({
          slug,
          city: v.nom ?? slug,
          country: v.pays ?? '',
          description,
          shortDescription: v.description?.court ?? description.slice(0, 120),
          coverImage: v.image_hero ?? COVER_IMAGES[slug] ?? DEFAULT_COVER,
          halalScore: v.score_halal ?? 4,
          mosqueeCount: v.statistiques?.mosquees ?? 0,
          restaurantHalalCount: v.statistiques?.restaurants_halal ?? 0,
          population: v.statistiques?.population ?? '',
          bestTime: v.infos_pratiques?.meilleure_periode ?? '',
          tags: ([v.region, v.pays] as string[]).filter(Boolean),
          restaurants: [],
          mosques: [],
          activities: [],
          tips: [],
          url: `/destinations/${slug}`,
        })
      } catch {
        // skip invalid JSON
      }
    }
  } catch {
    // data/villes not readable
  }
  return results
}

export default function DestinationsPage() {
  const villeDestinations = loadAllVilleDestinations()
  const villeSlugs = new Set(villeDestinations.map((d) => d.slug))
  const legacyOnly = destinations.filter((d) => !villeSlugs.has(d.slug))
  const allDestinations = [...villeDestinations, ...legacyOnly]

  return (
    <main style={{ backgroundColor: '#faf8f4' }}>
      <section style={{ backgroundColor: '#1a3a2a' }} className="px-8 sm:px-16 pt-16 pb-20">
        <p style={{ color: '#c9a870' }} className="text-xs font-semibold uppercase tracking-[0.2em] mb-5">
          Toutes les destinations
        </p>
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6 max-w-2xl"
          style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
        >
          Destinations halal dans le monde
        </h1>
        <p className="text-white/50 text-base max-w-xl leading-relaxed">
          Plus de {allDestinations.length} destinations vérifiées pour voyager sereinement en tant que
          musulman — restaurants halal, mosquées, guides pratiques et conseils locaux.
        </p>
      </section>

      <div className="bg-white border-b border-gray-100 px-8 sm:px-16 py-3">
        <nav className="flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-[#1a3a2a]">Accueil</Link>
          <span>›</span>
          <span className="text-gray-700">Destinations</span>
        </nav>
      </div>

      <DestinationsClient destinations={allDestinations} />
    </main>
  )
}
