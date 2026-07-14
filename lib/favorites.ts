'use client'

// Favoris « Mon carnet » (P3) — collection personnelle persistante.
// Stockage localStorage (fonctionne hors-ligne, web + PWA = même stockage).
// Synchronisation optionnelle par email via /api/favorites (Redis) : le même
// identifiant (email) retrouve son carnet sur l'app ET le web.

export type FavKind = 'ville' | 'resto' | 'mosquee' | 'spot' | 'hotel' | 'activite'

export interface Fav {
  id: string        // identifiant stable (ex. `resto:istanbul:mikla`)
  kind: FavKind
  nom: string
  href: string      // lien interne vers la fiche
  villeNom?: string
  addedAt: string
}

const KEY = 'vh_favorites'
export const FAVS_EVENT = 'vh-favs-changed'

export function getFavs(): Fav[] {
  if (typeof window === 'undefined') return []
  try { return JSON.parse(localStorage.getItem(KEY) || '[]') } catch { return [] }
}

function write(favs: Fav[]) {
  try { localStorage.setItem(KEY, JSON.stringify(favs)) } catch { /* stockage plein/privé */ }
  window.dispatchEvent(new Event(FAVS_EVENT))
}

export function isFav(id: string): boolean {
  return getFavs().some((f) => f.id === id)
}

/** Ajoute ou retire ; renvoie true si l'élément est désormais favori. */
export function toggleFav(fav: Omit<Fav, 'addedAt'>): boolean {
  const favs = getFavs()
  const idx = favs.findIndex((f) => f.id === fav.id)
  if (idx >= 0) { favs.splice(idx, 1); write(favs); return false }
  write([...favs, { ...fav, addedAt: new Date().toISOString() }])
  return true
}

export function favId(kind: FavKind, ...parts: (string | undefined)[]): string {
  const norm = (s: string) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return [kind, ...parts.filter(Boolean).map((p) => norm(String(p)))].join(':')
}

/** Fusionne des favoris distants (sync email) avec les locaux. */
export function mergeFavs(remote: Fav[]): Fav[] {
  const local = getFavs()
  const ids = new Set(local.map((f) => f.id))
  const merged = [...local, ...remote.filter((f) => f && f.id && !ids.has(f.id))]
  write(merged)
  return merged
}
