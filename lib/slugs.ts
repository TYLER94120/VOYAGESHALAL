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
  '/planificateur': '/trip-planner',
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
  'voyage-halal-istanbul-guide-2026': 'istanbul-halal-travel-guide',
  'voyage-halal-dubai-guide-2026': 'dubai-halal-travel-guide-2026',
  'voyage-halal-marrakech-guide-2026': 'marrakech-halal-travel-guide',
  'top-destinations-halal-2026': 'top-halal-destinations-2026',
  'lune-de-miel-halal': 'halal-honeymoon-guide',
  'trouver-mosquee-en-voyage': 'find-a-mosque-anywhere',
  'vacances-halal-famille-2026': 'halal-family-holidays-2026',
  'checklist-voyage-halal': 'halal-travel-checklist',
  'voyage-halal-solo-femme': 'solo-female-muslim-travel',
  'tourisme-halal-definition-2026': 'what-is-halal-tourism',
}

// Articles de blog FR ayant un jumeau EN (301 sur le domaine EN).
// Valeurs = chemin COMPLET de destination (permet blog → guide quand le vrai
// jumeau EN est un guide). Jumelages par SUJET réel.
export const BLOG_FR_TO_EN: Record<string, string> = {
  'voyage-halal-maroc-2026-guide-complet': '/blog/halal-travel-morocco-2026-complete-guide',
  'top-10-destinations-halal-2026': '/blog/top-10-halal-destinations-2026',
  'horaires-priere-voyage-guide-musulman': '/blog/prayer-times-while-traveling-muslim-guide',
  'voyager-pendant-ramadan-guide-complet': '/guides/traveling-during-ramadan',
  'restaurants-halal-paris': '/blog/halal-travel-france-2026',
  'meilleurs-hotels-halal-istanbul': '/hotels/istanbul',
}
