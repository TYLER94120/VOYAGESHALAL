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
    // Raccourcis natifs (appui long sur l'icône) — le cœur Spots en 1 tap
    shortcuts: [
      { name: 'Ajouter un spot', short_name: 'Ajouter', url: '/communaute/ajouter', icons: [{ src: '/icon-192', sizes: '192x192' }] },
      { name: 'Découvrir les spots', short_name: 'Spots', url: '/spots', icons: [{ src: '/icon-192', sizes: '192x192' }] },
      { name: 'Mes spots', short_name: 'Mes spots', url: '/carnet', icons: [{ src: '/icon-192', sizes: '192x192' }] },
      { name: 'Horaires de prière', short_name: 'Prière', url: '/horaires-priere', icons: [{ src: '/icon-192', sizes: '192x192' }] },
    ],
  }
}
