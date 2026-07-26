import type { Metadata } from 'next'
import Link from 'next/link'
import SpotsFeed from '@/components/spots/SpotsFeed'
import { getDomainSEO, FR_URL, EN_URL } from '@/lib/domain'

// 🧿 /spots — LA page vedette du virage : découvrir les pépites halal
// partagées et confirmées par des musulmans. Additif : /communaute reste
// en ligne (profils, classement, ajout) — /spots devient le hub.
export async function generateMetadata(): Promise<Metadata> {
  const { isEN, siteUrl } = await getDomainSEO()
  const title = isEN
    ? 'Spots — halal gems shared by Muslim travelers'
    : 'Spots — les pépites halal partagées par les voyageurs musulmans'
  const description = isEN
    ? 'Prayer corners, halal restaurants, women-friendly places and hidden gems — real spots shared, enriched and confirmed by the Muslim community.'
    : 'Coins prière, restos halal, espaces femmes et pépites — de vrais spots partagés, enrichis et confirmés par la communauté musulmane.'
  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/spots`, languages: { fr: `${FR_URL}/spots`, en: `${EN_URL}/spots` } },
    openGraph: { title, description, url: `${siteUrl}/spots` },
  }
}

export default async function SpotsPage() {
  const { isEN: en } = await getDomainSEO()
  return (
    <main style={{ background: 'var(--nuit)', minHeight: '100vh', paddingTop: 22 }}>
      <header style={{ maxWidth: 560, margin: '0 auto', padding: '0 16px 6px' }}>
        <p style={{ color: 'var(--or)', fontSize: 12, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', margin: 0 }}>
          {en ? 'Community spots' : 'Les spots de la communauté'}
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: '#fdfaf3', fontSize: 28, fontWeight: 900, margin: '4px 0 6px', flex: 1, minWidth: 200 }}>
            {en ? 'Discover the gems' : 'Découvre les pépites'}
          </h1>
          <Link href="/communaute/ajouter" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 48, padding: '0 18px', borderRadius: 999, background: 'var(--or)', color: '#0b1a0f', fontWeight: 800, fontSize: 14.5, textDecoration: 'none' }}>
            ➕ {en ? 'Add a spot' : 'Ajouter un spot'}
          </Link>
        </div>
        <p style={{ color: 'rgba(253,250,243,0.6)', fontSize: 14, margin: '0 0 10px', lineHeight: 1.6 }}>
          {en
            ? 'Real places, shared and confirmed by Muslim travelers — nothing invented, ever.'
            : 'De vrais lieux, partagés et confirmés par des voyageurs musulmans — jamais rien d\'inventé.'}
        </p>
      </header>
      <SpotsFeed />
    </main>
  )
}
