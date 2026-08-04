import crypto from 'node:crypto'

import Anthropic from '@anthropic-ai/sdk'
import { Redis } from '@upstash/redis'
import { NextResponse } from 'next/server'

import { HALAL_QA_EN } from '@/lib/halalgpt-en'
import { EN_URL } from '@/lib/domain'

export const runtime = 'nodejs'
export const maxDuration = 60

// API cost saver — 3 tiers:
// 1. Strong match with a knowledge-base page (E-code or ≥3 precise words)
//    → instant local answer, ZERO API call.
// 2. Redis cache (30 days): a question someone already asked
//    → served from cache, ZERO API call.
// 3. Only then → Claude, and the answer joins the cache.
// Every first question is also counted in a Redis sorted set
// (halalgpt:en:questions) → the most asked questions become the next SEO pages.

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

// ─── Redis (optional — same env names as the rest of the site) ────────────────

let redisClient: Redis | null | undefined

function getRedis(): Redis | null {
  if (redisClient !== undefined) return redisClient
  const url = process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL
  const token = process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN
  redisClient = url && token ? new Redis({ url, token }) : null
  return redisClient
}

// ─── Normalisation & matching ─────────────────────────────────────────────────

const GENERIC_WORDS = new Set([
  'halal', 'haram', 'food', 'eat', 'eating', 'question', 'what', 'which',
  'where', 'when', 'does', 'this', 'that', 'with', 'without', 'good', 'salam',
  'hello', 'thanks', 'thank', 'please', 'could', 'would', 'should', 'about',
])

function normalize(text: string): string {
  return text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '')
}

function significantWords(question: string): string[] {
  return normalize(question)
    .split(/[^a-z0-9]+/)
    .filter((w) => w.length > 3 && !GENERIC_WORDS.has(w))
}

function formatCard(qa: (typeof HALAL_QA_EN)[number]): string {
  return `${qa.verdict}\n\n${qa.short}\n\n${qa.answer[0]}\n\n👉 Full answer: ${EN_URL}/halal-questions/${qa.slug}`
}

/** Tier 1: STRONG matches only (exact E-code, or ≥3 precise words). */
function strongLocalMatch(question: string): string | null {
  const q = normalize(question)

  const eCode = q.match(/\be\s?(\d{3}[a-z]?)\b/)
  if (eCode) {
    const hit = HALAL_QA_EN.find((qa) => qa.slug.includes(`e${eCode[1]}`))
    if (hit) return formatCard(hit)
  }

  const words = significantWords(question)
  let best: (typeof HALAL_QA_EN)[number] | null = null
  let bestScore = 0
  for (const qa of HALAL_QA_EN) {
    const haystack = normalize(`${qa.question} ${qa.slug} ${qa.short}`)
    const score = words.reduce((n, w) => (haystack.includes(w) ? n + 1 : n), 0)
    if (score > bestScore) {
      bestScore = score
      best = qa
    }
  }
  return best && bestScore >= 3 ? formatCard(best) : null
}

/** Fallback (no API key / errors): softer matching, or an honest answer. */
function localFallback(question: string): string {
  const words = significantWords(question)
  let best: (typeof HALAL_QA_EN)[number] | null = null
  let bestScore = 0
  for (const qa of HALAL_QA_EN) {
    const haystack = normalize(`${qa.question} ${qa.slug} ${qa.short}`)
    const score = words.reduce((n, w) => (haystack.includes(w) ? n + 1 : n), 0)
    if (score > bestScore) {
      bestScore = score
      best = qa
    }
  }
  if (best && bestScore >= 1) return formatCard(best)
  return "Good question! 🌙 I can help with: food additives (E120, E471, gelatine…), products (Haribo, Oreo…), halal restaurants and travel, Ramadan and prayer on the road. Could you rephrase using one of these topics?"
}

// ─── Cache & question mine ────────────────────────────────────────────────────

function cacheKey(question: string): string {
  const hash = crypto.createHash('sha1').update(normalize(question).trim()).digest('hex')
  return `halalgpt:en:cache:${hash}`
}

async function logQuestion(question: string): Promise<void> {
  const redis = getRedis()
  if (!redis) return
  try {
    await redis.zincrby('halalgpt:en:questions', 1, normalize(question).trim().slice(0, 140))
  } catch {
    /* telemetry must never break an answer */
  }
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
  // Only the FIRST question of a conversation is cached — follow-ups depend
  // on context and always go to the AI.
  const isFirstQuestion = incoming.filter((m) => m.role === 'user').length === 1

  if (isFirstQuestion) {
    await logQuestion(lastQuestion)

    const card = strongLocalMatch(lastQuestion)
    if (card) return NextResponse.json({ reply: card, source: 'card' })

    const redis = getRedis()
    if (redis) {
      try {
        const cached = await redis.get<string>(cacheKey(lastQuestion))
        if (cached) return NextResponse.json({ reply: cached, source: 'cache' })
      } catch {
        /* cache unavailable → continue to the AI */
      }
    }
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json({ reply: localFallback(lastQuestion) })
  }

  try {
    const anthropic = new Anthropic()
    const response = await anthropic.beta.messages.create({
      model: 'claude-opus-5',
      max_tokens: 4096,
      output_config: { effort: 'low' },
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

    if (reply && isFirstQuestion) {
      const redis = getRedis()
      if (redis) {
        try {
          await redis.set(cacheKey(lastQuestion), reply, { ex: 60 * 60 * 24 * 30 })
        } catch {
          /* cache unavailable → the answer still goes out */
        }
      }
    }

    return NextResponse.json({ reply: reply || localFallback(lastQuestion) })
  } catch (error) {
    console.error('HalalGPT /api/halalgpt:', error)
    return NextResponse.json({ reply: localFallback(lastQuestion) })
  }
}
