'use client'
import { useEffect, useState } from 'react'

// 🧹 Modération des spots — supprimer les mauvaises adresses en 2 taps.
// Protégé par ADMIN_TOKEN (saisi une fois, gardé sur CET appareil).
interface AdminSpot {
  id: string; nom: string; villeNom: string; categorie?: string
  auteurPseudo?: string; confirmations?: number; photos?: string[]
  createdAt: string; status: string; source: string
}

export default function AdminSpotsPage() {
  const [token, setToken] = useState('')
  const [saved, setSaved] = useState(false)
  const [spots, setSpots] = useState<AdminSpot[] | null>(null)
  const [err, setErr] = useState('')
  const [busy, setBusy] = useState<string | null>(null)

  useEffect(() => {
    const t = localStorage.getItem('vh_admin_token')
    if (t) { setToken(t); setSaved(true) }
  }, [])

  const charger = async (t: string) => {
    setErr('')
    const r = await fetch(`/api/admin/spots?token=${encodeURIComponent(t)}`).catch(() => null)
    if (!r?.ok) { setErr(r?.status === 401 ? 'Jeton invalide' : 'Erreur de chargement'); setSaved(false); return }
    const j = await r.json()
    // Les contributions EN ATTENTE passent devant : c'est le travail du jour.
    setSpots((j.spots as AdminSpot[]).sort((a, b) =>
      (a.status === 'pending' ? 0 : 1) - (b.status === 'pending' ? 0 : 1)
      || (b.createdAt ?? '').localeCompare(a.createdAt ?? '')))
    localStorage.setItem('vh_admin_token', t)
    setSaved(true)
  }
  useEffect(() => { if (saved && token && spots === null) void charger(token) }, [saved]) // eslint-disable-line react-hooks/exhaustive-deps

  const supprimer = async (s: AdminSpot) => {
    if (!confirm(`Supprimer définitivement « ${s.nom} » (${s.villeNom}) ?`)) return
    setBusy(s.id)
    const r = await fetch(`/api/admin/spots?id=${encodeURIComponent(s.id)}&token=${encodeURIComponent(token)}`, { method: 'DELETE' }).catch(() => null)
    if (r?.ok) setSpots((cur) => cur?.filter((x) => x.id !== s.id) ?? cur)
    else alert('Suppression échouée')
    setBusy(null)
  }

  // Publier une contribution vérifiée (le seul chemin vers l'affichage public)
  const valider = async (s: AdminSpot) => {
    if (!confirm(`Publier « ${s.nom} » (${s.villeNom}) ?\n\nÀ ne faire que si l'adresse a été vérifiée.`)) return
    setBusy(s.id)
    const r = await fetch(`/api/admin/spots?token=${encodeURIComponent(token)}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ id: s.id, status: 'published' }),
    }).catch(() => null)
    if (r?.ok) setSpots((cur) => cur?.map((x) => (x.id === s.id ? { ...x, status: 'published' } : x)) ?? cur)
    else alert('Publication échouée')
    setBusy(null)
  }

  const enAttente = spots?.filter((s) => s.status === 'pending').length ?? 0

  return (
    <main style={{ minHeight: '100vh', background: 'var(--creme)', padding: '26px 16px 80px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 900, color: '#0b1a0f', margin: '0 0 4px' }}>🧹 Modération des spots</h1>
        <p style={{ color: '#6b7280', fontSize: 14, margin: '0 0 16px' }}>Supprime les mauvaises adresses — définitif, réfléchis avant de taper.</p>

        {!saved && (
          <form onSubmit={(e) => { e.preventDefault(); void charger(token) }} style={{ display: 'flex', gap: 8, marginBottom: 16 }}>
            <input type="password" value={token} onChange={(e) => setToken(e.target.value)} placeholder="Jeton admin"
              style={{ flex: 1, minHeight: 50, padding: '0 14px', borderRadius: 12, border: '1.5px solid rgba(27,67,50,0.25)', fontSize: 15, background: '#fff' }} />
            <button type="submit" style={{ minHeight: 50, padding: '0 20px', borderRadius: 12, border: 'none', background: 'var(--foret)', color: '#fff', fontWeight: 800, cursor: 'pointer' }}>Entrer</button>
          </form>
        )}
        {err && <p style={{ color: '#b91c1c', fontWeight: 700, fontSize: 14 }}>{err}</p>}

        {spots && (
          <>
            <p style={{ fontSize: 13.5, color: '#6b7280', margin: '0 0 10px' }}>
              {spots.length} spots · les plus récents d&apos;abord
              {enAttente > 0 && <strong style={{ color: '#8A6D1E' }}> · {enAttente} en attente de vérification</strong>}
            </p>
            <div style={{ display: 'grid', gap: 8 }}>
              {spots.map((s) => (
                <div key={s.id} style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1px solid rgba(27,67,50,0.12)', borderRadius: 14, padding: '12px 14px' }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ margin: 0, fontWeight: 800, fontSize: 14.5, color: '#0b1a0f' }}>
                      <a href={`/spot/${s.id}`} target="_blank" rel="noreferrer" style={{ color: '#0b1a0f' }}>{s.nom}</a>
                      {s.status === 'hidden' && <span style={{ marginLeft: 6, fontSize: 11, color: '#b91c1c', fontWeight: 800 }}>MASQUÉ</span>}
                      {s.status === 'pending' && <span style={{ marginLeft: 6, fontSize: 11, color: '#8A6D1E', fontWeight: 800 }}>EN ATTENTE</span>}
                    </p>
                    <p style={{ margin: '2px 0 0', fontSize: 12.5, color: '#6b7280' }}>
                      {s.villeNom} · {s.categorie ?? '?'} · {s.auteurPseudo ?? 'anonyme'} · ✅ {s.confirmations ?? 0} · 📷 {(s.photos ?? []).length} · {(s.createdAt ?? '').slice(0, 10)}
                    </p>
                  </div>
                  {s.status === 'pending' && (
                    <button onClick={() => valider(s)} disabled={busy === s.id}
                      style={{ flexShrink: 0, minHeight: 42, padding: '0 14px', borderRadius: 10, border: 'none', background: 'var(--foret)', color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer', opacity: busy === s.id ? 0.6 : 1 }}>
                      ✓ Publier
                    </button>
                  )}
                  <button onClick={() => supprimer(s)} disabled={busy === s.id}
                    style={{ flexShrink: 0, minHeight: 42, padding: '0 14px', borderRadius: 10, border: 'none', background: '#E5484D', color: '#fff', fontWeight: 800, fontSize: 13, cursor: 'pointer', opacity: busy === s.id ? 0.6 : 1 }}>
                    {busy === s.id ? '…' : 'Supprimer'}
                  </button>
                </div>
              ))}
            </div>
          </>
        )}
      </div>
    </main>
  )
}
