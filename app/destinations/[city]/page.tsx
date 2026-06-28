import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { readdirSync, readFileSync } from 'fs'
import path from 'path'
import type { Ville } from '@/lib/villeTypes'
import VilleMobile from '@/components/villes/VilleMobile'
import { DestinationFaqSchema } from '@/components/SchemaOrg'

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
  const richDesc =
    ville.metaDescription ??
    `🕌 Guide halal ${ville.nom} 2026 : Halal Trust Score™ ${ville.score_halal}/5 · ${restos.toLocaleString('fr-FR')} restaurants certifiés · Horaires de prière en temps réel${mosquees ? ` · ${mosquees.toLocaleString('fr-FR')} mosquées` : ''} · Vérifié par la communauté musulmane.`
  const ogImage = ville.image ?? ville.image_hero
  const nbRestos = ville.restaurants?.length ?? 0
  const nbMosq = ville.mosqueesPrincipales?.length ?? mosquees ?? 0
  const nbHotels = ville.hotels?.length ?? 0
  return {
    title: `${ville.nom} Halal — Restaurants, Mosquées, Hôtels | VoyagesHalal.fr`,
    description: `${nbRestos}+ restaurants halal, ${nbMosq} mosquées, ${nbHotels} hôtels à ${ville.nom}. ${richDesc}`.slice(0, 300),
    alternates: { canonical: `https://voyageshalal.fr/destinations/${city}` },
    openGraph: {
      title: `${ville.nom} Halal — VoyagesHalal.fr`,
      description: richDesc,
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630, alt: `Voyage halal ${ville.nom}` }] } : {}),
    },
  }
}

export default async function DestinationPage({ params }: Props) {
  const { city } = await params
  const ville = getVille(city)
  if (!ville) notFound()

  return (
    <>
      <VilleMobile ville={ville} />
      <DestinationFaqSchema ville={ville} />
    </>
  )
}
