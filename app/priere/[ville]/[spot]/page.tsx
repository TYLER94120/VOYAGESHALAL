import { notFound } from 'next/navigation'
import Link from 'next/link'
import type { Metadata } from 'next'
import { getSpot, listSpotsByVille, LIEU_LABELS } from '@/lib/prayerSpots'
import { getDomainSEO } from '@/lib/domain'
import JsonLd from '@/components/seo/JsonLd'

export const dynamic = 'force-dynamic' // lit Redis à la demande (données seed en direct)

interface Props { params: Promise<{ ville: string; spot: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ville, spot: spotSlug } = await params
  const { isEN, brand, siteUrl } = await getDomainSEO()
  const spot = await getSpot(ville, spotSlug)
  if (!spot) return { title: isEN ? 'Prayer spot not found' : 'Coin prière introuvable' }
  const lieu = LIEU_LABELS[spot.typeLieu]
  const url = `${siteUrl}/priere/${ville}/${spotSlug}`
  const title = isEN
    ? `Where to pray at ${spot.nom} — ${spot.villeNom} | ${brand}`
    : `Où prier à ${spot.nom} — ${spot.villeNom} | ${brand}`
  const description = isEN
    ? `Prayer spot at ${spot.nom} (${lieu.en}) in ${spot.villeNom}. Location, access and traveler tips. Shared spot — confirm on site.`
    : `Coin prière à ${spot.nom} (${lieu.fr}) à ${spot.villeNom}. Emplacement, accès et conseils de voyageurs. Spot partagé — à confirmer sur place.`
  return {
    title: { absolute: title }, description,
    alternates: { canonical: url },
    openGraph: { title, description, url, images: spot.photo ? [{ url: spot.photo }] : undefined },
  }
}

export default async function PrayerSpotPage({ params }: Props) {
  const { ville, spot: spotSlug } = await params
  const { isEN, siteUrl } = await getDomainSEO()
  const spot = await getSpot(ville, spotSlug)
  if (!spot) notFound()
  const lieu = LIEU_LABELS[spot.typeLieu]
  const others = (await listSpotsByVille(ville)).filter((s) => s.slug !== spotSlug).slice(0, 6)

  const placeSchema = {
    '@context': 'https://schema.org',
    '@type': 'Place',
    name: isEN ? `Prayer spot — ${spot.nom}` : `Coin prière — ${spot.nom}`,
    description: spot.description,
    address: { '@type': 'PostalAddress', addressLocality: spot.villeNom, streetAddress: spot.adresse },
    geo: { '@type': 'GeoCoordinates', latitude: spot.lat, longitude: spot.lng },
    ...(spot.photo ? { image: spot.photo } : {}),
    url: `${siteUrl}/priere/${ville}/${spotSlug}`,
  }
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: isEN ? 'Home' : 'Accueil', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: isEN ? `Pray in ${spot.villeNom}` : `Prier à ${spot.villeNom}`, item: `${siteUrl}/priere/${ville}` },
      { '@type': 'ListItem', position: 3, name: spot.nom, item: `${siteUrl}/priere/${ville}/${spotSlug}` },
    ],
  }

  return (
    <main className="spot-page" style={{ maxWidth: 780, margin: '0 auto', padding: '32px 20px 64px' }}>
      <JsonLd data={placeSchema} />
      <JsonLd data={breadcrumb} />

      <nav style={{ fontSize: 13, opacity: 0.7, marginBottom: 16 }}>
        <Link href="/">{isEN ? 'Home' : 'Accueil'}</Link> ›{' '}
        <Link href={`/priere/${ville}`}>{isEN ? `Pray in ${spot.villeNom}` : `Prier à ${spot.villeNom}`}</Link>
      </nav>

      <span className="badge-shared" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, padding: '4px 10px', borderRadius: 20, background: 'rgba(107,70,193,0.12)', color: '#6b46c1' }}>
        🧭 {isEN ? 'Shared spot' : 'Spot partagé'}
      </span>

      <h1 style={{ fontSize: 30, fontWeight: 800, margin: '14px 0 6px' }}>
        {isEN ? 'Where to pray at' : 'Où prier à'} {spot.nom}
      </h1>
      <p style={{ fontSize: 16, opacity: 0.85, margin: '0 0 4px' }}>
        {lieu.icon} {isEN ? lieu.en : lieu.fr} · {spot.villeNom}
      </p>

      {spot.photo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={spot.photo} alt={`${spot.nom} — ${isEN ? 'prayer spot' : 'coin prière'}`} width={780} height={420}
          style={{ width: '100%', maxHeight: 420, objectFit: 'cover', borderRadius: 16, margin: '18px 0' }} />
      )}

      {spot.adresse && <p style={{ margin: '10px 0' }}>📍 {spot.adresse}</p>}
      {spot.description && <p style={{ margin: '10px 0', lineHeight: 1.6 }}>{spot.description}</p>}

      <p style={{ fontSize: 14, opacity: 0.8, margin: '16px 0' }}>
        👥 {spot.confirmations} {isEN ? 'travelers confirm this spot' : 'voyageurs confirment ce coin prière'}
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', margin: '20px 0' }}>
        <a className="lead-btn" href={`https://maps.google.com/?q=${spot.lat},${spot.lng}`} target="_blank" rel="noopener noreferrer">
          🗺️ {isEN ? 'Open in Maps' : 'Ouvrir dans Maps'}
        </a>
        <Link className="lead-btn" href={`/autour-de-moi?lat=${spot.lat}&lng=${spot.lng}`} style={{ background: '#6b46c1', color: '#fff' }}>
          {isEN ? 'See on map' : 'Voir sur la carte'}
        </Link>
      </div>

      <p style={{ fontSize: 12, opacity: 0.6, marginTop: 24 }}>
        {isEN
          ? 'Shared traveler information — please verify access on site. We never certify religious status.'
          : 'Information partagée par des voyageurs — vérifiez l\'accès sur place. Nous ne certifions jamais le statut religieux.'}
      </p>

      {others.length > 0 && (
        <section style={{ marginTop: 40 }}>
          <h2 style={{ fontSize: 20, fontWeight: 800, marginBottom: 12 }}>
            {isEN ? `Other prayer spots in ${spot.villeNom}` : `Autres coins prière à ${spot.villeNom}`}
          </h2>
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 8 }}>
            {others.map((s) => (
              <li key={s.id}>
                <Link href={`/priere/${ville}/${s.slug}`} style={{ display: 'block', padding: '12px 14px', borderRadius: 12, border: '1px solid rgba(107,70,193,0.25)' }}>
                  {LIEU_LABELS[s.typeLieu].icon} {s.nom}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </main>
  )
}
