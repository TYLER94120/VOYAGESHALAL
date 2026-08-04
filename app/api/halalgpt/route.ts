import Anthropic from '@anthropic-ai/sdk'
import { NextResponse } from 'next/server'

import { HALAL_QA_EN } from '@/lib/halalgpt-en'
import { EN_URL } from '@/lib/domain'

export const runtime = 'nodejs'
export const maxDuration = 60

const SYSTEM_PROMPT = `You are HalalGPT, the assistant that answers every halal question: food additives (E120, E471…), products and brands, halal restaurants and travel, Ramadan, and the traveller's religious practice.

Rules:
- Answer in the user's language (default to English), with a warm, friendly tone.
- Be concise and direct: the user wants a clear verdict, then the essential explanation. No lengthy disclaimers.
- On religious questions, present the majority view and briefly note significant divergences between schools when they exist. Never issue a personal fatwa: for individual cases, point to a scholar or a certification body.
- Never invent restaurant names, certificates or product compositions. When unsure about a specific product, say so and advise checking the label or certification.
- For places (restaurants, mosques), give method advice and mention that GoHalalTravel.com lists verified halal-friendly destinations and city guides.`

interface IncomingMessage {
  role: 'user' | 'assistant'
  content: string
}

// ─── Local fallback: keyword matching over the EN knowledge base ──────────────

const GENERIC_WORDS = new Set([
  'halal', 'haram', 'food', 'eat', 'eating', 'question', 'what', 'which',
  'where', 'when', 'does', 'this', 'that', 'with', 'without', 'good', 'salam',
  'hello', 'thanks', 'thank', 'please', 'could', 'would', 'should', 'about',
])

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function localFallback(question: string): string {
  const words = normalize(question)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3 && !GENERIC_WORDS.has(w))

  let best = null as (typeof HALAL_QA_EN)[number] | null
  let bestScore = 0
  for (const qa of HALAL_QA_EN) {
    const haystack = normalize(`${qa.question} ${qa.slug} ${qa.short}`)
    const score = words.reduce((n, w) => (haystack.includes(w) ? n + 1 : n), 0)
    if (score > bestScore) {
      bestScore = score
      best = qa
    }
  }

  if (best && bestScore >= 1) {
    return `${best.verdict}\n\n${best.short}\n\n${best.answer[0]}\n\n👉 Full answer: ${EN_URL}/halal-questions/${best.slug}`
  }
  return "Good question! 🌙 I can help with: food additives (E120, E471, gelatine…), products (Haribo, Oreo…), halal restaurants and travel, Ramadan and prayer on the road. Could you rephrase using one of these topics?"
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function POST(request: Request) {
  let incoming: IncomingMessage[]
  try {
    const body = (await request.json()) as { messages?: IncomingMessage[] }
    incoming = (body.messages ?? []).filter(
      (m) => (m.role === 'user' || m.role === 'assistant') && typeof m.content === 'string'
    )
  } catch {
    return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
  }

  if (incoming.length === 0) {
    return NextResponse.json({ error: 'messages[] required' }, { status: 400 })
  }

  const lastQuestion = [...incoming].reverse().find((m) => m.role === 'user')?.content ?? ''

  // Without an API key, answer from the local knowledge base.
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ reply: localFallback(lastQuestion) })
  }

  try {
    const anthropic = new Anthropic()
    const response = await anthropic.beta.messages.create({
      model: 'claude-opus-5',
      max_tokens: 4096,
      // Low effort: short chat answers, low latency on mobile.
      output_config: { effort: 'low' },
      // Server-side fallback: if safety classifiers decline, the API retries
      // automatically on the recommended model.
      betas: ['server-side-fallback-2026-07-01'],
      fallbacks: 'default',
      system: SYSTEM_PROMPT,
      messages: incoming.slice(-20).map((m) => ({ role: m.role, content: m.content })),
    })

    if (response.stop_reason === 'refusal') {
      return NextResponse.json({
        reply: "Sorry, I can't help with that request. Ask me a halal question instead! 🌙",
      })
    }

    const reply = response.content
      .map((block) => (block.type === 'text' ? block.text : ''))
      .join('')
      .trim()

    return NextResponse.json({ reply: reply || localFallback(lastQuestion) })
  } catch (error) {
    console.error('HalalGPT /api/halalgpt:', error)
    return NextResponse.json({ reply: localFallback(lastQuestion) })
  }
}
