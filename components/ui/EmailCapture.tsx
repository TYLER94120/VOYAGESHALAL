'use client'

import { useState } from 'react'

interface Props {
  title?: string
  subtitle?: string
  compact?: boolean
  source?: string
}

export default function EmailCapture({
  title = 'Recevez notre guide voyage halal gratuit',
  subtitle = '20+ pages : destinations, restaurants, conseils pratiques — directement dans votre boîte mail.',
  compact = false,
  source = 'homepage',
}: Props) {
  const [email, setEmail] = useState('')
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setStatus('loading')
    try {
      const res = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source }),
      })
      const data = await res.json()
      if (res.ok) {
        setStatus('success')
        setMessage('Guide envoyé ! Vérifiez votre boîte mail.')
        setEmail('')
      } else {
        setStatus('error')
        setMessage(data.error || 'Une erreur est survenue.')
      }
    } catch {
      setStatus('error')
      setMessage('Erreur réseau. Réessayez.')
    }
  }

  if (compact) {
    return (
      <div style={{ backgroundColor: '#f5f0e8' }} className="rounded-2xl p-5 border border-[#e8d5a3]/50">
        <p style={{ color: '#1a3a2a' }} className="font-bold text-sm mb-1">{title}</p>
        <p className="text-gray-500 text-xs mb-3">{subtitle}</p>
        {status === 'success' ? (
          <p style={{ color: '#1a6b3c' }} className="text-sm font-medium">{message}</p>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-2">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-[#1a3a2a]"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              style={{ backgroundColor: '#1a3a2a' }}
              className="w-full text-white text-sm font-bold py-2.5 rounded-full hover:opacity-90 transition-opacity disabled:opacity-50"
            >
              {status === 'loading' ? 'Envoi…' : 'Recevoir le guide gratuit'}
            </button>
            {status === 'error' && <p className="text-red-500 text-xs">{message}</p>}
          </form>
        )}
      </div>
    )
  }

  return (
    <section style={{ backgroundColor: '#1a3a2a' }} className="py-16 px-4">
      <div className="max-w-2xl mx-auto text-center">
        <p style={{ color: '#c9a870' }} className="text-xs font-semibold uppercase tracking-[0.2em] mb-3">
          Guide gratuit
        </p>
        <h2
          className="text-3xl font-bold text-white mb-4 leading-snug"
          style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
        >
          {title}
        </h2>
        <p className="text-white/50 text-sm leading-relaxed mb-8 max-w-lg mx-auto">
          {subtitle}
        </p>

        {status === 'success' ? (
          <div style={{ backgroundColor: '#2d5a3d' }} className="rounded-2xl px-8 py-6">
            <p className="text-white font-bold text-lg mb-1">Merci ! 🎉</p>
            <p className="text-white/70 text-sm">{message}</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex gap-0 max-w-md mx-auto">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
              required
              className="flex-1 px-5 py-4 bg-white border-0 rounded-l-2xl text-gray-900 text-base focus:outline-none"
            />
            <button
              type="submit"
              disabled={status === 'loading'}
              style={{ backgroundColor: '#c9a870', color: '#1a3a2a' }}
              className="px-6 py-4 rounded-r-2xl font-bold text-sm hover:opacity-90 transition-opacity whitespace-nowrap disabled:opacity-60"
            >
              {status === 'loading' ? 'Envoi…' : 'Recevoir gratuitement'}
            </button>
          </form>
        )}
        {status === 'error' && (
          <p className="text-red-300 text-sm mt-3">{message}</p>
        )}
        <p className="text-white/30 text-xs mt-4">Pas de spam. Désinscription en 1 clic.</p>
      </div>
    </section>
  )
}
