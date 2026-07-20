'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { cuisineCategory, CATEGORY_ORDER } from '@/lib/cuisineCategory'
import { enLabel, countryEn } from '@/lib/poiI18n'
import { useState, useRef } from 'react'
import Image from 'next/image'
import IslamicPattern from '@/components/ui/IslamicPattern'
import { useToast } from '@/components/Toast'
import EbookButton from '@/components/villes/EbookButton'
import LiveSpots from '@/components/villes/LiveSpots'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import HotelCTA from '@/components/affiliate/HotelCTA'
import HotelFilter from '@/components/villes/HotelFilter'
import { coordsOf, type LatLng } from '@/lib/hotelFilter'
import FavButton from '@/components/ui/FavButton'
import PlacePhoto from '@/components/ui/PlacePhoto'
import { favId } from '@/lib/favorites'
import { getCityGuide } from '@/lib/cityGuides'
import GuideCarousel from '@/components/villes/GuideCarousel'

// Sections guidées (refonte « Netflix » des fiches) — libellés orientés usage
const TABS = [
  { id: 'mosquees', icon: '🕌', label: 'Où prier', labelEn: 'Where to pray' },
  { id: 'restaurants', icon: '🍽', label: 'Où manger', labelEn: 'Where to eat' },
  { id: 'hotels', icon: '🏨', label: 'Où dormir', labelEn: 'Where to stay' },
  { id: 'activites', icon: '🎯', label: 'Que faire', labelEn: 'What to do' },
  { id: 'pratique', icon: '💡', label: 'Bon à savoir', labelEn: 'Good to know' },
]

// Lieu « curé » = données RÉELLES suffisantes pour une vraie profondeur
// (description rédigée non-OSM). Sinon → longue traîne honnête, jamais inventée.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
function isCurated(r: any): boolean {
  // Curé = source RÉELLE avec note réelle : Google (note + nb d'avis).
  // Les entrées « éditoriales » sans source ont été purgées (zéro invention).
  return r?.source === 'google' && typeof r?.note === 'number' && (r?.nombreAvis ?? 0) >= 20
}

const CATEGORY_EMOJI: Record<string, string> = {
  'Traditionnel local': '🍜', Marocain: '🫕', 'Libanais & Levant': '🥙',
  'Indien & Pakistani': '🍛', 'Pizza & Italien': '🍕', 'Japonais & Asiatique': '🍣',
  'Burgers & Fast-food': '🍔', Gastronomique: '🍽', 'Végétarien & Healthy': '🥗',
  'Pâtisserie & Café': '☕', 'Grillades & Kebab': '🔥', 'Fruits de mer': '🦐', Turc: '🥙',
}

// Bandeau visuel par type de cuisine (cartes restos) : dégradé chaleureux +
// grand emoji — élégant et cohérent, sans photo non vérifiable.
const CATEGORY_GRADIENT: Record<string, [string, string]> = {
  'Traditionnel local': ['#7c2d12', '#c2410c'], Marocain: ['#7f1d1d', '#b45309'],
  'Libanais & Levant': ['#365314', '#84cc16'], 'Indien & Pakistani': ['#7c2d12', '#f59e0b'],
  'Pizza & Italien': ['#7f1d1d', '#ef4444'], 'Japonais & Asiatique': ['#1e293b', '#e11d48'],
  'Burgers & Fast-food': ['#78350f', '#f59e0b'], Gastronomique: ['#0b1a0f', '#c9a84c'],
  'Végétarien & Healthy': ['#14532d', '#4ade80'], 'Pâtisserie & Café': ['#44403c', '#a8846b'],
  'Grillades & Kebab': ['#450a0a', '#ea580c'], 'Fruits de mer': ['#0c4a6e', '#38bdf8'], Turc: ['#7f1d1d', '#dc2626'],
}
const DEFAULT_GRADIENT: [string, string] = ['#0b1a0f', '#2d6a4f']

export default function VilleDesktop({ ville }: { ville: any }) {
  const [activeTab, setActiveTab] = useState<string | null>(null) // null = aucun onglet allumé au départ
  const displayTab = activeTab ?? 'restaurants' // contenu affiché par défaut (sans orange)
  const [activeFilter, setActiveFilter] = useState('Tous')
  // Poids DOM / Core Web Vitals : on rend 20 restaurants (indexés en SSR),
  // le reste s'affiche au clic « Voir plus » — même contenu, page 6× plus légère.
  const [visibleRestos, setVisibleRestos] = useState(20)
  // Correctif UX : filtre « signalé halal uniquement » (masque les « à vérifier »)
  const [halalOnly, setHalalOnly] = useState(false)
  // Refonte « guide » : la longue liste OSM est REPLIÉE par défaut — le guide
  // répond d'abord, la liste complète reste là pour ceux qui fouillent.
  const [showAllRestos, setShowAllRestos] = useState(false)
  // Vue détail des lieux CURÉS (profondeur réelle) — null = fermée
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [detail, setDetail] = useState<{ kind: 'resto' | 'mosquee' | 'activite' | 'hotel'; item: any } | null>(null)
  const toast = useToast()
  const contentRef = useRef<HTMLDivElement>(null)
  const { lang } = useLanguage()
  const en = lang === 'en'

  // Clic sur un onglet → affiche le contenu de la fiche (mosquées incluses : on a les
  // vraies données OSM bakées, plus besoin de la géoloc qui pouvait échouer).
  const goToTab = (id: string) => {
    setActiveTab(id)
    setTimeout(() => contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }

  const image = ville.image || ville.image_hero
  // Bannière « majorité musulmane » UNIQUEMENT si le pays est positivement
  // à majorité musulmane (liste blanche) — dans le doute : bannière neutre.
  const PAYS_MAJORITE_MUSULMANE = new Set(['Maroc', 'Algérie', 'Tunisie', 'Libye', 'Égypte', 'Mauritanie', 'Sénégal', 'Mali', 'Niger', 'Soudan', 'Somalie', 'Djibouti', 'Comores', 'Gambie', 'Guinée', 'Turquie', 'Arabie Saoudite', 'Émirats Arabes Unis', 'Émirats', 'Qatar', 'Koweït', 'Bahreïn', 'Oman', 'Yémen', 'Jordanie', 'Irak', 'Iran', 'Syrie', 'Liban', 'Palestine', 'Pakistan', 'Afghanistan', 'Bangladesh', 'Indonésie', 'Malaisie', 'Brunei', 'Maldives', 'Ouzbékistan', 'Turkménistan', 'Tadjikistan', 'Kirghizistan', 'Kazakhstan', 'Azerbaïdjan', 'Albanie', 'Kosovo', 'Bosnie-Herzégovine', 'Tchad', 'Burkina Faso', 'Sierra Leone', 'Nigeria'])
  const villeNonMusulmane = !PAYS_MAJORITE_MUSULMANE.has(String(ville.pays ?? ''))
  const halalScore = ville.halalScore ?? (ville.score_halal ? Math.round(ville.score_halal * 2 * 10) / 10 : null)
  const restaurants = ville.restaurants ?? []
  const mosquees = ville.mosqueesPrincipales ?? []
  const hotels = ville.hotels ?? []
  const activites = ville.activites ?? []
  const coords = ville.coordonnees ?? null
  const hasCoords = coords && typeof coords.lat === 'number' && typeof coords.lng === 'number'
  // Coordonnées pour le score « bien situé » du filtre hôtels (mosquées + restos halal)
  const mosquesLL: LatLng[] = mosquees.map((m: any) => coordsOf(m)).filter(Boolean) as LatLng[]
  const restosLL: LatLng[] = restaurants.map((r: any) => coordsOf(r)).filter(Boolean) as LatLng[]
  const centerLL: LatLng | null = hasCoords ? { lat: coords.lat, lng: coords.lng } : null
  const ip = ville.infoPratique ?? {}
  const legacyIp = ville.infos_pratiques ?? {}
  const descFr = typeof ville.description === 'string' ? ville.description : (ville.description?.court ?? ville.description?.long ?? '')
  // Sur le domaine EN, on affiche la description anglaise si elle existe
  const descShort = (en && ville.description_en) ? ville.description_en : descFr

  // Traçabilité : source + date de vérification affichées sur chaque adresse
  // (crédibilise le Halal Trust Score). OSM = donnée ouverte datée ; sinon = éditorial.
  const fmtDate = (iso?: string) => {
    if (!iso) return ''
    try { return new Date(iso).toLocaleDateString(en ? 'en-US' : 'fr-FR', { month: 'short', year: 'numeric' }) } catch { return '' }
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const srcTag = (item: any): string => {
    if (item?.source === 'google') {
      return en ? 'Google Maps · real rating' : 'Google Maps · note réelle'
    }
    if (item?.source === 'osm') {
      const dt = fmtDate(ville.osmEnrichedAt)
      return en ? `OpenStreetMap${dt ? ` · updated ${dt}` : ''}` : `OpenStreetMap${dt ? ` · mis à jour ${dt}` : ''}`
    }
    return en ? 'GoHalalTravel editorial pick' : 'Sélection éditoriale VoyagesHalal'
  }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const SourceLine = ({ item }: { item: any }) => (
    <p style={{ fontSize: 11, color: 'var(--texte-2)', margin: '7px 0 0', opacity: 0.7 }}>ℹ️ {srcTag(item)}</p>
  )

  // Types OSM bruts (« seafood, italian pizza… ») normalisés vers nos catégories
  // éditoriales → pastilles de filtre propres et stables.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const present = new Set(restaurants.map((r: any) => cuisineCategory(r.type)))
  const categories = ['Tous', ...CATEGORY_ORDER.filter((c) => present.has(c))]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // ── Curation « Netflix » : profondeur réelle uniquement, zéro invention ──
  const normName = (s: string) => String(s).normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const curatedRestos = restaurants.filter(isCurated).sort((a: any, b: any) => (Number(b.note ?? 0) - Number(a.note ?? 0)) || (Number(b.nombreAvis ?? 0) - Number(a.nombreAvis ?? 0)))
  // Coups de cœur = les lieux réels LES MIEUX NOTÉS (transparent : notes Google)
  const coupsDeCoeur = curatedRestos.slice(0, 10)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const actsRiches = activites.filter((a: any) => a.description && String(a.description).length >= 25)
  // Hôtel signature : mieux noté AVEC attributs halal réels (rien d'inventé)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const hotelSignature = [...hotels]
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .filter((h: any) => h?.nom && (h.salleDePreiere === true || h.sansAlcool === true || h.sans_alcool === true || h.petitDejeunerHalal === true))
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    .sort((a: any, b: any) => Number(b.note ?? b.score ?? 0) - Number(a.note ?? a.score ?? 0))[0]
  // Incontournables = MIX (2 restos + mosquée iconique + 2 activités + hôtel
  // signature) — les restos utilisés ici SORTENT des « coups de cœur » (pas de doublon)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // Mosquée iconique : la liste CURÉE (ville.mosquees, avec description) prime
  // sur les entrées OSM (mosqueesPrincipales)
  // NB : dans certaines fiches, `mosquees` est un NOMBRE (statistique) → garde Array
  const mosqueesCurees = Array.isArray(ville.mosquees) ? ville.mosquees : []
  const mosqueeIconique = mosqueesCurees.find(isCurated) ?? mosqueesCurees[0] ?? mosquees[0]
  const incontournables: { kind: 'resto' | 'mosquee' | 'activite' | 'hotel'; item: any }[] = [
    ...coupsDeCoeur.slice(0, 2).map((r: unknown) => ({ kind: 'resto' as const, item: r })),
    ...(mosqueeIconique ? [{ kind: 'mosquee' as const, item: mosqueeIconique }] : []),
    ...actsRiches.slice(0, 2).map((a: unknown) => ({ kind: 'activite' as const, item: a })),
    ...(hotelSignature ? [{ kind: 'hotel' as const, item: hotelSignature }] : []),
  ]
  const incoRestoNames = new Set(coupsDeCoeur.slice(0, 2).map((r: any) => normName(r.nom)))
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  // 3-4 coups de cœur MAX par défaut — le reste vit dans la liste compacte repliée
  const ccDisplay = coupsDeCoeur.filter((r: any) => !incoRestoNames.has(normName(r.nom))).slice(0, 4)

  const restosParCat = activeFilter === 'Tous' ? restaurants : restaurants.filter((r: any) => cuisineCategory(r.type) === activeFilter)
  // « Signalé halal » = pas marqué « à vérifier » (halalConfidence 'likely')
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const restosFiltres = halalOnly ? restosParCat.filter((r: any) => r.halalConfidence !== 'likely') : restosParCat
  const restosAffiches = restosFiltres.slice(0, visibleRestos)
  const tabCounts: Record<string, number> = { restaurants: restaurants.length, mosquees: mosquees.length, hotels: hotels.length, activites: activites.length, pratique: 0 }

  const pratiqueItems = [
    { icon: '✈️', label: 'Visa', value: ip.visa },
    { icon: '💉', label: 'Vaccins', value: ip.vaccins },
    { icon: '🚇', label: 'Transport', value: ip.transport || legacyIp.transport },
    { icon: '🔌', label: 'Prise électrique', value: ip.priseElectrique },
    { icon: '🕐', label: 'Décalage horaire', value: ip.decalageHoraire },
    { icon: '💱', label: 'Monnaie', value: ville.monnaie || legacyIp.monnaie },
    { icon: '🌤', label: 'Meilleure époque', value: ville.meilleureEpoque || legacyIp.meilleure_periode },
    { icon: '🗣️', label: 'Langue', value: ville.langue || legacyIp.langue },
  ].filter((i) => i.value)

  const card: React.CSSProperties = { background: '#fff', borderRadius: '20px', padding: '22px', border: '1px solid rgba(11,26,15,0.06)', boxShadow: '0 8px 28px rgba(11,26,15,0.06)', transition: 'transform .2s, box-shadow .2s' }
  const WRAP = 900

  return (
    <main style={{ background: 'var(--creme)', minHeight: '100vh', overflowX: 'hidden' }}>
      {/* HERO épuré, centré */}
      <section style={{ position: 'relative', height: 'clamp(170px, 26vw, 230px)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        {image && <Image src={image} alt={`Guide voyage halal ${ville.nom}`} fill priority sizes="100vw" style={{ objectFit: 'cover', opacity: 0.5 }} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(11,26,15,0.55) 0%, rgba(11,26,15,0.82) 100%)' }} />
        <IslamicPattern opacity={0.05} />
        <div style={{ position: 'relative', maxWidth: WRAP, padding: '0 24px' }}>
          <p style={{ color: 'var(--or)', fontSize: '12px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '12px' }}>{countryEn(ville.pays, en)}{ville.region ? ` · ${ville.region}` : ''}</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: '#fff', lineHeight: 1.02, margin: 0 }}>
            <span style={{ fontSize: 'clamp(14px, 4vw, 18px)', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>{en ? 'Halal Guide ' : 'Guide Halal '}</span>
            <span style={{ fontSize: 'clamp(38px, 11vw, 56px)', fontWeight: 900 }}>{ville.nom}</span>
            <span style={{ fontSize: 'clamp(16px, 5vw, 22px)', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}> 2026</span>
            <span style={{ marginLeft: 6, verticalAlign: 'middle' }}>
              <FavButton size={22} fav={{ id: favId('ville', ville.slug ?? ville.nom), kind: 'ville', nom: ville.nom, href: `/destinations/${ville.slug ?? ''}` }} />
            </span>
          </h1>
          {halalScore != null && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', marginTop: '14px', padding: '7px 16px', borderRadius: '30px', background: 'rgba(201,168,76,0.18)', border: '1px solid rgba(201,168,76,0.5)', color: 'var(--or-clair)', fontSize: '13px', fontWeight: 700 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3BD17A' }} /> ✦ {halalScore}/10 · Halal Score
            </span>
          )}
        </div>
      </section>

      {/* PARTIE HAUT (sombre) — toute la navigation : boutons + intro + onglets */}
      <div style={{ background: 'var(--nuit)' }}>
        <div style={{ maxWidth: WRAP, margin: '0 auto', padding: '20px 24px 26px' }}>
          {/* intro courte — en tête du bloc */}
          {descShort && <p style={{ textAlign: 'center', color: 'rgba(253,250,243,0.72)', fontSize: '14.5px', lineHeight: 1.7, maxWidth: 700, margin: '0 auto 18px' }}>{descShort}</p>}

          {/* ONGLETS — cartes blanches contrastées, une rangée sur PC, 2 colonnes mobile */}
          <div className="ville-tabs-grid">
            {TABS.map((tab) => {
              const active = activeTab === tab.id
              const count = tabCounts[tab.id]
              return (
                <button key={tab.id} onClick={() => goToTab(tab.id)} className={`ville-tab${active ? ' ville-tab--on' : ''}${tab.id === 'pratique' ? ' ville-tab--wide' : ''}`}>
                  <span className="vt-ico">{tab.icon}</span>{en ? (tab as { labelEn?: string; label: string }).labelEn ?? tab.label : tab.label}
                  {count > 0 && <span className="vt-count">{count}</span>}
                </button>
              )
            })}
          </div>

          {/* Guide PDF gratuit (aimant à emails, doré) + Vols */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
            <EbookButton ville={ville} />
            <a href={en ? `https://www.skyscanner.net/flights-to/${ville.slug ?? ville.nom}` : `https://www.skyscanner.fr/vols-vers/${ville.slug ?? ville.nom}`} target="_blank" rel="noopener noreferrer" className="ville-action">
              <span className="ico">✈️</span>{en ? <>Flights to {ville.nom}</> : <>Vols vers {ville.nom}</>}
            </a>
          </div>
        </div>
      </div>

      {/* 🧭 GUIDE VISUEL — 1 phrase forte + chips (pas de pavé), puis carrousel
          photo « L'essentiel en 3 jours » (vraies photos de monuments). */}
      {(() => {
        const guide = getCityGuide(ville.slug)
        if (!guide) return null
        const chip = { display: 'inline-flex', alignItems: 'center', gap: 7, background: '#fff', border: '1px solid rgba(27,67,50,0.15)', borderRadius: 999, padding: '9px 15px', fontSize: 14, fontWeight: 700, color: 'var(--foret)' } as const
        return (
          <section style={{ maxWidth: WRAP, margin: '0 auto', padding: '24px 24px 0' }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(21px, 5.6vw, 26px)', fontWeight: 900, color: 'var(--nuit)', margin: '0 0 14px', lineHeight: 1.25 }}>
              {en ? guide.hookEn : guide.hook}
            </h2>
            {/* Chips : chaque info = 2-3 mots, jamais une phrase */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 24 }}>
              {halalScore != null && <span style={{ ...chip, background: 'rgba(201,168,76,0.14)', border: '1px solid rgba(201,168,76,0.5)', color: '#8A6D1E' }}>✦ {halalScore} HalalScore</span>}
              {guide.chips.map((c, i) => (
                <span key={i} style={chip}>{c.icon} {en ? c.en : c.fr}</span>
              ))}
            </div>
            <h3 style={{ fontFamily: "'Playfair Display', serif", fontSize: 20, fontWeight: 900, color: 'var(--nuit)', margin: '0 0 12px' }}>
              📅 {en ? `The essentials in ${guide.jours.length} days` : `L'essentiel en ${guide.jours.length} jours`}
            </h3>
            <GuideCarousel guide={guide} villeNom={ville.nom} en={en} />
          </section>
        )
      })()}

      {/* 🕌 OÙ PRIER — mis en avant (différenciateur n°1) : mosquées principales
          réelles (OSM) + accès direct « la plus proche » */}
      {mosquees.length > 0 && (
        <section style={{ maxWidth: WRAP, margin: '0 auto', padding: '26px 24px 0' }}>
          <div style={{ background: 'var(--nuit)', borderRadius: 20, padding: '20px 20px 18px', color: '#fdfaf3' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8, marginBottom: 12 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 900, color: '#fff', margin: 0 }}>
                🕌 {en ? `Where to pray in ${ville.nom}` : `Où prier à ${ville.nom}`}
              </h2>
              <a href="/mosquee-proche" style={{ fontSize: 13.5, fontWeight: 800, color: 'var(--or)', textDecoration: 'none' }}>
                📍 {en ? 'Nearest to me (GPS) →' : 'La plus proche de moi (GPS) →'}
              </a>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 10 }}>
              {mosquees.slice(0, 3).map((m: any, i: number) => (
                <a key={i} href={m.mapsUrl} target="_blank" rel="noopener noreferrer"
                  style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 14, padding: '12px 14px', textDecoration: 'none', display: 'block' }}>
                  <p style={{ fontWeight: 700, fontSize: 14.5, color: '#fdfaf3', margin: '0 0 3px', lineHeight: 1.3 }}>🕌 {m.nom}</p>
                  <p style={{ fontSize: 12, color: 'rgba(253,250,243,0.6)', margin: 0 }}>🗺 {en ? 'Open in Maps' : 'Ouvrir dans Maps'} · {m.source === 'osm' ? 'OpenStreetMap' : ''}</p>
                </a>
              ))}
            </div>
            {mosquees.length > 3 && (
              <button onClick={() => goToTab('mosquees')} style={{ marginTop: 12, background: 'none', border: '1.5px solid rgba(201,168,76,0.5)', color: 'var(--or)', borderRadius: 999, padding: '9px 18px', fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}>
                {en ? `See all ${mosquees.length} mosques →` : `Voir les ${mosquees.length} mosquées →`}
              </button>
            )}
          </div>
        </section>
      )}

      {/* 🔥 Les incontournables — top mixte CURÉ (profondeur réelle), scroll horizontal */}
      {incontournables.length >= 3 && (
        <section style={{ maxWidth: WRAP, margin: '0 auto', padding: '26px 24px 0' }}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 900, color: 'var(--nuit)', margin: '0 0 12px' }}>
            🔥 {en ? `The essentials of ${ville.nom}` : `Les incontournables de ${ville.nom}`}
          </h2>
          <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
            {incontournables.map(({ kind, item }, i) => {
              const cat = kind === 'resto' ? cuisineCategory(item.type) : ''
              const grad: [string, string] = kind === 'resto' ? (CATEGORY_GRADIENT[cat] ?? DEFAULT_GRADIENT) : kind === 'mosquee' ? ['#0b1a0f', '#2d6a4f'] : kind === 'hotel' ? ['#0f3d3e', '#0e7490'] : ['#312e81', '#6d28d9']
              const emoji = kind === 'resto' ? (CATEGORY_EMOJI[cat] ?? '🍽') : kind === 'mosquee' ? '🕌' : kind === 'hotel' ? '🏨' : '🎯'
              return (
                <button key={`${kind}-${i}`} onClick={() => setDetail({ kind, item })}
                  style={{ width: 250, minWidth: 250, scrollSnapAlign: 'start', textAlign: 'left', background: '#fff', border: '1px solid rgba(27,67,50,0.1)', borderRadius: 18, overflow: 'hidden', cursor: 'pointer', padding: 0, boxShadow: '0 6px 20px rgba(11,26,15,0.06)' }}>
                  <PlacePhoto query={`${item.nom} ${ville.nom}`} height={104} gradient={grad} emoji={emoji} emojiSize={34} />
                  <div style={{ padding: '11px 13px 13px' }}>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 16, color: 'var(--texte)', margin: 0, lineHeight: 1.15 }}>{item.nom}</p>
                    <p style={{ fontSize: 12, color: 'var(--texte-2)', margin: '3px 0 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {item.description || item.specialite || ''}
                    </p>
                    <p style={{ fontSize: 12, color: 'var(--foret)', fontWeight: 700, margin: '7px 0 0' }}>{en ? 'See details →' : 'Voir le détail →'}</p>
                  </div>
                </button>
              )
            })}
          </div>
        </section>
      )}

      {/* Vue DÉTAIL des lieux curés — n'affiche QUE les champs réellement présents */}
      {detail && (
        <div onClick={() => setDetail(null)} style={{ position: 'fixed', inset: 0, zIndex: 200, background: 'rgba(11,26,15,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: '#fdfaf3', borderRadius: 22, maxWidth: 460, width: '100%', maxHeight: '86vh', overflowY: 'auto', position: 'relative' }}>
            {(() => {
              const it = detail.item
              const cat = detail.kind === 'resto' ? cuisineCategory(it.type) : ''
              const grad: [string, string] = detail.kind === 'resto' ? (CATEGORY_GRADIENT[cat] ?? DEFAULT_GRADIENT) : detail.kind === 'mosquee' ? ['#0b1a0f', '#2d6a4f'] : detail.kind === 'hotel' ? ['#0f3d3e', '#0e7490'] : ['#312e81', '#6d28d9']
              const tags = (Array.isArray(it.tags) ? it.tags : []).join(' ').toLowerCase()
              const pill = { background: 'rgba(27,67,50,0.07)', color: 'var(--foret)', fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '3px 10px' } as const
              return (
                <>
                  <div style={{ position: 'relative' }}>
                    <PlacePhoto query={`${it.nom} ${ville.nom}`} height={150} gradient={grad} emoji={detail.kind === 'resto' ? (CATEGORY_EMOJI[cat] ?? '🍽') : detail.kind === 'mosquee' ? '🕌' : detail.kind === 'hotel' ? '🏨' : '🎯'} emojiSize={44} />
                    <button onClick={() => setDetail(null)} aria-label={en ? 'Close' : 'Fermer'} style={{ position: 'absolute', top: 10, right: 12, background: 'rgba(255,255,255,0.9)', border: 'none', borderRadius: 20, width: 30, height: 30, cursor: 'pointer', fontSize: 15 }}>✕</button>
                  </div>
                  <div style={{ padding: '16px 20px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                      <h3 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, fontSize: 22, color: 'var(--nuit)', margin: 0 }}>{it.nom}</h3>
                      <FavButton size={17} fav={{ id: favId(detail.kind, ville.slug ?? ville.nom, it.nom), kind: detail.kind, nom: it.nom, villeNom: ville.nom, href: `/destinations/${ville.slug ?? ''}` }} />
                    </div>
                    <p style={{ fontSize: 12.5, color: 'var(--texte-2)', margin: '2px 0 10px' }}>
                      {detail.kind === 'resto' ? enLabel(cat, en) : detail.kind === 'mosquee' ? (en ? 'Mosque' : 'Mosquée') : detail.kind === 'hotel' ? `${en ? 'Hotel' : 'Hôtel'}${it.etoiles ? ` ${'★'.repeat(Math.min(5, it.etoiles))}` : ''}` : (it.categorie || (en ? 'Activity' : 'Activité'))}
                      {(it.duree || it.prix) && <> · {[it.duree, it.prix].filter(Boolean).join(' · ')}</>}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 9, flexWrap: 'wrap', marginBottom: 10 }}>
                      {detail.kind === 'resto' && (it.halalConfidence === 'likely'
                        ? <span style={{ background: 'rgba(201,168,76,0.18)', color: '#8A6D1E', fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '3px 10px' }}>≈ {en ? 'Halal common · verify' : 'Halal courant · à vérifier'}</span>
                        : <span style={{ background: 'var(--halal-bg)', color: 'var(--halal-tx)', fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '3px 10px' }}>✓ Halal</span>)}
                      {(it.score ?? it.note) != null && <span style={{ fontSize: 13, color: '#B8860B', fontWeight: 700 }}>★ {it.score ?? it.note}</span>}
                      {(it.priceRange ?? it.fourchette_prix) && <span style={{ fontSize: 12, color: 'var(--texte-2)' }}>{it.priceRange ?? it.fourchette_prix}</span>}
                    </div>
                    {it.description && <p style={{ fontSize: 14, color: 'var(--texte)', lineHeight: 1.65, margin: '0 0 10px' }}>{it.description}</p>}
                    {it.specialite && !(it.description && String(it.description).toLowerCase().includes(String(it.specialite).toLowerCase().slice(0, 24))) && (
                      <p style={{ fontSize: 13.5, color: 'var(--foret)', margin: '0 0 8px' }}>⭐ <strong>{en ? 'Why go:' : 'Pourquoi y aller :'}</strong> {it.specialite}</p>
                    )}
                    {it.conseil && <p style={{ fontSize: 13.5, color: '#1a6b3c', margin: '0 0 8px' }}>💡 {it.conseil}</p>}
                    {it.adresse && it.adresse !== ville.nom && <p style={{ fontSize: 13, color: 'var(--texte-2)', margin: '0 0 10px' }}>📍 {it.adresse}</p>}
                    <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 14 }}>
                      {(tags.includes('famille') || tags.includes('familles') || tags.includes('familial')) && <span style={pill}>👨‍👩‍👧 {en ? 'family-friendly' : 'adapté familles'}</span>}
                      {(tags.includes('sans alcool') || it.sansAlcool === true || it.sans_alcool === true) && <span style={pill}>🚫 {en ? 'alcohol-free' : 'sans alcool'}</span>}
                      {(tags.includes('salle de prière') || tags.includes('salle de priere')) && <span style={pill}>🕌 {en ? 'prayer room' : 'salle de prière'}</span>}
                      {it.ouvertureRamadan === true && <span style={pill}>🌙 {en ? 'open during Ramadan' : 'ouvert pendant le Ramadan'}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: 8 }}>
                      {detail.kind === 'hotel' && (it.halalBookingUrl || it.bookingUrl) && (
                        <a href={it.halalBookingUrl || it.bookingUrl} target="_blank" rel="sponsored noopener noreferrer" style={{ flex: 1, display: 'block', padding: '12px 0', background: 'var(--foret)', color: '#fff', borderRadius: 12, textAlign: 'center', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                          🏨 {en ? 'Book' : 'Réserver'}
                        </a>
                      )}
                      {it.mapsUrl && (
                        <a href={it.mapsUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, display: 'block', padding: '12px 0', background: detail.kind === 'hotel' && (it.halalBookingUrl || it.bookingUrl) ? 'var(--halal-bg)' : 'var(--foret)', color: detail.kind === 'hotel' && (it.halalBookingUrl || it.bookingUrl) ? 'var(--halal-tx)' : '#fff', borderRadius: 12, textAlign: 'center', fontSize: 14, fontWeight: 700, textDecoration: 'none' }}>
                          🗺 {en ? 'Maps / Directions' : 'Maps / Itinéraire'}
                        </a>
                      )}
                    </div>
                    <SourceLine item={it} />
                  </div>
                </>
              )
            })()}
          </div>
        </div>
      )}

      {/* PARTIE BAS (claire) — contenu de l'onglet sélectionné */}
      <div ref={contentRef} style={{ maxWidth: WRAP, margin: '0 auto', padding: '28px 24px 80px', scrollMarginTop: '12px' }}>
        {displayTab === 'restaurants' && (
          <>
            {/* BLOC 3 — statut halal HONNÊTE selon le contexte de la ville */}
            <div style={{ background: villeNonMusulmane ? 'rgba(201,168,76,0.12)' : 'rgba(27,67,50,0.07)', border: '1px solid rgba(27,67,50,0.15)', borderRadius: 14, padding: '12px 16px', marginBottom: 18, fontSize: 13.5, color: 'var(--foret)', lineHeight: 1.6 }}>
              {villeNonMusulmane
                ? (en
                  ? '🔎 Places below are reported halal by their sources (Google / OpenStreetMap) — always verify on site. We never certify.'
                  : '🔎 Les adresses ci-dessous sont signalées halal par leurs sources (Google / OpenStreetMap) — vérifiez toujours sur place. Nous ne certifions rien.')
                : (en
                  ? `🕌 ${ville.nom} is a Muslim-majority city — dining is overwhelmingly halal by default. We never certify individual places.`
                  : `🕌 ${ville.nom} est une ville à majorité musulmane — la restauration y est très majoritairement halal par défaut. Nous ne certifions aucun lieu individuellement.`)}
            </div>
            {/* 🤝 Communauté AVANT les listes : les spots partagés ont plus de
                valeur qu'un annuaire */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, background: 'var(--nuit)', borderRadius: 16, padding: '14px 16px', marginBottom: 18, flexWrap: 'wrap' }}>
              <p style={{ flex: 1, minWidth: 180, color: '#fdfaf3', fontSize: 14.5, fontWeight: 700, margin: 0, lineHeight: 1.45 }}>
                🤝 {en ? `Know a halal spot in ${ville.nom}?` : `Tu connais un spot halal à ${ville.nom} ?`}
              </p>
              <span style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <a href={`/communaute/ajouter?ville=${ville.slug ?? ''}`} style={{ padding: '10px 16px', borderRadius: 999, background: 'var(--or)', color: '#0b1a0f', fontWeight: 800, fontSize: 13.5, textDecoration: 'none' }}>
                  ➕ {en ? 'Share it' : 'Partage-le'}
                </a>
                <a href={`/priere/${ville.slug ?? ''}`} style={{ padding: '10px 16px', borderRadius: 999, border: '1.5px solid rgba(201,168,76,0.5)', color: '#fdfaf3', fontWeight: 700, fontSize: 13.5, textDecoration: 'none' }}>
                  🧭 {en ? 'Shared spots →' : 'Spots partagés →'}
                </a>
              </span>
            </div>
            {/* BLOC 6 — honnêteté d'échelle : pas de data réelle → on le DIT */}
            {restaurants.length === 0 && (
              <div style={{ ...card, textAlign: 'center', padding: '36px 22px', marginBottom: 18 }}>
                <div style={{ fontSize: 32, marginBottom: 10 }}>🚧</div>
                <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: 'var(--nuit)', fontSize: 18, margin: '0 0 6px' }}>{en ? 'Restaurant guide under construction' : 'Guide restaurants en construction'}</p>
                <p style={{ color: 'var(--texte-2)', fontSize: 14, lineHeight: 1.65, margin: '0 0 14px' }}>
                  {en
                    ? 'We only list verifiable places (Google / OpenStreetMap). We don\u2019t have enough real data for this city yet \u2014 rather than showing made-up listings, we show none.'
                    : 'Nous n\u2019affichons que des lieux vérifiables (Google / OpenStreetMap). Nous n\u2019avons pas encore assez de données réelles ici — plutôt que d\u2019afficher de fausses adresses, nous n\u2019en affichons aucune.'}
                </p>
                <a href="/autour-de-moi" style={{ display: 'inline-block', padding: '10px 20px', background: 'var(--foret)', color: '#fff', borderRadius: 12, fontWeight: 700, fontSize: 13.5, textDecoration: 'none' }}>📍 {en ? 'Search live around me' : 'Chercher en direct autour de moi'}</a>
              </div>
            )}
            {/* 🍽️ Coups de cœur (profondeur réelle) puis toutes les adresses */}
            {ccDisplay.length >= 3 && (
              <div style={{ marginBottom: 26 }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 900, color: 'var(--nuit)', margin: '0 0 12px' }}>
                  🍽️ {en ? 'Where to eat — top-rated on Google' : 'Où manger — les mieux notés sur Google'}
                </h2>
                <div style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 8, scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch' }}>
                  {ccDisplay.map((r: any, i: number) => {
                    const ccat = cuisineCategory(r.type)
                    const [g1, g2] = CATEGORY_GRADIENT[ccat] ?? DEFAULT_GRADIENT
                    return (
                      <button key={i} onClick={() => setDetail({ kind: 'resto', item: r })}
                        style={{ width: 240, minWidth: 240, scrollSnapAlign: 'start', textAlign: 'left', background: '#fff', border: '1px solid rgba(27,67,50,0.1)', borderRadius: 18, overflow: 'hidden', cursor: 'pointer', padding: 0, boxShadow: '0 6px 20px rgba(11,26,15,0.06)' }}>
                        <PlacePhoto query={`${r.nom} ${ville.nom}`} height={96} gradient={[g1, g2]} emoji={CATEGORY_EMOJI[ccat] ?? '🍽'} emojiSize={30} hideIfMissing />
                        <div style={{ padding: '10px 13px 12px' }}>
                          <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 15.5, color: 'var(--texte)', margin: 0, lineHeight: 1.15 }}>{r.nom}</p>
                          <p style={{ fontSize: 11.5, color: 'var(--texte-2)', margin: '3px 0 0', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{r.description || r.specialite}</p>
                          <p style={{ fontSize: 11.5, color: 'var(--foret)', fontWeight: 700, margin: '6px 0 0' }}>
                            {(r.score ?? r.note) != null && <>★ {r.score ?? r.note} · </>}{en ? 'See details →' : 'Voir le détail →'}
                          </p>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}
            {/* Liste complète OSM REPLIÉE par défaut — le guide et les coups de
                cœur répondent d'abord ; la liste reste là pour ceux qui fouillent */}
            {restaurants.length > 0 && !showAllRestos && (
              <div style={{ textAlign: 'center', margin: '4px 0 10px' }}>
                <button onClick={() => setShowAllRestos(true)}
                  style={{ padding: '14px 26px', borderRadius: 30, border: '1.5px solid var(--foret)', background: '#fff', color: 'var(--foret)', fontSize: 15, fontWeight: 800, cursor: 'pointer', minHeight: 52 }}>
                  📂 {en ? `See all listings (${restaurants.length})` : `Voir toutes les adresses (${restaurants.length})`}
                </button>
                <p style={{ fontSize: 12.5, color: 'var(--texte-2)', margin: '8px 0 0' }}>
                  {en ? 'Full OpenStreetMap directory — reported halal, to verify on site.' : 'Répertoire complet OpenStreetMap — signalé halal, à vérifier sur place.'}
                </p>
              </div>
            )}
            {restaurants.length > 0 && showAllRestos && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '22px', fontWeight: 900, color: 'var(--nuit)' }}>
                {ccDisplay.length >= 3
                  ? (en ? `All listings (${restosFiltres.length})` : `Toutes les adresses (${restosFiltres.length})`)
                  : (en ? 'Halal restaurants' : 'Restaurants halal')}
              </h2>
              {ccDisplay.length < 3 && <span style={{ fontSize: '13px', color: 'var(--texte-2)' }}>{restosFiltres.length} {en ? 'listings' : 'adresses'}</span>}
            </div>
            )}
            {/* filtres catégories en pills */}
            {restaurants.length > 0 && showAllRestos && (
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '22px' }}>
              {categories.map((cat) => {
                const active = activeFilter === cat
                return (
                  <button key={cat} onClick={() => (setActiveFilter(cat), setVisibleRestos(20))} style={{ padding: '8px 16px', borderRadius: '30px', border: '1.5px solid rgba(27,67,50,0.25)', background: active ? 'var(--foret)' : '#fff', color: active ? '#fff' : 'var(--foret)', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}>
                    {cat === 'Tous' ? (en ? '🍽 All' : '🍽 Tous') : `${CATEGORY_EMOJI[cat] ?? '🍽'} ${enLabel(cat, en)}`}
                  </button>
                )
              })}
              <button onClick={() => (setHalalOnly(!halalOnly), setVisibleRestos(20))}
                aria-pressed={halalOnly}
                style={{ padding: '8px 16px', borderRadius: '30px', border: `1.5px solid ${halalOnly ? '#8A6D1E' : 'rgba(138,109,30,0.4)'}`, background: halalOnly ? '#8A6D1E' : '#fff', color: halalOnly ? '#fff' : '#8A6D1E', fontSize: '13.5px', fontWeight: 700, cursor: 'pointer' }}>
                ✓ {en ? 'Reported halal only' : 'Signalé halal uniquement'}
              </button>
            </div>
            )}
            {/* LISTE COMPACTE — lignes denses scannables, zéro faux visuel :
                nom + type, puce source discrète, une action Maps à droite */}
            {showAllRestos && (
            <div style={{ background: '#fff', borderRadius: 16, border: '1px solid rgba(27,67,50,0.1)', overflow: 'hidden' }}>
              {restosAffiches.map((r: any, i: number) => {
                const cat = cuisineCategory(r.type)
                return (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '11px 14px', minHeight: 64, borderTop: i > 0 ? '1px solid rgba(27,67,50,0.07)' : 'none' }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontWeight: 700, fontSize: 15, color: 'var(--texte)', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {r.nom} <span style={{ fontWeight: 400, color: 'var(--texte-2)', fontSize: 13 }}>· {enLabel(cat, en)}</span>
                      </p>
                      <p style={{ fontSize: 12, color: '#9ca3af', margin: '3px 0 0' }}>
                        {r.halalConfidence === 'likely'
                          ? (en ? '≈ verify on site' : '≈ à vérifier')
                          : (en ? '✓ reported halal' : '✓ signalé halal')}
                        {' · '}{r.source === 'google' ? 'Google' : 'OSM'}
                        {(r.score ?? r.note) != null ? ` · ★ ${r.score ?? r.note}` : ''}
                      </p>
                    </div>
                    <a href={r.mapsUrl} target="_blank" rel="noopener noreferrer" onClick={() => toast('Ouverture dans Google Maps…', 'success')}
                      style={{ flexShrink: 0, padding: '9px 14px', background: 'var(--halal-bg)', color: 'var(--halal-tx)', borderRadius: 10, fontSize: 12.5, fontWeight: 700, textDecoration: 'none', whiteSpace: 'nowrap' }}>
                      🗺 {en ? 'Maps' : 'Maps'}
                    </a>
                  </div>
                )
              })}
            </div>
            )}
            {showAllRestos && restosFiltres.length > visibleRestos && (
              <div style={{ textAlign: 'center', marginTop: 18 }}>
                <button onClick={() => setVisibleRestos((v) => v + 40)} style={{ padding: '13px 28px', borderRadius: 30, border: '1.5px solid var(--foret)', background: '#fff', color: 'var(--foret)', fontSize: 14, fontWeight: 700, cursor: 'pointer' }}>
                  {en ? `Show more (${restosFiltres.length - visibleRestos} more)` : `Voir plus (${restosFiltres.length - visibleRestos} autres)`}
                </button>
              </div>
            )}
            {restaurants.length === 0 && (
              hasCoords ? (
                <LiveSpots kind="restaurants" lat={coords.lat} lng={coords.lng} ville={ville.nom} />
              ) : (
                <div style={{ ...card, textAlign: 'center', padding: '40px 22px' }}>
                  <div style={{ fontSize: 34, marginBottom: 10 }}>🍽️</div>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: 'var(--nuit)', fontSize: 18, margin: '0 0 6px' }}>Restaurants en cours d’ajout</p>
                  <p style={{ color: 'var(--texte-2)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>Nous ajoutons les adresses halal signalées de {ville.nom}. 🤲</p>
                </div>
              )
            )}
          </>
        )}

        {displayTab === 'hotels' && (
          <div style={{ marginBottom: 20 }}>
            <HotelCTA cityName={ville.nom} variant="banner" />
          </div>
        )}
        {displayTab === 'hotels' && (hotels.length === 0 ? (
          <div style={{ ...card, textAlign: 'center', padding: '40px 22px' }}>
            <div style={{ fontSize: 34, marginBottom: 10 }}>🏨</div>
            <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: 'var(--nuit)', fontSize: 18, margin: '0 0 6px' }}>{en ? 'Hotels coming soon' : 'Hôtels en cours d’ajout'}</p>
            <p style={{ color: 'var(--texte-2)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>{en ? `Halal-friendly stays in ${ville.nom} are on the way.` : `Les hébergements halal-friendly de ${ville.nom} arrivent bientôt.`}</p>
          </div>
        ) : (
          <HotelFilter hotels={hotels} mosques={mosquesLL} restos={restosLL} center={centerLL} en={en} />
        ))}

        {displayTab === 'mosquees' && mosquees.length === 0 && hasCoords && (
          <LiveSpots kind="mosquees" lat={coords.lat} lng={coords.lng} ville={ville.nom} />
        )}
        {displayTab === 'mosquees' && mosquees.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', flexWrap: 'wrap', gap: 8 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 900, color: 'var(--nuit)', margin: 0 }}>🕌 {en ? <>Where to pray in {ville.nom}</> : <>Où prier à {ville.nom}</>}</h2>
              <span style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                <a href={`/priere/${ville.slug ?? ''}`} style={{ fontSize: '13px', fontWeight: 700, color: '#6b21a8', textDecoration: 'none' }}>🧭 {en ? 'Prayer spots →' : 'Coins prière →'}</a>
                <a href="/mosquee-proche" style={{ fontSize: '13px', fontWeight: 700, color: 'var(--foret)', textDecoration: 'none' }}>📍 {en ? 'Around me (GPS) →' : 'Autour de moi (GPS) →'}</a>
              </span>
            </div>
            {mosquees.map((m: any, i: number) => (
              <div key={i} style={card}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '19px', color: 'var(--nuit)', marginBottom: '6px' }}>🕌 {m.nom}</p>
                  <FavButton size={16} fav={{ id: favId('mosquee', ville.slug ?? ville.nom, m.nom), kind: 'mosquee', nom: m.nom, villeNom: ville.nom, href: `/destinations/${ville.slug ?? ''}` }} />
                </div>
                <p style={{ fontSize: '13.5px', color: 'var(--texte-2)', lineHeight: 1.6, marginBottom: '10px' }}>{m.description}</p>
                <a href={m.mapsUrl} target="_blank" rel="noopener noreferrer" onClick={() => toast('Ouverture dans Google Maps…', 'success')} style={{ display: 'inline-block', padding: '9px 16px', background: 'var(--halal-bg)', color: 'var(--halal-tx)', borderRadius: '11px', fontSize: '12.5px', fontWeight: 700, textDecoration: 'none' }}>🗺 {en ? 'View on map →' : 'Voir sur la carte →'}</a>
                <SourceLine item={m} />
              </div>
            ))}
          </div>
        )}

        {displayTab === 'activites' && activites.length === 0 && hasCoords && (
          <LiveSpots kind="activites" lat={coords.lat} lng={coords.lng} ville={ville.nom} />
        )}
        {displayTab === 'activites' && activites.length > 0 && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {activites.map((a: any, i: number) => (
              <div key={i} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '18px', color: 'var(--texte)', flex: 1 }}>{a.nom}</p>
                  <span style={{ background: 'rgba(27,67,50,0.08)', color: 'var(--foret)', fontSize: '11px', fontWeight: 600, borderRadius: '20px', padding: '3px 9px', marginLeft: '8px' }}>{a.prix}</span>
                </div>
                <span style={{ display: 'inline-block', fontSize: '11px', color: 'var(--texte-2)', marginBottom: '6px' }}>{a.categorie} · {a.duree}</span>
                <p style={{ fontSize: '13px', color: 'var(--texte-2)', lineHeight: 1.6, marginBottom: '12px' }}>{a.description}</p>
                <a href={a.mapsUrl} target="_blank" rel="noopener noreferrer" onClick={() => toast('Ouverture dans Google Maps…', 'success')} style={{ display: 'inline-block', padding: '9px 16px', background: 'var(--halal-bg)', color: 'var(--halal-tx)', borderRadius: '11px', fontSize: '12.5px', fontWeight: 700, textDecoration: 'none' }}>🗺 Maps →</a>
                <SourceLine item={a} />
              </div>
            ))}
          </div>
        )}

        {displayTab === 'pratique' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
            {pratiqueItems.map((item, i) => (
              <div key={i} style={{ ...card, display: 'flex', gap: '14px', alignItems: 'center' }}>
                <span style={{ fontSize: '26px' }}>{item.icon}</span>
                <div><p style={{ fontSize: '11px', color: 'var(--texte-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 2px' }}>{item.label}</p>
                  <p style={{ fontSize: '14.5px', color: 'var(--texte)', fontWeight: 600, margin: 0 }}>{item.value as string}</p></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
