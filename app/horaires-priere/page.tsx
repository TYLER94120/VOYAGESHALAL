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
      <section className="relative overflow-hidden px-6 sm:px-16 pt-14 pb-16 text-center" style={{ backgroundColor: '#0b1a0f' }}>
        <IslamicPattern opacity={0.07} />
        <div className="relative z-10">
          <p style={{ color: '#c9a84c' }} className="text-sm font-semibold uppercase tracking-[0.3em] mb-4">
            As-salāmu ʿalaykum
          </p>
          <h1
            className="text-4xl sm:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 900 }}
          >
            {en ? <>Prayer times <span className="gold-em">today</span></> : <>Heures de prière <span className="gold-em">aujourd&apos;hui</span></>}
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto">
            {en
              ? 'Real-time times for major cities worldwide — Fajr, Dhuhr, Asr, Maghrib, Isha. Aladhan data (UOIF, Umm al-Qura).'
              : 'Horaires en temps réel pour les principales villes du monde — Fajr, Dhuhr, Asr, Maghrib, Isha. Données Aladhan (UOIF, Umm al-Qura).'}
          </p>
        </div>
      </section>
      <div className="max-w-5xl mx-auto px-6 sm:px-12 py-12">
        <HorairesClient />
      </div>
    </main>
  )
}
