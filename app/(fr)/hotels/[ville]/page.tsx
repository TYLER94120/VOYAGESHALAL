import type { Metadata } from 'next'
import HotelsRoute, { paramsHotels, metadataHotels } from '@/components/hotels/HotelsRoute'

// 🇫🇷 « Hôtels halal à {Ville} » — voyageshalal.fr.
//
// Chantier cache, étape 3 : la langue vient de la ROUTE, plus de l'en-tête
// « Host ». Cette page ne lit donc rien de la requête et se fabrique à la
// construction. Son jumeau anglais vit dans app/en/hotels/[ville].
// Tout le rendu et les métadonnées sont dans components/hotels/HotelsRoute.

export const dynamicParams = false

export function generateStaticParams() {
  return paramsHotels()
}

export async function generateMetadata({ params }: { params: Promise<{ ville: string }> }): Promise<Metadata> {
  const { ville } = await params
  return metadataHotels({ ville, en: false })
}

export default async function Page({ params }: { params: Promise<{ ville: string }> }) {
  const { ville } = await params
  return <HotelsRoute ville={ville} en={false} />
}
