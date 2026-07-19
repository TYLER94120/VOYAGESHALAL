import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDomainSEO } from '@/lib/domain'
import { getUserByPseudo, impactOf, niveauOf, BADGES, RECOMPENSES, NIVEAUX, CATEGORIES } from '@/lib/community'
import { listAllSpots } from '@/lib/prayerSpots'

// Profil PUBLIC du contributeur (BLOC 4d) : impact sadaqa jâriya, niveau,
// badges, spots. Reconnaissance visible — jamais l'email.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ pseudo: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pseudo } = await params
  const { isEN } = await getDomainSEO()
  return {
    title: isEN ? `${decodeURIComponent(pseudo)} — community contributor` : `${decodeURIComponent(pseudo)} — contributeur de la communauté`,
    robots: { index: false, follow: true },
  }
}

export default async function ProfilPage({ params }: Props) {
  const { pseudo } = await params
  const { isEN: en } = await getDomainSEO()
  const user = await getUserByPseudo(decodeURIComponent(pseudo))
  if (!user) notFound()
  const impact = await impactOf(user.id)
  const niveau = niveauOf(user.points)
  const spots = (await listAllSpots()).filter((s) => s.auteurId === user.id).slice(0, 30)
  const next = NIVEAUX.find((n) => n.min > user.points)
  const catInfo = (id?: string) => CATEGORIES.find((c) => c.id === id) ?? CATEGORIES[4]
  const card = { background: '#fff', borderRadius: 18, border: '1px solid rgba(27,67,50,0.1)', padding: 18 } as const

  return (
    <main style={{ minHeight: '100vh', background: 'var(--creme)' }}>
      {/* En-tête profil */}
      <section style={{ background: 'var(--nuit)', padding: '2.2rem 1.25rem', textAlign: 'center' }}>
        <div style={{ width: 76, height: 76, borderRadius: '50%', background: 'var(--or)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 34, marginBottom: 10 }}>
          {niveau.icon}
        </div>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 900, color: 'white', margin: '0 0 4px' }}>{user.pseudo}</h1>
        <p style={{ color: 'var(--or)', fontWeight: 800, fontSize: 15, margin: 0 }}>
          {en ? niveau.en : niveau.fr} · {user.points} pts
        </p>
        {next && (
          <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13, margin: '6px 0 0' }}>
            {en ? `${next.min - user.points} pts to ${next.en} ${next.icon}` : `${next.min - user.points} pts avant ${next.fr} ${next.icon}`}
          </p>
        )}
      </section>

      <div style={{ maxWidth: 560, margin: '0 auto', padding: '20px 16px 70px' }}>
        {/* Impact sadaqa jâriya — central */}
        <div style={{ ...card, background: 'linear-gradient(135deg, #1B4332, #0B1A0F)', border: 'none', textAlign: 'center', marginBottom: 16 }}>
          <p style={{ fontSize: 34, margin: '0 0 4px' }}>🤲</p>
          <p style={{ color: '#fdfaf3', fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 800, margin: 0, lineHeight: 1.45 }}>
            {en
              ? <>Thanks to {user.pseudo}, <span style={{ color: '#C9A84C' }}>{impact}</span> Muslims found where to pray or eat halal</>
              : <>Grâce à {user.pseudo}, <span style={{ color: '#C9A84C' }}>{impact}</span> musulmans ont trouvé où prier ou manger halal</>}
          </p>
          <p style={{ color: 'rgba(253,250,243,0.55)', fontSize: 13, margin: '8px 0 0' }}>
            {en ? 'A sadaqa that keeps giving, in shā’ Allāh' : 'Une sadaqa jâriya qui continue, in shā’ Allāh'}
          </p>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 16 }}>
          <div style={{ ...card, textAlign: 'center' }}>
            <p style={{ fontSize: 26, fontWeight: 900, color: '#1b4332', margin: 0, fontFamily: "'Playfair Display', serif" }}>{user.nbSpots}</p>
            <p style={{ fontSize: 13.5, color: '#6b7280', margin: 0 }}>{en ? 'spots shared' : 'spots partagés'}</p>
          </div>
          <div style={{ ...card, textAlign: 'center' }}>
            <p style={{ fontSize: 26, fontWeight: 900, color: '#1b4332', margin: 0, fontFamily: "'Playfair Display', serif" }}>{user.nbConfirmations}</p>
            <p style={{ fontSize: 13.5, color: '#6b7280', margin: 0 }}>{en ? 'confirmations given' : 'confirmations données'}</p>
          </div>
        </div>

        {/* Badges */}
        {user.badges.length > 0 && (
          <section style={{ marginBottom: 16 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 900, color: '#0b1a0f', margin: '0 0 10px' }}>🎖️ Badges</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {user.badges.map((b) => {
                const info = BADGES[b] ?? (b.startsWith('ambassadeur:') ? { icon: '🏙️', fr: `Ambassadeur de ${b.split(':')[2] ?? ''}`, en: `${b.split(':')[2] ?? ''} Ambassador`, desc: '' } : null)
                return info ? (
                  <span key={b} title={info.desc} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#0b1a0f', color: '#C9A84C', borderRadius: 999, padding: '9px 15px', fontWeight: 800, fontSize: 13.5 }}>
                    {info.icon} {en ? info.en : info.fr}
                  </span>
                ) : null
              })}
            </div>
          </section>
        )}

        {/* Récompenses débloquées */}
        {RECOMPENSES[niveau.id] && (
          <section style={{ ...card, marginBottom: 16, background: 'rgba(201,168,76,0.1)', border: '1px solid rgba(201,168,76,0.4)' }}>
            <p style={{ fontWeight: 800, color: '#8A6D1E', fontSize: 14.5, margin: '0 0 6px' }}>🎁 {en ? 'Unlocked rewards' : 'Avantages débloqués'}</p>
            {RECOMPENSES[niveau.id].map((r, i) => (
              <p key={i} style={{ fontSize: 14, color: '#374151', margin: '2px 0' }}>✓ {en ? r.en : r.fr}</p>
            ))}
          </section>
        )}

        {/* Spots du contributeur */}
        {spots.length > 0 && (
          <section>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 19, fontWeight: 900, color: '#0b1a0f', margin: '0 0 10px' }}>
              📍 {en ? 'Shared spots' : 'Spots partagés'}
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {spots.map((s) => (
                <Link key={s.id} href={`/spot/${s.id}`} style={{ ...card, padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none', minHeight: 56 }}>
                  <span style={{ fontSize: 20 }}>{catInfo(s.categorie).icon}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontWeight: 700, color: '#0b1a0f', fontSize: 15, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.nom}</span>
                    <span style={{ fontSize: 13, color: '#6b7280' }}>{s.villeNom} · 👥 {s.confirmations}{((s.vues ?? 0) + (s.itineraires ?? 0)) > 0 ? ` · 💫 ${(s.vues ?? 0) + (s.itineraires ?? 0)}` : ''}</span>
                  </span>
                  <span style={{ color: '#1b4332', fontWeight: 700 }}>→</span>
                </Link>
              ))}
            </div>
          </section>
        )}
      </div>
    </main>
  )
}
