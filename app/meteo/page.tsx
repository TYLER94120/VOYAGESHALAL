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
      isEN ? 'Weather & Prayer Times: What to Expect Today' : 'Météo et heures de prière : à quoi s’attendre',
      isEN ? 'Weather at Every Prayer Time' : 'La météo à chaque heure de prière',
    ]),
    description: descriptionSeo([
      isEN
        ? 'The temperature and sky at each prayer time, where you are: know what to take before heading to the mosque, and what the coming days hold.'
        : 'La température et le ciel à chaque heure de prière, là où vous êtes : savoir quoi prendre avant d’aller à la mosquée, et ce qui vous attend les prochains jours.',
    ]),
    alternates: alternatesFor('/meteo', isEN),
    openGraph: { url: `${siteUrl}/meteo` },
  }
}

export default async function MeteoPage() {
  const { isEN: en } = await getDomainSEO()
  return (
    <main style={{ minHeight: '100vh', background: 'var(--creme)' }}>
      <section className="relative overflow-hidden text-center" style={{ background: 'var(--nuit)', padding: '1.75rem 1.5rem 1.5rem' }}>
        <IslamicPattern opacity={0.06} />
        <div className="relative z-10">
          <p style={{ color: 'var(--or)', fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', marginBottom: '0.5rem' }}>
            ✦ {en ? 'Muslim tools' : 'Outils musulmans'}
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.65rem, 4.5vw, 2.5rem)', fontWeight: 900, color: 'white', marginBottom: '0.4rem', lineHeight: 1.1 }}>
            {en ? 'The weather at' : 'La météo à'}<br />
            <em style={{ color: 'var(--or)' }}>{en ? 'each prayer' : 'chaque prière'}</em>
          </h1>
          <p style={{ color: 'var(--or-clair)', fontSize: '0.9rem', opacity: 0.85 }}>
            {en ? 'Know before you head out' : 'Savoir avant de sortir'}
          </p>
        </div>
      </section>
      <MeteoClient en={en} />
    </main>
  )
}
