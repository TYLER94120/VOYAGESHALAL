'use client'
import { useEffect, useRef, useState } from 'react'
import 'leaflet/dist/leaflet.css'
import type { Map as LeafletMap, Marker } from 'leaflet'
import { CATEGORIES } from '@/lib/community'
import { useCommunity, authFetch } from '@/lib/useCommunity'
import { useInstantPosition } from '@/lib/useInstantPosition'
import AuthSheet from '@/components/community/AuthSheet'
import Celebration from '@/components/community/Celebration'
import { useLanguage } from '@/components/i18n/LanguageProvider'

// BLOC 2 — Ajouter un spot en < 30 s : type → position (carte/GPS) → 1 phrase.
// 3 étapes, 1 action par écran, boutons ≥ 56 px (design system).

export default function AjouterClient() {
  const { lang } = useLanguage()
  const en = lang === 'en'
  const { me, loaded, sendCode, verify, googleLogin, refresh } = useCommunity()
  const { pos, refineGps, geoLoading } = useInstantPosition(en)
  const [step, setStep] = useState(1)
  const [categorie, setCategorie] = useState('')
  const [pin, setPin] = useState<{ lat: number; lng: number } | null>(null)
  const [nom, setNom] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [authOpen, setAuthOpen] = useState(false)
  const [done, setDone] = useState<{ points: number; badges: string[]; impact: number; url: string } | null>(null)

  const mapEl = useRef<HTMLDivElement>(null)
  const mapRef = useRef<LeafletMap | null>(null)
  const markerRef = useRef<Marker | null>(null)

  // Carte de positionnement (étape 2) : pin draggable, centrée position instantanée
  useEffect(() => {
    if (step !== 2 || !mapEl.current || mapRef.current || !pos) return
    let cancelled = false
    ;(async () => {
      const L = (await import('leaflet')).default
      if (cancelled || !mapEl.current || mapRef.current) return
      const map = L.map(mapEl.current, { center: [pos.lat, pos.lng], zoom: 15 })
      mapRef.current = map
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { attribution: '© OpenStreetMap' }).addTo(map)
      const icon = L.divIcon({ html: `<div style="font-size:34px;filter:drop-shadow(0 3px 5px rgba(0,0,0,.4))">📍</div>`, className: '', iconAnchor: [17, 32] })
      const mk = L.marker([pos.lat, pos.lng], { icon, draggable: true }).addTo(map)
      markerRef.current = mk
      setPin({ lat: pos.lat, lng: pos.lng })
      mk.on('dragend', () => { const p = mk.getLatLng(); setPin({ lat: p.lat, lng: p.lng }) })
      map.on('click', (e: { latlng: { lat: number; lng: number } }) => { mk.setLatLng(e.latlng); setPin({ lat: e.latlng.lat, lng: e.latlng.lng }) })
    })()
    return () => { cancelled = true }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step, pos])

  const gpsExact = async () => {
    const ok = await refineGps()
    if (ok && markerRef.current && mapRef.current && pos) {
      // pos sera mis à jour au prochain render ; on recentre au tick suivant
      setTimeout(() => {
        const p = markerRef.current!.getLatLng()
        void p
      }, 0)
    }
  }
  useEffect(() => {
    if (step === 2 && pos && mapRef.current && markerRef.current) {
      mapRef.current.setView([pos.lat, pos.lng], 16)
      markerRef.current.setLatLng([pos.lat, pos.lng])
      setPin({ lat: pos.lat, lng: pos.lng })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pos?.lat, pos?.lng])

  const publier = async () => {
    if (!me) { setAuthOpen(true); return }
    if (!pin || !nom.trim()) return
    setBusy(true); setErr('')
    try {
      const r = await authFetch('/api/community/spots', {
        method: 'POST',
        body: JSON.stringify({ categorie, nom: nom.trim(), lat: pin.lat, lng: pin.lng, note: note.trim() || undefined }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Erreur')
      setDone({ points: j.pointsGagnes, badges: j.nouveauxBadges ?? [], impact: j.impact ?? 0, url: j.url })
      await refresh()
    } catch (ex) {
      const msg = String((ex as Error).message)
      if (msg.includes('Connexion')) setAuthOpen(true)
      else setErr(msg)
    } finally { setBusy(false) }
  }

  const reset = () => { setDone(null); setStep(1); setCategorie(''); setNom(''); setNote(''); mapRef.current?.remove(); mapRef.current = null; markerRef.current = null }

  const btn = { width: '100%', minHeight: 56, borderRadius: 18, border: 'none', background: 'var(--foret)', color: '#fff', fontWeight: 800, fontSize: 16, cursor: 'pointer' } as const

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 16px 60px' }}>
      {/* Progression */}
      <div style={{ display: 'flex', gap: 8, margin: '18px 0' }} aria-hidden>
        {[1, 2, 3].map((s) => <div key={s} style={{ height: 6, flex: 1, borderRadius: 99, background: s <= step ? 'var(--or)' : 'rgba(27,67,50,0.15)' }} />)}
      </div>

      {/* ÉTAPE 1 — type (1 tap) */}
      {step === 1 && (
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 900, color: '#0b1a0f', margin: '0 0 14px' }}>
            {en ? 'What did you find? 👀' : 'Tu as trouvé quoi ? 👀'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {CATEGORIES.map((c) => (
              <button key={c.id} onClick={() => { setCategorie(c.id); setStep(2) }}
                style={{ minHeight: 88, borderRadius: 18, border: '1.5px solid rgba(27,67,50,0.2)', background: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
                <span style={{ fontSize: 30 }}>{c.icon}</span>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#1b4332' }}>{en ? c.en : c.fr}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* ÉTAPE 2 — position (carte + GPS) */}
      {step === 2 && (
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 900, color: '#0b1a0f', margin: '0 0 10px' }}>
            {en ? 'Where is it? 📍' : 'C\'est où ? 📍'}
          </h2>
          <p style={{ fontSize: 14, color: '#4b5563', margin: '0 0 10px' }}>
            {en ? 'Drag the pin or tap the map.' : 'Déplace le pin ou touche la carte.'}
          </p>
          <div ref={mapEl} style={{ height: 300, borderRadius: 18, overflow: 'hidden', border: '2px solid rgba(201,168,76,0.4)', background: '#dfe6e2', marginBottom: 12 }} />
          <button onClick={() => void gpsExact()} disabled={geoLoading}
            style={{ width: '100%', minHeight: 50, borderRadius: 14, border: '1.5px solid rgba(27,67,50,0.3)', background: '#fff', color: '#1b4332', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginBottom: 12 }}>
            📍 {geoLoading ? (en ? 'Locating…' : 'Localisation…') : (en ? 'Use my exact position' : 'Utiliser ma position exacte')}
          </button>
          <button onClick={() => setStep(3)} disabled={!pin} style={{ ...btn, opacity: pin ? 1 : 0.5 }}>
            {en ? 'It\'s here →' : 'C\'est ici →'}
          </button>
        </div>
      )}

      {/* ÉTAPE 3 — nom + 1 phrase → publier */}
      {step === 3 && (
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 900, color: '#0b1a0f', margin: '0 0 14px' }}>
            {en ? 'Last step ✨' : 'Dernière étape ✨'}
          </h2>
          <input value={nom} onChange={(e) => setNom(e.target.value)} maxLength={80} autoFocus
            placeholder={en ? 'Name of the place (e.g. Carrefour prayer room)' : 'Nom du lieu (ex. Salle de prière du Carrefour)'}
            style={{ width: '100%', padding: 16, borderRadius: 14, border: '1.5px solid rgba(27,67,50,0.25)', fontSize: 16, marginBottom: 12, background: '#fff' }} />
          <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} rows={2}
            placeholder={en ? 'One sentence to help (optional) — e.g. "2nd floor, near the toilets, clean mat"' : 'Une phrase pour aider (optionnel) — ex. « 2e étage, près des sanitaires, tapis propre »'}
            style={{ width: '100%', padding: 16, borderRadius: 14, border: '1.5px solid rgba(27,67,50,0.25)', fontSize: 16, marginBottom: 14, background: '#fff', resize: 'none' }} />
          <button onClick={() => void publier()} disabled={busy || nom.trim().length < 3} style={{ ...btn, opacity: nom.trim().length < 3 ? 0.5 : 1 }}>
            {busy ? '…' : (loaded && !me ? (en ? '🤝 Sign in & publish' : '🤝 Se connecter & publier') : (en ? '🚀 Publish my spot' : '🚀 Publier mon spot'))}
          </button>
          {err && <p style={{ color: '#b91c1c', fontSize: 14, marginTop: 10 }}>{err}</p>}
          <p style={{ fontSize: 12.5, color: '#9ca3af', marginTop: 12, textAlign: 'center' }}>
            {en ? 'Your spot appears as “shared by the community · to confirm” — we never certify.' : 'Ton spot apparaîtra « partagé par la communauté · à confirmer » — nous ne certifions jamais.'}
          </p>
          <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 14, cursor: 'pointer', minHeight: 44, marginTop: 4 }}>← {en ? 'Back' : 'Retour'}</button>
        </div>
      )}

      <AuthSheet open={authOpen} onClose={() => setAuthOpen(false)} onDone={() => { setAuthOpen(false); void publier() }} sendCode={sendCode} verify={verify} googleLogin={googleLogin} en={en} />
      {done && <Celebration points={done.points} badges={done.badges} impact={done.impact} spotUrl={done.url} onClose={reset} en={en} />}
    </div>
  )
}
