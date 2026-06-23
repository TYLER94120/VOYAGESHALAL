import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { guides, getGuideBySlug } from '@/lib/data'
import { buildMetadata, buildArticleSchema, buildBreadcrumbSchema } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'
import AppCTA from '@/components/ui/AppCTA'

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

  return buildMetadata({
    title: guide.title,
    description: guide.description,
    path: `/guides/${guide.slug}`,
    type: 'article',
  })
}

export default async function GuidePage({ params }: Props) {
  const { slug } = await params
  const guide = getGuideBySlug(slug)

  if (!guide) notFound()

  const articleSchema = buildArticleSchema({ ...guide, type: 'guide' })
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Guides', url: '/guides' },
    { name: guide.title, url: `/guides/${guide.slug}` },
  ])

  return (
    <>
      <JsonLd data={articleSchema} />
      <JsonLd data={breadcrumbSchema} />

      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <nav className="flex items-center gap-2 text-sm text-gray-400 mb-8">
          <Link href="/" className="hover:text-emerald-600">Accueil</Link>
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
              {new Date(guide.publishedAt).toLocaleDateString('fr-FR', {
                year: 'numeric', month: 'long', day: 'numeric',
              })}
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

        <div className="mt-16">
          <AppCTA />
        </div>
      </div>
    </>
  )
}
