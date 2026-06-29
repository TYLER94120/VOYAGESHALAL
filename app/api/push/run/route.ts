import { NextResponse } from 'next/server'
import webpush from 'web-push'
import { listSubs, deleteSub, markSent, getRedis } from '@/lib/pushStore'
import { computePrayerTimes, PRAYER_KEYS } from '@/lib/prayerCalc'
import { PRAYER_LABELS } from '@/lib/adhan'

export const runtime = 'nodejs'

const WINDOW_MS = 90_000 // une prière est « due » si elle tombe dans les 90 s écoulées

function authorized(req: Request): boolean {
  const auth = req.headers.get('authorization')
  if (process.env.CRON_SECRET && auth === `Bearer ${process.env.CRON_SECRET}`) return true
  const key = new URL(req.url).searchParams.get('key')
  if (process.env.PUSH_CRON_SECRET && key === process.env.PUSH_CRON_SECRET) return true
  return false
}

export async function GET(req: Request) {
  if (!getRedis()) return NextResponse.json({ error: 'push_not_configured' }, { status: 503 })
  if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    return NextResponse.json({ error: 'vapid_missing' }, { status: 503 })
  }
  if (!authorized(req)) return NextResponse.json({ error: 'unauthorized' }, { status: 401 })

  webpush.setVapidDetails(
    'mailto:contact@voyageshalal.fr',
    process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  )

  const now = Date.now()
  const ymd = new Date().toISOString().slice(0, 10)
  const subs = await listSubs()
  let sent = 0

  for (const s of subs) {
    let times: Record<string, Date>
    try { times = computePrayerTimes(s.lat, s.lng, s.method, s.school) } catch { continue }
    for (const key of PRAYER_KEYS) {
      if (!s.prayers.includes(key)) continue
      const t = times[key].getTime()
      if (now >= t && now - t < WINDOW_MS) {
        if (!(await markSent(s.id, key, ymd))) continue // déjà envoyé
        const payload = JSON.stringify({
          title: `🕌 ${PRAYER_LABELS[key]} — c'est l'heure de la prière`,
          body: s.city ? `Prière à ${s.city}. Qu'Allah accepte. 🤲` : "Qu'Allah accepte votre prière. 🤲",
          url: '/horaires-priere',
          tag: `prayer-${key}`,
        })
        try {
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          await webpush.sendNotification(s.subscription as any, payload)
          sent++
        } catch (err: unknown) {
          const code = (err as { statusCode?: number })?.statusCode
          if (code === 404 || code === 410) await deleteSub(s.id) // abonnement expiré
        }
      }
    }
  }

  return NextResponse.json({ ok: true, checked: subs.length, sent })
}
