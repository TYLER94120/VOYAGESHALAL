import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { blogPosts, getBlogPostBySlug } from '@/lib/data'
import { buildMetadata, buildArticleSchema, buildBreadcrumbSchema } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'
import AppCTA from '@/components/ui/AppCTA'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return blogPosts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = getBlogPostBySlug(slug)
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
  const post = getBlogPostBySlug(slug)

  if (!post) notFound()

  const articleSchema = buildArticleSchema({ ...post, type: 'blog' })
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Blog', url: '/blog' },
    { name: post.title, url: `/blog/${post.slug}` },
  ])

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-emerald-600">Accueil</Link>
          <span>/</span>
          <Link href="/blog" className="hover:text-emerald-600">Blog</Link>
          <span>/</span>
          <span className="text-gray-700">{post.title}</span>
        </nav>

        <header className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <span className="bg-gray-100 text-gray-700 text-sm font-semibold px-3 py-1 rounded-full">
              {post.category}
            </span>
            <span className="text-gray-400 text-sm">⏱ {post.readTime}</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight mb-4">
            {post.title}
          </h1>
          <p className="text-xl text-gray-500">{post.description}</p>
        </header>

        <article className="prose prose-lg prose-emerald max-w-none">
          <p>{post.content}</p>
        </article>

        <div className="mt-16">
          <AppCTA />
        </div>
      </div>
    </>
  )
}
