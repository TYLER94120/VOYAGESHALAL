import type { MetadataRoute } from 'next'

// Manifest PWA — permet « Ajouter à l'écran d'accueil » avec icône + plein écran
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'VoyagesHalal.fr — Guide Voyage Halal',
    short_name: 'VoyagesHalal',
    description:
      'Restaurants halal, mosquées proches, horaires de prière et Qibla dans 354+ destinations. Le guide voyage musulman.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0b1a0f',
    theme_color: '#0b1a0f',
    lang: 'fr',
    categories: ['travel', 'lifestyle', 'navigation'],
    icons: [
      { src: '/icon-192', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}
