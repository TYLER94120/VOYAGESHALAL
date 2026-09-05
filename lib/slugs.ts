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
  '/carnet': '/notebook',
  '/meteo': '/weather',
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
  'voyage-halal-japon-guide': 'japan-halal-travel-guide',
  'manger-halal-thailande-guide': 'halal-food-thailand-guide',
  'europe-halal-friendly': 'halal-friendly-europe',
  'voyage-halal-petit-budget': 'budget-halal-travel',
  'voyage-aid-en-famille': 'eid-family-travel',
}

// Articles de blog FR ayant un jumeau EN (301 sur le domaine EN).
// Valeurs = chemin COMPLET de destination (permet blog → guide quand le vrai
// jumeau EN est un guide). Jumelages par SUJET réel.
export const BLOG_FR_TO_EN: Record<string, string> = {
  'ou-prier-disneyland-paris': '/blog/where-to-pray-disneyland-paris',
  'ou-prier-aeroport-lyon': '/blog/where-to-pray-lyon-airport',
  'ou-prier-aeroport-nice': '/blog/where-to-pray-nice-airport',
  'ou-prier-aeroport-geneve': '/blog/where-to-pray-geneva-airport',
  'ou-prier-aeroport-bruxelles': '/blog/where-to-pray-brussels-airport',
  'prier-en-train': '/blog/praying-on-a-train',
  'ou-prier-aeroports': '/blog/where-to-pray-paris-airports',
  'ou-prier-gares-paris': '/blog/where-to-pray-paris-stations',
  // 31 août : les deux pages qui convertissent le MIEUX du site n'avaient
  // aucune version anglaise. Relevé 3 mois, voyageshalal.fr :
  //   ou-prier-parc-asterix  34,9 % de clics en position 2,8
  //   ou-prier-puy-du-fou    15,8 % en position 7,1
  // Le site fait 1,2 % ailleurs. Disneyland avait déjà son jumeau anglais —
  // ces deux-là étaient restés derrière. Rien n'est inventé : le relevé
  // existait, seule la langue manquait.
  'ou-prier-parc-asterix': '/blog/where-to-pray-parc-asterix',
  'ou-prier-puy-du-fou': '/blog/where-to-pray-puy-du-fou',
  // 5 septembre : premier article du cycle « création ». Le français faisait
  // 235 mots ; l'anglais explique ce qu'un conducteur étranger ne sait pas —
  // la différence aire de repos / aire de service, et pourquoi la première
  // est la bonne. Sourcé sur les références d'auto-écoles françaises
  // (10-20 km contre 50-60 km). Aucune aire nommée : nous n'en avons vérifié
  // aucune, et la page le dit.
  'ou-prier-aire-autoroute': '/blog/where-to-pray-french-motorway',
  'ou-prier-aeroport-marseille': '/blog/where-to-pray-marseille-airport',
  'ou-prier-aeroport-toulouse': '/blog/where-to-pray-toulouse-airport',
  'ou-prier-aeroport-cdg': '/blog/where-to-pray-cdg-airport',
  'ou-prier-aeroport-orly': '/blog/where-to-pray-orly-airport',
  'prier-en-avion': '/blog/praying-on-a-plane',
  'voyage-halal-maroc-2026-guide-complet': '/blog/halal-travel-morocco-2026-complete-guide',
  'top-10-destinations-halal-2026': '/blog/top-10-halal-destinations-2026',
  'horaires-priere-voyage-guide-musulman': '/blog/prayer-times-while-traveling-muslim-guide',
  'voyager-pendant-ramadan-guide-complet': '/guides/traveling-during-ramadan',
  'restaurants-halal-paris': '/blog/halal-travel-france-2026',
  'meilleurs-hotels-halal-istanbul': '/hotels/istanbul',
  // Bloc « manger » (aout 2026)
  'restaurant-vraiment-halal-verifier': '/blog/is-this-restaurant-really-halal',
  'aucun-restaurant-halal-que-faire': '/blog/no-halal-restaurant-what-to-eat',
  'dire-sans-porc-sans-alcool-langues': '/blog/no-pork-no-alcohol-in-12-languages',
  // Bloc « pratique » (11 aout 2026) — traductions, pas de nouveaux sujets
  'voile-controle-securite-aeroport': '/blog/hijab-airport-security-check',
  'voyager-voilee-se-renseigner-pays': '/blog/traveling-in-hijab-country-check',
  'toilettes-sans-douchette-voyage': '/blog/no-bidet-shower-toilets-travel',
  'repas-halal-avion-moml': '/blog/halal-airline-meal-moml',
  'ablutions-avion-train': '/blog/wudu-on-a-plane-or-train',
  'heure-priere-avion-fuseaux': '/blog/prayer-times-on-a-plane-time-zones',
}

// 🇬🇧 UN LIEN INTERNE NE DOIT JAMAIS FAIRE UNE 301.
//
// Mesuré le 30 août sur gohalaltravel.com (scratchpad/maillage.mjs) : au moins
// 75 liens internes du site ANGLAIS pointaient vers un slug FRANÇAIS et
// partaient donc en redirection —
//   /guides/top-destinations-halal-2026 ×16, /guides/lune-de-miel-halal ×7,
//   /horaires-priere ×8, /mosquee-proche ×6, /application ×20…
// Une 301 sur un lien interne coûte deux passages de robot au lieu d'un, dilue
// ce que le lien transmet, et affiche une URL française à un lecteur anglais.
//
// Cette fonction rend le chemin ANGLAIS quand le jumeau existe, et `null`
// quand il n'existe pas : la règle de la maison (slugs.ts, en tête de fichier)
// est qu'un guide FR sans jumeau EN n'est pas listé sur le domaine EN. On
// n'invente pas une traduction pour garder un lien.
export function lienGuideLocalise(
  slug: string,
  type: 'guide' | 'blog' | string,
  isEN: boolean,
): string | null {
  const frPath = `/${type === 'blog' ? 'blog' : 'guides'}/${slug}`
  if (!isEN) return frPath
  if (type === 'blog') return BLOG_FR_TO_EN[slug] ?? null
  const en = GUIDES_FR_TO_EN[slug]
  return en ? `/guides/${en}` : null
}

/** Réécrit les liens internes d'un corps d'article pour le domaine servi.
 *
 *  30 août : 14 articles ANGLAIS écrivaient en dur des chemins FRANÇAIS —
 *  texte anglais, URL française : « Our <a href="/horaires-priere">prayer
 *  times</a> tool ». Chacun de ces liens partait en 301.
 *
 *  Le correctif vit ici, au RENDU, et non dans les 14 corps d'articles :
 *  corriger les textes laisserait la faute revenir au prochain article écrit.
 *  Seuls les chemins de SECTION sont traduits (table FR_TO_EN_SLUG) — un
 *  article dont il n'existe pas de jumeau n'est pas réécrit au hasard.
 */
export function liensArticleLocalises(html: string, isEN: boolean): string {
  if (!isEN) return html
  return html.replace(/href="(\/[a-z0-9-]+)"/g, (tout, chemin) => {
    const en = FR_TO_EN_SLUG[chemin]
    return en ? `href="${en}"` : tout
  })
}
