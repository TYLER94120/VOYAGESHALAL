'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react'
import IslamicPattern from '@/components/ui/IslamicPattern'
import { HalalScoreBadge } from '@/components/HalalScoreBadge'
import { useToast } from '@/components/Toast'

const TABS = [
  { id: 'restaurants', icon: '🍽', label: 'Restos' },
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

export default function VilleMobile({ ville }: { ville: any }) {
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

  const categories = ['Tous', ...Array.from(new Set(restaurants.map((r: any) => r.type).filter(Boolean)))] as string[]
  const restosFiltres = activeFilter === 'Tous' ? restaurants : restaurants.filter((r: any) => r.type === activeFilter)

  const tabCounts: Record<string, number> = {
    restaurants: restaurants.length, mosquees: mosquees.length, hotels: hotels.length, activites: activites.length,
  }

  const pratiqueItems = [
    { icon: '✈️', label: 'Visa', value: ip.visa },
    { icon: '💉', label: 'Vaccins', value: ip.vaccins },
    { icon: '🚇', label: 'Transport', value: ip.transport || legacyIp.transport },
    { icon: '🔌', label: 'Prise électrique', value: ip.priseElectrique },
    { icon: '🕐', label: 'Décalage horaire', value: ip.decalageHoraire },
    { icon: '💱', label: 'Monnaie', value: ville.monnaie || legacyIp.monnaie },
    { icon: '🌤', label: 'Meilleure époque', value: ville.meilleureEpoque || legacyIp.meilleure_periode },
    { icon: '🏨', label: 'Prix moyen / nuit', value: ville.prixMoyenNuit },
    { icon: '🗣️', label: 'Langue', value: ville.langue || legacyIp.langue },
  ].filter((i) => i.value)

  const card: React.CSSProperties = {
    background: 'white', borderRadius: '18px', padding: '15px',
    border: '1px solid rgba(11,26,15,0.07)', boxShadow: '0 6px 20px rgba(11,26,15,0.05)', marginBottom: '10px',
  }

  return (
    <main style={{ background: 'var(--creme)', minHeight: '100vh', paddingBottom: '90px' }}>
      {/* HERO */}
      <section style={{ position: 'relative', height: 236, overflow: 'hidden' }}>
        <div style={{ position: 'absolute', inset: 0, backgroundImage: `url(${image})`, backgroundSize: 'cover', backgroundPosition: 'center' }} />
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to bottom, rgba(11,26,15,0.2) 0%, rgba(11,26,15,0.85) 100%)' }} />
        <a href="/destinations" style={{ position: 'absolute', top: 16, left: 16, width: 38, height: 38, borderRadius: '50%', background: 'rgba(11,26,15,0.5)', backdropFilter: 'blur(8px)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontSize: '18px', textDecoration: 'none' }}>←</a>
        {halalScore != null && (
          <div style={{ position: 'absolute', top: 16, right: 16 }}>
            <HalalScoreBadge score={halalScore} />
          </div>
        )}
        <div style={{ position: 'absolute', bottom: 20, left: 18, right: 18 }}>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: '42px', fontWeight: 900, color: 'white', lineHeight: 1.05, margin: 0 }}>{ville.nom}</h1>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '14px', marginTop: '4px' }}>{ville.pays}</p>
        </div>
      </section>

      {/* ACTIONS RAPIDES */}
      <div style={{ background: 'var(--nuit)', display: 'flex', gap: '8px', padding: '10px 14px', overflowX: 'auto', scrollbarWidth: 'none' }}>
        {[
          { href: '/mosquee-proche', icon: '🕌', label: 'Mosquée' },
          { href: '/qibla', icon: '🧭', label: 'Qibla' },
          { href: '/horaires-priere', icon: '🕐', label: 'Prières' },
          { href: `https://maps.google.com/?q=${encodeURIComponent(ville.nom)}`, icon: '🗺️', label: 'Carte', ext: true },
          { href: `https://www.skyscanner.fr/vols-vers/${ville.slug ?? ville.nom}`, icon: '✈️', label: 'Vols', ext: true },
        ].map((a) => (
          <a key={a.label} href={a.href} target={a.ext ? '_blank' : undefined} rel={a.ext ? 'noopener noreferrer' : undefined}
            style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px', background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.32)', borderRadius: '12px', padding: '8px 14px', flexShrink: 0, textDecoration: 'none', minHeight: '44px' }}>
            <span style={{ fontSize: '18px' }}>{a.icon}</span>
            <span style={{ fontSize: '10px', color: 'var(--or)', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', whiteSpace: 'nowrap' }}>{a.label}</span>
          </a>
        ))}
      </div>

      {/* ONGLETS STICKY */}
      <div style={{ position: 'sticky', top: 0, zIndex: 50, background: 'white', borderBottom: '0.5px solid rgba(0,0,0,0.07)', boxShadow: '0 2px 12px rgba(0,0,0,0.06)', display: 'flex', overflowX: 'auto', scrollbarWidth: 'none', padding: '0 6px' }}>
        {TABS.map((tab) => {
          const count = tabCounts[tab.id]
          const active = activeTab === tab.id
          return (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '13px 6px 11px', flexShrink: 0, border: 'none', borderBottom: `2.5px solid ${active ? 'var(--foret)' : 'transparent'}`, background: 'none', cursor: 'pointer', gap: '2px', minHeight: '54px', transition: 'border-color 0.15s' }}>
              <span style={{ fontSize: '16px' }}>{tab.icon}</span>
              <span style={{ fontSize: '11.5px', fontWeight: 600, color: active ? 'var(--foret)' : 'var(--texte-2)', whiteSpace: 'nowrap' }}>{tab.label}</span>
              {count > 0 && (
                <span style={{ fontSize: '10px', padding: '1px 6px', borderRadius: '20px', background: active ? 'var(--foret)' : '#EDE8DC', color: active ? 'white' : 'var(--foret)', fontWeight: 700 }}>{count}</span>
              )}
            </button>
          )
        })}
      </div>

      {/* CONTENU */}
      <div key={activeTab} className="tab-panel" style={{ padding: '14px 12px' }}>
        {activeTab === 'restaurants' && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '17px', fontWeight: 900, color: 'var(--nuit)' }}>Restaurants halal</p>
              <span style={{ fontSize: '12px', color: 'var(--texte-2)' }}>{restaurants.length} établissements</span>
            </div>
            <div style={{ display: 'flex', gap: '7px', overflowX: 'auto', scrollbarWidth: 'none', marginBottom: '14px', paddingBottom: '2px' }}>
              {categories.slice(0, 8).map((cat) => (
                <button key={cat} onClick={() => setActiveFilter(cat)} style={{ padding: '8px 15px', borderRadius: '30px', border: '1px solid rgba(27,67,50,0.3)', background: activeFilter === cat ? 'var(--foret)' : 'white', color: activeFilter === cat ? 'white' : 'var(--foret)', fontSize: '12.5px', fontWeight: 600, flexShrink: 0, cursor: 'pointer', transform: activeFilter === cat ? 'scale(1.05)' : 'scale(1)', transition: 'all 0.15s cubic-bezier(0.34,1.56,0.64,1)' }}>{cat}</button>
              ))}
            </div>
            {restosFiltres.map((r: any, i: number) => (
              <div key={i} className="card-halal" style={{ ...card, display: 'flex', gap: '12px' }}>
                <div style={{ width: 56, height: 56, borderRadius: '13px', background: 'var(--nuit)', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', position: 'relative', overflow: 'hidden' }}>
                  <IslamicPattern opacity={0.12} />
                  <span style={{ position: 'relative', zIndex: 1 }}>{CATEGORY_EMOJI[r.type] ?? '🍽'}</span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: '14px', color: 'var(--texte)', marginBottom: '2px' }}>{r.nom}</p>
                  <p style={{ fontSize: '12px', color: 'var(--texte-2)', marginBottom: '5px' }}>{r.type}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '7px', marginBottom: '9px', flexWrap: 'wrap' }}>
                    <span style={{ background: 'var(--halal-bg)', color: 'var(--halal-tx)', fontSize: '11px', fontWeight: 700, borderRadius: '20px', padding: '3px 9px' }}>✓ Halal</span>
                    <span style={{ fontSize: '12px', color: 'var(--or)', fontWeight: 700 }}>★ {r.score ?? r.note}</span>
                    <span style={{ fontSize: '11px', color: 'var(--texte-2)' }}>{r.priceRange ?? r.fourchette_prix}</span>
                  </div>
                  <div style={{ display: 'flex', gap: '7px' }}>
                    <a href={r.mapsUrl} target="_blank" rel="noopener noreferrer" onClick={() => toast('Ouverture dans Google Maps…', 'success')} style={{ flex: 1, padding: '11px', background: 'var(--halal-bg)', color: 'var(--halal-tx)', borderRadius: '11px', textAlign: 'center', fontSize: '12.5px', fontWeight: 700, textDecoration: 'none' }}>🗺 Maps</a>
                    {r.specialite && (
                      <button onClick={() => toast(`⭐ ${r.specialite}`, 'success')} style={{ flex: 1, padding: '11px', background: 'var(--foret)', color: 'var(--creme)', border: 'none', borderRadius: '11px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}>⭐ Spécialité</button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'mosquees' && (
          <div>
            <a href="/mosquee-proche" style={{ display: 'block', padding: '16px', marginBottom: '16px', background: 'var(--foret)', color: 'var(--creme)', borderRadius: '15px', textAlign: 'center', fontSize: '14.5px', fontWeight: 700, textDecoration: 'none', animation: 'breathe 2.6s ease-in-out infinite' }}>🕌 Trouver la mosquée la plus proche de moi</a>
            <p style={{ fontSize: '11px', color: 'var(--texte-2)', letterSpacing: '1.5px', textTransform: 'uppercase', fontWeight: 600, marginBottom: '10px' }}>Mosquées notables</p>
            {mosquees.map((m: any, i: number) => (
              <div key={i} style={card}>
                <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: '15px', color: 'var(--nuit)', marginBottom: '4px' }}>🕌 {m.nom}</p>
                <p style={{ fontSize: '13px', color: 'var(--texte-2)', lineHeight: 1.6, marginBottom: '8px' }}>{m.description}</p>
                {(m.capacite || m.horaires) && (
                  <p style={{ fontSize: '11px', color: 'var(--texte-2)', marginBottom: '10px' }}>
                    {m.capacite ? `👥 ${Number(m.capacite).toLocaleString('fr-FR')} fidèles` : ''}{m.capacite && m.horaires ? ' · ' : ''}{m.horaires ? `🕐 ${m.horaires}` : ''}
                  </p>
                )}
                <a href={m.mapsUrl} target="_blank" rel="noopener noreferrer" onClick={() => toast('Ouverture dans Google Maps…', 'success')} style={{ display: 'inline-block', padding: '9px 16px', background: 'var(--halal-bg)', color: 'var(--halal-tx)', borderRadius: '10px', fontSize: '12.5px', fontWeight: 700, textDecoration: 'none' }}>🗺 Voir sur la carte →</a>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'hotels' && (
          <div>
            {hotels.map((h: any, i: number) => (
              <div key={i} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '5px' }}>
                  <div>
                    <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: '15px', color: 'var(--texte)' }}>{h.nom}</p>
                    <p style={{ fontSize: '12px', color: 'var(--texte-2)', marginTop: '2px' }}>{h.categorie} · {h.priceRange}</p>
                  </div>
                  <span style={{ fontSize: '16px', fontWeight: 700, color: 'var(--or)', flexShrink: 0 }}>★ {h.score ?? h.note}</span>
                </div>
                {h.description && <p style={{ fontSize: '12.5px', color: 'var(--texte-2)', lineHeight: 1.6, marginBottom: '10px' }}>{h.description}</p>}
                <div style={{ display: 'flex', gap: '7px', flexWrap: 'wrap', marginBottom: '11px' }}>
                  {(h.halalFriendly ?? h.halal_certifie) && <span style={{ background: 'var(--halal-bg)', color: 'var(--halal-tx)', fontSize: '11px', fontWeight: 700, borderRadius: '20px', padding: '3px 9px' }}>✓ Halal-friendly</span>}
                  {(h.sansAlcool ?? h.sans_alcool) && <span style={{ background: 'rgba(201,168,76,0.18)', color: '#8A6D1E', fontSize: '11px', fontWeight: 700, borderRadius: '20px', padding: '3px 9px' }}>🚫 Sans alcool</span>}
                  {h.salleDePreiere && <span style={{ background: 'var(--halal-bg)', color: 'var(--halal-tx)', fontSize: '11px', fontWeight: 700, borderRadius: '20px', padding: '3px 9px' }}>🕌 Salle de prière</span>}
                </div>
                <div style={{ display: 'flex', gap: '7px' }}>
                  <a href={h.bookingUrl} target="_blank" rel="noopener noreferrer" onClick={() => toast('Ouverture de Booking.com…', 'success')} style={{ flex: 1, padding: '12px', background: 'var(--booking)', color: 'white', borderRadius: '13px', textAlign: 'center', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>📖 Booking.com</a>
                  {h.halalBookingUrl && <a href={h.halalBookingUrl} target="_blank" rel="noopener noreferrer" style={{ flex: 1, padding: '12px', background: 'var(--foret)', color: 'var(--creme)', borderRadius: '13px', textAlign: 'center', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>🕌 HalalBooking</a>}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'activites' && (
          <div>
            {activites.map((a: any, i: number) => (
              <div key={i} style={card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: '14px', color: 'var(--texte)', flex: 1 }}>{a.nom}</p>
                  <span style={{ background: 'rgba(27,67,50,0.08)', color: 'var(--foret)', fontSize: '11px', fontWeight: 600, borderRadius: '20px', padding: '3px 9px', flexShrink: 0, marginLeft: '8px' }}>{a.prix}</span>
                </div>
                <span style={{ display: 'inline-block', fontSize: '11px', color: 'var(--texte-2)', marginBottom: '5px' }}>{a.categorie} · {a.duree}</span>
                <p style={{ fontSize: '12.5px', color: 'var(--texte-2)', lineHeight: 1.6, marginBottom: '10px' }}>{a.description}</p>
                <a href={a.mapsUrl} target="_blank" rel="noopener noreferrer" onClick={() => toast('Ouverture dans Google Maps…', 'success')} style={{ display: 'inline-block', padding: '9px 16px', background: 'var(--halal-bg)', color: 'var(--halal-tx)', borderRadius: '10px', fontSize: '12.5px', fontWeight: 700, textDecoration: 'none' }}>🗺 Maps →</a>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'pratique' && (
          <div>
            {pratiqueItems.map((item, i) => (
              <div key={i} style={{ ...card, padding: '14px 16px', display: 'flex', gap: '12px', alignItems: 'center' }}>
                <span style={{ fontSize: '22px', flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <p style={{ fontSize: '11px', color: 'var(--texte-2)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', margin: '0 0 2px' }}>{item.label}</p>
                  <p style={{ fontSize: '14px', color: 'var(--texte)', fontWeight: 600, margin: 0 }}>{item.value as string}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  )
}
