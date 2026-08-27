import type { Metadata, Viewport } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import Coque from '@/components/layout/Coque'
import { EN_DESCRIPTION } from '@/lib/seo'
import { EN_URL } from '@/lib/domain'
import '../globals.css'
import '../../styles/animations.css'

// 🇬🇧 LE LAYOUT RACINE ANGLAIS — il ne lit RIEN de la requête.
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
// ⚠️ /en/... est un chemin INTERNE. L'URL publique reste
// gohalaltravel.com/destinations/istanbul : le middleware réécrit, et
// renvoie en 301 quiconque tape /en/... à la main. Pas de doublon dans
// Google. Son jumeau français est app/(fr)/layout.tsx.

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  metadataBase: new URL(EN_URL),
  title: { default: 'Halal Travel Guide 2026 — Restaurants, Mosques, Prayer', template: '%s' },
  description: EN_DESCRIPTION,
  authors: [{ name: 'GoHalalTravel.com' }],
  creator: 'GoHalalTravel.com',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    siteName: 'GoHalalTravel.com',
    images: [{ url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&h=630&fit=crop&q=80', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  // Pas de hreflang global : les deux sites ont divergé, chaque page qui a
  // un vrai jumeau le déclare elle-même (lib/hreflang.ts).
  alternates: {},
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'GoHalalTravel.com' },
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

export default function LayoutEn({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className={`${dmSans.variable} ${playfair.variable} font-sans`}>
        <Coque en={true}>{children}</Coque>
      </body>
    </html>
  )
}
