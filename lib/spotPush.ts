// Push « 💎 une pépite vient d'être partagée près de toi » — le mécanisme de
// retour (modèle Waze). Serveur uniquement (web-push) : appelé en best-effort
// après la création d'un spot, JAMAIS bloquant pour la publication.
// Garde-fous : rayon 25 km, max 3 notifs spots/jour par appareil.
import webpush from 'web-push'
import { getRedis, listSubs } from '@/lib/pushStore'
import type { PrayerSpot } from '@/lib/villeTypes'
import { CATEGORIES } from '@/lib/community'

const RAYON_KM = 25
const MAX_PAR_JOUR = 3

function distKm(lat1: number, lng1: number, lat2: number, lng2: number): number {
  const p = Math.PI / 180
  const a = Math.sin(((lat2 - lat1) * p) / 2) ** 2 + Math.cos(lat1 * p) * Math.cos(lat2 * p) * Math.sin(((lng2 - lng1) * p) / 2) ** 2
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

export async function notifySpotNearby(spot: PrayerSpot): Promise<void> {
  try {
    if (!process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) return
    const r = getRedis(); if (!r) return
    webpush.setVapidDetails(
      process.env.VAPID_SUBJECT || 'mailto:contact@voyageshalal.fr',
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY,
      process.env.VAPID_PRIVATE_KEY,
    )
    const subs = (await listSubs()).filter((s) => distKm(s.lat, s.lng, spot.lat, spot.lng) <= RAYON_KM)
    const cat = CATEGORIES.find((c) => c.id === spot.categorie)
    const ymd = new Date().toISOString().slice(0, 10)
    const payload = JSON.stringify({
      title: '💎 Nouvelle pépite près de toi',
      body: `${cat?.icon ?? '📍'} ${spot.nom} — ${spot.villeNom}. Passe la confirmer pour la communauté 🤲`,
      tag: `spot-${spot.id}`,
      url: `/spot/${spot.id}`,
    })
    for (const s of subs.slice(0, 200)) {
      try {
        // Anti-spam : 3 notifs « spot » max par jour et par appareil
        const k = `vh:push:spotnotif:${s.id}:${ymd}`
        const n = await r.incr(k)
        if (n === 1) await r.expire(k, 172800)
        if (Number(n) > MAX_PAR_JOUR) continue
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        await webpush.sendNotification(s.subscription as any, payload)
      } catch { /* sub morte ou refusée — silencieux */ }
    }
  } catch { /* jamais bloquant */ }
}
