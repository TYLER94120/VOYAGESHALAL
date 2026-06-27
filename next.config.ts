import type { NextConfig } from 'next'
import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'

function getVillesWithRichPage(): string[] {
  try {
    const dir = join(process.cwd(), 'data', 'villes')
    return readdirSync(dir)
      .filter((f) => f.endsWith('.json'))
      .filter((f) => {
        try {
          const v = JSON.parse(readFileSync(join(dir, f), 'utf-8'))
          return Boolean(v.image_hero)
        } catch {
          return false
        }
      })
      .map((f) => f.replace('.json', ''))
  } catch {
    return []
  }
}

const richSlugs = getVillesWithRichPage()

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async redirects() {
    return richSlugs.map((slug) => ({
      source: `/destinations/${slug}`,
      destination: `/villes/${slug}`,
      permanent: true,
    }))
  },
}

export default nextConfig
