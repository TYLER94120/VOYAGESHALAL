// 🏷️ LE TITRE DES PAGES « OÙ PRIER », QUI NE PEUT PLUS DÉBORDER.
//
// POURQUOI CE FICHIER EXISTE. Balayage complet du 13 août, 1 976 pages :
// **101 défauts, tous sur ces pages-là**, et ce sont trois symptômes d'une
// seule cause — un gabarit qui met le décor avant l'information.
//
//     Où prier à ${nom} — ${ville} | ${marque}      → 29 car. de décor + la ville
//     Where to pray at ${nom} — ${ville} | ${brand} → 35 car. de décor + la ville
//
// Sur « Marrakech », il restait 22 caractères pour nommer le lieu en
// français, 16 en anglais. D'où 73 titres coupés par Google, médiane 67,
// maximum 101.
//
// Et `nom` est saisi par la communauté, en français. La même valeur partait
// telle quelle sur le domaine anglais : « Where to pray at Mosquée
// magnifique — Berkane ». 19 titres et 9 descriptions dans ce cas.
//
// CES PAGES SONT CELLES QUI GAGNENT DÉJÀ. La loi du 11 août : le précis
// gagne — « où prier au parc Astérix » convertit à 100 sur 100, quand
// « voyage halal » fait 144 vues et zéro clic. C'étaient exactement les
// pages au titre cassé.
//
// LA RÈGLE ICI : le lieu d'abord, le reste sacrifié dans l'ordre inverse de
// son utilité. Ce n'est pas un test qui alerte — c'est un gabarit qui **ne
// peut pas** dépasser, quel que soit le nom qu'un visiteur saisira demain.

export const TITRE_MAX = 60
export const DESCRIPTION_MAX = 160

/**
 * Mots français courants dans les noms saisis par la communauté.
 * Ils servent à UNE seule décision : ne pas coller un nom français dans un
 * titre anglais. Un nom propre (« Westfield », « Parc Astérix ») n'en
 * contient aucun et reste donc affiché tel quel sur les deux domaines.
 */
const MOTS_FR = /\b(mosqu[ée]e|salle|pri[èe]re|centre|commercial|gare|a[ée]roport|h[ôo]tel|universit[ée]|magasin|magnifique|petite?|grande?|nouvelle?|vieux|vieille|derri[èe]re|[àa] c[ôo]t[ée]|pr[èe]s|du|de la|des|le|la|les|au|aux)\b/i

/** Coupe sur un mot entier, jamais au milieu, et signale la coupe. */
export function tronquer(texte: string, max: number): string {
  if (texte.length <= max) return texte
  const coupe = texte.slice(0, max - 1)
  const espace = coupe.lastIndexOf(' ')
  return (espace > max * 0.6 ? coupe.slice(0, espace) : coupe).trimEnd() + '…'
}

/** Un nom saisi par un visiteur contient-il du français ? */
export function contientDuFrancais(texte: string): boolean {
  return MOTS_FR.test(texte)
}

/**
 * La règle générale : on essaie les versions de la plus complète à la plus
 * dépouillée, on garde la première qui tient, et on coupe proprement si
 * même la dernière déborde.
 *
 * ⚠️ MISE À DISPOSITION LE 14 AOÛT. Le gabarit « où prier » n'était pas le
 * seul dans ce cas : mesuré sur les mêmes cas durs, **75 autres titres
 * coupés** sur quatre gabarits — `/spot/[id]` (jusqu'à 123 caractères),
 * `/guide-vivant/[ville]`, `/priere/[ville]`, `/communaute/[pseudo]` — et
 * **22 titres français servis sur le domaine anglais**. Même cause : du
 * décor placé devant une valeur qu'on ne maîtrise pas.
 */
export function replier(versions: string[], max = TITRE_MAX): string {
  const tient = versions.find((v) => v && v.length <= max)
  if (tient) return tient
  const derniere = versions.filter(Boolean).at(-1) ?? ''
  return tronquer(derniere, max)
}

/**
 * Titre d'une page « où prier », garanti ≤ 60 caractères.
 *
 * On tente, dans l'ordre, du plus complet au plus dépouillé, et on retient
 * la première version qui tient. Le nom du lieu est le seul élément qu'on
 * ne sacrifie jamais : c'est lui que les gens cherchent.
 */
export function titreSpot({
  nom,
  villeNom,
  marque,
  isEN,
  typeLieuEn,
}: {
  nom: string
  villeNom: string
  marque: string
  isEN: boolean
  typeLieuEn?: string
}): string {
  if (!isEN) {
    const versions = [
      `Où prier à ${nom} — ${villeNom} | ${marque}`,
      `Où prier à ${nom} — ${villeNom}`,
      `Où prier à ${nom}`,
      `Prier à ${nom}`,
    ]
    const tient = versions.find((v) => v.length <= TITRE_MAX)
    if (tient) return tient
    // Même « Prier à » + le nom dépasse : c'est un nom très long, on le coupe
    // sur un mot entier plutôt que de laisser Google le faire n'importe où.
    return tronquer(`Prier à ${nom}`, TITRE_MAX)
  }

  // Domaine anglais. Un nom saisi en français n'y a pas sa place : mieux vaut
  // un titre générique honnête qu'un titre bilingue accidentel.
  const nomUtilisable = !MOTS_FR.test(nom)
  const versions = nomUtilisable
    ? [
        `Where to pray at ${nom} — ${villeNom} | ${marque}`,
        `Where to pray at ${nom} — ${villeNom}`,
        `Where to pray at ${nom}`,
        `Pray at ${nom}`,
      ]
    : [
        // Le type de lieu, lui, est traduit dans LIEU_LABELS : il donne un
        // titre anglais complet, précis sur la ville, et vrai.
        typeLieuEn ? `Where to pray in a ${typeLieuEn.toLowerCase()} — ${villeNom}` : '',
        `Prayer spot in ${villeNom} — ${marque}`,
        `Prayer spot in ${villeNom}`,
        `Where to pray in ${villeNom}`,
      ].filter(Boolean)
  const tient = versions.find((v) => v.length <= TITRE_MAX)
  if (tient) return tient
  return tronquer(nomUtilisable ? `Pray at ${nom}` : `Prayer spot in ${villeNom}`, TITRE_MAX)
}

/** Description d'une page « où prier », garantie ≤ 160 caractères. */
export function descriptionSpot({
  nom,
  villeNom,
  lieu,
  isEN,
}: {
  nom: string
  villeNom: string
  lieu: string
  isEN: boolean
}): string {
  if (!isEN) {
    const versions = [
      `Coin prière à ${nom} (${lieu}) à ${villeNom}. Emplacement, accès et conseils de voyageurs. Spot partagé — à confirmer sur place.`,
      `Coin prière à ${nom} (${lieu}) à ${villeNom}. Emplacement, accès et conseils. Spot partagé — à confirmer sur place.`,
      `Coin prière à ${nom}, ${villeNom}. Emplacement et accès. Spot partagé — à confirmer sur place.`,
      `Coin prière à ${villeNom}. Spot partagé par la communauté — à confirmer sur place.`,
    ]
    return versions.find((v) => v.length <= DESCRIPTION_MAX) ?? tronquer(versions.at(-1)!, DESCRIPTION_MAX)
  }
  // Même règle qu'au-dessus : pas de nom français dans une description anglaise.
  const nomUtilisable = !MOTS_FR.test(nom)
  const versions = nomUtilisable
    ? [
        `Prayer spot at ${nom} (${lieu}) in ${villeNom}. Location, access and traveller tips. Shared spot — confirm on site.`,
        `Prayer spot at ${nom} (${lieu}) in ${villeNom}. Location and access. Shared spot — confirm on site.`,
        `Prayer spot at ${nom}, ${villeNom}. Shared spot — confirm on site.`,
      ]
    : [
        `Prayer spot in a ${lieu.toLowerCase()} in ${villeNom}. Location, access and traveller tips. Shared spot — confirm on site.`,
        `Prayer spot in ${villeNom} (${lieu}). Location and access. Shared spot — confirm on site.`,
        `Prayer spot in ${villeNom}. Shared by the community — confirm on site.`,
      ]
  return versions.find((v) => v.length <= DESCRIPTION_MAX) ?? tronquer(versions.at(-1)!, DESCRIPTION_MAX)
}
