import { FR_URL, EN_URL } from '@/lib/domain'
import { FR_TO_EN_SLUG, GUIDES_FR_TO_EN, BLOG_FR_TO_EN } from '@/lib/slugs'

// 🌍 HREFLANG — dire à Google que voyageshalal.fr et gohalaltravel.com sont
// DEUX VERSIONS D'UN MÊME GUIDE, pas deux sites qui se disputent les mêmes
// requêtes. Sans ces balises, les deux domaines se pénalisent l'un l'autre.
//
// Deux pièges, et ce fichier existe pour les éviter tous les deux :
//
//  1. Déclarer un jumeau qui n'existe pas. « /blog/ou-prier-x » n'a pas
//     forcément d'article anglais. Annoncer une page anglaise absente est
//     pire que ne rien annoncer.
//  2. Déclarer un jumeau qui REDIRIGE. C'était notre cas sur tout le blog :
//     on annonçait gohalaltravel.com/blog/ou-prier-disneyland-paris, une
//     URL qui fait une 301 vers /blog/where-to-pray-disneyland-paris.
//     Google ignore un hreflang qui pointe vers une redirection.
//
// On ne déclare donc une paire que quand les DEUX pages existent vraiment,
// à leur URL finale.

/** Inverses des tables de jumelage (slug EN → slug FR). */
const EN_TO_FR_GUIDE = Object.fromEntries(Object.entries(GUIDES_FR_TO_EN).map(([fr, en]) => [en, fr]))
const EN_TO_FR_BLOG = Object.fromEntries(
  Object.entries(BLOG_FR_TO_EN).map(([fr, cheminEn]) => [cheminEn, fr]),
)

// 🔴 20 AOÛT — LES HREFLANG ONT COMMENCÉ À MENTIR.
//
// Un hreflang déclare « ces deux pages sont le MÊME contenu en deux
// langues ». C'était vrai quand gohalaltravel.com était la version
// anglaise de voyageshalal.fr. Ça ne l'est plus : le domaine anglais est
// devenu un site à part, bâti sur un moteur de swipe vertical.
//
// Ce qui a divergé, et perd donc son hreflang :
//   · « / »            : à gauche un guide, à droite un feed de 354 villes ;
//   · /destinations/*  : à gauche la page ville, à droite l'immersion en
//                        plein écran avec ses flux Eat/Pray/Sleep/Do ;
//   · /autour-de-moi   : à droite le swipe des résultats, à gauche la
//                        liste et la carte (remis comme avant le 20 août).
//
// Déclarer ces paires ferait traiter l'un des deux comme un doublon
// secondaire — et déclasser celui que Google jugerait redondant. Restent
// les pages qui sont VRAIMENT la même chose dans deux langues : les
// outils de calcul, les guides et articles jumelés, les listes.

/** Routes rendues dans les deux langues à la MÊME adresse, avec le MÊME
 *  contenu — la seule condition qui autorise un hreflang. */
const CHEMINS_BILINGUES = [
  '/destinations', '/blog', '/guides', '/qibla', '/quiz', '/hotels',
  '/trouvailles', '/audio', '/contact', '/search', '/communaute',
]

// Préfixes dont TOUTES les pages sont rendues dans les deux langues à la
// même adresse (le composant lit le domaine et traduit son texte).
const PREFIXES_BILINGUES = ['/hotels/', '/priere/', '/guide-vivant/', '/communaute/']

/** Pages devenues spécifiques à un domaine : AUCUN hreflang, jamais.
 *  (Le canonical, lui, reste sur le domaine qui sert la page.) */
const DIVERGENTES = ['/', '/autour-de-moi', '/world', '/saves', '/carnet']
const PREFIXES_DIVERGENTS = ['/destinations/', '/prayer-room/']
export const aDiverge = (chemin: string) =>
  DIVERGENTES.includes(chemin) || PREFIXES_DIVERGENTS.some((p) => chemin.startsWith(p))

const estBilingue = (chemin: string) =>
  CHEMINS_BILINGUES.includes(chemin) || PREFIXES_BILINGUES.some((p) => chemin.startsWith(p))

export interface Paire {
  fr: string | null
  en: string | null
}

/**
 * Les deux URL absolues d'une même page, ou null du côté qui n'existe pas.
 * `chemin` est le chemin tel qu'il est servi sur le domaine COURANT.
 */
export function paireLangues(chemin: string): Paire {
  // 0. Page qui a divergé entre les deux sites : pas de jumeau à déclarer.
  if (aDiverge(chemin)) return { fr: null, en: null }

  // 1. Slugs de section traduits (/horaires-priere ↔ /prayer-times)
  if (FR_TO_EN_SLUG[chemin]) return { fr: FR_URL + chemin, en: EN_URL + FR_TO_EN_SLUG[chemin] }
  const frDepuisEn = Object.entries(FR_TO_EN_SLUG).find(([, en]) => en === chemin)
  if (frDepuisEn) return { fr: FR_URL + frDepuisEn[0], en: EN_URL + chemin }

  // 2. Guides (slugs jumelés à la main, par sujet réel)
  if (chemin.startsWith('/guides/')) {
    const slug = chemin.slice('/guides/'.length)
    if (GUIDES_FR_TO_EN[slug]) return { fr: `${FR_URL}/guides/${slug}`, en: `${EN_URL}/guides/${GUIDES_FR_TO_EN[slug]}` }
    if (EN_TO_FR_GUIDE[slug]) return { fr: `${FR_URL}/guides/${EN_TO_FR_GUIDE[slug]}`, en: `${EN_URL}/guides/${slug}` }
    return { fr: FR_URL + chemin, en: null } // guide sans jumeau anglais
  }

  // 3. Blog — la table donne un CHEMIN complet côté anglais (un article FR
  // peut avoir pour jumeau un guide EN, d'où le chemin et non le slug).
  if (chemin.startsWith('/blog/')) {
    const slug = chemin.slice('/blog/'.length)
    if (BLOG_FR_TO_EN[slug]) return { fr: FR_URL + chemin, en: EN_URL + BLOG_FR_TO_EN[slug] }
    if (EN_TO_FR_BLOG[chemin]) return { fr: `${FR_URL}/blog/${EN_TO_FR_BLOG[chemin]}`, en: EN_URL + chemin }
    return { fr: FR_URL + chemin, en: null }
  }

  // 4. Même adresse dans les deux langues
  if (estBilingue(chemin)) return { fr: FR_URL + chemin, en: EN_URL + chemin }

  // 5. Page d'un seul côté (communauté, spots contribués, outils internes) :
  // on n'invente aucun jumeau.
  return { fr: FR_URL + chemin, en: null }
}

/**
 * Objet `alternates` prêt pour les metadata Next.
 * `chemin` = chemin servi sur le domaine courant ; `isEN` = domaine anglais.
 * x-default pointe vers l'anglais quand il existe (audience mondiale),
 * sinon vers le français — jamais vers une page absente.
 */
export function alternatesFor(chemin: string, isEN: boolean) {
  const { fr, en } = paireLangues(chemin)
  // Le canonical reste TOUJOURS sur le domaine qui sert la page : une page
  // sans jumeau (communauté, spot contribué) servie sur gohalaltravel.com ne
  // doit pas se déclarer canonique chez voyageshalal.fr.
  const canonical = (isEN ? en : fr) ?? (isEN ? EN_URL : FR_URL) + (chemin === '/' ? '' : chemin)
  const languages: Record<string, string> = {}
  if (fr) languages.fr = fr
  if (en) languages.en = en
  // Une seule langue disponible → pas de x-default (il n'apporte rien et
  // multiplie les risques d'incohérence).
  if (fr && en) languages['x-default'] = en
  return { canonical, ...(Object.keys(languages).length > 1 ? { languages } : {}) }
}
