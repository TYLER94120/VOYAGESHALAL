import type { Metadata } from 'next'
import HorairesClient from './HorairesClient'

export const metadata: Metadata = {
  title: "Heures de prière aujourd'hui — Toutes les villes du monde | VoyagesHalal.fr",
  description:
    "Horaires de prière en temps réel (Fajr, Dhuhr, Asr, Maghrib, Isha) pour les principales destinations halal du monde. Données certifiées Aladhan, mises à jour quotidiennement.",
}

export default function HorairesPrierePage() {
  return (
    <main className="page-container max-w-5xl mx-auto px-6 sm:px-12 py-12">
      <h1
        className="text-4xl sm:text-5xl font-bold mb-3"
        style={{ color: '#1a3a2a', fontFamily: 'var(--font-playfair), Georgia, serif' }}
      >
        🕌 Heures de prière aujourd&apos;hui
      </h1>
      <p className="text-gray-500 mb-8 max-w-2xl">
        Sélectionnez une ville pour obtenir les horaires de prière en temps réel. Les horaires sont
        fournis par Aladhan.com et calculés selon les méthodes reconnues (UOIF, Umm al-Qura).
      </p>
      <HorairesClient />
    </main>
  )
}
