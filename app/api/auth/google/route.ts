import { NextRequest, NextResponse } from 'next/server'
import { findOrCreateUser, createSession, rateLimit } from '@/lib/community'

// « Continuer avec Google » : le client envoie l'ID token de Google Identity
// Services ; on le vérifie côté serveur (audience + email vérifié) puis on
// crée/retrouve le compte communauté — même session que le login email.
export const runtime = 'nodejs'

export async function POST(request: NextRequest) {
  const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID
  if (!clientId) return NextResponse.json({ error: 'Connexion Google non configurée' }, { status: 503 })
  let body: { credential?: string; pseudo?: string }
  try { body = await request.json() } catch { return NextResponse.json({ error: 'JSON invalide' }, { status: 400 }) }
  const credential = String(body.credential ?? '')
  if (!credential) return NextResponse.json({ error: 'Jeton manquant' }, { status: 400 })
  const ip = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'anon'
  if (!(await rateLimit(`google:${ip}`, 20, 3600))) return NextResponse.json({ error: 'Trop d\'essais' }, { status: 429 })

  let info: { aud?: string; email?: string; email_verified?: string; given_name?: string; exp?: string }
  try {
    const resp = await fetch(`https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`)
    if (!resp.ok) return NextResponse.json({ error: 'Jeton Google invalide' }, { status: 401 })
    info = await resp.json()
  } catch {
    return NextResponse.json({ error: 'Vérification Google indisponible — réessayez' }, { status: 502 })
  }
  if (info.aud !== clientId || info.email_verified !== 'true' || !info.email) {
    return NextResponse.json({ error: 'Jeton Google invalide' }, { status: 401 })
  }

  const user = await findOrCreateUser(info.email, String(body.pseudo ?? info.given_name ?? ''))
  if (!user) return NextResponse.json({ error: 'Service indisponible' }, { status: 500 })
  const token = await createSession(user.id)
  return NextResponse.json({ ok: true, token, user: { id: user.id, pseudo: user.pseudo, points: user.points, badges: user.badges } })
}
