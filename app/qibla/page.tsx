import type { Metadata } from 'next'
import IslamicPattern from '@/components/ui/IslamicPattern'
import QiblaCompass from '@/components/qibla/QiblaCompass'
import { getDomainSEO } from '@/lib/domain'
import BoutonRetour from '@/components/layout/BoutonRetour'

export async function generateMetadata(): Promise<Metadata> {
  const { isEN, siteUrl } = await getDomainSEO()
  return {
    title: isEN ? 'Qibla finder — Real-time compass to Mecca' : 'Calculateur Qibla — Compas temps réel vers La Mecque',
    description: isEN
      ? "Real-time Qibla compass: the needle points to Mecca using your phone's sensor (GPS + compass). Free, accurate, from anywhere in the world."
      : "L'aiguille pointe vers La Mecque grâce au capteur de votre téléphone (GPS + compas). Gratuit, précis, partout dans le monde.",
    alternates: {
      canonical: `${siteUrl}/qibla`,
      languages: { fr: 'https://www.voyageshalal.fr/qibla', en: 'https://www.gohalaltravel.com/qibla', 'x-default': 'https://www.gohalaltravel.com/qibla' },
    },
    openGraph: { url: `${siteUrl}/qibla` },
  }
}

export default async function QiblaPage() {
  const { isEN: en } = await getDomainSEO()
  return (
    <main style={{ minHeight: '100dvh', background: 'var(--creme)' }}>
      {/* ‹ correction 5 : chaque écran secondaire a son retour, pile réelle */}
      <BoutonRetour clair />
      {/* Le titre occupait 40 % du premier écran : l'outil commençait sous la
          ligne de flottaison. Il est réduit — on vient ici pour la boussole,
          pas pour lire un titre. */}
      <section className="relative overflow-hidden text-center" style={{ background: 'var(--nuit)', padding: '1.75rem 1.5rem 1.5rem' }}>
        <IslamicPattern opacity={0.06} />
        <div className="relative z-10">
          <p style={{ color: 'var(--or)', fontSize: '11px', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '0.5rem' }}>✦ {en ? 'Muslim tools' : 'Outils musulmans'}</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(1.65rem, 4.5vw, 2.5rem)', fontWeight: 900, color: 'white', marginBottom: '0.4rem', lineHeight: 1.1 }}>
            {en ? 'Direction to' : 'Direction de'}
            <br />
            <em style={{ color: 'var(--or)' }}>{en ? 'Mecca' : 'La Mecque'}</em>
          </h1>
          <p style={{ color: 'var(--or-clair)', fontSize: '0.9rem', opacity: 0.85 }}>{en ? 'Qibla compass · Precise GPS · Real-time' : 'Compas Qibla · GPS précis · Temps réel'}</p>
        </div>
      </section>

      <QiblaCompass />
    </main>
  )
}
