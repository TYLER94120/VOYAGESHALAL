import type { Ville } from '@/lib/villeTypes'

function descText(ville: Ville): string {
  if (typeof ville.description === 'string') return ville.description
  return ville.description?.long ?? ville.description?.court ?? ''
}

const SITE = 'https://www.voyageshalal.fr'

// TouristDestination + BreadcrumbList (SEO villes)
export function DestinationSchema({ ville, slug }: { ville: Ville; slug: string }) {
  const url = `${SITE}/destinations/${slug}`
  const coord = ville.coordonnees ?? { lat: 0, lng: 0 }
  const tourist = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: `${ville.nom} Halal`,
    description: descText(ville).slice(0, 300) || `Guide voyage halal pour ${ville.nom}.`,
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
    touristType: 'Voyageur musulman',
  }
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE },
      { '@type': 'ListItem', position: 2, name: 'Destinations', item: `${SITE}/destinations` },
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

export function DestinationFaqSchema({ ville }: { ville: Ville }) {
  const country = ville.codeISO ?? ''

  const restaurantSchemas = (ville.restaurants ?? []).map((r) => ({
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: r.nom,
    servesCuisine: r.cuisine,
    priceRange: r.fourchette_prix ?? r.prix_moyen ?? '€€',
    address: {
      '@type': 'PostalAddress',
      streetAddress: r.adresse,
      addressLocality: ville.nom,
      addressCountry: country,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: r.note,
      bestRating: '5',
      ratingCount: r.halalScore?.avisMusulmans ?? r.avis_count ?? 50,
    },
    ...(r.horaires ? { openingHours: r.horaires } : {}),
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: 'Halal Trust Score',
        value: r.halalScore?.global ?? 0,
      },
      {
        '@type': 'PropertyValue',
        name: 'Certification Halal',
        value: r.halalScore?.certifie ? 'Certifié' : 'Non certifié',
      },
    ],
  }))

  const mosqueeCount = ville.statistiques?.mosquees
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: `La nourriture est-elle halal à ${ville.nom} ?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${ville.nom} est une destination avec un score halal de ${ville.score_halal}/5. ${descText(ville).slice(0, 200)}`,
        },
      },
      {
        '@type': 'Question',
        name: `Où trouver une mosquée à ${ville.nom} ?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `${ville.nom} compte ${mosqueeCount ? mosqueeCount.toLocaleString('fr-FR') : 'plusieurs'} mosquées. Notre guide liste les principales avec leurs adresses et horaires.`,
        },
      },
      {
        '@type': 'Question',
        name: `Quelles sont les heures de prière à ${ville.nom} ?`,
        acceptedAnswer: {
          '@type': 'Answer',
          text: `Les horaires de prière à ${ville.nom} varient selon la saison. Consultez notre widget d'horaires en temps réel sur cette page pour Fajr, Dhuhr, Asr, Maghrib et Isha.`,
        },
      },
    ],
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
