import type { Ville } from '@/lib/villeTypes'

function descText(ville: Ville): string {
  if (typeof ville.description === 'string') return ville.description
  return ville.description?.long ?? ville.description?.court ?? ''
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
