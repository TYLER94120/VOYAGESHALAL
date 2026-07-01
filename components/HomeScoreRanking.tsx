import Link from 'next/link'
import { readFileSync } from 'fs'
import path from 'path'

// Destinations mises en avant (emoji + badge éditoriaux). Le SCORE, lui, provient
// TOUJOURS de la source unique de vérité : le champ `score_halal` (échelle 0-5) du
// JSON de la ville, affiché en /10 (×2). Aucune valeur codée en dur → plus aucune
// contradiction entre l'accueil, /destinations et la page de la ville.
const CURATED = [
  { slug: 'medine', nom: 'Médine', emoji: '🕌', badge: 'VILLE SAINTE' },
  { slug: 'kuala-lumpur', nom: 'Kuala Lumpur', emoji: '🇲🇾', badge: 'MEILLEURE MONDIALE' },
  { slug: 'istanbul', nom: 'Istanbul', emoji: '🕌', badge: 'EXCELLENCE' },
  { slug: 'dubai', nom: 'Dubaï', emoji: '🇦🇪', badge: 'TOP LUXE' },
  { slug: 'marrakech', nom: 'Marrakech', emoji: '🇲🇦', badge: 'COUP DE CŒUR' },
  { slug: 'doha', nom: 'Doha', emoji: '🇶🇦', badge: 'MODERNE' },
]

function scoreOf(slug: string): number {
  try {
    const d = JSON.parse(readFileSync(path.join(process.cwd(), 'data', 'villes', `${slug}.json`), 'utf-8'))
    const s = d.score_halal
    return typeof s === 'number' ? Math.round(s * 2 * 10) / 10 : 0
  } catch {
    return 0
  }
}

export function HomeScoreRanking() {
  const TOP_DESTINATIONS = CURATED
    .map((d) => ({ ...d, score: scoreOf(d.slug) }))
    .sort((a, b) => b.score - a.score)

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
            <Link key={d.slug} href={`/destinations/${d.slug}`} className="score-card">
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
