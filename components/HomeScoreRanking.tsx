import Link from 'next/link'

const TOP_DESTINATIONS = [
  { slug: 'medine', nom: 'Médine', emoji: '🕌', score: 10.0, badge: 'VILLE SAINTE' },
  { slug: 'kuala-lumpur', nom: 'Kuala Lumpur', emoji: '🇲🇾', score: 9.8, badge: 'MEILLEURE MONDIALE' },
  { slug: 'istanbul', nom: 'Istanbul', emoji: '🕌', score: 9.5, badge: 'EXCELLENCE' },
  { slug: 'dubai', nom: 'Dubaï', emoji: '🇦🇪', score: 9.3, badge: 'TOP LUXE' },
  { slug: 'marrakech', nom: 'Marrakech', emoji: '🇲🇦', score: 9.1, badge: 'COUP DE CŒUR' },
  { slug: 'doha', nom: 'Doha', emoji: '🇶🇦', score: 9.0, badge: 'MODERNE' },
]

export function HomeScoreRanking() {
  return (
    <section className="score-ranking-section">
      <div className="score-ranking-inner">
        <p className="score-ranking-eyebrow">🏆 Halal Trust Score™</p>
        <h2 className="score-ranking-title">Les destinations les mieux notées</h2>
        <p className="score-ranking-sub">
          Notre score halal multi-dimensionnel — unique au monde — évalue chaque destination sur la
          traçabilité, la certification et l&apos;expérience musulmane.
        </p>
        <div className="score-ranking-grid">
          {TOP_DESTINATIONS.map((d, i) => (
            <Link key={d.slug} href={`/villes/${d.slug}`} className="score-card">
              <div className="score-card-rank">#{i + 1}</div>
              <div className="score-card-emoji">{d.emoji}</div>
              <div className="score-card-body">
                <div className="score-card-name">{d.nom}</div>
                <div className="score-card-badge">{d.badge}</div>
              </div>
              <div className="score-card-score">{d.score.toFixed(1)}</div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
