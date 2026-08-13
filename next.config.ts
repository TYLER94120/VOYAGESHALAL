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
      // 🔀 GUIDES FUSIONNÉS. Istanbul, Dubaï et Marrakech avaient chacune
      // DEUX guides qui se disputaient les mêmes requêtes — dont les 79 et
      // 53 impressions d'Istanbul et Dubaï. Deux pages moyennes valent
      // moins qu'une bonne : le doublon le plus pauvre est supprimé et
      // renvoyé en 301 vers celui qui reste, pour ne pas perdre les liens
      // déjà indexés.
      // ⚠️ `has: host` est indispensable : sans lui, cette redirection
      // s'applique AVANT le middleware et donc aussi sur gohalaltravel.com,
      // où elle envoyait l'anglophone sur la page française. Mesuré, pas
      // supposé. Sur le domaine anglais, c'est GUIDES_FR_TO_EN qui décide.
      {
        source: '/guides/voyage-halal-istanbul-guide-2026',
        has: [{ type: 'host', value: '(www\\.)?voyageshalal\\.fr' }],
        destination: '/guides/istanbul-guide-halal-complet',
        permanent: true,
      },
    ]
  },
}

export default nextConfig
