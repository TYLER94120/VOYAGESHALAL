'use client'

import { useEffect, useState } from 'react'
import { track } from '@vercel/analytics'
import { isFav, toggleFav, FAVS_EVENT, type Fav } from '@/lib/favorites'

// ⭐ LE BOUTON « GARDER ».
//
// Un guide de voyage donne de l'information et le visiteur repart les mains
// vides. Ce qui le fait revenir, ce n'est pas nous : c'est ce qu'il a
// laissé ici. Une adresse gardée, c'est une raison de rouvrir le site sur
// place, dans la rue, sans réseau.
//
// Différence avec le ❤️ (FavButton) : celui-ci DIT ce qu'il fait. Un cœur
// gris, personne ne le touche. « ⭐ Garder » puis « ✓ Gardé », on comprend.
//
// Sans compte, sans inscription : tout vit dans localStorage (donc
// hors-ligne par construction).

export default function SaveButton({
  fav,
  en = false,
  variante = 'ligne',
}: {
  fav: Omit<Fav, 'addedAt'>
  en?: boolean
  /** 'ligne' = discret dans une liste · 'plein' = bouton large mis en avant */
  variante?: 'ligne' | 'plein'
}) {
  const [garde, setGarde] = useState(false)
  const [juste, setJuste] = useState(false) // confirmation courte après le clic

  useEffect(() => {
    setGarde(isFav(fav.id))
    const sync = () => setGarde(isFav(fav.id))
    window.addEventListener(FAVS_EVENT, sync)
    return () => window.removeEventListener(FAVS_EVENT, sync)
  }, [fav.id])

  const clic = (e: React.MouseEvent) => {
    e.preventDefault(); e.stopPropagation()
    const now = toggleFav(fav)
    setGarde(now)
    if (now) {
      setJuste(true)
      setTimeout(() => setJuste(false), 1800)
      try { track('favorite', { kind: fav.kind }) } catch { /* best-effort */ }
    }
  }

  const texte = juste
    ? (en ? '✓ Saved to your notebook' : '✓ Gardé dans ton carnet')
    : garde
      ? (en ? '✓ Saved' : '✓ Gardé')
      : (en ? '⭐ Save' : '⭐ Garder')

  const plein = variante === 'plein'
  return (
    <button
      type="button"
      onClick={clic}
      aria-pressed={garde}
      aria-label={garde ? (en ? 'Remove from my notebook' : 'Retirer de mon carnet') : (en ? 'Save to my notebook' : 'Garder dans mon carnet')}
      style={{
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 6,
        minHeight: 44, padding: plein ? '0 20px' : '0 14px',
        width: plein ? '100%' : undefined,
        borderRadius: 999, cursor: 'pointer',
        fontSize: plein ? 15 : 13, fontWeight: 800, whiteSpace: 'nowrap',
        border: garde ? '1.5px solid var(--or)' : '1.5px solid rgba(27,67,50,0.28)',
        background: garde ? 'rgba(201,168,76,0.16)' : (plein ? 'var(--foret)' : '#fff'),
        color: garde ? '#8A6D1E' : (plein ? 'var(--creme)' : 'var(--foret)'),
        transition: 'background .15s, color .15s, border-color .15s',
      }}
    >
      {texte}
    </button>
  )
}
