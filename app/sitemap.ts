import type { MetadataRoute } from 'next'
import { readdirSync } from 'fs'
import path from 'path'
import { guides, blogPosts } from '@/lib/data'
import { getDomainSEO } from '@/lib/domain'

function getVilleSlugs(): string[] {
  try {
    return readdirSync(path.join(process.cwd(), 'data', 'villes'))
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace('.json', ''))
  } catch {
    return []
  }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Chaque domaine génère son propre sitemap avec ses URLs
  const { siteUrl: SITE_URL } = await getDomainSEO()
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/destinations`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/guides`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/blog`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/application`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/omra`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${SITE_URL}/horaires-priere`, changeFrequency: 'daily', priority: 0.9 },
    { url: `${SITE_URL}/qibla`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/mosquee-proche`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${SITE_URL}/contact`, changeFrequency: 'yearly', priority: 0.4 },
  ]

  // All city pages now live under /destinations/[slug], sourced from data/villes
  const villePages: MetadataRoute.Sitemap = getVilleSlugs().map((slug) => ({
    url: `${SITE_URL}/destinations/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  const guidePages: MetadataRoute.Sitemap = guides.map((g) => ({
    url: `${SITE_URL}/guides/${g.slug}`,
    changeFrequency: 'monthly',
    priority: 0.7,
    lastModified: new Date(g.publishedAt),
  }))

  const blogPages: MetadataRoute.Sitemap = blogPosts.map((p) => ({
    url: `${SITE_URL}/blog/${p.slug}`,
    changeFrequency: 'monthly',
    priority: 0.6,
    lastModified: new Date(p.publishedAt),
  }))

  return [...staticPages, ...villePages, ...guidePages, ...blogPages]
}
