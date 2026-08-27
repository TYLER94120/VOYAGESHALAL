import type { Metadata } from 'next'
import DestinationRoute, { paramsVilles, metadataDestination } from '@/components/villes/DestinationRoute'

// 🇫🇷 LA FICHE DE VILLE FRANÇAISE — voyageshalal.fr.
//
// Chantier cache du 22 août : la langue vient de la ROUTE, plus de
// l'en-tête « Host ». Cette page ne lit donc plus rien de la requête et
// se fabrique À LA CONSTRUCTION. Son jumeau anglais vit dans
// app/en/destinations/[city] ; le middleware y réécrit les visiteurs de
// gohalaltravel.com sans changer l'URL publique.
// Tout le rendu et les métadonnées sont dans components/villes/DestinationRoute.

export const dynamicParams = false

export function generateStaticParams() {
  return paramsVilles()
}

export async function generateMetadata({ params }: { params: Promise<{ city: string }> }): Promise<Metadata> {
  const { city } = await params
  return metadataDestination({ city, en: false })
}

export default async function Page({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params
  return <DestinationRoute city={city} en={false} />
}
