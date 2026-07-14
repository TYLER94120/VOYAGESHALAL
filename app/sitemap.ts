import type { MetadataRoute } from 'next'
import { guides, blogPosts } from '@/lib/data'
import { getDomainSEO, FR_URL, EN_URL } from '@/lib/domain'
import { localizedHref } from '@/lib/slugs'
import cityCoords from '@/lib/cityCoords.json'
import { countries } from '@/lib/countriesData'
import { listAllSpots } from '@/lib/prayerSpots'

// Liste des 354 villes depuis un import STATIQUE (bundlé au build) plutôt que via
// readdirSync au runtime : sur Vercel le tracing de fichiers dynamiques est peu
// fiable et tronquait le sitemap. Même source que la page /destinations.
const CITY_SLUGS = (cityCoords as { slug: string }[]).map((c) => c.slug)

// Slug de destination identique sur les deux domaines → alternate hreflang direct
function cityAlternates(slug: string) {
  return { languages: { fr: `${FR_URL}/destinations/${slug}`, en: `${EN_URL}/destinations/${slug}` } }
}
// Pages « chrome » présentes sur les deux domaines (avec slug localisé côté EN)
function pageAlternates(frPath: string) {
  return { languages: { fr: `${FR_URL}${frPath}`, en: `${EN_URL}${localizedHref(frPath, true)}` } }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Chaque domaine génère son propre sitemap avec ses URLs (slugs EN sur le .com)
  const { siteUrl: SITE_URL, isEN } = await getDomainSEO()
  const L = (p: string) => `${SITE_URL}${localizedHref(p, isEN)}`
  const now = new Date()

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1, alternates: { languages: { fr: FR_URL, en: EN_URL } } },
    { url: `${SITE_URL}/destinations`, lastModified: now, changeFrequency: 'weekly', priority: 0.9, alternates: { languages: { fr: `${FR_URL}/destinations`, en: `${EN_URL}/destinations` } } },
    { url: `${SITE_URL}/guides`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: L('/application'), lastModified: now, changeFrequency: 'monthly', priority: 0.7, alternates: pageAlternates('/application') },
    { url: L('/omra'), lastModified: now, changeFrequency: 'monthly', priority: 0.7, alternates: pageAlternates('/omra') },
    { url: L('/planificateur'), lastModified: now, changeFrequency: 'monthly', priority: 0.9, alternates: pageAlternates('/planificateur') },
    { url: L('/horaires-priere'), lastModified: now, changeFrequency: 'daily', priority: 0.9, alternates: pageAlternates('/horaires-priere') },
    { url: `${SITE_URL}/qibla`, lastModified: now, changeFrequency: 'monthly', priority: 0.9, alternates: pageAlternates('/qibla') },
    { url: L('/mosquee-proche'), lastModified: now, changeFrequency: 'monthly', priority: 0.9, alternates: pageAlternates('/mosquee-proche') },
    { url: `${SITE_URL}/autour-de-moi`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
    { url: L('/a-propos'), lastModified: now, changeFrequency: 'monthly', priority: 0.6, alternates: pageAlternates('/a-propos') },
    { url: `${SITE_URL}/contact`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
    { url: L('/confidentialite'), lastModified: now, changeFrequency: 'yearly', priority: 0.3, alternates: pageAlternates('/confidentialite') },
    { url: L('/mentions-legales'), lastModified: now, changeFrequency: 'yearly', priority: 0.3, alternates: pageAlternates('/mentions-legales') },
  ]

  // Les 354 fiches villes (même slug sur les deux domaines) + hreflang FR↔EN
  const villePages: MetadataRoute.Sitemap = CITY_SLUGS.map((slug) => ({
    url: `${SITE_URL}/destinations/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.8,
    alternates: cityAlternates(slug),
  }))

  // Pages pays (Voyage halal en {pays}) — manquaient au sitemap
  const paysPages: MetadataRoute.Sitemap = countries.map((c) => ({
    url: `${SITE_URL}/destinations/pays/${c.slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.7,
    alternates: { languages: { fr: `${FR_URL}/destinations/pays/${c.slug}`, en: `${EN_URL}/destinations/pays/${c.slug}` } },
  }))

  // Pages « Hôtels halal à {ville} » — cible « hotel halal {ville} » (requêtes GSC)
  const hotelPages: MetadataRoute.Sitemap = CITY_SLUGS.map((slug) => ({
    url: `${SITE_URL}/hotels/${slug}`,
    lastModified: now,
    changeFrequency: 'weekly',
    priority: 0.6,
    alternates: { languages: { fr: `${FR_URL}/hotels/${slug}`, en: `${EN_URL}/hotels/${slug}` } },
  }))

  // Guides : chaque domaine liste les guides rédigés dans SA langue
  const guidePages: MetadataRoute.Sitemap = guides
    .filter((g) => (g.lang ?? 'fr') === (isEN ? 'en' : 'fr'))
    .map((g) => ({
        url: `${SITE_URL}/guides/${g.slug}`,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
        lastModified: new Date(g.publishedAt),
      }))

  // Blog : chaque domaine ne liste que les articles rédigés dans sa langue
  const blogPages: MetadataRoute.Sitemap = blogPosts
    .filter((p) => (p.lang ?? 'fr') === (isEN ? 'en' : 'fr'))
    .map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      lastModified: new Date(p.publishedAt),
    }))

  // Coins prière (spots seed) : page index par ville + page détail par spot.
  // Source Redis (une seule source app+web) → indexable, cible « où prier à … ».
  let spotPages: MetadataRoute.Sitemap = []
  try {
    const spots = await listAllSpots()
    const villes = new Set(spots.map((s) => s.villeSlug))
    const indexPages = [...villes].map((v) => ({
      url: `${SITE_URL}/priere/${v}`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.6,
    }))
    const detailPages = spots.map((s) => ({
      url: `${SITE_URL}/priere/${s.villeSlug}/${s.slug}`,
      lastModified: new Date(s.createdAt), changeFrequency: 'monthly' as const, priority: 0.5,
    }))
    spotPages = [...indexPages, ...detailPages]
  } catch { /* Redis indisponible → pas de pages spots dans le sitemap */ }

  return [...staticPages, ...villePages, ...paysPages, ...hotelPages, ...guidePages, ...blogPages, ...spotPages]
}
