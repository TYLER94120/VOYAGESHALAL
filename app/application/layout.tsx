import type { Metadata } from 'next'
import { getDomainSEO } from '@/lib/domain'

// /application est un composant client (formulaire interactif) et ne peut pas
// exporter ses métadonnées : ce layout serveur s'en charge, avec canonical +
// og:url corrects pointant vers /application (et non l'accueil).
export async function generateMetadata(): Promise<Metadata> {
  const { isEN, brand, siteUrl } = await getDomainSEO()
  const url = `${siteUrl}${isEN ? '/app' : '/application'}`
  const title = isEN
    ? `The ${brand} App — Halal Restaurants, Mosques & Prayer Times`
    : `L'application ${brand} — Restaurants halal, mosquées & horaires de prière`
  const description = isEN
    ? 'Download the free app: Qibla compass, prayer times, nearby halal restaurants and mosques, offline travel notebook — for Muslim travelers worldwide.'
    : "Téléchargez l'application gratuite : boussole Qibla, horaires de prière, restaurants halal et mosquées à proximité, carnet de voyage hors-ligne — pour les voyageurs musulmans."
  return {
    title,
    description,
    alternates: {
      canonical: url,
      languages: {
        fr: 'https://www.voyageshalal.fr/application',
        en: 'https://www.gohalaltravel.com/app',
        'x-default': 'https://www.gohalaltravel.com/app',
      },
    },
    openGraph: {
      title,
      description,
      url,
      siteName: brand,
      type: 'website',
      locale: isEN ? 'en_US' : 'fr_FR',
    },
  }
}

export default function ApplicationLayout({ children }: { children: React.ReactNode }) {
  return children
}
