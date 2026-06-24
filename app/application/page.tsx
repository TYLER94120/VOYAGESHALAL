'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { FormEvent } from 'react'

const features = [
  { icon: '🧭', title: 'Boussole Qibla', description: 'Direction de La Mecque en temps réel, partout dans le monde, même sans connexion internet.' },
  { icon: '🕌', title: 'Horaires de prière', description: 'Calcul automatique par GPS selon votre position exacte. Notifications configurables.' },
  { icon: '🍽', title: 'Restaurants halal', description: 'Trouvez les restaurants halal certifiés autour de vous avec avis et photos.' },
  { icon: '📔', title: 'Carnet de voyage', description: 'Planifiez et organisez vos voyages halal : itinéraires, lieux sauvegardés, notes.' },
  { icon: '🗺', title: 'Carte interactive', description: "Mosquées, restaurants et points d'intérêt halal sur une carte intuitive." },
  { icon: '🔔', title: 'Rappels prière', description: 'Notifications intelligentes adaptées à votre fuseau horaire pour ne jamais manquer une prière.' },
]

const stats = [
  { value: 'Bientôt', label: 'Disponible sur iOS' },
  { value: 'Bientôt', label: 'Disponible sur Android' },
  { value: '100%', label: 'Gratuit' },
  { value: '0', label: 'Publicités' },
]

export default function ApplicationPage() {
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
            <span>En cours de développement — sortie prévue 2026</span>
          </div>
          <div className="text-6xl mb-6">📱</div>
          <h1 className="text-4xl sm:text-5xl font-extrabold mb-6">
            L&apos;application qui change<br />
            <span className="text-emerald-300">le voyage halal</span>
          </h1>
          <p className="text-xl text-emerald-100 max-w-2xl mx-auto mb-10">
            Tout ce dont vous avez besoin pour voyager halal dans votre poche.
            Qibla, horaires de prière, restaurants halal certifiés et carnet de voyage.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <a href="#waitlist" className="bg-white text-emerald-800 px-8 py-4 rounded-full font-bold text-lg hover:bg-emerald-50 transition-colors">
              Rejoindre la liste d&apos;attente →
            </a>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 mt-8">
            {stats.map((s) => (
              <div key={s.label} className="bg-white/10 rounded-2xl p-4">
                <div className="text-xl font-bold text-emerald-300">{s.value}</div>
                <div className="text-xs text-emerald-200 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20" id="fonctionnalites">
        <div className="text-center mb-12">
          <p className="text-emerald-600 font-semibold text-sm uppercase tracking-wide mb-2">Fonctionnalités</p>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Tout pour voyager halal</h2>
          <p className="text-gray-500 max-w-xl mx-auto">Une application conçue par des voyageurs musulmans, pour des voyageurs musulmans.</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {features.map((feature) => (
            <div key={feature.title} className="bg-white border border-gray-100 rounded-2xl p-6 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300">
              <div className="text-3xl mb-4">{feature.icon}</div>
              <h3 className="font-bold text-lg text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-gray-500 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="bg-gradient-to-br from-gray-50 to-emerald-50 py-20" id="waitlist">
        <div className="max-w-lg mx-auto px-4 text-center">
          <div className="text-4xl mb-4">🎯</div>
          <h2 className="text-3xl font-extrabold text-gray-900 mb-4">Soyez parmi les premiers</h2>
          <p className="text-gray-500 mb-8">
            Inscrivez-vous dès maintenant pour être notifié en priorité au lancement,
            bénéficier de l&apos;accès bêta et recevoir nos mises à jour exclusives.
          </p>

          {status === 'success' ? (
            <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6">
              <div className="text-3xl mb-2">✅</div>
              <p className="font-bold text-emerald-800 text-lg">{message}</p>
              <p className="text-emerald-600 text-sm mt-2">Vous recevrez un email dès que l&apos;application sera disponible.</p>
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
                {status === 'loading' ? 'Inscription...' : "M'inscrire"}
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

      <section className="text-center py-12">
        <Link href="/destinations" className="text-emerald-600 font-medium hover:underline">
          ← Explorer les destinations halal
        </Link>
      </section>
    </>
  )
}
