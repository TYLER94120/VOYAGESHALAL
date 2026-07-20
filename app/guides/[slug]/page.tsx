import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { guides, getGuideBySlug } from '@/lib/data'
import { getDomainSEO } from '@/lib/domain'
import { buildMetadata, buildArticleSchema, buildBreadcrumbSchema, buildFAQSchema } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'
import AppCTA from '@/components/ui/AppCTA'
import EmailCapture from '@/components/ui/EmailCapture'
import { updatedAtOf, fmtMonthYear, cityOfArticle } from '@/lib/freshness'
import CommunityCTA from '@/components/blog/CommunityCTA'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return guides.map((g) => ({ slug: g.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const guide = getGuideBySlug(slug)
  if (!guide) return {}

  const base = buildMetadata({
    title: guide.title,
    description: guide.description,
    path: `/guides/${guide.slug}`,
    type: 'article',
  })
  // Un guide FR consulté sur le domaine EN (ou l'inverse) ne doit pas être indexé
  const { isEN } = await getDomainSEO()
  if ((guide.lang ?? 'fr') !== (isEN ? 'en' : 'fr')) {
    return { ...base, robots: { index: false, follow: true } }
  }
  return base
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params
  const guide = getGuideBySlug(slug)

  if (!guide) notFound()
  const { isEN } = await getDomainSEO()

  const articleSchema = buildArticleSchema({ ...guide, type: 'guide' })
  const faqSchema = guide.faq?.length ? buildFAQSchema(guide.faq.map((f) => ({ question: f.q, answer: f.a }))) : null
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: isEN ? 'Home' : 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: guide.title, url: `/guides/${guide.slug}` },
  ])

  return (
    <>
      <JsonLd data={articleSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}
      <JsonLd data={breadcrumbSchema} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-emerald-600">{isEN ? 'Home' : 'Accueil'}</Link>
          <span>/</span>
          <Link href="/guides" className="hover:text-emerald-600">Guides</Link>
          <span>/</span>
          <span className="text-gray-700">{guide.title}</span>
        </nav>

        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-emerald-100 text-emerald-700 text-sm font-semibold px-3 py-1 rounded-full">
              {guide.category}
            </span>
            <span className="text-gray-400 text-sm">⏱ {guide.readTime}</span>
            <span className="text-gray-400 text-sm">
              {isEN ? 'Published' : 'Publié'} {fmtMonthYear(guide.publishedAt, isEN)}
            </span>
            <span className="text-sm font-semibold" style={{ color: '#1a6b3c' }}>
              ✓ {isEN ? 'Updated' : 'Mis à jour'} {fmtMonthYear(updatedAtOf(guide), isEN)}
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
            {guide.title}
          </h1>
          <p className="text-xl text-gray-500">{guide.description}</p>
        </header>

        <article
          className="prose prose-lg prose-emerald max-w-none"
          dangerouslySetInnerHTML={{ __html: guide.content.trim() }}
        />

        {guide.faq?.length ? (
          <section className="mt-12">
            <h2 className="text-2xl font-bold mb-6" style={{ fontFamily: 'var(--font-playfair), Georgia, serif', color: '#1b4332' }}>
              {isEN ? 'Frequently asked questions' : 'Questions fréquentes'}
            </h2>
            <div className="space-y-4">
              {guide.faq.map((f, i) => (
                <details key={i} className="bg-white rounded-2xl border border-gray-100 p-5">
                  <summary className="font-semibold cursor-pointer text-gray-900">{f.q}</summary>
                  <p className="text-gray-600 text-sm leading-relaxed mt-3">{f.a}</p>
                </details>
              ))}
            </div>
          </section>
        ) : null}

        {/* P2 — Continuer votre exploration : autres guides de la même langue
            (pertinence par mots partagés du titre) + planificateur + destinations */}
        {(() => {
          const lang = guide.lang ?? 'fr'
          const words = new Set(guide.title.toLowerCase().split(/[^a-zà-ÿ]+/).filter((w) => w.length > 4))
          const related = guides
            .filter((g) => g.slug !== guide.slug && (g.lang ?? 'fr') === lang)
            .map((g) => ({ g, s: g.title.toLowerCase().split(/[^a-zà-ÿ]+/).filter((w) => words.has(w)).length }))
            .sort((a, b) => b.s - a.s)
            .slice(0, 3)
            .map((x) => x.g)
          return (
            <section className="mt-12">
              <h2 className="text-2xl font-bold mb-4" style={{ fontFamily: 'var(--font-playfair), Georgia, serif', color: '#1b4332' }}>
                {isEN ? 'Continue your exploration' : 'Continuer votre exploration'}
              </h2>
              <div className="space-y-2">
                {related.map((g) => (
                  <Link key={g.slug} href={`/guides/${g.slug}`} className="block bg-white rounded-2xl border border-gray-100 px-4 py-3 text-sm font-semibold hover:border-[#c9a870] transition-colors" style={{ color: '#1b4332' }}>
                    📗 {g.title}
                  </Link>
                ))}
                <Link href={isEN ? '/trip-planner' : '/planificateur'} className="block bg-white rounded-2xl border border-gray-100 px-4 py-3 text-sm font-semibold hover:border-[#c9a870] transition-colors" style={{ color: '#1b4332' }}>
                  🗺️ {isEN ? 'Build my halal itinerary day by day (free)' : 'Créer mon itinéraire halal jour par jour (gratuit)'}
                </Link>
                <Link href="/destinations" className="block bg-white rounded-2xl border border-gray-100 px-4 py-3 text-sm font-semibold hover:border-[#c9a870] transition-colors" style={{ color: '#1b4332' }}>
                  🌍 {isEN ? 'Browse 354 halal destinations' : 'Explorer les 354 destinations halal'}
                </Link>
              </div>
            </section>
          )
        })()}

        {/* Le blog nourrit la communauté — CTA sur CHAQUE guide */}
        <CommunityCTA en={isEN} city={cityOfArticle(guide)} />

        <div className="mt-12">
          <EmailCapture compact source="guide" />
        </div>

        <div className="mt-16">
          <AppCTA />
        </div>
      </div>
    </>
  )
}
