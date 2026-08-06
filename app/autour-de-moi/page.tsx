'use client'
import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react'
import 'leaflet/dist/leaflet.css'
import type { Map as LeafletMap, Marker } from 'leaflet'
import { getPosition, describeGeoError, type GeoError, type GeoErrorCode } from '@/lib/geo'
import { useInstantPosition } from '@/lib/useInstantPosition'
import { computePrayerTimesFull } from '@/lib/prayerCalc'


type Cat = 'mosquees' | 'restaurants' | 'hotels' | 'boucheries' | 'activites' | 'spots'
interface Spot {
  id: number | string; lat: number; lng: number; name: string; sub?: string; dist: number
  halal?: 'only' | 'yes' | 'likely'
  // Attributs pour les filtres (issus des données réelles quand disponibles)
  price?: string; sansAlcool?: boolean; sallePriere?: boolean; famille?: boolean
  // Idée 3 : les spots partagés par la communauté passent DEVANT l'annuaire
  community?: boolean; conf?: number
}

// Filtres d'attributs (P4) — appliqués sur la liste courante, pastilles honnêtes
interface Filters { halal: boolean; sansAlcool: boolean; sallePriere: boolean; famille: boolean; price: '' | '€' | '€€' | '€€€' }
const NO_FILTERS: Filters = { halal: false, sansAlcool: false, sallePriere: false, famille: false, price: '' }
function applyFilters(list: Spot[], f: Filters): Spot[] {
  return list.filter((s) =>
    (!f.halal || s.halal === 'yes' || s.halal === 'only') &&
    (!f.sansAlcool || s.sansAlcool === true) &&
    (!f.sallePriere || s.sallePriere === true) &&
    (!f.famille || s.famille === true) &&
    (!f.price || (s.price ?? '').startsWith(f.price) && (s.price ?? '').length === f.price.length)
  )
}
// Filtres pertinents par catégorie (on ne montre que ceux que les données portent)
const FILTERS_BY_CAT: Partial<Record<Cat, (keyof Omit<Filters, 'price'>)[]>> = {
  restaurants: ['halal', 'famille'],
  hotels: ['sansAlcool', 'sallePriere', 'famille'],
  activites: ['famille'],
}
const FILTER_LABEL: Record<keyof Omit<Filters, 'price'>, string> = {
  halal: '✓ Signalé halal',
  sansAlcool: '🚫 Sans alcool',
  sallePriere: '🕌 Salle de prière',
  famille: '👨‍👩‍👧 Adapté familles',
}

// Fusionne les points pré-chargés (instantanés) et les points live OSM en
// dédoublonnant par nom + proximité (< 80 m) : on garde ainsi le meilleur des deux.
function mergeSpots(base: Spot[], extra: Spot[]): Spot[] {
  const out = [...base]
  for (const e of extra) {
    const dup = out.some((b) => b.name.toLowerCase() === e.name.toLowerCase() || haversine(b.lat, b.lng, e.lat, e.lng) < 80)
    if (!dup) out.push(e)
  }
  return out
    .sort((a, b) => (a.community ? 0 : 1) - (b.community ? 0 : 1) || (b.conf ?? 0) - (a.conf ?? 0) || a.dist - b.dist)
    .slice(0, 40)
}

// Valeurs alignées sur l'application native (Claude-app)
const ME_RADIUS_M = 6000
const SELECTED_GOLD = '#c9a84c'
const CATS: { id: Cat; label: string; icon: string; color: string }[] = [
  { id: 'mosquees', label: 'Mosquées', icon: '🕌', color: '#2d6a4f' },
  { id: 'restaurants', label: 'Restaurants halal', icon: '🍽️', color: '#c05621' },
  { id: 'hotels', label: 'Hôtels', icon: '🏨', color: '#2b6cb0' },
  { id: 'activites', label: 'À faire', icon: '🎯', color: '#6b46c1' },
  { id: 'boucheries', label: 'Boucheries halal', icon: '🥩', color: '#97266d' },
  { id: 'spots', label: 'Spots partagés', icon: '🧭', color: '#6b21a8' },
]
// Sources de données : /api/nearby (nos POI géolocalisés, toutes villes) pour
// restaurants/hôtels/activités ; OpenStreetMap live pour mosquées & boucheries.
const NEARBY_TYPES = new Set<Cat>(['restaurants', 'hotels', 'activites'])
const OSM_TYPES = new Set<Cat>(['mosquees', 'boucheries', 'restaurants'])

function haversine(a: number, b: number, c: number, d: number) {
  const R = 6371000, p = Math.PI / 180
  const x = Math.sin(((c - a) * p) / 2) ** 2 + Math.cos(a * p) * Math.cos(c * p) * Math.sin(((d - b) * p) / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}
const fmt = (m: number) => (m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`)


// Marqueurs (idées 1+3) : top 5 = gros et NUMÉROTÉS ; communauté = OR 💎 ;
// au-delà du top 5 (« Voir plus ») = petits points discrets.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function pinIcon(L: any, color: string, icon: string, selected: boolean, rank?: number, community?: boolean) {
  const bg = community ? SELECTED_GOLD : color
  const fg = community ? '#0B1A0F' : '#fff'
  if (rank == null) {
    // hors top 5 : point discret
    return L.divIcon({
      html: `<div style="width:16px;height:16px;background:${bg};opacity:.75;border:2px solid #fff;border-radius:50%;box-shadow:0 1px 4px rgba(0,0,0,.3)"></div>`,
      className: '', iconAnchor: [8, 8],
    })
  }
  const size = selected ? 40 : 34
  const border = selected ? '#0B1A0F' : '#fff'
  return L.divIcon({
    html: `<div style="width:${size}px;height:${size}px;background:${bg};border:3px solid ${border};border-radius:50%;box-shadow:0 3px 10px rgba(0,0,0,.35);display:flex;align-items:center;justify-content:center;transform:scale(${selected ? 1.15 : 1})"><span style="font-size:${selected ? 16 : 14}px;font-weight:900;color:${fg};font-family:system-ui">${community ? '💎' : rank}</span></div>`,
    className: '', iconAnchor: [size / 2, size / 2],
  })
}

export default function AutourDeMoiPage() {
  // Position instantanée (dernière position → ville → Paris → IP → GPS si permis)
  // → les points s'affichent IMMÉDIATEMENT, le GPS n'est qu'un affinage.
  const { pos: instantPos } = useInstantPosition()
  const [cat, setCat] = useState<Cat>('mosquees')
  const [pos, setPos] = useState<{ lat: number; lng: number } | null>(null)
  const [spots, setSpots] = useState<Spot[]>([])
  const [loading, setLoading] = useState(true)
  const [geoErr, setGeoErr] = useState<GeoError | null>(null)
  const [selected, setSelected] = useState<number | string | null>(null)
  const [showAll, setShowAll] = useState(false) // idée 1 : top 5 d'abord
  const [moreOpen, setMoreOpen] = useState(false)
  const showAllRef = useRef(false)
  const userChose = useRef(false) // idée 2 : le choix manuel prime sur le mode auto
  const [filters, setFilters] = useState<Filters>(NO_FILTERS)
  const filtersRef = useRef<Filters>(NO_FILTERS)
  const allRef = useRef<Spot[]>([]) // liste non filtrée de la catégorie courante
  const [q, setQ] = useState('')
  const [searching, setSearching] = useState(false)
  const mapRef = useRef<LeafletMap | null>(null)
  const mapEl = useRef<HTMLDivElement>(null)
  const markersRef = useRef<{ id: number | string; marker: Marker; rank?: number; community?: boolean }[]>([])
  const meMarkerRef = useRef<Marker | null>(null)
  // Points pré-chargés (nos 354 villes) par catégorie — affichés instantanément
  const preRef = useRef<Partial<Record<Cat, Spot[]>>>({})
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const LRef = useRef<any>(null)

  // Idée 2 — « mode Maintenant » : la page s'ouvre déjà sur la bonne réponse.
  // Prière < 45 min → Prier ; 12-14 h / 19-22 h → Manger ; sinon Pépites.
  // Le premier tap de l'utilisateur reprend toujours la main (userChose).
  useEffect(() => {
    if (userChose.current) return
    const h = new Date().getHours()
    if ((h >= 12 && h < 14) || (h >= 19 && h < 22)) setCat('restaurants')
    else if (h >= 22 || h < 6) setCat('spots')
    // sinon on garde Prier (défaut)
  }, [])
  useEffect(() => {
    if (userChose.current || !instantPos) return
    try {
      const t = computePrayerTimesFull(instantPos.lat, instantPos.lng, 3, 0, new Date())
      const now = Date.now()
      const soon = [t.Fajr, t.Dhuhr, t.Asr, t.Maghrib, t.Isha]
        .some((d) => d.getTime() - now > 0 && d.getTime() - now < 45 * 60 * 1000)
      if (soon) setCat('mosquees')
    } catch { /* calcul indisponible → mode horaire */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instantPos])

  // La position instantanée alimente la carte dès qu'elle est résolue (0 ms
  // dans la plupart des cas) et s'affine toute seule (IP puis GPS si permis).
  const manualMove = useRef(false)
  useEffect(() => {
    if (instantPos && !manualMove.current) {
      setPos({ lat: instantPos.lat, lng: instantPos.lng })
      setGeoErr(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instantPos])

  const initMap = useCallback(async (lat: number, lng: number) => {
    if (!mapEl.current) return
    const L = LRef.current || (await import('leaflet')).default
    LRef.current = L
    if (!mapRef.current) {
      const map = L.map(mapEl.current, { center: [lat, lng], zoom: 14, zoomControl: true })
      mapRef.current = map
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map)
    } else {
      mapRef.current.setView([lat, lng], 14)
    }
    // Marqueur « Moi » (position GPS réelle) : créé UNE SEULE FOIS, ne bouge pas
    // quand on recherche une autre ville (évite les doublons).
    if (!meMarkerRef.current) {
      const me = L.divIcon({
        html: `<div style="display:flex;flex-direction:column;align-items:center"><div style="width:26px;height:26px;background:#fff;border:3px solid #2563eb;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 0 0 6px rgba(37,99,235,.18);font-size:14px">🧍</div><span style="margin-top:3px;background:#2563eb;color:#fff;font-size:10px;font-weight:700;border-radius:8px;padding:1px 7px">Moi</span></div>`,
        className: '', iconAnchor: [13, 13],
      })
      meMarkerRef.current = L.marker([lat, lng], { icon: me, zIndexOffset: 1000 }).addTo(mapRef.current)
    }
  }, [])

  const paint = useCallback((selId: number | string | null) => {
    const L = LRef.current; if (!L) return
    const conf = CATS.find((x) => x.id === cat)!
    markersRef.current.forEach(({ id, marker, rank, community }) => marker.setIcon(pinIcon(L, conf.color, conf.icon, id === selId, rank, community)))
  }, [cat])

  const select = useCallback((s: Spot, scroll = false) => {
    setSelected(s.id); paint(s.id)
    mapRef.current?.setView([s.lat, s.lng], 16, { animate: true })
    if (scroll) window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [paint])

  // Dessine la liste (idée 1 : top 5 numéroté ; le reste en petits points si « Voir plus »)
  const paintList = useCallback((list: Spot[], c: Cat) => {
    const visible = showAllRef.current ? list : list.slice(0, 5)
    setSpots(visible)
    const L = LRef.current
    if (!L || !mapRef.current) return
    const conf = CATS.find((x) => x.id === c)!
    markersRef.current.forEach(({ marker }) => marker.remove()); markersRef.current = []
    visible.forEach((s, i) => {
      const rank = i < 5 ? i + 1 : undefined
      const mk = L.marker([s.lat, s.lng], { icon: pinIcon(L, conf.color, conf.icon, false, rank, s.community), zIndexOffset: rank ? 500 - i : 0 }).addTo(mapRef.current)
      mk.on('click', () => select(s))
      markersRef.current.push({ id: s.id, marker: mk, rank, community: s.community })
    })
  }, [select])

  // render = mémorise la liste brute puis peint la version FILTRÉE (P4)
  const render = useCallback((list: Spot[], c: Cat) => {
    allRef.current = list
    paintList(applyFilters(list, filtersRef.current), c)
  }, [paintList])

  // Changement de filtre → re-peint la liste courante (marqueurs + cartes)
  const setFilter = useCallback((patch: Partial<Filters>) => {
    const next = { ...filtersRef.current, ...patch }
    filtersRef.current = next
    setFilters(next)
    paintList(applyFilters(allRef.current, next), cat)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [paintList, cat])

  const search = useCallback(async (lat: number, lng: number, c: Cat) => {
    setSelected(null)
    showAllRef.current = false; setShowAll(false)
    // 1) Affichage INSTANTANÉ depuis nos données pré-chargées (/api/nearby, < 1 s)
    // Spots partagés : couche DISTINCTE, source = /api/spots (seed admin, Redis).
    // Séparée visuellement des données vérifiées ; pas de fusion OSM.
    if (c === 'spots') {
      let sp: Spot[] = []
      try {
        const res = await fetch(`/api/spots?lat=${lat}&lng=${lng}&radius=${ME_RADIUS_M / 1000}`)
        if (res.ok) {
          const j = await res.json()
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          sp = ((j.spots || []) as any[]).map((o) => ({
            id: `sp-${o.id}`, lat: o.lat, lng: o.lng, name: o.nom,
            sub: o.adresse || 'partagé par la communauté', dist: (o.distanceKm ?? 0) * 1000,
            community: true, conf: o.confirmations ?? 0,
          }))
        }
      } catch { /* pas de spots → liste vide */ }
      render(sp, c)
      const L2 = LRef.current
      if (L2 && mapRef.current && sp.length) {
        const pts = [[lat, lng], ...sp.slice(0, 8).map((s) => [s.lat, s.lng])]
        try { mapRef.current.fitBounds(L2.latLngBounds(pts), { padding: [50, 50], maxZoom: 15, animate: true }) } catch { /* noop */ }
      }
      setLoading(false)
      return
    }
    const pre = preRef.current[c] || []
    if (pre.length) { render(pre, c); setLoading(false) } else { setLoading(true) }
    // Idée 3 : les spots COMMUNAUTAIRES de la catégorie passent devant l'annuaire
    let commu: Spot[] = []
    if (c === 'mosquees' || c === 'restaurants') {
      try {
        const res = await fetch(`/api/spots?lat=${lat}&lng=${lng}&radius=${ME_RADIUS_M / 1000}`)
        if (res.ok) {
          const j = await res.json()
          const want = c === 'mosquees' ? ['coin_priere'] : ['resto', 'boucherie']
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          commu = ((j.spots || []) as any[])
            .filter((o) => want.includes(o.categorie ?? 'coin_priere'))
            .map((o) => ({
              id: `sp-${o.id}`, lat: o.lat, lng: o.lng, name: o.nom,
              sub: 'partagé par la communauté', dist: (o.distanceKm ?? 0) * 1000,
              community: true, conf: o.confirmations ?? 0,
            }))
        }
      } catch { /* pas de spots → annuaire seul */ }
    }
    // 2) Complément LIVE OpenStreetMap via NOTRE proxy serveur (fiable, sans CORS)
    let live: Spot[] = []
    if (OSM_TYPES.has(c)) {
      try {
        const res = await fetch(`/api/osm?lat=${lat}&lng=${lng}&kind=${c}&radius=${ME_RADIUS_M}`)
        if (res.ok) { const j = await res.json(); live = (j.items || []) as Spot[] }
      } catch { /* proxy indisponible → on garde les pré-chargés */ }
    }
    let merged = mergeSpots([...commu, ...pre], live)
    // Peu de résultats (petites villes : OSM peu cartographié) → on élargit
    // automatiquement à 20 km pour montrer ce qui existe autour (distance affichée).
    if (merged.length < 5) {
      try {
        const [wideOsm, wideNear] = await Promise.all([
          OSM_TYPES.has(c)
            ? fetch(`/api/osm?lat=${lat}&lng=${lng}&kind=${c}&radius=20000`).then((r) => (r.ok ? r.json() : { items: [] })).catch(() => ({ items: [] }))
            : Promise.resolve({ items: [] }),
          fetch(`/api/nearby?lat=${lat}&lng=${lng}&type=${c}&radius=20`).then((r) => (r.ok ? r.json() : { items: [] })).catch(() => ({ items: [] })),
        ])
        const extra: Spot[] = [
          ...(((wideOsm.items || []) as Spot[])),
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          ...(((wideNear.items || []) as any[]).map((o) => ({
            id: `w-${o.nom}-${o.lat}`, lat: o.lat, lng: o.lng, name: o.nom,
            sub: o.adresse || o.type || o.categorie || '', dist: (o.distanceKm ?? 0) * 1000,
          }))),
        ]
        merged = mergeSpots(merged, extra)
      } catch { /* élargissement best-effort */ }
    }
    render(merged, c)
    // Cadre la carte pour rendre les résultats visibles (utile quand les points
    // pré-chargés sont loin — ex. banlieue → mosquées du centre-ville).
    const L = LRef.current
    if (L && mapRef.current && merged.length) {
      const pts = [[lat, lng], ...merged.slice(0, 8).map((s) => [s.lat, s.lng])]
      try { mapRef.current.fitBounds(L.latLngBounds(pts), { padding: [50, 50], maxZoom: 15, animate: true }) } catch { /* noop */ }
    }
    setLoading(false)
  }, [render])

  // Précharge nos POI géolocalisés via /api/nearby (toutes villes) dès qu'on a la
  // position. Restaurants/hôtels/activités = données réelles ; mosquées & boucheries
  // restent sur OSM (live). Mappe le format fiche-ville vers Spot.
  const preload = useCallback(async (lat: number, lng: number) => {
    try {
      const res = await fetch(`/api/nearby?lat=${lat}&lng=${lng}&type=all&radius=${ME_RADIUS_M / 1000}`)
      if (!res.ok) return
      const j = await res.json()
      const s = j.spots || {}
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const toSpot = (o: any, c: Cat): Spot => {
        const tags = [...(Array.isArray(o.tags) ? o.tags : []), ...(Array.isArray(o.idealPour) ? o.idealPour : [])].join(' ').toLowerCase()
        return {
          id: `${c[0]}-${o.nom}-${o.lat}`,
          lat: o.lat, lng: o.lng, name: o.nom,
          dist: (o.distanceKm ?? 0) * 1000,
          sub: c === 'restaurants' ? (o.type || 'Restaurant') : c === 'hotels' ? (o.categorie || o.priceRange || 'Hôtel') : c === 'mosquees' ? (o.adresse || 'Lieu de prière') : (o.categorie || 'À faire'),
          halal: c === 'restaurants' ? (o.certificationHalal || o.halalConfidence === 'certified' || o.halalConfidence === 'high' ? 'yes' : 'likely') : undefined,
          // Attributs filtres (P4) — uniquement quand la donnée existe vraiment
          price: o.priceRange || o.fourchette_prix || undefined,
          sansAlcool: o.sansAlcool === true || o.sans_alcool === true || undefined,
          sallePriere: o.salleDePreiere === true || o.salle_de_priere === true || undefined,
          famille: tags.includes('famille') || tags.includes('familles') || undefined,
        }
      }
      const pre: Partial<Record<Cat, Spot[]>> = {}
      for (const c of ['restaurants', 'hotels', 'activites', 'mosquees'] as Cat[]) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        pre[c] = ((s[c] || []) as any[]).map((o) => toSpot(o, c))
      }
      preRef.current = pre
    } catch { /* pas de pré-chargement → on tombe sur le live seul */ }
  }, [])

  useEffect(() => {
    if (!pos) return
    ;(async () => {
      await initMap(pos.lat, pos.lng)
      await preload(pos.lat, pos.lng)  // remplit preRef avant la 1re recherche
      await search(pos.lat, pos.lng, cat)
    })()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos])

  useEffect(() => {
    // Nouvelle catégorie → filtres remis à zéro (ils sont contextuels)
    filtersRef.current = NO_FILTERS
    setFilters(NO_FILTERS)
    if (pos) search(pos.lat, pos.lng, cat)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cat])

  const searchHere = async () => {
    const c = mapRef.current?.getCenter(); if (!c) return
    setLoading(true)
    await preload(c.lat, c.lng)
    await search(c.lat, c.lng, cat)
  }
  // Recherche d'une ville : on RESTE sur la carte, on se recentre dessus et on
  // recharge les points autour (mêmes onglets). Ex. « Berkane » → focus Berkane.
  const goToCity = async (e: FormEvent) => {
    e.preventDefault()
    const query = q.trim(); if (!query || searching) return
    setSearching(true); setGeoErr(null)
    try {
      const res = await fetch(`/api/geocode?q=${encodeURIComponent(query)}`)
      if (res.ok) {
        const j = await res.json()
        if (typeof j.lat === 'number') {
          manualMove.current = true // la ville choisie prime sur les affinages auto
          setPos({ lat: j.lat, lng: j.lng }) // déclenche recentrage + rechargement
          if (j.name) setQ(j.name)
        }
      }
    } catch { /* géocodage indisponible */ } finally { setSearching(false) }
  }
  const retry = async () => {
    setGeoErr(null); setLoading(true)
    try { const p = await getPosition(); setPos({ lat: p.lat, lng: p.lng }) } catch (code) { setGeoErr(describeGeoError(code as GeoErrorCode)); setLoading(false) }
  }

  const conf = CATS.find((x) => x.id === cat)!

  return (
    <main style={{ background: 'var(--creme)', minHeight: '100vh' }}>
      <div style={{ position: 'relative' }}>
        <div ref={mapEl} style={{ height: '62vh', minHeight: 380, width: '100%', background: '#dfe6e2', zIndex: 1 }} />

        <div style={{ position: 'absolute', top: 12, left: 12, right: 12, zIndex: 500, display: 'flex', flexDirection: 'column', gap: 8, pointerEvents: 'none' }}>
          <form onSubmit={goToCity} style={{ pointerEvents: 'auto', display: 'flex', gap: 6, boxShadow: '0 6px 20px rgba(0,0,0,.15)', borderRadius: 14, background: '#fff', padding: 4 }}>
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Chercher une ville (Berkane, Istanbul…)"
              aria-label="Chercher une ville sur la carte"
              style={{ flex: 1, border: 'none', outline: 'none', fontSize: 15, padding: '10px 12px', borderRadius: 12, color: 'var(--nuit)', background: 'transparent' }}
            />
            <button type="submit" disabled={searching} style={{ border: 'none', background: 'var(--foret)', color: '#fff', fontWeight: 700, fontSize: 14, borderRadius: 12, padding: '0 16px', cursor: searching ? 'wait' : 'pointer' }}>
              {searching ? '…' : '🔍'}
            </button>
          </form>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            <span style={{ pointerEvents: 'auto', background: 'var(--foret)', color: '#fff', fontWeight: 700, fontSize: 13.5, borderRadius: 30, padding: '8px 14px', boxShadow: '0 4px 14px rgba(0,0,0,.18)' }}>
              {loading ? 'Recherche…' : `${spots.length} ${conf.label} à proximité`}
            </span>
            <button onClick={searchHere} style={{ pointerEvents: 'auto', background: '#fff', color: 'var(--nuit)', fontWeight: 700, fontSize: 13.5, border: 'none', borderRadius: 30, padding: '8px 14px', cursor: 'pointer', boxShadow: '0 4px 14px rgba(0,0,0,.18)' }}>
              🔄 Rechercher dans cette zone
            </button>
          </div>
        </div>

        {geoErr && (
          <div style={{ position: 'absolute', inset: 0, zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(11,26,15,0.55)', padding: 24 }}>
            <div style={{ background: '#fff', borderRadius: 18, padding: '28px 24px', maxWidth: 420, textAlign: 'center' }}>
              <div style={{ fontSize: 34, marginBottom: 8 }}>📍</div>
              <h2 style={{ fontFamily: "'Playfair Display', serif", color: 'var(--foret)', fontSize: 20, margin: '0 0 6px' }}>{geoErr.message}</h2>
              <p style={{ color: 'var(--texte-2)', fontSize: 14, margin: '0 0 16px' }}>{geoErr.detail}</p>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
                <button onClick={retry} style={{ padding: '10px 18px', background: 'var(--foret)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>Réessayer</button>
                <a href="/destinations?all=1" style={{ padding: '10px 18px', background: 'rgba(27,67,50,0.08)', color: 'var(--foret)', borderRadius: 12, fontWeight: 700, textDecoration: 'none' }}>Choisir une ville</a>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Idée 1 : UNE question — « Tu cherches quoi, là ? » 3 grandes tuiles + Plus… */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr auto', gap: 8, padding: '14px 14px 4px' }}>
        {([
          { id: 'mosquees' as Cat, icon: '🕌', label: 'Prier' },
          { id: 'restaurants' as Cat, icon: '🍽', label: 'Manger' },
          { id: 'spots' as Cat, icon: '💎', label: 'Pépites' },
        ]).map((x) => {
          const on = x.id === cat
          return (
            <button key={x.id} onClick={() => { userChose.current = true; setMoreOpen(false); setCat(x.id) }}
              style={{ minHeight: 58, borderRadius: 16, border: `2px solid ${on ? 'var(--or)' : 'rgba(27,67,50,0.18)'}`, background: on ? 'var(--foret)' : '#fff', color: on ? '#fff' : 'var(--foret)', fontWeight: 800, fontSize: 15, cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 2 }}>
              <span style={{ fontSize: 20 }}>{x.icon}</span>{x.label}
            </button>
          )
        })}
        <button onClick={() => setMoreOpen((v) => !v)} aria-expanded={moreOpen}
          style={{ minHeight: 58, padding: '0 14px', borderRadius: 16, border: `2px solid ${moreOpen || ['hotels', 'activites', 'boucheries'].includes(cat) ? 'var(--or)' : 'rgba(27,67,50,0.18)'}`, background: '#fff', color: 'var(--foret)', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
          ⋯
        </button>
      </div>
      {moreOpen && (
        <div style={{ display: 'flex', gap: 8, padding: '6px 14px 0', overflowX: 'auto' }}>
          {CATS.filter((x) => ['hotels', 'activites', 'boucheries'].includes(x.id)).map((x) => {
            const on = x.id === cat
            return (
              <button key={x.id} onClick={() => { userChose.current = true; setCat(x.id) }}
                style={{ flexShrink: 0, display: 'flex', alignItems: 'center', gap: 6, padding: '9px 16px', borderRadius: 30, border: `1.5px solid ${on ? x.color : 'rgba(27,67,50,0.2)'}`, background: on ? x.color : '#fff', color: on ? '#fff' : 'var(--foret)', fontWeight: 700, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                <span>{x.icon}</span>{x.label}
              </button>
            )
          })}
        </div>
      )}

      {/* Filtres d'attributs contextuels (P4) — n'apparaissent que si la
          catégorie porte ces données. « Signalé halal », jamais « certifié ». */}
      {(FILTERS_BY_CAT[cat]?.length || cat === 'restaurants' || cat === 'hotels') && (
        <div style={{ display: 'flex', gap: 6, padding: '8px 14px 0', overflowX: 'auto', alignItems: 'center' }}>
          <span style={{ fontSize: 12, color: 'var(--texte-2)', fontWeight: 700, flexShrink: 0 }}>Filtres :</span>
          {(FILTERS_BY_CAT[cat] ?? []).map((k) => {
            const on = filters[k]
            return (
              <button key={k} onClick={() => setFilter({ [k]: !on } as Partial<Filters>)}
                aria-pressed={on}
                style={{ flexShrink: 0, padding: '6px 12px', borderRadius: 30, border: `1.5px solid ${on ? 'var(--foret)' : 'rgba(27,67,50,0.2)'}`, background: on ? 'var(--foret)' : '#fff', color: on ? '#fff' : 'var(--texte-2)', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {FILTER_LABEL[k]}
              </button>
            )
          })}
          {(cat === 'restaurants' || cat === 'hotels') && (['€', '€€', '€€€'] as const).map((p) => {
            const on = filters.price === p
            return (
              <button key={p} onClick={() => setFilter({ price: on ? '' : p })}
                aria-pressed={on}
                style={{ flexShrink: 0, padding: '6px 12px', borderRadius: 30, border: `1.5px solid ${on ? 'var(--foret)' : 'rgba(27,67,50,0.2)'}`, background: on ? 'var(--foret)' : '#fff', color: on ? '#fff' : 'var(--texte-2)', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
                {p}
              </button>
            )
          })}
        </div>
      )}

      <div style={{ padding: '10px 14px 90px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {spots.map((s, i) => (
          <div key={s.id} onClick={() => select(s, true)}
            style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', border: `1.5px solid ${selected === s.id ? SELECTED_GOLD : 'rgba(27,67,50,0.1)'}`, cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center' }}>
            <div style={{ width: 42, height: 42, borderRadius: 12, background: conf.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, flexShrink: 0 }}>{conf.icon}</div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--texte)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                {s.name}{i === 0 && <span style={{ marginLeft: 6, background: SELECTED_GOLD, color: '#0B1A0F', fontSize: 10, fontWeight: 800, borderRadius: 10, padding: '1px 7px' }}>la + proche</span>}
              </p>
              <p style={{ fontSize: 12.5, color: 'var(--texte-2)', margin: '2px 0 0', textTransform: 'capitalize' }}>
                {s.halal === 'likely' ? '≈ halal à vérifier · ' : s.halal ? '✓ signalé halal · ' : ''}{s.sub} · <strong style={{ color: 'var(--foret)' }}>{fmt(s.dist)}</strong>
              </p>
              {(s.sansAlcool || s.sallePriere || s.famille || s.price) && (
                <p style={{ margin: '4px 0 0', display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                  {s.sansAlcool && <span style={{ fontSize: 10.5, fontWeight: 700, background: 'rgba(27,67,50,0.08)', color: 'var(--foret)', borderRadius: 10, padding: '2px 8px' }}>🚫 sans alcool</span>}
                  {s.sallePriere && <span style={{ fontSize: 10.5, fontWeight: 700, background: 'rgba(27,67,50,0.08)', color: 'var(--foret)', borderRadius: 10, padding: '2px 8px' }}>🕌 salle de prière</span>}
                  {s.famille && <span style={{ fontSize: 10.5, fontWeight: 700, background: 'rgba(27,67,50,0.08)', color: 'var(--foret)', borderRadius: 10, padding: '2px 8px' }}>👨‍👩‍👧 familles</span>}
                  {s.price && <span style={{ fontSize: 10.5, fontWeight: 700, background: 'rgba(27,67,50,0.08)', color: 'var(--foret)', borderRadius: 10, padding: '2px 8px' }}>{s.price}</span>}
                </p>
              )}
            </div>
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0, background: 'var(--foret)', color: '#fff', fontWeight: 700, fontSize: 13, borderRadius: 10, padding: '9px 12px', textDecoration: 'none' }} aria-label={`Itinéraire Google Maps vers ${s.name}`}>🧭 Itinéraire</a>
          </div>
        ))}
        {!showAll && !loading && allRef.current.length > 5 && (
          <button onClick={() => { showAllRef.current = true; setShowAll(true); paintList(applyFilters(allRef.current, filtersRef.current), cat) }}
            style={{ gridColumn: '1/-1', minHeight: 50, borderRadius: 14, border: '1.5px dashed rgba(27,67,50,0.35)', background: '#fff', color: 'var(--foret)', fontWeight: 800, fontSize: 14.5, cursor: 'pointer' }}>
            Voir plus ({allRef.current.length - 5} autres)
          </button>
        )}
        {!loading && !geoErr && spots.length === 0 && (
          <p style={{ gridColumn: '1/-1', textAlign: 'center', color: 'var(--texte-2)', padding: 20 }}>
            {allRef.current.length > 0
              ? 'Aucun lieu ne correspond à ces filtres ici — retire un filtre ou élargis la zone.'
              : 'Rien trouvé dans cette zone. Déplace la carte puis « Rechercher dans cette zone ».'}
          </p>
        )}
      </div>
    </main>
  )
}
