'use client'

import { useState } from 'react'
import Link from 'next/link'
import type { Ville } from '@/lib/villeTypes'
import { PrayerTimesWidget } from '@/components/PrayerTimesWidget'
import CategorizedDirectory from '@/components/villes/CategorizedDirectory'

interface Props {
  ville: Ville
  apiCityName?: string
}

type TabKey = 'restaurants' | 'mosquees' | 'hotels' | 'activites' | 'pratique'

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'restaurants', label: 'Restaurants', icon: '🍽️' },
  { key: 'mosquees', label: 'Mosquées', icon: '🕌' },
  { key: 'hotels', label: 'Hôtels', icon: '🏨' },
  { key: 'activites', label: 'À faire', icon: '🗺️' },
  { key: 'pratique', label: 'Pratique', icon: 'ℹ️' },
]

const TRAVEL_TYPES: { key: 'en_couple' | 'en_famille' | 'entre_amis' | 'voyage_solo' | 'voyage_spirituel'; label: string; icon: string }[] = [
  { key: 'en_couple', label: 'En couple', icon: '💑' },
  { key: 'en_famille', label: 'En famille', icon: '👨‍👩‍👧' },
  { key: 'entre_amis', label: 'Entre amis', icon: '👫' },
  { key: 'voyage_solo', label: 'Solo', icon: '🧳' },
  { key: 'voyage_spirituel', label: 'Spirituel', icon: '🤲' },
]

const GREEN = '#1a3a2a'
const GOLD = '#c9a870'

export default function CityTabs({ ville, apiCityName }: Props) {
  const [active, setActive] = useState<TabKey>('restaurants')

  return (
    <div>
      <div className="overflow-x-auto -mx-4 px-4 sm:mx-0 sm:px-0 mb-8">
        <div className="flex gap-2 min-w-max pb-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setActive(t.key)}
              className="flex items-center gap-1.5 px-4 py-2.5 rounded-full text-sm font-medium transition-all whitespace-nowrap"
              style={
                active === t.key
                  ? { backgroundColor: GREEN, color: 'white' }
                  : { backgroundColor: 'white', color: '#555', border: '1px solid #e5e7eb' }
              }
            >
              <span>{t.icon}</span>
              <span>{t.label}</span>
            </button>
          ))}
        </div>
      </div>

      {active === 'restaurants' && (
        <CategorizedDirectory kind="resto" items={ville.restaurants} ville={ville.nom} />
      )}

      {active === 'mosquees' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ville.mosquees.map((m) => (
            <div key={m.id} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: '#3b82f6' }}>{m.type}</p>
              <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{m.nom}</h3>
              <p className="text-xs text-gray-400 mb-3">📍 {m.adresse}</p>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">{m.description}</p>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <span style={{ color: GOLD }}>★</span>
                  <span className="font-semibold">{m.note}</span>
                </div>
                {m.acces_non_musulmans && (
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>Ouvert à tous</span>
                )}
              </div>
              {m.capacite && (
                <p className="text-xs text-gray-400 mt-2">Capacité : {(m.capacite ?? 0).toLocaleString('fr-FR')} fidèles</p>
              )}
            </div>
          ))}
        </div>
      )}

      {active === 'hotels' && (ville.hotels?.length ?? 0) === 0 && (
        <div className="bg-white rounded-2xl p-8 border border-gray-100 text-center">
          <p className="text-3xl mb-3">🏨</p>
          <h3 className="font-bold text-gray-900 text-lg mb-2" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
            Sélection d&apos;hôtels halal-friendly à {ville.nom}
          </h3>
          <p className="text-sm text-gray-500 max-w-md mx-auto mb-5">
            Notre équipe vérifie actuellement les meilleures adresses respectueuses des valeurs
            islamiques (sans alcool, restauration halal, espaces familiaux).
          </p>
          <a
            href={`https://www.halalbooking.com/?s=${encodeURIComponent(ville.nom)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-5 py-2.5 rounded-xl text-sm font-bold text-white"
            style={{ backgroundColor: '#1b4332' }}
          >
            → Consulter HalalBooking.com pour {ville.nom}
          </a>
        </div>
      )}

      {active === 'hotels' && (ville.hotels?.length ?? 0) > 0 && (
        <CategorizedDirectory kind="hotel" items={ville.hotels} ville={ville.nom} />
      )}

      {active === 'activites' && (
        <div className="space-y-8">
          <CategorizedDirectory kind="activite" items={ville.activites} ville={ville.nom} />

          {ville.road_trips && ville.road_trips.length > 0 && (
            <div>
              <h3 className="font-bold text-gray-900 text-xl mb-4" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>🚗 Road trips depuis {ville.nom}</h3>
              <div className="grid grid-cols-1 gap-4">
                {ville.road_trips.map((rt) => (
                  <div key={rt.id} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <h4 className="font-bold text-gray-900 text-lg leading-tight">{rt.titre}</h4>
                      <div className="text-right shrink-0 ml-4">
                        <p className="text-sm font-semibold" style={{ color: GREEN }}>{rt.duree}</p>
                        <p className="text-xs text-gray-400">{rt.distance_km} km</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 mb-3 flex-wrap">
                      {rt.etapes.map((e, i) => (
                        <span key={i} className="flex items-center gap-1">
                          <span className="text-sm text-gray-700 font-medium">{e}</span>
                          {i < rt.etapes.length - 1 && <span className="text-gray-300">→</span>}
                        </span>
                      ))}
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed mb-3">{rt.description}</p>
                    <div className="bg-green-50 rounded-xl p-3 mb-3">
                      <p className="text-xs font-bold text-green-700 uppercase tracking-wide mb-1">🕌 Conseils halal</p>
                      <p className="text-sm text-green-800">{rt.conseils_halal}</p>
                    </div>
                    <p className="text-sm font-semibold" style={{ color: GREEN }}>Budget estimé : {rt.budget_estime}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {ville.voyages_par_type && (
            <div>
              <h3 className="font-bold text-gray-900 text-xl mb-4" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>✨ Selon votre voyage</h3>
              <div className="space-y-5">
                {TRAVEL_TYPES.map((tt) => {
                  const data = ville.voyages_par_type?.[tt.key]
                  if (!data) return null
                  return (
                    <div key={tt.key} className="bg-white rounded-2xl p-6 border border-gray-100">
                      <h4 className="font-bold text-gray-900 text-lg mb-2">{tt.icon} {tt.label}</h4>
                      <p className="text-sm text-gray-700 leading-relaxed mb-3">{data.intro}</p>
                      <ul className="space-y-1.5">
                        {data.top_experiences.map((exp) => (
                          <li key={exp} className="flex items-start gap-2 text-sm text-gray-700">
                            <span style={{ color: GOLD }} className="mt-0.5 shrink-0">✓</span>
                            <span>{exp}</span>
                          </li>
                        ))}
                      </ul>
                      {data.conseils && (
                        <div className="mt-3 rounded-xl p-3 border" style={{ backgroundColor: '#faf8f4', borderColor: '#eadfce' }}>
                          <p className="text-sm text-gray-700 leading-relaxed">{data.conseils}</p>
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}

      {active === 'pratique' && (
        <div className="space-y-6">
          <div className="bg-white rounded-2xl p-6 border border-gray-100">
            <h2 className="font-bold text-gray-900 text-xl mb-5" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>Infos pratiques</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {Object.entries(ville.infos_pratiques).map(([key, val]) => {
                const labels: Record<string, string> = {
                  langue: '🌐 Langue', langue_officielle: '🌐 Langue', monnaie: '💰 Monnaie',
                  meilleure_periode: '📅 Meilleure période', appel_priere: '🕌 Appel à la prière',
                  nourriture_halal: '🍽️ Nourriture halal', alcool: '🚫 Alcool', tenue: '👗 Tenue',
                  securite: '🛡️ Sécurité',
                }
                if (!val) return null
                return (
                  <div key={key}>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">{labels[key] ?? key}</p>
                    <p className="text-sm text-gray-700">{val}</p>
                  </div>
                )
              })}
            </div>
          </div>

          <PrayerTimesWidget
            ville={apiCityName ?? ville.nom}
            pays={ville.pays}
            countryCode={ville.codeISO ?? 'MA'}
          />

          <Link
            href="/qibla"
            className="flex items-center justify-between bg-white rounded-2xl p-6 border border-gray-100 hover:border-[#166534] transition-colors"
          >
            <div>
              <p className="font-bold text-gray-900 text-lg">🧭 Trouver la Qibla</p>
              <p className="text-sm text-gray-500">Direction de La Mecque depuis votre position GPS</p>
            </div>
            <span style={{ color: GREEN }} className="font-semibold text-sm">Ouvrir →</span>
          </Link>
        </div>
      )}
    </div>
  )
}
