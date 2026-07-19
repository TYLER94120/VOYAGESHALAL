import { NextRequest, NextResponse } from 'next/server'
import { getUserByPseudo, impactOf, niveauOf } from '@/lib/community'
import { listAllSpots } from '@/lib/prayerSpots'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  const pseudo = request.nextUrl.searchParams.get('pseudo') || ''
  const user = await getUserByPseudo(pseudo)
  if (!user) return NextResponse.json({ error: 'Profil introuvable' }, { status: 404 })
  const impact = await impactOf(user.id)
  const spots = (await listAllSpots()).filter((s) => s.auteurId === user.id).slice(0, 30)
  return NextResponse.json({
    profil: { pseudo: user.pseudo, ville: user.ville, points: user.points, nbSpots: user.nbSpots, nbConfirmations: user.nbConfirmations, badges: user.badges, niveau: niveauOf(user.points), impact, depuis: user.createdAt.slice(0, 10) },
    spots: spots.map((s) => ({ id: s.id, nom: s.nom, villeNom: s.villeNom, villeSlug: s.villeSlug, slug: s.slug, categorie: s.categorie, confirmations: s.confirmations })),
  }, { headers: { 'Cache-Control': 'public, max-age=60' } })
}
