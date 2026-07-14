import Link from 'next/link'
import type { Metadata } from 'next'
import { readFileSync } from 'fs'
import path from 'path'
import { listSpotsByVille, LIEU_LABELS } from '@/lib/prayerSpots'
import { getDomainSEO } from '@/lib/domain'
import cityCoords from '@/lib/cityCoords.json'
import JsonLd from '@/components/seo/JsonLd'

export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ ville: string }> }
interface CityRef { slug: string; nom: string; lat: number; lng: number }
const CITIES = cityCoords as CityRef[]

// Fallback « jamais vide » : les mosquées réelles de la fiche ville (JSON).
interface MosqueeRef { nom: string; adresse?: string; description?: string; mapsUrl?: string }
function mosqueesOf(slug: string): MosqueeRef[] {
  if (!/^[a-z0-9-]+$/.test(slug)) return []
  try {
    const d = JSON.parse(readFileSync(path.join(process.cwd(), 'data', 'villes', `${slug}.json`), 'utf-8'))
    const list = [...(Array.isArray(d.mosquees) ? d.mosquees : []), ...(Array.isArray(d.mosqueesPrincipales) ? d.mosqueesPrincipales : [])]
    const seen = new Set<string>()
    return list
      .filter((m) => m?.nom && !seen.has(String(m.nom).toLowerCase()) && seen.add(String(m.nom).toLowerCase()))
      .slice(0, 10)
      .map((m) => ({ nom: String(m.nom), adresse: m.adresse ? String(m.adresse) : undefined, description: m.description ? String(m.description).slice(0, 200) : undefined, mapsUrl: m.mapsUrl ? String(m.mapsUrl) : undefined }))
  } catch { return [] }
}

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
  const mosquees = mosqueesOf(ville)

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

      {spots.length === 0 && mosquees.length === 0 && (
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
      )}

      {spots.length > 0 && (
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

      {/* Fallback « jamais vide » (correctif UX) : mosquées réelles de la ville.
          Contenu concret (nom, adresse, description) — pas de simples liens. */}
      {mosquees.length > 0 && (
        <section style={{ marginTop: spots.length ? 32 : 8 }}>
          <h2 style={{ fontSize: 21, fontWeight: 800, margin: '0 0 6px' }}>
            🕌 {isEN ? `Mosques in ${nom}` : `Mosquées à ${nom}`}
          </h2>
          <p style={{ fontSize: 13.5, opacity: 0.7, margin: '0 0 14px' }}>
            {isEN
              ? spots.length === 0
                ? 'No community prayer spot shared here yet — here are the city\'s mosques to pray in the meantime.'
                : 'Also available: the city\'s mosques.'
              : spots.length === 0
                ? 'Aucun coin prière partagé ici pour l\'instant — voici les mosquées de la ville pour prier en attendant.'
                : 'Également disponibles : les mosquées de la ville.'}
          </p>
          <ul style={{ listStyle: 'none', padding: 0, display: 'grid', gap: 10 }}>
            {mosquees.map((m, i) => (
              <li key={i} style={{ padding: '14px 16px', borderRadius: 14, border: '1px solid rgba(27,67,50,0.18)', background: '#fff' }}>
                <strong style={{ fontSize: 15 }}>{m.nom}</strong>
                {m.adresse && <div style={{ fontSize: 13, opacity: 0.7, marginTop: 2 }}>{m.adresse}</div>}
                {m.description && <p style={{ fontSize: 13, opacity: 0.8, margin: '6px 0 0', lineHeight: 1.5 }}>{m.description}</p>}
                {m.mapsUrl && (
                  <a href={m.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-block', marginTop: 8, fontSize: 12.5, fontWeight: 700, color: '#1b4332' }}>
                    🗺 {isEN ? 'View on map →' : 'Voir sur la carte →'}
                  </a>
                )}
              </li>
            ))}
          </ul>
          <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <Link className="lead-btn" href={`/destinations/${ville}`}>{isEN ? `${nom} halal guide` : `Guide halal ${nom}`}</Link>
            <Link className="lead-btn" href="/horaires-priere" style={{ background: '#1b4332', color: '#fff' }}>{isEN ? 'Prayer times' : 'Horaires de prière'}</Link>
          </div>
        </section>
      )}
    </main>
  )
}
