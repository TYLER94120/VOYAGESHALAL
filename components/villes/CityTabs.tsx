'use client'

import { useState } from 'react'
import type { Ville } from '@/lib/villeTypes'

interface Props {
  ville: Ville
}

type TabKey =
  | 'restaurants'
  | 'mosquees'
  | 'hotels'
  | 'activites'
  | 'road_trips'
  | 'en_couple'
  | 'en_famille'
  | 'entre_amis'
  | 'voyage_solo'
  | 'voyage_spirituel'

const TABS: { key: TabKey; label: string; icon: string }[] = [
  { key: 'restaurants', label: 'Restaurants', icon: '🍽️' },
  { key: 'mosquees', label: 'Mosquées', icon: '🕌' },
  { key: 'hotels', label: 'Hôtels', icon: '🏨' },
  { key: 'activites', label: 'Activités', icon: '🗺️' },
  { key: 'road_trips', label: 'Road Trips', icon: '🚗' },
  { key: 'en_couple', label: 'En couple', icon: '💑' },
  { key: 'en_famille', label: 'En famille', icon: '👨‍👩‍👧' },
  { key: 'entre_amis', label: 'Entre amis', icon: '👫' },
  { key: 'voyage_solo', label: 'Solo', icon: '🧳' },
  { key: 'voyage_spirituel', label: 'Spirituel', icon: '🤲' },
]

const GREEN = '#1a3a2a'
const GOLD = '#c9a870'

export default function CityTabs({ ville }: Props) {
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
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ville.restaurants.map((r) => (
            <div key={r.id} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-gray-900 text-lg leading-tight">{r.nom}</h3>
                <span className="text-sm font-medium text-gray-400 shrink-0 ml-2">{r.fourchette_prix}</span>
              </div>
              <p className="text-sm text-gray-500 mb-1">{r.cuisine}</p>
              <p className="text-xs text-gray-400 mb-3">📍 {r.adresse}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {r.halal_certifie && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>
                    Halal certifié
                  </span>
                )}
                {r.sans_alcool && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wide" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>
                    Sans alcool
                  </span>
                )}
              </div>
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-1">
                  <span style={{ color: GOLD }}>★</span>
                  <span className="font-semibold">{r.note}</span>
                  <span className="text-gray-400">({(r.avis_count ?? 0).toLocaleString('fr-FR')} avis)</span>
                </div>
                <span className="text-gray-400 text-xs">{r.horaires}</span>
              </div>
              {(r.specialites ?? []).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {(r.specialites ?? []).map((s) => (
                    <span key={s} className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-xs">{s}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
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

      {active === 'hotels' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ville.hotels.map((h) => (
            <div key={h.id} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-2">
                <h3 className="font-bold text-gray-900 text-lg leading-tight">{h.nom}</h3>
                <div className="flex shrink-0 ml-2">
                  {Array.from({ length: h.etoiles }).map((_, i) => (
                    <span key={i} style={{ color: GOLD }} className="text-sm">★</span>
                  ))}
                </div>
              </div>
              <p className="text-sm text-gray-500 mb-1">{h.type}</p>
              <p className="text-xs text-gray-400 mb-3">📍 {h.adresse}</p>
              <div className="flex flex-wrap gap-1 mb-3">
                {h.halal_certifie && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase" style={{ backgroundColor: '#f0fdf4', color: '#16a34a' }}>Halal certifié</span>}
                {h.sans_alcool && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase" style={{ backgroundColor: '#eff6ff', color: '#2563eb' }}>Sans alcool</span>}
                {h.piscine_privee && <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase" style={{ backgroundColor: '#fefce8', color: '#ca8a04' }}>Piscine privée</span>}
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-sm">
                  <span style={{ color: GOLD }}>★</span>
                  <span className="font-semibold">{h.note}</span>
                  <span className="text-gray-400">({(h.avis_count ?? 0).toLocaleString('fr-FR')} avis)</span>
                </div>
                <p className="font-bold" style={{ color: GREEN }}>À partir de {h.prix_nuit_min}{h.devise === 'EUR' ? '€' : h.devise === 'GBP' ? '£' : h.devise}/nuit</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {active === 'activites' && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {ville.activites.map((a) => (
            <div key={a.id} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <p className="text-[10px] font-bold uppercase tracking-widest mb-2" style={{ color: GOLD }}>{a.type}</p>
              <h3 className="font-bold text-gray-900 text-lg leading-tight mb-1">{a.nom}</h3>
              <p className="text-sm text-gray-600 leading-relaxed mb-3">{a.description}</p>
              <div className="flex items-center gap-4 text-sm text-gray-500">
                <span>⏱ {a.duree}</span>
                <span style={{ color: GREEN }} className="font-medium">{a.prix}</span>
              </div>
              {(a.tags ?? []).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1">
                  {(a.tags ?? []).map((tag) => (
                    <span key={tag} className="px-2 py-0.5 bg-gray-50 text-gray-500 rounded text-xs">{tag}</span>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {active === 'road_trips' && (
        <div className="grid grid-cols-1 gap-4">
          {ville.road_trips.map((rt) => (
            <div key={rt.id} className="bg-white rounded-2xl p-6 border border-gray-100 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-bold text-gray-900 text-xl leading-tight">{rt.titre}</h3>
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
      )}

      {(['en_couple', 'en_famille', 'entre_amis', 'voyage_solo', 'voyage_spirituel'] as const).includes(active as 'en_couple' | 'en_famille' | 'entre_amis' | 'voyage_solo' | 'voyage_spirituel') && (() => {
        const key = active as 'en_couple' | 'en_famille' | 'entre_amis' | 'voyage_solo' | 'voyage_spirituel'
        const data = ville.voyages_par_type[key]
        return (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <p className="text-base text-gray-700 leading-relaxed">{data.intro}</p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-gray-100">
              <h3 className="font-bold text-gray-900 text-lg mb-4">Top expériences</h3>
              <ul className="space-y-2">
                {data.top_experiences.map((exp) => (
                  <li key={exp} className="flex items-start gap-2 text-sm text-gray-700">
                    <span style={{ color: GOLD }} className="mt-0.5 shrink-0">✓</span>
                    <span>{exp}</span>
                  </li>
                ))}
              </ul>
            </div>
            {data.conseils && (
              <div className="rounded-2xl p-6 border" style={{ backgroundColor: '#faf8f4', borderColor: '#c9a870' }}>
                <p className="text-xs font-bold uppercase tracking-widest mb-2" style={{ color: GOLD }}>Conseils pratiques</p>
                <p className="text-sm text-gray-700 leading-relaxed">{data.conseils}</p>
              </div>
            )}
            {data.hotels_recommandes && data.hotels_recommandes.length > 0 && (
              <div className="bg-white rounded-2xl p-6 border border-gray-100">
                <h3 className="font-bold text-gray-900 text-lg mb-3">Hôtels recommandés</h3>
                <ul className="space-y-1">
                  {data.hotels_recommandes.map((h) => (
                    <li key={h} className="text-sm text-gray-700 flex items-center gap-2">
                      <span style={{ color: GOLD }}>★</span>{h}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        )
      })()}

      <div className="mt-10 bg-white rounded-2xl p-6 border border-gray-100">
        <h2 className="font-bold text-gray-900 text-xl mb-5" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>Infos pratiques</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {Object.entries(ville.infos_pratiques).map(([key, val]) => {
            const labels: Record<string, string> = {
              langue: '🌐 Langue', monnaie: '💰 Monnaie', meilleure_periode: '📅 Meilleure période',
              appel_priere: '🕌 Appel à la prière', nourriture_halal: '🍽️ Nourriture halal',
              alcool: '🚫 Alcool', tenue: '👗 Tenue', securite: '🛡️ Sécurité',
            }
            return (
              <div key={key}>
                <p className="text-xs font-bold text-gray-400 uppercase tracking-wide mb-0.5">{labels[key] ?? key}</p>
                <p className="text-sm text-gray-700">{val}</p>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
