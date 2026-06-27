import type { Metadata } from 'next'
import QiblaClient from '@/components/QiblaClient'
import { ShareButtons } from '@/components/ShareButtons'
import IslamicPattern from '@/components/ui/IslamicPattern'

export const metadata: Metadata = {
  title: 'Calculateur Qibla — Direction de La Mecque | VoyagesHalal.fr',
  description:
    "Trouvez la direction exacte de la Qibla (La Mecque) depuis n'importe où dans le monde grâce à votre GPS. Outil gratuit et précis.",
}

export default function QiblaPage() {
  return (
    <main style={{ backgroundColor: '#fdfaf3' }}>
      <section className="relative overflow-hidden px-6 sm:px-16 pt-14 pb-16 text-center" style={{ backgroundColor: '#0b1a0f' }}>
        <IslamicPattern opacity={0.07} />
        <div className="relative z-10">
          <p style={{ color: '#c9a84c' }} className="text-sm font-semibold uppercase tracking-[0.3em] mb-4">
            Direction de La Mecque
          </p>
          <h1
            className="text-4xl sm:text-5xl font-bold text-white mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 900 }}
          >
            Calculateur de <span className="gold-em">Qibla</span>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            Trouvez la direction de La Mecque depuis n&apos;importe où dans le monde, en un clic.
          </p>
        </div>
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
