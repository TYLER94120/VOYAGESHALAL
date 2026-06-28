import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.voyageshalal.fr'
const SITE_NAME = 'Voyages Halal'
const DEFAULT_DESCRIPTION =
  'Découvrez les meilleures destinations de voyage halal dans le monde. Guides, restaurants halal, mosquées et conseils pratiques pour voyager en conformité avec vos valeurs.'

export function buildMetadata({
  title,
  description = DEFAULT_DESCRIPTION,
  path = '',
  image,
  type = 'website',
}: {
  title: string
  description?: string
  path?: string
  image?: string
  type?: 'website' | 'article'
}): Metadata {
  const url = `${SITE_URL}${path}`
  const ogImage = image || `${SITE_URL}/images/og-default.jpg`

  return {
    // Titre « nu » : le template du layout ajoute « | VoyagesHalal.fr » (évite la répétition)
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: url },
    openGraph: {
      title,
      description,
      url,
      siteName: SITE_NAME,
      images: [{ url: ogImage, width: 1200, height: 630, alt: title }],
      type,
      locale: 'fr_FR',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [ogImage],
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
  }
}

export function buildDestinationSchema(destination: {
  city: string
  country: string
  description: string
  coverImage: string
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: `${destination.city}, ${destination.country}`,
    description: destination.description,
    image: destination.coverImage,
    url: `${SITE_URL}/destinations/${destination.city.toLowerCase()}`,
    touristType: 'Voyageurs musulmans',
  }
}

export function buildArticleSchema(article: {
  title: string
  description: string
  publishedAt: string
  coverImage: string
  slug: string
  type: 'guide' | 'blog'
}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.coverImage,
    datePublished: article.publishedAt,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
    },
    url: `${SITE_URL}/${article.type}s/${article.slug}`,
  }
}

export function buildBreadcrumbSchema(
  items: { name: string; url: string }[]
) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.name,
      item: `${SITE_URL}${item.url}`,
    })),
  }
}

export function buildWebSiteSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    description: DEFAULT_DESCRIPTION,
    inLanguage: 'fr-FR',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${SITE_URL}/search?q={search_term_string}` },
      'query-input': 'required name=search_term_string',
    },
  }
}

export function buildFAQSchema(faqs: { question: string; answer: string }[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: faqs.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: { '@type': 'Answer', text: faq.answer },
    })),
  }
}

export { SITE_NAME, SITE_URL, DEFAULT_DESCRIPTION }
