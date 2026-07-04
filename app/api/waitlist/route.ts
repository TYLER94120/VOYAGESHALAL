import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/pushStore'

export const runtime = 'nodejs'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, source, city } = body

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Adresse email invalide.' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // ── Stockage des leads dans Upstash Redis (ta base de données) ──
    const redis = getRedis()
    if (redis) {
      try {
        await redis.sadd('vh:leads:emails', normalizedEmail)
        await redis.set(`vh:lead:${normalizedEmail}`, {
          email: normalizedEmail,
          source: source || 'inconnu',
          city: city || null,
          date: new Date().toISOString(),
        })
      } catch { /* stockage best-effort */ }
    }

    // ── Option A : Formspree — best-effort (n'échoue JAMAIS l'inscription) ──
    if (process.env.FORMSPREE_ENDPOINT) {
      try {
        await fetch(process.env.FORMSPREE_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify({ email: normalizedEmail, source: 'waitlist-voyageshalal' }),
        })
      } catch (e) { console.error('[WAITLIST] Formspree', e) }
    }

    // ── Option B : Brevo — best-effort (le lead est déjà stocké dans Redis) ──
    if (process.env.BREVO_API_KEY && process.env.BREVO_LIST_ID) {
      try {
        const listId = parseInt(process.env.BREVO_LIST_ID, 10)
        const response = await fetch('https://api.brevo.com/v3/contacts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'api-key': process.env.BREVO_API_KEY },
          body: JSON.stringify({
            email: normalizedEmail,
            ...(Number.isNaN(listId) ? {} : { listIds: [listId] }),
            updateEnabled: true,
          }),
        })
        if (!response.ok && response.status !== 204) {
          const err = await response.json().catch(() => ({}))
          if (err.code !== 'duplicate_parameter') console.error('[WAITLIST] Brevo', response.status, err)
        }
      } catch (e) { console.error('[WAITLIST] Brevo', e) }
    }

    // ── Fallback : log console si aucun service configuré ──
    if (!process.env.FORMSPREE_ENDPOINT && !process.env.BREVO_API_KEY) {
      console.log(`[WAITLIST] Nouvel inscrit : ${normalizedEmail}`)
    }

    return NextResponse.json(
      { success: true, message: 'Inscription confirmée ! Nous vous contacterons en priorité.' },
      { status: 200 }
    )
  } catch (error) {
    console.error('[WAITLIST ERROR]', error)
    return NextResponse.json(
      { error: 'Une erreur est survenue. Réessayez dans quelques instants.' },
      { status: 500 }
    )
  }
}
