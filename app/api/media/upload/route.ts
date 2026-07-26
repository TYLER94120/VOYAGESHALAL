import { NextResponse } from 'next/server'
import { rateLimit } from '@/lib/community'

// Upload média des spots → Vercel Blob en DIRECT depuis le navigateur
// (client upload) : la fonction ne fait que signer le jeton — aucune limite
// des 4,5 Mo des fonctions serverless. Nécessite BLOB_READ_WRITE_TOKEN
// (Vercel → Storage → Create Blob store). Sans token : 503 honnête.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function POST(req: Request) {
  const ip = (req.headers.get('x-forwarded-for') ?? 'anon').split(',')[0].trim()
  if (!(await rateLimit(`upload:${ip}`, 20, 3600))) {
    return NextResponse.json({ error: 'Trop d\'envois, réessaie dans une heure.' }, { status: 429 })
  }
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      { error: 'MEDIA_OFF', message: 'Hébergement média pas encore activé (Vercel Blob).' },
      { status: 503 },
    )
  }
  const body = await req.json()
  const { handleUpload } = await import('@vercel/blob/client')
  try {
    const jsonResponse = await handleUpload({
      body,
      request: req,
      onBeforeGenerateToken: async () => ({
        allowedContentTypes: ['video/webm', 'video/mp4', 'video/quicktime', 'image/jpeg', 'image/png', 'image/webp'],
        maximumSizeInBytes: 64 * 1024 * 1024, // ~60 s de vidéo mobile compressée
        addRandomSuffix: true,
      }),
      onUploadCompleted: async () => { /* le client rattache l'URL via /api/community/enrich */ },
    })
    return NextResponse.json(jsonResponse)
  } catch (e) {
    return NextResponse.json({ error: String((e as Error).message ?? 'Upload refusé') }, { status: 400 })
  }
}
