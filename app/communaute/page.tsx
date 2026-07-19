import type { Metadata } from 'next'
import { getDomainSEO } from '@/lib/domain'
import HubClient from '@/components/community/HubClient'
import IslamicPattern from '@/components/ui/IslamicPattern'

// 🤝 Communauté — le hub. Vision : « le réseau où les voyageurs musulmans
// partagent le vrai savoir ». Chaque contribution = sadaqa jâriya.
export async function generateMetadata(): Promise<Metadata> {
  const { isEN, siteUrl } = await getDomainSEO()
  return {
    title: isEN ? 'Community — share prayer spots & halal gems' : 'Communauté — partage coins prière & bonnes adresses halal',
    description: isEN
      ? 'The network where Muslim travelers share real knowledge: prayer spots, halal restaurants, hidden gems. Every contribution helps travelers — a sadaqa jariya.'
      : 'Le réseau où les voyageurs musulmans partagent le vrai savoir : coins prière, restos halal, pépites. Chaque contribution aide des voyageurs — une sadaqa jâriya.',
    alternates: { canonical: `${siteUrl}/communaute` },
  }
}

export default async function CommunautePage() {
  const { isEN: en } = await getDomainSEO()
  return (
    <main style={{ minHeight: '100vh', background: 'var(--creme)' }}>
      <section className="relative overflow-hidden text-center" style={{ background: 'var(--nuit)', padding: '2.5rem 1.25rem 2rem' }}>
        <IslamicPattern opacity={0.06} />
        <div className="relative z-10" style={{ maxWidth: 560, margin: '0 auto' }}>
          <p style={{ color: 'var(--or)', fontSize: 11, fontWeight: 700, letterSpacing: 3, textTransform: 'uppercase', marginBottom: '0.6rem' }}>
            🤝 {en ? 'Community' : 'Communauté'}
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.7rem, 5vw, 2.4rem)', fontWeight: 900, color: 'white', lineHeight: 1.2, margin: 0 }}>
            {en ? 'Share the real knowledge, help the ummah' : 'Partage le vrai savoir, aide la oumma'}
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 15, marginTop: 10, lineHeight: 1.6 }}>
            {en
              ? 'A prayer corner, a real halal resto, a hidden gem — every spot you share keeps helping travelers. A sadaqa that continues, in shā’ Allāh. 🌱'
              : 'Un coin prière, un vrai resto halal, une pépite — chaque spot partagé continue d\'aider des voyageurs. Une sadaqa jâriya, in shā’ Allāh. 🌱'}
          </p>
        </div>
      </section>
      <HubClient />
    </main>
  )
}
