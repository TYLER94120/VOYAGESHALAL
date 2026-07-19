'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CATEGORIES } from '@/lib/community'
import { useInstantPosition } from '@/lib/useInstantPosition'
import { useLanguage } from '@/components/i18n/LanguageProvider'

// BLOC 6 — « Spots partagés près de toi » sur la HOME. Masqué si aucun spot
// (jamais de section vide). Hauteur stable une fois affichée.
interface NearSpot { id: string; nom: string; distanceKm?: number; categorie?: string; villeNom?: string }

export default function NearbySpotsHome() {
  const { lang } = useLanguage()
  const en = lang === 'en'
  const { pos } = useInstantPosition(en)
  const [spots, setSpots] = useState<NearSpot[]>([])

  useEffect(() => {
    if (!pos) return
    fetch(`/api/spots?lat=${pos.lat}&lng=${pos.lng}&radius=40`)
      .then((r) => r.json()).then((j) => setSpots((j.spots ?? []).slice(0, 4))).catch(() => {})
  }, [pos])

  if (spots.length === 0) return null
  const catInfo = (id?: string) => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0]

  return (
    <section style={{ background: 'var(--creme, #FDFAF3)', padding: '34px 16px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, color: '#0b1a0f', margin: 0 }}>
            🤝 {en ? 'Shared spots near you' : 'Spots partagés près de toi'}
          </h2>
          <Link href="/communaute" style={{ color: '#1b4332', fontWeight: 700, fontSize: 14, whiteSpace: 'nowrap' }}>
            {en ? 'Community →' : 'Communauté →'}
          </Link>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 10 }}>
          {spots.map((s) => (
            <Link key={s.id} href={`/spot/${s.id}`} style={{ display: 'flex', alignItems: 'center', gap: 12, background: '#fff', borderRadius: 16, border: '1px solid rgba(27,67,50,0.1)', padding: '14px 16px', textDecoration: 'none', minHeight: 56 }}>
              <span style={{ fontSize: 24 }}>{catInfo(s.categorie).icon}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontWeight: 700, color: '#0b1a0f', fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.nom}</span>
                <span style={{ fontSize: 13, color: '#6b7280' }}>{s.distanceKm != null ? `${s.distanceKm} km` : s.villeNom}</span>
              </span>
              <span style={{ color: '#1b4332', fontWeight: 700 }}>→</span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
