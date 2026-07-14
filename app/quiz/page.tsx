import type { Metadata } from 'next'
import { getDomainSEO } from '@/lib/domain'
import QuizClient from '@/components/quiz/QuizClient'
import IslamicPattern from '@/components/ui/IslamicPattern'

// Quiz « Quelle destination halal pour toi ? » (P5) — ludique, 60 secondes,
// 3 recommandations liées aux fiches villes. Même slug sur les deux domaines.

export async function generateMetadata(): Promise<Metadata> {
  const { isEN, siteUrl } = await getDomainSEO()
  return {
    title: isEN
      ? 'Which halal destination is right for you? — 1-minute quiz'
      : 'Quelle destination halal pour toi ? — Quiz en 1 minute',
    description: isEN
      ? '5 quick questions (budget, travel style, season) and get 3 halal destinations matched to you — with full city guides.'
      : '5 questions rapides (budget, style de voyage, saison) et découvre 3 destinations halal faites pour toi — avec les guides complets.',
    alternates: {
      canonical: `${siteUrl}/quiz`,
      languages: { fr: 'https://www.voyageshalal.fr/quiz', en: 'https://www.gohalaltravel.com/quiz', 'x-default': 'https://www.gohalaltravel.com/quiz' },
    },
    openGraph: { url: `${siteUrl}/quiz` },
  }
}

export default async function QuizPage() {
  const { isEN: en } = await getDomainSEO()
  return (
    <main style={{ minHeight: '100vh', background: 'var(--creme)' }}>
      <section className="relative overflow-hidden text-center" style={{ background: 'var(--nuit)', padding: '3rem 1.5rem 2.25rem' }}>
        <IslamicPattern opacity={0.06} />
        <div className="relative z-10">
          <p style={{ color: 'var(--or)', fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', marginBottom: '0.75rem' }}>
            🎯 {en ? '1-minute quiz' : 'Quiz en 1 minute'}
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.7rem, 5vw, 2.6rem)', fontWeight: 900, color: 'white', lineHeight: 1.15 }}>
            {en ? 'Which halal destination is right for you?' : 'Quelle destination halal pour toi ?'}
          </h1>
        </div>
      </section>
      <section className="px-4 py-10">
        <QuizClient />
      </section>
    </main>
  )
}
