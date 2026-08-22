import type { Metadata } from 'next'
import DestinationRoute, { paramsVilles, metadataDestination } from '@/components/villes/DestinationRoute'

// 🇬🇧 LA FICHE DE VILLE ANGLAISE — gohalaltravel.com.
//
// ⚠️ CHEMIN INTERNE. Cette adresse ne s'affiche JAMAIS : le middleware
// réécrit gohalaltravel.com/destinations/istanbul vers ici, la barre
// d'adresse et le lien canonique gardent l'URL publique. Quiconque tape
// /en/... à la main est renvoyé en 301 vers l'URL propre — pas de contenu
// en double dans Google.
//
// Elle existe pour une seule raison : la langue doit venir de la ROUTE et
// non de l'en-tête « Host », sinon la page est recalculee a chaque visite
// et le cache est interdit. Voir components/villes/DestinationRoute.
// Tout le rendu et les métadonnées sont dans components/villes/DestinationRoute.

export const dynamicParams = false

export function generateStaticParams() {
  return paramsVilles()
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params
  return metadataDestination({ city, en: true })
}

export default async function Page({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params
  return <DestinationRoute city={city} en={true} />
}
