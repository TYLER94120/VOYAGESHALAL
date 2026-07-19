'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { CATEGORIES, NIVEAUX, type FeedItem } from '@/lib/community'
import { useCommunity } from '@/lib/useCommunity'
import { useInstantPosition } from '@/lib/useInstantPosition'
import { useLanguage } from '@/components/i18n/LanguageProvider'

// Hub 🤝 Communauté : feed vivant, top contributeurs, spots près de toi,
// mon impact. Le CTA « + Ajouter un spot » domine (1 action principale).

const catInfo = (id: string) => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[4]
function ago(date: string, en: boolean): string {
  const s = Math.max(1, Math.floor((Date.now() - new Date(date).getTime()) / 1000))
  if (s < 3600) return en ? `${Math.floor(s / 60)} min ago` : `il y a ${Math.max(1, Math.floor(s / 60))} min`
  if (s < 86400) return en ? `${Math.floor(s / 3600)} h ago` : `il y a ${Math.floor(s / 3600)} h`
  return en ? `${Math.floor(s / 86400)} d ago` : `il y a ${Math.floor(s / 86400)} j`
}

interface NearSpot { id: string; nom: string; sub?: string; distanceKm?: number; villeSlug: string; slug: string; categorie?: string; vues?: number; itineraires?: number }

export default function HubClient() {
  const { lang } = useLanguage()
  const en = lang === 'en'
  const { me, loaded } = useCommunity()
  const { pos } = useInstantPosition(en)
  const [feed, setFeed] = useState<FeedItem[]>([])
  const [top, setTop] = useState<{ pseudo: string; points: number }[]>([])
  const [near, setNear] = useState<NearSpot[]>([])

  useEffect(() => {
    fetch('/api/community/feed').then((r) => r.json()).then((j) => setFeed(j.feed ?? [])).catch(() => {})
    fetch('/api/community/leaderboard').then((r) => r.json()).then((j) => setTop(j.top ?? [])).catch(() => {})
  }, [])
  useEffect(() => {
    if (!pos) return
    fetch(`/api/spots?lat=${pos.lat}&lng=${pos.lng}&radius=30`).then((r) => r.json())
      .then((j) => setNear((j.spots ?? []).slice(0, 6))).catch(() => {})
  }, [pos])

  const card = { background: '#fff', borderRadius: 18, border: '1px solid rgba(27,67,50,0.1)', padding: 18 } as const

  return (
    <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 16px 70px' }}>
      {/* CTA dominant */}
      <Link href="/communaute/ajouter" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, minHeight: 60, borderRadius: 20, background: 'var(--or)', color: '#0b1a0f', fontWeight: 900, fontSize: 17, textDecoration: 'none', margin: '18px 0', boxShadow: '0 8px 26px rgba(201,168,76,0.35)' }}>
        ➕ {en ? 'Add a spot (30 s)' : 'Ajouter un spot (30 s)'}
      </Link>

      {/* Mon impact (connecté) */}
      {loaded && me && (
        <div style={{ ...card, background: '#0b1a0f', border: 'none', marginBottom: 18, textAlign: 'center' }}>
          <p style={{ color: '#C9A84C', fontSize: 13, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', margin: '0 0 6px' }}>
            {me.niveau.icon} {en ? me.niveau.en : me.niveau.fr} · {me.points} pts
          </p>
          <p style={{ color: '#fdfaf3', fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 800, margin: 0, lineHeight: 1.4 }}>
            {en
              ? <>Thanks to you, <span style={{ color: '#C9A84C' }}>{me.impact}</span> Muslims found their way 🤲</>
              : <>Grâce à toi, <span style={{ color: '#C9A84C' }}>{me.impact}</span> musulmans ont trouvé leur chemin 🤲</>}
          </p>
          <Link href={`/communaute/${encodeURIComponent(me.pseudo)}`} style={{ display: 'inline-block', marginTop: 10, color: '#e9dcbe', fontSize: 14, fontWeight: 700 }}>
            {en ? 'My profile & badges →' : 'Mon profil & badges →'}
          </Link>
        </div>
      )}

      {/* Spots près de toi */}
      {near.length > 0 && (
        <section style={{ marginBottom: 22 }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 900, color: '#0b1a0f', margin: '0 0 10px' }}>
            📍 {en ? `Shared spots near you${pos ? ` (${pos.label})` : ''}` : `Spots partagés près de toi${pos ? ` (${pos.label})` : ''}`}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {near.map((s) => (
              <Link key={s.id} href={`/spot/${s.id}`} style={{ ...card, display: 'flex', alignItems: 'center', gap: 12, textDecoration: 'none', minHeight: 56 }}>
                <span style={{ fontSize: 24 }}>{catInfo(s.categorie ?? 'coin_priere').icon}</span>
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span style={{ display: 'block', fontWeight: 700, color: '#0b1a0f', fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.nom}</span>
                  <span style={{ fontSize: 13, color: '#6b7280' }}>{s.distanceKm != null ? `${s.distanceKm} km` : s.sub}{((s.vues ?? 0) + (s.itineraires ?? 0)) > 1 ? ` · 💫 ${(s.vues ?? 0) + (s.itineraires ?? 0)} aidés` : ''}</span>
                </span>
                <span style={{ color: '#1b4332', fontWeight: 700 }}>→</span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Feed vivant */}
      <section style={{ marginBottom: 22 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 900, color: '#0b1a0f', margin: '0 0 10px' }}>
          ⚡ {en ? 'Live activity' : 'En ce moment dans la communauté'}
        </h2>
        {feed.length === 0 ? (
          <div style={{ ...card, textAlign: 'center', color: '#6b7280', fontSize: 14.5, lineHeight: 1.6 }}>
            {en ? 'Be the FIRST to share a spot — it all starts with you 🌱' : 'Sois le PREMIER à partager un spot — tout commence avec toi 🌱'}
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {feed.slice(0, 12).map((f, i) => (
              <Link key={i} href={`/spot/${f.spotId}`} style={{ ...card, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', minHeight: 56 }}>
                <span style={{ fontSize: 20 }}>{f.type === 'confirm' ? '✅' : catInfo(f.categorie).icon}</span>
                <span style={{ flex: 1, fontSize: 14.5, color: '#374151', lineHeight: 1.45 }}>
                  <strong style={{ color: '#1b4332' }}>{f.pseudo}</strong>{' '}
                  {f.type === 'confirm'
                    ? (en ? 'confirmed' : 'a confirmé')
                    : (en ? 'added' : 'a ajouté')}{' '}
                  <strong>{f.spotNom}</strong> {en ? 'in' : 'à'} {f.villeNom}
                  <span style={{ color: '#9ca3af' }}> · {ago(f.date, en)}</span>
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Top contributeurs du mois */}
      <section style={{ marginBottom: 22 }}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 900, color: '#0b1a0f', margin: '0 0 10px' }}>
          🏆 {en ? 'Top contributors this month' : 'Top contributeurs du mois'}
        </h2>
        {top.length === 0 ? (
          <div style={{ ...card, textAlign: 'center', color: '#6b7280', fontSize: 14.5 }}>
            {en ? 'The podium is empty — take the crown 👑' : 'Le podium est vide — prends la couronne 👑'}
          </div>
        ) : (
          <div style={{ ...card, padding: '8px 16px' }}>
            {top.map((t, i) => (
              <Link key={t.pseudo} href={`/communaute/${encodeURIComponent(t.pseudo)}`} style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 52, textDecoration: 'none', borderBottom: i < top.length - 1 ? '1px solid rgba(0,0,0,0.05)' : 'none' }}>
                <span style={{ fontSize: 18, width: 30 }}>{['🥇', '🥈', '🥉'][i] ?? `${i + 1}.`}</span>
                <span style={{ flex: 1, fontWeight: 700, color: '#0b1a0f', fontSize: 15 }}>{t.pseudo}</span>
                <span style={{ color: '#8A6D1E', fontWeight: 800, fontSize: 14 }}>{t.points} pts</span>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Niveaux */}
      <section>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 900, color: '#0b1a0f', margin: '0 0 10px' }}>
          🎖️ {en ? 'Your journey' : 'Ton parcours'}
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {NIVEAUX.map((n) => (
            <div key={n.id} style={{ ...card, textAlign: 'center', padding: 14 }}>
              <div style={{ fontSize: 26 }}>{n.icon}</div>
              <div style={{ fontWeight: 800, color: '#1b4332', fontSize: 15 }}>{en ? n.en : n.fr}</div>
              <div style={{ fontSize: 12.5, color: '#9ca3af' }}>{n.min}+ pts</div>
            </div>
          ))}
        </div>
        <p style={{ fontSize: 13, color: '#6b7280', marginTop: 12, lineHeight: 1.6, textAlign: 'center' }}>
          {en
            ? 'Spot +10 pts · confirmation +2 pts · your spot confirmed +5 pts. Guides unlock the premium app for free.'
            : 'Spot +10 pts · confirmation +2 pts · ton spot confirmé +5 pts. Les Guides débloquent l\'app premium gratuitement.'}
        </p>
      </section>
    </div>
  )
}
