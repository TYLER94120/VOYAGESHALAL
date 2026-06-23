import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { destinations, getDestinationBySlug } from '@/lib/data'
import { buildMetadata, buildDestinationSchema, buildBreadcrumbSchema } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'
import AppCTA from '@/components/ui/AppCTA'
import Link from 'next/link'

interface Props {
  params: Promise<{ city: string }>
}

export async function generateStaticParams() {
  return destinations.map((d) => ({ city: d.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params
  const destination = getDestinationBySlug(city)
  if (!destination) return {}

  return buildMetadata({
    title: `Voyage Halal à ${destination.city} — Guide Complet ${new Date().getFullYear()}`,
    description: `Voyager halal à ${destination.city} : restaurants halal, mosquées, activités et conseils pratiques. Guide complet mis à jour ${new Date().getFullYear()}.`,
    path: `/destinations/${destination.slug}`,
    type: 'article',
  })
}

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className={i < Math.floor(rating) ? 'text-amber-400' : 'text-gray-200'}>
          ★
        </span>
      ))}
      <span className="text-sm text-gray-500 ml-1">{rating}/5</span>
    </div>
  )
}

export default async function DestinationPage({ params }: Props) {
  const { city } = await params
  const destination = getDestinationBySlug(city)

  if (!destination) notFound()

  const destinationSchema = buildDestinationSchema(destination)
  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Destinations', url: '/destinations' },
    { name: destination.city, url: `/destinations/${destination.slug}` },
  ])

  return (
    <>
      <JsonLd data={destinationSchema} />
      <JsonLd data={breadcrumbSchema} />

      <section className="bg-gradient-to-br from-emerald-900 to-teal-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <nav className="flex items-center gap-2 text-sm text-emerald-300 mb-6">
            <Link href="/" className="hover:text-white">Accueil</Link>
            <span>/</span>
            <Link href="/destinations" className="hover:text-white">Destinations</Link>
            <span>/</span>
            <span className="text-white">{destination.city}</span>
          </nav>

          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <span className="bg-white/10 text-white text-sm px-3 py-1 rounded-full">
                  {destination.country}
                </span>
                <span className="flex items-center gap-1 text-emerald-300 text-sm">
                  {Array.from({ length: destination.halalScore }).map((_, i) => (
                    <span key={i}>★</span>
                  ))}
                  Halal Score
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold mb-3">
                Voyage Halal à {destination.city}
              </h1>
              <p className="text-emerald-200 text-lg max-w-2xl">{destination.shortDescription}</p>
            </div>

            <div className="flex gap-6 text-center shrink-0">
              <div className="bg-white/10 rounded-2xl px-5 py-4">
                <div className="text-2xl font-bold">{destination.mosqueeCount.toLocaleString('fr-FR')}</div>
                <div className="text-xs text-emerald-300 mt-1">Mosquées</div>
              </div>
              <div className="bg-white/10 rounded-2xl px-5 py-4">
                <div className="text-2xl font-bold">{destination.restaurantHalalCount.toLocaleString('fr-FR')}+</div>
                <div className="text-xs text-emerald-300 mt-1">Restaurants halal</div>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2">
            {destination.tags.map((tag) => (
              <span key={tag} className="bg-white/10 text-white text-sm px-3 py-1 rounded-full">
                {tag}
              </span>
            ))}
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-12">
            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-4">
                Pourquoi {destination.city} est une destination halal idéale ?
              </h2>
              <p className="text-gray-600 leading-relaxed text-lg">{destination.description}</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                🍽 Restaurants halal à {destination.city}
              </h2>
              <div className="space-y-4">
                {destination.restaurants.map((restaurant) => (
                  <div key={restaurant.name} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-gray-900">{restaurant.name}</h3>
                        <p className="text-sm text-gray-400 mt-0.5">📍 {restaurant.address}</p>
                        <p className="text-gray-600 text-sm mt-2">{restaurant.description}</p>
                      </div>
                      <div className="shrink-0">
                        <StarRating rating={restaurant.rating} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                🕌 Mosquées à visiter à {destination.city}
              </h2>
              <div className="space-y-4">
                {destination.mosques.map((mosque) => (
                  <div key={mosque.name} className="bg-emerald-50 border border-emerald-100 rounded-2xl p-5">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <h3 className="font-bold text-gray-900">{mosque.name}</h3>
                        <p className="text-sm text-gray-400 mt-0.5">📍 {mosque.address}</p>
                        <p className="text-gray-600 text-sm mt-2">{mosque.description}</p>
                      </div>
                      <div className="shrink-0">
                        <StarRating rating={mosque.rating} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold text-gray-900 mb-6">
                🎯 Activités à {destination.city}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {destination.activities.map((activity) => (
                  <div key={activity.name} className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm">
                    <h3 className="font-bold text-gray-900">{activity.name}</h3>
                    <p className="text-gray-500 text-sm mt-1">{activity.description}</p>
                    <p className="text-emerald-600 text-xs font-medium mt-3">⏱ {activity.duration}</p>
                  </div>
                ))}
              </div>
            </section>
          </div>

          <aside className="space-y-6">
            <div className="bg-gray-50 rounded-2xl p-6 sticky top-24">
              <h3 className="font-bold text-gray-900 mb-4">Infos pratiques</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">Pays</span>
                  <span className="font-medium">{destination.country}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Population</span>
                  <span className="font-medium">{destination.population}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Meilleure période</span>
                  <span className="font-medium text-right max-w-[60%]">{destination.bestTime}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Score halal</span>
                  <div className="flex">
                    {Array.from({ length: destination.halalScore }).map((_, i) => (
                      <span key={i} className="text-emerald-500">★</span>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            <div className="bg-amber-50 border border-amber-100 rounded-2xl p-6">
              <h3 className="font-bold text-gray-900 mb-4">💡 Conseils pratiques</h3>
              <ul className="space-y-3">
                {destination.tips.map((tip, i) => (
                  <li key={i} className="flex gap-2 text-sm text-gray-600">
                    <span className="text-amber-500 shrink-0">→</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-emerald-600 text-white rounded-2xl p-6 text-center">
              <div className="text-3xl mb-2">📱</div>
              <h3 className="font-bold mb-2">Planifiez votre voyage</h3>
              <p className="text-emerald-200 text-sm mb-4">
                Qibla, prières et carnet de voyage dans votre poche.
              </p>
              <Link
                href="/application"
                className="block bg-white text-emerald-700 font-semibold py-2 rounded-full text-sm hover:bg-emerald-50 transition-colors"
              >
                Télécharger l&apos;app
              </Link>
            </div>
          </aside>
        </div>

        <div className="mt-16">
          <AppCTA />
        </div>
      </div>
    </>
  )
}
