import type { Metadata } from 'next'
import fs from 'fs'
import path from 'path'
import { buildMetadata } from '@/lib/seo'
import DestinationsClient, { type VilleCard } from '@/components/destination/DestinationsClient'
import IslamicPattern from '@/components/ui/IslamicPattern'

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
        const st = v.statistiques ?? {}
        const bits: string[] = []
        if (st.mosquees) bits.push(`${Number(st.mosquees).toLocaleString('fr-FR')} mosquées`)
        if (st.restaurants_halal) bits.push(`${Number(st.restaurants_halal).toLocaleString('fr-FR')}+ restaurants`)
        const subtitle = bits.length ? bits.join(' · ') : desc.slice(0, 60)
        return {
          slug,
          nom: v.nom ?? slug,
          pays: v.pays ?? '',
          scoreHalal: v.score_halal ?? null,
          description: desc,
          subtitle,
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
  Toutes: [],
  'Moyen-Orient': ['Émirats Arabes Unis', 'Émirats', 'Arabie Saoudite', 'Qatar', 'Jordanie', 'Oman'],
  Afrique: ['Maroc', 'Algérie', 'Tunisie', 'Égypte'],
  Asie: ['Malaisie', 'Indonésie', 'Maldives'],
  Europe: ['France', 'Royaume-Uni', 'Turquie'],
  Omra: ['Arabie Saoudite'],
}

export default function DestinationsPage() {
  const villes = getAllVilles()

  return (
    <main style={{ backgroundColor: '#fdfaf3' }}>
      {/* Hero compact nuit */}
      <section className="relative overflow-hidden px-6 sm:px-16 pt-14 pb-16 text-center" style={{ backgroundColor: '#0b1a0f' }}>
        <IslamicPattern opacity={0.07} />
        <div className="relative z-10">
          <p style={{ color: '#c9a84c' }} className="text-xs font-semibold uppercase tracking-[0.3em] mb-4">
            Toutes les destinations
          </p>
          <h1
            className="text-4xl sm:text-5xl font-bold text-white leading-[1.05] mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 900 }}
          >
            {villes.length} destinations halal <span className="gold-em">vérifiées</span>
          </h1>
          <p className="text-white/60 text-base max-w-xl mx-auto leading-relaxed">
            Restaurants halal, mosquées, guides pratiques et conseils locaux — pour voyager
            sereinement en tant que musulman.
          </p>
        </div>
      </section>

      <DestinationsClient villes={villes} continents={continents} />
    </main>
  )
}
