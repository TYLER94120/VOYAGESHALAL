import { NextResponse } from 'next/server'

import { HALAL_QA_EN } from '@/lib/halalgpt-en'

// Instant type-ahead suggestions — Edge runtime (near-zero cold start),
// costs ZERO AI calls.
export const runtime = 'edge'

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

interface Suggestion {
  slug: string
  question: string
  verdict: string
}

export function GET(request: Request) {
  const { searchParams } = new URL(request.url)
  const q = normalize(searchParams.get('q') ?? '').trim()
  if (q.length < 2) {
    return NextResponse.json({ suggestions: [] as Suggestion[] })
  }

  const words = q.split(/[^a-z0-9]+/).filter((w) => w.length >= 2)
  if (words.length === 0) {
    return NextResponse.json({ suggestions: [] as Suggestion[] })
  }

  const scored: { qa: (typeof HALAL_QA_EN)[number]; score: number }[] = []
  for (const qa of HALAL_QA_EN) {
    const haystack = normalize(`${qa.question} ${qa.slug}`)
    let score = 0
    let allMatch = true
    for (const w of words) {
      if (haystack.includes(w)) {
        score += w.length
      } else {
        allMatch = false
        break
      }
    }
    if (allMatch && score > 0) scored.push({ qa, score })
  }

  scored.sort((a, b) => b.score - a.score)
  const suggestions: Suggestion[] = scored.slice(0, 4).map(({ qa }) => ({
    slug: qa.slug,
    question: qa.question,
    verdict: qa.verdict,
  }))

  return NextResponse.json({ suggestions })
}
