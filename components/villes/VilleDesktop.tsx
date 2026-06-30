'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import IslamicPattern from '@/components/ui/IslamicPattern'
import { useToast } from '@/components/Toast'
import EbookButton from '@/components/villes/EbookButton'
import LiveSpots from '@/components/villes/LiveSpots'

const TABS = [
  { id: 'mosquees', icon: '🕌', label: 'Mosquées' },
  { id: 'restaurants', icon: '🍽', label: 'Restaurants' },
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

export default function VilleDesktop({ ville }: { ville: any }) {
  const [activeTab, setActiveTab] = useState<string | null>(null) // null = aucun onglet allumé au départ
  const displayTab = activeTab ?? 'restaurants' // contenu affiché par défaut (sans orange)
  const [activeFilter, setActiveFilter] = useState('Tous')
  const toast = useToast()
  const router = useRouter()
  const contentRef = useRef<HTMLDivElement>(null)

  // Clic sur un onglet → Mosquées renvoie vers le chercheur de mosquée proche ;
  // les autres changent l'onglet et descendent vers le contenu.
  const goToTab = (id: string) => {
    if (id === 'mosquees') { router.push('/mosquee-proche'); return }
    setActiveTab(id)
    setTimeout(() => contentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 60)
  }

  const image = ville.image || ville.image_hero
  const halalScore = ville.halalScore ?? (ville.score_halal ? Math.round(ville.score_halal * 2 * 10) / 10 : null)
  const restaurants = ville.restaurants ?? []
  const mosquees = ville.mosqueesPrincipales ?? []
  const hotels = ville.hotels ?? []
  const activites = ville.activites ?? []
  const coords = ville.coordonnees ?? null
  const hasCoords = coords && typeof coords.lat === 'number' && typeof coords.lng === 'number'
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
      <section style={{ position: 'relative', height: 'clamp(170px, 26vw, 230px)', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }}>
        {image && <Image src={image} alt={`Guide voyage halal ${ville.nom}`} fill priority sizes="100vw" style={{ objectFit: 'cover', opacity: 0.5 }} />}
        <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, rgba(11,26,15,0.55) 0%, rgba(11,26,15,0.82) 100%)' }} />
        <IslamicPattern opacity={0.05} />
        <div style={{ position: 'relative', maxWidth: WRAP, padding: '0 24px' }}>
          <p style={{ color: 'var(--or)', fontSize: '12px', fontWeight: 700, letterSpacing: '2.5px', textTransform: 'uppercase', marginBottom: '12px' }}>{ville.pays}{ville.region ? ` · ${ville.region}` : ''}</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: '#fff', lineHeight: 1.02, margin: 0 }}>
            <span style={{ fontSize: 'clamp(14px, 4vw, 18px)', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Guide Halal </span>
            <span style={{ fontSize: 'clamp(38px, 11vw, 56px)', fontWeight: 900 }}>{ville.nom}</span>
            <span style={{ fontSize: 'clamp(16px, 5vw, 22px)', fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}> 2026</span>
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
                  <span className="vt-ico">{tab.icon}</span>{tab.label}
                  {count > 0 && <span className="vt-count">{count}</span>}
                </button>
              )
            })}
          </div>

          {/* Guide PDF gratuit (aimant à emails, doré) + Vols */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginTop: '10px' }}>
            <EbookButton ville={ville} />
            <a href={`https://www.skyscanner.fr/vols-vers/${ville.slug ?? ville.nom}`} target="_blank" rel="noopener noreferrer" className="ville-action">
              <span className="ico">✈️</span>Vols vers {ville.nom}
            </a>
          </div>
        </div>
      </div>

      {/* PARTIE BAS (claire) — contenu de l'onglet sélectionné */}
      <div ref={contentRef} style={{ maxWidth: WRAP, margin: '0 auto', padding: '28px 24px 80px', scrollMarginTop: '12px' }}>
        {displayTab === 'restaurants' && (
          <>
            {restaurants.length > 0 && (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '16px' }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '26px', fontWeight: 900, color: 'var(--nuit)' }}>Restaurants halal</h2>
              <span style={{ fontSize: '13px', color: 'var(--texte-2)' }}>{restosFiltres.length} adresses{ville.osmEnriched ? '' : ' vérifiées'}</span>
            </div>
            )}
            {/* filtres catégories en pills */}
            {restaurants.length > 0 && (
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
            )}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
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
                      {r.halalConfidence === 'likely'
                        ? <span style={{ background: 'rgba(201,168,76,0.18)', color: '#8A6D1E', fontSize: '11px', fontWeight: 700, borderRadius: '20px', padding: '3px 10px' }}>≈ Halal courant · à vérifier</span>
                        : <span style={{ background: 'var(--halal-bg)', color: 'var(--halal-tx)', fontSize: '11px', fontWeight: 700, borderRadius: '20px', padding: '3px 10px' }}>✓ Halal</span>}
                      {(r.score ?? r.note) != null && <span style={{ fontSize: '13px', color: '#B8860B', fontWeight: 700 }}>★ {r.score ?? r.note}</span>}
                      {(r.priceRange ?? r.fourchette_prix) && <span style={{ fontSize: '12px', color: 'var(--texte-2)' }}>{r.priceRange ?? r.fourchette_prix}</span>}
                    </div>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <a href={r.mapsUrl} target="_blank" rel="noopener noreferrer" onClick={() => toast('Ouverture dans Google Maps…', 'success')} style={{ flex: 1, padding: '11px 0', background: 'var(--halal-bg)', color: 'var(--halal-tx)', borderRadius: '12px', textAlign: 'center', fontSize: '13px', fontWeight: 700, textDecoration: 'none' }}>🗺 Maps</a>
                      {r.specialite && <button onClick={() => toast(`⭐ ${r.specialite}`, 'success')} style={{ flex: 1, padding: '11px 0', background: 'var(--foret)', color: 'var(--creme)', border: 'none', borderRadius: '12px', fontSize: '13px', fontWeight: 700, cursor: 'pointer' }}>⭐ Spécialité</button>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
            {restaurants.length === 0 && (
              hasCoords ? (
                <LiveSpots kind="restaurants" lat={coords.lat} lng={coords.lng} ville={ville.nom} />
              ) : (
                <div style={{ ...card, textAlign: 'center', padding: '40px 22px' }}>
                  <div style={{ fontSize: 34, marginBottom: 10 }}>🍽️</div>
                  <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: 'var(--nuit)', fontSize: 18, margin: '0 0 6px' }}>Restaurants en cours d’ajout</p>
                  <p style={{ color: 'var(--texte-2)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>Nous ajoutons les adresses halal vérifiées de {ville.nom}. 🤲</p>
                </div>
              )
            )}
          </>
        )}

        {displayTab === 'hotels' && (hotels.length === 0 ? (
          <div style={{ ...card, textAlign: 'center', padding: '40px 22px' }}>
            <div style={{ fontSize: 34, marginBottom: 10 }}>🏨</div>
            <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700, color: 'var(--nuit)', fontSize: 18, margin: '0 0 6px' }}>Hôtels en cours d’ajout</p>
            <p style={{ color: 'var(--texte-2)', fontSize: 14, lineHeight: 1.6, margin: 0 }}>Les hébergements halal-friendly de {ville.nom} arrivent bientôt.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '20px' }}>
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
        ))}

        {displayTab === 'mosquees' && mosquees.length === 0 && hasCoords && (
          <LiveSpots kind="mosquees" lat={coords.lat} lng={coords.lng} ville={ville.nom} />
        )}
        {displayTab === 'mosquees' && mosquees.length > 0 && (
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
