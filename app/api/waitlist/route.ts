import { NextRequest, NextResponse } from 'next/server'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    if (!email || !isValidEmail(email)) {
      return NextResponse.json(
        { error: 'Adresse email invalide.' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // ── Option A : Formspree (ajoutez FORMSPREE_ENDPOINT dans .env) ──
    if (process.env.FORMSPREE_ENDPOINT) {
      const response = await fetch(process.env.FORMSPREE_ENDPOINT, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
        body: JSON.stringify({ email: normalizedEmail, source: 'waitlist-voyageshalal' }),
      })
      if (!response.ok) throw new Error('Erreur Formspree')
    }

    // ── Option B : Brevo (ajoutez BREVO_API_KEY + BREVO_LIST_ID dans .env) ──
    if (process.env.BREVO_API_KEY && process.env.BREVO_LIST_ID) {
      const response = await fetch('https://api.brevo.com/v3/contacts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'api-key': process.env.BREVO_API_KEY,
        },
        body: JSON.stringify({
          email: normalizedEmail,
          listIds: [parseInt(process.env.BREVO_LIST_ID)],
          updateEnabled: true,
        }),
      })
      if (!response.ok && response.status !== 204) {
        const err = await response.json()
        if (err.code !== 'duplicate_parameter') throw new Error('Erreur Brevo')
      }
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
