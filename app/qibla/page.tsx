import type { Metadata } from 'next'
import QiblaClient from '@/components/QiblaClient'
import { ShareButtons } from '@/components/ShareButtons'

export const metadata: Metadata = {
  title: 'Calculateur Qibla — Direction de La Mecque | VoyagesHalal.fr',
  description:
    "Trouvez la direction exacte de la Qibla (La Mecque) depuis n'importe où dans le monde grâce à votre GPS. Outil gratuit et précis.",
}

export default function QiblaPage() {
  return (
    <main style={{ backgroundColor: '#fdfaf3' }}>
      <section className="islamic-hero px-6 sm:px-16 pt-14 pb-16 text-center">
        <p style={{ color: '#c9a84c' }} className="text-xs font-semibold uppercase tracking-[0.25em] mb-4">
          Outil musulman
        </p>
        <h1
          className="text-4xl sm:text-5xl font-bold text-white mb-4"
          style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
        >
          Calculateur de <span className="gold-em">Qibla</span>
        </h1>
        <p className="text-white/60 max-w-xl mx-auto">
          Trouvez la direction de La Mecque depuis n&apos;importe où dans le monde, en un clic.
        </p>
      </section>
      <div className="max-w-3xl mx-auto px-6 sm:px-12 py-12">
      <QiblaClient />
      <section className="qibla-info-section">
        <h2>Qu&apos;est-ce que la Qibla ?</h2>
        <p>
          La Qibla est la direction vers laquelle les musulmans se tournent pour prier. Elle pointe
          vers la Kaaba, située à La Mecque en Arabie Saoudite. Peu importe où vous vous trouvez dans
          le monde, notre outil calcule cette direction précisément grâce à votre position GPS.
        </p>
      </section>
      <ShareButtons titre="Calculateur de Qibla — VoyagesHalal" url="https://www.voyageshalal.fr/qibla" />
      </div>
    </main>
  )
}
