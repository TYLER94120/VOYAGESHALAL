import Link from 'next/link'
import type { Metadata } from 'next'
import { listSpotsByVille, LIEU_LABELS } from '@/lib/prayerSpots'
import { getDomainSEO } from '@/lib/domain'
import cityCoords from '@/lib/cityCoords.json'
import JsonLd from '@/components/seo/JsonLd'

export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ ville: string }> }
interface CityRef { slug: string; nom: string; lat: number; lng: number }
const CITIES = cityCoords as CityRef[]

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ville } = await params
  const { isEN, brand, siteUrl } = await getDomainSEO()
  const city = CITIES.find((c) => c.slug === ville)
  const nom = city?.nom || ville
  const title = isEN ? `Where to pray in ${nom} — prayer spots | ${brand}` : `Où prier à ${nom} — coins prière | ${brand}`
  const description = isEN
    ? `Prayer spots in ${nom}: malls, restaurants, airports and stations where Muslim travelers can pray. Shared, community-confirmed.`
    : `Coins prière à ${nom} : centres commerciaux, restaurants, aéroports et gares où prier en voyage. Partagés et confirmés par la communauté.`
  return { title: { absolute: title }, description, alternates: { canonical: `${siteUrl}/priere/${ville}` }, openGraph: { url: `${siteUrl}/priere/${ville}` } }
}

export default async function PrayerVillePage({ params }: Props) {
  const { ville } = await params
  const { isEN, siteUrl } = await getDomainSEO()
  const city = CITIES.find((c) => c.slug === ville)
  const nom = city?.nom || ville
  const spots = await listSpotsByVille(ville)

  const itemList = {
    '@context': 'https://schema.org', '@type': 'ItemList',
    name: isEN ? `Prayer spots in ${nom}` : `Coins prière à ${nom}`,
    numberOfItems: spots.length,
    itemListElement: spots.map((s, i) => ({
      '@type': 'ListItem', position: i + 1, name: s.nom, url: `${siteUrl}/priere/${ville}/${s.slug}`,
    })),
  }

  return (
    <main style={{ maxWidth: 780, margin: '0 auto', padding: '32px 20px 64px' }}>
      <JsonLd data={itemList} />
      <nav style={{ fontSize: 13, opacity: 0.7, marginBottom: 16 }}>
        <Link href="/">{isEN ? 'Home' : 'Accueil'}</Link> ›{' '}
        <Link href={`/destinations/${ville}`}>{nom}</Link>
      </nav>

      <h1 style={{ fontSize: 30, fontWeight: 800, margin: '0 0 8px' }}>
        {isEN ? `Where to pray in ${nom}` : `Où prier à ${nom}`}
      </h1>
      <p style={{ fontSize: 16, opacity: 0.85, marginBottom: 24 }}>
        {isEN
          ? 'Prayer spots shared by travelers — malls, restaurants, airports and more.'
          : 'Coins prière partagés par des voyageurs — centres commerciaux, restaurants, aéroports…'}
      </p>

      {spots.length === 0 ? (
        <div style={{ padding: '24px', borderRadius: 16, border: '1px dashed rgba(107,70,193,0.4)', textAlign: 'center' }}>
          <p style={{ margin: 0 }}>
            {isEN
              ? 'No shared prayer spot here yet. In the meantime, find the nearest mosque and prayer times:'
              : 'Aucun coin prière partagé ici pour l\'instant. En attendant, trouvez la mosquée la plus proche et les horaires de prière :'}
          </p>
          <div style={{ marginTop: 14, display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link className="lead-btn" href={`/destinations/${ville}`}>{isEN ? `${nom} guide` : `Guide ${nom}`}</Link>
            <Link className="lead-btn" href="/horaires-priere" style={{ background: '#1b4332', color: '#fff' }}>{isEN ? 'Prayer times' : 'Horaires de prière'}</Link>
          </div>
        </div>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 10 }}>
          {spots.map((s) => {
            const lieu = LIEU_LABELS[s.typeLieu]
            return (
              <li key={s.id}>
                <Link href={`/priere/${ville}/${s.slug}`} style={{ display: 'block', padding: '16px 18px', borderRadius: 14, border: '1px solid rgba(107,70,193,0.25)', background: 'rgba(107,70,193,0.04)' }}>
                  <strong style={{ fontSize: 16 }}>{lieu.icon} {s.nom}</strong>
                  <div style={{ fontSize: 13, opacity: 0.75, marginTop: 4 }}>
                    {isEN ? lieu.en : lieu.fr}{s.adresse ? ` · ${s.adresse}` : ''} · 👥 {s.confirmations}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}
    </main>
  )
}
