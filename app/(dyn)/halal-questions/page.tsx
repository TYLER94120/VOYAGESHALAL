import type { Metadata } from 'next'
import Link from 'next/link'
import { redirect } from 'next/navigation'

import { HALAL_QA_CATEGORIES, HALAL_QA_EN } from '@/lib/halalgpt-en'
import { getDomainSEO, EN_URL } from '@/lib/domain'

export const metadata: Metadata = {
  title: 'Halal questions: clear answers on additives and products',
  description:
    'Is E120 halal? Is KFC halal in the UK? Is gelatine halal? Every halal question answered clearly, with scholarly nuances — by HalalGPT.',
  alternates: { canonical: `${EN_URL}/halal-questions` },
}

export default async function HalalQuestionsPage() {
  const { isEN } = await getDomainSEO()
  if (!isEN) redirect('https://halalgpt.fr/questions?utm_source=voyageshalal&utm_medium=passerelle&utm_campaign=redirection-questions')

  return (
    <main className="min-h-screen" style={{ backgroundColor: '#0b1a0f' }}>
      <div className="max-w-3xl mx-auto px-4 pt-12 pb-20">
        <h1 className="font-serif text-4xl font-black text-white">
          All halal <span style={{ color: '#c9a84c' }}>questions</span>
        </h1>
        <p className="mt-3 text-lg font-semibold" style={{ color: '#c9a84c' }}>
          {HALAL_QA_EN.length} questions, clear answers — and the AI for all the others.
        </p>

        {HALAL_QA_CATEGORIES.map((category) => {
          const items = HALAL_QA_EN.filter((q) => q.category === category)
          if (items.length === 0) return null
          return (
            <section key={category} className="mt-10">
              <h2 className="font-serif text-2xl font-bold mb-4" style={{ color: '#c9a84c' }}>
                {category}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {items.map((q) => (
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
            </section>
          )
        })}

        <div
          className="mt-12 p-6 rounded-2xl border text-center"
          style={{ backgroundColor: '#1b4332', borderColor: '#c9a84c' }}
        >
          <p className="text-white text-lg mb-4">Your question is not in the list?</p>
          <Link
            href="/halalgpt"
            className="inline-flex items-center justify-center min-h-[56px] px-7 rounded-2xl font-bold text-lg"
            style={{ backgroundColor: '#c9a84c', color: '#0b1a0f' }}
          >
            💬 Ask HalalGPT
          </Link>
        </div>
      </div>
    </main>
  )
}
