import type { Ville } from '@/lib/villeTypes'
import { buildVilleFaq } from '@/lib/villeFaq'

function descText(ville: Ville): string {
  if (typeof ville.description === 'string') return ville.description
  return ville.description?.long ?? ville.description?.court ?? ''
}

const FR_SITE = 'https://www.voyageshalal.fr'

// TouristDestination + BreadcrumbList (SEO villes) — bilingue selon le domaine
export function DestinationSchema({ ville, slug, en = false, siteUrl = FR_SITE }: { ville: Ville; slug: string; en?: boolean; siteUrl?: string }) {
  const url = `${siteUrl}/destinations/${slug}`
  const coord = ville.coordonnees ?? { lat: 0, lng: 0 }
  const tourist = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: `${ville.nom} Halal`,
    description: descText(ville).slice(0, 300) || (en ? `Halal travel guide for ${ville.nom}.` : `Guide voyage halal pour ${ville.nom}.`),
    url,
    image: ville.image ?? ville.image_hero,
    address: { '@type': 'PostalAddress', addressLocality: ville.nom, addressCountry: ville.codeISO ?? ville.pays },
    geo: { '@type': 'GeoCoordinates', latitude: coord.lat, longitude: coord.lng },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: ville.score_halal,
      bestRating: 5,
      ratingCount: ville.statistiques?.restaurants_halal ?? ville.restaurants?.length ?? 50,
    },
    touristType: en ? 'Muslim traveler' : 'Voyageur musulman',
  }
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: en ? 'Home' : 'Accueil', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Destinations', item: `${siteUrl}/destinations` },
      { '@type': 'ListItem', position: 3, name: ville.nom, item: url },
    ],
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(tourist) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    </>
  )
}

export function DestinationFaqSchema({ ville, en = false }: { ville: Ville; en?: boolean }) {
  const country = ville.codeISO ?? ''

  // Cap à 20 : aligné sur les restaurants rendus en SSR (pagination) — évite
  // 150 blocs JSON-LD par page (poids inutile, Google n'en exploite que peu).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const restaurantSchemas = (ville.restaurants ?? []).slice(0, 20).map((r: any) => ({
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: r.nom,
    servesCuisine: r.cuisine ?? r.type,
    ...(r.priceRange || r.fourchette_prix || r.prix_moyen ? { priceRange: r.priceRange ?? r.fourchette_prix ?? r.prix_moyen } : {}),
    address: {
      '@type': 'PostalAddress',
      ...(r.adresse ? { streetAddress: r.adresse } : {}),
      addressLocality: ville.nom,
      addressCountry: country,
    },
    // Note UNIQUEMENT si elle vient d'une source réelle (Google) avec un vrai
    // nombre d'avis — jamais de note ni de compteur inventés.
    ...(r.source === 'google' && typeof r.note === 'number' && typeof r.nombreAvis === 'number'
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: r.note, bestRating: '5', ratingCount: r.nombreAvis } }
      : {}),
    ...(r.horaires ? { openingHours: r.horaires } : {}),
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: en ? 'Halal status' : 'Statut halal',
        value: en ? 'Reported halal — verify on site' : 'Halal signalé · à vérifier',
      },
      {
        '@type': 'PropertyValue',
        name: 'Source',
        value: r.source === 'google' ? 'Google Maps' : 'OpenStreetMap',
      },
    ],
  }))

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: buildVilleFaq(ville, en).map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchemas) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  )
}
