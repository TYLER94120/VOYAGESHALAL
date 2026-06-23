import type { Metadata } from 'next'
import Link from 'next/link'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Application Voyage Halal — Qibla, Prières & Carnet de Voyage',
  description:
    'Téléchargez l\'application Voyages Halal : boussole Qibla, horaires de prière par GPS, carnet de voyage et restaurants halal à proximité. Gratuit, iOS & Android.',
  path: '/application',
})

const features = [
  { icon: '🧭', title: 'Boussole Qibla', description: 'Direction de La Mecque en temps réel, partout dans le monde.' },
  { icon: '🕌', title: 'Horaires de prière', description: 'Calcul automatique par GPS selon votre position exacte.' },
  { icon: '🍽', title: 'Restaurants halal', description: 'Trouvez les restaurants halal certifiés autour de vous.' },
  { icon: '📔', title: 'Carnet de voyage', description: 'Planifiez et organisez vos voyages halal en un endroit.' },
  { icon: '🗺', title: 'Carte interactive', description: 'Mosquées, restaurants et points d\'intérêt sur une carte.' },
  { icon: '🔔', title: 'Rappels prière', description: 'Notifications pour ne jamais manquer une prière en voyage.' },
]

export default function ApplicationPage() {
  return (
    <>
      <section className="bg-gradient-to-br from-emerald-900 to-teal-800 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="text-6xl mb-6">📱</div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">
            L&apos;application qui change<br />
            <span className="text-emerald-300">le voyage halal</span>
          </h1>
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto mb-10">
            Tout ce dont vous avez besoin pour voyager halal dans votre poche.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a href="#waitlist" className="bg-white text-emerald-800 px-8 py-4 rounded-full font-bold text-lg hover:bg-emerald-50 transition-colors">
              Rejoindre la liste d&apos;attente
            </a>
          </div>
          <p className="text-emerald-300 text-sm">✓ Gratuit · ✓ iOS & Android · ✓ Sans publicité</p>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20" id="fonctionnalites">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Tout pour voyager halal</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Une application pensée par des voyageurs musulmans, pour des voyageurs musulmans.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gray-50 py-20" id="waitlist">
        <div className="max-w-lg mx-auto px-4 text-center">
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Soyez les premiers informés</h2>
          <p className="text-gray-500 mb-8">L&apos;application est en développement. Inscrivez-vous pour être parmi les premiers à la tester.</p>
          <form className="flex flex-col sm:flex-row gap-3">
            <input type="email" placeholder="votre@email.com" className="flex-1 px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900" />
            <button type="submit" className="bg-emerald-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-emerald-700 transition-colors whitespace-nowrap">M&apos;inscrire</button>
          </form>
          <p className="text-xs text-gray-400 mt-4">Aucun spam. Désinscription en un clic.</p>
        </div>
      </section>

      <section className="text-center py-12">
        <Link href="/destinations" className="text-emerald-600 font-medium hover:underline">← Explorer les destinations halal</Link>
      </section>
    </>
  )
}
