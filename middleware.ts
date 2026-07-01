import { NextResponse, type NextRequest } from 'next/server'
import { EN_TO_FR_SLUG, FR_TO_EN_SLUG } from '@/lib/slugs'

// Détection de domaine côté serveur (déterministe, sans flash ni reload).
// gohalaltravel.com → anglais ; voyageshalal.fr → français.
//
// P0-2 (slugs EN) : sur le domaine EN, l'URL publique est le slug anglais
// (/prayer-times…) réécrit vers la route interne FR (/horaires-priere), et les
// anciennes URL FR sur le domaine EN sont redirigées en 301 vers le slug EN.
export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || ''
  const isEN = host.includes('gohalaltravel')
  const hasGoogtrans = req.cookies.has('googtrans')
  const { pathname, search } = req.nextUrl

  // Applique le cookie de langue + l'en-tête domaine à n'importe quelle réponse
  const decorate = (res: NextResponse) => {
    if (isEN && !hasGoogtrans) {
      res.cookies.set('googtrans', '/fr/en', { path: '/', maxAge: 60 * 60 * 24 * 365 })
    }
    res.headers.set('x-domain-lang', isEN ? 'en' : 'fr')
    return res
  }

  if (isEN) {
    // 1) Ancienne URL FR sur le domaine EN → 301 vers le slug EN (SEO propre)
    if (FR_TO_EN_SLUG[pathname]) {
      const url = req.nextUrl.clone()
      url.pathname = FR_TO_EN_SLUG[pathname]
      return decorate(NextResponse.redirect(url, 301))
    }
    // 2) Slug EN public → réécriture interne vers la route FR (l'URL reste EN)
    if (EN_TO_FR_SLUG[pathname]) {
      const url = req.nextUrl.clone()
      url.pathname = EN_TO_FR_SLUG[pathname]
      return decorate(NextResponse.rewrite(url))
    }
  }

  return decorate(NextResponse.next())
}

export const config = {
  // S'applique aux pages, pas aux assets/_next/api.
  matcher: ['/((?!_next/|api/|favicon|.*\\.(?:png|jpg|jpeg|svg|webp|ico|txt|xml|json|js|css|woff2?)).*)'],
}
