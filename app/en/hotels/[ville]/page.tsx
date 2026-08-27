import type { Metadata } from 'next'
import HotelsRoute, { paramsHotels, metadataHotels } from '@/components/hotels/HotelsRoute'

// 🇬🇧 « Halal hotels in {City} » — gohalaltravel.com.
//
// ⚠️ CHEMIN INTERNE. Cette adresse ne s'affiche JAMAIS : le middleware
// réécrit gohalaltravel.com/hotels/marrakech vers ici, la barre d'adresse
// et le lien canonique gardent l'URL publique, et /en/... tapé à la main
// est renvoyé en 301. Elle existe pour que la langue vienne de la ROUTE :
// sinon la page est recalculée à chaque visite et le cache est interdit.
// Tout le rendu et les métadonnées sont dans components/hotels/HotelsRoute.

export const dynamicParams = false

export function generateStaticParams() {
  return paramsHotels()
}

export async function generateMetadata({ params }: { params: Promise<{ ville: string }> }): Promise<Metadata> {
  const { ville } = await params
  return metadataHotels({ ville, en: true })
}

export default async function Page({ params }: { params: Promise<{ ville: string }> }) {
  const { ville } = await params
  return <HotelsRoute ville={ville} en={true} />
}
