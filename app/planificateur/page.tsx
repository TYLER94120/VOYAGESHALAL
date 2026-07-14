import type { Metadata } from 'next'
import { getDomainSEO } from '@/lib/domain'
import { localizedHref } from '@/lib/slugs'
import PlannerClient from '@/components/planner/PlannerClient'
import IslamicPattern from '@/components/ui/IslamicPattern'

// Planificateur « Mon voyage halal » — la feature héro engagement.
// Wizard client 4 étapes → itinéraire jour par jour (activités, restos halal,
// mosquée, horaires de prière réels, budget estimé, checklist).

export async function generateMetadata(): Promise<Metadata> {
  const { isEN, siteUrl } = await getDomainSEO()
  const path = localizedHref('/planificateur', isEN)
  return {
    title: isEN
      ? 'Halal trip planner — Free day-by-day itinerary'
      : 'Planificateur voyage halal — Itinéraire jour par jour gratuit',
    description: isEN
      ? 'Build your personalized halal itinerary in 2 minutes: activities, halal restaurants, nearest mosque and real prayer times for each day of your trip. Free, 354 cities.'
      : 'Créez votre itinéraire halal personnalisé en 2 minutes : activités, restaurants halal, mosquée la plus proche et horaires de prière réels pour chaque jour de votre séjour. Gratuit, 354 villes.',
    alternates: {
      canonical: `${siteUrl}${path}`,
      languages: {
        fr: 'https://www.voyageshalal.fr/planificateur',
        en: 'https://www.gohalaltravel.com/trip-planner',
        'x-default': 'https://www.gohalaltravel.com/trip-planner',
      },
    },
    openGraph: { url: `${siteUrl}${path}` },
  }
}

export default async function PlanificateurPage() {
  const { isEN: en, siteUrl } = await getDomainSEO()
  const appSchema = {
    '@context': 'https://schema.org',
    '@type': 'WebApplication',
    name: en ? 'Halal trip planner' : 'Planificateur voyage halal',
    url: `${siteUrl}${localizedHref('/planificateur', en)}`,
    applicationCategory: 'TravelApplication',
    operatingSystem: 'Web',
    offers: { '@type': 'Offer', price: '0', priceCurrency: 'EUR' },
  }
  return (
    <main style={{ minHeight: '100vh', background: 'var(--creme)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(appSchema) }} />
      <section className="relative overflow-hidden text-center" style={{ background: 'var(--nuit)', padding: '3.5rem 1.5rem 2.5rem' }}>
        <IslamicPattern opacity={0.06} />
        <div className="relative z-10">
          <p style={{ color: 'var(--or)', fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', marginBottom: '1rem' }}>
            ✦ {en ? 'Free tool' : 'Outil gratuit'}
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.9rem, 5vw, 2.8rem)', fontWeight: 900, color: 'white', lineHeight: 1.15, marginBottom: '0.75rem' }}>
            {en ? 'My halal trip, day by day' : 'Mon voyage halal, jour par jour'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 15, maxWidth: 560, margin: '0 auto' }}>
            {en
              ? 'Destination, dates, travel style — get a personalized itinerary with halal restaurants, mosques and real prayer times for every day.'
              : 'Destination, dates, style de voyage — recevez un itinéraire personnalisé avec restaurants halal, mosquées et horaires de prière réels pour chaque jour.'}
          </p>
        </div>
      </section>
      <section className="px-4 py-10">
        <PlannerClient />
      </section>
    </main>
  )
}
