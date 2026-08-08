'use client'
import { useState } from 'react'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import Link from 'next/link'
import Image from 'next/image'

export interface BlogCard {
  slug: string
  href: string
  title: string
  description: string
  category: string
  readTime: string
  publishedAt: string
  updatedAt?: string
  coverImage?: string
}

const CATEGORY_IMG: Record<string, string> = {
  Destinations: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80',
  Pratique: 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80',
  Famille: 'https://images.unsplash.com/photo-1511895426328-dc8714191011?w=600&q=80',
  Spiritualité: 'https://images.unsplash.com/photo-1591604466107-ec97de577aff?w=600&q=80',
  Hébergement: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?w=600&q=80',
  Gastronomie: 'https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80',
}
const FALLBACK = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80'

interface Props {
  articles: BlogCard[]
}

export default function BlogClient({ articles }: Props) {
  const { lang } = useLanguage()
  const en = lang === 'en'
  const ALL = 'Tous'
  const categories = [ALL, ...Array.from(new Set(articles.map((a) => a.category)))]
  const [filtre, setFiltre] = useState(ALL)
  // La liste complete faisait 34 ecrans de haut sur un telephone : personne
  // ne descend jusqu'en bas. On sert 12 articles, puis a la demande.
  const PAR_PAGE = 12
  const [visibles, setVisibles] = useState(PAR_PAGE)
  const catLabel = (c: string) => (c === ALL ? (en ? 'All' : 'Tous') : c)

  const filtered = filtre === ALL ? articles : articles.filter((a) => a.category === filtre)
  // SEO : on ne COUPE pas la liste (ce serait autant de liens internes en
  // moins dans le HTML). On rend tout et on masque le surplus en CSS — la
  // page raccourcit pour l'humain, le maillage reste entier pour Google.
  const reste = Math.max(0, filtered.length - visibles)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
      {/* Filtres */}
      <div className="filtres-scroll mb-8">
        {categories.map((c) => (
          <button
            key={catLabel(c)}
            className={`filtre-btn pill-filter ${filtre === c ? 'active' : ''}`}
            onClick={() => { setFiltre(c); setVisibles(PAR_PAGE) }}
          >
            {catLabel(c)}
          </button>
        ))}
      </div>

      {/* Grille de cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item, i) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:border-[#c9a84c]/40 transition-all"
            style={i < visibles ? undefined : { display: 'none' }}
          >
            <div className="relative aspect-[16/10] overflow-hidden">
              <Image
                src={item.coverImage || CATEGORY_IMG[item.category] || FALLBACK}
                alt={item.title}
                fill
                sizes="(max-width:640px) 100vw, 33vw"
                className="object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest bg-[#0b1a0f]/85 text-[#c9a84c] backdrop-blur-sm">
                  {item.category}
                </span>
              </div>
            </div>
            <div className="flex flex-col flex-1 p-5">
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-2 flex-wrap">
                <span>⏱ {item.readTime}</span>
                <span>·</span>
                {/* Fraîcheur : « Mis à jour » visible sur chaque carte */}
                <span className="font-semibold" style={{ color: '#1a6b3c' }}>
                  ✓ {en ? 'Updated' : 'Mis à jour'}{' '}
                  {new Date(item.updatedAt ?? item.publishedAt).toLocaleDateString(en ? 'en-US' : 'fr-FR', { month: 'long', year: 'numeric' })}
                </span>
              </div>
              <h2
                className="font-bold text-gray-900 text-lg leading-snug mb-2 group-hover:text-[#1b4332] transition-colors line-clamp-2"
                style={{ fontFamily: "'Playfair Display', Georgia, serif" }}
              >
                {item.title}
              </h2>
              <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 mb-4">{item.description}</p>
              <span style={{ color: '#c9a84c' }} className="mt-auto text-sm font-semibold">
                {en ? 'Read →' : 'Lire →'}
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Charger la suite — le compte restant est annonce, jamais un « ... » */}
      {reste > 0 && (
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <button
            onClick={() => setVisibles((v) => v + PAR_PAGE)}
            style={{
              minHeight: 56, padding: '0 26px', borderRadius: 16, cursor: 'pointer',
              border: '2px solid rgba(27,67,50,0.25)', background: '#fff',
              color: 'var(--foret)', fontWeight: 800, fontSize: 15.5,
            }}
          >
            {en ? `Show ${Math.min(reste, PAR_PAGE)} more (${reste} left)` : `Voir ${Math.min(reste, PAR_PAGE)} articles de plus (${reste} restants)`}
          </button>
        </div>
      )}
    </div>
  )
}
