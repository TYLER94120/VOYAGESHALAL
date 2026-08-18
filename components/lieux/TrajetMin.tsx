'use client'

// 🚶 · 🚗 LES DEUX TEMPS, TOUJOURS — itération 3, correction 1.
//
// L'app a affiché « 4 min » à pied pour un lieu à 11 min de marche : le
// repli calculait des minutes depuis la distance à vol d'oiseau. Depuis :
//   - quand le serveur a les minutes RÉELLES (API Routes, deux appels
//     distincts marche/voiture), on affiche LES DEUX : « 🚶 11 · 🚗 4 » ;
//   - quand il ne les a pas, on affiche la DISTANCE EN MÈTRES (à vol
//     d'oiseau, ce qu'elle est) — jamais une minute estimée. Une donnée
//     fausse coûte plus cher qu'une donnée absente.

function Ic({ d }: { d: string }) {
  return (
    <svg viewBox="0 0 24 24" width={15} height={15} fill="none" stroke="currentColor" strokeWidth={1.8}
      strokeLinecap="round" strokeLinejoin="round" style={{ display: 'inline-block', verticalAlign: '-2px' }} aria-hidden>
      <path d={d} />
    </svg>
  )
}
const D_MARCHE = 'M13 4.5a1.8 1.8 0 1 0 0-.01M12.5 8.5 10 12l2.5 3v6M10 12l-2.5 1.5M12.5 8.5l3 1 2 3M12.5 15l3 2.5 1 3.5'
const D_VOITURE = 'M4 16v-4l2-5.5h12L20 12v4M4 16h16M4 16v3h2.5v-3M17.5 16v3H20v-3M8 13.5h.01M16 13.5h.01'

/** Le temps qui sert au SCORE : marche si ≤ 15 min, sinon voiture. Null si
 *  aucun temps réel — le score retombe alors sur la distance brute. */
export function coutMinutes(f: { marcheMin?: number; voitureMin?: number }): number | null {
  if (typeof f.marcheMin === 'number' && f.marcheMin <= 15) return f.marcheMin
  if (typeof f.voitureMin === 'number') return f.voitureMin
  return typeof f.marcheMin === 'number' ? f.marcheMin : null
}

export default function TrajetMin({ f, en = false }: { f: { distanceM?: number; marcheMin?: number; voitureMin?: number }; en?: boolean }) {
  const aMarche = typeof f.marcheMin === 'number'
  const aVoiture = typeof f.voitureMin === 'number'
  if (aMarche || aVoiture) {
    return (
      <span style={{ whiteSpace: 'nowrap' }}>
        {aMarche && (
          <span aria-label={en ? 'on foot' : 'à pied'}><Ic d={D_MARCHE} /> {f.marcheMin} min</span>
        )}
        {aMarche && aVoiture && ' · '}
        {aVoiture && (
          <span aria-label={en ? 'by car' : 'en voiture'}><Ic d={D_VOITURE} /> {f.voitureMin} min</span>
        )}
      </span>
    )
  }
  // Pas de temps réel : des mètres, honnêtes — jamais une minute estimée.
  if (typeof f.distanceM !== 'number') return null
  return <span>{f.distanceM < 1000 ? `${Math.round(f.distanceM)} m` : `${(f.distanceM / 1000).toFixed(1).replace('.', ',')} km`}</span>
}
