'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useMemo, useState } from 'react'
import SaveButton from '@/components/ui/SaveButton'
import PlacePhoto from '@/components/ui/PlacePhoto'
import { favId } from '@/lib/favorites'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import {
  type HotelLike, type LatLng, coordsOf, distanceKm, priceRank, noteOf, reviewCountOf,
  scoreSitue, scoreRecommended, categoryOf, EQUIP,
} from '@/lib/hotelFilter'

type SortKey = 'reco' | 'situe' | 'proche' | 'note' | 'cher'
interface Enriched { h: HotelLike; c: LatLng | null; dist: number | null; reco: number; situe: number; nearestMosqueKm: number; restosNear: number; nearestRestoKm: number; pr: number | null }

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

export default function HotelFilter({ hotels, mosques, restos, center, en: enProp, villeNom, villeSlug }: {
  hotels: HotelLike[]; mosques: LatLng[]; restos: LatLng[]; center: LatLng | null; en?: boolean
  villeNom?: string; villeSlug?: string
}) {
  const { lang } = useLanguage()
  const en = enProp ?? lang === 'en'
  const [open, setOpen] = useState(false)
  // 🛏 ITÉRATION 5 : le choix par PRIORITÉ — le guide choisit pour le
  // voyageur, l'annuaire (filtres + grille) n'est que le repli.
  const [priorite, setPriorite] = useState<'mosquee' | 'budget' | 'famille'>('mosquee')
  const [voirTous, setVoirTous] = useState(false)
  const [sort, setSort] = useState<SortKey>('reco')
  const [types, setTypes] = useState<Set<string>>(new Set())
  const [equip, setEquip] = useState<Set<string>>(new Set())
  const [budget, setBudget] = useState<string | null>(null)
  const [locNearMosque, setLocNearMosque] = useState(false)
  const [locRestos, setLocRestos] = useState(false)
  // La liste complete faisait 31 ecrans a elle seule (111 hotels d'un coup).
  // Regle du board : on repond d'abord, la suite vient a la demande.
  const PAR_LOT = 6
  const [visibles, setVisibles] = useState(PAR_LOT)

  const enriched: Enriched[] = useMemo(() => hotels.map((h) => {
    const c = coordsOf(h)
    const dist = c && center ? distanceKm(c, center) : null
    const s = c ? scoreSitue(c, mosques, restos) : { score: 0, nearestMosqueKm: Infinity, restosNear: 0, nearestRestoKm: Infinity }
    return { h, c, dist, reco: scoreRecommended(h, dist), situe: s.score, nearestMosqueKm: s.nearestMosqueKm, restosNear: s.restosNear, nearestRestoKm: s.nearestRestoKm, pr: priceRank(h) }
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
  const resetLot = () => setVisibles(PAR_LOT)
  const toggle = (set: Set<string>, setter: (s: Set<string>) => void, id: string) => {
    const n = new Set(set); n.has(id) ? n.delete(id) : n.add(id); setter(n); resetLot()
  }
  const chip = (on: boolean): React.CSSProperties => ({ minHeight: 46, padding: '0 16px', borderRadius: 30, display: 'inline-flex', alignItems: 'center', border: `1.5px solid ${on ? 'var(--foret)' : 'rgba(27,67,50,0.25)'}`, background: on ? 'var(--foret)' : '#fff', color: on ? '#fff' : 'var(--foret)', fontWeight: 700, fontSize: 13, cursor: 'pointer' })
  const t = (fr: string, en2: string) => (en ? en2 : fr)

  // Le top 3 de la priorité choisie. Un hôtel sans prix affichable descend
  // en mode budget ; un hôtel sans coordonnées descend en mode mosquée.
  const top3Prio = useMemo(() => {
    const L = [...enriched]
    if (priorite === 'mosquee') L.sort((a, b) => a.nearestMosqueKm - b.nearestMosqueKm)
    else if (priorite === 'budget') {
      L.sort((a, b) => {
        const pa = typeof a.h.prixNuitEur === 'number' ? a.h.prixNuitEur : Infinity
        const pb = typeof b.h.prixNuitEur === 'number' ? b.h.prixNuitEur : Infinity
        const na = (noteOf(a.h) ?? 0) >= 4 ? 0 : 1, nb = (noteOf(b.h) ?? 0) >= 4 ? 0 : 1
        return na - nb || pa - pb
      })
    } else {
      const equipN = (e: Enriched) => equipList.filter((eq) => (EQUIP as any)[eq.id](e.h)).length
      L.sort((a, b) => equipN(b) - equipN(a) || (noteOf(b.h) ?? 0) - (noteOf(a.h) ?? 0))
    }
    return L.slice(0, 3)
  }, [enriched, priorite])

  const m = (km: number) => (km < 1 ? `${Math.round(km * 1000)} m` : `${km.toFixed(1).replace('.', ',')} km`)
  const atout = (e: Enriched): string => {
    if (priorite === 'mosquee' && e.nearestMosqueKm !== Infinity) {
      return `🕌 ${t('Mosquée à', 'Mosque at')} ${m(e.nearestMosqueKm)}${e.restosNear > 0 ? ` · ${e.restosNear} ${t('restos halal à pied', 'halal spots on foot')}` : ''}`
    }
    if (priorite === 'budget' && (noteOf(e.h) ?? 0) > 0) return `⭐ ${noteOf(e.h)} ${t('pour ce prix', 'for this price')}${e.nearestMosqueKm !== Infinity && e.nearestMosqueKm <= 1 ? ` · ${t('mosquée à', 'mosque at')} ${m(e.nearestMosqueKm)}` : ''}`
    const eqs = equipList.filter((eq) => (EQUIP as any)[eq.id](e.h)).slice(0, 2).map((eq) => (en ? eq.en : eq.fr))
    if (eqs.length) return `✓ ${eqs.join(' · ')}`
    return e.restosNear > 0 ? `🍽 ${t('Resto halal à', 'Halal food at')} ${m(e.nearestRestoKm)} · ${e.restosNear} ${t('autres à pied', 'more on foot')}` : ''
  }

  const PRIOS: { id: typeof priorite; icone: string; fr: string; en: string }[] = [
    { id: 'mosquee', icone: '🕌', fr: 'Près de la mosquée', en: 'Near the mosque' },
    { id: 'budget', icone: '💰', fr: 'Petit budget', en: 'Low budget' },
    { id: 'famille', icone: '👨‍👩‍👧', fr: 'Confort famille', en: 'Family comfort' },
  ]

  return (
    <div>
      {/* La question, puis 3 priorités — jamais un mur de filtres. */}
      <p style={{ fontSize: 14.5, color: 'var(--texte-2)', margin: '0 0 12px' }}>
        {t('Dis-nous ', 'Tell us ')}<strong style={{ color: 'var(--foret)' }}>{t('ce qui compte le plus', 'what matters most')}</strong>{t(' — on te montre les 3 meilleurs pour ça.', ' — we show the 3 best for that.')}
      </p>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 18 }}>
        {PRIOS.map((p) => {
          const on = priorite === p.id
          return (
            <button key={p.id} onClick={() => setPriorite(p.id)} aria-pressed={on}
              style={{ minHeight: 92, borderRadius: 16, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6, padding: '8px 6px', textAlign: 'center', lineHeight: 1.25, fontSize: 13.5, fontWeight: 600, cursor: 'pointer', border: `1.5px solid ${on ? 'var(--or)' : 'rgba(27,67,50,0.2)'}`, background: on ? 'rgba(201,168,76,0.16)' : '#fff', color: 'var(--foret)' }}>
              <span style={{ fontSize: 22 }}>{p.icone}</span>{en ? p.en : p.fr}
            </button>
          )
        })}
      </div>

      {top3Prio.map((e, i) => {
        const h = e.h
        const lien = h.halalBookingUrl || h.halal_booking_url || h.bookingUrl || h.booking_url
        const equips = equipList.filter((eq) => (EQUIP as any)[eq.id](h)).slice(0, 2).map((eq) => (en ? eq.en : eq.fr))
        const contenu = (
          <>
            <span style={{ flexShrink: 0, width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 14, background: i === 0 ? 'linear-gradient(135deg, #D9BE6C, var(--or))' : 'rgba(201,168,76,0.15)', color: i === 0 ? '#0A1509' : '#C9A84C' }}>{i + 1}</span>
            <span style={{ flexShrink: 0, width: 96, height: 64, borderRadius: 12, overflow: 'hidden' }}>
              <PlacePhoto query={`${h.nom} ${villeNom ?? ''} hotel`} height={64} gradient={['#2C4F6B', '#101F2C']} emoji="" emojiSize={0} />
            </span>
            <span style={{ flex: 1, minWidth: 0 }}>
              <span style={{ display: 'block', fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 17, color: 'var(--texte)', lineHeight: 1.2 }}>{h.nom}</span>
              {atout(e) && <span style={{ display: 'block', fontSize: 13, color: 'rgba(253,250,243,0.72)', marginTop: 2 }}>{atout(e)}</span>}
              {equips.length > 0 && <span style={{ display: 'block', fontSize: 12.5, color: '#7FBF8F', fontWeight: 600, marginTop: 2 }}>{equips.join(' · ')}</span>}
            </span>
            <span style={{ flexShrink: 0, textAlign: 'right' }}>
              {typeof h.prixNuitEur === 'number' && (
                <span style={{ display: 'block', fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: 17, color: '#C9A84C', whiteSpace: 'nowrap' }}>{en ? 'from' : 'dès'} {h.prixNuitEur} €</span>
              )}
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ color: 'rgba(253,250,243,0.4)', marginTop: 2 }}><path d="m9 5 7 7-7 7" /></svg>
            </span>
          </>
        )
        const style: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: 12, width: '100%', padding: '12px 14px', marginBottom: 10, borderRadius: 16, border: `1px solid ${i === 0 ? 'var(--or)' : 'rgba(201,168,76,0.14)'}`, background: 'rgba(253,250,243,0.05)', textDecoration: 'none', cursor: 'pointer', textAlign: 'left' }
        return lien
          ? <a key={i} href={lien} target="_blank" rel="sponsored noopener noreferrer" style={style}>{contenu}</a>
          : <a key={i} href={h.mapsUrl || (e.c ? `https://maps.google.com/?q=${e.c.lat},${e.c.lng}` : '#')} target="_blank" rel="noopener noreferrer" style={style}>{contenu}</a>
      })}

      {!voirTous && (
        <button onClick={() => setVoirTous(true)}
          style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 48, width: '100%', background: 'none', border: 'none', color: 'var(--texte-2)', fontSize: 14, fontWeight: 600, cursor: 'pointer', gap: 6, marginBottom: 8 }}>
          {t(`Voir les ${hotels.length} hôtels ↓`, `See all ${hotels.length} hotels ↓`)}
        </button>
      )}

      {voirTous && (<>
      {/* Barre repliée : 1 bouton → 1 feuille */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
        <button onClick={() => setOpen((o) => !o)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 18px', borderRadius: 14, border: '1.5px solid var(--foret)', background: 'rgba(253,250,243,0.06)', color: 'var(--foret)', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
          ⚙️ {t('Filtrer & trier', 'Filter & sort')}{activeCount ? ` · ${activeCount}` : ''}
        </button>
        <span style={{ fontSize: 13, color: 'var(--texte-2)' }}>
          <strong style={{ color: 'var(--foret)' }}>{filtered.length}</strong> {t('hôtels', 'hotels')} · {SORTS.find((s) => s.id === sort)![en ? 'en' : 'fr']}
        </span>
      </div>

      {open && (
        <div style={{ background: 'rgba(253,250,243,0.06)', border: '1px solid rgba(27,67,50,0.14)', borderRadius: 16, padding: 18, marginBottom: 18, display: 'flex', flexDirection: 'column', gap: 16 }}>
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
        {filtered.slice(0, visibles).map((e, i) => {
          const h = e.h
          return (
            <div key={i} style={{ background: 'rgba(253,250,243,0.06)', border: '1px solid rgba(27,67,50,0.1)', borderRadius: 18, padding: 18 }}>
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
                  <span style={{ background: 'var(--halal-bg)', color: 'var(--halal-tx)', fontSize: 11.5, fontWeight: 700, borderRadius: 20, padding: '4px 10px' }}>🕌 {t('Mosquée', 'Mosque')} {e.nearestMosqueKm < 1 ? `${Math.round(e.nearestMosqueKm * 1000)} m` : `${e.nearestMosqueKm.toFixed(1)} km`}</span>
                )}
                {/* 🔴 La pastille dit maintenant la DISTANCE au plus proche, pas
                    seulement un compte : quatre hôtels du même quartier
                    voyaient les mêmes 7 restaurants, et une pastille
                    identique partout n'aide personne à choisir. */}
                {e.restosNear > 0 && (
                  <span style={{ background: 'rgba(201,168,76,0.18)', color: '#8A6D1E', fontSize: 11.5, fontWeight: 700, borderRadius: 20, padding: '4px 10px' }}>
                    🍽 {t('Resto halal à', 'Halal food at')} {e.nearestRestoKm < 1 ? `${Math.round(e.nearestRestoKm * 1000)} m` : `${e.nearestRestoKm.toFixed(1)} km`}
                    {e.restosNear > 1 ? ` · ${e.restosNear - 1} ${t('autres à pied', 'more on foot')}` : ''}
                  </span>
                )}
                {equipList.filter((eq) => (EQUIP as any)[eq.id](h)).slice(0, 3).map((eq) => (
                  <span key={eq.id} style={{ background: 'rgba(27,67,50,0.07)', color: 'var(--foret)', fontSize: 11.5, fontWeight: 700, borderRadius: 20, padding: '4px 10px' }}>✓ {en ? eq.en : eq.fr}{(eq.id === 'piscineNonMixte' || eq.id === 'plagePrivee') ? ' · HalalBooking' : ''}</span>
                ))}
              </div>
              {villeNom && (
                <div style={{ marginBottom: 8 }}>
                  <SaveButton en={en} fav={{ id: favId('hotel', villeSlug ?? villeNom, h.nom), kind: 'hotel', nom: String(h.nom ?? ''), villeNom, href: `/destinations/${villeSlug ?? ''}` }} />
                </div>
              )}
              <div style={{ display: 'flex', gap: 8 }}>
                {(h.mapsUrl || e.c) && <a href={h.mapsUrl || `https://maps.google.com/?q=${e.c!.lat},${e.c!.lng}`} target="_blank" rel="noopener noreferrer" style={{ flex: 1, minHeight: 48, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--halal-bg)', color: 'var(--halal-tx)', borderRadius: 12, fontSize: 13.5, fontWeight: 700, textDecoration: 'none' }}>🗺 {t('Carte', 'Map')}</a>}
                {(h.halalBookingUrl || h.halal_booking_url) && <a href={h.halalBookingUrl || h.halal_booking_url} target="_blank" rel="sponsored noopener noreferrer" style={{ flex: 1, minHeight: 48, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'var(--foret)', color: 'var(--creme)', borderRadius: 12, textAlign: 'center', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>🕌 {t('Réserver halal', 'Book halal')}</a>}
                {!(h.halalBookingUrl || h.halal_booking_url) && (h.bookingUrl || h.booking_url) && <a href={h.bookingUrl || h.booking_url} target="_blank" rel="sponsored noopener noreferrer" style={{ flex: 1, minHeight: 48, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #D9BE6C, var(--or))', color: '#0A1509', borderRadius: 12, textAlign: 'center', fontSize: 13, fontWeight: 700, textDecoration: 'none' }}>📖 {t('Réserver', 'Book')}</a>}
              </div>
            </div>
          )
        })}
      </div>
      {/* Le reste a la demande — le compte exact est annonce */}
      {filtered.length > visibles && (
        <div style={{ textAlign: 'center', marginTop: 22 }}>
          <button
            onClick={() => setVisibles((v) => v + PAR_LOT)}
            style={{ minHeight: 56, padding: '0 26px', borderRadius: 16, cursor: 'pointer', border: '2px solid rgba(27,67,50,0.25)', background: 'rgba(253,250,243,0.06)', color: 'var(--foret)', fontWeight: 800, fontSize: 15.5 }}
          >
            {t(`Voir ${Math.min(filtered.length - visibles, PAR_LOT)} hôtels de plus (${filtered.length - visibles} restants)`,
               `Show ${Math.min(filtered.length - visibles, PAR_LOT)} more hotels (${filtered.length - visibles} left)`)}
          </button>
        </div>
      )}
      {filtered.length === 0 && (
        <p style={{ textAlign: 'center', color: 'var(--texte-2)', padding: 24 }}>{t('Aucun hôtel ne correspond à ces filtres.', 'No hotel matches these filters.')}</p>
      )}
      </>)}
    </div>
  )
}
