import type { Metadata } from 'next'
import Link from 'next/link'
import { blogPosts, guides } from '@/lib/data'
import { buildMetadata } from '@/lib/seo'
import IslamicPattern from '@/components/ui/IslamicPattern'
import BlogClient, { type BlogCard } from '@/components/blog/BlogClient'
import { getDomainSEO } from '@/lib/domain'
import { updatedAtOf } from '@/lib/freshness'

export async function generateMetadata(): Promise<Metadata> {
  const { isEN } = await getDomainSEO()
  return buildMetadata({
    title: isEN
      ? 'Halal Travel Blog — Tips, Guides & Destinations 2026'
      : 'Blog Voyage Halal — Conseils, Guides & Destinations 2026',
    description: isEN
      ? 'Halal travel articles and tips: hotels, restaurants, mosques, destinations and practical advice for Muslim travelers worldwide.'
      : 'Articles et conseils voyage halal : hôtels, restaurants, mosquées, destinations et astuces pratiques. Tout pour voyager en accord avec vos valeurs islamiques.',
    path: '/blog',
  })
}

export default async function BlogPage() {
  const { isEN } = await getDomainSEO()
  // On n'affiche que les articles rédigés dans la langue du domaine.
  // Les guides existants sont en français → masqués sur le domaine EN.
  const domainPosts = blogPosts.filter((p) => (p.lang ?? 'fr') === (isEN ? 'en' : 'fr'))
  // Chaque domaine ne voit QUE ses guides : catégories FR sur le site FR,
  // EN sur gohalaltravel — aucun mélange de langues.
  const domainGuides = guides.filter((g) => (g.lang ?? 'fr') === (isEN ? 'en' : 'fr'))
  const articles: BlogCard[] = [
    ...domainGuides.map((g) => ({
      slug: g.slug,
      href: `/guides/${g.slug}`,
      title: g.title,
      description: g.description,
      category: g.category,
      readTime: g.readTime,
      publishedAt: g.publishedAt,
      updatedAt: updatedAtOf(g),
      coverImage: g.coverImage,
    })),
    ...domainPosts.map((p) => ({
      slug: p.slug,
      href: `/blog/${p.slug}`,
      title: p.title,
      description: p.description,
      category: p.category,
      readTime: p.readTime,
      publishedAt: p.publishedAt,
      updatedAt: updatedAtOf(p),
      coverImage: p.coverImage,
    })),
    // Tri par « récemment mis à jour » — le blog ne paraît jamais périmé
  ].sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime())

  return (
    <main style={{ backgroundColor: '#fdfaf3' }} className="min-h-screen">
      {/* Hero compact nuit */}
      <section className="relative overflow-hidden px-6 sm:px-16 pt-14 pb-16 text-center" style={{ backgroundColor: '#0b1a0f' }}>
        <IslamicPattern opacity={0.07} />
        <div className="relative z-10">
          <p style={{ color: '#c9a84c' }} className="text-xs font-semibold uppercase tracking-[0.3em] mb-4">
            ✦ {isEN ? 'Resources & Guides' : 'Ressources & Guides'}
          </p>
          <h1
            className="text-4xl sm:text-5xl font-bold text-white leading-[1.05] mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 900 }}
          >
            {isEN ? <>The Muslim traveler&apos;s <span className="gold-em">journal</span></> : <>Le journal du voyageur <span className="gold-em">musulman</span></>}
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            {isEN
              ? `${articles.length} practical guides, destinations and Islamic tips to plan your halal trips.`
              : `${articles.length} guides pratiques, destinations et conseils islamiques pour préparer vos voyages halal.`}
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 px-6 sm:px-16 py-3">
        <nav className="flex items-center gap-2 text-xs text-gray-400 max-w-6xl mx-auto">
          <Link href="/" className="hover:text-[#1b4332]">{isEN ? 'Home' : 'Accueil'}</Link>
          <span>›</span>
          <span className="text-gray-700">Blog &amp; Guides</span>
        </nav>
      </div>

      <BlogClient articles={articles} />
    </main>
  )
}
