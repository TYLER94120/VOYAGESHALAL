'use client'
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useLocation } from '@/components/location/LocationProvider'
import cityCoords from '@/lib/cityCoords.json'

const ALL = (cityCoords as { slug: string; nom: string; pays?: string }[]).slice().sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))

// Barre « 📍 Ville · Changer » — affichée en haut des écrans app (mobile)
export default function LocationBar({ dark = true }: { dark?: boolean }) {
  const { city, setCity, geolocate, geoStatus } = useLocation()
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [q, setQ] = useState('')

  const filtered = q ? ALL.filter((c) => c.nom.toLowerCase().includes(q.toLowerCase()) || (c.pays || '').toLowerCase().includes(q.toLowerCase())) : ALL

  return (
    <>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px' }}>
        <span style={{ display: 'flex', alignItems: 'center', gap: '6px', color: dark ? 'var(--nuit)' : '#fff', fontSize: '15px', fontWeight: 700 }}>
          <span>📍</span> {city ? city.nom : 'Choisir une ville'}
        </span>
        <button onClick={() => setOpen(true)} style={{ display: 'flex', alignItems: 'center', gap: '5px', background: 'rgba(201,168,76,0.16)', border: '1px solid rgba(201,168,76,0.4)', color: 'var(--or)', borderRadius: '20px', padding: '6px 14px', fontSize: '12.5px', fontWeight: 700, cursor: 'pointer' }}>
          ⇄ Changer
        </button>
      </div>

      {open && (
        <div onClick={() => setOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(11,26,15,0.6)', zIndex: 300, display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>
          <div onClick={(e) => e.stopPropagation()} style={{ background: 'var(--creme)', width: '100%', maxWidth: 520, maxHeight: '80vh', borderRadius: '22px 22px 0 0', padding: '18px 16px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ width: 40, height: 4, background: '#d6cdba', borderRadius: 4, margin: '0 auto 14px' }} />
            <button onClick={async () => { const c = await geolocate(); if (c) setOpen(false) }} style={{ width: '100%', minHeight: 56, background: 'var(--foret)', color: '#fff', border: 'none', borderRadius: '14px', fontSize: '16px', fontWeight: 700, cursor: 'pointer', marginBottom: '12px' }}>
              {geoStatus === 'loading' ? '📍 Localisation…' : '📍 Utiliser ma position'}
            </button>
            {geoStatus === 'error' && <p style={{ fontSize: '12px', color: '#8A6D1E', marginBottom: '8px', textAlign: 'center' }}>Position indisponible — choisis une ville ci-dessous.</p>}
            <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="🔍 Rechercher une ville…" style={{ width: '100%', padding: '13px 16px', borderRadius: '12px', border: '1.5px solid rgba(27,67,50,0.25)', fontSize: '16px', marginBottom: '12px', outline: 'none' }} />
            <div style={{ overflowY: 'auto', flex: 1 }}>
              {filtered.map((c) => (
                <button key={c.slug} onClick={() => { setCity(c); setOpen(false); router.push(`/destinations/${c.slug}`) }} style={{ display: 'flex', justifyContent: 'space-between', width: '100%', padding: '13px 14px', border: 'none', borderBottom: '1px solid rgba(11,26,15,0.06)', background: city?.slug === c.slug ? 'rgba(27,67,50,0.08)' : 'transparent', cursor: 'pointer', fontSize: '15px', textAlign: 'left', minHeight: 48 }}>
                  <span style={{ fontWeight: 600, color: 'var(--nuit)' }}>{c.nom}</span>
                  <span style={{ color: 'var(--texte-2)', fontSize: '13px' }}>{c.pays}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  )
}
