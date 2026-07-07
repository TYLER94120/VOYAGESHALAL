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
    title: isEN
      ? {
          default: 'GoHalalTravel — #1 Halal Travel Guide | Restaurants, Mosques & Destinations',
          template: '%s | GoHalalTravel',
        }
      : {
          default: 'VoyagesHalal.fr — Guide Voyage Halal #1 | Restaurants, Mosquées & Destinations',
          template: '%s | VoyagesHalal.fr',
        },
    description: isEN ? EN_DEFAULT_DESCRIPTION : DEFAULT_DESCRIPTION,
    authors: [{ name: brand }],
    creator: brand,
    openGraph: {
      type: 'website',
      locale: isEN ? 'en_US' : 'fr_FR',
      siteName: brand,
      images: [{ url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200&h=630&fit=crop&q=80', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image' },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
    // Lien croisé SEO entre les deux domaines (FR ↔ EN)
    alternates: {
      languages: {
        fr: 'https://www.voyageshalal.fr',
        en: 'https://www.gohalaltravel.com',
        'x-default': 'https://www.gohalaltravel.com',
      },
    },
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
