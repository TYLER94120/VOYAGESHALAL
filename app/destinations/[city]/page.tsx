import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { readdirSync, readFileSync } from 'fs'
import path from 'path'
import type { Ville } from '@/lib/villeTypes'
import VilleDesktop from '@/components/villes/VilleDesktop'
import VilleFaq from '@/components/villes/VilleFaq'
import HotelCTA from '@/components/affiliate/HotelCTA'
import { DestinationFaqSchema, DestinationSchema } from '@/components/SchemaOrg'
import CitySync from '@/components/location/CitySync'
import EmailCapture from '@/components/ui/EmailCapture'
import { relatedForCity, countrySlugForName } from '@/lib/relatedContent'
import cityCoords from '@/lib/cityCoords.json'
import { getDomainSEO, FR_URL, EN_URL } from '@/lib/domain'

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
    `🕌 Guide halal ${ville.nom} 2026 : Halal Trust Score™ ${ville.score_halal}/5 · ${restos.toLocaleString('fr-FR')} restaurants halal · Horaires de prière en temps réel${mosquees ? ` · ${mosquees.toLocaleString('fr-FR')} mosquées` : ''} · Confirmé par la communauté.`
  const ogImage = ville.image ?? ville.image_hero
  const nbRestos = ville.restaurants?.length ?? 0
  const nbMosq = ville.mosqueesPrincipales?.length ?? mosquees ?? 0
  const nbHotels = ville.hotels?.length ?? 0

  const { isEN, brand, siteUrl } = await getDomainSEO()
  const title = isEN
    ? `${ville.nom} Halal Travel Guide 2026 — Restaurants, Mosques & Tips | ${brand}`
    : `${ville.nom} Halal 2026 : Restaurants, Mosquées & Guide Complet | ${brand}`
  const description = isEN
    ? (ville.metaDescription_en ?? `Complete halal guide for ${ville.nom}: ${nbRestos}+ halal restaurants, ${nbMosq} mosques, ${nbHotels} hotels, prayer times and practical tips for Muslim travelers.`).slice(0, 300)
    : `Guide halal complet pour ${ville.nom} : ${nbRestos}+ restaurants halal, ${nbMosq} mosquées, ${nbHotels} hôtels, horaires de prière et conseils pratiques pour voyager en musulman. ${richDesc}`.slice(0, 300)
  const ogTitle = isEN
    ? `${ville.nom} Halal Travel Guide 2026 — Muslim-Friendly`
    : `${ville.nom} Halal 2026 — Guide Voyage Musulman`
  const ogDesc = isEN
    ? `Halal restaurants, nearby mosques and prayer times in ${ville.nom}. The complete guide for Muslim travel.`
    : `Restaurants halal, mosquées proches et horaires de prière à ${ville.nom}. Le guide complet pour voyager halal.`

  // Protection qualité : une fiche sans aucun contenu réel (0 resto, 0 mosquée,
  // 0 hôtel, 0 activité) dilue le domaine → noindex (mais on garde follow pour
  // laisser passer le maillage). Les fiches avec du contenu restent indexables.
  const contentCount = (ville.restaurants?.length ?? 0) + (ville.mosqueesPrincipales?.length ?? 0)
    + (ville.hotels?.length ?? 0) + (ville.activites?.length ?? 0)
  const thin = contentCount < 3

  return {
    title: { absolute: title },
    description,
    ...(thin ? { robots: { index: false, follow: true } } : {}),
    alternates: {
      canonical: `${siteUrl}/destinations/${city}`,
      languages: {
        fr: `${FR_URL}/destinations/${city}`,
        en: `${EN_URL}/destinations/${city}`,
        'x-default': `${EN_URL}/destinations/${city}`,
      },
    },
    openGraph: {
      title: ogTitle,
      description: ogDesc,
      url: `${siteUrl}/destinations/${city}`,
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630, alt: `Halal travel ${ville.nom}` }] } : {}),
    },
  }
}

export default async function DestinationPage({ params }: Props) {
  const { city } = await params
  const ville = getVille(city)
  if (!ville) notFound()

  // Maillage interne : villes du même pays d'abord, complété par d'autres, hors ville courante
  const { isEN, siteUrl } = await getDomainSEO()
  const all = cityCoords as { slug: string; nom: string; pays?: string; lat?: number; lng?: number }[]
  const sameCountry = all.filter((c) => c.slug !== city && c.pays === ville.pays)
  const others = all.filter((c) => c.slug !== city && c.pays !== ville.pays)
  const related = [...sameCountry, ...others].slice(0, 12)
  const coords = all.find((c) => c.slug === city)

  return (
    <>
      {/* Mémorise automatiquement cette ville pour tout le site si aucune n'est encore choisie */}
      {coords?.lat != null && coords?.lng != null && (
        <CitySync city={{ slug: city, nom: ville.nom, pays: ville.pays, lat: coords.lat, lng: coords.lng }} />
      )}

      {/* Design unifié responsive (mobile + desktop : 1 colonne épurée) */}
      <VilleDesktop ville={ville} />

      {/* CTA affilié hôtels (revenu n°1) — visible sur toute la page ville */}
      <section style={{ background: 'var(--creme)', padding: '8px 18px 24px' }}>
        <div style={{ maxWidth: 820, margin: '0 auto' }}>
          <HotelCTA cityName={ville.nom} variant="banner" />
        </div>
      </section>

      {/* FAQ visible (même source que le JSON-LD FAQPage) */}
      <VilleFaq ville={ville} en={isEN} />

      {/* Maillage interne — autres destinations halal */}
      <nav aria-label={isEN ? 'More halal destinations' : 'Autres destinations halal'} style={{ background: 'var(--creme)', borderTop: '1px solid rgba(11,26,15,0.06)', padding: '28px 18px 80px' }}>
        <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8, marginBottom: '14px' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '20px', fontWeight: 700, color: 'var(--nuit)', margin: 0 }}>
              {isEN ? 'More halal destinations' : 'Autres destinations halal'}
            </h2>
            <a href="/destinations?all=1" style={{ fontSize: '14px', fontWeight: 700, color: 'var(--foret)', textDecoration: 'none' }}>
              {isEN ? 'See all destinations →' : 'Voir toutes les destinations →'}
            </a>
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '9px' }}>
            {related.map((c) => (
              <a key={c.slug} href={`/destinations/${c.slug}`} style={{ padding: '8px 15px', background: '#fff', border: '1px solid rgba(27,67,50,0.2)', borderRadius: '30px', fontSize: '14px', fontWeight: 600, color: 'var(--foret)', textDecoration: 'none' }}>
                {c.nom} Halal
              </a>
            ))}
          </div>
        </div>
      </nav>

      {/* Maillage interne : guides & articles liés + pays parent + coins prière */}
      {(() => {
        const guidesLies = relatedForCity(ville.nom, ville.pays, 4, isEN ? 'en' : 'fr')
        const paysSlug = countrySlugForName(ville.pays)
        return (
          <section style={{ maxWidth: 820, margin: '0 auto', padding: '8px 20px 8px' }}>
            {guidesLies.length > 0 && (
              <>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 700, color: 'var(--nuit)', margin: '8px 0 12px' }}>
                  {isEN ? `Guides & articles for ${ville.nom}` : `Guides & articles pour ${ville.nom}`}
                </h2>
                <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 18px', display: 'grid', gap: 8 }}>
                  {guidesLies.map((r) => (
                    <li key={r.slug}>
                      <a href={`/${r.type === 'guide' ? 'guides' : 'blog'}/${r.slug}`} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '12px 16px', borderRadius: 12, border: '1px solid rgba(27,67,50,0.18)', background: '#fff', color: 'var(--foret)', fontWeight: 600, textDecoration: 'none' }}>
                        <span>{r.type === 'guide' ? '📗' : '📝'} {r.title}</span>
                        {r.readTime && <span style={{ opacity: 0.5, fontSize: 13, whiteSpace: 'nowrap' }}>{r.readTime}</span>}
                      </a>
                    </li>
                  ))}
                </ul>
              </>
            )}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 14 }}>
              {(ville.hotels?.length ?? 0) >= 3 && (
                <a href={`/hotels/${city}`} style={{ fontWeight: 700, color: 'var(--foret)' }}>
                  🏨 {isEN ? `Halal hotels in ${ville.nom}` : `Hôtels halal à ${ville.nom}`} →
                </a>
              )}
              {paysSlug && (
                <a href={`/destinations/pays/${paysSlug}`} style={{ fontWeight: 700, color: 'var(--foret)' }}>
                  🌍 {isEN ? `Halal travel in ${ville.pays}` : `Voyage halal ${ville.pays}`} →
                </a>
              )}
              <a href={`/priere/${city}`} style={{ fontWeight: 700, color: '#6b21a8' }}>
                🧭 {isEN ? `Where to pray in ${ville.nom}` : `Où prier à ${ville.nom}`} →
              </a>
            </div>
          </section>
        )
      })()}

      {/* Capture email en bas de fiche ville */}
      <div style={{ padding: '24px 20px 8px' }}>
        <EmailCapture
          compact
          source="ville"
          title={isEN ? `Free halal guide for ${ville.nom}` : `Guide halal gratuit pour ${ville.nom}`}
          subtitle={isEN ? 'Addresses, prayer spots and tips by email.' : 'Adresses, coins prière et astuces par email.'}
        />
      </div>

      <DestinationSchema ville={ville} slug={city} en={isEN} siteUrl={siteUrl} />
      <DestinationFaqSchema ville={ville} en={isEN} />
    </>
  )
}
