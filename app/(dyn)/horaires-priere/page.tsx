import type { Metadata } from 'next'
import HorairesClient from './HorairesClient'
import IslamicPattern from '@/components/ui/IslamicPattern'
import { getDomainSEO } from '@/lib/domain'
import BoutonRetour from '@/components/layout/BoutonRetour'

export async function generateMetadata(): Promise<Metadata> {
  const { isEN, siteUrl } = await getDomainSEO()
  return {
    title: isEN
      ? "Prayer times today — Every city in the world"
      : "Heures de prière aujourd'hui — Toutes les villes du monde",
    description: isEN
      ? 'Real-time prayer times (Fajr, Dhuhr, Asr, Maghrib, Isha) for the main halal destinations worldwide. Aladhan data, updated daily.'
      : "Fajr, Dhuhr, Asr, Maghrib et Isha en temps réel pour les grandes destinations halal. Données Aladhan, mises à jour chaque jour.",
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
    <main style={{ backgroundColor: '#fdfaf3', minHeight: '100svh' }}>
      {/* ‹ correction 5 (retour, pile réelle) + correction 6 : le raccourci
          Qibla vit en haut à droite de la page Prière — pilule dorée
          discrète, boussole + libellé, cible ≥ 52 px. */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 10px' }}>
        <BoutonRetour clair />
        <a href="/qibla" style={{ display: 'inline-flex', alignItems: 'center', gap: 9, minHeight: 52, padding: '0 18px', borderRadius: 999, background: 'rgba(201,168,76,0.14)', border: '1px solid rgba(201,168,76,0.4)', color: '#8F7229', fontSize: 15, fontWeight: 700, textDecoration: 'none' }}>
          <svg viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="9" /><path d="M15.8 8.2l-2.1 5.5-5.5 2.1 2.1-5.5z" />
          </svg>
          {en ? 'Qibla' : 'Qibla'}
        </a>
      </div>
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
