import type { Metadata } from 'next'
import Link from 'next/link'
import { getDomainSEO } from '@/lib/domain'

export const metadata: Metadata = {
  title: 'Contact',
  description: 'Contactez l\'équipe Voyages Halal : questions, partenariats, signaler un restaurant ou une mosquée.',
}

export default async function ContactPage() {
  const { isEN: en } = await getDomainSEO()
  return (
    <main style={{ backgroundColor: '#faf8f4' }} className="min-h-screen">
      {/* Hero */}
      <section style={{ backgroundColor: '#1a3a2a' }} className="px-8 sm:px-16 pt-16 pb-20">
        <p style={{ color: '#c9a870' }} className="text-xs font-semibold uppercase tracking-[0.2em] mb-5">
          Contact
        </p>
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5 max-w-2xl"
          style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
        >
          {en ? 'Contact VoyagesHalal.fr' : 'Contactez Voyages Halal'}
        </h1>
        <p className="text-white/50 text-base max-w-lg leading-relaxed">
          {en ? 'A question, a partnership, reporting a restaurant or mosque — our team replies within 48h.' : 'Une question, un partenariat, signaler un restaurant ou une mosquée — notre équipe vous répond sous 48h.'}
        </p>
      </section>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 px-8 sm:px-16 py-3">
        <nav className="flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-[#1a3a2a]">{en ? 'Home' : 'Accueil'}</Link>
          <span>›</span>
          <span className="text-gray-700">Contact</span>
        </nav>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-14 grid grid-cols-1 lg:grid-cols-2 gap-16">
        {/* Form */}
        <form className="space-y-6">
          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.15em] text-gray-500 mb-2">
              {en ? 'Your name' : 'Votre nom'}
            </label>
            <input
              type="text"
              placeholder="Mohammed Al-Rashid"
              className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a2a] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.15em] text-gray-500 mb-2">
              {en ? 'Email' : 'E-mail'}
            </label>
            <input
              type="email"
              placeholder="email@exemple.com"
              className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a2a] focus:border-transparent"
            />
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.15em] text-gray-500 mb-2">
              {en ? 'Subject' : 'Sujet'}
            </label>
            <select className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a2a] focus:border-transparent appearance-none">
              <option>{en ? 'General question' : 'Question générale'}</option>
              <option>{en ? 'Report a restaurant' : 'Signaler un restaurant'}</option>
              <option>{en ? 'Report a mosque' : 'Signaler une mosquée'}</option>
              <option>{en ? 'Partnership' : 'Partenariat'}</option>
              <option>{en ? 'Other' : 'Autre'}</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase tracking-[0.15em] text-gray-500 mb-2">
              {en ? 'Message' : 'Message'}
            </label>
            <textarea
              rows={5}
              placeholder={en ? 'Your message...' : 'Votre message...'}
              className="w-full px-4 py-3.5 bg-white border border-gray-200 rounded-xl text-gray-900 text-base focus:outline-none focus:ring-2 focus:ring-[#1a3a2a] focus:border-transparent resize-none"
            />
          </div>

          <button
            type="submit"
            style={{ backgroundColor: '#1a3a2a' }}
            className="w-full sm:w-auto text-white font-bold text-sm px-8 py-4 rounded-full hover:opacity-90 transition-opacity"
          >
            {en ? 'Send message' : 'Envoyer le message'}
          </button>
        </form>

        {/* Info */}
        <div>
          <h2
            className="text-3xl font-bold mb-5 leading-snug"
            style={{ fontFamily: 'var(--font-playfair), Georgia, serif', color: '#1a3a2a' }}
          >
            {en ? 'Let\u2019s talk about your trip' : 'Parlons de votre projet de voyage'}
          </h2>
          <p className="text-gray-500 text-sm leading-relaxed mb-10">
            {en ? 'VoyagesHalal was born from a real need: helping Muslims worldwide travel with peace of mind, in line with their faith. Our team is here for you.' : 'Voyages Halal est né d\u2019un besoin réel : aider les musulmans du monde entier à voyager sereinement en accord avec leur foi. Notre équipe est à votre écoute.'}
          </p>

          <div className="space-y-6">
            {[
              {
                icon: '✉️',
                title: 'E-mail',
                detail: 'contact@voyageshalal.fr',
              },
              {
                icon: '💬',
                title: 'WhatsApp',
                detail: en ? '+33 · Reply within 24h' : '+33 · Réponse sous 24h',
              },
              {
                icon: '🤝',
                title: en ? 'Partnerships' : 'Partenariats',
                detail: en ? 'Restaurants, hotels, travel agencies' : 'Restaurants, hôtels, agences de voyage',
              },
              {
                icon: '📍',
                title: en ? 'Report a place' : 'Signaler un lieu',
                detail: en ? 'Help the community by adding a restaurant or mosque' : 'Aidez la communauté en ajoutant un restaurant ou une mosquée',
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4">
                <div
                  style={{ backgroundColor: '#f5f0e8' }}
                  className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-lg"
                >
                  {item.icon}
                </div>
                <div>
                  <div className="font-semibold text-gray-900 text-sm">{item.title}</div>
                  <div className="text-gray-500 text-sm mt-0.5">{item.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
