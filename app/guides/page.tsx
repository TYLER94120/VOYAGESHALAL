import type { Metadata } from 'next'
import { guides } from '@/lib/data'
import GuideCard from '@/components/ui/GuideCard'
import { buildMetadata } from '@/lib/seo'
import { getDomainSEO } from '@/lib/domain'

export async function generateMetadata(): Promise<Metadata> {
  const { isEN } = await getDomainSEO()
  return buildMetadata({
    title: isEN ? 'Halal Travel Guides — Practical Tips for Muslim Travelers' : 'Guides Voyage Halal — Conseils Pratiques pour Voyageurs Musulmans',
    description: isEN
      ? 'All our practical guides for halal travel: beginners, destinations, Ramadan, accommodation. Verified tips to travel with peace of mind.'
      : 'Tous nos guides pratiques pour voyager halal : débutants, destinations, Ramadan, hébergement. Des conseils vérifiés pour voyager sereinement.',
    path: '/guides',
  })
}

export default async function GuidesPage() {
  const { isEN: en } = await getDomainSEO()
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          {en ? 'Halal Travel Guides' : 'Guides Voyage Halal'}
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          {en
            ? 'Our practical guides to travel halal with total peace of mind. Written by Muslim travelers, for Muslim travelers.'
            : 'Nos guides pratiques pour voyager halal en toute sérénité. Rédigés par des voyageurs musulmans pour des voyageurs musulmans.'}
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
