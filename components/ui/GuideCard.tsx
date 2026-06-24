import Link from 'next/link'
import Image from 'next/image'
import type { Guide } from '@/lib/types'

const categoryColors: Record<string, string> = {
  Pratique: 'bg-blue-50 text-blue-700',
  Destinations: 'bg-emerald-50 text-emerald-700',
  'Spiritualité': 'bg-purple-50 text-purple-700',
  'Hébergement': 'bg-orange-50 text-orange-700',
  Gastronomie: 'bg-red-50 text-red-700',
}

interface Props {
  guide: Guide
  basePath?: string
}

export default function GuideCard({ guide, basePath = '/guides' }: Props) {
  const colorClass = categoryColors[guide.category] || 'bg-gray-50 text-gray-700'

  return (
    <Link href={`${basePath}/${guide.slug}`} className="group block">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl hover:-translate-y-1 transition-all duration-300">
        <div className="relative h-44 overflow-hidden">
          <Image
            src={guide.coverImage}
            alt={guide.title}
            fill
            className="object-cover group-hover:scale-105 transition-transform duration-500"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
          <div className="absolute top-3 left-3">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${colorClass}`}>
              {guide.category}
            </span>
          </div>
        </div>

        <div className="p-5">
          <div className="flex items-center gap-2 text-xs text-gray-400 mb-2">
            <span>⏱ {guide.readTime} de lecture</span>
            <span>·</span>
            <span>
              {new Date(guide.publishedAt).toLocaleDateString('fr-FR', {
                year: 'numeric',
                month: 'long',
              })}
            </span>
          </div>
          <h3 className="font-bold text-gray-900 group-hover:text-emerald-600 transition-colors line-clamp-2">
            {guide.title}
          </h3>
          <p className="text-sm text-gray-500 mt-2 line-clamp-2">{guide.description}</p>

          <div className="mt-4 flex items-center text-emerald-600 text-sm font-medium">
            Lire le guide
            <svg
              className="w-4 h-4 ml-1 group-hover:translate-x-1 transition-transform"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </div>
        </div>
      </div>
    </Link>
  )
}
