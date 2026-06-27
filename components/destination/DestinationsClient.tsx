'use client'
import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80'

export interface VilleCard {
  slug: string
  nom: string
  pays: string
  scoreHalal: number | null
  description: string
  image?: string
  continent?: string | null
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
            <Image
              src={v.image || FALLBACK_IMG}
              alt={`Voyage halal ${v.nom}`}
              width={400}
              height={160}
              className="card-image"
              style={{ objectFit: 'cover', width: '100%', height: '160px', borderRadius: '12px 12px 0 0' }}
            />
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
