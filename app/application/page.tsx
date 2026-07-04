'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { FormEvent } from 'react'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import FollowInstall from '@/components/capture/FollowInstall'

const features = [
  { icon: '🧭', title: 'Boussole Qibla', titleEn: 'Qibla compass', description: 'Direction de La Mecque en temps réel, partout dans le monde, même sans connexion internet.', descriptionEn: 'Real-time direction to Mecca, anywhere in the world, even offline.' },
  { icon: '🕌', title: 'Horaires de prière', titleEn: 'Prayer times', description: 'Calcul automatique par GPS selon votre position exacte. Notifications configurables.', descriptionEn: 'Automatic GPS-based calculation for your exact location. Configurable notifications.' },
  { icon: '🍽', title: 'Restaurants halal', titleEn: 'Halal restaurants', description: 'Trouvez les restaurants halal autour de vous avec avis et photos.', descriptionEn: 'Find halal restaurants around you with reviews and photos.' },
  { icon: '📔', title: 'Carnet de voyage', titleEn: 'Travel notebook', description: 'Planifiez et organisez vos voyages halal : itinéraires, lieux sauvegardés, notes.', descriptionEn: 'Plan and organize your halal trips: itineraries, saved places, notes.' },
  { icon: '🗺', title: 'Carte interactive', titleEn: 'Interactive map', description: "Mosquées, restaurants et points d'intérêt halal sur une carte intuitive.", descriptionEn: 'Mosques, restaurants and halal points of interest on an intuitive map.' },
  { icon: '🔔', title: 'Rappels prière', titleEn: 'Prayer reminders', description: 'Notifications intelligentes adaptées à votre fuseau horaire pour ne jamais manquer une prière.', descriptionEn: 'Smart notifications tuned to your time zone so you never miss a prayer.' },
]

const stats = [
  { value: 'Bientôt', valueEn: 'Soon', label: 'Disponible sur iOS', labelEn: 'Available on iOS' },
  { value: 'Bientôt', valueEn: 'Soon', label: 'Disponible sur Android', labelEn: 'Available on Android' },
  { value: '100%', valueEn: '100%', label: 'Gratuit', labelEn: 'Free' },
  { value: '0', valueEn: '0', label: 'Publicités', labelEn: 'Ads' },
]

export default function ApplicationPage() {
  const { lang } = useLanguage()
  const en = lang === 'en'
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    if (!email || status === 'loading') return

    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await res.json()

      if (res.ok) {
        setStatus('success')
        setMessage(data.message || 'Inscription confirmée !')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Une erreur est survenue.')
      }
    } catch {
      setStatus('error')
      setMessage('Impossible de contacter le serveur. Réessayez.')
    }
  }

  return (
    <>
      <section className="bg-gradient-to-br from-emerald-900 to-teal-800 text-white py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-white/10 border border-white/20 rounded-full px-4 py-2 text-sm mb-8">
            <span>🚀</span>
            <span>{en ? 'In development — launching 2026' : 'En cours de développement — sortie prévue 2026'}</span>
          </div>
          <div className="text-6xl mb-6">📱</div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">
            {en ? <>The app that changes<br /><span className="text-emerald-300">halal travel</span></> : <>L&apos;application qui change<br /><span className="text-emerald-300">le voyage halal</span></>}
          </h1>
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto mb-10">
            {en ? 'Everything you need to travel halal, in your pocket. Qibla, prayer times, halal restaurants and a travel notebook.' : 'Tout ce dont vous avez besoin pour voyager halal dans votre poche. Qibla, horaires de prière, restaurants halal et carnet de voyage.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a href="#waitlist" className="bg-white text-emerald-800 px-8 py-4 rounded-full font-bold text-lg hover:bg-emerald-50 transition-colors">
              {en ? 'Join the waitlist →' : 'Rejoindre la liste d\u2019attente →'}
            </a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8">
            {stats.map((s) => (
              <div key={s.label} className="bg-white/10 rounded-2xl p-4">
                <div className="text-xl font-bold text-emerald-300">{en ? s.valueEn : s.value}</div>
                <div className="text-xs text-emerald-200 mt-1">{en ? s.labelEn : s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20" id="fonctionnalites">
        <div className="text-center mb-12">
          <p className="text-emerald-600 font-semibold text-sm uppercase tracking-wide mb-2">{en ? 'Features' : 'Fonctionnalités'}</p>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">{en ? 'Everything for halal travel' : 'Tout pour voyager halal'}</h2>
          <p className="text-gray-500 max-w-xl mx-auto">{en ? 'An app built by Muslim travelers, for Muslim travelers.' : 'Une application conçue par des voyageurs musulmans, pour des voyageurs musulmans.'}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">{en ? feature.titleEn : feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{en ? feature.descriptionEn : feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-br from-gray-50 to-emerald-50 py-20" id="waitlist">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="text-4xl mb-4">🎯</div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">{en ? 'Be among the first' : 'Soyez parmi les premiers'}</h2>
          <p className="text-gray-500 mb-8">
            {en ? 'Sign up now to be notified first at launch, get beta access and receive our exclusive updates.' : 'Inscrivez-vous dès maintenant pour être notifié en priorité au lancement, bénéficier de l\u2019accès bêta et recevoir nos mises à jour exclusives.'}
          </p>

          {status === 'success' ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
              <div className="text-3xl mb-2">✅</div>
              <p className="font-bold text-emerald-800 text-lg">{message}</p>
              <p className="text-emerald-600 text-sm mt-2">{en ? 'You\u2019ll get an email as soon as the app is available.' : 'Vous recevrez un email dès que l\u2019application sera disponible.'}</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-3">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                required
                disabled={status === 'loading'}
                className="flex-1 px-4 py-3 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-gray-900 disabled:opacity-60"
              />
              <button
                type="submit"
                disabled={status === 'loading' || !email}
                className="bg-emerald-600 text-white px-6 py-3 rounded-full font-semibold hover:bg-emerald-700 transition-colors whitespace-nowrap disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {status === 'loading' ? (en ? 'Signing up...' : 'Inscription...') : (en ? 'Sign me up' : "M'inscrire")}
              </button>
            </form>
          )}

          {status === 'error' && (
            <p className="text-red-500 text-sm mt-3">{message}</p>
          )}

          <p className="text-xs text-gray-400 mt-4">
            Aucun spam. Désinscription en un clic. Vos données ne sont jamais revendues.
          </p>
        </div>
      </section>

      <section className="max-w-4xl mx-auto px-4 py-12">
        <FollowInstall source="application" />
      </section>

      <section className="text-center py-12">
        <Link href="/destinations" className="text-emerald-600 font-medium hover:underline">
          ← Explorer les destinations halal
        </Link>
      </section>
    </>
  )
}
