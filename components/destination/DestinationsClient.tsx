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
  continents: string[]
}

const FILTER_ICON: Record<string, string> = {
  Asie: '🌏 ',
  Afrique: '🌍 ',
  Europe: '🏰 ',
  'Amérique du Nord': '🗽 ',
  'Amérique du Sud': '🌎 ',
  Océanie: '🏝️ ',
}

const COUNTRY_EMOJI: Record<string, string> = {
  Maroc: '🇲🇦', Turquie: '🇹🇷', France: '🇫🇷', 'Émirats Arabes Unis': '🇦🇪', Émirats: '🇦🇪',
  'Arabie Saoudite': '🇸🇦', Malaisie: '🇲🇾', Indonésie: '🇮🇩', Égypte: '🇪🇬', Algérie: '🇩🇿',
  Tunisie: '🇹🇳', Jordanie: '🇯🇴', Qatar: '🇶🇦', 'Royaume-Uni': '🇬🇧', Oman: '🇴🇲', Maldives: '🇲🇻',
}

export default function DestinationsClient({ villes, continents }: Props) {
  const [filtre, setFiltre] = useState('Toutes')

  const villesFiltrees =
    filtre === 'Toutes' ? villes : villes.filter((v) => v.continent === filtre)

  const countOf = (c: string) => (c === 'Toutes' ? villes.length : villes.filter((v) => v.continent === c).length)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-24">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 py-5">
        <Link href="/" className="hover:text-[#1b4332]">Accueil</Link>
        <span>›</span>
        <span className="text-gray-700">Destinations</span>
      </nav>

      {/* Filtres scrollables — mobile/tablette uniquement */}
      <div className="filtres-scroll lg:hidden">
        {continents.map((c) => (
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

      <div className="lg:grid lg:grid-cols-[236px_1fr] lg:gap-9 lg:items-start">
        {/* Sidebar Régions — desktop uniquement */}
        <aside className="hidden lg:block lg:sticky lg:top-24">
          <div className="bg-white rounded-2xl p-5 border border-[#1b4332]/5 shadow-[0_6px_20px_rgba(11,26,15,0.04)]">
            <p className="text-base font-bold mb-3" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: '#0b1a0f' }}>Régions</p>
            <div className="flex flex-col gap-0.5">
              {continents.map((c) => {
                const active = filtre === c
                return (
                  <button
                    key={c}
                    onClick={() => setFiltre(c)}
                    className="flex items-center justify-between px-3.5 py-2.5 rounded-[10px] text-sm transition-colors"
                    style={{ background: active ? '#1b4332' : 'transparent', color: active ? '#fdfaf3' : '#1a1a1a', fontWeight: active ? 700 : 500 }}
                  >
                    <span>{FILTER_ICON[c] ?? ''}{c}</span>
                    <span style={{ opacity: 0.7, fontSize: '12px', fontWeight: 600 }}>{countOf(c)}</span>
                  </button>
                )
              })}
            </div>
          </div>
          <div className="relative overflow-hidden mt-5 rounded-2xl p-5" style={{ background: '#0b1a0f' }}>
            <p className="font-bold mb-1.5" style={{ fontFamily: "var(--font-playfair), Georgia, serif", color: '#c9a84c', fontSize: '16px' }}>Halal Score™</p>
            <p style={{ color: '#a9b6a8', fontSize: '12.5px', lineHeight: 1.6 }}>Chaque ville est évaluée : restaurants certifiés, mosquées, accueil des familles musulmanes et absence d&apos;alcool.</p>
          </div>
        </aside>

        {/* Grille de cards-arches */}
        <div>
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 lg:mt-0 mt-8">
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
      </div>
    </div>
  )
}
