import type { Ville } from '@/lib/villeTypes'
import { buildVilleFaq } from '@/lib/villeFaq'

function descText(ville: Ville): string {
  if (typeof ville.description === 'string') return ville.description
  return ville.description?.long ?? ville.description?.court ?? ''
}

const FR_SITE = 'https://www.voyageshalal.fr'

// TouristDestination + BreadcrumbList (SEO villes) — bilingue selon le domaine
export function DestinationSchema({ ville, slug, en = false, siteUrl = FR_SITE }: { ville: Ville; slug: string; en?: boolean; siteUrl?: string }) {
  const url = `${siteUrl}/destinations/${slug}`
  const coord = ville.coordonnees ?? { lat: 0, lng: 0 }
  const tourist = {
    '@context': 'https://schema.org',
    '@type': 'TouristDestination',
    name: `${ville.nom} Halal`,
    description: descText(ville).slice(0, 300) || (en ? `Halal travel guide for ${ville.nom}.` : `Guide voyage halal pour ${ville.nom}.`),
    url,
    image: ville.image ?? ville.image_hero,
    address: { '@type': 'PostalAddress', addressLocality: ville.nom, addressCountry: ville.codeISO ?? ville.pays },
    geo: { '@type': 'GeoCoordinates', latitude: coord.lat, longitude: coord.lng },
    // Pas d'aggregateRating ici, et c'est delibere.
    //
    // Ce bloc annoncait a Google, sur les 354 pages de villes :
    //   ratingValue : notre propre score_halal — le site se notait lui-meme ;
    //   ratingCount : le NOMBRE DE RESTAURANTS, presente comme un nombre
    //                 d'avis, avec un « ?? 50 » quand la donnee manquait.
    //
    // Deux choses fausses, pas une imprecision. Google refusait ces elements
    // — « Extraits d'avis : 88 % de vos elements ne sont pas eligibles »,
    // recommandation relevee le 24 aout — et il avait raison : une note qu'on
    // s'attribue soi-meme n'est pas un avis, et un compteur invente est un
    // chiffre faux publie sous le nom de l'editeur.
    //
    // La regle est deja ecrite plus bas, pour les restaurants : une note
    // UNIQUEMENT si elle vient d'une source reelle avec un vrai nombre d'avis.
    // Elle vaut ici aussi — et ici il n'existe pas de version honnete de ce
    // bloc, donc il n'y en a plus.
    touristType: en ? 'Muslim traveler' : 'Voyageur musulman',
  }
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: en ? 'Home' : 'Accueil', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Destinations', item: `${siteUrl}/destinations` },
      { '@type': 'ListItem', position: 3, name: ville.nom, item: url },
    ],
  }
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(tourist) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
    </>
  )
}

export function DestinationFaqSchema({ ville, en = false }: { ville: Ville; en?: boolean }) {
  const country = ville.codeISO ?? ''

  // Cap à 20 : aligné sur les restaurants rendus en SSR (pagination) — évite
  // 150 blocs JSON-LD par page (poids inutile, Google n'en exploite que peu).
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const restaurantSchemas = (ville.restaurants ?? []).slice(0, 20).map((r: any) => ({
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: r.nom,
    servesCuisine: r.cuisine ?? r.type,
    ...(r.priceRange || r.fourchette_prix || r.prix_moyen ? { priceRange: r.priceRange ?? r.fourchette_prix ?? r.prix_moyen } : {}),
    address: {
      '@type': 'PostalAddress',
      ...(r.adresse ? { streetAddress: r.adresse } : {}),
      addressLocality: ville.nom,
      addressCountry: country,
    },
    // Note UNIQUEMENT si elle vient d'une source réelle (Google) avec un vrai
    // nombre d'avis — jamais de note ni de compteur inventés.
    ...(r.source === 'google' && typeof r.note === 'number' && typeof r.nombreAvis === 'number'
      ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: r.note, bestRating: '5', ratingCount: r.nombreAvis } }
      : {}),
    ...(r.horaires ? { openingHours: r.horaires } : {}),
    additionalProperty: [
      {
        '@type': 'PropertyValue',
        name: en ? 'Halal status' : 'Statut halal',
        value: en ? 'Reported halal — verify on site' : 'Halal signalé · à vérifier',
      },
      {
        '@type': 'PropertyValue',
        name: 'Source',
        value: r.source === 'google' ? 'Google Maps' : 'OpenStreetMap',
      },
    ],
  }))

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: buildVilleFaq(ville, en).map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(restaurantSchemas) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  )
}
