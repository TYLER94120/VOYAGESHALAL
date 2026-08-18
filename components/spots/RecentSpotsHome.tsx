'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import { CATEGORIES, SEUIL_CONFIANCE } from '@/lib/community'
import type { PrayerSpot } from '@/lib/villeTypes'

// 💎 « Derniers spots partagés » sur la HOME — aperçu du feed, masqué si vide
// (aucun spot inventé, jamais de section vide).
export default function RecentSpotsHome() {
  const { lang } = useLanguage()
  const en = lang === 'en'
  const [spots, setSpots] = useState<PrayerSpot[]>([])

  useEffect(() => {
    fetch('/api/community/spots?limit=8')
      .then((r) => r.json())
      .then((j) => setSpots((j.spots ?? []).filter((s: PrayerSpot) => s.source === 'community' || s.auteurPseudo)))
      .catch(() => {})
  }, [])

  if (spots.length === 0) return null
  const catOf = (id?: string) => CATEGORIES.find((c) => c.id === (id ?? 'coin_priere')) ?? CATEGORIES[5]

  return (
    <section style={{ background: 'var(--nuit)', padding: '6px 0 20px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 10 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#fdfaf3', fontSize: 19, fontWeight: 800, margin: 0 }}>
            💎 {en ? 'Latest shared spots' : 'Derniers spots partagés'}
          </h2>
          <Link href="/trouvailles" style={{ color: 'var(--or)', fontWeight: 800, fontSize: 13.5, textDecoration: 'none', whiteSpace: 'nowrap' }}>
            {en ? 'See all →' : 'Tout voir →'}
          </Link>
        </div>
      </div>
      <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', gap: 10, overflowX: 'auto', padding: '0 16px 6px', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
        {spots.map((s) => {
          const c = catOf(s.categorie)
          const trusted = (s.confirmations ?? 0) >= SEUIL_CONFIANCE
          return (
            <Link key={s.id} href={`/spot/${s.id}`} style={{ flexShrink: 0, width: 200, borderRadius: 16, border: `1px solid ${trusted ? 'rgba(201,168,76,0.55)' : 'rgba(255,255,255,0.12)'}`, background: 'rgba(255,255,255,0.05)', padding: '12px 14px', textDecoration: 'none' }}>
              <span style={{ fontSize: 22 }}>{c.icon}</span>
              <p style={{ margin: '6px 0 0', color: '#fdfaf3', fontWeight: 800, fontSize: 14.5, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.nom}</p>
              <p style={{ margin: '2px 0 0', color: 'rgba(253,250,243,0.55)', fontSize: 12.5 }}>{s.villeNom}</p>
              {(s.confirmations ?? 0) > 0 && (
                <p style={{ margin: '5px 0 0', color: '#3BD17A', fontSize: 12, fontWeight: 700 }}>✅ {s.confirmations} {en ? 'confirmed' : 'confirmations'}</p>
              )}
            </Link>
          )
        })}
      </div>
    </section>
  )
}
