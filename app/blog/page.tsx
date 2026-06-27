import type { Metadata } from 'next'
import Link from 'next/link'
import { blogPosts, guides } from '@/lib/data'
import { buildMetadata } from '@/lib/seo'
import IslamicPattern from '@/components/ui/IslamicPattern'
import BlogClient, { type BlogCard } from '@/components/blog/BlogClient'

export const metadata: Metadata = buildMetadata({
  title: 'Blog Voyage Halal — Conseils, Guides & Destinations 2026',
  description: 'Articles et conseils voyage halal : hôtels, restaurants, mosquées, destinations et astuces pratiques. Tout pour voyager en accord avec vos valeurs islamiques.',
  path: '/blog',
})

export default function BlogPage() {
  const articles: BlogCard[] = [
    ...guides.map((g) => ({
      slug: g.slug,
      href: `/guides/${g.slug}`,
      title: g.title,
      description: g.description,
      category: g.category,
      readTime: g.readTime,
      publishedAt: g.publishedAt,
      coverImage: g.coverImage,
    })),
    ...blogPosts.map((p) => ({
      slug: p.slug,
      href: `/blog/${p.slug}`,
      title: p.title,
      description: p.description,
      category: p.category,
      readTime: p.readTime,
      publishedAt: p.publishedAt,
      coverImage: p.coverImage,
    })),
  ].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  return (
    <main style={{ backgroundColor: '#fdfaf3' }} className="min-h-screen">
      {/* Hero compact nuit */}
      <section className="relative overflow-hidden px-6 sm:px-16 pt-14 pb-16 text-center" style={{ backgroundColor: '#0b1a0f' }}>
        <IslamicPattern opacity={0.07} />
        <div className="relative z-10">
          <p style={{ color: '#c9a84c' }} className="text-xs font-semibold uppercase tracking-[0.3em] mb-4">
            ✦ Ressources &amp; Guides
          </p>
          <h1
            className="text-4xl sm:text-5xl font-bold text-white leading-[1.05] mb-4"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 900 }}
          >
            Le journal du voyageur <span className="gold-em">musulman</span>
          </h1>
          <p className="text-white/60 max-w-xl mx-auto">
            {articles.length} guides pratiques, destinations et conseils islamiques pour préparer vos
            voyages halal.
          </p>
        </div>
      </section>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 px-6 sm:px-16 py-3">
        <nav className="flex items-center gap-2 text-xs text-gray-400 max-w-6xl mx-auto">
          <Link href="/" className="hover:text-[#1b4332]">Accueil</Link>
          <span>›</span>
          <span className="text-gray-700">Blog &amp; Guides</span>
        </nav>
      </div>

      <BlogClient articles={articles} />
    </main>
  )
}
