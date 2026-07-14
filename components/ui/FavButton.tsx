'use client'

import { useEffect, useState } from 'react'
import { track } from '@vercel/analytics'
import { isFav, toggleFav, FAVS_EVENT, type Fav } from '@/lib/favorites'

// Bouton ❤️ favori (P3) — toggle localStorage, aucun layout shift (taille fixe).
export default function FavButton({ fav, size = 20 }: { fav: Omit<Fav, 'addedAt'>; size?: number }) {
  const [active, setActive] = useState(false)
  useEffect(() => {
    setActive(isFav(fav.id))
    const sync = () => setActive(isFav(fav.id))
    window.addEventListener(FAVS_EVENT, sync)
    return () => window.removeEventListener(FAVS_EVENT, sync)
  }, [fav.id])

  return (
    <button
      type="button"
      onClick={(e) => {
        e.preventDefault(); e.stopPropagation()
        const now = toggleFav(fav)
        setActive(now)
        if (now) { try { track('favorite', { kind: fav.kind }) } catch { /* best-effort */ } }
      }}
      aria-label={active ? 'Retirer des favoris' : 'Ajouter aux favoris'}
      aria-pressed={active}
      title={active ? 'Dans mon carnet' : 'Ajouter à mon carnet'}
      style={{
        width: size + 14, height: size + 14, fontSize: size, lineHeight: 1,
        background: 'transparent', border: 'none', cursor: 'pointer', padding: 0,
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        filter: active ? 'none' : 'grayscale(1) opacity(0.45)',
        transition: 'filter 0.15s',
      }}
    >
      ❤️
    </button>
  )
}
