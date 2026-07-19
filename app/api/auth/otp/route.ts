import { NextRequest, NextResponse } from 'next/server'
import { getRedis } from '@/lib/pushStore'
import { rateLimit } from '@/lib/community'

// Login léger par email : envoie un code 6 chiffres (Brevo transactionnel).
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  let body: { email?: string }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }
  const email = String(body.email ?? '').toLowerCase().trim()
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return NextResponse.json({ error: 'Email invalide' }, { status: 400 })
  if (!(await rateLimit(`otp:${email}`, 5, 3600))) return NextResponse.json({ error: 'Trop de demandes — réessayez dans 1 h' }, { status: 429 })
  const r = getRedis()
  if (!r) return NextResponse.json({ error: 'Service indisponible' }, { status: 500 })
  const code = String(Math.floor(100000 + Math.random() * 900000))
  await r.set(`vh:otp:${email}`, code, { ex: 600 })
  if (process.env.BREVO_API_KEY) {
    try {
      await fetch('https://api.brevo.com/v3/smtp/email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'api-key': process.env.BREVO_API_KEY },
        body: JSON.stringify({
          sender: { name: 'VoyagesHalal', email: process.env.BREVO_SENDER_EMAIL || 'contact@voyageshalal.fr' },
          to: [{ email }],
          subject: `${code} — votre code VoyagesHalal`,
          htmlContent: `<div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;color:#0b1a0f;text-align:center"><h2>As-salāmu ʿalaykum 👋</h2><p>Votre code de connexion :</p><p style="font-size:36px;font-weight:900;letter-spacing:8px;color:#1b4332">${code}</p><p style="font-size:13px;color:#666">Valable 10 minutes. Si vous n'avez rien demandé, ignorez cet email.</p></div>`,
        }),
      })
    } catch (e) { console.error('[OTP] Brevo', e) }
  } else {
    console.log(`[OTP] ${email} → ${code}`)
  }
  return NextResponse.json({ ok: true })
}
