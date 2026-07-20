import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/community'

// Diagnostic délivrabilité email (Brevo TRANSACTIONNEL) : état du compte,
// expéditeurs validés, et envoi test vers l'adresse du propriétaire UNIQUEMENT
// (aucune donnée sensible exposée, aucun envoi arbitraire possible).
export const runtime = 'nodejs'

const OWNER_EMAIL = 'oulali.mohamed@gmail.com'

export async function GET() {
  if (!(await rateLimit('email-diag', 6, 3600))) return NextResponse.json({ error: 'rate' }, { status: 429 })
  const key = process.env.BREVO_API_KEY
  if (!key) return NextResponse.json({ ok: false, error: 'BREVO_API_KEY absente en production' })
  const H = { 'api-key': key, 'Content-Type': 'application/json' }
  const out: Record<string, unknown> = { ok: true, senderConfigured: process.env.BREVO_SENDER_EMAIL || 'contact@voyageshalal.fr (défaut)' }

  try {
    const acc = await fetch('https://api.brevo.com/v3/account', { headers: H })
    const j = acc.ok ? await acc.json() : { error: (await acc.text()).slice(0, 200) }
    out.account = acc.ok ? { email: j.email, plan: j.plan?.map?.((p: { type?: string; credits?: number }) => ({ type: p.type, credits: p.credits })) } : { status: acc.status, ...j }
  } catch (e) { out.account = { error: String(e).slice(0, 120) } }

  try {
    const sd = await fetch('https://api.brevo.com/v3/senders', { headers: H })
    const j = sd.ok ? await sd.json() : { error: (await sd.text()).slice(0, 200) }
    out.senders = sd.ok ? (j.senders ?? []).map((s: { email: string; active: boolean }) => ({ email: s.email, active: s.active })) : { status: sd.status, ...j }
  } catch (e) { out.senders = { error: String(e).slice(0, 120) } }

  try {
    const send = await fetch('https://api.brevo.com/v3/smtp/email', {
      method: 'POST', headers: H,
      body: JSON.stringify({
        sender: { name: 'VoyagesHalal', email: process.env.BREVO_SENDER_EMAIL || 'contact@voyageshalal.fr' },
        to: [{ email: OWNER_EMAIL }],
        subject: 'Test délivrabilité VoyagesHalal',
        textContent: 'Si vous lisez ceci, l\'envoi transactionnel Brevo fonctionne. — diagnostic automatique',
      }),
    })
    out.testSend = { status: send.status, body: (await send.text()).slice(0, 300) }
  } catch (e) { out.testSend = { error: String(e).slice(0, 120) } }

  return NextResponse.json(out)
}
