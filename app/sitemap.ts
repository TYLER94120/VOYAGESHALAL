import type { MetadataRoute } from 'next'
import { destinations, guides, blogPosts } from '@/lib/data'
import { SITE_URL } from '@/lib/seo'

export default function sitemap(): MetadataRoute.Sitemap {
  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/destinations`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${SITE_URL}/guides`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/blog`, changeFrequency: 'daily', priority: 0.8 },
    { url: `${SITE_URL}/application`, changeFrequency: 'monthly', priority: 0.7 },
  ]

  const destinationPages: MetadataRoute.Sitemap = destinations.map((d) => ({
    url: `${SITE_URL}/destinations/${d.slug}`,
    changeFrequency: 'monthly',
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

  return [...staticPages, ...destinationPages, ...guidePages, ...blogPages]
}
