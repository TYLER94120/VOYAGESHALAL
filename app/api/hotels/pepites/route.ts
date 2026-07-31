import { NextRequest, NextResponse } from 'next/server'
import { readFileSync } from 'fs'
import path from 'path'

// 🧞 Trouveur de pépites hôtel — matching HONNÊTE sur nos données :
// équipements femmes/famille VÉRIFIÉS via HalalBooking (listes officielles,
// champ _preuve), catégories et gammes de prix des fiches villes. Aucun score
// inventé : chaque raison affichée correspond à une donnée réelle.
// (Évolution prévue : re-classement par IA Claude si ANTHROPIC_API_KEY est
// configurée — le classement par règles reste le socle et le repli.)
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface Hotel {
  nom: string; categorie?: string; priceRange?: string
  piscineNonMixte?: boolean; plagePrivee?: boolean; sansAlcool?: boolean
  sourceEquipements?: string; halalBookingUrl?: string; halalFriendly?: boolean
  etoiles?: number; famille?: boolean
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const ville = (sp.get('ville') ?? '').toLowerCase().replace(/[^a-z0-9-]/g, '')
  const qui = sp.get('qui') ?? 'famille' // solo | couple | famille
  const prios = (sp.get('prios') ?? '').split(',').filter(Boolean) // piscine_femmes,plage,sans_alcool,budget
  if (!ville) return NextResponse.json({ error: 'ville requise' }, { status: 400 })

  let d: { nom?: string; hotels?: Hotel[] }
  try {
    d = JSON.parse(readFileSync(path.join(process.cwd(), 'data', 'villes', `${ville}.json`), 'utf8'))
  } catch {
    return NextResponse.json({ pepites: [], villeNom: ville, total: 0 })
  }
  const hotels = d.hotels ?? []

  const scored = hotels.map((h) => {
    let score = 0
    const raisons: string[] = []
    const verifie = h.sourceEquipements === 'halalbooking'
    if (verifie) { score += 30; raisons.push('Équipements vérifiés via HalalBooking (liste officielle)') }
    if (verifie && h.piscineNonMixte) { score += prios.includes('piscine_femmes') ? 40 : 15; raisons.push('Piscine non mixte (femmes)') }
    if (verifie && h.plagePrivee) { score += prios.includes('plage') ? 35 : 10; raisons.push('Plage privée') }
    if (h.sansAlcool) { score += prios.includes('sans_alcool') ? 30 : 10; raisons.push('Sans alcool (signalé)') }
    if (qui === 'famille') {
      if (/(resort|riad|appart|maison|villa)/i.test(h.categorie ?? '')) { score += 12; raisons.push('Adapté famille (type d\'hébergement)') }
      if (verifie && h.piscineNonMixte) score += 8
    }
    if (prios.includes('budget')) {
      if ((h.priceRange ?? '').length <= 2) { score += 18; raisons.push(`Gamme ${h.priceRange || '€€'} — bon rapport qualité/prix`) }
      else score -= 8
    }
    if (h.halalFriendly) { score += 6; raisons.push('Signalé halal-friendly') }
    return { nom: h.nom, categorie: h.categorie, priceRange: h.priceRange, score, raisons, verifie, halalBookingUrl: h.halalBookingUrl }
  })
    .filter((h) => h.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 5)

  return NextResponse.json(
    { villeNom: d.nom ?? ville, pepites: scored, total: hotels.length },
    { headers: { 'Cache-Control': 's-maxage=3600, stale-while-revalidate=86400' } },
  )
}
