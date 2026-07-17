'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from 'react'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import {
  type HotelLike, type LatLng, coordsOf, distanceKm, priceRank, noteOf, reviewCountOf,
  scoreSitue, scoreRecommended, categoryOf, EQUIP,
} from '@/lib/hotelFilter'

type SortKey = 'reco' | 'situe' | 'proche' | 'note' | 'cher'
interface Enriched { h: HotelLike; c: LatLng | null; dist: number | null; reco: number; situe: number; nearestMosqueKm: number; restosNear: number; pr: number | null }

const equipList = [
  { id: 'salleDePriere', fr: 'Salle de prière', en: 'Prayer room' },
  { id: 'sansAlcool', fr: 'Sans alcool', en: 'Alcohol-free' },
  { id: 'petitDejeunerHalal', fr: 'Petit-déj halal', en: 'Halal breakfast' },
  { id: 'piscineNonMixte', fr: '🏊 Piscine privée (femmes)', en: '🏊 Private pool (women)' },
  { id: 'plagePrivee', fr: '🏖️ Plage privée (femmes)', en: '🏖️ Private beach (women)' },
  { id: 'qibla', fr: 'Qibla en chambre', en: 'In-room Qibla' },
] as const

const BUDGET: { id: string; fr: string; en: string; min?: number; max?: number }[] = [
  { id: 'b1', fr: '≤ 50 €', en: '≤ €50', max: 50 },
  { id: 'b2', fr: '50–100 €', en: '€50–100', min: 50, max: 100 },
  { id: 'b3', fr: '100–200 €', en: '€100–200', min: 100, max: 200 },
  { id: 'b4', fr: '200 €+', en: '€200+', min: 200 },
]

export default function HotelFilter({ hotels, mosques, restos, center, en: enProp }: {
  hotels: HotelLike[]; mosques: LatLng[]; restos: LatLng[]; center: LatLng | null; en?: boolean
}) {
  const { lang } = useLanguage()
  const en = enProp ?? lang === 'en'
  const [open, setOpen] = useState(false)
  const [sort, setSort] = useState<SortKey>('reco')
  const [types, setTypes] = useState<Set<string>>(new Set())
  const [equip, setEquip] = useState<Set<string>>(new Set())
  const [budget, setBudget] = useState<string | null>(null)
  const [locNearMosque, setLocNearMosque] = useState(false)
  const [locRestos, setLocRestos] = useState(false)

  const enriched: Enriched[] = useMemo(() => hotels.map((h) => {
    const c = coordsOf(h)
    const dist = c && center ? distanceKm(c, center) : null
    const s = c ? scoreSitue(c, mosques, restos) : { score: 0, nearestMosqueKm: Infinity, restosNear: 0 }
    return { h, c, dist, reco: scoreRecommended(h, dist), situe: s.score, nearestMosqueKm: s.nearestMosqueKm, restosNear: s.restosNear, pr: priceRank(h) }
  }), [hotels, mosques, restos, center])

  const availTypes = useMemo(() => Array.from(new Set(hotels.map((h) => categoryOf(h)).filter(Boolean))) as string[], [hotels])

  const filtered = useMemo(() => {
    const list = enriched.filter((e) => {
      if (types.size && !(categoryOf(e.h) && types.has(categoryOf(e.h)!))) return false
      for (const id of equip) if (!(EQUIP as any)[id](e.h)) return false // ET logique
      if (locNearMosque && !(e.nearestMosqueKm <= 0.5)) return false
      if (locRestos && !(e.restosNear > 0)) return false
      if (budget) {
        const b = BUDGET.find((x) => x.id === budget)!
        const p = e.h.prixNuitEur
        if (typeof p !== 'number') return false
        if (b.min != null && p < b.min) return false
        if (b.max != null && p > b.max) return false
      }
      return true
    })
    const by: Record<SortKey, (a: Enriched, b: Enriched) => number> = {
      reco: (a, b) => b.reco - a.reco,
      situe: (a, b) => b.situe - a.situe,
      proche: (a, b) => (a.dist ?? Infinity) - (b.dist ?? Infinity),
      note: (a, b) => (noteOf(b.h) ?? 0) - (noteOf(a.h) ?? 0),
      cher: (a, b) => (a.pr ?? 99) - (b.pr ?? 99),
    }
    return [...list].sort(by[sort])
  }, [enriched, types, equip, budget, locNearMosque, locRestos, sort])

  const SORTS: { id: SortKey; fr: string; en: string }[] = [
    { id: 'reco', fr: '✨ Recommandé', en: '✨ Recommended' },
    { id: 'situe', fr: '🕌 Bien situés', en: '🕌 Well located' },
    { id: 'proche', fr: '📍 Au plus proche', en: '📍 Nearest' },
    { id: 'note', fr: '⭐ Mieux notés', en: '⭐ Top rated' },
    { id: 'cher', fr: '💶 Moins cher', en: '💶 Cheapest' },
  ]
  const activeCount = types.size + equip.size + (budget ? 1 : 0) + (locNearMosque ? 1 : 0) + (locRestos ? 1 : 0)
  const toggle = (set: Set<string>, setter: (s: Set<string>) => void, id: string) => {
    const n = new Set(set); n.has(id) ? n.delete(id) : n.add(id); setter(n)
  }
  const chip = (on: boolean): React.CSSProperties => ({ padding: '8px 14px', borderRadius: 30, border: `1.5px solid ${on ? 'var(--foret)' : 'rgba(27,67,50,0.25)'}`, background: on ? 'var(--foret)' : '#fff', color: on ? '#fff' : 'var(--foret)', fontWeight: 700, fontSize: 13, cursor: 'pointer' })
  const t = (fr: string, en2: string) => (en ? en2 : fr)

  return (
    <div>
      {/* Barre repliée : 1 bouton → 1 feuille */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={() => setOpen((o) => !o)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 18px', borderRadius: 14, border: '1.5px solid var(--foret)', background: '#fff', color: 'var(--foret)', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
          ⚙️ {t('Filtrer & trier', 'Filter & sort')}{activeCount ? ` · ${activeCount}` : ''}
        </button>
        <span style={{ fontSize: 13, color: 'var(--texte-2)' }}>
          <strong style={{ color: 'var(--foret)' }}>{filtered.length}</strong> {t('hôtels', 'hotels')} · {SORTS.find((s) => s.id === sort)![en ? 'en' : 'fr']}
        </span>
      </div>

      {open && (
        <div style={{ background: '#fff', border: '1px solid rgba(27,67,50,0.14)', borderRadius: 16, padding: 18, marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--foret)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>{t('Trier', 'Sort')}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {SORTS.map((s) => <button key={s.id} onClick={() => setSort(s.id)} style={chip(sort === s.id)}>{en ? s.en : s.fr}</button>)}
            </div>
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--foret)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>🕌 {t('Emplacement', 'Location')}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <button onClick={() => setLocNearMosque((v) => !v)} style={chip(locNearMosque)}>{t('≤ 500 m d’une mosquée', '≤ 500 m from a mosque')}</button>
              <button onClick={() => setLocRestos((v) => !v)} style={chip(locRestos)}>{t('Restos halal autour', 'Halal restaurants nearby')}</button>
            </div>
          </div>
          {availTypes.length > 0 && (
            <div>
              <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--foret)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>🏨 {t('Type', 'Type')}</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                {availTypes.map((ty) => <button key={ty} onClick={() => toggle(types, setTypes, ty)} style={chip(types.has(ty))}>{ty}</button>)}
              </div>
            </div>
          )}
          <div>
            <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--foret)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>✅ {t('Équipements halal', 'Halal amenities')}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {equipList.map((e2) => <button key={e2.id} onClick={() => toggle(equip, setEquip, e2.id)} style={chip(equip.has(e2.id))}>{en ? e2.en : e2.fr}</button>)}
            </div>
          </div>
          <div>
            <p style={{ fontSize: 12, fontWeight: 800, color: 'var(--foret)', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: 0.5 }}>💶 {t('Budget / nuit', 'Budget / night')}</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {BUDGET.map((b) => <button key={b.id} onClick={() => setBudget(budget === b.id ? null : b.id)} style={chip(budget === b.id)}>{en ? b.en : b.fr}</button>)}
            </div>
            <p style={{ fontSize: 11, color: 'var(--texte-2)', margin: '6px 0 0', opacity: 0.7 }}>{t('Nécessite le prix/nuit renseigné sur l’hôtel.', 'Requires a price/night on the hotel.')}</p>
          </div>
        </div>
      )}

      {/* Liste des hôtels filtrés/triés */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
        {filtered.map((e, i) => {
          const h = e.h
          return (
            <div key={i} style={{ background: '#fff', border: '1px solid rgba(27,67,50,0.1)', borderRadius: 18, padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6, gap: 8 }}>
                <div>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 19, color: 'var(--texte)' }}>{h.nom}</p>
                  <p style={{ fontSize: 12.5, color: 'var(--texte-2)', marginTop: 2 }}>{categoryOf(h) || (en ? 'Hotel' : 'Hôtel')}{(h.priceRange ?? h.prix) ? ` · ${h.priceRange ?? h.prix}` : ''}</p>
                </div>
                {noteOf(h) != null && <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--or)', whiteSpace: 'nowrap' }}>★ {noteOf(h)}</span>}
              </div>
              {/* Différenciateur : proximité mosquée + restos halal */}
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '4px 0 10px' }}>
                {e.nearestMosqueKm !== Infinity && e.nearestMosqueKm <= 3 && (
                  <span style={{ background: 'var(--halal-bg)', color: 'var(--halal-tx)', fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '3px 9px' }}>🕌 {t('Mosquée', 'Mosque')} {e.nearestMosqueKm < 1 ? `${Math.round(e.nearestMosqueKm * 1000)} m` : `${e.nearestMosqueKm.toFixed(1)} km`}</span>
                )}
                {e.restosNear > 0 && <span style={{ background: 'rgba(201,168,76,0.18)', color: '#8A6D1E', fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '3px 9px' }}>🍽 {e.restosNear} {t('restos halal < 1 km', 'halal restos < 1 km')}</span>}
                {equipList.filter((eq) => (EQUIP as any)[eq.id](h)).slice(0, 3).map((eq) => (
                  <span key={eq.id} style={{ background: 'rgba(27,67,50,0.07)', color: 'var(--foret)', fontSize: 11, fontWeight: 700, borderRadius: 20, padding: '3px 9px' }}>✓ {en ? eq.en : eq.fr}{(eq.id === 'piscineNonMixte' || eq.id === 'plagePrivee') ? ' · HalalBooking' : ''}</span>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                {(h.mapsUrl || e.c) && <a href={h.mapsUrl || `https://maps.google.com/?q=${e.c!.lat},${e.c!.lng}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '11px 0', background: 'var(--halal-bg)', color: 'var(--halal-tx)', borderRadius: 12, textAlign: 'center', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>🗺 {t('Carte', 'Map')}</a>}
                {(h.halalBookingUrl || h.halal_booking_url) && <a href={h.halalBookingUrl || h.halal_booking_url} target="_blank" rel="sponsored noopener noreferrer" style={{ flex: 1, padding: '11px 0', background: 'var(--foret)', color: 'var(--creme)', borderRadius: 12, textAlign: 'center', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>🕌 {t('Réserver halal', 'Book halal')}</a>}
                {!(h.halalBookingUrl || h.halal_booking_url) && (h.bookingUrl || h.booking_url) && <a href={h.bookingUrl || h.booking_url} target="_blank" rel="sponsored noopener noreferrer" style={{ flex: 1, padding: '11px 0', background: 'var(--booking)', color: '#fff', borderRadius: 12, textAlign: 'center', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>📖 {t('Réserver', 'Book')}</a>}
              </div>
            </div>
          )
        })}
      </div>
      {filtered.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--texte-2)', padding: 24 }}>{t('Aucun hôtel ne correspond à ces filtres.', 'No hotel matches these filters.')}</p>
      )}
    </div>
  )
}
