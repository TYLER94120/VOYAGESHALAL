import type { MetadataRoute } from 'next'
import { readFileSync } from 'fs'
import path from 'path'
import { dateGitVille, CONTENT_REVISED_AT } from '@/lib/freshness'
import { estPubliable } from '@/app/prayer-room/[airport]/page'
import { guides, blogPosts } from '@/lib/data'
import { getDomainSEO, FR_URL, EN_URL } from '@/lib/domain'
import { HALAL_QA_EN } from '@/lib/halalgpt-en'
import { localizedHref } from '@/lib/slugs'
import cityCoords from '@/lib/cityCoords.json'
import { countries } from '@/lib/countriesData'
import { listAllSpots } from '@/lib/prayerSpots'

// Liste des 354 villes depuis un import STATIQUE (bundlé au build) plutôt que via
// readdirSync au runtime : sur Vercel le tracing de fichiers dynamiques est peu
// fiable et tronquait le sitemap. Même source que la page /destinations.
const CITY_SLUGS = (cityCoords as { slug: string }[]).map((c) => c.slug)

// ⚠️ 20 août : plus d'alternate sur les fiches villes ni sur l'accueil. Le
// sitemap doit dire la MÊME chose que les pages, et les pages ne déclarent
// plus ces paires — côté anglais la ville est une immersion en plein écran,
// côté français une page de préparation. Un sitemap qui contredit les
// balises de la page est un signal de moins, pas un de plus.
// Pages « chrome » présentes sur les deux domaines (avec slug localisé côté EN)
function pageAlternates(frPath: string) {
  return { languages: { fr: `${FR_URL}${frPath}`, en: `${EN_URL}${localizedHref(frPath, true)}` } }
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  // Chaque domaine génère son propre sitemap avec ses URLs (slugs EN sur le .com)
  const { siteUrl: SITE_URL, isEN } = await getDomainSEO()
  const L = (p: string) => `${SITE_URL}${localizedHref(p, isEN)}`
  const now = new Date()
  // Les pages outils et listes ne changent pas tous les jours : elles
  // portent la date de révision réelle du contenu (lib/freshness), pas
  // l'horodatage de la construction.
  const revision = new Date(CONTENT_REVISED_AT)

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, lastModified: now, changeFrequency: 'weekly', priority: 1 },
    { url: `${SITE_URL}/destinations`, lastModified: now, changeFrequency: 'weekly', priority: 0.9, alternates: { languages: { fr: `${FR_URL}/destinations`, en: `${EN_URL}/destinations` } } },
    { url: `${SITE_URL}/guides`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${SITE_URL}/blog`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: L('/application'), lastModified: revision, changeFrequency: 'monthly', priority: 0.7, alternates: pageAlternates('/application') },
    { url: L('/omra'), lastModified: revision, changeFrequency: 'monthly', priority: 0.7, alternates: pageAlternates('/omra') },
    { url: L('/planificateur'), lastModified: revision, changeFrequency: 'monthly', priority: 0.9, alternates: pageAlternates('/planificateur') },
    { url: L('/horaires-priere'), lastModified: now, changeFrequency: 'daily', priority: 0.9, alternates: pageAlternates('/horaires-priere') },
    { url: `${SITE_URL}/qibla`, lastModified: revision, changeFrequency: 'monthly', priority: 0.9, alternates: pageAlternates('/qibla') },
    { url: `${SITE_URL}/quiz`, lastModified: revision, changeFrequency: 'monthly', priority: 0.7, alternates: pageAlternates('/quiz') },
    { url: `${SITE_URL}/communaute`, lastModified: now, changeFrequency: 'daily', priority: 0.8 },
    { url: L('/mosquee-proche'), lastModified: revision, changeFrequency: 'monthly', priority: 0.9, alternates: pageAlternates('/mosquee-proche') },
    { url: L('/meteo'), lastModified: now, changeFrequency: 'daily', priority: 0.8, alternates: pageAlternates('/meteo') },
    { url: `${SITE_URL}/autour-de-moi`, lastModified: revision, changeFrequency: 'monthly', priority: 0.7 },
    { url: L('/a-propos'), lastModified: revision, changeFrequency: 'monthly', priority: 0.6, alternates: pageAlternates('/a-propos') },
    { url: `${SITE_URL}/contact`, lastModified: revision, changeFrequency: 'yearly', priority: 0.4 },
    { url: L('/confidentialite'), lastModified: revision, changeFrequency: 'yearly', priority: 0.3, alternates: pageAlternates('/confidentialite') },
    { url: L('/mentions-legales'), lastModified: revision, changeFrequency: 'yearly', priority: 0.3, alternates: pageAlternates('/mentions-legales') },
  ]

  // 📅 LA VRAIE DATE, PAS CELLE DU JOUR (chantier SEO du 20 août).
  // Toutes les URL portaient `now` : le sitemap annonçait chaque matin que
  // les 354 fiches venaient d'être modifiées. Google détecte ce mensonge et
  // cesse de faire confiance au fichier ENTIER — y compris aux dates
  // honnêtes. On sert la date git réelle de la fiche ; à défaut, la date de
  // révision du contenu, jamais la date du jour.
  const dateVille = (slug: string) => new Date(dateGitVille(slug) ?? CONTENT_REVISED_AT)

  // Les 354 fiches villes (même slug sur les deux domaines)
  const villePages: MetadataRoute.Sitemap = CITY_SLUGS.map((slug) => ({
    url: `${SITE_URL}/destinations/${slug}`,
    lastModified: dateVille(slug),
    changeFrequency: 'weekly',
    priority: 0.8,
  }))

  // Pages pays (Voyage halal en {pays}) — manquaient au sitemap
  const paysPages: MetadataRoute.Sitemap = countries.map((c) => ({
    url: `${SITE_URL}/destinations/pays/${c.slug}`,
    lastModified: new Date(CONTENT_REVISED_AT),
    changeFrequency: 'weekly',
    priority: 0.7,
    alternates: { languages: { fr: `${FR_URL}/destinations/pays/${c.slug}`, en: `${EN_URL}/destinations/pays/${c.slug}` } },
  }))

  // Pages « Hôtels halal à {ville} » — cible « hotel halal {ville} » (requêtes GSC)
  const hotelPages: MetadataRoute.Sitemap = CITY_SLUGS.map((slug) => ({
    url: `${SITE_URL}/hotels/${slug}`,
    lastModified: dateVille(slug),
    changeFrequency: 'weekly',
    priority: 0.6,
    alternates: { languages: { fr: `${FR_URL}/hotels/${slug}`, en: `${EN_URL}/hotels/${slug}` } },
  }))

  // ✈️ Pages « prayer room » d'aéroport : anglais uniquement, et seulement
  // celles qui ont un relevé — une URL au sitemap sans page derrière abîme
  // la confiance dans le fichier entier.
  let aeroportPages: MetadataRoute.Sitemap = []
  if (isEN) {
    try {
      const j = JSON.parse(readFileSync(path.join(process.cwd(), 'data', 'airports', 'prayer-rooms.json'), 'utf8'))
      aeroportPages = ((j.aeroports ?? []) as Parameters<typeof estPubliable>[0][]).filter(estPubliable).map((a) => ({
        url: `${SITE_URL}/prayer-room/${a.slug}`,
        lastModified: new Date(j.genere ?? CONTENT_REVISED_AT),
        changeFrequency: 'monthly' as const,
        priority: 0.8,
      }))
    } catch { /* pas de relevé : aucune URL */ }
  }

  // Guides : chaque domaine liste les guides rédigés dans SA langue
  const guidePages: MetadataRoute.Sitemap = guides
    .filter((g) => (g.lang ?? 'fr') === (isEN ? 'en' : 'fr'))
    .map((g) => ({
        url: `${SITE_URL}/guides/${g.slug}`,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
        lastModified: new Date(g.publishedAt),
      }))

  // Blog : chaque domaine ne liste que les articles rédigés dans sa langue
  const blogPages: MetadataRoute.Sitemap = blogPosts
    .filter((p) => (p.lang ?? 'fr') === (isEN ? 'en' : 'fr'))
    .map((p) => ({
      url: `${SITE_URL}/blog/${p.slug}`,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
      lastModified: new Date(p.publishedAt),
    }))

  // Coins prière (spots seed) : page index par ville + page détail par spot.
  // Source Redis (une seule source app+web) → indexable, cible « où prier à … ».
  let spotPages: MetadataRoute.Sitemap = []
  try {
    const spots = await listAllSpots()
    const villes = new Set(spots.map((s) => s.villeSlug))
    const indexPages = [...villes].map((v) => ({
      url: `${SITE_URL}/priere/${v}`, lastModified: now, changeFrequency: 'weekly' as const, priority: 0.6,
    }))
    const detailPages = spots.map((s) => ({
      url: `${SITE_URL}/priere/${s.villeSlug}/${s.slug}`,
      lastModified: new Date(s.createdAt), changeFrequency: 'monthly' as const, priority: 0.5,
    }))
    // Pages génériques /spot/<id> (tous types communautaires)
    const genericPages = spots.map((s) => ({
      url: `${SITE_URL}/spot/${s.id}`,
      lastModified: new Date(s.createdAt), changeFrequency: 'weekly' as const, priority: 0.5,
    }))
    // Guides vivants : indexés dès qu'une ville a 3 spots publiés
    const parVille = new Map<string, number>()
    for (const s of spots) if (s.status === 'published') parVille.set(s.villeSlug, (parVille.get(s.villeSlug) ?? 0) + 1)
    const guideVivantPages = [...parVille.entries()].filter(([, n]) => n >= 3).map(([v]) => ({
      url: `${SITE_URL}/guide-vivant/${v}`, lastModified: now, changeFrequency: 'daily' as const, priority: 0.7,
    }))
    spotPages = [...indexPages, ...detailPages, ...genericPages, ...guideVivantPages]
  } catch { /* Redis indisponible → pas de pages spots dans le sitemap */ }

  // Ask HalalGPT + questions halal (domaine EN uniquement — le public FR a halalgpt.fr)
  const halalgptPages: MetadataRoute.Sitemap = isEN
    ? [
        { url: `${SITE_URL}/halalgpt`, lastModified: now, changeFrequency: 'weekly', priority: 0.9 },
        { url: `${SITE_URL}/halal-questions`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
        ...HALAL_QA_EN.map((q) => ({
          url: `${SITE_URL}/halal-questions/${q.slug}`,
          lastModified: now,
          changeFrequency: 'weekly' as const,
          priority: 0.7,
        })),
      ]
    : []

  return [...staticPages, ...villePages, ...paysPages, ...hotelPages, ...aeroportPages, ...guidePages, ...blogPages, ...spotPages, ...halalgptPages]
}
