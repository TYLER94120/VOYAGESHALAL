import type { Metadata } from 'next'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://www.voyageshalal.fr'
const SITE_NAME = 'VoyagesHalal.fr'
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
  const ogImage = image || 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&h=630&fit=crop&q=80'

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
  updatedAt?: string
  coverImage: string
  slug: string
  type: 'guide' | 'blog'
}) {
  const url = `${SITE_URL}/${article.type}s/${article.slug}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.description,
    image: article.coverImage,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    // Auteur éditorial = la rédaction (Organization), pas une personne inventée.
    author: { '@type': 'Organization', name: `Rédaction ${SITE_NAME}`, url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/icon-512` },
    },
    mainEntityOfPage: { '@type': 'WebPage', '@id': url },
    url,
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
const EN_DESCRIPTION = 'Halal restaurants, mosques, prayer times and practical guides in 354+ destinations worldwide — for Muslim travelers.'

// Profils sociaux officiels → `sameAs` (aide Google à relier la marque à ses
// réseaux). VIDE tant que les comptes n'existent pas : ne jamais déclarer un
// profil inexistant (404 = perte de confiance). Dès que les comptes @voyageshalal
// sont créés, décommenter les lignes correspondantes.
export const SOCIAL_LINKS: string[] = [
  // 'https://www.instagram.com/voyageshalal',
  // 'https://www.tiktok.com/@voyageshalal',
  // 'https://www.youtube.com/@voyageshalal',
  // 'https://www.facebook.com/voyageshalal',
  // 'https://www.pinterest.com/voyageshalal',
]

export function buildOrganizationSchema(opts: SchemaOpts = {}) {
  const url = opts.siteUrl ?? SITE_URL
  const twin = opts.en ? 'https://www.voyageshalal.fr' : 'https://www.gohalaltravel.com'
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: opts.name ?? 'VoyagesHalal.fr',
    url,
    description: opts.en ? EN_DESCRIPTION : DEFAULT_DESCRIPTION,
    logo: `${url}/icon-512`,
    image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&h=630&fit=crop&q=80',
    areaServed: 'Worldwide',
    // Domaine jumeau (FR↔EN) + réseaux sociaux officiels dès qu'ils existent.
    sameAs: [twin, ...SOCIAL_LINKS],
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
    // Lien croisé entre les deux domaines (FR ↔ EN) pour Google
    sameAs: [opts.en ? 'https://www.voyageshalal.fr' : 'https://www.gohalaltravel.com'],
    potentialAction: {
      '@type': 'SearchAction',
      target: { '@type': 'EntryPoint', urlTemplate: `${url}/destinations?q={search_term_string}` },
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
