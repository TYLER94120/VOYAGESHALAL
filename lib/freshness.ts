import cityCoords from '@/lib/cityCoords.json'

// ── Fraîcheur éditoriale ──
// Dernière révision globale RÉELLE du contenu : juillet 2026 (purge complète
// des données inventées, re-bake mosquées OSM, refonte des guides villes).
// Un article peut porter son propre `updatedAt` s'il a été retouché seul ;
// sinon on affiche cette révision de site quand elle est plus récente que la
// publication — jamais de date future ni arbitraire.
export const CONTENT_REVISED_AT = '2026-07-01'

export function updatedAtOf(p: { updatedAt?: string; publishedAt: string }): string {
  const candidates = [p.publishedAt, p.updatedAt, CONTENT_REVISED_AT].filter(Boolean) as string[]
  return candidates.sort().at(-1) as string
}

export function fmtMonthYear(iso: string, en: boolean): string {
  try { return new Date(iso).toLocaleDateString(en ? 'en-US' : 'fr-FR', { month: 'long', year: 'numeric' }) } catch { return '' }
}

// ── Ville d'un article ── : détection par slug (le plus long d'abord pour que
// « kuala-lumpur » gagne sur « kuala ») puis par nom dans le titre.
interface CityRef { slug: string; nom: string }
const CITIES = (cityCoords as CityRef[]).slice().sort((a, b) => b.slug.length - a.slug.length)

export function cityOfArticle(a: { slug: string; title: string; tags?: string[] }): CityRef | null {
  const hay = `${a.slug} ${a.title.toLowerCase()} ${(a.tags ?? []).join(' ').toLowerCase()}`
  for (const c of CITIES) {
    if (a.slug.includes(c.slug)) return c
    if (hay.includes(c.nom.toLowerCase())) return c
  }
  return null
}
