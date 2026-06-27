import type { Metadata } from 'next'
import { QiblaCalculator } from '@/components/QiblaCalculator'
import { ShareButtons } from '@/components/ShareButtons'

export const metadata: Metadata = {
  title: 'Calculateur Qibla — Direction de La Mecque | VoyagesHalal.fr',
  description:
    "Trouvez la direction exacte de la Qibla (La Mecque) depuis n'importe où dans le monde grâce à votre GPS. Outil gratuit et précis.",
}

export default function QiblaPage() {
  return (
    <main className="page-container max-w-3xl mx-auto px-6 sm:px-12 py-12">
      <h1
        className="text-4xl sm:text-5xl font-bold mb-3"
        style={{ color: '#1a3a2a', fontFamily: 'var(--font-playfair), Georgia, serif' }}
      >
        🧭 Calculateur de Qibla
      </h1>
      <p className="text-gray-500 mb-6">
        Trouvez la direction de La Mecque depuis n&apos;importe où dans le monde, en un clic.
      </p>
      <QiblaCalculator />
      <section className="qibla-info-section">
        <h2>Qu&apos;est-ce que la Qibla ?</h2>
        <p>
          La Qibla est la direction vers laquelle les musulmans se tournent pour prier. Elle pointe
          vers la Kaaba, située à La Mecque en Arabie Saoudite. Peu importe où vous vous trouvez dans
          le monde, notre outil calcule cette direction précisément grâce à votre position GPS.
        </p>
      </section>
      <ShareButtons titre="Calculateur de Qibla — VoyagesHalal" url="https://www.voyageshalal.fr/qibla" />
    </main>
  )
}
