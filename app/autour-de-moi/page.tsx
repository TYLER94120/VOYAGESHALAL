'use client'
import { useState, useRef, useEffect, useCallback, type FormEvent } from 'react'
import 'leaflet/dist/leaflet.css'
import type { Map as LeafletMap, Marker } from 'leaflet'
import { getPosition, describeGeoError, type GeoError, type GeoErrorCode } from '@/lib/geo'
import { useInstantPosition } from '@/lib/useInstantPosition'
import SurMesure from '@/components/lieux/SurMesure'
import { computePrayerTimesFull } from '@/lib/prayerCalc'
import { prixResume } from '@/lib/community'


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
  const etatPos = useInstantPosition()
  const { pos: instantPos } = etatPos
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
      // Méthode et école de l'utilisateur — la même que partout ailleurs.
      const meth = Number((typeof localStorage !== 'undefined' && localStorage.getItem('vh_prayer_method')) || 3)
      const ecole = Number((typeof localStorage !== 'undefined' && localStorage.getItem('vh_prayer_school')) || 0)
      const t = computePrayerTimesFull(instantPos.lat, instantPos.lng, meth, ecole, new Date())
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
  // §D — « Rechercher dans cette zone » n'apparaît QUE si le visiteur a
  // déplacé la carte. Sinon c'est une commande de plus qui encombre.
  const [carteDeplacee, setCarteDeplacee] = useState(false)
  useEffect(() => {
    if (instantPos && !manualMove.current) {
      setPos({ lat: instantPos.lat, lng: instantPos.lng })
      setGeoErr(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [instantPos])

  // ════════ 16 AOÛT — LA CARTE DEVIENT LE RÉSULTAT ════════
  //
  // Ordre de Mohamed : « Aujourd'hui cette page reprend le bloc de
  // l'accueil, puis pose une carte dessous, plus un deuxième champ
  // "Chercher une ville". Trois boîtes qui ne se parlent pas. Ce n'est pas
  // une page, c'est un empilement. » La carte occupe donc TOUT l'écran et
  // les résultats remontent du bas dans une feuille tirable au pouce.
  //
  // Trois positions, parce qu'on ne cherche pas la même chose selon le
  // moment : repliée on regarde la carte, à moitié on compare trois
  // adresses, pleine on parcourt la liste. C'est le pouce qui décide.
  type Feuille = 'repliee' | 'moitie' | 'pleine'
  const [feuille, setFeuille] = useState<Feuille>('moitie')
  const HAUTEUR: Record<Feuille, string> = { repliee: '132px', moitie: '46dvh', pleine: '88dvh' }
  // Le glissé au pouce : on ne retient que le sens et l'ampleur du geste.
  const glisse = useRef<{ y0: number; h0: Feuille } | null>(null)
  // Chaque carte est repérée pour pouvoir la faire remonter quand on
  // touche son épingle — c'est la moitié du lien à double sens.
  const cartesRef = useRef<Map<number | string, HTMLDivElement | null>>(new Map())
  const listeRef = useRef<HTMLDivElement | null>(null)
  // 🕌 NOTRE SIGNATURE : les mosquées restent visibles même quand on
  // cherche à manger. Couche séparée, épingles discrètes.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const mosqueesFondRef = useRef<any[]>([])

  // 📏 LA HAUTEUR DISPONIBLE SE MESURE, ELLE NE SE DEVINE PAS.
  // Le bandeau fin du haut n'a pas la même hauteur selon le téléphone (la
  // marge de sécurité iPhone en mode application le fait grandir). Un
  // « calc(100dvh - 59px) » écrit en dur laisserait la feuille dépasser
  // sous l'écran sur certains appareils, et c'est exactement le genre de
  // défaut que Mohamed photographie.
  const [hautDispo, setHautDispo] = useState<number | null>(null)
  const plein = useRef<HTMLElement | null>(null)
  useEffect(() => {
    const lire = () => {
      const el = plein.current
      if (!el) return
      // On ne devine RIEN : on mesure où cette page commence réellement
      // (sous le bandeau fin, sous l'en-tête sur PC) et où le premier
      // élément fixe du bas vient la recouvrir (la barre d'onglets sur
      // téléphone). Un « calc(100dvh - 59px) » écrit en dur serait faux
      // sur le premier appareil qui ne ressemble pas au mien — et c'est
      // exactement le genre de défaut que Mohamed photographie.
      const haut = el.getBoundingClientRect().top + window.scrollY - window.scrollY
      const nav = document.querySelector('.bottom-nav')
      const r = nav?.getBoundingClientRect()
      const basCouvert = r && getComputedStyle(nav!).position === 'fixed' && r.height ? r.top : window.innerHeight
      setHautDispo(Math.max(320, Math.round(Math.min(basCouvert, window.innerHeight) - haut)))
    }
    lire()
    window.addEventListener('resize', lire)
    const id = setTimeout(lire, 400)  // après que les polices et la barre se soient posées
    return () => { window.removeEventListener('resize', lire); clearTimeout(id) }
  }, [])

  const initMap = useCallback(async (lat: number, lng: number) => {
    if (!mapEl.current) return
    const L = LRef.current || (await import('leaflet')).default
    LRef.current = L
    if (!mapRef.current) {
      const map = L.map(mapEl.current, { center: [lat, lng], zoom: 14, zoomControl: true })
      mapRef.current = map
      // §D — le bouton « Rechercher dans cette zone » n'apparaît qu'après
      // un déplacement VOLONTAIRE (glissé ou zoom), jamais au repos.
      map.on('dragend zoomend', () => setCarteDeplacee(true))
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

  /**
   * 🔗 LE GESTE QUI FAIT LA FUSION (§2.2, « le plus important »).
   *
   * « Sans ce lien, on a deux boîtes côte à côte, c'est-à-dire le problème
   * d'aujourd'hui avec un plus beau dessin. Avec ce lien, on a un outil. »
   *
   * `depuis` dit d'où vient le geste, parce que la bonne réponse n'est pas
   * la même :
   *   · 'fiche'   → on a touché une carte : l'épingle se centre. La feuille
   *                 se replie à moitié si elle était pleine, sinon la carte
   *                 qu'on vient de choisir masque la carte géographique.
   *   · 'epingle' → on a touché une épingle : c'est la FICHE qui doit
   *                 remonter, et la feuille s'ouvre si elle était repliée.
   */
  const select = useCallback((s: Spot, depuis: 'fiche' | 'epingle' = 'fiche') => {
    setSelected(s.id); paint(s.id)
    mapRef.current?.setView([s.lat, s.lng], depuis === 'epingle' ? mapRef.current.getZoom() : 16, { animate: true })
    if (depuis === 'fiche') {
      setFeuille((f) => (f === 'pleine' ? 'moitie' : f))
    } else {
      setFeuille((f) => (f === 'repliee' ? 'moitie' : f))
      // On laisse la feuille finir son mouvement avant de faire glisser la
      // fiche : sinon on défile dans une boîte qui change encore de taille.
      setTimeout(() => cartesRef.current.get(s.id)?.scrollIntoView({ block: 'start', behavior: 'smooth' }), 260)
    }
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
      mk.on('click', () => select(s, 'epingle'))
      markersRef.current.push({ id: s.id, marker: mk, rank, community: s.community })
    })
  }, [select])

  /**
   * 🕌 LES MOSQUÉES RESTENT VISIBLES, MÊME QUAND JE CHERCHE À MANGER.
   *
   * Ordre de Mohamed, §2.3 : « Où que je sois, je vois où prier sans rien
   * demander. Aucune carte au monde ne fait ça — et ça ne coûte rien. »
   *
   * Couche à part, épingles DISCRÈTES : elles ne doivent pas concurrencer
   * les résultats de la recherche en cours, seulement rester là. Quand on
   * cherche déjà des mosquées, cette couche s'efface — sinon on aurait
   * deux épingles pour le même lieu.
   */
  const peindreMosqueesDeFond = useCallback(async (lat: number, lng: number, c: Cat) => {
    const L = LRef.current
    if (!L || !mapRef.current) return
    mosqueesFondRef.current.forEach((m) => m.remove()); mosqueesFondRef.current = []
    if (c === 'mosquees') return
    let liste: { nom: string; lat: number; lng: number }[] = []
    try {
      // Notre propre relais, jamais Overpass depuis le téléphone : c'est ce
      // que Mohamed a photographié deux fois, des tuiles vides en 4G.
      const r = await fetch(`/api/osm-restos?lat=${lat}&lng=${lng}&rayon=4000&quoi=tout`)
      if (r.ok) liste = ((await r.json()).mosquees ?? []).slice(0, 25)
    } catch { return /* la carte vit très bien sans cette couche */ }
    if (!mapRef.current) return
    for (const m of liste) {
      const icone = L.divIcon({
        html: `<div style="width:20px;height:20px;background:rgba(45,106,79,.88);border:2px solid rgba(255,255,255,.9);border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:11px">🕌</div>`,
        className: '', iconSize: [20, 20], iconAnchor: [10, 10],
      })
      const mk = L.marker([m.lat, m.lng], { icon: icone, zIndexOffset: -400, opacity: 0.85 })
        .addTo(mapRef.current)
        .bindTooltip(m.nom, { direction: 'top' })
      mosqueesFondRef.current.push(mk)
    }
  }, [])

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
            .map((o) => {
              const px = prixResume(o.prixVotes)
              return {
                id: `sp-${o.id}`, lat: o.lat, lng: o.lng, name: o.nom,
                sub: px ? `communauté · 💶 ~${px.label}/pers` : 'partagé par la communauté',
                dist: (o.distanceKm ?? 0) * 1000,
                community: true, conf: o.confirmations ?? 0,
              }
            })
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

  // 🕌 La couche mosquées se repeint quand la position OU la catégorie
  // change, et seulement une fois la carte réellement créée. Elle vient
  // APRÈS les résultats : c'est notre signature, pas la réponse à la
  // question posée — elle ne doit jamais retarder ce qu'on a demandé.
  useEffect(() => {
    if (!pos) return
    let annule = false
    const t = setTimeout(() => { if (!annule) peindreMosqueesDeFond(pos.lat, pos.lng, cat) }, 600)
    return () => { annule = true; clearTimeout(t) }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos, cat])

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
    <main ref={plein} className="autour-plein" style={hautDispo ? { height: hautDispo } : { height: '100dvh' }}>
      {/* Titre de page : la carte occupe l'écran, mais la page doit annoncer
          ce qu'elle est (accessibilité lecteurs d'écran + SEO). */}
      <h1 style={{ position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap', border: 0 }}>
        Mosquées, restaurants halal et spots autour de moi
      </h1>

      {/* 🗺️ LA CARTE EST LE FOND, PAS UN ENCART (§2.1).
          « Ce n'est pas une autre fonctionnalité, c'est LA MÊME RECHERCHE,
          EN VUE CARTE. L'accueil répond "quoi", cette page répond "où par
          rapport à moi". »
          Le fond reste OpenStreetMap : Google ne sert QU'AUX DONNÉES des
          lieux. Afficher une carte Google se facture à chaque chargement,
          et sur une page qui vit en plein écran l'addition monterait vite
          — la clé est d'ailleurs restreinte aux Places. */}
      <div ref={mapEl} className="autour-carte" style={{ background: '#dfe6e2' }} />

      {/* La barre du haut, COMPACTE et flottante — pas le gros bloc de
          l'accueil. Le champ « Chercher une ville » a disparu : la barre
          unique comprend déjà « une pâtisserie à Tirana » (règle 1.1). */}
      <div className="autour-barre">
        <div style={{ display: 'flex', gap: 7 }}>
          {([
            { id: 'mosquees' as Cat, icon: '🕌', label: 'Prier' },
            { id: 'restaurants' as Cat, icon: '🍽️', label: 'Manger' },
            { id: 'activites' as Cat, icon: '🎯', label: 'Que faire' },
          ]).map((x) => {
            const on = x.id === cat
            return (
              <button key={x.id} onClick={() => { userChose.current = true; setMoreOpen(false); setCat(x.id) }}
                aria-pressed={on}
                style={{ flex: '1 1 0', minWidth: 0, minHeight: 44, borderRadius: 999, border: `1.5px solid ${on ? 'var(--or)' : 'rgba(27,67,50,0.2)'}`, background: on ? 'var(--foret)' : '#fff', color: on ? '#fff' : 'var(--foret)', fontWeight: 800, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {x.icon} {x.label}
              </button>
            )
          })}
          <button onClick={() => setMoreOpen((v) => !v)} aria-expanded={moreOpen} aria-label="Plus de catégories"
            style={{ flexShrink: 0, minHeight: 44, padding: '0 13px', borderRadius: 999, border: `1.5px solid ${moreOpen || ['hotels', 'boucheries', 'spots'].includes(cat) ? 'var(--or)' : 'rgba(27,67,50,0.2)'}`, background: '#fff', color: 'var(--foret)', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
            ⋯
          </button>
        </div>
        {moreOpen && (
          <div style={{ display: 'flex', gap: 7, marginTop: 7, overflowX: 'auto' }}>
            {CATS.filter((x) => ['hotels', 'boucheries', 'spots'].includes(x.id)).map((x) => {
              const on = x.id === cat
              return (
                <button key={x.id} onClick={() => { userChose.current = true; setCat(x.id) }}
                  style={{ flexShrink: 0, minHeight: 44, padding: '0 15px', borderRadius: 999, border: `1.5px solid ${on ? x.color : 'rgba(27,67,50,0.2)'}`, background: on ? x.color : '#fff', color: on ? '#fff' : 'var(--foret)', fontWeight: 700, fontSize: 14, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  {x.icon} {x.label}
                </button>
              )
            })}
          </div>
        )}
        {/* « Rechercher dans cette zone » n'apparaît QUE si j'ai déplacé la
            carte moi-même — jamais en permanence (§2.2). */}
        {carteDeplacee && (
          <button onClick={() => { setCarteDeplacee(false); searchHere() }}
            style={{ marginTop: 7, minHeight: 44, width: '100%', background: 'var(--nuit)', color: 'var(--or)', fontWeight: 800, fontSize: 14, border: 'none', borderRadius: 999, cursor: 'pointer' }}>
            🔄 Rechercher dans cette zone
          </button>
        )}
      </div>

      {geoErr && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 600, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(11,26,15,0.55)', padding: 24 }}>
          <div style={{ background: '#fff', borderRadius: 18, padding: '28px 24px', maxWidth: 420, textAlign: 'center' }}>
            <div style={{ fontSize: 34, marginBottom: 8 }}>📍</div>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: 'var(--foret)', fontSize: 20, margin: '0 0 6px' }}>{geoErr.message}</h2>
            <p style={{ color: 'var(--texte-2)', fontSize: 14, margin: '0 0 16px' }}>{geoErr.detail}</p>
            <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <button onClick={retry} style={{ minHeight: 44, padding: '0 18px', background: 'var(--foret)', color: '#fff', border: 'none', borderRadius: 12, fontWeight: 700, cursor: 'pointer' }}>Réessayer</button>
              <a href="/destinations?all=1" style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', padding: '0 18px', background: 'rgba(27,67,50,0.08)', color: 'var(--foret)', borderRadius: 12, fontWeight: 700, textDecoration: 'none' }}>Choisir une ville</a>
            </div>
          </div>
        </div>
      )}

      {/* 📄 LA FEUILLE QUI REMONTE DU BAS — les résultats.
          Tirable au pouce, trois positions. Elle s'affiche AVANT la carte :
          dehors, en 4G faible, une carte met du temps, et on ne fait pas
          attendre quelqu'un qui a faim devant un fond qui tourne (§2.4). */}
      <section className="autour-feuille" style={{ height: HAUTEUR[feuille] }} aria-label="Résultats">
        <div
          className="autour-poignee"
          role="button" tabIndex={0}
          aria-label={`Résultats — ${feuille === 'pleine' ? 'liste complète' : feuille === 'moitie' ? 'aperçu' : 'replié'}. Tirer pour agrandir.`}
          onClick={() => setFeuille((f) => (f === 'pleine' ? 'moitie' : f === 'moitie' ? 'pleine' : 'moitie'))}
          onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setFeuille((f) => (f === 'pleine' ? 'moitie' : 'pleine')) } }}
          onTouchStart={(e) => { glisse.current = { y0: e.touches[0].clientY, h0: feuille } }}
          onTouchMove={(e) => {
            const g = glisse.current; if (!g) return
            const d = g.y0 - e.touches[0].clientY  // vers le haut = positif
            if (Math.abs(d) < 34) return
            const ordre: Feuille[] = ['repliee', 'moitie', 'pleine']
            const i = ordre.indexOf(g.h0)
            setFeuille(ordre[Math.min(2, Math.max(0, i + (d > 0 ? 1 : -1)))])
            glisse.current = null
          }}
          onTouchEnd={() => { glisse.current = null }}
        >
          <span className="autour-trait" aria-hidden />
          <p style={{ margin: 0, fontWeight: 800, fontSize: 14, color: 'var(--foret)' }}>
            {loading ? 'Recherche…' : `${spots.length} ${conf.label}`}
            <span style={{ color: 'var(--texte-2)', fontWeight: 600 }}> · {feuille === 'pleine' ? 'tout' : 'tire pour voir'}</span>
          </p>
        </div>
        <div ref={listeRef} className="autour-liste">
      {/* 🧹 Les grandes tuiles de catégorie ont quitté cette place : elles
          sont maintenant dans la barre flottante, par-dessus la carte. On
          n'empile pas, on intègre — elles étaient le même geste, deux fois. */}
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
                style={{ flexShrink: 0, minHeight: 44, display: 'inline-flex', alignItems: 'center', padding: '0 14px', borderRadius: 30, border: `1.5px solid ${on ? 'var(--foret)' : 'rgba(27,67,50,0.2)'}`, background: on ? 'var(--foret)' : '#fff', color: on ? '#fff' : 'var(--texte-2)', fontWeight: 700, fontSize: 12.5, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                {FILTER_LABEL[k]}
              </button>
            )
          })}
          {(cat === 'restaurants' || cat === 'hotels') && (['€', '€€', '€€€'] as const).map((p) => {
            const on = filters.price === p
            return (
              <button key={p} onClick={() => setFilter({ price: on ? '' : p })}
                aria-pressed={on}
                style={{ flexShrink: 0, minHeight: 44, display: 'inline-flex', alignItems: 'center', padding: '0 14px', borderRadius: 30, border: `1.5px solid ${on ? 'var(--foret)' : 'rgba(27,67,50,0.2)'}`, background: on ? 'var(--foret)' : '#fff', color: on ? '#fff' : 'var(--texte-2)', fontWeight: 700, fontSize: 12.5, cursor: 'pointer' }}>
                {p}
              </button>
            )
          })}
        </div>
      )}

      <div style={{ padding: '10px 14px 26px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 12 }}>
        {spots.map((s, i) => (
          // 🔗 Toucher une fiche centre son épingle (§2.2). La fiche
          // sélectionnée se signale par son liseré doré, exactement comme
          // l'épingle grossit sur la carte : c'est la même sélection, vue
          // des deux côtés.
          <div key={s.id} ref={(el) => { cartesRef.current.set(s.id, el) }}
            onClick={() => select(s, 'fiche')}
            aria-current={selected === s.id}
            style={{ background: '#fff', borderRadius: 16, padding: '14px 16px', border: `1.5px solid ${selected === s.id ? SELECTED_GOLD : 'rgba(27,67,50,0.1)'}`, boxShadow: selected === s.id ? '0 0 0 3px rgba(201,168,76,0.25)' : 'none', cursor: 'pointer', display: 'flex', gap: 12, alignItems: 'center', scrollMarginTop: 8 }}>
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
            <a href={`https://www.google.com/maps/dir/?api=1&destination=${s.lat},${s.lng}`} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} style={{ flexShrink: 0, minHeight: 44, display: 'inline-flex', alignItems: 'center', background: 'var(--foret)', color: '#fff', fontWeight: 700, fontSize: 13, borderRadius: 10, padding: '0 14px', textDecoration: 'none' }} aria-label={`Itinéraire Google Maps vers ${s.name}`}>🧭 Itinéraire</a>
          </div>
        ))}
        {!showAll && !loading && allRef.current.length > 5 && (
          <button onClick={() => { showAllRef.current = true; setShowAll(true); paintList(applyFilters(allRef.current, filtersRef.current), cat) }}
            style={{ gridColumn: '1/-1', minHeight: 50, borderRadius: 14, border: '1.5px dashed rgba(27,67,50,0.35)', background: '#fff', color: 'var(--foret)', fontWeight: 800, fontSize: 14.5, cursor: 'pointer' }}>
            Voir plus ({allRef.current.length - 5} autres)
          </button>
        )}
        {/* 🤝 §2.3 — « 0 Spots partagés à proximité » affiché en grand, en
            premier, c'est un accueil décourageant. Ça devient une
            invitation, avec le bouton déjà pré-rempli. On ne dit pas
            « il n'y a rien » : on dit « sois le premier ». */}
        {!loading && !geoErr && spots.length === 0 && (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '18px 12px' }}>
            <p style={{ color: 'var(--texte-2)', fontSize: 14.5, margin: 0, lineHeight: 1.5 }}>
              {allRef.current.length > 0
                ? 'Aucun lieu ne correspond à ces filtres ici — retire un filtre ou élargis la zone.'
                : cat === 'spots'
                  ? 'Sois le premier à partager une adresse ici.'
                  : 'Rien trouvé dans cette zone. Déplace la carte puis « Rechercher dans cette zone ».'}
            </p>
            {allRef.current.length === 0 && (
              <a href={`/ajouter?categorie=${cat}${q ? `&ville=${encodeURIComponent(q)}` : ''}`}
                style={{ marginTop: 12, minHeight: 48, display: 'inline-flex', alignItems: 'center', padding: '0 20px', borderRadius: 999, background: 'var(--foret)', color: '#fff', fontWeight: 800, fontSize: 15, textDecoration: 'none' }}>
                ➕ Ajouter une adresse
              </a>
            )}
          </div>
        )}
      </div>
        </div>
      </section>
    </main>
  )
}
