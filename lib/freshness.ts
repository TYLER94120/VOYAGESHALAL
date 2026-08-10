import cityCoords from '@/lib/cityCoords.json'

// ── Fraîcheur éditoriale ──
// Dernière révision globale RÉELLE du contenu : juillet 2026 (purge complète
// des données inventées, re-bake mosquées OSM, refonte des guides villes).
// Un article peut porter son propre `updatedAt` s'il a été retouché seul ;
// sinon on affiche cette révision de site quand elle est plus récente que la
// publication — jamais de date future ni arbitraire.
export const CONTENT_REVISED_AT = '2026-07-01'

// ── Dates de mise à jour RÉELLES ──
// Elles ne sont plus posées à la main : scripts/dates-contenu.mjs lit dans
// l'historique git la date du dernier commit ayant modifié CHAQUE bloc de
// contenu (git log -L, qui suit une plage de lignes — `git log -S` ne
// verrait que la création). Résultat dans data/dates-contenu.json.
//
// Une date affichée doit être vraie : « mis à jour en août » sur un texte
// qui n'a pas bougé depuis juin est un mensonge que Google finit par voir,
// et surtout que le lecteur constate en lisant.
import datesContenu from '@/data/dates-contenu.json'

const DATES = (datesContenu as { dates: Record<string, string> }).dates ?? {}

/** Date git réelle d'un contenu, ou null si le fichier n'a pas encore été généré. */
export function dateGit(slug?: string): string | null {
  if (!slug) return null
  return DATES[slug] ?? null
}

/** Date git réelle d'une fiche ville. */
export function dateGitVille(slug?: string): string | null {
  if (!slug) return null
  return DATES[`ville:${slug}`] ?? null
}

export function updatedAtOf(p: { updatedAt?: string; publishedAt: string; slug?: string }): string {
  // 1. La date git réelle prime — c'est la seule qu'on n'a pas choisie.
  const git = dateGit(p.slug)
  if (git) return [p.publishedAt, git].sort().at(-1) as string
  // 2. Repli : date propre à l'article, sinon révision de site.
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
