import type { Metadata } from 'next'
import { destinations } from '@/lib/data'
import DestinationCard from '@/components/destination/DestinationCard'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Destinations Voyage Halal — Meilleures Villes du Monde',
  description:
    'Toutes les destinations halal du monde : Istanbul, Marrakech, Dubaï, Kuala Lumpur et bien plus. Restaurants halal, mosquées et guides pour chaque ville.',
  path: '/destinations',
})

export default function DestinationsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          Destinations Voyage Halal
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Découvrez les meilleures destinations pour voyager halal dans le monde entier.
          Restaurants certifiés, mosquées et guides pratiques inclus.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {destinations.map((destination) => (
          <DestinationCard key={destination.slug} destination={destination} />
        ))}
      </div>
    </div>
  )
}
