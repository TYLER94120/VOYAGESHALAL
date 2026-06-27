import type { Metadata } from 'next'
import HorairesClient from './HorairesClient'

export const metadata: Metadata = {
  title: "Heures de prière aujourd'hui — Toutes les villes du monde | VoyagesHalal.fr",
  description:
    "Horaires de prière en temps réel (Fajr, Dhuhr, Asr, Maghrib, Isha) pour les principales destinations halal du monde. Données certifiées Aladhan, mises à jour quotidiennement.",
}

export default function HorairesPrierePage() {
  return (
    <main style={{ backgroundColor: '#fdfaf3' }}>
      <section className="islamic-hero px-6 sm:px-16 pt-14 pb-16 text-center">
        <p style={{ color: '#c9a84c' }} className="text-xs font-semibold uppercase tracking-[0.25em] mb-4">
          Outil musulman
        </p>
        <h1
          className="text-4xl sm:text-5xl font-bold text-white mb-4"
          style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
        >
          Heures de prière <span className="gold-em">aujourd&apos;hui</span>
        </h1>
        <p className="text-white/60 max-w-2xl mx-auto">
          Horaires en temps réel pour les principales villes du monde — Fajr, Dhuhr, Asr, Maghrib,
          Isha. Données Aladhan (UOIF, Umm al-Qura).
        </p>
      </section>
      <div className="max-w-5xl mx-auto px-6 sm:px-12 py-12">
        <HorairesClient />
      </div>
    </main>
  )
}
