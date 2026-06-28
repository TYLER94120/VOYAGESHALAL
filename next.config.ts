import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/villes/:slug',
        destination: '/destinations/:slug',
        permanent: true,
      },
      {
        source: '/villes',
        destination: '/destinations',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
