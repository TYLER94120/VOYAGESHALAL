'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
import Image from 'next/image'
import IslamicPattern from '@/components/ui/IslamicPattern'
import { useToast } from '@/components/Toast'

const TABS = [
  { id: 'restaurants', icon: '🍽', label: 'Restaurants' },
  { id: 'mosquees', icon: '🕌', label: 'Mosquées' },
  { id: 'hotels', icon: '🏨', label: 'Hôtels' },
  { id: 'activites', icon: '🎯', label: 'À faire' },
  { id: 'pratique', icon: 'ℹ️', label: 'Pratique' },
]

const CATEGORY_EMOJI: Record<string, string> = {
  'Traditionnel local': '🍜', Marocain: '🫕', 'Libanais & Levant': '🥙',
  'Indien & Pakistani': '🍛', 'Pizza & Italien': '🍕', 'Japonais & Asiatique': '🍣',
  'Burgers & Fast-food': '🍔', Gastronomique: '🍽', 'Végétarien & Healthy': '🥗',
  'Pâtisserie & Café': '☕', 'Grillades & Kebab': '🔥', 'Fruits de mer': '🦐', Turc: '🥙',
}

const PRAYER_LIST = [
  { key: 'Fajr', label: 'Fajr' }, { key: 'Dhuhr', label: 'Dhuhr' }, { key: 'Asr', label: 'ʿAsr' },
  { key: 'Maghrib', label: 'Maghrib' }, { key: 'Isha', label: 'ʿIsha' },
]

// Bandeau horizontal « prochaine prière » (live AlAdhan)
function PrayerStrip({ ville }: { ville: any }) {
  const [timings, setTimings] = useState<Record<string, string> | null>(null)
  const [nextKey, setNextKey] = useState('')
  const coord = ville.coordonnees ?? {}
  const lat = coord.lat ?? 41.0082, lng = coord.lng ?? 28.9784
  useEffect(() => {
    let cancelled = false
    ;(async () => {
      try {
        const d = new Date()
        const r = await fetch(`https://api.aladhan.com/v1/timings/${Math.floor(d.getTime() / 1000)}?latitude=${lat}&longitude=${lng}&method=3`)
        const j = await r.json(); const t = j?.data?.timings
        if (!t || cancelled) return
        const clean: Record<string, string> = {}
        for (const p of PRAYER_LIST) clean[p.key] = (t[p.key] || '').slice(0, 5)
        const now = d.getHours() * 60 + d.getMinutes()
        let nk = 'Fajr'
        for (const p of PRAYER_LIST) { const [h, m] = clean[p.key].split(':').map(Number); if (h * 60 + m > now) { nk = p.key; break } }
        setTimings(clean); setNextKey(nk)
      } catch { /* silencieux */ }
    })()
    return () => { cancelled = true }
  }, [lat, lng])

  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--nuit)', borderRadius: '18px', padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
      <IslamicPattern opacity={0.06} />
      <span style={{ position: 'relative', color: 'var(--or)', fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase' }}>🕐 Prières · {ville.nom}</span>
      <div style={{ position: 'relative', display: 'flex', gap: '20px', flexWrap: 'wrap' }}>
        {PRAYER_LIST.map((p) => {
          const isNext = p.key === nextKey
          return (
            <div key={p.key} style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '11px', color: isNext ? 'var(--or)' : 'rgba(253,250,243,0.6)', fontWeight: isNext ? 700 : 500 }}>{p.label}</div>
              <div style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: 700, color: isNext ? 'var(--or)' : '#fff' }}>{timings ? timings[p.key] : '—'}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default function VilleDesktop({ ville }: { ville: any }) {
  const [activeTab, setActiveTab] = useState('restaurants')
  const [activeFilter, setActiveFilter] = useState('Tous')
  const toast = useToast()

  const image = ville.image || ville.image_hero
  const halalScore = ville.halalScore ?? (ville.score_halal ? Math.round(ville.score_halal * 2 * 10) / 10 : null)
  const restaurants = ville.restaurants ?? []
  const mosquees = ville.mosqueesPrincipales ?? []
  const hotels = ville.hotels ?? []
  const activites = ville.activites ?? []
  const ip = ville.infoPratique ?? {}
  const legacyIp = ville.infos_pratiques ?? {}
  const descShort = typeof ville.description === 'string' ? ville.description : (ville.description?.court ?? ville.description?.long ?? '')

  const categories = ['Tous', ...Array.from(new Set(restaurants.map((r: any) => r.type).filter(Boolean)))] as string[]
  const restosFiltres = activeFilter === 'Tous' ? restaurants : restaurants.filter((r: any) => r.type === activeFilter)
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
      <section style={{ position: 'relative', height: 300, overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        {image && <Image src={image} alt={`Guide voyage halal ${ville.nom}`} fill priority sizes="100vw" style={{ objectFit: 'cover', opacity: 0.5 }} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(11,26,15,0.55) 0%, rgba(11,26,15,0.82) 100%)' }} />
        <IslamicPattern opacity={0.05} />
        <div style={{ position: 'relative', maxWidth: WRAP, padding: '0 24px' }}>
          <p style={{ color: 'var(--or)', fontSize: '12px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '12px' }}>{ville.pays}{ville.region ? ` · ${ville.region}` : ''}</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: '#fff', lineHeight: 1.02, margin: 0 }}>
            <span style={{ fontSize: '18px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Guide Halal </span>
            <span style={{ fontSize: '56px', fontWeight: 900 }}>{ville.nom}</span>
            <span style={{ fontSize: '22px', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}> 2026</span>
          </h1>
          {halalScore != null && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', marginTop: '14px', padding: '7px 16px', borderRadius: '30px', background: 'rgba(201,168,76,0.18)', border: '1px solid rgba(201,168,76,0.5)', color: 'var(--or-clair)', fontSize: '13px', fontWeight: 700 }}>
              <span style={{ width: 7, height: 7, borderRadius: '50%', background: '#3BD17A' }} /> ✦ {halalScore}/10 · Halal Score
            </span>
          )}
        </div>
      </section>

      {/* ACTIONS rapides — centrées */}
      <div style={{ background: 'var(--nuit)' }}>
        <div style={{ maxWidth: WRAP, margin: '0 auto', display: 'flex', gap: '10px', padding: '16px 24px', flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { href: '/mosquee-proche', icon: '🕌', label: 'Mosquée proche' },
            { href: '/qibla', icon: '🧭', label: 'Qibla' },
            { href: '/horaires-priere', icon: '🕐', label: 'Horaires' },
            { href: `https://maps.google.com/?q=${encodeURIComponent(ville.nom)}`, icon: '🗺️', label: 'Carte', ext: true },
            { href: `https://www.skyscanner.fr/vols-vers/${ville.slug ?? ville.nom}`, icon: '✈️', label: 'Vols', ext: true },
          ].map((a) => (
            <a key={a.label} href={a.href} target={a.ext ? '_blank' : undefined} rel={a.ext ? 'noopener noreferrer' : undefined}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.32)', borderRadius: '12px', padding: '10px 16px', textDecoration: 'none', color: 'var(--or)', fontSize: '13.5px', fontWeight: 700 }}>
              <span>{a.icon}</span>{a.label}
            </a>
          ))}
        </div>
      </div>

      {/* CONTENU — 1 colonne centrée, aérée */}
      <div style={{ maxWidth: WRAP, margin: '0 auto', padding: '28px 24px 80px' }}>
        {/* intro + prière */}
        {descShort && <p style={{ textAlign: 'center', color: 'var(--texte-2)', fontSize: '15.5px', lineHeight: 1.7, maxWidth: 720, margin: '0 auto 22px' }}>{descShort}</p>}
        <div style={{ marginBottom: '26px' }}><PrayerStrip ville={ville} /></div>

        {/* ONGLETS — plus gros, sticky, centrés */}
        <div style={{ position: 'sticky', top: 0, zIndex: 40, background: 'var(--creme)', display: 'flex', gap: '6px', justifyContent: 'center', flexWrap: 'wrap', borderBottom: '1px solid rgba(11,26,15,0.08)', marginBottom: '28px', paddingTop: '6px' }}>
          {TABS.map((tab) => {
            const active = activeTab === tab.id
            const count = tabCounts[tab.id]
            return (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '15px 22px', border: 'none', background: 'none', borderBottom: `3px solid ${active ? 'var(--or)' : 'transparent'}`, color: active ? 'var(--foret)' : 'var(--texte-2)', fontSize: '16px', fontWeight: active ? 700 : 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                <span style={{ fontSize: '18px' }}>{tab.icon}</span>{tab.label}
                {count > 0 && <span style={{ fontSize: '12px', padding: '2px 8px', borderRadius: '20px', background: active ? 'var(--foret)' : '#EDE8DC', color: active ? '#fff' : 'var(--foret)', fontWeight: 700 }}>{count}</span>}
              </button>
            )
          })}
        </div>

        {activeTab === 'restaurants' && (
          <>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 900, color: 'var(--nuit)' }}>Restaurants halal</h2>
              <span style={{ fontSize: '13px', color: 'var(--texte-2)' }}>{restosFiltres.length} adresses vérifiées</span>
            </div>
            {/* filtres catégories en pills */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '22px' }}>
              {categories.map((cat) => {
                const active = activeFilter === cat
                return (
                  <button key={cat} onClick={() => setActiveFilter(cat)} style={{ padding: '8px 16px', borderRadius: '30px', border: '1.5px solid rgba(27,67,50,0.25)', background: active ? 'var(--foret)' : '#fff', color: active ? '#fff' : 'var(--foret)', fontSize: '13.5px', fontWeight: 600, cursor: 'pointer' }}>
                    {cat === 'Tous' ? '🍽 Tous' : `${CATEGORY_EMOJI[cat] ?? '🍽'} ${cat}`}
                  </button>
                )
              })}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '20px' }}>
              {restosFiltres.map((r: any, i: number) => (
                <div key={i} className="card-halal" style={{ ...card, display: 'flex', gap: '16px' }}>
                  <div style={{ width: 62, height: 62, borderRadius: '15px', background: 'var(--nuit)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '28px', position: 'relative', overflow: 'hidden' }}>
                    <IslamicPattern opacity={0.12} />
                    <span style={{ position: 'relative', zIndex: 1 }}>{CATEGORY_EMOJI[r.type] ?? '🍽'}</span>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '20px', color: 'var(--texte)', lineHeight: 1.15 }}>{r.nom}</p>
                    <p style={{ fontSize: '13px', color: 'var(--texte-2)', marginBottom: '9px' }}>{r.type}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '9px', marginBottom: '14px', flexWrap: 'wrap' }}>
                      <span style={{ background: 'var(--halal-bg)', color: 'var(--halal-tx)', fontSize: '11px', fontWeight: 700, borderRadius: '20px', padding: '3px 10px' }}>✓ Halal</span>
                      <span style={{ fontSize: '13px', color: '#B8860B', fontWeight: 700 }}>★ {r.score ?? r.note}</span>
                      <span style={{ fontSize: '12px', color: 'var(--texte-2)' }}>{r.priceRange ?? r.fourchette_prix}</span>
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a href={r.mapsUrl} target="_blank" rel="noopener noreferrer" onClick={() => toast('Ouverture dans Google Maps…', 'success')} style={{ flex: 1, padding: '11px 0', background: 'var(--halal-bg)', color: 'var(--halal-tx)', borderRadius: '12px', textAlign: 'center', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>🗺 Maps</a>
                      {r.specialite && <button onClick={() => toast(`⭐ ${r.specialite}`, 'success')} style={{ flex: 1, padding: '11px 0', background: 'var(--foret)', color: 'var(--creme)', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>⭐ Spécialité</button>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {activeTab === 'hotels' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '20px' }}>
            {hotels.map((h: any, i: number) => (
              <div key={i} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                  <div><p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '19px', color: 'var(--texte)' }}>{h.nom}</p>
                    <p style={{ fontSize: '12.5px', color: 'var(--texte-2)', marginTop: '2px' }}>{h.categorie} · {h.priceRange}</p></div>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--or)' }}>★ {h.score ?? h.note}</span>
                </div>
                {h.description && <p style={{ fontSize: '13px', color: 'var(--texte-2)', lineHeight: 1.6, marginBottom: '12px' }}>{h.description}</p>}
                <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginBottom: '12px' }}>
                  {(h.halalFriendly ?? h.halal_certifie) && <span style={{ background: 'var(--halal-bg)', color: 'var(--halal-tx)', fontSize: '11px', fontWeight: 700, borderRadius: '20px', padding: '3px 9px' }}>✓ Halal-friendly</span>}
                  {(h.sansAlcool ?? h.sans_alcool) && <span style={{ background: 'rgba(201,168,76,0.18)', color: '#8A6D1E', fontSize: '11px', fontWeight: 700, borderRadius: '20px', padding: '3px 9px' }}>🚫 Sans alcool</span>}
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <a href={h.bookingUrl} target="_blank" rel="noopener noreferrer" onClick={() => toast('Ouverture de Booking.com…', 'success')} style={{ flex: 1, padding: '12px 0', background: 'var(--booking)', color: '#fff', borderRadius: '12px', textAlign: 'center', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>📖 Booking</a>
                  {h.halalBookingUrl && <a href={h.halalBookingUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '12px 0', background: 'var(--foret)', color: 'var(--creme)', borderRadius: '12px', textAlign: 'center', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>🕌 HalalBooking</a>}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'mosquees' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {mosquees.map((m: any, i: number) => (
              <div key={i} style={card}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '19px', color: 'var(--nuit)', marginBottom: '6px' }}>🕌 {m.nom}</p>
                <p style={{ fontSize: '13.5px', color: 'var(--texte-2)', lineHeight: 1.6, marginBottom: '10px' }}>{m.description}</p>
                <a href={m.mapsUrl} target="_blank" rel="noopener noreferrer" onClick={() => toast('Ouverture dans Google Maps…', 'success')} style={{ display: 'inline-block', padding: '9px 16px', background: 'var(--halal-bg)', color: 'var(--halal-tx)', borderRadius: '11px', fontSize: '12.5px', fontWeight: 700, textDecoration: 'none' }}>🗺 Voir sur la carte →</a>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'activites' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
            {activites.map((a: any, i: number) => (
              <div key={i} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '18px', color: 'var(--texte)', flex: 1 }}>{a.nom}</p>
                  <span style={{ background: 'rgba(27,67,50,0.08)', color: 'var(--foret)', fontSize: '11px', fontWeight: 600, borderRadius: '20px', padding: '3px 9px', marginLeft: '8px' }}>{a.prix}</span>
                </div>
                <span style={{ display: 'inline-block', fontSize: '11px', color: 'var(--texte-2)', marginBottom: '6px' }}>{a.categorie} · {a.duree}</span>
                <p style={{ fontSize: '13px', color: 'var(--texte-2)', lineHeight: 1.6, marginBottom: '12px' }}>{a.description}</p>
                <a href={a.mapsUrl} target="_blank" rel="noopener noreferrer" onClick={() => toast('Ouverture dans Google Maps…', 'success')} style={{ display: 'inline-block', padding: '9px 16px', background: 'var(--halal-bg)', color: 'var(--halal-tx)', borderRadius: '11px', fontSize: '12.5px', fontWeight: 700, textDecoration: 'none' }}>🗺 Maps →</a>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'pratique' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
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
