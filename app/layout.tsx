import type { Metadata, Viewport } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
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
import { RamadanBanner } from '@/components/RamadanBanner'
import { SITE_NAME, DEFAULT_DESCRIPTION, SITE_URL } from '@/lib/seo'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'VoyagesHalal.fr — Guide Voyage Halal #1 | Restaurants, Mosquées & Destinations',
    template: '%s | VoyagesHalal.fr',
  },
  description: DEFAULT_DESCRIPTION,
  keywords: ['voyage halal', 'tourisme halal', 'destinations halal', 'restaurant halal', 'hébergement halal', 'guide voyage musulman'],
  authors: [{ name: SITE_NAME }],
  creator: SITE_NAME,
  openGraph: {
    type: 'website',
    locale: 'fr_FR',
    url: SITE_URL,
    siteName: SITE_NAME,
    images: [{ url: 'https://images.unsplash.com/photo-1564769625905-50e93615e769?w=1200&h=630&fit=crop&q=80', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image' },
  robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'VoyagesHalal' },
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="fr">
      <body className={`${dmSans.variable} ${playfair.variable} font-sans`}>
        <LanguageProvider>
          <LocationProvider>
           <AdhanProvider>
            <GoogleTranslate />
            <RamadanBanner />
            <Header />
            {children}
            <Footer />
            <BottomNav />
            <ToastProvider />
            <RegisterSW />
            <InstallPrompt />
           </AdhanProvider>
          </LocationProvider>
        </LanguageProvider>
      </body>
    </html>
  )
}
