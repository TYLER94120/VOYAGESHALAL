import { NextResponse } from 'next/server'
import cityCoords from '@/lib/cityCoords.json'

// GET /api/geocode?q=Berkane → { lat, lng, name }
// 1) Cherche d'abord dans nos 354 villes (instantané, fiable).
// 2) Sinon, géocode via Nominatim côté serveur (n'importe quel lieu du monde).

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

interface CityRef { slug: string; nom: string; lat: number; lng: number }
const CITIES = cityCoords as CityRef[]
const norm = (s: string) => s.normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()

export async function GET(req: Request) {
  const q = (new URL(req.url).searchParams.get('q') || '').trim()
  if (!q) return NextResponse.json({ error: 'q requis' }, { status: 400 })
  const nq = norm(q)

  // 1) Match dans nos villes
  let best: CityRef | null = null
  for (const c of CITIES) {
    const nc = norm(c.nom)
    if (nc === nq) { best = c; break }
    if (!best && (nc.startsWith(nq) || nq.startsWith(nc) || nc.includes(nq))) best = c
  }
  if (best) return NextResponse.json({ lat: best.lat, lng: best.lng, name: best.nom, source: 'city' })

  // 2) Nominatim (serveur, fiable, sans CORS)
  try {
    const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(q)
    const ac = new AbortController(); const timer = setTimeout(() => ac.abort(), 8000)
    const res = await fetch(url, { headers: { 'User-Agent': 'VoyagesHalal/1.0 (contact@voyageshalal.fr)', 'Accept-Language': 'fr,en' }, signal: ac.signal })
    clearTimeout(timer)
    if (res.ok) {
      const j = await res.json()
      if (Array.isArray(j) && j[0]?.lat) {
        return NextResponse.json({ lat: parseFloat(j[0].lat), lng: parseFloat(j[0].lon), name: j[0].display_name?.split(',')[0] || q, source: 'nominatim' })
      }
    }
  } catch { /* échec géocodage */ }
  return NextResponse.json({ error: 'introuvable' }, { status: 404 })
}
