import type { MetadataRoute } from 'next'
import { getDomainSEO } from '@/lib/domain'

// robots.txt par domaine : chaque domaine pointe vers SON propre sitemap.
export default async function robots(): Promise<MetadataRoute.Robots> {
  const { siteUrl } = await getDomainSEO()
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // Page utilitaire non indexable (recherche interne)
      disallow: ['/search'],
    },
    sitemap: `${siteUrl}/sitemap.xml`,
  }
}
