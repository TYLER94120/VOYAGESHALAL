import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/community'

// Upload média des spots (vidéos courtes / photos) → Vercel Blob.
// Nécessite BLOB_READ_WRITE_TOKEN (Storage → Blob dans Vercel, 1 clic).
// Sans token : 503 honnête — le client propose alors le repli (photo
// compressée intégrée, ou lien).
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const MAX_BYTES = 32 * 1024 * 1024 // ~30 s de vidéo mobile
const TYPES = /^(video\/(webm|mp4|quicktime)|image\/(jpeg|png|webp))$/

export async function POST(req: Request) {
  const ip = (req.headers.get('x-forwarded-for') ?? 'anon').split(',')[0].trim()
  if (!(await rateLimit(`upload:${ip}`, 10, 3600))) {
    return NextResponse.json({ error: 'Trop d\'envois, réessaie dans une heure.' }, { status: 429 })
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'MEDIA_OFF', message: 'Hébergement média pas encore activé (Vercel Blob).' },
      { status: 503 },
    )
  }
  const type = req.headers.get('content-type') ?? ''
  if (!TYPES.test(type)) return NextResponse.json({ error: 'Format non accepté' }, { status: 415 })
  const len = Number(req.headers.get('content-length') ?? '0')
  if (!len || len > MAX_BYTES) return NextResponse.json({ error: 'Fichier trop lourd (max 32 Mo)' }, { status: 413 })
  const buf = Buffer.from(await req.arrayBuffer())
  if (buf.byteLength > MAX_BYTES) return NextResponse.json({ error: 'Fichier trop lourd (max 32 Mo)' }, { status: 413 })
  const { put } = await import('@vercel/blob')
  const ext = type.includes('webm') ? 'webm' : type.includes('quicktime') ? 'mov' : type.split('/')[1]
  const blob = await put(`spots/${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}.${ext}`, buf, {
    access: 'public', contentType: type,
  })
  return NextResponse.json({ ok: true, url: blob.url })
}
