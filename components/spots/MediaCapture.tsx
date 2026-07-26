'use client'
import { useEffect, useRef, useState } from 'react'
import { useLanguage } from '@/components/i18n/LanguageProvider'

// 🎥 Capture média d'un spot — TOUT optionnel, jamais bloquant.
// « Importer » (photo/vidéo de la galerie — marche partout) ou « Filmer »
// (getUserMedia + MediaRecorder, max 30 s) avec repli propre si la caméra
// n'est pas dispo (iOS Safari ancien → input capture natif).
// Mini-montage LÉGER sans réencodage : légende à l'écran + rognage début/fin
// stockés en métadonnées (le lecteur du feed les applique).
// Pas de musique copyrightée — bibliothèque libre : plus tard, jamais TikTok.

const MAX_SEC = 30

export interface CapturedMedia {
  kind: 'photo' | 'video'
  payload: string            // photo → data-URL compressée ; vidéo → URL uploadée
  videoTexte?: string
  videoDebut?: number
  videoFin?: number
}

// Compresse une photo en data-URL JPEG (~≤250 Ko) — zéro dépendance serveur
async function compressPhoto(file: File): Promise<string> {
  const img = await createImageBitmap(file)
  const scale = Math.min(1, 1280 / Math.max(img.width, img.height))
  const canvas = document.createElement('canvas')
  canvas.width = Math.round(img.width * scale)
  canvas.height = Math.round(img.height * scale)
  canvas.getContext('2d')!.drawImage(img, 0, 0, canvas.width, canvas.height)
  for (const q of [0.8, 0.65, 0.5, 0.35]) {
    const url = canvas.toDataURL('image/jpeg', q)
    if (url.length < 340_000) return url
  }
  return canvas.toDataURL('image/jpeg', 0.25)
}

export default function MediaCapture({ onDone, onSkip, skipLabel }: { onDone: (m: CapturedMedia) => void; onSkip: () => void; skipLabel?: string }) {
  const { lang } = useLanguage()
  const en = lang === 'en'
  const [mode, setMode] = useState<'choix' | 'filme' | 'edite' | 'envoi'>('choix')
  const [err, setErr] = useState<string | null>(null)
  const [videoBlob, setVideoBlob] = useState<Blob | null>(null)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [sec, setSec] = useState(0)
  const [duree, setDuree] = useState(0)
  const [texte, setTexte] = useState('')
  const [debut, setDebut] = useState(0)
  const [fin, setFin] = useState(0)
  const streamRef = useRef<MediaStream | null>(null)
  const recRef = useRef<MediaRecorder | null>(null)
  const liveRef = useRef<HTMLVideoElement | null>(null)
  const previewRef = useRef<HTMLVideoElement | null>(null)
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const stopAll = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    recRef.current?.state !== 'inactive' && recRef.current?.stop()
    streamRef.current?.getTracks().forEach((t) => t.stop())
    streamRef.current = null
  }
  useEffect(() => () => { stopAll(); if (videoUrl) URL.revokeObjectURL(videoUrl) }, []) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Importer (galerie) — le repli fiable qui marche partout ──
  const importer = async (file: File) => {
    setErr(null)
    if (file.type.startsWith('image/')) {
      try { onDone({ kind: 'photo', payload: await compressPhoto(file) }) }
      catch { setErr(en ? 'Photo unreadable' : 'Photo illisible') }
      return
    }
    if (file.type.startsWith('video/')) {
      if (file.size > 32 * 1024 * 1024) { setErr(en ? 'Video too large (30 s max)' : 'Vidéo trop lourde (30 s max)'); return }
      setVideoBlob(file)
      setVideoUrl(URL.createObjectURL(file))
      setMode('edite')
    }
  }

  // ── Filmer dans l'app (MediaRecorder) ──
  const filmer = async () => {
    setErr(null)
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' }, audio: true })
      streamRef.current = stream
      setMode('filme')
      setTimeout(() => { if (liveRef.current) { liveRef.current.srcObject = stream; liveRef.current.play().catch(() => {}) } }, 50)
      const mime = MediaRecorder.isTypeSupported('video/webm;codecs=vp9,opus') ? 'video/webm;codecs=vp9,opus'
        : MediaRecorder.isTypeSupported('video/webm') ? 'video/webm'
        : MediaRecorder.isTypeSupported('video/mp4') ? 'video/mp4' : ''
      const rec = new MediaRecorder(stream, mime ? { mimeType: mime, videoBitsPerSecond: 2_500_000 } : undefined)
      recRef.current = rec
      const chunks: Blob[] = []
      rec.ondataavailable = (e) => e.data.size && chunks.push(e.data)
      rec.onstop = () => {
        const blob = new Blob(chunks, { type: rec.mimeType || 'video/webm' })
        setVideoBlob(blob)
        setVideoUrl(URL.createObjectURL(blob))
        streamRef.current?.getTracks().forEach((t) => t.stop())
        setMode('edite')
      }
      rec.start()
      setSec(0)
      timerRef.current = setInterval(() => setSec((s) => {
        if (s + 1 >= MAX_SEC) { rec.state === 'recording' && rec.stop(); if (timerRef.current) clearInterval(timerRef.current) }
        return s + 1
      }), 1000)
    } catch {
      // Repli propre : caméra refusée / non dispo → capture native via input
      setErr(en ? 'Camera unavailable — use Import (it opens your camera too).' : 'Caméra indisponible — passe par Importer (il ouvre aussi ta caméra).')
    }
  }

  // ── Publier le média — upload DIRECT navigateur → Vercel Blob (client
  // upload signé par /api/media/upload) : pas de limite serverless 4,5 Mo ──
  const envoyer = async () => {
    if (!videoBlob) return
    setMode('envoi')
    try {
      const { upload } = await import('@vercel/blob/client')
      const type = videoBlob.type || 'video/webm'
      const ext = type.includes('webm') ? 'webm' : type.includes('quicktime') ? 'mov' : 'mp4'
      const blob = await upload(`spots/reel-${Date.now().toString(36)}.${ext}`, videoBlob, {
        access: 'public',
        handleUploadUrl: '/api/media/upload',
        contentType: type,
      })
      onDone({ kind: 'video', payload: blob.url, videoTexte: texte.trim() || undefined, videoDebut: debut > 0.2 ? debut : undefined, videoFin: fin > 0 && fin < duree - 0.2 ? fin : undefined })
      return
    } catch (ex) {
      const msg = String((ex as Error).message ?? '')
      if (msg.includes('MEDIA_OFF') || msg.includes('503')) {
        setErr(en ? 'Video hosting not enabled yet — a photo works right away!' : 'Hébergement vidéo pas encore activé — une photo marche tout de suite !')
      } else {
        setErr(en ? 'Upload failed — try again or add a photo.' : 'Envoi échoué — réessaie ou ajoute une photo.')
      }
    }
    setMode('edite')
  }

  const S = { btn: { minHeight: 56, borderRadius: 14, fontWeight: 800 as const, fontSize: 15.5, cursor: 'pointer' } }

  return (
    <div style={{ display: 'grid', gap: 10 }}>
      {mode === 'choix' && (
        <>
          <p style={{ margin: 0, color: 'rgba(253,250,243,0.75)', fontSize: 14.5, textAlign: 'center' }}>
            {en ? 'Add a photo or a short reel? (optional)' : 'Ajouter une photo ou un petit reel ? (optionnel)'}
          </p>
          <label style={{ ...S.btn, background: 'var(--or)', color: '#0b1a0f', border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            📷 {en ? 'Import (photo / video)' : 'Importer (photo / vidéo)'}
            <input type="file" accept="image/*,video/*" style={{ display: 'none' }}
              onChange={(e) => { const f = e.target.files?.[0]; if (f) importer(f) }} />
          </label>
          <button onClick={filmer} style={{ ...S.btn, background: 'rgba(255,255,255,0.07)', color: 'var(--creme)', border: '2px solid rgba(201,168,76,0.55)' }}>
            🎥 {en ? `Record here (${MAX_SEC} s max)` : `Filmer ici (${MAX_SEC} s max)`}
          </button>
          <button onClick={onSkip} style={{ minHeight: 46, background: 'none', border: 'none', color: 'rgba(253,250,243,0.6)', fontWeight: 700, fontSize: 14, cursor: 'pointer', textDecoration: 'underline' }}>
            {skipLabel ?? (en ? 'Skip' : 'Passer')}
          </button>
        </>
      )}

      {mode === 'filme' && (
        <>
          <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#000' }}>
            <video ref={liveRef} muted playsInline style={{ width: '100%', maxHeight: 380, objectFit: 'cover', display: 'block' }} />
            <span style={{ position: 'absolute', top: 10, left: 12, background: 'rgba(229,72,77,0.9)', color: '#fff', borderRadius: 999, padding: '4px 12px', fontWeight: 800, fontSize: 13 }}>
              ● {sec}s / {MAX_SEC}s
            </span>
          </div>
          <button onClick={() => { recRef.current?.state === 'recording' && recRef.current.stop(); if (timerRef.current) clearInterval(timerRef.current) }}
            style={{ ...S.btn, background: '#E5484D', color: '#fff', border: 'none' }}>
            ⏹ {en ? 'Stop' : 'Arrêter'}
          </button>
        </>
      )}

      {(mode === 'edite' || mode === 'envoi') && videoUrl && (
        <>
          <div style={{ position: 'relative', borderRadius: 16, overflow: 'hidden', background: '#000' }}>
            <video ref={previewRef} src={videoUrl} controls muted playsInline loop
              onLoadedMetadata={(e) => { const d = (e.target as HTMLVideoElement).duration || 0; setDuree(d); setFin(d) }}
              style={{ width: '100%', maxHeight: 380, objectFit: 'contain', display: 'block' }} />
            {texte && (
              <p style={{ position: 'absolute', bottom: 14, left: 12, right: 12, margin: 0, color: '#fff', fontWeight: 800, fontSize: 17, textShadow: '0 2px 8px rgba(0,0,0,0.8)', textAlign: 'center', pointerEvents: 'none' }}>{texte}</p>
            )}
          </div>
          <input value={texte} onChange={(e) => setTexte(e.target.value)} maxLength={80}
            placeholder={en ? 'On-screen caption (optional)' : 'Texte à l\'écran (optionnel)'}
            style={{ minHeight: 48, padding: '0 14px', borderRadius: 12, border: '1px solid rgba(201,168,76,0.35)', background: 'rgba(255,255,255,0.06)', color: '#fdfaf3', fontSize: 15 }} />
          {duree > 2 && (
            <div style={{ display: 'grid', gap: 4 }}>
              <label style={{ color: 'rgba(253,250,243,0.65)', fontSize: 13 }}>
                ✂️ {en ? 'Trim' : 'Rogner'} : {debut.toFixed(1)}s → {fin.toFixed(1)}s
              </label>
              <input type="range" min={0} max={Math.max(0, duree - 1)} step={0.1} value={debut}
                onChange={(e) => { const v = Number(e.target.value); setDebut(Math.min(v, fin - 1)); if (previewRef.current) previewRef.current.currentTime = v }}
                style={{ accentColor: '#C9A84C' }} />
              <input type="range" min={1} max={duree} step={0.1} value={fin}
                onChange={(e) => { const v = Number(e.target.value); setFin(Math.max(v, debut + 1)); if (previewRef.current) previewRef.current.currentTime = v }}
                style={{ accentColor: '#C9A84C' }} />
            </div>
          )}
          <p style={{ margin: 0, color: 'rgba(253,250,243,0.45)', fontSize: 12.5 }}>
            🎵 {en ? 'Royalty-free sounds library: coming soon (never copyrighted music).' : 'Bibliothèque de sons libres : bientôt (jamais de musique copyrightée).'}
          </p>
          <button onClick={envoyer} disabled={mode === 'envoi'} style={{ ...S.btn, background: 'var(--or)', color: '#0b1a0f', border: 'none', opacity: mode === 'envoi' ? 0.7 : 1 }}>
            {mode === 'envoi' ? (en ? 'Uploading…' : 'Envoi…') : `🚀 ${en ? 'Add this reel to my spot' : 'Ajouter ce reel à mon spot'}`}
          </button>
          <button onClick={onSkip} style={{ minHeight: 44, background: 'none', border: 'none', color: 'rgba(253,250,243,0.6)', fontWeight: 700, fontSize: 14, cursor: 'pointer', textDecoration: 'underline' }}>
            {en ? 'Skip' : 'Passer'}
          </button>
        </>
      )}

      {err && <p style={{ margin: 0, color: '#ffb4b4', fontSize: 13.5, fontWeight: 600 }}>{err}</p>}
    </div>
  )
}
