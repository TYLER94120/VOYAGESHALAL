import { NextResponse, type NextRequest } from 'next/server'

// Détection de domaine côté serveur (déterministe, sans flash ni reload).
// gohalaltravel.com → anglais par défaut : on positionne le cookie `googtrans`
// DÈS la première réponse, pour que Google Translate traduise toute la page
// au premier rendu (interface + contenu éditorial). voyageshalal.fr → français.
//
// On ne touche au cookie que s'il est ABSENT : un choix de langue explicite
// de l'utilisateur (sélecteur) pose son propre cookie et reste donc prioritaire.
export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || ''
  const isEN = host.includes('gohalaltravel')
  const hasGoogtrans = req.cookies.has('googtrans')

  const res = NextResponse.next()

  if (isEN && !hasGoogtrans) {
    // Traduire depuis le français vers l'anglais.
    res.cookies.set('googtrans', '/fr/en', { path: '/', maxAge: 60 * 60 * 24 * 365 })
  }

  // Indique aux composants serveur/clients la langue par défaut du domaine.
  res.headers.set('x-domain-lang', isEN ? 'en' : 'fr')
  return res
}

export const config = {
  // S'applique aux pages, pas aux assets/_next/api.
  matcher: ['/((?!_next/|api/|favicon|.*\\.(?:png|jpg|jpeg|svg|webp|ico|txt|xml|json|js|css|woff2?)).*)'],
}
