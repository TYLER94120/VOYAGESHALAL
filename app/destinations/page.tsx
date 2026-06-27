import type { Metadata } from 'next'
import fs from 'fs'
import path from 'path'
import { buildMetadata } from '@/lib/seo'
import DestinationsClient, { type VilleCard } from '@/components/destination/DestinationsClient'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80'

export const metadata: Metadata = buildMetadata({
  title: 'Destinations Voyage Halal — Meilleures Villes du Monde',
  description:
    'Toutes les destinations halal du monde : Istanbul, Marrakech, Dubaï, Kuala Lumpur et bien plus. Restaurants halal, mosquées et guides pour chaque ville.',
  path: '/destinations',
})

function getAllVilles(): VilleCard[] {
  const dir = path.join(process.cwd(), 'data', 'villes')
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      try {
        const v = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'))
        const slug = f.replace('.json', '')
        const desc =
          typeof v.description === 'string'
            ? v.description
            : v.description?.court ?? v.description?.long ?? ''
        return {
          slug,
          nom: v.nom ?? slug,
          pays: v.pays ?? '',
          scoreHalal: v.score_halal ?? null,
          description: desc,
          image: v.image ?? v.image_hero ?? FALLBACK_IMG,
          continent: v.continent ?? null,
        } as VilleCard
      } catch {
        return null
      }
    })
    .filter((v): v is VilleCard => v !== null)
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
}

const continents: Record<string, string[]> = {
  Tous: [],
  'Moyen-Orient': ['Émirats Arabes Unis', 'Émirats', 'Arabie Saoudite', 'Qatar', 'Jordanie', 'Oman'],
  Afrique: ['Maroc', 'Algérie', 'Tunisie', 'Égypte'],
  Asie: ['Malaisie', 'Indonésie', 'Maldives'],
  Europe: ['France', 'Royaume-Uni', 'Turquie'],
}

export default function DestinationsPage() {
  const villes = getAllVilles()

  return (
    <main className="destinations-page">
      <div className="destinations-hero">
        <h1>🌍 Destinations halal</h1>
        <p>{villes.length} destinations vérifiées pour voyager sereinement</p>
      </div>

      <DestinationsClient villes={villes} continents={continents} />
    </main>
  )
}
