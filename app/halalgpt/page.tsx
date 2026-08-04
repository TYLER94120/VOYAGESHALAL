import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import AskHalalGPT from '@/components/halalgpt/AskHalalGPT'
import { HALAL_QA_EN } from '@/lib/halalgpt-en'
import { getDomainSEO, EN_URL } from '@/lib/domain'

export const metadata: Metadata = {
  title: 'Ask HalalGPT — Instant Answers to Every Halal Question',
  description:
    'Is E120 halal? Are Haribo halal? Ask HalalGPT and get a clear, instant answer about additives, products, restaurants, travel and Ramadan.',
  alternates: { canonical: `${EN_URL}/halalgpt` },
}

const POPULAR_SLUGS = [
  'is-e120-carmine-halal',
  'are-haribo-halal',
  'is-kfc-halal',
  'is-gelatine-halal',
  'is-mcdonalds-halal',
  'halal-meal-on-plane-moml',
]

export default async function AskHalalGPTPage() {
  const { isEN } = await getDomainSEO()
  // The French audience has its own dedicated site.
  if (!isEN) redirect('https://halalgpt.fr')

  const popular = POPULAR_SLUGS
    .map((slug) => HALAL_QA_EN.find((q) => q.slug === slug))
    .filter((q): q is NonNullable<typeof q> => Boolean(q))

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#0b1a0f' }}>
      <div className="max-w-3xl mx-auto px-4 pb-20">
        <section className="text-center pt-5 pb-4">
          <h1 className="font-serif text-2xl sm:text-4xl font-black text-white leading-tight">
            A halal <span style={{ color: '#c9a84c' }}>question</span>? A clear answer, instantly.
          </h1>
          <p className="mt-2 text-base text-white/70">
            Additives, products, restaurants, travel, Ramadan — HalalGPT answers in seconds.
          </p>
        </section>

        <AskHalalGPT />

        <section className="mt-14">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-white mb-5">
            Popular <span style={{ color: '#c9a84c' }}>questions</span>
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {popular.map((q) => (
              <Link
                key={q.slug}
                href={`/halal-questions/${q.slug}`}
                className="flex flex-col gap-1.5 p-4 rounded-2xl border text-white transition-colors hover:border-[#c9a84c]"
                style={{ backgroundColor: 'rgba(27,67,50,0.35)', borderColor: 'rgba(201,168,76,0.25)' }}
              >
                <span className="text-sm font-semibold" style={{ color: '#c9a84c' }}>
                  {q.verdict}
                </span>
                <span className="text-[17px] font-bold">{q.question}</span>
              </Link>
            ))}
          </div>
          <p className="mt-6 text-center">
            <Link href="/halal-questions" className="underline text-white/70 hover:text-white">
              Browse all {HALAL_QA_EN.length} halal questions →
            </Link>
          </p>
        </section>
      </div>
    </main>
  )
}
