import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { readdirSync, readFileSync } from 'fs'
import path from 'path'
import type { Ville } from '@/lib/villeTypes'
import VilleMobile from '@/components/villes/VilleMobile'
import VilleDesktop from '@/components/villes/VilleDesktop'
import { DestinationFaqSchema, DestinationSchema } from '@/components/SchemaOrg'
import cityCoords from '@/lib/cityCoords.json'

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
    title: `${ville.nom} Halal 2026 : Restaurants, Mosquées & Guide Complet`,
    description: `Guide halal complet pour ${ville.nom} : ${nbRestos}+ restaurants certifiés halal, ${nbMosq} mosquées, ${nbHotels} hôtels, horaires de prière et conseils pratiques pour voyager en musulman. ${richDesc}`.slice(0, 300),
    alternates: { canonical: `https://www.voyageshalal.fr/destinations/${city}` },
    openGraph: {
      title: `${ville.nom} Halal 2026 — Guide Voyage Musulman`,
      description: `Restaurants halal certifiés, mosquées proches et horaires de prière à ${ville.nom}. Le guide complet pour voyager halal.`,
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630, alt: `Voyage halal ${ville.nom}` }] } : {}),
    },
  }
}

export default async function DestinationPage({ params }: Props) {
  const { city } = await params
  const ville = getVille(city)
  if (!ville) notFound()

  // Maillage interne : villes du même pays d'abord, complété par d'autres, hors ville courante
  const all = cityCoords as { slug: string; nom: string; pays?: string }[]
  const sameCountry = all.filter((c) => c.slug !== city && c.pays === ville.pays)
  const others = all.filter((c) => c.slug !== city && c.pays !== ville.pays)
  const related = [...sameCountry, ...others].slice(0, 12)

  return (
    <>
      {/* < 1024px : expérience app mobile · ≥ 1024px : layout web 3 colonnes */}
      <div className="lg:hidden">
        <VilleMobile ville={ville} />
      </div>
      <div className="hidden lg:block">
        <VilleDesktop ville={ville} />
      </div>

      {/* Maillage interne — autres destinations halal */}
      <nav aria-label="Autres destinations halal" style={{ background: 'var(--creme)', borderTop: '1px solid rgba(11,26,15,0.06)', padding: '28px 18px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 700, color: 'var(--nuit)', marginBottom: '14px' }}>
            Autres destinations halal
          </h2>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '9px' }}>
            {related.map((c) => (
              <a key={c.slug} href={`/destinations/${c.slug}`} style={{ padding: '8px 15px', background: '#fff', border: '1px solid rgba(27,67,50,0.2)', borderRadius: '30px', fontSize: '14px', fontWeight: 600, color: 'var(--foret)', textDecoration: 'none' }}>
                {c.nom} Halal
              </a>
            ))}
          </div>
        </div>
      </nav>

      <DestinationSchema ville={ville} slug={city} />
      <DestinationFaqSchema ville={ville} />
    </>
  )
}
