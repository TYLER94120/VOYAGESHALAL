import { Redis } from '@upstash/redis'

export interface PushSub {
  id: string
  subscription: unknown // PushSubscription JSON
  lat: number
  lng: number
  method: number
  school: number
  prayers: string[] // prières activées
  city?: string
}

let client: Redis | null = null
export function getRedis(): Redis | null {
  if (client) return client
  if (!process.env.UPSTASH_REDIS_REST_URL || !process.env.UPSTASH_REDIS_REST_TOKEN) return null
  client = new Redis({
    url: process.env.UPSTASH_REDIS_REST_URL,
    token: process.env.UPSTASH_REDIS_REST_TOKEN,
  })
  return client
}

const IDS = 'vh:push:ids'
const subKey = (id: string) => `vh:push:sub:${id}`

export async function saveSub(sub: PushSub): Promise<boolean> {
  const r = getRedis(); if (!r) return false
  await r.set(subKey(sub.id), sub)
  await r.sadd(IDS, sub.id)
  return true
}

export async function deleteSub(id: string): Promise<void> {
  const r = getRedis(); if (!r) return
  await r.del(subKey(id))
  await r.srem(IDS, id)
}

export async function listSubs(): Promise<PushSub[]> {
  const r = getRedis(); if (!r) return []
  const ids = await r.smembers(IDS)
  if (!ids.length) return []
  const subs = await Promise.all(ids.map((id) => r.get<PushSub>(subKey(id))))
  return subs.filter((s): s is PushSub => !!s)
}

// Anti-doublon : marque un envoi (prière+jour) comme effectué, TTL 1 h. Renvoie true si à envoyer.
export async function markSent(id: string, prayer: string, ymd: string): Promise<boolean> {
  const r = getRedis(); if (!r) return true
  const res = await r.set(`vh:push:sent:${id}:${prayer}:${ymd}`, 1, { nx: true, ex: 3600 })
  return res === 'OK'
}
