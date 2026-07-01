import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/pushStore'

export const runtime = 'nodejs'

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Tunnel de leads Omra & Hajj — revenu n°2 du business plan.
// Un prospect qualifié (dates, budget, ville de départ) est stocké dans Redis
// et transmis (Formspree si configuré) pour être vendu/routé vers une agence.
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, phone, departureCity, period, travelers, budget, type } = body

    if (!email || !isValidEmail(email)) {
      return NextResponse.json({ error: 'Adresse email invalide.' }, { status: 400 })
    }

    const lead = {
      email: String(email).toLowerCase().trim(),
      name: name || null,
      phone: phone || null,
      departureCity: departureCity || null,
      period: period || null,
      travelers: travelers || null,
      budget: budget || null,
      type: type || 'omra',
      date: new Date().toISOString(),
    }

    const redis = getRedis()
    if (redis) {
      try {
        await redis.sadd('vh:omra:emails', lead.email)
        await redis.lpush('vh:omra:leads', JSON.stringify(lead))
      } catch { /* best-effort */ }
    }

    if (process.env.FORMSPREE_OMRA_ENDPOINT) {
      try {
        await fetch(process.env.FORMSPREE_OMRA_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
          body: JSON.stringify(lead),
        })
      } catch { /* best-effort */ }
    }

    return NextResponse.json({ ok: true, message: 'Demande envoyée ! Une agence partenaire vous recontacte.' })
  } catch {
    return NextResponse.json({ error: 'Erreur serveur. Réessayez.' }, { status: 500 })
  }
}
