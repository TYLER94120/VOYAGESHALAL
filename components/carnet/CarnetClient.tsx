'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { track } from '@vercel/analytics'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import { getFavs, mergeFavs, toggleFav, FAVS_EVENT, getDeparts, setDepart, joursAvant, type Fav, type FavKind } from '@/lib/favorites'

const GREEN = '#1a3a2a'

const KIND_LABEL: Record<FavKind, { fr: string; en: string; icon: string }> = {
  ville: { fr: 'Destinations', en: 'Destinations', icon: '🌍' },
  resto: { fr: 'Restaurants', en: 'Restaurants', icon: '🍽️' },
  mosquee: { fr: 'Mosquées', en: 'Mosques', icon: '🕌' },
  spot: { fr: 'Coins prière', en: 'Prayer spots', icon: '🧭' },
  hotel: { fr: 'Hôtels', en: 'Hotels', icon: '🏨' },
  activite: { fr: 'Activités', en: 'Activities', icon: '🎯' },
}
// Clé du groupe « sans ville » (caractère invisible → jamais confondu avec un nom)
const AILLEURS = '\u200b'

export default function CarnetClient() {
  const { lang } = useLanguage()
  const en = lang === 'en'
  const [favs, setFavs] = useState<Fav[] | null>(null) // null = pas encore hydraté
  const [departs, setDeparts] = useState<Record<string, string>>({})
  const [email, setEmail] = useState('')
  const [syncMsg, setSyncMsg] = useState('')
  const [syncing, setSyncing] = useState(false)

  useEffect(() => {
    setFavs(getFavs()); setDeparts(getDeparts())
    const sync = () => { setFavs(getFavs()); setDeparts(getDeparts()) }
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

  // 🧳 LE CARNET SE RANGE PAR VILLE, PAS PAR TYPE.
  // « Ton Marrakech : 6 adresses » veut dire quelque chose ; « Restaurants
  // (6) » réparti sur quatre pays ne veut rien dire. Sur place, on ouvre sa
  // ville — et tout tient dans localStorage, donc ça marche sans réseau.
  const parVille = new Map<string, Fav[]>()
  for (const f of favs ?? []) {
    const cle = f.kind === 'ville' ? f.nom : (f.villeNom || AILLEURS)
    if (!parVille.has(cle)) parVille.set(cle, [])
    parVille.get(cle)!.push(f)
  }
  const villes = [...parVille.entries()]
    .map(([ville, items]) => ({ ville, items, depart: departs[ville] }))
    .sort((a, b) => {
      const ja = joursAvant(a.depart), jb = joursAvant(b.depart)
      // Un départ prévu passe devant, le plus proche en premier
      if (ja !== null && jb !== null) return ja - jb
      if (ja !== null) return -1
      if (jb !== null) return 1
      return b.items.length - a.items.length
    })

  return (
    <div className="max-w-2xl mx-auto px-4 pb-16">
      {/* Sync email = capture + multi-appareils */}
      <form onSubmit={syncByEmail} className="bg-white rounded-2xl border border-gray-200 p-4 mb-8 flex flex-col sm:flex-row gap-2">
        <input
          type="email" value={email} onChange={(e) => setEmail(e.target.value)} required
          placeholder={en ? 'your@email.com — sync across devices' : 'votre@email.com — synchroniser mes appareils'}
          className="flex-1 px-3 py-2.5 border border-gray-200 rounded-xl text-sm"
        />
        <button type="submit" disabled={syncing} className="text-white text-sm font-bold px-5 rounded-full disabled:opacity-50 inline-flex items-center justify-center min-h-[48px]" style={{ backgroundColor: GREEN }}>
          {syncing ? '…' : (en ? 'Sync my notebook' : 'Synchroniser mon carnet')}
        </button>
      </form>
      {syncMsg && <p className="text-sm mb-6 -mt-4" style={{ color: syncMsg.startsWith('✓') ? '#1a6b3c' : '#dc2626' }}>{syncMsg}</p>}

      {/* Export : tes spots restent à toi en toute circonstance (JSON) */}
      {favs !== null && favs.length > 0 && (
        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(favs, null, 2)], { type: 'application/json' })
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = 'mes-spots-voyageshalal.json'
            a.click()
            URL.revokeObjectURL(a.href)
          }}
          className="text-sm font-bold px-5 py-2.5 rounded-full mb-6 border"
          style={{ color: GREEN, borderColor: GREEN }}
        >
          ⬇️ {en ? 'Export my spots (JSON)' : 'Exporter mes spots (JSON)'}
        </button>
      )}

      {favs !== null && favs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3" aria-hidden>🤍</p>
          <p className="font-bold mb-1" style={{ color: GREEN }}>{en ? 'Your notebook is empty' : 'Votre carnet est vide'}</p>
          <p className="text-sm text-gray-500 mb-6">
            {en
              ? 'Tap the ❤️ on any city, restaurant or prayer spot to save it here.'
              : 'Touchez le ❤️ sur une ville, un restaurant ou un coin prière pour le retrouver ici.'}
          </p>
          <Link href="/destinations" className="text-white text-sm font-bold px-6 rounded-full inline-flex items-center justify-center min-h-[48px]" style={{ backgroundColor: GREEN }}>
            {en ? 'Explore destinations' : 'Explorer les destinations'}
          </Link>
        </div>
      )}

      {villes.map((v) => {
        const jours = joursAvant(v.depart)
        const nom = v.ville === AILLEURS ? (en ? 'Other saved places' : 'Autres adresses gardées') : v.ville
        return (
          <section key={v.ville} className="mb-8">
            <h2 className="font-bold text-lg mb-2" style={{ color: GREEN }}>
              {v.ville === AILLEURS ? '📌' : '📍'} {en ? `Your ${nom}` : `Ton ${nom}`}
              <span className="font-normal text-sm text-gray-500">
                {' '}· {v.items.length} {en ? (v.items.length > 1 ? 'places' : 'place') : (v.items.length > 1 ? 'adresses' : 'adresse')}
              </span>
            </h2>

            {/* ⏳ Compte à rebours — uniquement si un départ est indiqué.
                Un compteur est un compteur : aucun jugement, aucune pression. */}
            {v.ville !== AILLEURS && (
              <div className="bg-white rounded-2xl border border-gray-100 px-4 py-3 mb-3 flex items-center gap-3 flex-wrap">
                {jours !== null && jours >= 0 ? (
                  <span className="font-bold text-sm" style={{ color: '#8A6D1E' }}>
                    ⏳ {jours === 0
                      ? (en ? 'You leave today' : 'Tu pars aujourd\u2019hui')
                      : (en ? `Your trip in ${jours} day${jours > 1 ? 's' : ''}` : `Ton voyage dans ${jours} jour${jours > 1 ? 's' : ''}`)}
                  </span>
                ) : (
                  <span className="text-sm text-gray-500">🗓 {en ? 'Departure date?' : 'Date de départ ?'}</span>
                )}
                <input
                  type="date"
                  value={v.depart ?? ''}
                  onChange={(e) => setDepart(v.ville, e.target.value || null)}
                  className="text-sm border border-gray-200 rounded-xl px-3 min-h-[44px]"
                  aria-label={en ? `Departure date for ${nom}` : `Date de départ pour ${nom}`}
                />
                {v.depart && (
                  <button onClick={() => setDepart(v.ville, null)} className="text-xs text-gray-400 underline min-h-[44px] px-2">
                    {en ? 'Clear' : 'Effacer'}
                  </button>
                )}
              </div>
            )}

            <ul className="space-y-2">
              {v.items.map((f) => (
                <li key={f.id} className="flex items-center gap-2 bg-white rounded-2xl border border-gray-100 px-4 py-3">
                  <span className="text-lg" aria-hidden>{KIND_LABEL[f.kind].icon}</span>
                  <Link href={f.href} className="flex-1 min-w-0">
                    <span className="block font-semibold text-sm truncate" style={{ color: GREEN }}>{f.nom}</span>
                    <span className="block text-xs text-gray-400">{en ? KIND_LABEL[f.kind].en : KIND_LABEL[f.kind].fr}</span>
                  </Link>
                  <button
                    onClick={() => { toggleFav(f); setFavs(getFavs()) }}
                    aria-label={en ? 'Remove from notebook' : 'Retirer du carnet'}
                    className="text-gray-300 hover:text-red-400 text-sm px-2 min-h-[44px]"
                  >✕</button>
                </li>
              ))}
            </ul>
          </section>
        )
      })}
    </div>
  )
}
