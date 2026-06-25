import type { Metadata } from 'next'
import Link from 'next/link'
import { blogPosts } from '@/lib/data'
import { guides } from '@/lib/data'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Blog Voyage Halal — Conseils, Guides & Destinations 2026',
  description: 'Articles et conseils voyage halal : hôtels, restaurants, mosquées, destinations et astuces pratiques. Tout pour voyager en accord avec vos valeurs islamiques.',
  path: '/blog',
})

export default function BlogPage() {
  const allContent = [
    ...guides.map((g) => ({ ...g, contentType: 'guide' as const })),
    ...blogPosts.map((p) => ({ ...p, contentType: 'blog' as const })),
  ].sort((a, b) => new Date(b.publishedAt).getTime() - new Date(a.publishedAt).getTime())

  return (
    <main style={{ backgroundColor: '#faf8f4' }} className="min-h-screen">
      {/* Hero */}
      <section style={{ backgroundColor: '#1a3a2a' }} className="px-8 sm:px-16 pt-16 pb-20">
        <p style={{ color: '#c9a870' }} className="text-xs font-semibold uppercase tracking-[0.2em] mb-5">
          Blog & Guides
        </p>
        <h1
          className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-5 max-w-2xl"
          style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
        >
          Tout pour voyager halal sereinement
        </h1>
        <p className="text-white/50 text-base max-w-lg leading-relaxed">
          Guides pratiques, destinations, conseils islamiques et articles pour préparer vos voyages halal.
        </p>
      </section>

      {/* Breadcrumb */}
      <div className="bg-white border-b border-gray-100 px-8 sm:px-16 py-3">
        <nav className="flex items-center gap-2 text-xs text-gray-400">
          <Link href="/" className="hover:text-[#1a3a2a]">Accueil</Link>
          <span>›</span>
          <span className="text-gray-700">Blog & Guides</span>
        </nav>
      </div>

      {/* Grid */}
      <div className="max-w-5xl mx-auto px-4 sm:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {allContent.map((item) => {
            const href = item.contentType === 'guide' ? `/guides/${item.slug}` : `/blog/${item.slug}`
            return (
              <Link
                key={`${item.contentType}-${item.slug}`}
                href={href}
                className="group bg-white rounded-2xl overflow-hidden border border-gray-100 hover:border-[#c9a870]/40 hover:shadow-sm transition-all"
              >
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-3">
                    <span
                      style={{ backgroundColor: '#f5f0e8', color: '#1a3a2a' }}
                      className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full"
                    >
                      {item.category}
                    </span>
                    <span className="text-gray-400 text-xs">⏱ {item.readTime}</span>
                  </div>
                  <h2 className="font-bold text-gray-900 text-sm leading-snug mb-2 group-hover:text-[#1a3a2a] transition-colors line-clamp-2">
                    {item.title}
                  </h2>
                  <p className="text-xs text-gray-500 leading-relaxed line-clamp-2 mb-4">{item.description}</p>
                  <div className="flex items-center justify-between">
                    <span style={{ color: '#c9a870' }} className="text-xs font-medium">
                      Lire →
                    </span>
                    <span className="text-gray-300 text-xs">
                      {new Date(item.publishedAt).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>

        {/* Internal links — topic clusters */}
        <div className="mt-16 pt-10 border-t border-gray-200">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">Destinations populaires</p>
          <div className="flex flex-wrap gap-2">
            {[
              { slug: 'istanbul', label: 'Istanbul' },
              { slug: 'marrakech', label: 'Marrakech' },
              { slug: 'dubai', label: 'Dubaï' },
              { slug: 'kuala-lumpur', label: 'Kuala Lumpur' },
              { slug: 'le-caire', label: 'Le Caire' },
              { slug: 'medine', label: 'Médine' },
            ].map((d) => (
              <Link
                key={d.slug}
                href={`/destinations/${d.slug}`}
                className="bg-white border border-gray-200 hover:border-[#c9a870] text-gray-700 hover:text-[#1a3a2a] px-4 py-2 rounded-full text-sm font-medium transition-all"
              >
                Guide halal {d.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </main>
  )
}
