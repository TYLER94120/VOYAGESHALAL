import { isRamadan } from '@/lib/ramadan'
import type { Ville } from '@/lib/villeTypes'

interface Props {
  ville: Ville
  apiCityName: string
}

export function RamadanSection({ ville }: Props) {
  if (!isRamadan()) return null

  const restaurants = ville.restaurants ?? []
  const suhoorSpots = restaurants.filter((r) => r.ouvertSuhoor).slice(0, 3)
  const fallbackSuhoor = suhoorSpots.length > 0 ? suhoorSpots : restaurants.slice(0, 3)
  const iftarSpots = [...restaurants]
    .filter((r) => (r.halalScore?.global ?? 0) >= 8)
    .slice(0, 3)
  const fallbackIftar = iftarSpots.length > 0 ? iftarSpots : restaurants.slice(0, 3)

  return (
    <section className="ramadan-section">
      <h2>🌙 Ramadan à {ville.nom}</h2>
      <div className="ramadan-grid">
        <div className="ramadan-card">
          <h3>🌅 Suhoor (repas avant l&apos;aube)</h3>
          <p>Se termine à l&apos;heure de Fajr — voir horaires ci-dessous</p>
          <div className="ramadan-restaurants">
            {fallbackSuhoor.map((r) => (
              <div key={r.id} className="resto-mini">
                {r.nom}
                {r.horaires ? ` — ${r.horaires}` : ''}
              </div>
            ))}
          </div>
        </div>
        <div className="ramadan-card">
          <h3>🍽️ Iftar (rupture du jeûne)</h3>
          <p>À l&apos;heure de Maghrib — voir horaires ci-dessous</p>
          <div className="ramadan-restaurants">
            {fallbackIftar.map((r) => (
              <div key={r.id} className="resto-mini">
                {r.nom}
                {r.halalScore ? ` — ⭐${r.halalScore.global.toFixed(1)}/10` : ''}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
