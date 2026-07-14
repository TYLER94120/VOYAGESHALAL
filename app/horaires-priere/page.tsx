import type { Metadata } from 'next'
import HorairesClient from './HorairesClient'
import IslamicPattern from '@/components/ui/IslamicPattern'
import { getDomainSEO } from '@/lib/domain'

export async function generateMetadata(): Promise<Metadata> {
  const { isEN, siteUrl } = await getDomainSEO()
  return {
    title: isEN
      ? "Prayer times today — Every city in the world"
      : "Heures de prière aujourd'hui — Toutes les villes du monde",
    description: isEN
      ? 'Real-time prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha) for the main halal destinations worldwide. Aladhan data, updated daily.'
      : "Horaires de prière en temps réel (Fajr, Dhuhr, Asr, Maghrib, Isha) pour les principales destinations halal du monde. Données Aladhan, mises à jour quotidiennement.",
    alternates: {
      canonical: `${siteUrl}${isEN ? '/prayer-times' : '/horaires-priere'}`,
      languages: {
        fr: 'https://www.voyageshalal.fr/horaires-priere',
        en: 'https://www.gohalaltravel.com/prayer-times',
        'x-default': 'https://www.gohalaltravel.com/prayer-times',
      },
    },
    openGraph: { url: `${siteUrl}${isEN ? '/prayer-times' : '/horaires-priere'}` },
  }
}

export default async function HorairesPrierePage() {
  const { isEN: en } = await getDomainSEO()
  return (
    <main style={{ backgroundColor: '#fdfaf3' }}>
      {/* Bandeau compact : les HORAIRES doivent être visibles sans scroller (mobile-first) */}
      <section className="relative overflow-hidden px-6 pt-6 pb-6 text-center" style={{ backgroundColor: '#0b1a0f' }}>
        <IslamicPattern opacity={0.07} />
        <div className="relative z-10">
          <h1
            className="text-2xl sm:text-3xl font-bold text-white"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 900 }}
          >
            {en ? <>Prayer times <span className="gold-em">today</span></> : <>Heures de prière <span className="gold-em">aujourd&apos;hui</span></>}
          </h1>
        </div>
      </section>
      <div className="max-w-5xl mx-auto px-4 sm:px-12 py-6">
        <HorairesClient />
      </div>
    </main>
  )
}
