import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  images: {
    // Quota d'optimisation Vercel (plan Hobby) épuisé → l'optimiseur répond
    // 402 et casse TOUTES les nouvelles images. On sert les sources telles
    // quelles (déjà dimensionnées : bakes 900px, Unsplash avec w=).
    unoptimized: true,
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
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
