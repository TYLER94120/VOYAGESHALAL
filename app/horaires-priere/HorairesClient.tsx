'use client'
import { useState } from 'react'
import { PrayerTimesWidget } from '@/components/PrayerTimesWidget'

interface VilleOption {
  nom: string
  apiName: string
  pays: string
  code: string
}

const VILLES: VilleOption[] = [
  { nom: 'Marrakech', apiName: 'Marrakech', pays: 'Maroc', code: 'MA' },
  { nom: 'Casablanca', apiName: 'Casablanca', pays: 'Maroc', code: 'MA' },
  { nom: 'Alger', apiName: 'Algiers', pays: 'Algérie', code: 'DZ' },
  { nom: 'Tunis', apiName: 'Tunis', pays: 'Tunisie', code: 'TN' },
  { nom: 'Istanbul', apiName: 'Istanbul', pays: 'Turquie', code: 'TR' },
  { nom: 'Le Caire', apiName: 'Cairo', pays: 'Égypte', code: 'EG' },
  { nom: 'Dubaï', apiName: 'Dubai', pays: 'Émirats', code: 'AE' },
  { nom: 'Abu Dhabi', apiName: 'Abu Dhabi', pays: 'Émirats', code: 'AE' },
  { nom: 'Doha', apiName: 'Doha', pays: 'Qatar', code: 'QA' },
  { nom: 'La Mecque', apiName: 'Mecca', pays: 'Arabie Saoudite', code: 'SA' },
  { nom: 'Médine', apiName: 'Medina', pays: 'Arabie Saoudite', code: 'SA' },
  { nom: 'Paris', apiName: 'Paris', pays: 'France', code: 'FR' },
  { nom: 'Marseille', apiName: 'Marseille', pays: 'France', code: 'FR' },
  { nom: 'Londres', apiName: 'London', pays: 'Royaume-Uni', code: 'GB' },
  { nom: 'Kuala Lumpur', apiName: 'Kuala Lumpur', pays: 'Malaisie', code: 'MY' },
  { nom: 'Jakarta', apiName: 'Jakarta', pays: 'Indonésie', code: 'ID' },
  { nom: 'Amman', apiName: 'Amman', pays: 'Jordanie', code: 'JO' },
  { nom: 'Mascate', apiName: 'Muscat', pays: 'Oman', code: 'OM' },
]

export default function HorairesClient() {
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<VilleOption>(VILLES[0])

  const filtered = VILLES.filter((v) =>
    v.nom.toLowerCase().includes(query.trim().toLowerCase())
  )

  return (
    <div className="max-w-3xl mx-auto">
      <div className="hero-search" style={{ marginBottom: 24 }}>
        <span className="search-icon">🔍</span>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Rechercher une ville (Istanbul, Le Caire, Dubaï...)"
          className="hero-search-input"
        />
      </div>

      <div className="ville-grid" style={{ marginBottom: 8 }}>
        {filtered.map((v) => (
          <button
            key={v.nom}
            className="ville-btn"
            onClick={() => setSelected(v)}
            style={
              selected.nom === v.nom
                ? { background: '#166534', color: 'white', borderColor: '#166534' }
                : undefined
            }
          >
            {v.nom}
          </button>
        ))}
        {filtered.length === 0 && (
          <p className="text-sm text-gray-400">Aucune ville trouvée dans notre liste.</p>
        )}
      </div>

      <PrayerTimesWidget ville={selected.apiName} pays={selected.pays} countryCode={selected.code} />
    </div>
  )
}
