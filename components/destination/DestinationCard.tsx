import Link from 'next/link'
import type { Destination } from '@/lib/types'

function HalalScore({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={`text-sm ${i < score ? 'text-emerald-500' : 'text-gray-300'}`}>★</span>
      ))}
      <span className="text-xs text-gray-500 ml-1">Halal</span>
    </div>
  )
}

interface Props {
  destination: Destination
  featured?: boolean
}

export default function DestinationCard({ destination, featured = false }: Props) {
  return (
    <Link href={`/destinations/${destination.slug}`} className="group block">
      <div className={`bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 ${featured ? 'h-full' : ''}`}>
        <div className={`bg-gradient-to-br from-emerald-400 to-teal-600 relative ${featured ? 'h-56' : 'h-44'}`}>
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-6xl opacity-30">🕌</span>
          </div>
          <div className="absolute top-3 right-3">
            <span className="bg-white/90 text-emerald-700 text-xs font-semibold px-2 py-1 rounded-full">{destination.country}</span>
          </div>
          <div className="absolute bottom-3 left-3">
            <HalalScore score={destination.halalScore} />
          </div>
        </div>

        <div className="p-5">
          <h3 className="font-bold text-lg text-gray-900 group-hover:text-emerald-600 transition-colors">{destination.city}</h3>
          <p className="text-sm text-gray-500 mt-1 line-clamp-2">{destination.shortDescription}</p>

          <div className="mt-4 flex items-center gap-4 text-xs text-gray-400">
            <span>🕌 {destination.mosqueeCount.toLocaleString('fr-FR')} mosquées</span>
            <span>🍽 {destination.restaurantHalalCount.toLocaleString('fr-FR')}+ restaurants</span>
          </div>

          <div className="mt-3 flex flex-wrap gap-1.5">
            {destination.tags.slice(0, 3).map((tag) => (
              <span key={tag} className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full">{tag}</span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  )
}
