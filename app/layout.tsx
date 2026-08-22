import type { Metadata, Viewport } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import { Analytics } from '@vercel/analytics/react'
import RegisterSW from '@/components/pwa/RegisterSW'
import InstallPrompt from '@/components/pwa/InstallPrompt'
import './globals.css'
import '../styles/animations.css'
import { ToastProvider } from '@/components/Toast'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import BottomNav from '@/components/layout/BottomNav'
import HalalGPTFab from '@/components/halalgpt/HalalGPTFab'
import { LanguageProvider } from '@/components/i18n/LanguageProvider'
import GoogleTranslate from '@/components/i18n/GoogleTranslate'
import { LocationProvider } from '@/components/location/LocationProvider'
import { AdhanProvider } from '@/components/adhan/AdhanProvider'
import PrayerCountdownBar from '@/components/prayer/PrayerCountdownBar'
import { RamadanBanner } from '@/components/RamadanBanner'
import { DEFAULT_DESCRIPTION, EN_DESCRIPTION as EN_DEFAULT_DESCRIPTION } from '@/lib/seo'
import { getDomainSEO } from '@/lib/domain'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export async function generateMetadata(): Promise<Metadata> {
  const { isEN, brand, siteUrl } = await getDomainSEO()
  return {
    metadataBase: new URL(siteUrl),
    // Google coupe un titre vers 60 caracteres. Les deux titres par defaut
    // faisaient 81 et 84 : la fin utile etait tronquee. Le suffixe de marque
    // du template coutait 15 a 19 caracteres sur CHAQUE page — il disparait,
    // les pages qui veulent la marque la mettent elles-memes.
    title: isEN
      ? {
          default: 'Halal Travel Guide 2026 — Restaurants, Mosques, Prayer',
          template: '%s',
        }
      : {
          default: 'Guide Voyage Halal 2026 — Restaurants, Mosquées, Prière',
          template: '%s',
        },
    description: isEN ? EN_DEFAULT_DESCRIPTION : DEFAULT_DESCRIPTION,
    authors: [{ name: brand }],
    creator: brand,
    openGraph: {
      type: 'website',
      locale: isEN ? 'en_US' : 'fr_FR',
      siteName: brand,
      images: [{ url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&h=630&fit=crop&q=80', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image' },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
    // ⚠️ 20 août : ce hreflang par défaut annonçait les DEUX ACCUEILS comme
    // traductions l'un de l'autre sur toute page qui ne le remplaçait pas.
    // Les deux sites ont divergé — l'accueil anglais est un feed. On ne
    // déclare plus rien globalement ; chaque page qui a un vrai jumeau le
    // déclare elle-même (lib/hreflang.ts).
    alternates: {},
    appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: isEN ? 'GoHalalTravel.com' : 'VoyagesHalal.fr' },
    ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION && {
      verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION },
    }),
  }
}

export const viewport: Viewport = {
  themeColor: '#0b1a0f',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

// Site bi-domaine : la langue (et la marque) dépend de l'hôte de la requête.
// On force le rendu dynamique sur TOUTES les routes pour qu'aucune page (dont « / »)
// ne soit servie depuis un cache edge/build figé sur la mauvaise langue.
//
// 🗄 CHANTIER CACHE DU 22 AOÛT — CETTE LIGNE COÛTE LE SITE.
//
// La raison qui l'a fait écrire reste vraie : servir une page française à
// un anglophone serait pire qu'une facture. Mais elle s'applique au site
// ENTIER, et Next.js écrit alors « no-store » sur chaque page. Mesuré le
// 22 août : aucune page du site n'a le droit d'être mise en cache, la
// plus lourde pèse 544 Ko, et le compte Vercel s'est mis en pause à
// 10,77 Go d'« Origin Transfer » sur 10 Go inclus — les trois sites sont
// tombés ensemble.
//
// LA SORTIE, par étapes (voir scripts/test-cache.mjs) :
//   ÉTAPE 1 — FAITE : la fiche de ville (354 × 2 langues, la plus grande
//     surface d'indexation) tire sa langue de la ROUTE et non de
//     l'en-tête. app/destinations/[city] est française, app/en/... est
//     anglaise, le middleware réécrit sans changer l'URL publique.
//   ÉTAPE 2 — À FAIRE : le layout lui-même. Tant qu'il lit l'en-tête
//     Host, TOUTES les routes restent dynamiques, y compris celles de
//     l'étape 1. Il faut deux layouts racine — un français, un anglais
//     sous /en — pour que la langue soit portée par l'adresse de bout en
//     bout. C'est la seule façon d'être en cache SANS jamais risquer la
//     mauvaise langue : une page qui ne dépend que de son adresse ne peut
//     pas se tromper de lecteur.
//   ÉTAPE 3 — À FAIRE : les listes (/destinations 544 Ko, /guides,
//     /blog), puis le sitemap.
//
// ⚠️ NE PAS retirer cette ligne avant l'étape 2 : sans elle et sans les
// deux layouts, le site servirait la mauvaise langue. La facture est un
// problème ; la mauvaise langue en est un plus grave.
export const dynamic = 'force-dynamic'

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const { isEN } = await getDomainSEO()
  return (
    <html lang={isEN ? 'en' : 'fr'}>
      <body className={`${dmSans.variable} ${playfair.variable} font-sans`}>
        <LanguageProvider initialLang={isEN ? 'en' : 'fr'}>
          <LocationProvider>
           <AdhanProvider>
            <PrayerCountdownBar />
            <GoogleTranslate />
            <RamadanBanner />
            <Header brandEN={isEN} />
            {children}
            <Footer brandEN={isEN} />
            <HalalGPTFab en={isEN} />
            <BottomNav />
            <ToastProvider />
            <RegisterSW />
            <InstallPrompt />
           </AdhanProvider>
          </LocationProvider>
        </LanguageProvider>
        <Analytics />
      </body>
    </html>
  )
}
