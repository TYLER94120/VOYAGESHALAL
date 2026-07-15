import { NextResponse, type NextRequest } from 'next/server'
import { EN_TO_FR_SLUG, FR_TO_EN_SLUG, GUIDES_FR_TO_EN, BLOG_FR_TO_EN } from '@/lib/slugs'

// Détection de domaine côté serveur (déterministe, sans flash ni reload).
// gohalaltravel.com → anglais ; voyageshalal.fr → français.
//
// L'anglais est désormais rendu EN DUR côté serveur (SSR par domaine) : on
// n'injecte plus le cookie Google Translate. GT reste disponible à la demande
// pour les 8 autres langues via le sélecteur, mais ne s'exécute plus par défaut.
//
// P0-2 (slugs EN) : sur le domaine EN, l'URL publique est le slug anglais
// (/prayer-times…) réécrit vers la route interne FR (/horaires-priere), et les
// anciennes URL FR sur le domaine EN sont redirigées en 301 vers le slug EN.
export function middleware(req: NextRequest) {
  const host = req.headers.get('host') || ''
  const isEN = host.includes('gohalaltravel')
  const { pathname } = req.nextUrl

  // Applique l'en-tête domaine à n'importe quelle réponse
  const decorate = (res: NextResponse) => {
    res.headers.set('x-domain-lang', isEN ? 'en' : 'fr')
    return res
  }

  // Ancien slug pays accentué (« thaïlande ») → 301 vers le slug ASCII
  if (decodeURIComponent(pathname) === '/destinations/pays/thaïlande') {
    const url = req.nextUrl.clone()
    url.pathname = '/destinations/pays/thailande'
    return decorate(NextResponse.redirect(url, 301))
  }

  if (isEN) {
    // 1) Ancienne URL FR sur le domaine EN → 301 vers le slug EN (SEO propre)
    if (FR_TO_EN_SLUG[pathname]) {
      const url = req.nextUrl.clone()
      url.pathname = FR_TO_EN_SLUG[pathname]
      return decorate(NextResponse.redirect(url, 301))
    }
    // 1bis) Guides/articles FR ayant un jumeau EN → 301 vers le slug anglais
    const gm = pathname.match(/^\/guides\/([^/]+)$/)
    if (gm && GUIDES_FR_TO_EN[gm[1]]) {
      const url = req.nextUrl.clone()
      url.pathname = `/guides/${GUIDES_FR_TO_EN[gm[1]]}`
      return decorate(NextResponse.redirect(url, 301))
    }
    const bm = pathname.match(/^\/blog\/([^/]+)$/)
    if (bm && BLOG_FR_TO_EN[bm[1]]) {
      const url = req.nextUrl.clone()
      url.pathname = BLOG_FR_TO_EN[bm[1]]
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
