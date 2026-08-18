'use client'

// 🚶/🚗 LA RÈGLE DISTANCE, ACTÉE PAR MOHAMED (itération 2, correction 3) :
// ≤ 15 minutes de marche → on affiche la marche ; au-delà → la voiture.
// Des MINUTES, jamais des kilomètres seuls. Les minutes réelles viennent
// de l'API Routes quand le serveur les a calculées (f.marcheMin /
// f.voitureMin) ; sinon on calcule depuis la distance (75 m/min à pied,
// 400 m/min en ville en voiture) — un calcul assumé, pas une invention :
// c'est la même vitesse de marche que le croisement prière.
export function minutesDe(f: { distanceM?: number; marcheMin?: number; voitureMin?: number }): { mode: 'marche' | 'voiture'; min: number } | null {
  const marche = typeof f.marcheMin === 'number' ? f.marcheMin
    : typeof f.distanceM === 'number' ? Math.max(1, Math.round(f.distanceM / 75)) : null
  if (marche == null) return null
  if (marche <= 15) return { mode: 'marche', min: marche }
  const voiture = typeof f.voitureMin === 'number' ? f.voitureMin
    : Math.max(1, Math.round((f.distanceM ?? 0) / 400))
  return { mode: 'voiture', min: voiture }
}

export default function TrajetMin({ f, en = false }: { f: { distanceM?: number; marcheMin?: number; voitureMin?: number }; en?: boolean }) {
  const t = minutesDe(f)
  if (!t) return null
  const c = { width: 15, height: 15, fill: 'none' as const, stroke: 'currentColor', strokeWidth: 1.8, strokeLinecap: 'round' as const, strokeLinejoin: 'round' as const, style: { verticalAlign: '-2px' } }
  return (
    <span aria-label={t.mode === 'marche' ? (en ? 'on foot' : 'à pied') : (en ? 'by car' : 'en voiture')}>
      {t.mode === 'marche'
        ? <svg {...c} viewBox="0 0 24 24" aria-hidden><circle cx="13" cy="4.5" r="1.8" /><path d="M12.5 8.5 10 12l2.5 3v6M10 12l-2.5 1.5M12.5 8.5l3 1 2 3M12.5 15l3 2.5 1 3.5" /></svg>
        : <svg {...c} viewBox="0 0 24 24" aria-hidden><path d="M4 16v-4l2-5.5h12L20 12v4M4 16h16M4 16v3h2.5v-3M17.5 16v3H20v-3" /><circle cx="8" cy="13.5" r="1" /><circle cx="16" cy="13.5" r="1" /></svg>}
      {' '}{t.min} min
    </span>
  )
}
