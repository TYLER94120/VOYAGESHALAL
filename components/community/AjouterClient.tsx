'use client'
import { useEffect, useState } from 'react'
import { useCommunity, authFetch } from '@/lib/useCommunity'
import { useInstantPosition } from '@/lib/useInstantPosition'
import PositionBadge from '@/components/location/PositionBadge'
import AuthSheet from '@/components/community/AuthSheet'
import Celebration from '@/components/community/Celebration'
import QcmSpot from '@/components/community/QcmSpot'
import MediaCapture, { compressPhoto } from '@/components/spots/MediaCapture'
import { useLanguage } from '@/components/i18n/LanguageProvider'

// Ajouter un spot façon WAZE : 3 taps, 15 secondes.
// 1) TYPE (4 grandes icônes) → 2) LIEU (GPS auto + lieux à proximité à TAPER,
// noms réels OpenStreetMap) → 3) PUBLIER (photo/phrase optionnels, login
// Google au dernier moment). Seuls TYPE et LIEU sont requis.

const TYPES = [
  { id: 'coin_priere', icon: '🕌', fr: 'Coin prière', en: 'Prayer spot' },
  { id: 'resto', icon: '🍽', fr: 'Resto halal', en: 'Halal resto' },
  { id: 'espace_femmes', icon: '🏊', fr: 'Espace femmes', en: 'Women space' },
  { id: 'autre', icon: '⭐', fr: 'Autre', en: 'Other' },
]

interface Nearby { name: string; lat: number; lng: number; sub?: string; distance: number }
const fmt = (m: number) => (m < 1000 ? `${Math.round(m)} m` : `${(m / 1000).toFixed(1)} km`)

function haversine(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const R = 6371000
  const p1 = (lat1 * Math.PI) / 180, p2 = (lat2 * Math.PI) / 180
  const dp = ((lat2 - lat1) * Math.PI) / 180, dl = ((lng2 - lng1) * Math.PI) / 180
  const a = Math.sin(dp / 2) ** 2 + Math.cos(p1) * Math.cos(p2) * Math.sin(dl / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export default function AjouterClient() {
  const { lang } = useLanguage()
  const en = lang === 'en'
  const { me, loaded, sendCode, verify, googleLogin, refresh } = useCommunity()
  const etatPos = useInstantPosition(en)
  const { pos, source, refineGps } = etatPos
  const [step, setStep] = useState(1)
  const [categorie, setCategorie] = useState('')
  const [lieu, setLieu] = useState<{ nom: string; lat: number; lng: number; manuel: boolean } | null>(null)
  const [nearby, setNearby] = useState<Nearby[] | null>(null)
  const [nom, setNom] = useState('')
  const [note, setNote] = useState('')
  const [busy, setBusy] = useState(false)
  const [err, setErr] = useState('')
  const [authOpen, setAuthOpen] = useState(false)
  const [mediaOpen, setMediaOpen] = useState(false)
  const [mediaDone, setMediaDone] = useState(false)
  // Média choisi AVANT publication (visible directement à l'étape 3, optionnel)
  const [pendingPhoto, setPendingPhoto] = useState<string | null>(null)
  const [pendingVideo, setPendingVideo] = useState<{ payload: string; videoTexte?: string; videoDebut?: number; videoFin?: number } | null>(null)
  const [reelOpen, setReelOpen] = useState(false)
  const [done, setDone] = useState<{ points: number; badges: string[]; impact: number; url: string; anon?: boolean; spotId?: string; claimKey?: string; enAttente?: boolean } | null>(null)

  // Étape 2 : GPS précis automatique + lieux nommés à proximité (OpenStreetMap,
  // vrais noms — on TAPE, on n'écrit pas)
  useEffect(() => {
    if (step !== 2) return
    void refineGps()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step])
  useEffect(() => {
    if (step !== 2 || !pos) return
    let cancelled = false
    const q = `[out:json][timeout:15];(` +
      `node(around:400,${pos.lat},${pos.lng})[name][amenity];` +
      `node(around:400,${pos.lat},${pos.lng})[name][shop];` +
      `node(around:400,${pos.lat},${pos.lng})[name][leisure];` +
      `way(around:400,${pos.lat},${pos.lng})[name][amenity];` +
      `);out center 60;`
    fetch('https://overpass-api.de/api/interpreter', { method: 'POST', body: `data=${encodeURIComponent(q)}` })
      .then((r) => r.json())
      .then((d) => {
        if (cancelled) return
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const list: Nearby[] = (d.elements as any[])
          .map((el) => {
            const la = el.lat ?? el.center?.lat, lo = el.lon ?? el.center?.lon
            if (!la || !lo || !el.tags?.name) return null
            return { name: String(el.tags.name), lat: Number(la), lng: Number(lo), sub: String(el.tags.amenity || el.tags.shop || el.tags.leisure || '').replace(/_/g, ' '), distance: haversine(pos.lat, pos.lng, la, lo) } as Nearby
          })
          .filter((x): x is Nearby => x !== null)
          .sort((a, b) => a.distance - b.distance)
          .filter((x, i, arr) => arr.findIndex((y) => y.name === x.name) === i)
          .slice(0, 8)
        setNearby(list)
      })
      .catch(() => { if (!cancelled) setNearby([]) })
    return () => { cancelled = true }
  }, [step, pos])

  const publier = async (nomFinal?: string) => {
    const leNom = (nomFinal ?? (lieu?.manuel ? nom : lieu?.nom) ?? '').trim()
    if (!lieu || leNom.length < 3) return
    // ZÉRO FRICTION : pas de compte requis — publication anonyme directe
    setBusy(true); setErr('')
    try {
      const r = await authFetch('/api/community/spots', {
        method: 'POST',
        body: JSON.stringify({ categorie, nom: leNom, lat: lieu.lat, lng: lieu.lng, note: note.trim() || undefined }),
      })
      const j = await r.json()
      if (!r.ok) throw new Error(j.error || 'Erreur')
      // Média choisi avant publication → rattaché au spot tout de suite
      if (j.spot?.id && (pendingPhoto || pendingVideo)) {
        const body: Record<string, unknown> = { spotId: j.spot.id }
        if (pendingPhoto) body.photo = pendingPhoto
        if (pendingVideo) { body.video = pendingVideo.payload; body.videoTexte = pendingVideo.videoTexte; body.videoDebut = pendingVideo.videoDebut; body.videoFin = pendingVideo.videoFin }
        fetch('/api/community/enrich', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) }).catch(() => {})
        setMediaDone(true)
      }
      setDone({ points: j.pointsGagnes, badges: j.nouveauxBadges ?? [], impact: j.impact ?? 0, url: j.url, anon: j.anon === true, spotId: j.spot?.id, claimKey: j.claimKey, enAttente: j.spot?.status === 'pending' })
      await refresh()
    } catch (ex) {
      const msg = String((ex as Error).message)
      if (msg.includes('Connexion')) setAuthOpen(true)
      else setErr(msg)
    } finally { setBusy(false) }
  }

  const reset = () => { setDone(null); setStep(1); setCategorie(''); setLieu(null); setNearby(null); setNom(''); setNote(''); setPendingPhoto(null); setPendingVideo(null); setMediaDone(false) }
  const big = { width: '100%', minHeight: 56, borderRadius: 18, border: 'none', background: 'var(--foret)', color: '#fff', fontWeight: 800, fontSize: 16, cursor: 'pointer' } as const
  const typeInfo = TYPES.find((t) => t.id === categorie)

  return (
    <div style={{ maxWidth: 480, margin: '0 auto', padding: '0 16px 60px' }}>
      {/* Progression */}
      <div style={{ display: 'flex', gap: 8, margin: '18px 0' }} aria-hidden>
        {[1, 2, 3].map((s) => <div key={s} style={{ height: 6, flex: 1, borderRadius: 99, background: s <= step ? 'var(--or)' : 'rgba(27,67,50,0.15)', transition: 'background .15s' }} />)}
      </div>

      {/* TAP 1 — TYPE */}
      {step === 1 && (
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 900, color: '#0b1a0f', margin: '0 0 14px' }}>
            {en ? 'What did you find? 👀' : 'Tu as trouvé quoi ? 👀'}
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            {TYPES.map((c) => (
              <button key={c.id} onClick={() => { setCategorie(c.id); setStep(2) }}
                style={{ minHeight: 100, borderRadius: 18, border: '1.5px solid rgba(27,67,50,0.2)', background: '#fff', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
                <span style={{ fontSize: 34 }}>{c.icon}</span>
                <span style={{ fontWeight: 700, fontSize: 15.5, color: '#1b4332' }}>{en ? c.en : c.fr}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* TAP 2 — LIEU : on TAPE un lieu à proximité (GPS auto) */}
      {step === 2 && (
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 900, color: '#0b1a0f', margin: '0 0 6px' }}>
            {en ? 'Where is it? 📍' : 'C\'est où ? 📍'}
          </h2>
          {/* ⚠️ ICI LA POSITION N'EST PAS UN CONFORT, C'EST UNE DONNÉE.
              Ce qu'on enregistre ira dans la base et sera montré à d'autres
              voyageurs. Une position approximative écrite comme exacte, c'est
              un lieu faux publié en notre nom. Donc on l'affiche en grand. */}
          <div style={{ margin: '0 0 12px' }}>
            <PositionBadge etat={etatPos} en={en} clair />
          </div>
          <p style={{ fontSize: 14, color: '#4b5563', margin: '0 0 12px' }}>
            {pos
              ? (en ? 'Tap the place around you:' : 'Tape le lieu autour de toi :')
              : (en ? 'Locating…' : 'Localisation…')}
          </p>

          {nearby === null && pos && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[0, 1, 2].map((i) => <div key={i} style={{ height: 56, borderRadius: 14, background: 'rgba(27,67,50,0.07)', animation: 'pulse 1.2s ease-in-out infinite' }} />)}
              <style>{`@keyframes pulse { 50% { opacity: .5 } }`}</style>
            </div>
          )}

          {nearby !== null && nearby.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 10 }}>
              {nearby.map((n, i) => (
                <button key={i} onClick={() => { setLieu({ nom: n.name, lat: n.lat, lng: n.lng, manuel: false }); setStep(3) }}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, minHeight: 56, borderRadius: 14, border: '1.5px solid rgba(27,67,50,0.18)', background: '#fff', cursor: 'pointer', padding: '8px 14px', textAlign: 'left' }}>
                  <span style={{ fontSize: 20 }}>{typeInfo?.icon ?? '📍'}</span>
                  <span style={{ flex: 1, minWidth: 0 }}>
                    <span style={{ display: 'block', fontWeight: 700, fontSize: 15, color: '#0b1a0f', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{n.name}</span>
                    <span style={{ fontSize: 12.5, color: '#6b7280' }}>{fmt(n.distance)}{n.sub ? ` · ${n.sub}` : ''}</span>
                  </span>
                  <span style={{ color: '#1b4332', fontWeight: 700 }}>→</span>
                </button>
              ))}
            </div>
          )}
          {nearby !== null && nearby.length === 0 && (
            <p style={{ fontSize: 13.5, color: '#6b7280', margin: '0 0 10px' }}>
              {en ? 'No named place found right here — no problem:' : 'Aucun lieu nommé trouvé juste ici — pas grave :'}
            </p>
          )}

          {/* « Je suis ici » n'a le droit d'exister QUE si la position vient
              vraiment du GPS. Sans ça, on enregistrait la position estimée
              depuis la connexion — à plusieurs kilomètres — sous l'étiquette
              « ma position exacte ». Tant que le GPS n'a pas répondu, le
              bouton demande le GPS au lieu de publier un lieu faux. */}
          {pos && (
            source === 'gps' ? (
              <button onClick={() => { setLieu({ nom: '', lat: pos.lat, lng: pos.lng, manuel: true }); setStep(3) }}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', minHeight: 56, borderRadius: 14, border: '2px dashed rgba(27,67,50,0.35)', background: 'rgba(201,168,76,0.08)', color: '#1b4332', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
                📍 {en ? 'I\'m here (my exact GPS spot)' : 'Je suis ici (ma position exacte)'}
              </button>
            ) : (
              <button onClick={() => void refineGps()}
                style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, width: '100%', minHeight: 56, borderRadius: 14, border: '2px dashed rgba(27,67,50,0.35)', background: 'rgba(201,168,76,0.08)', color: '#1b4332', fontWeight: 800, fontSize: 15, cursor: 'pointer' }}>
                📍 {en ? 'Turn on exact position to add a place here' : 'Active ta position exacte pour ajouter ici'}
              </button>
            )
          )}
          <button onClick={() => setStep(1)} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 14, cursor: 'pointer', minHeight: 44, marginTop: 6 }}>← {en ? 'Back' : 'Retour'}</button>
        </div>
      )}

      {/* TAP 3 — PUBLIER (tout le reste est optionnel) */}
      {step === 3 && lieu && (
        <div>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 24, fontWeight: 900, color: '#0b1a0f', margin: '0 0 12px' }}>
            {en ? 'Publish ✨' : 'On publie ✨'}
          </h2>

          {/* Récap 1 ligne */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, background: '#fff', border: '1.5px solid rgba(27,67,50,0.18)', borderRadius: 14, padding: '12px 14px', marginBottom: 12, minHeight: 56 }}>
            <span style={{ fontSize: 22 }}>{typeInfo?.icon}</span>
            <span style={{ flex: 1, fontWeight: 700, fontSize: 15, color: '#0b1a0f' }}>
              {lieu.manuel ? (en ? 'My position' : 'Ma position') : lieu.nom}
              <span style={{ fontWeight: 400, color: '#6b7280', fontSize: 13 }}> · {en ? typeInfo?.en : typeInfo?.fr}</span>
            </span>
          </div>

          {/* Nom requis UNIQUEMENT si lieu manuel (sinon il vient du tap) */}
          {lieu.manuel && (
            <input value={nom} onChange={(e) => setNom(e.target.value)} maxLength={80} autoFocus
              placeholder={en ? 'Name it (e.g. mall prayer room)' : 'Nomme-le (ex. salle de prière du centre commercial)'}
              style={{ width: '100%', padding: 15, borderRadius: 14, border: '1.5px solid rgba(27,67,50,0.25)', fontSize: 16, marginBottom: 12, background: '#fff' }} />
          )}

          {/* OPTIONNEL et VISIBLE directement : photo, reel, un mot — jamais requis */}
          <p style={{ fontSize: 13, fontWeight: 800, color: '#6b7280', letterSpacing: 1, textTransform: 'uppercase', margin: '2px 0 8px' }}>
            {en ? 'Optional — make it shine ✨' : 'Optionnel — fais-le briller ✨'}
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
            {pendingPhoto ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 56, borderRadius: 14, border: '1.5px solid rgba(27,67,50,0.3)', background: '#fff', padding: '0 10px' }}>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={pendingPhoto} alt="" style={{ width: 40, height: 40, objectFit: 'cover', borderRadius: 8 }} />
                <span style={{ flex: 1, fontWeight: 700, fontSize: 13, color: '#1b4332' }}>{en ? 'Photo ✓' : 'Photo ✓'}</span>
                <button onClick={() => setPendingPhoto(null)} aria-label="Retirer" style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: '#9ca3af' }}>✕</button>
              </div>
            ) : (
              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 56, borderRadius: 14, border: '1.5px solid rgba(27,67,50,0.25)', background: '#fff', color: '#1b4332', fontWeight: 800, fontSize: 14.5, cursor: 'pointer' }}>
                📷 {en ? 'Photo' : 'Photo'}
                <input type="file" accept="image/*" style={{ display: 'none' }}
                  onChange={async (e) => {
                    const f = e.target.files?.[0]
                    if (!f) return
                    try { setPendingPhoto(await compressPhoto(f)) } catch { /* photo illisible */ }
                  }} />
              </label>
            )}
            {pendingVideo ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 56, borderRadius: 14, border: '1.5px solid rgba(27,67,50,0.3)', background: '#fff', padding: '0 12px' }}>
                <span style={{ flex: 1, fontWeight: 700, fontSize: 13, color: '#1b4332' }}>🎥 {en ? 'Reel ready ✓' : 'Reel prêt ✓'}</span>
                <button onClick={() => setPendingVideo(null)} aria-label="Retirer" style={{ background: 'none', border: 'none', fontSize: 16, cursor: 'pointer', color: '#9ca3af' }}>✕</button>
              </div>
            ) : (
              <button onClick={() => setReelOpen(true)} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, minHeight: 56, borderRadius: 14, border: '1.5px solid rgba(27,67,50,0.25)', background: '#fff', color: '#1b4332', fontWeight: 800, fontSize: 14.5, cursor: 'pointer' }}>
                🎥 {en ? 'Reel — film or import' : 'Reel — filmer ou importer'}
              </button>
            )}
          </div>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} maxLength={200} rows={2}
            placeholder={en ? '✏️ A word for the next traveler… (e.g. "2nd floor, clean mat")' : '✏️ Un mot pour le prochain… (ex. « 2e étage, tapis propre »)'}
            style={{ width: '100%', padding: 14, borderRadius: 14, border: '1.5px solid rgba(27,67,50,0.25)', fontSize: 15.5, margin: '0 0 12px', background: '#fff', resize: 'none' }} />

          <button onClick={() => void publier()} disabled={busy || (lieu.manuel && nom.trim().length < 3)}
            style={{ ...big, opacity: lieu.manuel && nom.trim().length < 3 ? 0.5 : 1 }}>
            {busy ? '…' : (en ? '🚀 Publish' : '🚀 Publier')}
          </button>

          {err && <p style={{ color: '#b91c1c', fontSize: 14, marginTop: 10 }}>{err}</p>}
          <p style={{ fontSize: 12.5, color: '#9ca3af', marginTop: 10, textAlign: 'center' }}>
            {en ? 'Appears as “community · to confirm” — we never certify.' : 'Apparaîtra « communauté · à confirmer » — nous ne certifions jamais.'}
          </p>
          <button onClick={() => setStep(2)} style={{ background: 'none', border: 'none', color: '#6b7280', fontSize: 14, cursor: 'pointer', minHeight: 44 }}>← {en ? 'Back' : 'Retour'}</button>
        </div>
      )}

      {/* Overlay « Filmer un reel » AVANT publication (optionnel) */}
      {reelOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 210, background: 'rgba(11,26,15,0.96)', overflowY: 'auto', padding: '30px 18px 60px' }}>
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <p style={{ color: '#fdfaf3', fontWeight: 900, fontSize: 19, margin: '0 0 14px', textAlign: 'center' }}>
              {en ? 'Film your spot 🎥' : 'Filme ton spot 🎥'}
            </p>
            <MediaCapture
              onSkip={() => setReelOpen(false)}
              onDone={(m) => {
                if (m.kind === 'photo') setPendingPhoto(m.payload)
                else setPendingVideo({ payload: m.payload, videoTexte: m.videoTexte, videoDebut: m.videoDebut, videoFin: m.videoFin })
                setReelOpen(false)
              }}
            />
          </div>
        </div>
      )}

      <AuthSheet open={authOpen} onClose={() => setAuthOpen(false)}
        onDone={async () => {
          setAuthOpen(false)
          // spot déjà publié anonymement → on le rattache au compte
          if (done?.anon && done.spotId && done.claimKey) {
            try {
              const r = await authFetch('/api/community/claim', { method: 'POST', body: JSON.stringify({ spotId: done.spotId, key: done.claimKey }) })
              const j = await r.json()
              if (r.ok) setDone({ ...done, anon: false, points: j.pointsGagnes ?? 10, badges: j.nouveauxBadges ?? [] })
            } catch { /* le spot reste publié quoi qu'il arrive */ }
          }
        }}
        sendCode={sendCode} verify={verify} googleLogin={googleLogin} en={en} />
      {/* Média optionnel APRÈS publication — jamais bloquant (reel/photo) */}
      {done && mediaOpen && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 210, background: 'rgba(11,26,15,0.96)', overflowY: 'auto', padding: '30px 18px 60px' }}>
          <div style={{ maxWidth: 480, margin: '0 auto' }}>
            <p style={{ color: '#fdfaf3', fontWeight: 900, fontSize: 19, margin: '0 0 14px', textAlign: 'center' }}>
              {mediaDone ? (en ? '✓ Added to your spot!' : '✓ Ajouté à ton spot !') : (en ? 'Show your spot 🎥' : 'Fais voir ton spot 🎥')}
            </p>
            {mediaDone ? (
              <button onClick={() => setMediaOpen(false)} style={{ display: 'block', width: '100%', minHeight: 54, borderRadius: 16, border: 'none', background: 'var(--or)', color: '#0b1a0f', fontWeight: 900, fontSize: 15, cursor: 'pointer' }}>
                {en ? 'Done' : 'Terminé'}
              </button>
            ) : (
              <MediaCapture
                skipLabel={en ? 'Skip — my spot is already live' : 'Passer — mon spot est déjà publié'}
                onSkip={() => setMediaOpen(false)}
                onDone={async (m) => {
                  try {
                    const body: Record<string, unknown> = { spotId: done.spotId }
                    if (m.kind === 'photo') body.photo = m.payload
                    else { body.video = m.payload; body.videoTexte = m.videoTexte; body.videoDebut = m.videoDebut; body.videoFin = m.videoFin }
                    await fetch('/api/community/enrich', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(body) })
                    setMediaDone(true)
                  } catch { setMediaOpen(false) }
                }}
              />
            )}
          </div>
        </div>
      )}
      {done && <Celebration points={done.points} badges={done.badges} impact={done.impact} spotUrl={done.url} onClose={reset} en={en} enAttente={done.enAttente === true}
        qcm={done.spotId ? (
          // Le meilleur moment pour ces questions : la personne est ENCORE
          // sur place, elle vient d'ajouter le lieu. Tout est facultatif.
          <QcmSpot spotId={done.spotId} categorie={categorie} en={en} />
        ) : undefined}
        mediaCta={done.spotId && !mediaDone ? (
          <button onClick={() => setMediaOpen(true)}
            style={{ display: 'block', width: '100%', minHeight: 54, borderRadius: 16, border: '2px solid rgba(27,67,50,0.35)', background: '#fff', color: '#1b4332', fontWeight: 900, fontSize: 15, cursor: 'pointer', marginBottom: 12 }}>
            🎥 {en ? 'Add a photo / reel (15 s)' : 'Ajoute une photo / un reel (15 s)'}
          </button>
        ) : undefined}
        claimCta={done.anon && loaded && !me ? (
          <button onClick={() => setAuthOpen(true)}
            style={{ display: 'block', width: '100%', minHeight: 54, borderRadius: 16, border: 'none', background: 'var(--or, #C9A84C)', color: '#0b1a0f', fontWeight: 900, fontSize: 15, cursor: 'pointer', marginBottom: 12 }}>
            ✨ {en ? 'Keep your +10 points — Continue with Google' : 'Garde tes +10 points — Continuer avec Google'}
          </button>
        ) : undefined} />}
    </div>
  )
}
