'use client'
import { useState } from 'react'
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
  coverImage?: string
}

const CATEGORY_IMG: Record<string, string> = {
  Destinations: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=600&q=80',
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
  const categories = ['Tous', ...Array.from(new Set(articles.map((a) => a.category)))]
  const [filtre, setFiltre] = useState('Tous')

  const filtered = filtre === 'Tous' ? articles : articles.filter((a) => a.category === filtre)

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 py-12">
      {/* Filtres */}
      <div className="filtres-scroll mb-8">
        {categories.map((c) => (
          <button
            key={c}
            className={`filtre-btn ${filtre === c ? 'active' : ''}`}
            onClick={() => setFiltre(c)}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Grille de cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex flex-col bg-white rounded-2xl overflow-hidden border border-gray-100 hover:shadow-lg hover:border-[#c9a84c]/40 transition-all"
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
              <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
                <span>⏱ {item.readTime}</span>
                <span>·</span>
                <span>
                  {new Date(item.publishedAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
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
                Lire →
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
