import Link from 'next/link'

interface Props {
  variant?: 'banner' | 'section'
}

export default function AppCTA({ variant = 'section' }: Props) {
  if (variant === 'banner') {
    return (
      <div className="bg-emerald-600 text-white py-4 px-6">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm font-medium">🌙 Découvrez notre application : Qibla, horaires de prière, carnet de voyage</p>
          <Link href="/application" className="bg-white text-emerald-700 px-4 py-1.5 rounded-full text-sm font-semibold hover:bg-emerald-50 transition-colors whitespace-nowrap">
            Télécharger gratuitement
          </Link>
        </div>
      </div>
    )
  }

  return (
    <section className="bg-gradient-to-br from-emerald-600 to-teal-700 rounded-3xl p-8 sm:p-12 text-center text-white">
      <div className="text-4xl mb-4">📱</div>
      <h2 className="text-2xl sm:text-3xl font-bold mb-3">L&apos;application Voyages Halal</h2>
      <p className="text-emerald-100 max-w-xl mx-auto mb-8">
        Boussole Qibla, horaires de prière par GPS, carnet de voyage, restaurants halal à proximité — tout ce dont vous avez besoin dans votre poche.
      </p>
      <div className="flex flex-col sm:flex-row gap-4 justify-center">
        <Link href="/application" className="bg-white text-emerald-700 px-8 py-3 rounded-full font-bold hover:bg-emerald-50 transition-colors">
          Découvrir l&apos;application
        </Link>
        <Link href="/application#waitlist" className="border-2 border-white/50 text-white px-8 py-3 rounded-full font-semibold hover:border-white transition-colors">
          Rejoindre la liste d&apos;attente
        </Link>
      </div>
      <div className="mt-8 flex justify-center gap-8 text-sm text-emerald-200">
        <span>✓ 100% gratuit</span>
        <span>✓ iOS & Android</span>
        <span>✓ Sans publicité</span>
      </div>
    </section>
  )
}
