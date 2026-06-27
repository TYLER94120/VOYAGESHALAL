'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import indexVilles from '@/data/index-villes.json'

interface VilleIndex {
  slug: string
  nom: string
  pays: string
  pays_slug: string
  region: string
  score_halal: number
  mosquees: number
  restaurants_halal: number
  image: string
  aliases: string[]
}

const villes = indexVilles as VilleIndex[]

function normalize(str: string): string {
  return str
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
}

function search(query: string): VilleIndex[] {
  const q = normalize(query.trim())
  if (!q) return []
  return villes.filter((v) => {
    const targets = [v.nom, v.pays, v.region, ...v.aliases].map(normalize)
    return targets.some((t) => t.includes(q))
  })
}

const GOLD = '#c9a870'

export default function SearchBar() {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<VilleIndex[]>([])
  const [open, setOpen] = useState(false)
  const [highlighted, setHighlighted] = useState(-1)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const runSearch = useCallback((q: string) => {
    setResults(search(q))
    setOpen(q.trim().length > 0)
    setHighlighted(-1)
  }, [])

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(() => runSearch(query), 200)
    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [query, runSearch])

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [])

  function navigate(ville: VilleIndex) {
    setOpen(false)
    setQuery(ville.nom)
    router.push(`/destinations/${ville.slug}`)
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (!open) return
    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setHighlighted((h) => Math.min(h + 1, results.length - 1))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setHighlighted((h) => Math.max(h - 1, 0))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (highlighted >= 0 && results[highlighted]) {
        navigate(results[highlighted])
      } else if (results.length === 1) {
        navigate(results[0])
      } else if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`)
        setOpen(false)
      }
    } else if (e.key === 'Escape') {
      setOpen(false)
    }
  }

  return (
    <div ref={containerRef} className="relative w-full max-w-2xl">
      <div className="flex gap-0">
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => { if (query.trim()) setOpen(true) }}
          placeholder="Istanbul, Marrakech, Dubaï, Paris..."
          autoComplete="off"
          className="flex-1 px-5 py-4 bg-white/10 border border-white/20 rounded-l-2xl text-white placeholder-white/50 text-base focus:outline-none focus:bg-white/20 transition-colors"
        />
        <button
          onClick={() => {
            if (results.length === 1) navigate(results[0])
            else if (query.trim()) router.push(`/search?q=${encodeURIComponent(query.trim())}`)
          }}
          className="text-white px-7 py-4 rounded-r-2xl font-semibold text-base hover:opacity-90 transition-opacity whitespace-nowrap"
          style={{ backgroundColor: GOLD }}
        >
          Rechercher
        </button>
      </div>

      {open && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden z-50">
          {results.length === 0 ? (
            <div className="px-5 py-4 text-sm text-gray-500">
              Aucun résultat pour &ldquo;{query}&rdquo;
            </div>
          ) : (
            <ul>
              {results.map((v, i) => (
                <li key={v.slug}>
                  <button
                    className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-gray-50 transition-colors"
                    style={i === highlighted ? { backgroundColor: '#f0fdf4' } : {}}
                    onMouseEnter={() => setHighlighted(i)}
                    onClick={() => navigate(v)}
                  >
                    <div className="w-10 h-10 rounded-lg overflow-hidden shrink-0 bg-gray-100">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={v.image} alt={v.nom} className="w-full h-full object-cover" width={40} height={40} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-gray-900 text-sm">{v.nom}</p>
                      <p className="text-xs text-gray-400">{v.pays} · {v.region}</p>
                    </div>
                    <div className="flex items-center gap-0.5 shrink-0">
                      {Array.from({ length: v.score_halal }).map((_, j) => (
                        <span key={j} style={{ color: GOLD }} className="text-xs">★</span>
                      ))}
                    </div>
                  </button>
                </li>
              ))}
              {results.length > 0 && (
                <li className="border-t border-gray-50">
                  <button
                    className="w-full px-5 py-2.5 text-left text-xs text-gray-400 hover:bg-gray-50 transition-colors"
                    onClick={() => { router.push(`/search?q=${encodeURIComponent(query.trim())}`); setOpen(false) }}
                  >
                    Voir tous les résultats pour &ldquo;{query}&rdquo; →
                  </button>
                </li>
              )}
            </ul>
          )}
        </div>
      )}
    </div>
  )
}
