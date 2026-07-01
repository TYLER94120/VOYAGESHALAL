import type { Metadata } from 'next'
import IslamicPattern from '@/components/ui/IslamicPattern'
import QiblaCompass from '@/components/qibla/QiblaCompass'
import { getDomainSEO } from '@/lib/domain'

export const metadata: Metadata = {
  title: 'Calculateur Qibla — Compas temps réel vers La Mecque',
  description:
    "Boussole Qibla en temps réel : l'aiguille pointe vers La Mecque grâce au capteur de votre téléphone (GPS + compas). Gratuit, précis, depuis n'importe où dans le monde.",
}

export default async function QiblaPage() {
  const { isEN: en } = await getDomainSEO()
  return (
    <main style={{ minHeight: '100vh', background: 'var(--creme)' }}>
      <section className="relative overflow-hidden text-center" style={{ background: 'var(--nuit)', padding: '4rem 1.5rem 3rem' }}>
        <IslamicPattern opacity={0.06} />
        <div className="relative z-10">
          <p style={{ color: 'var(--or)', fontSize: '11px', fontWeight: 600, letterSpacing: '3px', textTransform: 'uppercase', marginBottom: '1rem' }}>✦ {en ? 'Muslim tools' : 'Outils musulmans'}</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: 'white', marginBottom: '0.75rem', lineHeight: 1.1 }}>
            {en ? 'Direction to' : 'Direction de'}
            <br />
            <em style={{ color: 'var(--or)' }}>{en ? 'Mecca' : 'La Mecque'}</em>
          </h1>
          <p style={{ color: 'var(--or-clair)', fontSize: '1rem', opacity: 0.85 }}>{en ? 'Qibla compass · Precise GPS · Real-time' : 'Compas Qibla · GPS précis · Temps réel'}</p>
        </div>
      </section>

      <QiblaCompass />
    </main>
  )
}
