import RegisterSW from '@/components/pwa/RegisterSW'
import InstallPrompt from '@/components/pwa/InstallPrompt'
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
import { Analytics } from '@vercel/analytics/react'

// 🧱 LA COQUE DU SITE — le contenu du <body>, écrit une seule fois.
//
// Chantier cache du 25 août : le site a maintenant TROIS layouts racine
// (app/(dyn), app/(fr), app/en). Sans ce composant, la barre de prière, la
// nav du bas et les fournisseurs seraient recopiés trois fois — et la
// quatrième modification n'en toucherait que deux.
//
// Elle ne lit RIEN de la requête : la langue lui est passée. C'est toute
// la correction du chantier — une page qui ne dépend que de son adresse
// peut être fabriquée d'avance et servie depuis le cache, sans jamais
// risquer de se tromper de lecteur.
export default function Coque({ en, children }: { en: boolean; children: React.ReactNode }) {
  return (
    <>
      <LanguageProvider initialLang={en ? 'en' : 'fr'}>
        <LocationProvider>
          <AdhanProvider>
            <PrayerCountdownBar />
            <GoogleTranslate />
            <RamadanBanner />
            <Header brandEN={en} />
            {children}
            <Footer brandEN={en} />
            <HalalGPTFab en={en} />
            <BottomNav />
            <ToastProvider />
            <RegisterSW />
            <InstallPrompt />
          </AdhanProvider>
        </LocationProvider>
      </LanguageProvider>
      <Analytics />
    </>
  )
}
