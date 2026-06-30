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
  canonical,
  languages,
}: {
  title: string
  description?: string
  path?: string
  image?: string
  type?: 'website' | 'article'
  canonical?: string
  languages?: Record<string, string>
}): Metadata {
  const url = canonical || `${SITE_URL}${path}`
  // Image OG par défaut : une vraie image (le fichier local n'existe pas) → aperçus de partage corrects
  const ogImage = image || 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200&h=630&fit=crop&q=80'

  return {
    // Titre « nu » : le template du layout ajoute « | VoyagesHalal.fr » (évite la répétition)
    title,
    description,
    metadataBase: new URL(SITE_URL),
    alternates: { canonical: url, ...(languages ? { languages } : {}) },
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

interface SchemaOpts { en?: boolean; siteUrl?: string; name?: string }
const EN_DESCRIPTION = 'Certified halal restaurants, mosques, prayer times and practical guides in 157+ destinations worldwide — for Muslim travelers.'

export function buildOrganizationSchema(opts: SchemaOpts = {}) {
  const url = opts.siteUrl ?? SITE_URL
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: opts.name ?? 'VoyagesHalal.fr',
    url,
    description: opts.en ? EN_DESCRIPTION : DEFAULT_DESCRIPTION,
    logo: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=512&h=512&fit=crop&q=80',
    image: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200&h=630&fit=crop&q=80',
    areaServed: 'Worldwide',
    knowsAbout: opts.en
      ? ['halal travel', 'halal restaurants', 'mosques', 'prayer times', 'Qibla', 'Muslim tourism']
      : ['voyage halal', 'restaurants halal', 'mosquées', 'horaires de prière', 'Qibla', 'tourisme musulman'],
  }
}

export function buildWebSiteSchema(opts: SchemaOpts = {}) {
  const url = opts.siteUrl ?? SITE_URL
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: opts.name ?? SITE_NAME,
    url,
    description: opts.en ? EN_DESCRIPTION : DEFAULT_DESCRIPTION,
    inLanguage: opts.en ? 'en' : 'fr-FR',
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${url}/search?q={search_term_string}` },
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

export { SITE_NAME, SITE_URL, DEFAULT_DESCRIPTION, EN_DESCRIPTION }
