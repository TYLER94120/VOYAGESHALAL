import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'

import { getHalalQA, HALAL_QA_EN } from '@/lib/halalgpt-en'
import { getDomainSEO, EN_URL } from '@/lib/domain'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const qa = getHalalQA(slug)
  if (!qa) return {}
  return {
    title: qa.question,
    description: qa.short,
    alternates: { canonical: `${EN_URL}/halal-questions/${qa.slug}` },
    openGraph: { title: qa.question, description: qa.short, url: `${EN_URL}/halal-questions/${qa.slug}` },
  }
}

export default async function HalalQuestionPage({ params }: Props) {
  const { isEN } = await getDomainSEO()
  if (!isEN) redirect('https://halalgpt.fr/questions')

  const { slug } = await params
  const qa = getHalalQA(slug)
  if (!qa) notFound()

  const related = qa.related
    .map((s) => getHalalQA(s))
    .filter((q): q is NonNullable<typeof q> => Boolean(q))

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: qa.question,
        acceptedAnswer: { '@type': 'Answer', text: `${qa.short} ${qa.answer.join(' ')}` },
      },
    ],
  }

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#0b1a0f' }}>
      <article className="max-w-3xl mx-auto px-4 pt-10 pb-20">
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

        <p className="text-sm text-white/50 mb-4">
          <Link href="/" className="hover:text-white">Home</Link> ›{' '}
          <Link href="/halal-questions" className="hover:text-white">Halal questions</Link> › {qa.category}
        </p>

        <h1 className="font-serif text-3xl sm:text-4xl font-extrabold text-white leading-tight">
          {qa.question}
        </h1>

        <div
          className="inline-block mt-5 px-5 py-3 rounded-full border font-bold text-white text-lg"
          style={{ backgroundColor: '#1b4332', borderColor: '#c9a84c' }}
        >
          {qa.verdict}
        </div>

        <p className="mt-5 text-lg font-semibold" style={{ color: '#c9a84c' }}>
          {qa.short}
        </p>

        <div className="mt-2">
          {qa.answer.map((paragraph, i) => (
            <p key={i} className="mt-4 text-[17px] leading-relaxed text-white/90">
              {paragraph}
            </p>
          ))}
        </div>

        <div
          className="mt-10 p-6 rounded-2xl border text-center"
          style={{ backgroundColor: '#1b4332', borderColor: '#c9a84c' }}
        >
          <p className="text-white text-lg mb-4">Another halal question? The AI answers in seconds 👇</p>
          <Link
            href="/halalgpt"
            className="inline-flex items-center justify-center min-h-[56px] px-7 rounded-2xl font-bold text-lg"
            style={{ backgroundColor: '#c9a84c', color: '#0b1a0f' }}
          >
            💬 Ask HalalGPT
          </Link>
          {qa.category === 'Practice' && (
            <p className="mt-4 text-white/70 text-base">
              🗺 Planning a trip? Explore our{' '}
              <Link href="/destinations" className="underline font-bold" style={{ color: '#c9a84c' }}>
                halal destination guides
              </Link>
            </p>
          )}
        </div>

        {related.length > 0 && (
          <section className="mt-10">
            <h2 className="font-serif text-2xl font-bold text-white mb-4">Related questions</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {related.map((r) => (
                <Link
                  key={r.slug}
                  href={`/halal-questions/${r.slug}`}
                  className="flex flex-col gap-1.5 p-4 rounded-2xl border text-white transition-colors hover:border-[#c9a84c]"
                  style={{ backgroundColor: 'rgba(27,67,50,0.35)', borderColor: 'rgba(201,168,76,0.25)' }}
                >
                  <span className="text-sm font-semibold" style={{ color: '#c9a84c' }}>
                    {r.verdict}
                  </span>
                  <span className="text-[17px] font-bold">{r.question}</span>
                </Link>
              ))}
            </div>
          </section>
        )}

        <p className="mt-10 pt-5 border-t text-sm text-white/50" style={{ borderColor: 'rgba(201,168,76,0.25)' }}>
          HalalGPT presents widespread religious views for information, with their divergences where
          they exist. For a personal situation, consult a scholar or a certification body. Product
          recipes change: always check the label.
        </p>
      </article>
    </main>
  )
}
