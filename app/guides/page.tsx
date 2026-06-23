import type { Metadata } from 'next'
import { guides } from '@/lib/data'
import GuideCard from '@/components/ui/GuideCard'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Guides Voyage Halal — Conseils Pratiques pour Voyageurs Musulmans',
  description:
    'Tous nos guides pratiques pour voyager halal : débutants, destinations, Ramadan, hébergement. Des conseils vérifiés pour voyager sereinement.',
  path: '/guides',
})

export default function GuidesPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          Guides Voyage Halal
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Nos guides pratiques pour voyager halal en toute sérénité.
          Rédigés par des voyageurs musulmans pour des voyageurs musulmans.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {guides.map((guide) => (
          <GuideCard key={guide.slug} guide={guide} />
        ))}
      </div>
    </div>
  )
}
