// ⏱ LE TEMPS DE LECTURE SE CALCULE, IL NE SE DÉCLARE PAS.
//
// POURQUOI CE FICHIER EXISTE. Mohamed, 12 août : « Il faut retravailler les
// guides, ils sont extrêmement génériques et très mal faits. » Mesuré avant
// de le croire ou de le contredire : sur 24 guides, **16 annonçaient au
// moins 3 minutes de plus que ce qu'il y a réellement à lire**, jusqu'à
// 4,5 fois trop — « Istanbul, guide complet, 9 min » pour 432 mots, soit
// deux minutes. Le lecteur ouvre, finit en un tiers du temps annoncé, et en
// conclut que la page est bâclée. Il a raison.
//
// Un `readTime` écrit à la main est une promesse que personne ne vérifie.
// Celui-ci se déduit du texte servi : il ne peut plus mentir, et il baisse
// tout seul si l'on retire un paragraphe.
//
// 200 mots par minute est la vitesse de lecture d'écran couramment retenue.
// On arrondit vers le haut, jamais en dessous d'une minute.

const MOTS_PAR_MINUTE = 200

/** Nombre de mots d'un contenu HTML, balises et scripts retirés. */
export function compterMots(html: string): number {
  if (!html) return 0
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&[a-z]+;|&#x?[0-9a-f]+;/gi, ' ')
    .split(/\s+/)
    .filter(Boolean).length
}

/**
 * Temps de lecture réel, prêt à afficher : « 4 min ».
 * `extra` permet d'inclure ce qui s'affiche en plus du corps — les questions
 * fréquentes, par exemple, qui sont bien du texte lu par le visiteur.
 */
export function tempsLecture(html: string, extra = ''): string {
  const mots = compterMots(html) + compterMots(extra)
  return `${Math.max(1, Math.ceil(mots / MOTS_PAR_MINUTE))} min`
}
