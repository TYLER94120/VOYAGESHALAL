import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import { readdirSync, readFileSync } from 'fs'
import path from 'path'
import type { Ville } from '@/lib/villeTypes'
import CityTabs from '@/components/villes/CityTabs'
import IslamicPattern from '@/components/ui/IslamicPattern'
import { RamadanSection } from '@/components/RamadanSection'
import { ShareButtons } from '@/components/ShareButtons'
import { DestinationFaqSchema } from '@/components/SchemaOrg'

// Aladhan geocodes better with transliterated/English city names
const API_CITY_NAME: Record<string, string> = {
  'le-caire': 'Cairo',
  medine: 'Medina',
  'la-mecque': 'Mecca',
  alger: 'Algiers',
  tanger: 'Tangier',
  mascate: 'Muscat',
  londres: 'London',
}

export const dynamicParams = false

interface Props {
  params: Promise<{ city: string }>
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
  return getVilleSlugs().map((city) => ({ city }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params
  const ville = getVille(city)
  if (!ville) return {}
  const restos = ville.statistiques?.restaurants_halal ?? (ville.restaurants?.length ?? 0)
  const mosquees = ville.statistiques?.mosquees
  const richDesc = `🕌 Guide halal ${ville.nom} 2026 : Halal Trust Score™ ${ville.score_halal}/5 · ${restos.toLocaleString('fr-FR')} restaurants certifiés · Horaires de prière en temps réel${mosquees ? ` · ${mosquees.toLocaleString('fr-FR')} mosquées` : ''} · Vérifié par la communauté musulmane.`
  return {
    title: ville.meta_title,
    description: richDesc,
  }
}

export default async function DestinationPage({ params }: Props) {
  const { city } = await params
  const ville = getVille(city)
  if (!ville) notFound()

  const apiCityName = API_CITY_NAME[city] ?? ville.nom

  return (
    <main style={{ backgroundColor: '#faf8f4' }} className="min-h-screen">
      <section className="relative h-[480px] sm:h-[560px] overflow-hidden">
        <Image src={ville.image_hero} alt={ville.image_alt} fill className="object-cover" priority sizes="100vw" />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(to bottom, rgba(11,26,15,0.40) 0%, rgba(11,26,15,0.70) 60%, rgba(11,26,15,0.90) 100%)' }} />
        <IslamicPattern opacity={0.05} />

        {/* Badge Halal Trust Score™ (hexagone or) */}
        <div className="absolute top-5 right-5 z-10">
          <div className="halal-hex">
            <span className="halal-hex-label">Halal Trust Score™</span>
            <span className="halal-hex-score">{ville.score_halal}/5</span>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-12 pb-10 max-w-6xl mx-auto">
          <p style={{ color: '#c9a84c' }} className="text-xs font-semibold uppercase tracking-[0.25em] mb-3">{ville.region}</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-[1.05] mb-4" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>
            Voyage Halal à <span className="gold-em">{ville.nom}</span><br className="hidden sm:block" /> — Guide Complet {new Date().getFullYear()}
          </h1>
          <p className="text-white/75 text-base max-w-2xl leading-relaxed">
            {typeof ville.description === 'string' ? ville.description : (ville.description as { court?: string; long?: string })?.court ?? ''}
          </p>
        </div>
      </section>

      <section className="bg-white border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 sm:px-12 py-6 grid grid-cols-2 sm:grid-cols-4 gap-6">
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: '#1b4332' }}>{(ville.statistiques?.mosquees ?? 0).toLocaleString('fr-FR')}</p>
            <p className="text-xs text-gray-500 mt-0.5">Mosquées</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: '#1b4332' }}>{(ville.statistiques?.restaurants_halal ?? 0).toLocaleString('fr-FR')}+</p>
            <p className="text-xs text-gray-500 mt-0.5">Restaurants halal</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: '#1b4332' }}>{ville.statistiques?.hotels_halal ?? ville.statistiques?.hotels_halal_friendly ?? 0}</p>
            <p className="text-xs text-gray-500 mt-0.5">Hôtels halal-friendly</p>
          </div>
          <div className="text-center">
            <p className="text-2xl font-bold" style={{ color: '#1b4332' }}>{ville.statistiques?.habitants_musulmans_pct ?? ville.statistiques?.musulmans_pct ?? '—'}%</p>
            <p className="text-xs text-gray-500 mt-0.5">Population musulmane</p>
          </div>
        </div>
      </section>

      <section className="bg-white border-b border-gray-100 px-6 sm:px-12 py-4">
        <div className="max-w-6xl mx-auto flex items-center gap-3">
          <span className="text-sm text-gray-500 font-medium">Score Halal :</span>
          <div className="flex gap-1">
            {Array.from({ length: 5 }).map((_, i) => (
              <span key={i} className="text-xl" style={{ color: i < ville.score_halal ? '#c9a84c' : '#e5e7eb' }}>★</span>
            ))}
          </div>
          <span className="text-sm font-bold" style={{ color: '#1b4332' }}>{ville.score_halal}/5</span>
        </div>
      </section>

      <div className="max-w-6xl mx-auto px-4 sm:px-12 py-8">
        <RamadanSection ville={ville} apiCityName={apiCityName} />

        <CityTabs ville={ville} apiCityName={apiCityName} />

        <ShareButtons
          titre={`Guide halal ${ville.nom} — VoyagesHalal`}
          url={`https://www.voyageshalal.fr/destinations/${city}`}
          description={
            typeof ville.description === 'string'
              ? ville.description
              : ville.description?.court ?? ''
          }
        />
      </div>

      <DestinationFaqSchema ville={ville} />
    </main>
  )
}
