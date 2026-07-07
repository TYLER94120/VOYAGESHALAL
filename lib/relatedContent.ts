import { guides, blogPosts } from '@/lib/data'
import { countries } from '@/lib/countriesData'

// Relie une ville/un pays au contenu éditorial EXISTANT (guides + articles) pour
// renforcer le maillage interne — les pages riches (guides Marrakech, Dubaï…)
// remontent depuis les fiches villes, ce qui aide leur classement Google.
// Aucune donnée créée : on ne fait que matcher l'existant par nom/tags.

export interface RelatedLink { slug: string; title: string; type: 'guide' | 'blog'; readTime?: string }

const norm = (s: string) => (s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase()

function matches(haystack: string[], needles: string[]): boolean {
  const h = haystack.map(norm)
  return needles.some((n) => { const nn = norm(n); return nn.length > 2 && h.some((x) => x.includes(nn)) })
}

// Contenu lié à une ville : on cherche son nom OU son pays dans titres/tags.
export function relatedForCity(villeNom: string, pays?: string, limit = 4): RelatedLink[] {
  const needles = [villeNom, pays].filter(Boolean) as string[]
  const out: RelatedLink[] = []
  for (const g of guides) {
    if (matches([g.title, ...(g.tags || [])], needles)) out.push({ slug: g.slug, title: g.title, type: 'guide', readTime: g.readTime })
  }
  for (const b of blogPosts) {
    if ((b.lang ?? 'fr') !== 'fr') continue
    if (matches([b.title, ...(b.tags || [])], needles)) out.push({ slug: b.slug, title: b.title, type: 'blog', readTime: b.readTime })
  }
  // Dédup + priorité aux matches ville avant pays
  const seen = new Set<string>()
  const villeFirst = out.sort((a, b) => Number(matches([b.title], [villeNom])) - Number(matches([a.title], [villeNom])))
  return villeFirst.filter((r) => (seen.has(r.slug) ? false : seen.add(r.slug))).slice(0, limit)
}

// Slug de la page pays à partir du nom de pays d'une ville (ex. "Maroc" → "maroc").
const COUNTRY_BY_NAME = new Map(countries.map((c) => [norm(c.name), c.slug]))
export function countrySlugForName(pays?: string): string | null {
  if (!pays) return null
  return COUNTRY_BY_NAME.get(norm(pays)) ?? null
}
