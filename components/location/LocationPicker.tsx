'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import IslamicPattern from '@/components/ui/IslamicPattern'
import { useLocation } from '@/components/location/LocationProvider'
import cityCoords from '@/lib/cityCoords.json'

type C = { slug: string; nom: string; pays?: string }
const ALL = (cityCoords as C[]).slice().sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
const POPULAR = ['istanbul', 'medine', 'la-mecque', 'dubai', 'marrakech', 'le-caire', 'kuala-lumpur', 'paris']

// Écran 1 — Location picker (affiché tant qu'aucune ville n'est mémorisée)
export default function LocationPicker() {
  const { setCity, geolocate, geoStatus } = useLocation()
  const router = useRouter()
  const [showList, setShowList] = useState(false)
  const [q, setQ] = useState('')

  const popularCities = POPULAR.map((s) => ALL.find((c) => c.slug === s)).filter(Boolean) as C[]
  const filtered = q ? ALL.filter((c) => c.nom.toLowerCase().includes(q.toLowerCase()) || (c.pays || '').toLowerCase().includes(q.toLowerCase())) : ALL

  const choose = (c: C) => { setCity(c as any); router.refresh() } // eslint-disable-line @typescript-eslint/no-explicit-any

  return (
    <div className="lg:hidden" style={{ minHeight: '100vh', background: '#fdfaf3', paddingBottom: '90px' }}>
      {/* Hero */}
      <section style={{ position: 'relative', overflow: 'hidden', background: '#0b1a0f', padding: '40px 22px 34px', textAlign: 'center' }}>
        <IslamicPattern opacity={0.08} />
        <div style={{ position: 'relative', zIndex: 1 }}>
          <p style={{ display: 'inline-flex', alignItems: 'center', gap: '7px', color: '#fff', fontWeight: 700, fontSize: '17px', marginBottom: '20px' }}>
            <span style={{ color: '#c9a84c' }}>✦</span> VoyagesHalal
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: '30px', color: '#fff', lineHeight: 1.15 }}>
            Où voyagez-<span style={{ color: '#c9a84c', fontStyle: 'italic' }}>vous</span> ?
          </h1>
          <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '15px', marginTop: '10px' }}>Choisissez votre ville une fois — tout sera prêt.</p>
        </div>
      </section>

      {/* Carte choix */}
      <section style={{ padding: '20px 18px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Bouton 1 — Ma position (72px) */}
        <button onClick={() => geolocate()} style={{ height: '72px', background: 'var(--foret)', color: '#fff', border: 'none', borderRadius: '18px', fontSize: '17px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px', boxShadow: '0 8px 22px rgba(27,67,50,0.25)' }}>
          <span style={{ fontSize: '24px' }}>📍</span>
          {geoStatus === 'loading' ? 'Localisation…' : 'Localise-moi'}
        </button>
        {geoStatus === 'error' && <p style={{ fontSize: '13px', color: '#8A6D1E', textAlign: 'center', margin: '-4px 0 0' }}>Position indisponible — choisissez une ville ci-dessous.</p>}

        {/* Bouton 2 — Choisir une ville (72px) */}
        <button onClick={() => setShowList((s) => !s)} style={{ height: '72px', background: '#fff', color: 'var(--foret)', border: '2px solid var(--foret)', borderRadius: '18px', fontSize: '17px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '10px' }}>
          <span style={{ fontSize: '24px' }}>🌍</span>
          Choisir une ville
        </button>

        {showList ? (
          <div style={{ marginTop: '4px' }}>
            <input autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Rechercher une ville…" style={{ width: '100%', padding: '15px 16px', borderRadius: '14px', border: '1.5px solid rgba(27,67,50,0.25)', fontSize: '16px', outline: 'none', marginBottom: '10px' }} />
            <div style={{ background: '#fff', borderRadius: '16px', overflow: 'hidden', border: '1px solid rgba(11,26,15,0.06)' }}>
              {filtered.map((c) => (
                <button key={c.slug} onClick={() => choose(c)} style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '15px 16px', border: 'none', borderBottom: '1px solid rgba(11,26,15,0.05)', background: 'transparent', cursor: 'pointer', fontSize: '16px', textAlign: 'left', minHeight: 52 }}>
                  <span style={{ fontWeight: 600, color: 'var(--nuit)' }}>{c.nom}</span>
                  <span style={{ color: 'var(--texte-2)', fontSize: '13px' }}>{c.pays}</span>
                </button>
              ))}
            </div>
          </div>
        ) : (
          <>
            <p style={{ fontSize: '11px', fontWeight: 700, letterSpacing: '1.5px', textTransform: 'uppercase', color: '#9ca3af', marginTop: '10px' }}>Villes populaires</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
              {popularCities.map((c) => (
                <button key={c.slug} onClick={() => choose(c)} style={{ minHeight: '44px', padding: '10px 18px', background: '#fff', border: '1px solid rgba(27,67,50,0.25)', borderRadius: '30px', fontSize: '15px', fontWeight: 600, color: 'var(--foret)', cursor: 'pointer' }}>
                  {c.nom}
                </button>
              ))}
            </div>
          </>
        )}
      </section>
    </div>
  )
}
