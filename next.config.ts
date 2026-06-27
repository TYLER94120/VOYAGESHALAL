import type { NextConfig } from 'next'

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
