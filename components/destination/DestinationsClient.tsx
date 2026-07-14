'use client'
import { useState, useMemo, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import { useInstantPosition } from '@/lib/useInstantPosition'
import { getRamadanInfo } from '@/lib/ramadan'
import { QUIZ_DESTS } from '@/lib/quizData'
import { cityEn, countryEn } from '@/lib/poiI18n'
import FavButton from '@/components/ui/FavButton'
import { favId } from '@/lib/favorites'

// Refonte « étagères » (modèle Netflix) : on ne montre plus un mur de 354
// villes mais des rangées curées scannables, une recherche proéminente,
// des filtres sticky et une grille paginée. Vocabulaire honnête partout :
// « halal signalé » / « options halal », jamais « certifié / vérifié ».

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
  villeNonMusulmane?: boolean
  lat?: number | null
  lng?: number | null
}

interface Props { villes: VilleCard[]; continents?: string[] }

// ---- Régions macro ----
const MIDDLE_EAST = new Set(['Émirats Arabes Unis', 'Émirats', 'Arabie Saoudite', 'Qatar', 'Koweït', 'Bahreïn', 'Oman', 'Jordanie', 'Liban', 'Irak', 'Yémen'])
function regionOf(v: VilleCard): string {
  if (MIDDLE_EAST.has(v.pays)) return 'Moyen-Orient'
  const c = v.continent ?? ''
  if (c.startsWith('Amérique')) return 'Amériques'
  if (c === 'Afrique' || c === 'Europe' || c === 'Asie') return c
  return 'Asie'
}
const REGIONS = ['Toutes', 'Moyen-Orient', 'Afrique', 'Asie', 'Europe', 'Amériques']
const REGION_EN: Record<string, string> = { Toutes: 'All regions', 'Moyen-Orient': 'Middle East', Afrique: 'Africa', Asie: 'Asia', Europe: 'Europe', Amériques: 'Americas' }

// ---- Types de voyage (tags réels des fiches) ----
const TRAVEL_TYPES = [
  { id: 'famille', fr: '👨‍👩‍👧 Famille', en: '👨‍👩‍👧 Family', tags: ['famille', 'familial'] },
  { id: 'omra', fr: '🕋 Omra & spirituel', en: '🕋 Umrah & spiritual', tags: ['spirituel', 'sacre', 'sacré', 'pelerinage', 'omra', 'hajj'] },
  { id: 'detente', fr: '🏖️ Détente & plage', en: '🏖️ Beach & relax', tags: ['plage', 'detente', 'resort', 'ile', 'iles', 'balneaire', 'nature', 'mediterranee'] },
  { id: 'culture', fr: '🏛️ Culture', en: '🏛️ Culture', tags: ['culture', 'histoire', 'patrimoine', 'unesco', 'medina'] },
]
const HOLY = new Set(['la-mecque', 'medine'])
const SPIRIT_SLUGS = ['la-mecque', 'medine', 'al-quds', 'kairouan', 'istanbul', 'fes']
const ICONIC_SLUGS = ['istanbul', 'dubai', 'marrakech', 'medine', 'la-mecque', 'kuala-lumpur', 'le-caire', 'amman', 'doha', 'singapour', 'antalya', 'casablanca']

// ---- Étagères émotionnelles (curations éditoriales, slugs réels) ----
// « Halal même loin de chez nous » : grandes villes non-musulmanes emblématiques
const LOIN_SLUGS = ['tokyo', 'new-york', 'paris', 'bangkok', 'barcelone', 'seoul', 'bali', 'londres', 'lisbonne', 'toronto', 'singapour', 'amsterdam']
// « Sur les traces de notre histoire » : héritage islamique majeur
const HISTOIRE_SLUGS = ['grenade', 'cordoue', 'seville', 'istanbul', 'samarcande', 'boukhara', 'le-caire', 'fes', 'al-quds', 'kairouan', 'tolede', 'mostar']
// « Pépites que personne ne connaît »
const PEPITES_SLUGS = ['tafoughalt', 'nizwa', 'khiva', 'mostar', 'banda-aceh', 'merzouga', 'chefchaouen', 'trabzon', 'skopje', 'tirana', 'zagora', 'salalah']
// « Pour une lune de miel inoubliable »
const LUNE_SLUGS = ['maldives', 'zanzibar', 'bali', 'dubai', 'marrakech', 'antalya', 'mascate', 'langkawi', 'cappadoce', 'istanbul']
// « À moins de 4h de vol de la France » — durées réelles uniquement
// (Dubaï ~7 h et Le Caire ~4 h 35 exclus par honnêteté)
const PRES_FRANCE_PAYS = new Set(['Maroc', 'Tunisie', 'Algérie', 'Espagne', 'Portugal', 'Italie', 'Grèce', 'Turquie', 'Bosnie-Herzégovine', 'Albanie', 'Macédoine du Nord', 'Kosovo', 'Malte', 'Royaume-Uni', 'Belgique', 'Pays-Bas', 'Allemagne'])
// « Sûr pour voyager seule » : villes réputées très sûres (aligné sur notre
// guide voyage solo au féminin — repères éditoriaux, à vérifier avant départ)
const SOLO_SLUGS = ['singapour', 'dubai', 'abu-dhabi', 'doha', 'mascate', 'kuala-lumpur', 'istanbul', 'amman', 'tokyo', 'seoul', 'medine', 'casablanca']
// « Où partir cette saison » — par trimestre météo (hémisphère nord)
const SAISON_SLUGS: Record<string, string[]> = {
  hiver: ['dubai', 'doha', 'marrakech', 'louxor', 'bangkok', 'kuala-lumpur', 'maldives', 'mascate', 'dakar', 'zanzibar', 'abu-dhabi', 'agadir'],
  printemps: ['istanbul', 'marrakech', 'grenade', 'amman', 'tokyo', 'fes', 'tunis', 'cordoue', 'samarcande', 'beyrouth', 'izmir', 'chefchaouen'],
  ete: ['sarajevo', 'trabzon', 'antalya', 'skopje', 'tirana', 'mostar', 'londres', 'amsterdam', 'zanzibar', 'cappadoce', 'bali', 'chefchaouen'],
  automne: ['le-caire', 'amman', 'mascate', 'istanbul', 'marrakech', 'grenade', 'samarcande', 'antalya', 'fes', 'doha', 'tunis', 'louxor'],
}
function saisonActuelle(): { key: string; fr: string; en: string } {
  const m = new Date().getMonth() + 1
  if (m === 12 || m <= 2) return { key: 'hiver', fr: 'cet hiver', en: 'this winter' }
  if (m <= 5) return { key: 'printemps', fr: 'ce printemps', en: 'this spring' }
  if (m <= 8) return { key: 'ete', fr: 'cet été', en: 'this summer' }
  return { key: 'automne', fr: 'cet automne', en: 'this autumn' }
}
const BUDGET_COUNTRIES = new Set(['Maroc', 'Turquie', 'Égypte', 'Tunisie', 'Bosnie-Herzégovine', 'Albanie', 'Macédoine du Nord', 'Kosovo', 'Indonésie', 'Malaisie', 'Thaïlande', 'Sénégal', 'Algérie'])
const CHEAP_QUIZ = new Set(QUIZ_DESTS.filter((d) => d.budget === 1).map((d) => d.slug))
const SEA_QUIZ = new Set(QUIZ_DESTS.filter((d) => d.ambiances.includes('plage')).map((d) => d.slug))

// Tag ambiance affiché sur la carte (1 max, priorité éditoriale)
const AMBIANCE_TAGS: [string, string, string][] = [
  ['plage', 'Plage', 'Beach'], ['spirituel', 'Spirituel', 'Spiritual'], ['famille', 'Famille', 'Family'],
  ['culture', 'Culture', 'Culture'], ['histoire', 'Histoire', 'History'], ['nature', 'Nature', 'Nature'],
  ['gastronomie', 'Gastronomie', 'Food'], ['unesco', 'UNESCO', 'UNESCO'],
]

function score10(v: VilleCard): number | null {
  return v.halalScore ?? (v.scoreHalal != null ? Math.round(v.scoreHalal * 2 * 10) / 10 : null)
}
function distKm(a: { lat: number; lng: number }, v: VilleCard): number {
  if (v.lat == null || v.lng == null) return Infinity
  const p = Math.PI / 180, R = 6371
  const x = Math.sin(((v.lat - a.lat) * p) / 2) ** 2 + Math.cos(a.lat * p) * Math.cos(v.lat * p) * Math.sin(((v.lng - a.lng) * p) / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

// ---- Carte destination (spec : image 4:3, ❤️, badge score, 1-2 tags) ----
function DestCard({ v, en, wide }: { v: VilleCard; en: boolean; wide?: boolean }) {
  const s = score10(v)
  const tags = (v.tags ?? []).map((t) => t.toLowerCase())
  const ambiance = AMBIANCE_TAGS.find(([k]) => tags.includes(k))
  const statut = v.villeNonMusulmane ? (en ? 'Halal options' : 'Options halal') : (en ? 'Halal reported' : 'Halal signalé')
  return (
    <Link href={`/destinations/${v.slug}`} className="ville-card group" style={wide ? { width: 236, minWidth: 236, scrollSnapAlign: 'start' } : undefined}>
      <div className="ville-card-img" style={{ height: wide ? 160 : undefined, aspectRatio: wide ? undefined : '4 / 3' }}>
        <Image src={v.image || FALLBACK_IMG} alt={`${en ? 'Halal travel' : 'Voyage halal'} ${v.nom}`} fill loading="lazy" sizes="(max-width: 640px) 60vw, 240px" className="object-cover transition-transform duration-700 group-hover:scale-105" />
        <div className="ville-card-grad" />
        <span style={{ position: 'absolute', top: 8, left: 8, background: 'rgba(255,255,255,0.88)', borderRadius: 20, lineHeight: 0 }}>
          <FavButton size={14} fav={{ id: favId('ville', v.slug), kind: 'ville', nom: v.nom, href: `/destinations/${v.slug}` }} />
        </span>
        {s != null && <span className="ville-card-score">✦ {s}</span>}
      </div>
      <div className="ville-card-body" style={{ padding: '12px 14px 14px' }}>
        <h3 className="ville-card-name" style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 18 }}>{en ? cityEn(v.nom, true) : v.nom}</h3>
        <p className="ville-card-pays">{en ? countryEn(v.pays, true) : v.pays}</p>
        <div className="mt-1.5 flex flex-wrap gap-1.5">
          <span className="ville-card-tag">{statut}</span>
          {ambiance && <span className="ville-card-tag" style={{ background: 'rgba(201,168,76,0.15)', color: '#8A6D1E' }}>{en ? ambiance[2] : ambiance[1]}</span>}
        </div>
      </div>
    </Link>
  )
}

// ---- Étagère horizontale ----
function Shelf({ id, title, villes, en, onSeeAll }: { id: string; title: string; villes: VilleCard[]; en: boolean; onSeeAll: () => void }) {
  if (villes.length < 4) return null
  return (
    <section id={`shelf-${id}`} style={{ marginBottom: 34 }}>
      <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 10, marginBottom: 12 }}>
        <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 21, fontWeight: 800, color: '#0b1a0f', margin: 0 }}>{title}</h2>
        <button onClick={onSeeAll} style={{ background: 'none', border: 'none', color: 'var(--foret)', fontWeight: 700, fontSize: 13.5, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          {en ? 'See all →' : 'Voir tout →'}
        </button>
      </div>
      <div style={{ display: 'flex', gap: 14, overflowX: 'auto', paddingBottom: 8, scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
        {villes.slice(0, 12).map((v) => <DestCard key={v.slug} v={v} en={en} wide />)}
      </div>
    </section>
  )
}

const PAGE_SIZE = 24

export default function DestinationsClient({ villes }: Props) {
  const { lang } = useLanguage()
  const en = lang === 'en'
  const { pos } = useInstantPosition(en)
  const [query, setQuery] = useState('')
  const [region, setRegion] = useState('Toutes')
  const [typeVoyage, setTypeVoyage] = useState<string | null>(null)
  const [budget, setBudget] = useState<'tous' | 'petit'>('tous')
  const [scoreMin, setScoreMin] = useState(0)
  const [sort, setSort] = useState('default')
  const [visible, setVisible] = useState(PAGE_SIZE)
  const [sheetOpen, setSheetOpen] = useState(false)
  const [showSuggest, setShowSuggest] = useState(false)
  const gridRef = useRef<HTMLDivElement>(null)

  const bySlug = useMemo(() => new Map(villes.map((v) => [v.slug, v])), [villes])
  const byScore = useMemo(() => [...villes].sort((a, b) => (b.scoreHalal ?? 0) - (a.scoreHalal ?? 0)), [villes])
  const hasTag = (v: VilleCard, kws: string[]) => (v.tags ?? []).some((t) => kws.includes(t.toLowerCase()))

  // ---- Étagères (une ville max dans 2 étagères après les incontournables) ----
  const ramadan = getRamadanInfo().isActive
  const shelves = useMemo(() => {
    const used = new Map<string, number>()
    const take = (list: VilleCard[], n = 12, cap = 2) => {
      const out: VilleCard[] = []
      for (const v of list) {
        if (out.length >= n) break
        if ((used.get(v.slug) ?? 0) >= cap) continue
        out.push(v); used.set(v.slug, (used.get(v.slug) ?? 0) + 1)
      }
      return out
    }
    const iconic = take(ICONIC_SLUGS.map((s) => bySlug.get(s)).filter(Boolean) as VilleCard[], 12, 99)
    // Proche de toi : tri par distance réelle ; repli Europe tant que la position arrive
    const nearSrc = pos
      ? [...villes].sort((a, b) => distKm(pos, a) - distKm(pos, b)).filter((v) => distKm(pos, v) < 4000)
      : byScore.filter((v) => regionOf(v) === 'Europe')
    const near = take(nearSrc, 12)
    // Étagères émotionnelles (BLOC 3)
    const bySlugs = (slugs: string[]) => slugs.map((s) => bySlug.get(s)).filter(Boolean) as VilleCard[]
    const loin = take([...bySlugs(LOIN_SLUGS), ...byScore.filter((v) => v.villeNonMusulmane)], 12)
    const histoire = take(bySlugs(HISTOIRE_SLUGS), 12)
    const pepites = take(bySlugs(PEPITES_SLUGS), 12)
    const lune = take(bySlugs(LUNE_SLUGS), 12)
    const saison = take(bySlugs(SAISON_SLUGS[saisonActuelle().key] ?? []), 12)
    const presFrance = take(byScore.filter((v) => PRES_FRANCE_PAYS.has(v.pays)), 12)
    const solo = take(bySlugs(SOLO_SLUGS), 12)
    const spirit = take([
      ...SPIRIT_SLUGS.map((s) => bySlug.get(s)).filter(Boolean) as VilleCard[],
      ...byScore.filter((v) => hasTag(v, ['spirituel', 'pelerinage', 'sacre', 'sacré'])),
    ], 12)
    const famille = take(byScore.filter((v) => hasTag(v, ['famille', 'familial'])), 12)
    const budget_ = take(byScore.filter((v) => CHEAP_QUIZ.has(v.slug) || BUDGET_COUNTRIES.has(v.pays)), 12)
    const mer = take(byScore.filter((v) => SEA_QUIZ.has(v.slug) || hasTag(v, ['plage', 'ile', 'iles', 'balneaire', 'mediterranee'])), 12)
    const europe = take(byScore.filter((v) => regionOf(v) === 'Europe'), 12)
    const asie = take(byScore.filter((v) => regionOf(v) === 'Asie' && (v.scoreHalal ?? 0) >= 4), 12)
    const ramadanShelf = ramadan ? take(byScore.filter((v) => !v.villeNonMusulmane), 12, 3) : []
    return { iconic, near, spirit, famille, budget: budget_, mer, europe, asie, ramadanShelf, loin, histoire, pepites, lune, saison, presFrance, solo }
  }, [villes, bySlug, byScore, pos, ramadan])

  // ---- Filtres / grille ----
  const matchType = (v: VilleCard): boolean => {
    if (!typeVoyage) return true
    const def = TRAVEL_TYPES.find((t) => t.id === typeVoyage)
    if (!def) return true
    if (typeVoyage === 'omra' && HOLY.has(v.slug)) return true
    return hasTag(v, def.tags)
  }
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    const list = villes.filter((v) =>
      (!q || v.nom.toLowerCase().includes(q) || v.pays.toLowerCase().includes(q) || cityEn(v.nom, true).toLowerCase().includes(q) || countryEn(v.pays, true).toLowerCase().includes(q))
      && (region === 'Toutes' || regionOf(v) === region)
      && matchType(v)
      && (budget !== 'petit' || CHEAP_QUIZ.has(v.slug) || BUDGET_COUNTRIES.has(v.pays))
      && (v.scoreHalal ?? 0) >= scoreMin
    )
    const sc = (v: VilleCard) => v.scoreHalal ?? 0
    const sorted = [...list]
    if (sort === 'note') sorted.sort((a, b) => sc(b) - sc(a) || a.nom.localeCompare(b.nom, 'fr'))
    else if (sort === 'az') sorted.sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
    else sorted.sort((a, b) => (HOLY.has(b.slug) ? 1 : 0) - (HOLY.has(a.slug) ? 1 : 0) || sc(b) - sc(a) || a.nom.localeCompare(b.nom, 'fr'))
    return sorted
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [villes, query, region, typeVoyage, budget, scoreMin, sort])

  useEffect(() => { setVisible(PAGE_SIZE) }, [query, region, typeVoyage, budget, scoreMin, sort])

  const anyFilter = Boolean(query || region !== 'Toutes' || typeVoyage || budget !== 'tous' || scoreMin > 0)
  const goToGrid = (preset?: () => void) => {
    preset?.()
    setTimeout(() => gridRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }

  const suggestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return []
    return villes
      .filter((v) => v.nom.toLowerCase().includes(q) || v.pays.toLowerCase().includes(q) || cityEn(v.nom, true).toLowerCase().includes(q))
      .slice(0, 7)
  }, [query, villes])

  const CHIPS: { icon: string; fr: string; en: string; go: () => void }[] = [
    { icon: '📍', fr: 'Proche de moi', en: 'Near me', go: () => document.getElementById('shelf-near')?.scrollIntoView({ behavior: 'smooth' }) },
    { icon: '👨‍👩‍👧', fr: 'Famille', en: 'Family', go: () => goToGrid(() => setTypeVoyage('famille')) },
    { icon: '💶', fr: 'Petit budget', en: 'Low budget', go: () => goToGrid(() => setBudget('petit')) },
    { icon: '🕋', fr: 'Omra', en: 'Umrah', go: () => goToGrid(() => setTypeVoyage('omra')) },
    { icon: '🏖️', fr: 'Bord de mer', en: 'Seaside', go: () => goToGrid(() => setTypeVoyage('detente')) },
  ]

  const selectStyle: React.CSSProperties = { padding: '8px 10px', borderRadius: 10, border: '1.5px solid rgba(27,67,50,0.25)', background: '#fff', color: 'var(--foret)', fontSize: 13, fontWeight: 600, cursor: 'pointer', maxWidth: 160 }

  const filterControls = (
    <>
      <select value={region} onChange={(e) => setRegion(e.target.value)} aria-label={en ? 'Region' : 'Région'} style={selectStyle}>
        {REGIONS.map((r) => <option key={r} value={r}>{en ? REGION_EN[r] : r === 'Toutes' ? 'Toutes régions' : r}</option>)}
      </select>
      <select value={typeVoyage ?? ''} onChange={(e) => setTypeVoyage(e.target.value || null)} aria-label={en ? 'Travel type' : 'Type de voyage'} style={selectStyle}>
        <option value="">{en ? 'All types' : 'Tous types'}</option>
        {TRAVEL_TYPES.map((t) => <option key={t.id} value={t.id}>{en ? t.en : t.fr}</option>)}
      </select>
      <select value={budget} onChange={(e) => setBudget(e.target.value as 'tous' | 'petit')} aria-label="Budget" style={selectStyle}>
        <option value="tous">{en ? 'All budgets' : 'Tous budgets'}</option>
        <option value="petit">{en ? '💶 Low budget' : '💶 Petit budget'}</option>
      </select>
      <select value={scoreMin} onChange={(e) => setScoreMin(Number(e.target.value))} aria-label="Score minimum" style={selectStyle}>
        <option value={0}>{en ? 'Any score' : 'Tous scores'}</option>
        <option value={4}>✦ 4+</option>
        <option value={4.5}>✦ 4.5+</option>
      </select>
      <select value={sort} onChange={(e) => setSort(e.target.value)} aria-label={en ? 'Sort' : 'Tri'} style={selectStyle}>
        <option value="default">{en ? '✨ Recommended' : '✨ Recommandé'}</option>
        <option value="note">{en ? '⭐ Top rated' : '⭐ Mieux notées'}</option>
        <option value="az">🔤 A-Z</option>
      </select>
    </>
  )

  return (
    <div>
      {/* ═══ 1. HERO recherche (orienté action) ═══ */}
      <section className="relative overflow-hidden px-4 pt-10 pb-9 text-center" style={{ background: 'linear-gradient(160deg, #0b1a0f 0%, #14301e 100%)' }}>
        <div className="relative z-10 max-w-2xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-5" style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 900 }}>
            {en ? 'Where do you want to travel halal?' : 'Où veux-tu voyager halal ?'}
          </h1>
          <div style={{ position: 'relative' }}>
            <span style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', fontSize: 18, pointerEvents: 'none' }}>🔍</span>
            <input
              type="text"
              placeholder={en ? 'Istanbul, Morocco, seaside…' : 'Istanbul, Maroc, bord de mer…'}
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowSuggest(true) }}
              onFocus={() => setShowSuggest(true)}
              onBlur={() => setTimeout(() => setShowSuggest(false), 150)}
              aria-label={en ? 'Search a city or country' : 'Rechercher une ville ou un pays'}
              style={{ width: '100%', padding: '16px 44px 16px 46px', borderRadius: 16, border: '2px solid var(--or)', background: '#fdfaf3', fontSize: 16, outline: 'none', boxShadow: '0 8px 30px rgba(0,0,0,0.3)' }}
            />
            {showSuggest && suggestions.length > 0 && (
              <div style={{ position: 'absolute', top: '110%', left: 0, right: 0, background: '#fff', borderRadius: 14, boxShadow: '0 12px 40px rgba(0,0,0,0.25)', zIndex: 60, overflow: 'hidden', textAlign: 'left' }}>
                {suggestions.map((v) => (
                  <Link key={v.slug} href={`/destinations/${v.slug}`} style={{ display: 'block', padding: '11px 16px', fontSize: 14.5, color: '#0b1a0f', textDecoration: 'none', borderBottom: '1px solid rgba(0,0,0,0.05)' }}>
                    <strong>{en ? cityEn(v.nom, true) : v.nom}</strong> <span style={{ color: '#9ca3af' }}>— {en ? countryEn(v.pays, true) : v.pays}</span>
                  </Link>
                ))}
              </div>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap', marginTop: 14 }}>
            {CHIPS.map((c) => (
              <button key={c.fr} onClick={c.go}
                style={{ padding: '8px 14px', borderRadius: 30, border: '1px solid rgba(201,168,76,0.45)', background: 'rgba(201,168,76,0.12)', color: '#e9dcbe', fontSize: 13, fontWeight: 700, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {c.icon} {en ? c.en : c.fr}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ 2. Barre de filtres STICKY ═══ */}
      <div style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(253,250,243,0.96)', backdropFilter: 'blur(8px)', borderBottom: '1px solid rgba(27,67,50,0.08)', padding: '10px 16px' }}>
        <div className="max-w-6xl mx-auto" style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          {/* Desktop : selects inline · Mobile : bouton panneau */}
          <div className="hidden sm:flex" style={{ gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>{filterControls}</div>
          <button className="sm:hidden" onClick={() => setSheetOpen(true)}
            style={{ padding: '9px 16px', borderRadius: 30, border: '1.5px solid rgba(27,67,50,0.3)', background: anyFilter ? 'var(--foret)' : '#fff', color: anyFilter ? '#fff' : 'var(--foret)', fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}>
            ⚙️ {en ? 'Filters' : 'Filtres'}{anyFilter ? ' ·' : ''}
          </button>
          {anyFilter && (
            <button onClick={() => { setQuery(''); setRegion('Toutes'); setTypeVoyage(null); setBudget('tous'); setScoreMin(0) }}
              style={{ background: 'none', border: 'none', color: '#b45309', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
              ✕ {en ? 'Clear' : 'Effacer'}
            </button>
          )}
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--texte-2)' }}>
            {filtered.length}/{villes.length} destinations
          </span>
        </div>
      </div>

      {/* Panneau filtres mobile (bottom sheet) */}
      {sheetOpen && (
        <div onClick={() => setSheetOpen(false)} style={{ position: 'fixed', inset: 0, zIndex: 90, background: 'rgba(11,26,15,0.5)' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ position: 'absolute', left: 0, right: 0, bottom: 0, background: '#fdfaf3', borderRadius: '22px 22px 0 0', padding: '18px 18px calc(env(safe-area-inset-bottom, 0px) + 18px)' }}>
            <p style={{ fontWeight: 800, color: '#0b1a0f', margin: '0 0 12px', fontSize: 16 }}>⚙️ {en ? 'Filters' : 'Filtres'}</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>{filterControls}</div>
            <button onClick={() => setSheetOpen(false)} style={{ width: '100%', marginTop: 14, padding: '13px', borderRadius: 14, border: 'none', background: 'var(--foret)', color: '#fff', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
              {en ? `Show ${filtered.length} destinations` : `Voir ${filtered.length} destinations`}
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 sm:px-8 pb-24 pt-8">
        {/* ═══ 3. ÉTAGÈRES (masquées si recherche/filtre actif) ═══ */}
        {!anyFilter && (
          <>
            <Shelf id="iconic" title={en ? '⭐ The essentials' : '⭐ Les incontournables'} villes={shelves.iconic} en={en} onSeeAll={() => goToGrid(() => setSort('note'))} />
            <Shelf id="near" title={en ? `📍 Near you${pos ? ` (${pos.label})` : ''}` : `📍 Proche de toi${pos ? ` (${pos.label})` : ''}`} villes={shelves.near} en={en} onSeeAll={() => goToGrid()} />

            {/* ═══ 5. Encart « indécis » ═══ */}
            <section style={{ margin: '6px 0 34px', background: '#0b1a0f', borderRadius: 20, padding: '22px 22px', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
              <p style={{ color: '#fff', fontWeight: 800, fontSize: 17, margin: 0, flex: 1, minWidth: 220, fontFamily: "'Playfair Display', Georgia, serif" }}>
                {en ? 'Not sure where to go? 🎯' : 'Pas sûr de ta destination ? 🎯'}
              </p>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                <Link href="/quiz" style={{ padding: '11px 18px', borderRadius: 30, background: 'var(--or)', color: '#0b1a0f', fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>
                  {en ? 'Take the quiz (2 min)' : 'Fais le quiz (2 min)'}
                </Link>
                <Link href={en ? '/trip-planner' : '/planificateur'} style={{ padding: '11px 18px', borderRadius: 30, border: '1px solid rgba(201,168,76,0.5)', color: '#e9dcbe', fontWeight: 700, fontSize: 14, textDecoration: 'none' }}>
                  {en ? 'Or let us plan your trip →' : 'Ou laisse-nous planifier ton voyage →'}
                </Link>
              </div>
            </section>

            {shelves.ramadanShelf.length > 0 && (
              <Shelf id="ramadan" title={en ? '🌙 Ramadan & Eid special' : '🌙 Spécial Ramadan / Aïd'} villes={shelves.ramadanShelf} en={en} onSeeAll={() => goToGrid()} />
            )}
            {/* BLOC 3 — étagères émotionnelles */}
            <Shelf id="loin" title={en ? '🌍 Halal even far from home' : '🌍 Halal même loin de chez nous'} villes={shelves.loin} en={en} onSeeAll={() => goToGrid()} />
            <Shelf id="histoire" title={en ? '🕌 In the footsteps of our history' : '🕌 Sur les traces de notre histoire'} villes={shelves.histoire} en={en} onSeeAll={() => goToGrid(() => setTypeVoyage('culture'))} />
            <Shelf id="pepites" title={en ? '💎 Hidden gems nobody knows' : '💎 Pépites que personne ne connaît'} villes={shelves.pepites} en={en} onSeeAll={() => goToGrid()} />
            <Shelf id="lune" title={en ? '💑 For an unforgettable honeymoon' : '💑 Pour une lune de miel inoubliable'} villes={shelves.lune} en={en} onSeeAll={() => goToGrid(() => setTypeVoyage('detente'))} />
            <Shelf id="saison" title={en ? `☀️ Where to go ${saisonActuelle().en}` : `☀️ Où partir ${saisonActuelle().fr}`} villes={shelves.saison} en={en} onSeeAll={() => goToGrid()} />
            <Shelf id="presfrance" title={en ? '✈️ Short flights from Western Europe' : '✈️ À moins de 4h de la France'} villes={shelves.presFrance} en={en} onSeeAll={() => goToGrid()} />
            <Shelf id="solo" title={en ? '👩 Safe for solo female travelers' : '👩 Sûr pour voyager seule'} villes={shelves.solo} en={en} onSeeAll={() => goToGrid()} />
            <Shelf id="spirit" title={en ? '🕋 Spiritual — Umrah, Hajj & holy cities' : '🕋 Spirituel — Omra, Hajj & villes saintes'} villes={shelves.spirit} en={en} onSeeAll={() => goToGrid(() => setTypeVoyage('omra'))} />
            <Shelf id="famille" title={en ? '👨‍👩‍👧 Perfect for families' : '👨‍👩‍👧 Parfait en famille'} villes={shelves.famille} en={en} onSeeAll={() => goToGrid(() => setTypeVoyage('famille'))} />
            <Shelf id="budget" title={en ? '💶 Low budget' : '💶 Petit budget'} villes={shelves.budget} en={en} onSeeAll={() => goToGrid(() => setBudget('petit'))} />
            <Shelf id="mer" title={en ? '🏖️ Seaside & relaxation' : '🏖️ Bord de mer & détente'} villes={shelves.mer} en={en} onSeeAll={() => goToGrid(() => setTypeVoyage('detente'))} />
            <Shelf id="europe" title={en ? '🏰 European getaways' : '🏰 Escapades en Europe'} villes={shelves.europe} en={en} onSeeAll={() => goToGrid(() => setRegion('Europe'))} />
            <Shelf id="asie" title={en ? '🌏 Easy halal in Asia' : '🌏 Halal facile en Asie'} villes={shelves.asie} en={en} onSeeAll={() => goToGrid(() => setRegion('Asie'))} />
          </>
        )}

        {/* ═══ 4. Grille complète paginée ═══ */}
        <div ref={gridRef} style={{ scrollMarginTop: 70 }}>
          <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', fontSize: 22, fontWeight: 800, color: '#0b1a0f', margin: '10px 0 14px' }}>
            {anyFilter ? (en ? 'Results' : 'Résultats') : (en ? 'All destinations' : 'Toutes les destinations')}
            <span style={{ fontSize: 13, color: 'var(--texte-2)', fontWeight: 500, marginLeft: 8 }}>({filtered.length})</span>
          </h2>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
            {filtered.slice(0, visible).map((v) => <DestCard key={v.slug} v={v} en={en} />)}
          </div>
          {filtered.length > visible && (
            <div style={{ textAlign: 'center', marginTop: 22 }}>
              <button onClick={() => setVisible(visible + PAGE_SIZE)}
                style={{ padding: '13px 30px', borderRadius: 30, border: 'none', background: 'var(--foret)', color: '#fff', fontWeight: 800, fontSize: 14.5, cursor: 'pointer' }}>
                {en ? `Load more (${filtered.length - visible} left)` : `Charger plus (${filtered.length - visible} restantes)`}
              </button>
            </div>
          )}
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '50px 20px', color: 'var(--texte-2)' }}>
              <div style={{ fontSize: 44, marginBottom: 12 }}>🔍</div>
              <p>{en ? 'No city found.' : 'Aucune ville trouvée.'}</p>
              <button onClick={() => { setQuery(''); setRegion('Toutes'); setTypeVoyage(null); setBudget('tous'); setScoreMin(0) }}
                style={{ marginTop: 14, padding: '10px 24px', background: 'var(--foret)', color: 'white', border: 'none', borderRadius: 10, cursor: 'pointer', fontWeight: 600 }}>
                {en ? 'Show all cities' : 'Voir toutes les villes'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
