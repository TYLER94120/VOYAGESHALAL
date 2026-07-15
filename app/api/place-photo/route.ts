import { NextRequest, NextResponse } from 'next/server'
import { createHash } from 'crypto'
import { getRedis } from '@/lib/pushStore'

// Vraies photos des lieux phares via Google Places (Find Place + Place Photos).
// GET /api/place-photo?q=<nom + ville> → { url, attribution } | { url: null }
//
// - Nécessite GOOGLE_PLACES_API_KEY (Vercel). Sans clé → { url: null } et le
//   front garde le dégradé par cuisine (aucune casse).
// - CACHE Redis 30 jours par requête normalisée → coût quasi nul en régime
//   établi (photos demandées uniquement pour les ~15 lieux curés par ville).
// - La clé API ne sort JAMAIS : on résout la redirection Google côté serveur
//   et on ne renvoie que l'URL finale (lh3.googleusercontent.com, sans clé).
// - Attribution Google restituée (exigence Places API).

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const TTL = 60 * 60 * 24 * 30 // 30 jours

interface Cached { url: string | null; attribution?: string }

export async function GET(request: NextRequest) {
  const q = (request.nextUrl.searchParams.get('q') || '').trim().slice(0, 120)
  if (q.length < 3) return NextResponse.json({ url: null }, { status: 400 })

  const key = `vh:photo:${createHash('sha1').update(q.toLowerCase()).digest('hex')}`
  const redis = getRedis()
  if (redis) {
    try {
      const cached = (await redis.get(key)) as Cached | null
      if (cached) return NextResponse.json(cached, { headers: { 'Cache-Control': 'public, max-age=86400' } })
    } catch { /* cache best-effort */ }
  }

  const apiKey = process.env.GOOGLE_PLACES_API_KEY
  if (!apiKey) return NextResponse.json({ url: null, reason: 'no_key' })

  let result: Cached = { url: null }
  try {
    // 1) Find Place → photo_reference (+ attributions)
    const findUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(q)}&inputtype=textquery&fields=photos&key=${apiKey}`
    const find = await fetch(findUrl)
    const fj = await find.json()
    const photo = fj?.candidates?.[0]?.photos?.[0]
    if (photo?.photo_reference) {
      const attribution = String(photo.html_attributions?.[0] ?? '').replace(/<[^>]+>/g, '') || 'Google Maps'
      // 2) Place Photo → on suit la redirection côté serveur (l'URL finale
      //    lh3.googleusercontent.com ne contient pas la clé)
      const photoUrl = `https://maps.googleapis.com/maps/api/place/photo?maxwidth=560&photo_reference=${photo.photo_reference}&key=${apiKey}`
      const res = await fetch(photoUrl, { redirect: 'manual' })
      const loc = res.headers.get('location')
      if (loc && loc.startsWith('https://')) result = { url: loc, attribution }
    }
  } catch { /* API indisponible → fallback dégradé côté front */ }

  if (redis) {
    try { await redis.set(key, result, { ex: TTL }) } catch { /* best-effort */ }
  }
  return NextResponse.json(result, { headers: { 'Cache-Control': 'public, max-age=86400' } })
}
