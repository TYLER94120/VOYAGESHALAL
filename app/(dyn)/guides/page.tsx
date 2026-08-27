import type { Metadata } from 'next'
import { guides } from '@/lib/data'
import GuidesGrid from '@/components/guides/GuidesGrid'
import { buildMetadata } from '@/lib/seo'
import { getDomainSEO } from '@/lib/domain'
import { alternatesFor } from '@/lib/hreflang'

export async function generateMetadata(): Promise<Metadata> {
  const { isEN } = await getDomainSEO()
  return buildMetadata({
    title: isEN ? 'Muslim Travel Guides 2026: Cities, Ramadan, Umrah' : 'Guides Voyage Musulman 2026 : Villes, Ramadan, Omra',
    description: isEN
      ? 'City guides, Ramadan abroad, Umrah, halal hotels, first trip: our long-form guides for Muslim travellers, with real addresses and their source.'
      : 'Guides de villes, Ramadan à l’étranger, Omra, hôtels halal, premier voyage : nos guides longs pour voyageurs musulmans, adresses réelles et sourcées.',
    path: '/guides',
    ...alternatesFor('/guides', isEN),
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

      <GuidesGrid guides={guides.filter((g) => (g.lang ?? 'fr') === (en ? 'en' : 'fr'))} en={en} />
    </div>
  )
}
