'use client'
import { useState } from 'react'
import { PrayerTimesWidget } from '@/components/PrayerTimesWidget'
import { useLanguage } from '@/components/i18n/LanguageProvider'

interface VilleOption {
  nom: string
  apiName: string
  pays: string
  code: string
}

const VILLES: VilleOption[] = [
  { nom: 'Marrakech', apiName: 'Marrakech', pays: 'Maroc', code: 'MA' },
  { nom: 'Istanbul', apiName: 'Istanbul', pays: 'Turquie', code: 'TR' },
  { nom: 'Dubaï', apiName: 'Dubai', pays: 'Émirats', code: 'AE' },
  { nom: 'Paris', apiName: 'Paris', pays: 'France', code: 'FR' },
  { nom: 'Londres', apiName: 'London', pays: 'Royaume-Uni', code: 'GB' },
  { nom: 'Le Caire', apiName: 'Cairo', pays: 'Égypte', code: 'EG' },
  { nom: 'Casablanca', apiName: 'Casablanca', pays: 'Maroc', code: 'MA' },
  { nom: 'Médine', apiName: 'Medina', pays: 'Arabie Saoudite', code: 'SA' },
  { nom: 'Abu Dhabi', apiName: 'Abu Dhabi', pays: 'Émirats', code: 'AE' },
  { nom: 'Kuala Lumpur', apiName: 'Kuala Lumpur', pays: 'Malaisie', code: 'MY' },
  { nom: 'Jakarta', apiName: 'Jakarta', pays: 'Indonésie', code: 'ID' },
  { nom: 'Doha', apiName: 'Doha', pays: 'Qatar', code: 'QA' },
]

export function JeVoyageMaintenant() {
  const [selected, setSelected] = useState<VilleOption | null>(null)
  const { lang } = useLanguage()
  const en = lang === 'en'

  return (
    <section className="voyage-maintenant-section">
      <h2>🌍 {en ? 'Traveling right now?' : 'Vous êtes en voyage maintenant ?'}</h2>
      <p>{en ? 'Pick your city to get real-time prayer times' : 'Sélectionnez votre ville pour obtenir les horaires de prière en temps réel'}</p>

      {!selected ? (
        <div className="ville-grid">
          {VILLES.map((v) => (
            <button key={v.nom} className="ville-btn" onClick={() => setSelected(v)}>
              {v.nom}
            </button>
          ))}
        </div>
      ) : (
        <div>
          <PrayerTimesWidget ville={selected.apiName} pays={selected.pays} countryCode={selected.code} />
          <button onClick={() => setSelected(null)} className="btn-change-ville">
            ← {en ? 'Change city' : 'Changer de ville'}
          </button>
        </div>
      )}
    </section>
  )
}
