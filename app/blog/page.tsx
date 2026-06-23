import type { Metadata } from 'next'
import { blogPosts } from '@/lib/data'
import GuideCard from '@/components/ui/GuideCard'
import { buildMetadata } from '@/lib/seo'

export const metadata: Metadata = buildMetadata({
  title: 'Blog Voyage Halal — Articles, Conseils & Actualités',
  description:
    'Articles et conseils voyage halal : hôtels, restaurants, destinations, astuces pratiques. Tout pour voyager en accord avec vos valeurs islamiques.',
  path: '/blog',
})

export default function BlogPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-extrabold text-gray-900 mb-4">
          Blog Voyage Halal
        </h1>
        <p className="text-xl text-gray-500 max-w-2xl mx-auto">
          Articles, conseils et inspiration pour vos voyages halal.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogPosts.map((post) => (
          <GuideCard key={post.slug} guide={post} basePath="/blog" />
        ))}
      </div>
    </div>
  )
}
