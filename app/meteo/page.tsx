import type { Metadata } from 'next'
import MeteoClient from '@/components/meteo/MeteoClient'
import IslamicPattern from '@/components/ui/IslamicPattern'
import { getDomainSEO } from '@/lib/domain'
import { titreSeo, descriptionSeo } from '@/lib/titre-seo'
import { alternatesFor } from '@/lib/hreflang'

export async function generateMetadata(): Promise<Metadata> {
  const { isEN, siteUrl } = await getDomainSEO()
  return {
    title: titreSeo([
      isEN ? 'Weather in 354 Halal Destinations — Before You Go' : 'Météo des destinations halal — avant de partir',
      isEN ? 'Weather in 354 Halal Destinations' : 'La météo de ta destination',
    ]),
    description: descriptionSeo([
      isEN
        ? 'Going to Dubai, Istanbul or Marrakesh? See the weather there right now and over the coming days — in one tap, for 354 halal destinations.'
        : 'Vous partez à Dubaï, Istanbul ou Marrakech ? Voyez la météo là-bas maintenant et les jours à venir — en un tap, pour 354 destinations halal.',
    ]),
    alternates: alternatesFor('/meteo', isEN),
    openGraph: { url: `${siteUrl}/meteo` },
  }
}

export default async function MeteoPage() {
  const { isEN: en } = await getDomainSEO()
  return (
    <main style={{ minHeight: '100vh', background: 'var(--creme)' }}>
      <section className="relative overflow-hidden text-center" style={{ background: 'var(--nuit)', padding: '1.1rem 1.5rem 1rem' }}>
        <IslamicPattern opacity={0.06} />
        <div className="relative z-10">
          <p style={{ color: 'var(--or)', fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', marginBottom: '0.35rem' }}>
            ✦ {en ? 'Muslim tools' : 'Outils musulmans'}
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.4rem, 4vw, 2.1rem)', fontWeight: 900, color: 'white', marginBottom: '0.4rem', lineHeight: 1.1 }}>
            {en ? 'The weather' : 'La météo'}<br />
            <em style={{ color: 'var(--or)' }}>{en ? 'where you are going' : 'là où tu vas'}</em>
          </h1>
          <p style={{ color: 'var(--or-clair)', fontSize: '0.9rem', opacity: 0.85 }}>
            {en ? '354 destinations · before you pack' : '354 destinations · avant de faire ta valise'}
          </p>
        </div>
      </section>
      <MeteoClient en={en} />
    </main>
  )
}
