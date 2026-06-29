'use client'
import { useState } from 'react'
import { PrayerTimesWidget } from '@/components/PrayerTimesWidget'
import { useLocation } from '@/components/location/LocationProvider'

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
  const { city, clearLocation } = useLocation()
  const [query, setQuery] = useState('')
  const [selected, setSelected] = useState<VilleOption>(VILLES[0])

  const filtered = VILLES.filter((v) =>
    v.nom.toLowerCase().includes(query.trim().toLowerCase())
  )

  // Une ville est mémorisée → horaires chargés automatiquement, pas besoin de re-sélectionner
  if (city && city.lat != null && city.lng != null) {
    return (
      <div className="max-w-3xl mx-auto">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12, background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.35)', borderRadius: 14, padding: '12px 18px', marginBottom: 20 }}>
          <span style={{ fontWeight: 700, color: 'var(--foret)', fontSize: 15 }}>📍 Horaires pour {city.nom}</span>
          <button onClick={clearLocation} style={{ background: 'none', border: 'none', color: 'var(--or)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
            Changer de ville →
          </button>
        </div>
        <PrayerTimesWidget ville={city.nom} pays={city.pays ?? ''} countryCode="" lat={city.lat} lng={city.lng} />
      </div>
    )
  }

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
