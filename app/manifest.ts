import type { MetadataRoute } from 'next'
import { getDomainSEO } from '@/lib/domain'
import { localizedHref } from '@/lib/slugs'

// 📱 MANIFESTE PWA — « Ajouter à l'écran d'accueil ».
//
// ⚠️ CE FICHIER SERT LES DEUX DOMAINES, ET IL L'OUBLIAIT.
//
// Trouvé en mesurant : le manifeste était le SEUL élément du site rendu en
// statique, donc identique pour tout le monde. Quelqu'un qui installait
// l'application depuis gohalaltravel.com se retrouvait avec une icône nommée
// « VoyagesHalal.fr — Guide Voyage Halal », une description en français,
// `lang: fr`, et des raccourcis pointant vers /horaires-priere au lieu de
// /prayer-times. Sur l'écran d'accueil de son téléphone, tous les jours.
//
// C'est exactement le défaut que décrit la compétence servir-deux-domaines,
// et il était passé sous le radar parce qu'on ne regarde jamais le manifeste :
// il ne s'affiche nulle part, il ne se voit qu'au moment de l'installation.
//
// La règle du site s'y applique comme partout : on lit l'en-tête Host, on sert
// la langue du domaine. `getDomainSEO()` appelle `headers()`, ce qui rend
// automatiquement cette route dynamique — plus de version figée partagée.

export const dynamic = 'force-dynamic'

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const { isEN } = await getDomainSEO()

  return {
    name: isEN ? 'GoHalalTravel — Halal Travel Guide' : 'VoyagesHalal.fr — Guide Voyage Halal',
    short_name: isEN ? 'GoHalalTravel' : 'VoyagesHalal',
    description: isEN
      ? 'Halal restaurants, nearby mosques, prayer times and Qibla in 354+ destinations. The Muslim travel guide.'
      : 'Restaurants halal, mosquées proches, horaires de prière et Qibla dans 354+ destinations. Le guide voyage musulman.',
    start_url: '/',
    scope: '/',
    display: 'standalone',
    orientation: 'portrait',
    background_color: '#0b1a0f',
    theme_color: '#0b1a0f',
    lang: isEN ? 'en' : 'fr',
    dir: 'ltr',
    categories: ['travel', 'lifestyle', 'navigation'],
    icons: [
      { src: '/icon-192', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/icon-512', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: '/icon-512', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
    // Raccourcis natifs (appui long sur l'icône). Les adresses passent par
    // `localizedHref` : sur le domaine anglais, /carnet devient /notebook et
    // /horaires-priere devient /prayer-times. Un raccourci qui tombe sur une
    // redirection ou une page française n'a rien à faire sur un écran
    // d'accueil anglophone.
    shortcuts: [
      {
        name: isEN ? 'Add a spot' : 'Ajouter un spot',
        short_name: isEN ? 'Add' : 'Ajouter',
        url: '/communaute/ajouter',
        icons: [{ src: '/icon-192', sizes: '192x192' }],
      },
      {
        name: isEN ? 'Discover spots' : 'Découvrir les spots',
        short_name: 'Spots',
        url: '/trouvailles',
        icons: [{ src: '/icon-192', sizes: '192x192' }],
      },
      {
        name: isEN ? 'My spots' : 'Mes spots',
        short_name: isEN ? 'My spots' : 'Mes spots',
        url: localizedHref('/carnet', isEN),
        icons: [{ src: '/icon-192', sizes: '192x192' }],
      },
      {
        name: isEN ? 'Prayer times' : 'Horaires de prière',
        short_name: isEN ? 'Prayer' : 'Prière',
        url: localizedHref('/horaires-priere', isEN),
        icons: [{ src: '/icon-192', sizes: '192x192' }],
      },
    ],
  }
}
