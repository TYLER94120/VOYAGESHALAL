import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { blogPosts, getBlogPostBySlug, guides } from '@/lib/data'
import { buildMetadata, buildArticleSchema, buildBreadcrumbSchema } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'
import EmailCapture from '@/components/ui/EmailCapture'
import { ShareButtons } from '@/components/ShareButtons'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return [
    ...blogPosts.map((p) => ({ slug: p.slug })),
    ...guides.map((g) => ({ slug: g.slug })),
  ]
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPostBySlug(slug) || guides.find((g) => g.slug === slug)
  if (!post) return {}

  return buildMetadata({
    title: post.title,
    description: post.description,
    path: `/blog/${post.slug}`,
    type: 'article',
  })
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = getBlogPostBySlug(slug) || guides.find((g) => g.slug === slug)

  if (!post) notFound()

  const articleSchema = buildArticleSchema({ ...post, type: 'blog' })
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Blog & Guides', url: '/blog' },
    { name: post.title, url: `/blog/${post.slug}` },
  ])

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />

      <main style={{ backgroundColor: '#faf8f4' }} className="min-h-screen">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-100 px-8 sm:px-16 py-3">
          <nav className="flex items-center gap-2 text-xs text-gray-400">
            <Link href="/" className="hover:text-[#1a3a2a]">Accueil</Link>
            <span>›</span>
            <Link href="/blog" className="hover:text-[#1a3a2a]">Blog & Guides</Link>
            <span>›</span>
            <span className="text-gray-700 truncate max-w-[200px]">{post.title}</span>
          </nav>
        </div>

        <div className="max-w-3xl mx-auto px-4 sm:px-8 py-12">
          {/* Header */}
          <header className="mb-10">
            <div className="flex items-center gap-3 mb-5">
              <span
                style={{ backgroundColor: '#f5f0e8', color: '#1a3a2a' }}
                className="text-[10px] font-bold uppercase tracking-widest px-3 py-1.5 rounded-full"
              >
                {post.category}
              </span>
              <span className="text-gray-400 text-xs">⏱ {post.readTime} de lecture</span>
              <span className="text-gray-300 text-xs">·</span>
              <span className="text-gray-400 text-xs">
                {new Date(post.publishedAt).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <h1
              className="text-3xl sm:text-4xl font-bold leading-tight mb-5"
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif', color: '#1a3a2a' }}
            >
              {post.title}
            </h1>
            <p className="text-gray-500 text-base leading-relaxed">{post.description}</p>
          </header>

          {/* Content */}
          <article
            className="prose prose-lg max-w-none text-gray-700 leading-relaxed"
            style={{ '--tw-prose-headings': '#1a3a2a', '--tw-prose-links': '#c9a870' } as React.CSSProperties}
            dangerouslySetInnerHTML={{ __html: post.content }}
          />

          <ShareButtons
            titre={post.title}
            url={`https://www.voyageshalal.fr/blog/${post.slug}`}
            description={post.description}
          />

          {/* Tags */}
          {post.tags.length > 0 && (
            <div className="mt-10 pt-8 border-t border-gray-200 flex flex-wrap gap-2">
              {post.tags.map((tag) => (
                <span
                  key={tag}
                  style={{ backgroundColor: '#f5f0e8', color: '#1a3a2a' }}
                  className="text-xs font-medium px-3 py-1.5 rounded-full"
                >
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Internal links — destinations */}
          <div className="mt-10 p-6 bg-white rounded-2xl border border-gray-100">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Destinations à explorer</p>
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
                  className="bg-[#faf8f4] border border-gray-200 hover:border-[#c9a870] text-gray-700 hover:text-[#1a3a2a] px-3 py-1.5 rounded-full text-xs font-medium transition-all"
                >
                  {d.label} →
                </Link>
              ))}
            </div>
          </div>
        </div>

        {/* Email capture */}
        <EmailCapture
          title="Recevez nos prochains guides en avant-première"
          subtitle="Destinations, conseils pratiques, mosquées et restaurants — dans votre boîte mail."
          source={`blog-${post.slug}`}
        />
      </main>
    </>
  )
}
