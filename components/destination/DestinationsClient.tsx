'use client'
import { useState, useMemo } from 'react'
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
  tags?: string[]
  halalScore?: number | null
  codeISO?: string
}

// Types de voyage (filtre secondaire sur les tags des villes)
const TRAVEL_TYPES = [
  { id: 'famille', label: 'Famille', icon: '👨‍👩‍👧', tags: ['famille', 'familial'] },
  { id: 'omra', label: 'Omra & Hajj', icon: '🕋', tags: ['spirituel', 'sacre', 'sacré', 'pelerinage', 'omra', 'hajj', '100-halal', 'charia'] },
  { id: 'detente', label: 'Détente', icon: '🏖️', tags: ['plage', 'detente', 'resort', 'ile', 'balneaire', 'nature', 'iles'] },
  { id: 'culture', label: 'Culture', icon: '🏛️', tags: ['culture', 'histoire', 'patrimoine', 'unesco', 'moghol', 'ottoman', 'al-andalus', 'medina'] },
]
const HOLY_SLUGS = ['la-mecque', 'medine']

interface Props {
  villes: VilleCard[]
  continents?: string[]
}

const COUNTRY_EMOJI: Record<string, string> = {
  Maroc: '🇲🇦', Turquie: '🇹🇷', France: '🇫🇷', 'Émirats Arabes Unis': '🇦🇪', Émirats: '🇦🇪',
  'Arabie Saoudite': '🇸🇦', Malaisie: '🇲🇾', Indonésie: '🇮🇩', Égypte: '🇪🇬', Algérie: '🇩🇿',
  Tunisie: '🇹🇳', Jordanie: '🇯🇴', Qatar: '🇶🇦', 'Royaume-Uni': '🇬🇧', Oman: '🇴🇲', Maldives: '🇲🇻',
}

// ---- Régions macro (Moyen-Orient / Afrique / Asie / Europe / Amériques) ----
const MIDDLE_EAST = new Set([
  'Émirats Arabes Unis', 'Émirats', 'Arabie Saoudite', 'Qatar', 'Koweït', 'Bahreïn', 'Oman',
  'Jordanie', 'Liban', 'Irak', 'Yémen',
])
function regionOf(v: VilleCard): string {
  if (MIDDLE_EAST.has(v.pays)) return 'Moyen-Orient'
  const c = v.continent ?? ''
  if (c.startsWith('Amérique')) return 'Amériques'
  if (c === 'Afrique' || c === 'Europe' || c === 'Asie') return c
  return 'Asie'
}
const REGION_ORDER = ['Toutes', 'Moyen-Orient', 'Afrique', 'Asie', 'Europe', 'Amériques']
const REGION_ICON: Record<string, string> = {
  Toutes: '', 'Moyen-Orient': '🕌 ', Afrique: '🌍 ', Asie: '🌏 ', Europe: '🏰 ', Amériques: '🗽 ',
}
const REGION_COLOR: Record<string, string> = {
  'Moyen-Orient': '#1b4332', Afrique: '#b8860b', Asie: '#7c3aed', Europe: '#2563eb', Amériques: '#b91c1c',
}

const HOLY = new Set(['la-mecque', 'medine'])
const SORTS = [
  { id: 'default', label: '✨ Recommandé' },
  { id: 'note', label: '⭐ Mieux notées' },
  { id: 'az', label: '🔤 A-Z' },
  { id: 'region', label: '🌍 Par région' },
]

export default function DestinationsClient({ villes }: Props) {
  const [query, setQuery] = useState('')
  const [filtre, setFiltre] = useState('Toutes')
  const [typeVoyage, setTypeVoyage] = useState<string | null>(null)
  const [sort, setSort] = useState('default')

  const matchType = (v: VilleCard): boolean => {
    if (!typeVoyage) return true
    const def = TRAVEL_TYPES.find((t) => t.id === typeVoyage)
    if (!def) return true
    if (typeVoyage === 'omra' && HOLY_SLUGS.includes(v.slug)) return true
    const tags = (v.tags ?? []).map((x) => x.toLowerCase())
    return def.tags.some((kw) => tags.includes(kw))
  }

  const regions = useMemo(() => {
    const present = new Set(villes.map(regionOf))
    return REGION_ORDER.filter((r) => r === 'Toutes' || present.has(r))
  }, [villes])

  const countOf = (r: string) => (r === 'Toutes' ? villes.length : villes.filter((v) => regionOf(v) === r).length)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = villes.filter((v) => {
      const matchQuery = !q || v.nom.toLowerCase().includes(q) || v.pays.toLowerCase().includes(q)
      const matchRegion = filtre === 'Toutes' || regionOf(v) === filtre
      return matchQuery && matchRegion && matchType(v)
    })
    const score = (v: VilleCard) => v.scoreHalal ?? 0
    const sorted = [...list]
    if (sort === 'note') sorted.sort((a, b) => score(b) - score(a) || a.nom.localeCompare(b.nom, 'fr'))
    else if (sort === 'az') sorted.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
    else if (sort === 'region') sorted.sort((a, b) => regionOf(a).localeCompare(regionOf(b), 'fr') || a.nom.localeCompare(b.nom, 'fr'))
    else {
      // Recommandé : Villes Saintes d'abord, puis score décroissant, puis alpha
      sorted.sort((a, b) => {
        const ha = HOLY.has(a.slug) ? 1 : 0
        const hb = HOLY.has(b.slug) ? 1 : 0
        if (ha !== hb) return hb - ha
        return score(b) - score(a) || a.nom.localeCompare(b.nom, 'fr')
      })
    }
    return sorted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [villes, query, filtre, sort, typeVoyage])

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-24">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-gray-400 py-5">
        <Link href="/" className="hover:text-[#1b4332]">Accueil</Link>
        <span>›</span>
        <span className="text-gray-700">Destinations</span>
      </nav>

      {/* Barre de recherche */}
      <div style={{ position: 'relative', marginBottom: '16px' }}>
        <span style={{ position: 'absolute', left: '16px', top: '50%', transform: 'translateY(-50%)', fontSize: '18px', pointerEvents: 'none' }}>🔍</span>
        <input
          type="text"
          placeholder="Rechercher une ville ou un pays…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          aria-label="Rechercher une destination"
          style={{ width: '100%', padding: '15px 44px 15px 46px', borderRadius: '14px', border: '2px solid var(--or)', background: 'var(--creme)', fontSize: '16px', outline: 'none', boxShadow: '0 4px 20px rgba(201,168,76,0.12)' }}
        />
        {query && (
          <button onClick={() => setQuery('')} aria-label="Effacer" style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', fontSize: '18px', color: 'var(--texte-2)' }}>✕</button>
        )}
      </div>

      {/* Tri + compteur */}
      <div className="flex items-center justify-between flex-wrap gap-3 mb-4">
        <p style={{ color: 'var(--texte-2)', fontSize: '14px' }}>
          <strong style={{ color: 'var(--foret)' }}>{filtered.length}</strong> destination{filtered.length > 1 ? 's' : ''}{query && ` pour « ${query} »`}
        </p>
        <div className="flex items-center gap-2">
          <span style={{ fontSize: '13px', color: 'var(--texte-2)' }}>Trier :</span>
          <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label="Trier les destinations"
            style={{ padding: '8px 12px', borderRadius: '10px', border: '1.5px solid rgba(27,67,50,0.3)', background: 'white', color: 'var(--foret)', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}>
            {SORTS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </div>
      </div>

      {/* Filtres région — mobile/tablette */}
      <div className="filtres-scroll lg:hidden">
        {regions.map((r) => (
          <button key={r} className={`filtre-btn pill-filter ${filtre === r ? 'active' : ''}`} onClick={() => setFiltre(r)}>
            {REGION_ICON[r] ?? ''}{r}
          </button>
        ))}
      </div>

      <div className="dest-layout">
        {/* Sidebar Régions — desktop */}
        <aside className="dest-sidebar">
          <div className="bg-white rounded-2xl p-5 border border-[#1b4332]/5 shadow-[0_6px_20px_rgba(11,26,15,0.04)]">
            <p className="text-base font-bold mb-3" style={{ fontFamily: 'var(--font-playfair), Georgia, serif', color: '#0b1a0f' }}>Régions</p>
            <div className="flex flex-col gap-0.5">
              {regions.map((r) => {
                const active = filtre === r
                return (
                  <button key={r} onClick={() => setFiltre(r)} className="flex items-center justify-between px-3.5 py-2.5 rounded-[10px] text-sm transition-colors"
                    style={{ background: active ? '#1b4332' : 'transparent', color: active ? '#fdfaf3' : '#1a1a1a', fontWeight: active ? 700 : 500 }}>
                    <span>{REGION_ICON[r] ?? ''}{r}</span>
                    <span style={{ opacity: 0.7, fontSize: '12px', fontWeight: 600 }}>{countOf(r)}</span>
                  </button>
                )
              })}
            </div>
          </div>
          {/* Type de voyage */}
          <div className="bg-white rounded-2xl p-5 border border-[#1b4332]/5 shadow-[0_6px_20px_rgba(11,26,15,0.04)] mt-5">
            <p className="text-base font-bold mb-3" style={{ fontFamily: 'var(--font-playfair), Georgia, serif', color: '#0b1a0f' }}>Type de voyage</p>
            <div className="flex flex-col gap-0.5">
              {TRAVEL_TYPES.map((tv) => {
                const active = typeVoyage === tv.id
                return (
                  <button key={tv.id} onClick={() => setTypeVoyage(active ? null : tv.id)} className="flex items-center gap-2.5 px-3.5 py-2.5 rounded-[10px] text-sm transition-colors text-left"
                    style={{ background: active ? '#1b4332' : 'transparent', color: active ? '#fdfaf3' : '#1a1a1a', fontWeight: active ? 700 : 500 }}>
                    <span>{tv.icon}</span>{tv.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="relative overflow-hidden mt-5 rounded-2xl p-5" style={{ background: '#0b1a0f' }}>
            <p className="font-bold mb-1.5" style={{ fontFamily: 'var(--font-playfair), Georgia, serif', color: '#c9a84c', fontSize: '16px' }}>Halal Score™</p>
            <p style={{ color: '#a9b6a8', fontSize: '12.5px', lineHeight: 1.6 }}>Chaque ville est évaluée : restaurants certifiés, mosquées, accueil des familles musulmanes et absence d&apos;alcool.</p>
          </div>
        </aside>

        {/* Grille */}
        <div>
          <div className="grid grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
            {filtered.map((v) => {
              const score10 = v.halalScore ?? (v.scoreHalal != null ? v.scoreHalal * 2 : null)
              return (
                <Link key={v.slug} href={`/destinations/${v.slug}`} className="ville-card group">
                  <div className="ville-card-img">
                    <Image src={v.image || FALLBACK_IMG} alt={`Voyage halal ${v.nom}`} fill sizes="(max-width: 640px) 50vw, 33vw" className="object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="ville-card-grad" />
                    {score10 != null && (
                      <span className="ville-card-score">✦ {score10}</span>
                    )}
                  </div>
                  <div className="ville-card-body">
                    <div className="flex items-center gap-2">
                      <span className="ville-card-iso">{v.codeISO || (COUNTRY_EMOJI[v.pays] ?? '🌍')}</span>
                      <h3 className="ville-card-name" style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}>{v.nom}</h3>
                    </div>
                    <p className="ville-card-pays">{v.pays}</p>
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      <span className="ville-card-tag">✓ Halal vérifié</span>
                      <span className="ville-card-tag-2">Sans alcool</span>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--texte-2)' }}>
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <p>Aucune ville trouvée{query && <> pour « <strong>{query}</strong> »</>}.</p>
              <button onClick={() => { setQuery(''); setFiltre('Toutes'); setTypeVoyage(null) }} style={{ marginTop: '16px', padding: '10px 24px', background: 'var(--foret)', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontWeight: 600 }}>
                Voir toutes les villes
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
