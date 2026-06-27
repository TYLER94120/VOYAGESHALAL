'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import type { Destination } from '@/lib/types'

const FILTERS = ['Toutes', 'Moyen-Orient', 'Afrique', 'Asie', 'Europe', 'Omra'] as const
type Filter = typeof FILTERS[number]

const CONTINENT_MAP: Record<string, Filter[]> = {
  istanbul: ['Moyen-Orient', 'Europe'],
  marrakech: ['Afrique'],
  dubai: ['Moyen-Orient'],
  'kuala-lumpur': ['Asie'],
  'le-caire': ['Afrique'],
  medine: ['Omra', 'Moyen-Orient'],
  'la-mecque': ['Omra', 'Moyen-Orient'],
  alger: ['Afrique'],
  tunis: ['Afrique'],
  casablanca: ['Afrique'],
  fes: ['Afrique'],
  tanger: ['Afrique'],
  agadir: ['Afrique'],
  paris: ['Europe'],
  londres: ['Europe'],
  marseille: ['Europe'],
  bordeaux: ['Europe'],
  'abu-dhabi': ['Moyen-Orient'],
  doha: ['Moyen-Orient'],
  amman: ['Moyen-Orient'],
  mascate: ['Moyen-Orient'],
  jakarta: ['Asie'],
  bali: ['Asie'],
  maldives: ['Asie'],
}

const BADGES: Record<string, string> = {
  istanbul: 'INCONTOURNABLE',
  marrakech: 'POPULAIRE',
  dubai: 'LUXE',
  'kuala-lumpur': 'TENDANCE',
  'le-caire': 'CULTURELLE',
  medine: 'SPIRITUELLE',
  'la-mecque': 'SPIRITUELLE',
}

interface Props {
  destinations: Destination[]
}

export default function DestinationsClient({ destinations }: Props) {
  const [activeFilter, setActiveFilter] = useState<Filter>('Toutes')

  const filtered = destinations.filter((d) => {
    if (activeFilter === 'Toutes') return true
    return (CONTINENT_MAP[d.slug] ?? []).includes(activeFilter)
  })

  return (
    <>
      <div className="px-4 sm:px-16 py-6 flex gap-2 flex-wrap">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            className="px-4 py-2 rounded-full text-sm font-medium border transition-all"
            style={
              activeFilter === f
                ? { backgroundColor: '#1a3a2a', color: 'white', borderColor: '#1a3a2a' }
                : { backgroundColor: 'white', color: '#555', borderColor: '#e5e7eb' }
            }
          >
            {f}
            {f !== 'Toutes' && (
              <span className="ml-1 text-xs opacity-60">
                ({destinations.filter((d) => (CONTINENT_MAP[d.slug] ?? []).includes(f)).length})
              </span>
            )}
          </button>
        ))}
      </div>

      <section className="max-w-6xl mx-auto px-4 sm:px-8 pb-20">
        {filtered.length === 0 ? (
          <p className="text-center text-gray-400 py-16">Aucune destination dans cette région pour le moment.</p>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-5">
            {filtered.map((d) => (
              <Link
                key={d.slug}
                href={d.url ?? `/destinations/${d.slug}`}
                className="group block relative overflow-hidden bg-white rounded-2xl shadow-sm hover:shadow-md transition-shadow"
                style={{ borderRadius: '9999px 9999px 1rem 1rem' }}
              >
                <div className="relative" style={{ aspectRatio: '3/4' }}>
                  <Image
                    src={d.coverImage}
                    alt={d.city}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                  {BADGES[d.slug] && (
                    <div className="absolute top-4 left-1/2 -translate-x-1/2">
                      <span
                        style={{ backgroundColor: 'rgba(201,168,112,0.92)', color: '#1a3a2a' }}
                        className="text-[10px] font-bold px-3 py-1 rounded-full whitespace-nowrap tracking-widest"
                      >
                        {BADGES[d.slug]}
                      </span>
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 p-4">
                    <div className="text-white font-bold text-base leading-tight">{d.city}</div>
                    <div className="text-white/60 text-xs mt-0.5">{d.country}</div>
                    <div className="mt-2 flex items-center gap-1">
                      {Array.from({ length: 5 }).map((_, i) => (
                        <span key={i} style={{ color: i < d.halalScore ? '#c9a870' : 'rgba(255,255,255,0.3)' }} className="text-xs">★</span>
                      ))}
                    </div>
                    <div style={{ color: '#c9a870' }} className="text-xs mt-2 font-medium">
                      Guide complet →
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </section>
    </>
  )
}
