import { NextResponse } from 'next/server'

// voyageshalal.fr/adhan.mp3 → redirige vers l'adhan de La Mecque (même source
// que la fonction notification adhan du site). Le navigateur télécharge le MP3.
export const dynamic = 'force-static'
export function GET() {
  return NextResponse.redirect('https://www.islamcan.com/audio/adhan/azan2.mp3', 302)
}
