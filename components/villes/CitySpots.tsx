'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CATEGORIES } from '@/lib/community'

// « Ce que la communauté partage à [Ville] » — spots réels autour du centre
// (API /api/spots). Si rien : invitation sobre, jamais de faux contenu.
interface Spot { id: string; nom: string; categorie?: string; confirmations?: number; vues?: number; itineraires?: number; auteurPseudo?: string }

export default function CitySpots({ lat, lng, villeNom, slug, en }: { lat: number; lng: number; villeNom: string; slug: string; en: boolean }) {
  const [spots, setSpots] = useState<Spot[] | null>(null)

  useEffect(() => {
    fetch(`/api/spots?lat=${lat}&lng=${lng}&radius=30`)
      .then((r) => r.json()).then((j) => setSpots((j.spots ?? []).slice(0, 6))).catch(() => setSpots([]))
  }, [lat, lng])

  const catInfo = (id?: string) => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[0]

  return (
    <div>
      {spots && spots.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: 10, marginBottom: 14 }}>
          {spots.map((s) => (
            <Link key={s.id} href={`/spot/${s.id}`} style={{ display: 'flex', alignItems: 'center', gap: 11, background: '#fff', border: '1px solid rgba(27,67,50,0.1)', borderRadius: 16, padding: '13px 15px', textDecoration: 'none', minHeight: 60 }}>
              <span style={{ fontSize: 23 }}>{catInfo(s.categorie).icon}</span>
              <span style={{ flex: 1, minWidth: 0 }}>
                <span style={{ display: 'block', fontWeight: 700, color: '#0b1a0f', fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.nom}</span>
                <span style={{ fontSize: 12.5, color: '#6b7280' }}>
                  {(s.confirmations ?? 0) > 0
                    ? `✅ ${s.confirmations} ${en ? 'confirmed' : 'confirmé'}${(s.confirmations ?? 0) > 1 ? 's' : ''}`
                    : (en ? '🕓 to confirm' : '🕓 à confirmer')}
                  {((s.vues ?? 0) + (s.itineraires ?? 0)) > 1 ? ` · 💫 ${(s.vues ?? 0) + (s.itineraires ?? 0)}` : ''}
                </span>
              </span>
              <span style={{ color: '#1b4332', fontWeight: 700 }}>→</span>
            </Link>
          ))}
        </div>
      )}
      {spots && spots.length === 0 && (
        <p style={{ fontSize: 14.5, color: '#6b7280', margin: '0 0 14px', lineHeight: 1.6 }}>
          {en
            ? `No community spot in ${villeNom} yet — be the FIRST, it all starts with you 🌱`
            : `Aucun spot communautaire à ${villeNom} pour l'instant — sois le PREMIER, tout commence avec toi 🌱`}
        </p>
      )}
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Link href={`/communaute/ajouter?ville=${slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 52, padding: '0 22px', borderRadius: 999, background: 'var(--or)', color: '#0b1a0f', fontWeight: 900, fontSize: 15, textDecoration: 'none' }}>
          ➕ {en ? 'Share a spot (30 s)' : 'Partager un spot (30 s)'}
        </Link>
        <Link href="/communaute" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 52, padding: '0 22px', borderRadius: 999, border: '1.5px solid rgba(27,67,50,0.3)', color: 'var(--foret)', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
          🤝 {en ? 'The community →' : 'La communauté →'}
        </Link>
      </div>
    </div>
  )
}
