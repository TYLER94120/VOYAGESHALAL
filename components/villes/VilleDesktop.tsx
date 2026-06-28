'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react'
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
  { key: 'Fajr', label: 'Fajr', ar: 'الفجر' },
  { key: 'Dhuhr', label: 'Dhuhr', ar: 'الظهر' },
  { key: 'Asr', label: 'ʿAsr', ar: 'العصر' },
  { key: 'Maghrib', label: 'Maghrib', ar: 'المغرب' },
  { key: 'Isha', label: 'ʿIsha', ar: 'العشاء' },
]

function PrayerAside({ ville }: { ville: any }) {
  const [timings, setTimings] = useState<Record<string, string> | null>(null)
  const [nextKey, setNextKey] = useState<string>('')
  const coord = ville.coordonnees ?? {}
  const lat = coord.lat ?? 41.0082
  const lng = coord.lng ?? 28.9784

  useEffect(() => {
    let cancelled = false
    async function load() {
      try {
        const d = new Date()
        const res = await fetch(`https://api.aladhan.com/v1/timings/${Math.floor(d.getTime() / 1000)}?latitude=${lat}&longitude=${lng}&method=3`)
        const json = await res.json()
        const t = json?.data?.timings
        if (!t || cancelled) return
        const clean: Record<string, string> = {}
        for (const p of PRAYER_LIST) clean[p.key] = (t[p.key] || '').slice(0, 5)
        const now = d.getHours() * 60 + d.getMinutes()
        let nk = 'Fajr'
        for (const p of PRAYER_LIST) {
          const [h, m] = clean[p.key].split(':').map(Number)
          if (h * 60 + m > now) { nk = p.key; break }
        }
        setTimings(clean); setNextKey(nk)
      } catch { /* silencieux */ }
    }
    load()
    return () => { cancelled = true }
  }, [lat, lng])

  return (
    <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--nuit)', borderRadius: '16px', padding: '18px' }}>
      <IslamicPattern opacity={0.06} />
      <div style={{ position: 'relative', zIndex: 1 }}>
        <p style={{ color: 'var(--or)', fontSize: '10px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', marginBottom: '12px' }}>
          🕐 Prières · {ville.nom}
        </p>
        {PRAYER_LIST.map((p) => {
          const isNext = p.key === nextKey
          return (
            <div key={p.key} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '9px 0', borderBottom: '1px solid rgba(253,250,243,0.07)' }}>
              <span style={{ color: isNext ? 'var(--or-clair)' : 'rgba(253,250,243,0.75)', fontSize: '13.5px', fontWeight: isNext ? 700 : 500 }}>
                {p.label} {isNext && <span style={{ fontSize: '10px', color: 'var(--or)' }}>· prochaine</span>}
              </span>
              <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '15px', color: isNext ? 'var(--or)' : '#fff', fontWeight: 700 }}>
                {timings ? timings[p.key] : '—'}
              </span>
            </div>
          )
        })}
        <a href="/horaires-priere" style={{ display: 'block', textAlign: 'center', marginTop: '12px', color: 'var(--or)', fontSize: '12px', fontWeight: 700, textDecoration: 'none' }}>Tous les horaires →</a>
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

  const cardStyle: React.CSSProperties = { background: '#fff', borderRadius: '18px', padding: '18px', border: '1px solid rgba(11,26,15,0.07)', boxShadow: '0 6px 20px rgba(11,26,15,0.05)' }
  const sideCard: React.CSSProperties = { background: '#fff', borderRadius: '16px', padding: '18px', border: '1px solid rgba(11,26,15,0.06)', boxShadow: '0 6px 20px rgba(11,26,15,0.04)' }

  return (
    <main style={{ background: 'var(--creme)', minHeight: '100vh' }}>
      {/* HERO pleine largeur */}
      <section style={{ position: 'relative', height: 380, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(11,26,15,0.92) 0%, rgba(11,26,15,0.25) 56%, rgba(11,26,15,0.1) 100%)' }} />
        <IslamicPattern opacity={0.05} />
        <div style={{ position: 'relative', maxWidth: 1280, margin: '0 auto', height: '100%', display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', padding: '42px 48px' }}>
          <div style={{ maxWidth: 620 }}>
            <p style={{ color: 'var(--or)', fontSize: '12px', fontWeight: 700, letterSpacing: '2px', textTransform: 'uppercase', marginBottom: '10px' }}>{ville.pays} · {ville.region ?? ''}</p>
            <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '64px', fontWeight: 900, color: '#fff', lineHeight: 1, margin: 0 }}>{ville.nom}</h1>
            {descShort && <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: '15px', marginTop: '12px', lineHeight: 1.5, maxWidth: 520 }}>{descShort}</p>}
          </div>
          {halalScore != null && (
            <div style={{ position: 'relative', width: 120, height: 130, flexShrink: 0 }}>
              <svg viewBox="0 0 120 130" style={{ position: 'absolute', inset: 0 }}>
                <polygon points="60,4 110,32 110,98 60,126 10,98 10,32" fill="rgba(11,26,15,0.55)" stroke="#C9A84C" strokeWidth="1.6" />
                <polygon points="60,16 99,38 99,92 60,114 21,92 21,38" fill="none" stroke="rgba(201,168,76,0.35)" strokeWidth="1" strokeDasharray="3 3" />
              </svg>
              <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '2px' }}>
                <span style={{ fontFamily: "'Playfair Display', serif", fontSize: '36px', fontWeight: 900, color: '#C9A84C', lineHeight: 1 }}>{halalScore}</span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px', color: 'var(--or-clair)', fontSize: '8px', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '1px' }}>
                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#3BD17A', display: 'inline-block' }} /> Halal Score
                </span>
              </div>
            </div>
          )}
        </div>
        <a href={ville.imageCredit?.link || 'https://unsplash.com'} target="_blank" rel="noopener noreferrer" style={{ position: 'absolute', bottom: 8, right: 12, color: 'rgba(255,255,255,0.5)', fontSize: '10px', textDecoration: 'none', zIndex: 5 }}>
          📷 {ville.imageCredit?.name ? `${ville.imageCredit.name} / ` : ''}Unsplash
        </a>
      </section>

      {/* ACTIONS RAPIDES */}
      <div style={{ background: 'var(--nuit)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'flex', gap: '12px', padding: '16px 48px', flexWrap: 'wrap' }}>
          {[
            { href: '/mosquee-proche', icon: '🕌', label: 'Mosquée proche' },
            { href: '/qibla', icon: '🧭', label: 'Direction Qibla' },
            { href: '/horaires-priere', icon: '🕐', label: 'Horaires de prière' },
            { href: `https://maps.google.com/?q=${encodeURIComponent(ville.nom)}`, icon: '🗺️', label: 'Voir sur la carte', ext: true },
            { href: `https://www.skyscanner.fr/vols-vers/${ville.slug ?? ville.nom}`, icon: '✈️', label: `Vols vers ${ville.nom}`, ext: true },
          ].map((a) => (
            <a key={a.label} href={a.href} target={a.ext ? '_blank' : undefined} rel={a.ext ? 'noopener noreferrer' : undefined}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.32)', borderRadius: '12px', padding: '10px 18px', textDecoration: 'none', color: 'var(--or)', fontSize: '13px', fontWeight: 700 }}>
              <span style={{ fontSize: '16px' }}>{a.icon}</span>{a.label}
            </a>
          ))}
        </div>
      </div>

      {/* LAYOUT 3 COLONNES */}
      <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: '260px 1fr 300px', gap: '32px', padding: '36px 48px 64px', alignItems: 'start' }}>
        {/* SIDEBAR GAUCHE */}
        <aside style={{ position: 'sticky', top: 96, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div style={sideCard}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: 700, color: 'var(--nuit)', marginBottom: '12px' }}>Catégories</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '3px' }}>
              {categories.map((cat) => {
                const active = activeFilter === cat
                return (
                  <button key={cat} onClick={() => { setActiveTab('restaurants'); setActiveFilter(cat) }} style={{ textAlign: 'left', padding: '10px 14px', borderRadius: '10px', border: 'none', background: active ? 'var(--foret)' : 'transparent', color: active ? 'var(--creme)' : 'var(--texte)', fontSize: '14px', fontWeight: active ? 700 : 500, cursor: 'pointer', transition: 'background 0.15s' }}>
                    {cat === 'Tous' ? '🍽 Tous' : `${CATEGORY_EMOJI[cat] ?? '🍽'} ${cat}`}
                  </button>
                )
              })}
            </div>
          </div>
          {halalScore != null && (
            <div style={{ position: 'relative', overflow: 'hidden', background: 'var(--nuit)', borderRadius: '16px', padding: '18px' }}>
              <IslamicPattern opacity={0.06} />
              <div style={{ position: 'relative', zIndex: 1 }}>
                <p style={{ fontFamily: "'Playfair Display', serif", color: 'var(--or)', fontSize: '17px', fontWeight: 700, marginBottom: '6px' }}>Halal Score™ {halalScore}/10</p>
                <p style={{ color: '#a9b6a8', fontSize: '12.5px', lineHeight: 1.6 }}>Note calculée sur la densité de restaurants certifiés, mosquées, accueil des familles musulmanes et absence d&apos;alcool.</p>
              </div>
            </div>
          )}
        </aside>

        {/* COLONNE CENTRALE */}
        <div>
          {/* Onglets */}
          <div style={{ display: 'flex', gap: '4px', borderBottom: '1px solid rgba(11,26,15,0.08)', marginBottom: '24px', overflowX: 'auto' }}>
            {TABS.map((tab) => {
              const active = activeTab === tab.id
              const count = tabCounts[tab.id]
              return (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', alignItems: 'center', gap: '7px', padding: '13px 20px', border: 'none', background: 'none', borderBottom: `2.5px solid ${active ? 'var(--or)' : 'transparent'}`, color: active ? 'var(--foret)' : 'var(--texte-2)', fontSize: '14.5px', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                  <span>{tab.icon}</span>{tab.label}
                  {count > 0 && <span style={{ fontSize: '11px', padding: '1px 7px', borderRadius: '20px', background: active ? 'var(--foret)' : '#EDE8DC', color: active ? '#fff' : 'var(--foret)', fontWeight: 700 }}>{count}</span>}
                </button>
              )
            })}
          </div>

          {activeTab === 'restaurants' && (
            <>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '18px' }}>
                <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '24px', fontWeight: 900, color: 'var(--nuit)' }}>Restaurants halal certifiés</h2>
                <span style={{ fontSize: '13px', color: 'var(--texte-2)' }}>{restosFiltres.length} adresses vérifiées</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' }}>
                {restosFiltres.map((r: any, i: number) => (
                  <div key={i} className="card-halal" style={{ ...cardStyle, display: 'flex', gap: '14px' }}>
                    <div style={{ width: 58, height: 58, borderRadius: '14px', background: 'var(--nuit)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '26px', position: 'relative', overflow: 'hidden' }}>
                      <IslamicPattern opacity={0.12} />
                      <span style={{ position: 'relative', zIndex: 1 }}>{CATEGORY_EMOJI[r.type] ?? '🍽'}</span>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '19px', color: 'var(--texte)', lineHeight: 1.15 }}>{r.nom}</p>
                      <p style={{ fontSize: '13px', color: 'var(--texte-2)', marginBottom: '7px' }}>{r.type}</p>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '11px', flexWrap: 'wrap' }}>
                        <span style={{ background: 'var(--halal-bg)', color: 'var(--halal-tx)', fontSize: '11px', fontWeight: 700, borderRadius: '20px', padding: '3px 9px' }}>✓ Halal</span>
                        <span style={{ fontSize: '13px', color: '#B8860B', fontWeight: 700 }}>★ {r.score ?? r.note}</span>
                        <span style={{ fontSize: '12px', color: 'var(--texte-2)' }}>{r.priceRange ?? r.fourchette_prix}</span>
                      </div>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <a href={r.mapsUrl} target="_blank" rel="noopener noreferrer" onClick={() => toast('Ouverture dans Google Maps…', 'success')} style={{ flex: 1, padding: '11px 0', background: 'var(--halal-bg)', color: 'var(--halal-tx)', borderRadius: '11px', textAlign: 'center', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>🗺 Maps</a>
                        {r.specialite && <button onClick={() => toast(`⭐ ${r.specialite}`, 'success')} style={{ flex: 1, padding: '11px 0', background: 'var(--foret)', color: 'var(--creme)', border: 'none', borderRadius: '11px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>⭐ Spécialité</button>}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {activeTab === 'hotels' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '18px' }}>
              {hotels.map((h: any, i: number) => (
                <div key={i} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px' }}>
                    <div><p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '18px', color: 'var(--texte)' }}>{h.nom}</p>
                      <p style={{ fontSize: '12.5px', color: 'var(--texte-2)', marginTop: '2px' }}>{h.categorie} · {h.priceRange}</p></div>
                    <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--or)' }}>★ {h.score ?? h.note}</span>
                  </div>
                  {h.description && <p style={{ fontSize: '12.5px', color: 'var(--texte-2)', lineHeight: 1.6, marginBottom: '10px' }}>{h.description}</p>}
                  <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginBottom: '11px' }}>
                    {(h.halalFriendly ?? h.halal_certifie) && <span style={{ background: 'var(--halal-bg)', color: 'var(--halal-tx)', fontSize: '11px', fontWeight: 700, borderRadius: '20px', padding: '3px 9px' }}>✓ Halal-friendly</span>}
                    {(h.sansAlcool ?? h.sans_alcool) && <span style={{ background: 'rgba(201,168,76,0.18)', color: '#8A6D1E', fontSize: '11px', fontWeight: 700, borderRadius: '20px', padding: '3px 9px' }}>🚫 Sans alcool</span>}
                  </div>
                  <div style={{ display: 'flex', gap: '7px' }}>
                    <a href={h.bookingUrl} target="_blank" rel="noopener noreferrer" onClick={() => toast('Ouverture de Booking.com…', 'success')} style={{ flex: 1, padding: '12px 0', background: 'var(--booking)', color: '#fff', borderRadius: '13px', textAlign: 'center', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>📖 Booking.com</a>
                    {h.halalBookingUrl && <a href={h.halalBookingUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '12px 0', background: 'var(--foret)', color: 'var(--creme)', borderRadius: '13px', textAlign: 'center', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>🕌 HalalBooking</a>}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'mosquees' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {mosquees.map((m: any, i: number) => (
                <div key={i} style={cardStyle}>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '18px', color: 'var(--nuit)', marginBottom: '4px' }}>🕌 {m.nom}</p>
                  <p style={{ fontSize: '13px', color: 'var(--texte-2)', lineHeight: 1.6, marginBottom: '8px' }}>{m.description}</p>
                  <a href={m.mapsUrl} target="_blank" rel="noopener noreferrer" onClick={() => toast('Ouverture dans Google Maps…', 'success')} style={{ display: 'inline-block', padding: '9px 16px', background: 'var(--halal-bg)', color: 'var(--halal-tx)', borderRadius: '10px', fontSize: '12.5px', fontWeight: 700, textDecoration: 'none' }}>🗺 Voir sur la carte →</a>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'activites' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              {activites.map((a: any, i: number) => (
                <div key={i} style={cardStyle}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, fontSize: '17px', color: 'var(--texte)', flex: 1 }}>{a.nom}</p>
                    <span style={{ background: 'rgba(27,67,50,0.08)', color: 'var(--foret)', fontSize: '11px', fontWeight: 600, borderRadius: '20px', padding: '3px 9px', marginLeft: '8px' }}>{a.prix}</span>
                  </div>
                  <span style={{ display: 'inline-block', fontSize: '11px', color: 'var(--texte-2)', marginBottom: '5px' }}>{a.categorie} · {a.duree}</span>
                  <p style={{ fontSize: '12.5px', color: 'var(--texte-2)', lineHeight: 1.6, marginBottom: '10px' }}>{a.description}</p>
                  <a href={a.mapsUrl} target="_blank" rel="noopener noreferrer" onClick={() => toast('Ouverture dans Google Maps…', 'success')} style={{ display: 'inline-block', padding: '9px 16px', background: 'var(--halal-bg)', color: 'var(--halal-tx)', borderRadius: '10px', fontSize: '12.5px', fontWeight: 700, textDecoration: 'none' }}>🗺 Maps →</a>
                </div>
              ))}
            </div>
          )}

          {activeTab === 'pratique' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
              {pratiqueItems.map((item, i) => (
                <div key={i} style={{ ...cardStyle, display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontSize: '24px' }}>{item.icon}</span>
                  <div><p style={{ fontSize: '11px', color: 'var(--texte-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 2px' }}>{item.label}</p>
                    <p style={{ fontSize: '14px', color: 'var(--texte)', fontWeight: 600, margin: 0 }}>{item.value as string}</p></div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SIDEBAR DROITE */}
        <aside style={{ position: 'sticky', top: 96, display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <PrayerAside ville={ville} />
          <div style={sideCard}>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '16px', fontWeight: 700, color: 'var(--nuit)', marginBottom: '12px' }}>En bref</p>
            {[
              { l: 'Restaurants halal', v: restaurants.length },
              { l: 'Mosquées', v: mosquees.length },
              { l: 'Hôtels', v: hotels.length },
              { l: 'À faire', v: activites.length },
            ].map((s) => (
              <div key={s.l} style={{ display: 'flex', justifyContent: 'space-between', padding: '7px 0', borderBottom: '1px solid rgba(11,26,15,0.05)' }}>
                <span style={{ fontSize: '13px', color: 'var(--texte-2)' }}>{s.l}</span>
                <span style={{ fontSize: '14px', fontWeight: 700, color: 'var(--foret)' }}>{s.v}</span>
              </div>
            ))}
          </div>
        </aside>
      </div>
    </main>
  )
}
