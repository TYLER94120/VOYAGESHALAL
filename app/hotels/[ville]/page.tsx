import { notFound } from 'next/navigation'
import Link from 'next/link'
import { readFileSync } from 'fs'
import path from 'path'
import type { Metadata } from 'next'
import type { Ville } from '@/lib/villeTypes'
import { getDomainSEO, FR_URL, EN_URL } from '@/lib/domain'
import { dedupeHotels, noteOf, priceRank } from '@/lib/hotelFilter'
import HotelCTA from '@/components/affiliate/HotelCTA'
import JsonLd from '@/components/seo/JsonLd'
import cityCoords from '@/lib/cityCoords.json'

// Page dédiée « Hôtels halal à {Ville} » — cible les requêtes réelles GSC
// (« hotel halal marrakech », « hotel islamique dubai »…). SSR indexable,
// réutilise les hôtels des fiches villes + le tri de lib/hotelFilter.
// Jamais « certifié » : on parle d'hôtels « sans alcool / halal-friendly ».

export const dynamicParams = false

interface Props { params: Promise<{ ville: string }> }
interface CityRef { slug: string; nom: string; pays?: string }
const CITIES = cityCoords as CityRef[]

export function generateStaticParams() {
  return CITIES.map((c) => ({ ville: c.slug }))
}

function getVille(slug: string): Ville | null {
  try { return JSON.parse(readFileSync(path.join(process.cwd(), 'data', 'villes', `${slug}.json`), 'utf-8')) as Ville }
  catch { return null }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sortedHotels(ville: any) {
  const hotels = dedupeHotels(ville.hotels || [])
  return hotels.slice().sort((a, b) => {
    const na = noteOf(a) ?? 0, nb = noteOf(b) ?? 0
    if (nb !== na) return nb - na
    return (priceRank(a) ?? 9) - (priceRank(b) ?? 9)
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ville: slug } = await params
  const ville = getVille(slug)
  const { isEN, brand, siteUrl } = await getDomainSEO()
  if (!ville) return { title: isEN ? 'Halal hotels' : 'Hôtels halal' }
  const n = (ville.hotels?.length ?? 0)
  const title = isEN
    ? `Halal Hotels in ${ville.nom} 2026 — Alcohol-free, near mosques | ${brand}`
    : `Hôtels halal à ${ville.nom} 2026 — sans alcool, proches mosquées | ${brand}`
  const description = isEN
    ? `${n}+ halal-friendly hotels in ${ville.nom}: alcohol-free options, near mosques, family-friendly. Compare and book for your Muslim trip.`
    : `${n}+ hôtels halal-friendly à ${ville.nom} : options sans alcool, proches des mosquées, adaptés aux familles. Comparez et réservez pour votre voyage musulman.`
  return {
    title: { absolute: title }, description,
    ...(n < 3 ? { robots: { index: false, follow: true } } : {}),
    alternates: {
      canonical: `${siteUrl}/hotels/${slug}`,
      languages: { fr: `${FR_URL}/hotels/${slug}`, en: `${EN_URL}/hotels/${slug}`, 'x-default': `${EN_URL}/hotels/${slug}` },
    },
    openGraph: { title, description, url: `${siteUrl}/hotels/${slug}` },
  }
}

export default async function HotelsVillePage({ params }: Props) {
  const { ville: slug } = await params
  const ville = getVille(slug)
  if (!ville) notFound()
  const { isEN, siteUrl } = await getDomainSEO()
  const hotels = sortedHotels(ville)

  const itemList = {
    '@context': 'https://schema.org', '@type': 'ItemList',
    name: isEN ? `Halal hotels in ${ville.nom}` : `Hôtels halal à ${ville.nom}`,
    numberOfItems: hotels.length,
    itemListElement: hotels.slice(0, 25).map((h, i) => ({
      '@type': 'ListItem', position: i + 1,
      item: {
        '@type': 'Hotel', name: h.nom,
        ...(h.adresse ? { address: { '@type': 'PostalAddress', streetAddress: h.adresse, addressLocality: ville.nom } } : {}),
        ...(noteOf(h) ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: noteOf(h), bestRating: 5, ratingCount: h.avis_count ?? 20 } } : {}),
      },
    })),
  }
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isEN ? 'Home' : 'Accueil', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: ville.nom, item: `${siteUrl}/destinations/${slug}` },
      { '@type': 'ListItem', position: 3, name: isEN ? 'Halal hotels' : 'Hôtels halal', item: `${siteUrl}/hotels/${slug}` },
    ],
  }

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px 64px' }}>
      <JsonLd data={itemList} />
      <JsonLd data={breadcrumb} />
      <nav style={{ fontSize: 13, opacity: 0.7, marginBottom: 14 }}>
        <Link href="/">{isEN ? 'Home' : 'Accueil'}</Link> ›{' '}
        <Link href={`/destinations/${slug}`}>{ville.nom}</Link>
      </nav>

      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(26px,5vw,34px)', fontWeight: 800, margin: '0 0 8px' }}>
        {isEN ? `Halal hotels in ${ville.nom}` : `Hôtels halal à ${ville.nom}`}
      </h1>
      <p style={{ fontSize: 16, opacity: 0.85, margin: '0 0 20px' }}>
        {isEN
          ? `${hotels.length} halal-friendly hotels: alcohol-free options, close to mosques, family-friendly.`
          : `${hotels.length} hôtels halal-friendly : options sans alcool, proches des mosquées, adaptés aux familles.`}
      </p>

      <div style={{ margin: '0 0 24px' }}>
        <HotelCTA cityName={ville.nom} variant="banner" />
      </div>

      <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 10 }}>
        {hotels.slice(0, 60).map((h, i) => (
          <li key={h.id || i} style={{ padding: '16px 18px', borderRadius: 14, border: '1px solid rgba(27,67,50,0.15)', background: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap' }}>
              <strong style={{ fontSize: 16 }}>{h.nom}</strong>
              {noteOf(h) != null && <span style={{ fontWeight: 700, color: 'var(--or)' }}>★ {noteOf(h)}</span>}
            </div>
            <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {(h.categorie || h.type) && <span>{h.categorie || h.type}</span>}
              {(h.priceRange) && <span>· {h.priceRange}</span>}
              {(h.sansAlcool ?? h.sans_alcool) && <span>· {isEN ? 'Alcohol-free' : 'Sans alcool'}</span>}
              {(h.halalFriendly ?? h.halal_certifie) && <span>· {isEN ? 'Halal-friendly · verify on site' : 'Halal-friendly · à vérifier'}</span>}
            </div>
            {h.adresse && <div style={{ fontSize: 13, opacity: 0.6, marginTop: 2 }}>📍 {h.adresse}</div>}
          </li>
        ))}
      </ul>

      <p style={{ fontSize: 12, opacity: 0.6, marginTop: 20 }}>
        {isEN
          ? 'Information shared to help Muslim travelers — always confirm halal options and alcohol policy with the hotel. We never certify.'
          : 'Informations fournies pour aider les voyageurs musulmans — confirmez toujours les options halal et la politique alcool auprès de l\'hôtel. Nous ne certifions jamais.'}
      </p>

      <div style={{ marginTop: 24, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <Link href={`/destinations/${slug}`} style={{ fontWeight: 700, color: 'var(--foret)' }}>← {isEN ? `Full ${ville.nom} guide` : `Guide complet ${ville.nom}`}</Link>
        <Link href="/guides/hotel-halal-tout-savoir" style={{ fontWeight: 700, color: 'var(--foret)' }}>{isEN ? 'What is a halal hotel?' : 'Qu\'est-ce qu\'un hôtel halal ?'} →</Link>
      </div>
    </main>
  )
}
