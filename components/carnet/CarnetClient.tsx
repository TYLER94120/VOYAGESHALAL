'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { track } from '@vercel/analytics'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import { getFavs, mergeFavs, toggleFav, FAVS_EVENT, type Fav, type FavKind } from '@/lib/favorites'

const GREEN = '#1a3a2a'

const KIND_LABEL: Record<FavKind, { fr: string; en: string; icon: string }> = {
  ville: { fr: 'Destinations', en: 'Destinations', icon: '🌍' },
  resto: { fr: 'Restaurants', en: 'Restaurants', icon: '🍽️' },
  mosquee: { fr: 'Mosquées', en: 'Mosques', icon: '🕌' },
  spot: { fr: 'Coins prière', en: 'Prayer spots', icon: '🧭' },
  hotel: { fr: 'Hôtels', en: 'Hotels', icon: '🏨' },
  activite: { fr: 'Activités', en: 'Activities', icon: '🎯' },
}
const KIND_ORDER: FavKind[] = ['ville', 'resto', 'mosquee', 'spot', 'hotel', 'activite']

export default function CarnetClient() {
  const { lang } = useLanguage()
  const en = lang === 'en'
  const [favs, setFavs] = useState<Fav[] | null>(null) // null = pas encore hydraté
  const [email, setEmail] = useState('')
  const [syncMsg, setSyncMsg] = useState('')
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    setFavs(getFavs())
    const sync = () => setFavs(getFavs())
    window.addEventListener(FAVS_EVENT, sync)
    // Email mémorisé → re-sync silencieuse au chargement
    const saved = localStorage.getItem('vh_carnet_email')
    if (saved) { setEmail(saved); void pullRemote(saved, true) }
    return () => window.removeEventListener(FAVS_EVENT, sync)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function pullRemote(mail: string, silent = false) {
    try {
      const res = await fetch(`/api/favorites?email=${encodeURIComponent(mail)}`)
      if (!res.ok) return
      const data = await res.json()
      if (Array.isArray(data.items) && data.items.length) setFavs(mergeFavs(data.items))
    } catch { if (!silent) setSyncMsg(en ? 'Sync failed.' : 'Synchronisation impossible.') }
  }

  async function syncByEmail(e: React.FormEvent) {
    e.preventDefault()
    if (!email) return
    setSyncing(true); setSyncMsg('')
    try {
      await pullRemote(email, true)
      const res = await fetch('/api/favorites', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, items: getFavs() }),
      })
      if (!res.ok) throw new Error()
      localStorage.setItem('vh_carnet_email', email)
      // Capture Phase 1 : le carnet devient une relation (email → Brevo)
      fetch('/api/waitlist', {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, source: 'carnet', lang }),
      }).catch(() => {})
      try { track('lead', { type: 'email', source: 'carnet' }) } catch { /* best-effort */ }
      setSyncMsg(en ? '✓ Notebook synced — find it on any device with this email.' : '✓ Carnet synchronisé — retrouvez-le sur tous vos appareils avec cet email.')
    } catch {
      setSyncMsg(en ? 'Sync failed. Please retry.' : 'La synchronisation a échoué. Réessayez.')
    } finally { setSyncing(false) }
  }

  const grouped = KIND_ORDER
    .map((k) => ({ kind: k, items: (favs ?? []).filter((f) => f.kind === k) }))
    .filter((g) => g.items.length > 0)

  return (
    <div className="max-w-2xl mx-auto px-4 pb-16">
      {/* Sync email = capture + multi-appareils */}
      <form onSubmit={syncByEmail} className="bg-white rounded-2xl border border-gray-200 p-4 mb-8 flex flex-col sm:flex-row gap-2">
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
          placeholder={en ? 'your@email.com — sync across devices' : 'votre@email.com — synchroniser mes appareils'}
          className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
        />
        <button type="submit" disabled={syncing} className="text-white text-sm font-bold px-5 py-2.5 rounded-full disabled:opacity-50" style={{ backgroundColor: GREEN }}>
          {syncing ? '…' : (en ? 'Sync my notebook' : 'Synchroniser mon carnet')}
        </button>
      </form>
      {syncMsg && <p className="text-sm mb-6 -mt-4" style={{ color: syncMsg.startsWith('✓') ? '#1a6b3c' : '#dc2626' }}>{syncMsg}</p>}

      {favs !== null && favs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3" aria-hidden>🤍</p>
          <p className="font-bold mb-1" style={{ color: GREEN }}>{en ? 'Your notebook is empty' : 'Votre carnet est vide'}</p>
          <p className="text-sm text-gray-500 mb-6">
            {en
              ? 'Tap the ❤️ on any city, restaurant or prayer spot to save it here.'
              : 'Touchez le ❤️ sur une ville, un restaurant ou un coin prière pour le retrouver ici.'}
          </p>
          <Link href="/destinations" className="text-white text-sm font-bold px-6 py-3 rounded-full" style={{ backgroundColor: GREEN }}>
            {en ? 'Explore destinations' : 'Explorer les destinations'}
          </Link>
        </div>
      )}

      {grouped.map((g) => (
        <section key={g.kind} className="mb-8">
          <h2 className="font-bold text-lg mb-3" style={{ color: GREEN }}>
            {KIND_LABEL[g.kind].icon} {en ? KIND_LABEL[g.kind].en : KIND_LABEL[g.kind].fr} ({g.items.length})
          </h2>
          <ul className="space-y-2">
            {g.items.map((f) => (
              <li key={f.id} className="flex items-center gap-2 bg-white rounded-2xl border border-gray-100 px-4 py-3">
                <Link href={f.href} className="flex-1 min-w-0">
                  <span className="block font-semibold text-sm truncate" style={{ color: GREEN }}>{f.nom}</span>
                  {f.villeNom && <span className="block text-xs text-gray-400">{f.villeNom}</span>}
                </Link>
                <button
                  onClick={() => { toggleFav(f); setFavs(getFavs()) }}
                  aria-label={en ? 'Remove from notebook' : 'Retirer du carnet'}
                  className="text-gray-300 hover:text-red-400 text-sm px-2"
                >✕</button>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  )
}
