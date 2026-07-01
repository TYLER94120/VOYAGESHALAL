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
