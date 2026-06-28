'use client'
import { useState } from 'react'
import type { VilleRestaurant, VilleHotel, VilleActivite } from '@/lib/villeTypes'

type Kind = 'resto' | 'hotel' | 'activite'

const RESTAURANT_ICONS: Record<string, string> = {
  'Traditionnel local': '🥘',
  'Libanais & Levant': '🫓',
  'Indien & Pakistani': '🍛',
  'Pizza & Italien': '🍕',
  'Japonais & Asiatique': '🍜',
  'Burgers & Fast-food': '🍔',
  Gastronomique: '⭐',
  'Végétarien & Healthy': '🥗',
  'Pâtisserie & Café': '☕',
}
const HOTEL_ICONS: Record<string, string> = {
  Luxe: '👑',
  Standard: '🏨',
  'Riad & Boutique': '🏡',
  Budget: '💰',
  'Resort & Spa': '🌊',
}
const ACTIVITY_ICONS: Record<string, string> = {
  'Religieux & Spirituel': '🕌',
  'Histoire & Culture': '🏛️',
  'Shopping & Souks': '🛍️',
  Gastronomie: '🍽️',
  'Nature & Plein air': '🌿',
  Famille: '👨‍👩‍👧',
  'Hammam & Bien-être': '♨️',
}

const GREEN = '#1b4332'
const GOLD = '#c9a84c'

function mapsLink(nom: string, ville: string, explicit?: string) {
  return explicit || `https://maps.google.com/?q=${encodeURIComponent(`${nom} ${ville}`)}`
}

const btnFilled: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 1rem',
  borderRadius: '20px', background: GREEN, color: '#fff', fontSize: '13px', fontWeight: 600, textDecoration: 'none',
}
const btnOutline: React.CSSProperties = {
  display: 'inline-flex', alignItems: 'center', gap: '0.35rem', padding: '0.45rem 1rem',
  borderRadius: '20px', border: `1px solid ${GREEN}`, color: GREEN, fontSize: '13px', fontWeight: 600,
  textDecoration: 'none', background: 'transparent',
}

function CardShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-[#1b4332]/10 hover:shadow-md transition-shadow mb-4">
      {children}
    </div>
  )
}

function RestaurantCard({ r, ville }: { r: VilleRestaurant; ville: string }) {
  return (
    <CardShell>
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="text-[1.1rem] font-bold text-[#1a1a1a]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{r.nom}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {(r.certificationHalal ?? r.halal_certifie) && (
              <span className="text-[11px] font-semibold text-[#1b4332] bg-[#1b4332]/[0.08] px-2 py-0.5 rounded-full">✓ Halal certifié</span>
            )}
            {(r.priceRange ?? r.fourchette_prix) && <span className="text-xs text-gray-500">{r.priceRange ?? r.fourchette_prix}</span>}
          </div>
        </div>
        {(r.score ?? r.note) != null && (
          <span className="font-bold text-[1.1rem]" style={{ fontFamily: "'Playfair Display', serif", color: GOLD }}>★{r.score ?? r.note}</span>
        )}
      </div>
      {r.adresse && <p className="text-[13px] text-gray-500 my-1">📍 {r.adresse}</p>}
      {(r.description || r.specialite) && <p className="text-sm text-[#1a1a1a] leading-relaxed my-3">{r.description || r.specialite}</p>}
      <div className="flex gap-2 flex-wrap mt-3">
        <a href={mapsLink(r.nom, ville, r.mapsUrl)} target="_blank" rel="noopener noreferrer" style={btnFilled}>🗺️ Google Maps</a>
        {r.websiteUrl && <a href={r.websiteUrl} target="_blank" rel="noopener noreferrer" style={btnOutline}>🌐 Site web</a>}
      </div>
    </CardShell>
  )
}

function HotelCard({ h, ville }: { h: VilleHotel; ville: string }) {
  const booking = h.bookingUrl || `https://www.booking.com/searchresults.fr.html?ss=${encodeURIComponent(ville)}&label=voyageshalal`
  return (
    <CardShell>
      <div className="flex items-start justify-between mb-1">
        <div>
          <h3 className="text-[1.1rem] font-bold text-[#1a1a1a]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{h.nom}</h3>
          <div className="flex items-center gap-2 mt-1 flex-wrap">
            {(h.sansAlcool ?? h.sans_alcool) && <span className="text-[11px] font-semibold text-[#1b4332] bg-[#1b4332]/[0.08] px-2 py-0.5 rounded-full">🚫 Sans alcool</span>}
            {(h.halalFriendly ?? h.halal_certifie) && <span className="text-[11px] font-semibold text-[#c9a84c] bg-[#c9a84c]/10 px-2 py-0.5 rounded-full">✓ Halal-friendly</span>}
            {h.priceRange && <span className="text-xs text-gray-500">{h.priceRange}</span>}
          </div>
        </div>
        {(h.score ?? h.note) != null && (
          <span className="font-bold text-[1.1rem]" style={{ fontFamily: "'Playfair Display', serif", color: GOLD }}>★{h.score ?? h.note}</span>
        )}
      </div>
      {h.adresse && <p className="text-[13px] text-gray-500 my-1">📍 {h.adresse}</p>}
      {h.description && <p className="text-sm text-[#1a1a1a] leading-relaxed my-3">{h.description}</p>}
      <div className="flex gap-2 flex-wrap mt-3">
        <a href={booking} target="_blank" rel="noopener noreferrer" style={{ ...btnFilled, background: '#003580' }}>🏨 Réserver sur Booking</a>
        {h.halalBookingUrl && <a href={h.halalBookingUrl} target="_blank" rel="noopener noreferrer" style={btnFilled}>✓ HalalBooking</a>}
        <a href={mapsLink(h.nom, ville, h.mapsUrl)} target="_blank" rel="noopener noreferrer" style={btnOutline}>🗺️ Localiser</a>
      </div>
    </CardShell>
  )
}

function ActivityCard({ a, ville }: { a: VilleActivite; ville: string }) {
  return (
    <CardShell>
      <div className="flex items-start justify-between gap-3">
        <h3 className="text-[1.1rem] font-bold text-[#1a1a1a]" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>{a.nom}</h3>
        <div className="flex gap-2 text-xs text-gray-500 shrink-0">
          {a.duree && <span>⏱ {a.duree}</span>}
          {a.prix && <span className="font-semibold" style={{ color: a.prix === 'Gratuit' ? GREEN : '#6B7280' }}>{a.prix}</span>}
        </div>
      </div>
      {a.description && <p className="text-sm text-[#1a1a1a] leading-relaxed my-3">{a.description}</p>}
      <div className="flex gap-2 flex-wrap">
        <a href={mapsLink(a.nom, ville, a.mapsUrl)} target="_blank" rel="noopener noreferrer" style={btnFilled}>🗺️ Voir sur Google Maps</a>
        {a.tripadvisorUrl && <a href={a.tripadvisorUrl} target="_blank" rel="noopener noreferrer" style={{ ...btnOutline, borderColor: '#34E0A1', color: '#00AA6C' }}>⭐ TripAdvisor</a>}
      </div>
    </CardShell>
  )
}

function CategorySection({ icon, label, count, children }: { icon: string; label: string; count: number; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-4 pb-3" style={{ borderBottom: `2px solid ${GOLD}4D` }}>
        <span className="text-xl">{icon}</span>
        <h4 className="font-bold text-base uppercase tracking-wider m-0" style={{ fontFamily: "'Playfair Display', serif", color: GREEN }}>{label}</h4>
        <span className="text-xs text-gray-500 bg-[#1b4332]/[0.06] px-2 py-0.5 rounded-full">{count}</span>
      </div>
      {children}
    </div>
  )
}

interface Props {
  kind: Kind
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  items: any[]
  ville: string
}

export default function CategorizedDirectory({ kind, items, ville }: Props) {
  const keyField = kind === 'resto' ? 'type' : 'categorie'
  const icons = kind === 'resto' ? RESTAURANT_ICONS : kind === 'hotel' ? HOTEL_ICONS : ACTIVITY_ICONS
  const fallback = kind === 'resto' ? 'Traditionnel local' : kind === 'hotel' ? 'Standard' : 'Histoire & Culture'

  const groups: Record<string, typeof items> = {}
  for (const it of items) {
    const cat = it[keyField] || fallback
    ;(groups[cat] ??= []).push(it)
  }
  const categories = Object.keys(groups).sort()

  const [active, setActive] = useState('tous')
  const visible = active === 'tous' ? categories : categories.filter((c) => c === active)

  return (
    <div>
      {/* Filtres pills */}
      <div className="flex gap-2 flex-wrap py-4 mb-2" style={{ borderBottom: `1px solid ${GREEN}1A` }}>
        <FilterPill label="Tous" act={active === 'tous'} onClick={() => setActive('tous')} />
        {categories.map((c) => (
          <FilterPill key={c} label={`${icons[c] ?? ''} ${c}`} act={active === c} onClick={() => setActive(c)} />
        ))}
      </div>

      {visible.map((cat) => (
        <CategorySection key={cat} icon={icons[cat] ?? '•'} label={cat} count={groups[cat].length}>
          {groups[cat].map((it, i) =>
            kind === 'resto' ? (
              <RestaurantCard key={it.id ?? i} r={it} ville={ville} />
            ) : kind === 'hotel' ? (
              <HotelCard key={it.id ?? i} h={it} ville={ville} />
            ) : (
              <ActivityCard key={it.id ?? i} a={it} ville={ville} />
            )
          )}
        </CategorySection>
      ))}
    </div>
  )
}

function FilterPill({ label, act, onClick }: { label: string; act: boolean; onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="px-4 py-1.5 rounded-full text-[13px] font-semibold transition-colors"
      style={act ? { background: GREEN, color: '#fff' } : { background: 'rgba(27,67,50,0.06)', color: GREEN }}
    >
      {label}
    </button>
  )
}
