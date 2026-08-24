import { titreSeo, descriptionSeo } from '@/lib/titre-seo'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { readFileSync } from 'fs'
import path from 'path'
import type { Metadata } from 'next'
import type { Ville } from '@/lib/villeTypes'
import { getDomainSEO, FR_URL, EN_URL } from '@/lib/domain'
import { GUIDES_FR_TO_EN } from '@/lib/slugs'
import { dedupeHotels, noteOf, priceRank, reviewCountOf } from '@/lib/hotelFilter'
import HotelCTA from '@/components/affiliate/HotelCTA'
import HotelsSansAlcool from '@/components/hotels/HotelsSansAlcool'
import JsonLd from '@/components/seo/JsonLd'
import cityCoords from '@/lib/cityCoords.json'

// Page dédiée « Hôtels halal à {Ville} » — cible les requêtes réelles GSC
// (« hotel halal marrakech », « hotel islamique dubai »…). SSR indexable,
// réutilise les hôtels des fiches villes + le tri de lib/hotelFilter.
// Jamais « certifié » : on parle d'hôtels « sans alcool / halal-friendly ».

export const dynamicParams = false

interface Props { params: Promise<{ ville: string }> }
interface CityRef { slug: string; nom: string; pays?: string }
const CITIES = cityCoords as CityRef[]

export function generateStaticParams() {
  return CITIES.map((c) => ({ ville: c.slug }))
}

function getVille(slug: string): Ville | null {
  try { return JSON.parse(readFileSync(path.join(process.cwd(), 'data', 'villes', `${slug}.json`), 'utf-8')) as Ville }
  catch { return null }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function sortedHotels(ville: any) {
  const hotels = dedupeHotels(ville.hotels || [])
  return hotels.slice().sort((a, b) => {
    const na = noteOf(a) ?? 0, nb = noteOf(b) ?? 0
    if (nb !== na) return nb - na
    return (priceRank(a) ?? 9) - (priceRank(b) ?? 9)
  })
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ville: slug } = await params
  const ville = getVille(slug)
  const { isEN, siteUrl } = await getDomainSEO()
  if (!ville) return { title: isEN ? 'Halal hotels' : 'Hôtels halal' }
  const n = (ville.hotels?.length ?? 0)
  // 91 caracteres sur les 354 pages hotels : Google coupait tout apres
  // « 2026 ». Le nom de la ville est celui que tape le lecteur, et la marque
  // n'est plus dans le titre.
  const nomLocal = (isEN && ville.nom_en) ? ville.nom_en : ville.nom
  // Le titre se replie tout seul quand le nom de la ville est long
  // (« Bandar Seri Begawan » débordait de 7 caractères) — voir lib/titre-seo.
  const title = isEN
    ? titreSeo([
        `Halal Hotels in ${nomLocal} 2026: Alcohol-Free, Near a Mosque`,
        `Halal Hotels in ${nomLocal} 2026: Alcohol-Free`,
        `Halal Hotels in ${nomLocal}: Alcohol-Free`,
        `Halal Hotels in ${nomLocal}`,
      ])
    : titreSeo([
        `Hôtels halal ${nomLocal} 2026 : sans alcool, mosquée proche`,
        `Hôtels halal ${nomLocal} : sans alcool, mosquée proche`,
        `Hôtels halal ${nomLocal} 2026 : sans alcool`,
        `Hôtels halal ${nomLocal}`,
      ])
  // Même défaut que le titre, même correction : la description tenait pour
  // « Dubaï » et débordait pour « Salvador de Bahia » (33 pages coupées).
  const description = isEN
    ? descriptionSeo([
        `${n}+ halal-friendly hotels in ${nomLocal}: alcohol-free options, near mosques, family-friendly. Compare and book for your Muslim trip.`,
        `${n}+ halal-friendly hotels in ${nomLocal}: alcohol-free options, near mosques, family-friendly.`,
        `${n}+ halal-friendly hotels in ${nomLocal}: alcohol-free options, near mosques.`,
      ])
    : descriptionSeo([
        `${n}+ hôtels halal-friendly à ${nomLocal} : options sans alcool, proches des mosquées, adaptés aux familles. Comparez et réservez pour votre voyage musulman.`,
        `${n}+ hôtels halal-friendly à ${nomLocal} : options sans alcool, proches des mosquées, adaptés aux familles. Comparez et réservez.`,
        `${n}+ hôtels halal-friendly à ${nomLocal} : options sans alcool, proches des mosquées, adaptés aux familles.`,
        `${n}+ hôtels halal-friendly à ${nomLocal} : options sans alcool, proches des mosquées.`,
      ])
  return {
    title: { absolute: title }, description,
    ...(n < 3 ? { robots: { index: false, follow: true } } : {}),
    alternates: {
      canonical: `${siteUrl}/hotels/${slug}`,
      languages: { fr: `${FR_URL}/hotels/${slug}`, en: `${EN_URL}/hotels/${slug}`, 'x-default': `${EN_URL}/hotels/${slug}` },
    },
    openGraph: { title, description, url: `${siteUrl}/hotels/${slug}` },
  }
}

export default async function HotelsVillePage({ params }: Props) {
  const { ville: slug } = await params
  const ville = getVille(slug)
  if (!ville) notFound()
  const { isEN, siteUrl } = await getDomainSEO()
  const hotels = sortedHotels(ville)

  const itemList = {
    '@context': 'https://schema.org', '@type': 'ItemList',
    name: isEN ? `Halal hotels in ${ville.nom}` : `Hôtels halal à ${ville.nom}`,
    numberOfItems: hotels.length,
    itemListElement: hotels.slice(0, 25).map((h, i) => ({
      '@type': 'ListItem', position: i + 1,
      item: {
        '@type': 'Hotel', name: h.nom,
        ...(h.adresse ? { address: { '@type': 'PostalAddress', streetAddress: h.adresse, addressLocality: ville.nom } } : {}),
        // Une note ne part chez Google que si un VRAI nombre d'avis
        // l'accompagne. Le « ?? 20 » qui etait ici en inventait un : le champ
        // `avis_count` est declare dans les types mais n'est rempli nulle
        // part, donc les 33 322 hotels des donnees annoncaient tous « note par
        // 20 personnes » — et pas un seul de ces 20 n'existait.
        // Meme regle que pour les restaurants, quelques lignes plus loin.
        ...(noteOf(h) && reviewCountOf(h) > 0
          ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: noteOf(h), bestRating: 5, ratingCount: reviewCountOf(h) } }
          : {}),
      },
    })),
  }
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isEN ? 'Home' : 'Accueil', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: ville.nom, item: `${siteUrl}/destinations/${slug}` },
      { '@type': 'ListItem', position: 3, name: isEN ? 'Halal hotels' : 'Hôtels halal', item: `${siteUrl}/hotels/${slug}` },
    ],
  }

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '28px 20px 64px' }}>
      <JsonLd data={itemList} />
      <JsonLd data={breadcrumb} />
      <nav style={{ fontSize: 13, opacity: 0.7, marginBottom: 14 }}>
        <Link href="/">{isEN ? 'Home' : 'Accueil'}</Link> ›{' '}
        <Link href={`/destinations/${slug}`}>{ville.nom}</Link>
      </nav>

      <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(26px,5vw,34px)', fontWeight: 800, margin: '0 0 8px' }}>
        {isEN ? `Halal hotels in ${ville.nom}` : `Hôtels halal à ${ville.nom}`}
      </h1>
      <p style={{ fontSize: 16, opacity: 0.85, margin: '0 0 20px' }}>
        {isEN
          ? `${hotels.length} halal-friendly hotels: alcohol-free options, close to mosques, family-friendly.`
          : `${hotels.length} hôtels halal-friendly : options sans alcool, proches des mosquées, adaptés aux familles.`}
      </p>

      <div style={{ margin: '0 0 24px' }}>
        <HotelCTA cityName={ville.nom} variant="banner" />
      </div>

      <HotelsSansAlcool hotels={hotels} villeNom={ville.nom} villeSlug={slug} en={isEN} />

      {/* Ce qu'on ne sait pas, et comment le savoir. Un lecteur qui repart
          avec les bonnes questions vaut mieux qu'un lecteur à qui on a
          affirmé n'importe quoi. */}
      <div style={{ marginTop: 26, padding: '18px 20px', borderRadius: 16, background: 'var(--nuit)', color: '#fdfaf3' }}>
        <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 18, margin: '0 0 8px', color: '#fff' }}>
          {isEN ? 'Before you book: 6 questions to ask the hotel' : 'Avant de réserver : 6 questions à poser à l’hôtel'}
        </p>
        <ol style={{ margin: 0, paddingLeft: 20, fontSize: 14, lineHeight: 1.85, color: 'rgba(253,250,243,0.85)' }}>
          <li>{isEN ? 'Is alcohol served in the bar, the restaurant or the minibar?' : 'L’alcool est-il servi au bar, au restaurant, dans le minibar ?'}</li>
          <li>{isEN ? 'Is the breakfast — and the meat — halal, and certified by whom?' : 'Le petit-déjeuner et la viande sont-ils halal, et certifiés par qui ?'}</li>
          <li>{isEN ? 'Is there a prayer mat and a qibla direction in the room?' : 'Y a-t-il un tapis de prière et la direction de la qibla en chambre ?'}</li>
          <li>{isEN ? 'Does the pool or spa have women-only slots?' : 'La piscine ou le spa ont-ils des créneaux réservés aux femmes ?'}</li>
          <li>{isEN ? 'Is there a nightclub or an event venue in the building?' : 'Y a-t-il une boîte de nuit ou une salle de fête dans l’établissement ?'}</li>
          <li>{isEN ? 'Are there family rooms, and can the minibar be emptied on request?' : 'Existe-t-il des chambres familiales, et le minibar peut-il être vidé sur demande ?'}</li>
        </ol>
        <p style={{ fontSize: 12.5, lineHeight: 1.6, color: 'rgba(253,250,243,0.55)', margin: '12px 0 0' }}>
          {isEN
            ? 'We list what our sources say and nothing more. We never write “certified”: we certify nothing.'
            : 'Nous affichons ce que disent nos sources, rien de plus. Nous n’écrivons jamais « certifié » : nous ne certifions rien.'}
        </p>
        <a href="/communaute/ajouter" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, padding: '0 16px', marginTop: 14, borderRadius: 999, border: '1px solid rgba(201,168,76,0.45)', color: 'var(--or-clair)', fontSize: 13.5, fontWeight: 700, textDecoration: 'none' }}>
          ➕ {isEN ? 'Stayed in one of these hotels? Tell us what you saw' : 'Tu as séjourné dans l’un de ces hôtels ? Dis-nous ce que tu as vu'}
        </a>
      </div>

      <p style={{ fontSize: 12, opacity: 0.6, marginTop: 20 }}>
        {isEN
          ? 'Information shared to help Muslim travelers — always confirm halal options and alcohol policy with the hotel. We never certify.'
          : 'Informations fournies pour aider les voyageurs musulmans — confirmez toujours les options halal et la politique alcool auprès de l\'hôtel. Nous ne certifions jamais.'}
      </p>

      <div style={{ marginTop: 24, display: 'flex', gap: 14, flexWrap: 'wrap' }}>
        <Link href={`/destinations/${slug}`} style={{ fontWeight: 700, color: 'var(--foret)' }}>← {isEN ? `Full ${ville.nom} guide` : `Guide complet ${ville.nom}`}</Link>
        <Link href={`/guides/${isEN ? GUIDES_FR_TO_EN['hotel-halal-tout-savoir'] : 'hotel-halal-tout-savoir'}`} style={{ fontWeight: 700, color: 'var(--foret)' }}>{isEN ? 'What is a halal hotel?' : 'Qu\'est-ce qu\'un hôtel halal ?'} →</Link>
      </div>
    </main>
  )
}
