import type { Metadata } from 'next'
import FluxPepites from '@/components/spots/FluxPepites'
import { getDomainSEO, FR_URL, EN_URL } from '@/lib/domain'

// 🧿 /trouvailles — LA page vedette du virage : découvrir les pépites halal
// partagées et confirmées par des musulmans. Additif : /communaute reste
// en ligne (profils, classement, ajout) — /trouvailles devient le hub.
export async function generateMetadata(): Promise<Metadata> {
  const { isEN, siteUrl } = await getDomainSEO()
  const title = isEN
    ? 'Finds — halal gems shared by Muslim travelers'
    : 'Trouvailles : les pépites halal partagées par les voyageurs'
  const description = isEN
    ? 'Prayer corners, halal restaurants, women-friendly places and hidden gems — real finds shared, enriched and confirmed by the Muslim community.'
    : 'Coins prière, restos halal, espaces femmes et pépites — de vraies trouvailles partagées, enrichis et confirmés par la communauté musulmane.'
  return {
    title,
    description,
    alternates: { canonical: `${siteUrl}/trouvailles`, languages: { fr: `${FR_URL}/trouvailles`, en: `${EN_URL}/trouvailles` } },
    openGraph: { title, description, url: `${siteUrl}/trouvailles` },
  }
}

export default async function SpotsPage() {
  const { isEN: en } = await getDomainSEO()
  // SEO + vitesse : les derniers spots sont rendus CÔTÉ SERVEUR (Google les
  // voit), le client prend le relais pour les filtres. Photo d'ambiance de la
  // ville jointe pour les spots sans média (label « photo d'illustration »).
  // Le flux prend l'écran entier : plus de photo de ville jointe (un spot
  // sans média est une carte texte, jamais une photo qui pourrait passer
  // pour le lieu). Le h1 reste rendu pour Google, en lecture d'écran.
  let initialSpots: unknown[] = []
  try {
    const { listAllSpots } = await import('@/lib/prayerSpots')
    initialSpots = (await listAllSpots())
      .filter((s) => s.status === 'published')
      .sort((a, b) => (b.createdAt ?? '').localeCompare(a.createdAt ?? ''))
      .slice(0, 30)
  } catch { /* le client chargera via l'API */ }
  return (
    <main style={{ background: 'var(--nuit)', minHeight: '100dvh' }}>
      <h1 style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0 }}>
        {en ? 'Finds — halal gems shared by Muslim travelers' : 'Trouvailles : les pépites halal partagées par les voyageurs'}
      </h1>
      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
      <FluxPepites initialSpots={initialSpots as any} />
    </main>
  )
}
