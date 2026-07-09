import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { countries, getCountryBySlug } from '@/lib/countriesData'
import { buildMetadata, buildBreadcrumbSchema, buildFAQSchema } from '@/lib/seo'
import JsonLd from '@/components/seo/JsonLd'
import EmailCapture from '@/components/ui/EmailCapture'
import { relatedForCountry } from '@/lib/relatedContent'
import { getDomainSEO } from '@/lib/domain'
import { countryEn, countryValueEn } from '@/lib/poiI18n'
import cityCoords from '@/lib/cityCoords.json'

interface Props {
  params: Promise<{ pays: string }>
}

export async function generateStaticParams() {
  return countries.map((c) => ({ pays: c.slug }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { pays } = await params
  const country = getCountryBySlug(pays)
  if (!country) return {}
  const { isEN } = await getDomainSEO()
  const nomEN = countryEn(country.name, true)
  return buildMetadata({
    title: isEN
      ? `Halal Travel in ${nomEN} — Complete Guide ${new Date().getFullYear()}`
      : `Voyage Halal en ${country.name} — Guide Complet ${new Date().getFullYear()}`,
    description: isEN
      ? `Halal travel guide for ${nomEN}: halal restaurants, mosques, hotels and practical tips for Muslim travelers.`
      : `${country.shortDescription} Restaurants halal, mosquées, hôtels et conseils pratiques pour voyager en ${country.name}.`,
    path: `/destinations/pays/${country.slug}`,
    type: 'article',
  })
}

function HalalScore({ score }: { score: number }) {
  return (
    <div className="flex items-center gap-1">
      {Array.from({ length: 5 }).map((_, i) => (
        <span key={i} className="text-lg" style={{ opacity: i < score ? 1 : 0.2 }}>🕌</span>
      ))}
    </div>
  )
}

function InfoBadge({ label, value, color }: { label: string; value: string; color: string }) {
  return (
    <div className="flex items-start gap-3 p-3 bg-white rounded-xl border border-gray-100">
      <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: color }} />
      <div>
        <div className="text-xs text-gray-400 mb-0.5">{label}</div>
        <div className="text-sm font-medium text-gray-800">{value}</div>
      </div>
    </div>
  )
}

export default async function CountryPage({ params }: Props) {
  const { pays } = await params
  const country = getCountryBySlug(pays)
  if (!country) notFound()
  const { isEN: en } = await getDomainSEO()
  const nomLoc = countryEn(country.name, en)

  const breadcrumbSchema = buildBreadcrumbSchema([
    { name: 'Accueil', url: '/' },
    { name: 'Destinations', url: '/destinations' },
    { name: country.name, url: `/destinations/pays/${country.slug}` },
  ])
  const faqSchema = en ? null : buildFAQSchema(country.faqs)

  // Toutes les villes de ce pays présentes dans nos 354 fiches (maillage complet),
  // pas seulement les villes curées (mainCities).
  const allCities = (cityCoords as { slug: string; nom: string; pays?: string }[])
    .filter((c) => (c.pays || '').toLowerCase() === country.name.toLowerCase())
    .sort((a, b) => a.nom.localeCompare(b.nom))
  const paysContent = relatedForCountry(en ? countryEn(country.name, true) : country.name, 6, en ? 'en' : 'fr')

  const alcoholColor = country.alcoholPolicy === 'Interdit' ? '#16a34a' : country.alcoholPolicy === 'Rare' ? '#ca8a04' : '#6b7280'
  const foodColor = country.halalFoodAvailability === 'Excellent' ? '#16a34a' : country.halalFoodAvailability === 'Bon' ? '#ca8a04' : '#dc2626'

  return (
    <>
      <JsonLd data={breadcrumbSchema} />
      {faqSchema && <JsonLd data={faqSchema} />}

      <main style={{ backgroundColor: '#faf8f4' }} className="min-h-screen">
        {/* Breadcrumb */}
        <div className="bg-white border-b border-gray-100 px-6 sm:px-12 py-3">
          <nav className="flex items-center gap-2 text-xs text-gray-400 max-w-6xl mx-auto">
            <Link href="/" className="hover:text-[#1a3a2a]">{en ? 'Home' : 'Accueil'}</Link>
            <span>›</span>
            <Link href="/destinations" className="hover:text-[#1a3a2a]">Destinations</Link>
            <span>›</span>
            <span className="text-gray-700">{country.name}</span>
          </nav>
        </div>

        {/* Hero */}
        <div className="relative h-[55vh] min-h-[380px] overflow-hidden">
          <Image
            src={country.coverImage}
            alt={en ? `Halal travel in ${nomLoc}` : `Voyage halal en ${country.name}`}
            fill
            sizes="100vw"
            className="object-cover"
            priority
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 px-6 sm:px-12 pb-10 max-w-6xl mx-auto w-full">
            <div className="flex items-center gap-3 mb-3">
              <span className="text-3xl">{country.flagEmoji}</span>
              <span style={{ color: '#c9a870' }} className="text-xs font-semibold uppercase tracking-[0.2em]">
                {country.continent}
              </span>
            </div>
            <h1
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-4 max-w-3xl"
              style={{ fontFamily: 'var(--font-playfair), Georgia, serif' }}
            >
              {en ? <>Halal Travel in {nomLoc}</> : <>Voyage Halal en {country.name}</>}
            </h1>
            <div className="flex items-center gap-4 mb-3">
              <HalalScore score={country.halalScore} />
              <span className="text-white/60 text-sm">{en ? 'Halal score' : 'Score halal'}</span>
            </div>
            {!en && <p className="text-white/70 text-base max-w-2xl leading-relaxed">{country.shortDescription}</p>}
          </div>
        </div>

        {/* Stats bar */}
        <div className="bg-white border-b border-gray-100">
          <div className="max-w-6xl mx-auto px-6 sm:px-12 py-4 flex flex-wrap gap-8 text-sm">
            <div><div className="font-bold text-base" style={{ color: '#1a3a2a' }}>{country.population}</div><div className="text-gray-400 text-xs mt-0.5">{en ? 'population' : 'habitants'}</div></div>
            <div><div className="font-bold text-base" style={{ color: '#1a3a2a' }}>{country.muslimPercentage}</div><div className="text-gray-400 text-xs mt-0.5">{en ? 'Muslim' : 'musulmans'}</div></div>
            <div><div className="font-bold text-base" style={{ color: '#1a3a2a' }}>{country.currency}</div><div className="text-gray-400 text-xs mt-0.5">{en ? 'currency' : 'monnaie'}</div></div>
            <div><div className="font-bold text-base" style={{ color: '#1a3a2a' }}>{country.bestTime.split('·')[0].trim()}</div><div className="text-gray-400 text-xs mt-0.5">{en ? 'best period' : 'meilleure période'}</div></div>
          </div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-8 py-10 lg:grid lg:grid-cols-3 lg:gap-12">
          {/* Main */}
          <div className="lg:col-span-2 space-y-10">
            {/* Description */}
            {!en && <section className="bg-white rounded-2xl p-6 border border-gray-100">
              <h2 className="font-bold text-lg mb-4" style={{ color: '#1a3a2a', fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                Pourquoi visiter la {country.name} ?
              </h2>
              <p className="text-gray-600 leading-relaxed">{country.description}</p>
            </section>}

            {/* Infos pratiques pour les musulmans */}
            <section>
              <h2 className="font-bold text-lg mb-4" style={{ color: '#1a3a2a', fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                {en ? '🕌 Practical info for Muslim travelers' : '🕌 Infos pratiques pour les voyageurs musulmans'}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <InfoBadge label={en ? 'Halal food' : 'Nourriture halal'} value={countryValueEn(country.halalFoodAvailability, en)} color={foodColor} />
                <InfoBadge label={en ? 'Alcohol' : 'Alcool'} value={countryValueEn(country.alcoholPolicy, en)} color={alcoholColor} />
                <InfoBadge label={en ? 'Mosques' : 'Présence de mosquées'} value={countryValueEn(country.mosquesPresence, en)} color="#1a3a2a" />
                {!en && <InfoBadge label="Code vestimentaire" value={country.dresscode.slice(0, 60) + (country.dresscode.length > 60 ? '…' : '')} color="#6b7280" />}
              </div>
            </section>

            {/* Villes principales */}
            <section>
              <h2 className="font-bold text-lg mb-5" style={{ color: '#1a3a2a', fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                {en ? <>🏙️ Cities to visit in {nomLoc}</> : <>🏙️ Villes à visiter en {country.name}</>}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {country.mainCities.map((city) => (
                  <div key={city.slug} className="bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#c9a870]/40 hover:shadow-sm transition-all">
                    <Link href={`/destinations/${city.slug}`} className="group">
                      <h3 className="font-bold text-gray-900 mb-2 group-hover:text-[#1a3a2a] transition-colors">{city.name}</h3>
                      {!en && <p className="text-sm text-gray-500 leading-relaxed">{city.description}</p>}
                      <span style={{ color: '#c9a870' }} className="text-xs font-medium mt-3 block">{en ? 'See the guide →' : 'Voir le guide →'}</span>
                    </Link>
                  </div>
                ))}
              </div>
            </section>

            {/* Toutes les villes du pays (maillage complet) + lien hôtels */}
            {allCities.length > 0 && (
              <section>
                <h2 className="font-bold text-lg mb-5" style={{ color: '#1a3a2a', fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                  {en ? <>🗺️ All our destinations in {nomLoc} ({allCities.length})</> : <>🗺️ Toutes nos destinations en {country.name} ({allCities.length})</>}
                </h2>
                <div className="flex flex-wrap gap-2">
                  {allCities.map((c) => (
                    <Link key={c.slug} href={`/destinations/${c.slug}`} className="text-sm font-medium px-3.5 py-2 rounded-full bg-white border border-gray-200 text-gray-700 hover:border-[#c9a870]/50 hover:text-[#1a3a2a] transition-colors">
                      {c.nom}
                    </Link>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap gap-3">
                  {allCities.slice(0, 6).map((c) => (
                    <Link key={c.slug} href={`/hotels/${c.slug}`} className="text-sm font-semibold text-[#1a3a2a] hover:underline">
                      🏨 Hôtels halal à {c.nom} →
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Guides & articles pour le pays (maillage interne) */}
            {paysContent.length > 0 && (
              <section>
                <h2 className="font-bold text-lg mb-5" style={{ color: '#1a3a2a', fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                  {en ? <>📚 Guides & articles for {nomLoc}</> : <>📚 Guides & articles pour la {country.name}</>}
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {paysContent.map((r) => (
                    <Link key={r.slug} href={`/${r.type === 'guide' ? 'guides' : 'blog'}/${r.slug}`} className="flex items-center justify-between gap-3 bg-white rounded-xl p-4 border border-gray-100 hover:border-[#c9a870]/40 transition-colors">
                      <span className="text-sm font-medium text-gray-800">{r.type === 'guide' ? '📗' : '📝'} {r.title}</span>
                      {r.readTime && <span className="text-xs text-gray-400 whitespace-nowrap">{r.readTime}</span>}
                    </Link>
                  ))}
                </div>
              </section>
            )}

            {/* Conseils pratiques (texte FR) — masqués sur le domaine EN */}
            {!en && <section>
              <h2 className="font-bold text-lg mb-4" style={{ color: '#1a3a2a', fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                💡 Conseils pratiques
              </h2>
              <div style={{ backgroundColor: '#f5f0e8' }} className="rounded-2xl p-6">
                <ul className="space-y-3">
                  {country.tips.map((tip, i) => (
                    <li key={i} className="flex gap-2.5 text-sm text-gray-700">
                      <span style={{ color: '#c9a870' }} className="shrink-0 font-bold">→</span>
                      <span>{tip}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>}

            {/* FAQ (texte FR) — masquée sur le domaine EN */}
            {!en && <section>
              <h2 className="font-bold text-lg mb-5" style={{ color: '#1a3a2a', fontFamily: 'var(--font-playfair), Georgia, serif' }}>
                Questions fréquentes
              </h2>
              <div className="space-y-4">
                {country.faqs.map((faq, i) => (
                  <div key={i} className="bg-white rounded-2xl p-5 border border-gray-100">
                    <h3 className="font-semibold text-gray-900 mb-2 text-sm">{faq.question}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </section>}
          </div>

          {/* Sidebar */}
          <aside className="mt-8 lg:mt-0 space-y-5">
            {/* Score halal */}
            <div style={{ backgroundColor: '#1a3a2a' }} className="rounded-2xl p-6">
              <h2 style={{ color: '#c9a870' }} className="font-bold text-xs uppercase tracking-[0.15em] mb-5">
                Score halal-friendly
              </h2>
              <div className="flex gap-1 mb-3">
                {Array.from({ length: 5 }).map((_, i) => (
                  <span key={i} className="text-2xl" style={{ opacity: i < country.halalScore ? 1 : 0.2 }}>🕌</span>
                ))}
              </div>
              <p className="text-white/60 text-xs leading-relaxed">
                {country.halalScore === 5 ? 'Destination halal-friendly parfaite — aucune difficulté pour les voyageurs musulmans.' :
                 country.halalScore === 4 ? 'Très bonne destination halal — quelques précautions mineures à prendre.' :
                 country.halalScore === 3 ? 'Destination accessible — prévoir de chercher les options halal à l\'avance.' :
                 'Destination nécessitant une bonne préparation pour voyager halal.'}
              </p>
            </div>

            {/* Infos */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h2 className="font-bold text-xs text-gray-500 uppercase tracking-[0.15em] mb-4">Informations</h2>
              <dl className="space-y-3 text-sm">
                <div><dt className="text-gray-400 text-xs mb-0.5">Capitale</dt><dd className="text-gray-800 font-medium">{country.capitalCity}</dd></div>
                <div><dt className="text-gray-400 text-xs mb-0.5">Population</dt><dd className="text-gray-800">{country.population}</dd></div>
                <div><dt className="text-gray-400 text-xs mb-0.5">% Musulmans</dt><dd className="text-gray-800">{country.muslimPercentage}</dd></div>
                <div><dt className="text-gray-400 text-xs mb-0.5">Monnaie</dt><dd className="text-gray-800">{country.currency}</dd></div>
                <div><dt className="text-gray-400 text-xs mb-0.5">Meilleure période</dt><dd className="text-gray-800">{country.bestTime}</dd></div>
              </dl>
            </div>

            {/* Tags */}
            <div className="bg-white rounded-2xl p-5 border border-gray-100">
              <h2 className="font-bold text-xs text-gray-500 uppercase tracking-[0.15em] mb-3">Points forts</h2>
              <div className="flex flex-wrap gap-2">
                {country.tags.map((tag) => (
                  <span key={tag} style={{ backgroundColor: '#f5f0e8', color: '#1a3a2a' }} className="text-xs font-medium px-3 py-1.5 rounded-full">
                    {tag}
                  </span>
                ))}
              </div>
            </div>

            {/* Guides liés */}
            {country.relatedGuides.length > 0 && (
              <div className="bg-white rounded-2xl p-5 border border-gray-100">
                <h2 className="font-bold text-xs text-gray-500 uppercase tracking-[0.15em] mb-3">Nos guides</h2>
                <ul className="space-y-3">
                  {country.relatedGuides.map((g) => (
                    <li key={g.slug}>
                      <Link href={`/${g.type === 'blog' ? 'blog' : 'guides'}/${g.slug}`} className="flex items-start gap-2 group">
                        <span style={{ color: '#c9a870' }} className="shrink-0 font-bold text-sm">→</span>
                        <span className="text-sm text-gray-700 group-hover:text-[#1a3a2a] transition-colors leading-snug">{g.title}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Email CTA */}
            <EmailCapture
              title={`Guide halal ${country.name} gratuit`}
              subtitle="Adresses, mosquées, conseils locaux — dans votre boîte mail."
              compact
              source={`pays-${country.slug}`}
            />

            {/* Search CTA */}
            <Link
              href={`/search?q=${encodeURIComponent(country.name)}`}
              style={{ backgroundColor: '#c9a870' }}
              className="flex items-center justify-center gap-2 text-[#1a3a2a] font-bold text-sm px-6 py-3.5 rounded-full hover:opacity-90 transition-opacity"
            >
              🔍 Rechercher en {country.name}
            </Link>
          </aside>
        </div>
      </main>
    </>
  )
}
