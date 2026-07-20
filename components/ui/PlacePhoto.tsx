'use client'

import { useEffect, useState } from 'react'
import IslamicPattern from '@/components/ui/IslamicPattern'

// Photo réelle d'un lieu (Google Places via /api/place-photo, cache Redis).
// Fallback élégant : dégradé + grand emoji tant que la photo n'existe pas —
// hauteur FIXE dans tous les cas (zéro layout shift). Attribution Google
// affichée quand une photo est servie (exigence Places API).

// Cache mémoire par session (évite de re-fetcher en re-render/navigation SPA)
const memo = new Map<string, { url: string | null; attribution?: string }>()

export default function PlacePhoto({
  query,
  height,
  gradient,
  emoji,
  emojiSize = 34,
  radius = 0,
  hideIfMissing = false,
}: {
  query: string
  height: number
  gradient: [string, string]
  emoji: string
  emojiSize?: number
  radius?: number
  /* true = AUCUN bloc image tant qu'aucune vraie photo (pas de faux visuel) */
  hideIfMissing?: boolean
}) {
  const [photo, setPhoto] = useState<{ url: string | null; attribution?: string } | null>(memo.get(query) ?? null)

  useEffect(() => {
    if (memo.has(query)) { setPhoto(memo.get(query)!); return }
    let cancelled = false
    fetch(`/api/place-photo?q=${encodeURIComponent(query)}`)
      .then((r) => (r.ok ? r.json() : { url: null }))
      .then((j) => { memo.set(query, j); if (!cancelled) setPhoto(j) })
      .catch(() => { memo.set(query, { url: null }); if (!cancelled) setPhoto({ url: null }) })
    return () => { cancelled = true }
  }, [query])

  if (hideIfMissing && !photo?.url) return null

  return (
    <div style={{ position: 'relative', height, borderRadius: radius, overflow: 'hidden', background: `linear-gradient(120deg, ${gradient[0]} 0%, ${gradient[1]} 130%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      {photo?.url ? (
        <>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={photo.url} alt="" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
          <span style={{ position: 'absolute', bottom: 4, right: 6, fontSize: 8.5, color: 'rgba(255,255,255,0.85)', background: 'rgba(0,0,0,0.35)', borderRadius: 6, padding: '1px 5px', maxWidth: '70%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            📷 {photo.attribution || 'Google'}
          </span>
        </>
      ) : (
        <>
          <IslamicPattern opacity={0.1} />
          <span style={{ position: 'relative', zIndex: 1, fontSize: emojiSize, filter: 'drop-shadow(0 3px 6px rgba(0,0,0,0.35))' }}>{emoji}</span>
        </>
      )}
    </div>
  )
}
