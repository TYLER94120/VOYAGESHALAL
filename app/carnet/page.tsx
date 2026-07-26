import type { Metadata } from 'next'
import { getDomainSEO } from '@/lib/domain'
import { localizedHref } from '@/lib/slugs'
import CarnetClient from '@/components/carnet/CarnetClient'
import IslamicPattern from '@/components/ui/IslamicPattern'

// « Mon carnet » (P3) — la collection personnelle de l'utilisateur.
// Contenu 100 % personnel → noindex (la page n'a pas de valeur SEO).

export async function generateMetadata(): Promise<Metadata> {
  const { isEN, siteUrl } = await getDomainSEO()
  return {
    title: isEN ? 'My spots — my personal halal notebook' : 'Mes spots — mon carnet halal personnel',
    description: isEN
      ? 'Your saved destinations, halal restaurants, mosques and prayer spots — on all your devices.'
      : 'Vos destinations, restaurants halal, mosquées et coins prière sauvegardés — sur tous vos appareils.',
    robots: { index: false, follow: true },
    alternates: { canonical: `${siteUrl}${localizedHref('/carnet', isEN)}` },
  }
}

export default async function CarnetPage() {
  const { isEN: en } = await getDomainSEO()
  return (
    <main style={{ minHeight: '100vh', background: 'var(--creme)' }}>
      <section className="relative overflow-hidden text-center" style={{ background: 'var(--nuit)', padding: '3rem 1.5rem 2.25rem' }}>
        <IslamicPattern opacity={0.06} />
        <div className="relative z-10">
          <p style={{ color: 'var(--or)', fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            💎 {en ? 'Your spots, yours forever' : 'Tes spots, à toi pour toujours'}
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.8rem, 5vw, 2.6rem)', fontWeight: 900, color: 'white', lineHeight: 1.15 }}>
            {en ? 'My spots' : 'Mes spots'}
          </h1>
          <p style={{ color: 'rgba(253,250,243,0.65)', fontSize: 14, margin: '10px auto 0', maxWidth: 460 }}>
            {en
              ? 'Saved on your phone — works offline, exportable anytime.'
              : 'Enregistrés sur ton téléphone — disponibles hors-ligne, exportables à tout moment.'}
          </p>
        </div>
      </section>
      <div className="pt-8">
        <CarnetClient />
      </div>
    </main>
  )
}
