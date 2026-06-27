'use client'
import { useState } from 'react'
import Link from 'next/link'

export interface VilleCard {
  slug: string
  nom: string
  pays: string
  scoreHalal: number | null
  description: string
}

interface Props {
  villes: VilleCard[]
  continents: Record<string, string[]>
}

const COUNTRY_EMOJI: Record<string, string> = {
  Maroc: '🇲🇦',
  Turquie: '🇹🇷',
  France: '🇫🇷',
  'Émirats Arabes Unis': '🇦🇪',
  Émirats: '🇦🇪',
  'Arabie Saoudite': '🇸🇦',
  Malaisie: '🇲🇾',
  Indonésie: '🇮🇩',
  Égypte: '🇪🇬',
  Algérie: '🇩🇿',
  Tunisie: '🇹🇳',
  Jordanie: '🇯🇴',
  Qatar: '🇶🇦',
  'Royaume-Uni': '🇬🇧',
  Oman: '🇴🇲',
  Maldives: '🇲🇻',
}

const FILTER_ICON: Record<string, string> = {
  'Moyen-Orient': '🕌 ',
  Afrique: '🌍 ',
  Asie: '🌏 ',
  Europe: '🏰 ',
}

export default function DestinationsClient({ villes, continents }: Props) {
  const [filtre, setFiltre] = useState('Tous')

  const villesFiltrees =
    filtre === 'Tous' ? villes : villes.filter((v) => continents[filtre]?.includes(v.pays))

  return (
    <div className="destinations-content">
      <div className="filtres-scroll">
        {Object.keys(continents).map((c) => (
          <button
            key={c}
            className={`filtre-btn ${filtre === c ? 'active' : ''}`}
            onClick={() => setFiltre(c)}
          >
            {FILTER_ICON[c] ?? ''}
            {c}
          </button>
        ))}
      </div>

      <div className="destinations-grid">
        {villesFiltrees.map((v) => (
          <Link key={v.slug} href={`/destinations/${v.slug}`} className="destination-card">
            <div className="card-header">
              <span className="card-flag">{COUNTRY_EMOJI[v.pays] || '🌍'}</span>
              <span className="card-score">⭐ {v.scoreHalal ?? '?'}/5</span>
            </div>
            <h3 className="card-city">{v.nom}</h3>
            <p className="card-country">{v.pays}</p>
            <p className="card-desc">{v.description.slice(0, 80)}…</p>
            <span className="card-cta">Guide complet →</span>
          </Link>
        ))}
      </div>

      {villesFiltrees.length === 0 && (
        <p className="text-center text-gray-400 py-12">
          Aucune destination dans cette région pour le moment.
        </p>
      )}
    </div>
  )
}
