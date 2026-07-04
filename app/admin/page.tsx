'use client'
import { useState, useEffect, useCallback, type FormEvent } from 'react'

// Écran admin Phase 1 (propriétaire uniquement). Le token est saisi une fois et
// gardé en localStorage. Deux onglets : Leads (preuve de stockage) + Spots (seed).
// Aucune donnée publique ; tout passe par les routes /api/admin/* protégées.

const LIEUX = [
  ['centre_commercial', '🛍️ Centre commercial'], ['restaurant', '🍽️ Restaurant'],
  ['aeroport', '✈️ Aéroport'], ['gare', '🚉 Gare'], ['hotel', '🏨 Hôtel'],
  ['parc', '🌳 Parc'], ['universite', '🎓 Université'], ['bureau', '🏢 Bureau/public'], ['autre', '📍 Autre'],
]

interface Lead { email: string; source?: string; city?: string; date?: string }
interface Spot { id: string; nom: string; villeNom: string; typeLieu: string; slug: string; villeSlug: string }

export default function AdminPage() {
  const [token, setToken] = useState('')
  const [ready, setReady] = useState(false)
  const [tab, setTab] = useState<'leads' | 'spots'>('leads')

  useEffect(() => {
    const saved = localStorage.getItem('vh_admin_token')
    if (saved) { setToken(saved); setReady(true) }
  }, [])

  const enter = (e: FormEvent) => { e.preventDefault(); if (token) { localStorage.setItem('vh_admin_token', token); setReady(true) } }
  const logout = () => { localStorage.removeItem('vh_admin_token'); setReady(false); setToken('') }

  if (!ready) {
    return (
      <main style={{ maxWidth: 380, margin: '80px auto', padding: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800 }}>Admin VoyagesHalal</h1>
        <form onSubmit={enter} style={{ marginTop: 16, display: 'grid', gap: 10 }}>
          <input type="password" placeholder="ADMIN_TOKEN" value={token} onChange={(e) => setToken(e.target.value)}
            className="lead-input" style={{ width: '100%' }} />
          <button className="lead-btn" type="submit">Entrer</button>
        </form>
      </main>
    )
  }

  return (
    <main style={{ maxWidth: 720, margin: '32px auto', padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, margin: 0 }}>Admin</h1>
        <button onClick={logout} style={{ fontSize: 13, background: 'none', border: '1px solid #ccc', borderRadius: 8, padding: '6px 12px', cursor: 'pointer' }}>Déconnexion</button>
      </div>
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button onClick={() => setTab('leads')} className="lead-btn" style={{ background: tab === 'leads' ? 'var(--or)' : '#eee', color: tab === 'leads' ? 'var(--nuit)' : '#555' }}>📧 Leads</button>
        <button onClick={() => setTab('spots')} className="lead-btn" style={{ background: tab === 'spots' ? '#6b46c1' : '#eee', color: tab === 'spots' ? '#fff' : '#555' }}>🧭 Spots prière</button>
      </div>
      {tab === 'leads' ? <LeadsTab token={token} /> : <SpotsTab token={token} />}
    </main>
  )
}

function LeadsTab({ token }: { token: string }) {
  const [leads, setLeads] = useState<Lead[] | null>(null)
  const [count, setCount] = useState(0)
  const [err, setErr] = useState('')

  useEffect(() => {
    fetch(`/api/admin/leads?token=${encodeURIComponent(token)}`)
      .then((r) => r.json())
      .then((j) => { if (j.error && !j.leads) setErr(j.error); setLeads(j.leads || []); setCount(j.count || 0) })
      .catch(() => setErr('Erreur réseau'))
  }, [token])

  if (err) return <p style={{ color: '#c0392b' }}>{err}</p>
  if (!leads) return <p>Chargement…</p>
  return (
    <div>
      <p style={{ fontWeight: 700, marginBottom: 12 }}>{count} email(s) capturé(s) ✅</p>
      {leads.length === 0 && <p style={{ opacity: 0.7 }}>Aucun email pour l&apos;instant. Fais un test d&apos;inscription sur le site, il apparaîtra ici.</p>}
      <div style={{ display: 'grid', gap: 6 }}>
        {leads.map((l, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', gap: 10, padding: '8px 12px', borderRadius: 8, background: '#f6f6f4', fontSize: 14 }}>
            <span style={{ fontWeight: 600 }}>{l.email}</span>
            <span style={{ opacity: 0.6, fontSize: 12 }}>{l.source || '—'}{l.city ? ` · ${l.city}` : ''}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

function SpotsTab({ token }: { token: string }) {
  const [spots, setSpots] = useState<Spot[]>([])
  const [form, setForm] = useState({ nom: '', typeLieu: 'centre_commercial', lat: '', lng: '', villeSlug: '', adresse: '', description: '', photo: '' })
  const [msg, setMsg] = useState('')
  const [busy, setBusy] = useState(false)

  const load = useCallback(() => {
    fetch(`/api/admin/spots?token=${encodeURIComponent(token)}`)
      .then((r) => r.json()).then((j) => setSpots(j.spots || [])).catch(() => {})
  }, [token])
  useEffect(load, [load])

  const useGps = () => {
    if (!navigator.geolocation) { setMsg('Géoloc indisponible'); return }
    navigator.geolocation.getCurrentPosition(
      (p) => setForm((f) => ({ ...f, lat: p.coords.latitude.toFixed(6), lng: p.coords.longitude.toFixed(6) })),
      () => setMsg('Géoloc refusée'), { enableHighAccuracy: true, timeout: 8000 }
    )
  }

  const submit = async (e: FormEvent) => {
    e.preventDefault(); setBusy(true); setMsg('')
    try {
      const res = await fetch('/api/admin/spots', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ ...form, lat: parseFloat(form.lat), lng: parseFloat(form.lng) }),
      })
      const j = await res.json()
      if (!res.ok) throw new Error(j.error || 'Erreur')
      setMsg(`✅ Spot ajouté : ${j.spot.villeNom} → /priere/${j.spot.villeSlug}/${j.spot.slug}`)
      setForm((f) => ({ ...f, nom: '', adresse: '', description: '', photo: '' }))
      load()
    } catch (e) { setMsg('❌ ' + (e as Error).message) } finally { setBusy(false) }
  }

  const del = async (id: string) => {
    if (!confirm('Supprimer ce spot ?')) return
    await fetch(`/api/admin/spots?id=${id}&token=${encodeURIComponent(token)}`, { method: 'DELETE' })
    load()
  }

  const inp = (k: keyof typeof form, ph: string, type = 'text') => (
    <input className="lead-input" style={{ width: '100%' }} type={type} placeholder={ph}
      value={form[k]} onChange={(e) => setForm((f) => ({ ...f, [k]: e.target.value }))} />
  )

  return (
    <div>
      <form onSubmit={submit} style={{ display: 'grid', gap: 10, marginBottom: 28, padding: 16, borderRadius: 14, border: '1px solid rgba(107,70,193,0.25)' }}>
        <strong>Ajouter un coin prière</strong>
        {inp('nom', 'Nom du lieu (ex. Centre commercial Anfa)')}
        <select className="lead-input" value={form.typeLieu} onChange={(e) => setForm((f) => ({ ...f, typeLieu: e.target.value }))} style={{ width: '100%' }}>
          {LIEUX.map(([v, l]) => <option key={v} value={v}>{l}</option>)}
        </select>
        <div style={{ display: 'flex', gap: 8 }}>
          {inp('lat', 'Latitude')}{inp('lng', 'Longitude')}
          <button type="button" className="lead-btn" onClick={useGps} style={{ background: '#1b4332', color: '#fff' }}>📍 GPS</button>
        </div>
        {inp('villeSlug', 'Ville (slug, optionnel — sinon auto)')}
        {inp('adresse', 'Adresse (optionnel)')}
        {inp('description', 'Description / accès (optionnel)')}
        {inp('photo', 'URL photo (optionnel)')}
        <button className="lead-btn" type="submit" disabled={busy} style={{ background: '#6b46c1', color: '#fff' }}>{busy ? '…' : 'Ajouter le spot'}</button>
        {msg && <p style={{ fontSize: 13, margin: 0 }}>{msg}</p>}
      </form>

      <p style={{ fontWeight: 700 }}>{spots.length} spot(s) publié(s)</p>
      <div style={{ display: 'grid', gap: 6 }}>
        {spots.map((s) => (
          <div key={s.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 10, padding: '8px 12px', borderRadius: 8, background: '#f6f6f4', fontSize: 14 }}>
            <a href={`/priere/${s.villeSlug}/${s.slug}`} target="_blank" rel="noreferrer">{s.nom} · {s.villeNom}</a>
            <button onClick={() => del(s.id)} style={{ background: 'none', border: 'none', color: '#c0392b', cursor: 'pointer' }}>✕</button>
          </div>
        ))}
      </div>
    </div>
  )
}
