import type { Metadata, Viewport } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import Coque from '@/components/layout/Coque'
import { DEFAULT_DESCRIPTION } from '@/lib/seo'
import { FR_URL } from '@/lib/domain'
import '../globals.css'
import '../../styles/animations.css'

// 🇫🇷 LE LAYOUT RACINE FRANÇAIS — il ne lit RIEN de la requête.
//
// CHANTIER CACHE, ÉTAPE 2 (25 août). C'est le cœur de la correction.
//
// L'ancien layout unique lisait l'en-tête « Host » pour savoir s'il parlait
// français ou anglais. Lire un en-tête rend TOUTE route dynamique : Next.js
// la recalcule à chaque visite et écrit « no-store » dessus. Mesuré : 117
// routes sur 120 dynamiques, aucune page cachable, 89 Mo retirés de notre
// serveur à chaque passage complet des robots sur les fiches de ville. Le
// compte Vercel s'est mis en pause le 23 août, et une pause Vercel répond
// en 4xx — c'est-à-dire une pression de désindexation.
//
// Ici, la langue est écrite en dur. La réponse ne dépend plus que de
// l'adresse, donc elle se fabrique à la construction et se sert depuis le
// cache. Et surtout : elle ne PEUT PAS se tromper de lecteur. Le risque
// que l'ancienne ligne « force-dynamic » protégeait — servir du français à
// un anglophone — disparaît par construction, au lieu d'être payé chaque
// jour en octets.
//
// Son jumeau anglais est app/en/layout.tsx. Les pages pas encore migrées
// restent sous app/(dyn), avec l'ancien layout.

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  metadataBase: new URL(FR_URL),
  title: { default: 'Guide Voyage Halal 2026 — Restaurants, Mosquées, Prière', template: '%s' },
  description: DEFAULT_DESCRIPTION,
  authors: [{ name: 'VoyagesHalal.fr' }],
  creator: 'VoyagesHalal.fr',
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    siteName: 'VoyagesHalal.fr',
    images: [{ url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&h=630&fit=crop&q=80', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  // Pas de hreflang global : les deux sites ont divergé, chaque page qui a
  // un vrai jumeau le déclare elle-même (lib/hreflang.ts).
  alternates: {},
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'VoyagesHalal.fr' },
  ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION && {
    verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION },
  }),
}

export const viewport: Viewport = {
  themeColor: '#0b1a0f',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

export default function LayoutFr({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={`${dmSans.variable} ${playfair.variable} font-sans`}>
        <Coque en={false}>{children}</Coque>
      </body>
    </html>
  )
}
