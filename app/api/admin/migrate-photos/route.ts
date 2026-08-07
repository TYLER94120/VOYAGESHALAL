import { NextResponse } from 'next/server'
import { getRedis } from '@/lib/pushStore'
import { rateLimit } from '@/lib/community'
import type { PrayerSpot } from '@/lib/villeTypes'

// Migration des photos historiques : les spots publiés AVANT l'activation de
// Vercel Blob portent leurs photos en data-URL base64 directement dans Redis,
// ce qui gonfle le HTML de /spots (4+ Mo) et ralentit tout le site. Cette
// route re-héberge chaque data-URL sur Blob et la remplace par son lien.
// Non destructif (même image, hébergement propre), idempotent (les liens déjà
// http sont ignorés), sans secret mais fortement rate-limité : un déclenchement
// étranger referait au pire un no-op.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'
export const maxDuration = 60

export async function POST() {
  const r = getRedis()
  if (!r) return NextResponse.json({ error: 'Base indisponible' }, { status: 503 })
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json({ error: 'MEDIA_OFF', message: 'Vercel Blob pas active.' }, { status: 503 })
  }
  if (!(await rateLimit('migrate-photos', 3, 3600))) {
    return NextResponse.json({ error: 'Deja lance recemment' }, { status: 429 })
  }
  const { put } = await import('@vercel/blob')
  const ids = ((await r.smembers('vh:spots:ids')) as string[]) ?? []
  let migrees = 0, deja = 0, erreurs = 0
  const details: string[] = []

  const upload = async (dataUrl: string, name: string): Promise<string | null> => {
    try {
      const m = dataUrl.match(/^data:([a-z0-9.+/-]+);base64,(.+)$/i)
      if (!m) return null
      const buf = Buffer.from(m[2], 'base64')
      const ext = m[1].includes('png') ? 'png' : m[1].includes('webp') ? 'webp' : 'jpg'
      const blob = await put(`spots/${name}.${ext}`, buf, {
        access: 'public', contentType: m[1], addRandomSuffix: true,
      })
      return blob.url
    } catch { return null }
  }

  for (const id of ids) {
    const spot = (await r.get(`vh:spot:${id}`)) as PrayerSpot | null
    if (!spot) continue
    let touche = false
    if (spot.photos?.length) {
      const nouvelles: string[] = []
      for (let i = 0; i < spot.photos.length; i++) {
        const p = spot.photos[i]
        if (p.startsWith('data:')) {
          const url = await upload(p, `migre-${id}-${i}`)
          if (url) { nouvelles.push(url); migrees++; touche = true } else { nouvelles.push(p); erreurs++ }
        } else { nouvelles.push(p); deja++ }
      }
      spot.photos = nouvelles
    }
    if (spot.photo?.startsWith('data:')) {
      const url = await upload(spot.photo, `migre-${id}-cover`)
      if (url) { spot.photo = url; migrees++; touche = true } else erreurs++
    }
    if (touche) { await r.set(`vh:spot:${id}`, spot); details.push(`${spot.nom} (${spot.villeNom})`) }
  }
  return NextResponse.json({ ok: true, migrees, dejaEnLigne: deja, erreurs, spots: details })
}
