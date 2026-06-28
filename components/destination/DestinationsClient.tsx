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
  subtitle?: string
  image?: string
  continent?: string | null
}

interface Props {
  villes: VilleCard[]
  continents: Record<string, string[]>
}

const FILTER_ICON: Record<string, string> = {
  'Moyen-Orient': '🕌 ',
  Afrique: '🌍 ',
  Asie: '🌏 ',
  Europe: '🏰 ',
  Omra: '🕋 ',
}

const COUNTRY_EMOJI: Record<string, string> = {
  Maroc: '🇲🇦', Turquie: '🇹🇷', France: '🇫🇷', 'Émirats Arabes Unis': '🇦🇪', Émirats: '🇦🇪',
  'Arabie Saoudite': '🇸🇦', Malaisie: '🇲🇾', Indonésie: '🇮🇩', Égypte: '🇪🇬', Algérie: '🇩🇿',
  Tunisie: '🇹🇳', Jordanie: '🇯🇴', Qatar: '🇶🇦', 'Royaume-Uni': '🇬🇧', Oman: '🇴🇲', Maldives: '🇲🇻',
}

export default function DestinationsClient({ villes, continents }: Props) {
  const [filtre, setFiltre] = useState('Toutes')

  const villesFiltrees =
    filtre === 'Toutes' ? villes : villes.filter((v) => continents[filtre]?.includes(v.pays))

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-24">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 py-5">
        <Link href="/" className="hover:text-[#1b4332]">Accueil</Link>
        <span>›</span>
        <span className="text-gray-700">Destinations</span>
      </nav>

      {/* Filtres scrollables */}
      <div className="filtres-scroll">
        {Object.keys(continents).map((c) => (
          <button
            key={c}
            className={`filtre-btn pill-filter ${filtre === c ? 'active' : ''}`}
            onClick={() => setFiltre(c)}
          >
            {FILTER_ICON[c] ?? ''}
            {c}
          </button>
        ))}
      </div>

      {/* Grille de cards-arches */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 mt-8">
        {villesFiltrees.map((v) => (
          <div key={v.slug} className="flex flex-col">
            <Link href={`/destinations/${v.slug}`} className="arch-card group" style={{ aspectRatio: '3/4' }}>
              <Image
                src={v.image || FALLBACK_IMG}
                alt={`Voyage halal ${v.nom}`}
                fill
                sizes="(max-width: 640px) 50vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(11,26,15,0.82) 0%, rgba(11,26,15,0.15) 45%, transparent 70%)' }} />

              {/* ✦ Score badge (haut-droite) */}
              {v.scoreHalal != null && (
                <div className="absolute top-3 right-3">
                  <span className="flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#0b1a0f]/80 text-[#c9a84c] backdrop-blur-sm">
                    <span style={{ color: '#c9a84c' }}>✦</span> {v.scoreHalal}/5
                  </span>
                </div>
              )}

              {/* Country badge (haut-centre) */}
              <div className="absolute top-4 left-1/2 -translate-x-1/2">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-white/95 text-[#1b4332] whitespace-nowrap">
                  {v.pays}
                </span>
              </div>

              {/* City + subtitle overlay */}
              <div className="absolute bottom-0 left-0 right-0 p-4 sm:p-5">
                <h3
                  className="text-white font-bold text-xl sm:text-2xl leading-tight flex items-center gap-2"
                  style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
                >
                  <span className="text-lg">{COUNTRY_EMOJI[v.pays] ?? '🌍'}</span>
                  {v.nom}
                </h3>
                {v.subtitle && (
                  <p className="text-white/70 text-[10px] sm:text-xs uppercase tracking-wide mt-1 leading-snug">
                    {v.subtitle}
                  </p>
                )}
                <div className="mt-2 flex flex-wrap gap-1">
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide bg-[#1b4332] text-[#e8d5a3]">
                    Halal vérifié
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wide bg-white/15 text-white/80">
                    Sans alcool
                  </span>
                </div>
              </div>
            </Link>

            {/* Stars + CTA below card */}
            <div className="flex items-center justify-between mt-3 px-1">
              <div className="flex gap-0.5">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span
                    key={i}
                    style={{ color: i < (v.scoreHalal ?? 0) ? '#c9a84c' : '#d6cdba' }}
                    className="text-sm"
                  >
                    ★
                  </span>
                ))}
              </div>
              <Link
                href={`/destinations/${v.slug}`}
                className="text-xs font-semibold text-gray-500 hover:text-[#1b4332]"
              >
                Guide complet →
              </Link>
            </div>
          </div>
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
