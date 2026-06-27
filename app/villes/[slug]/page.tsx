import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import { readdirSync, readFileSync } from 'fs'
import path from 'path'
import type { Ville } from '@/lib/villeTypes'
import CityTabs from '@/components/villes/CityTabs'

export const dynamicParams = false

interface Props {
  params: Promise<{ slug: string }>
}

const villesDir = path.join(process.cwd(), 'data', 'villes')

function getVilleSlugs(): string[] {
  try {
    return readdirSync(villesDir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace('.json', ''))
  } catch {
    return []
  }
}

function getVille(slug: string): Ville | null {
  try {
    const raw = readFileSync(path.join(villesDir, `${slug}.json`), 'utf-8')
    return JSON.parse(raw) as Ville
  } catch {
    return null
  }
}

export async function generateStaticParams() {
  return getVilleSlugs().map((slug) => ({ slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const ville = getVille(slug)
  if (!ville) return {}
  return {
    title: ville.meta_title,
    description: ville.meta_description,
  }
}

export default async function VillePage({ params }: Props) {
  const { slug } = await params
  const ville = getVille(slug)
  if (!ville) notFound()

  return (
    <main style={{ backgroundColor: '#faf8f4' }} className="min-h-screen">
      <section className="relative h-[480px] sm:h-[560px] overflow-hidden">
        <Image src={ville.image_hero} alt={ville.image_alt} fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-12 pb-10">
          <p style={{ color: '#c9a870' }} className="text-xs font-semibold uppercase tracking-[0.2em] mb-3">{ville.region}</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
            {ville.nom}
          </h1>
          <p className="text-white/80 text-base max-w-2xl leading-relaxed">{ville.description}</p>
        </div>
      </section>

      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-12 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: '#1a3a2a' }}>{ville.statistiques.mosquees.toLocaleString('fr-FR')}</p>
            <p className="text-xs text-gray-500 mt-0.5">Mosquées</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: '#1a3a2a' }}>{ville.statistiques.restaurants_halal.toLocaleString('fr-FR')}+</p>
            <p className="text-xs text-gray-500 mt-0.5">Restaurants halal</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: '#1a3a2a' }}>{ville.statistiques.hotels_halal}</p>
            <p className="text-xs text-gray-500 mt-0.5">Hôtels halal-friendly</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: '#1a3a2a' }}>{ville.statistiques.habitants_musulmans_pct}%</p>
            <p className="text-xs text-gray-500 mt-0.5">Population musulmane</p>
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-gray-100 px-6 sm:px-12 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <span className="text-sm text-gray-500 font-medium">Score Halal :</span>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="text-xl" style={{ color: i < ville.score_halal ? '#c9a870' : '#e5e7eb' }}>★</span>
            ))}
          </div>
          <span className="text-sm font-bold" style={{ color: '#1a3a2a' }}>{ville.score_halal}/5</span>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-12 py-8">
        <CityTabs ville={ville} />
      </div>
    </main>
  )
}
