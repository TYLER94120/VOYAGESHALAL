import type { Ville } from '@/lib/villeTypes'
import { buildVilleFaq } from '@/lib/villeFaq'
import { conforme } from '@/lib/conformite'

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
    // 🔴 2 septembre — AUCUN aggregateRating ICI. Ce bloc annonçait à Google :
    //     ratingValue : ville.score_halal        → NOTRE score éditorial, calculé
    //     ratingCount : restaurants_halal ?? 50  → un nombre de RESTAURANTS
    //
    // Deux affirmations fausses dans la même balise. `ratingCount` désigne un
    // nombre d'AVIS ; aucune fiche ville ne porte le moindre champ d'avis ou de
    // note d'utilisateur (vérifié sur les 354). On présentait donc notre propre
    // note comme la moyenne d'avis qui n'existent pas, sur 354 pages × 2 domaines.
    // Et le repli `?? 50` était le jumeau exact du `ratingCount: h.avis_count ?? 20`
    // retiré des hôtels le 24 août : il ne s'est jamais déclenché (les 354 villes
    // ont la statistique), mais il attendait la première ville publiée sans elle.
    //
    // Le score reste affiché SUR LA PAGE, où il est expliqué. Il ne part pas en
    // donnée structurée se faire passer pour autre chose.
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
  // 🔴 2 septembre — LE MÊME FILTRE QUE L'AFFICHAGE, PAS UN AUTRE.
  // Mesure : 150 restaurants sur 5 276 (2,8 %) partaient dans ce JSON-LD alors
  // que `conforme()` les refuse à l'écran — un « Bar And Restaurant » à Accra,
  // des adresses à tapas à Addis-Abeba. Le site refusait de les montrer et
  // annonçait quand même à Google qu'ils sont dans son guide halal.
  // SocleVille et DestinationRoute appliquent ce filtre ; la donnée structurée
  // l'ignorait. Ce qu'on déclare à Google ne peut pas être plus permissif que
  // ce qu'on ose afficher.
  const restaurantSchemas = (ville.restaurants ?? [])
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((r: any) => conforme(r.nom, r.cuisine ?? r.type, r.halalConfidence))
    .slice(0, 20).map((r: any) => ({
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
