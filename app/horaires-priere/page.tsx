import type { Metadata } from 'next'
import HorairesClient from './HorairesClient'
import IslamicPattern from '@/components/ui/IslamicPattern'

export const metadata: Metadata = {
  title: "Heures de prière aujourd'hui — Toutes les villes du monde",
  description:
    "Horaires de prière en temps réel (Fajr, Dhuhr, Asr, Maghrib, Isha) pour les principales destinations halal du monde. Données certifiées Aladhan, mises à jour quotidiennement.",
}

export default function HorairesPrierePage() {
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
            Heures de prière <span className="gold-em">aujourd&apos;hui</span>
          </h1>
          <p className="text-white/60 max-w-2xl mx-auto">
            Horaires en temps réel pour les principales villes du monde — Fajr, Dhuhr, Asr, Maghrib,
            Isha. Données Aladhan (UOIF, Umm al-Qura).
          </p>
        </div>
      </section>
      <div className="max-w-5xl mx-auto px-6 sm:px-12 py-12">
        <HorairesClient />
      </div>
    </main>
  )
}
