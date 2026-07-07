// Slugs localisés EN (P0-2). Seules les routes au libellé FRANÇAIS ont un
// équivalent anglais ; les routes déjà « neutres » (/destinations, /blog,
// /qibla, /contact, /guides) restent identiques sur les deux domaines.
//
// Sur gohalaltravel.com : l'URL publique est le slug EN, le middleware le
// réécrit (rewrite) vers la route interne FR qui rend le composant en anglais.
// Les anciennes URL FR sur le domaine EN sont redirigées (301) vers le slug EN.

export const FR_TO_EN_SLUG: Record<string, string> = {
  '/horaires-priere': '/prayer-times',
  '/mosquee-proche': '/mosque-near-me',
  '/omra': '/umrah',
  '/a-propos': '/about',
  '/confidentialite': '/privacy',
  '/mentions-legales': '/legal-notice',
  '/application': '/app',
}

export const EN_TO_FR_SLUG: Record<string, string> = Object.fromEntries(
  Object.entries(FR_TO_EN_SLUG).map(([fr, en]) => [en, fr])
)

/** Href à émettre dans la navigation : slug EN sur le domaine EN, sinon FR. */
export function localizedHref(frPath: string, isEN: boolean): string {
  if (!isEN) return frPath
  return FR_TO_EN_SLUG[frPath] ?? frPath
}

// Guides traduits (vague 1) : sur gohalaltravel.com, l'ancien slug FR fait
// une 301 vers le slug EN. Les guides FR sans jumeau EN restent accessibles
// mais ne sont pas listés sur le domaine EN.
export const GUIDES_FR_TO_EN: Record<string, string> = {
  'voyage-halal-debutant': 'halal-travel-for-beginners',
  'istanbul-guide-halal-complet': 'istanbul-halal-travel-guide',
  'dubai-guide-halal-2026': 'dubai-halal-travel-guide-2026',
  'marrakech-guide-halal': 'marrakech-halal-travel-guide',
  'hotel-halal-tout-savoir': 'halal-hotels-complete-guide',
  'ramadan-voyage-guide': 'traveling-during-ramadan',
  'omra-2026-guide-complet': 'umrah-2026-complete-guide',
  'malaisie-halal-destination': 'malaysia-halal-destination-guide',
}

// Articles de blog FR ayant un jumeau EN (301 sur le domaine EN).
export const BLOG_FR_TO_EN: Record<string, string> = {
  'voyage-halal-maroc-2026-guide-complet': 'halal-travel-morocco-2026-complete-guide',
  'top-10-destinations-halal-2026': 'top-10-halal-destinations-2026',
  'voyager-pendant-ramadan-guide-complet': 'prayer-times-while-traveling-muslim-guide',
  'restaurants-halal-paris': 'halal-travel-france-2026',
  'meilleurs-hotels-halal-istanbul': 'best-halal-restaurants-istanbul-2026',
}
