// 🕌 PAYS OÙ LA VIANDE EST HALAL PAR DÉFAUT — et ce que ça change chez nous.
//
// POURQUOI CE FICHIER EXISTE (mesuré, pas supposé) : Mohamed était à
// Berkane, au Maroc, et l'accueil affichait « Aucun kebab signalé halal à
// moins de 12 km ». Dans une ville marocaine. Vérification faite sur nos
// propres données : 19 de nos 354 fiches n'ont AUCUN restaurant, et elles
// sont presque toutes dans des pays musulmans — Berkane, Fezouane, Saïdia,
// Taza, Larache, Dakhla, Kairouan, Peshawar, Abha, Homs…
//
// La cause n'est pas un manque de restaurants : c'est notre filtre. Nous ne
// gardons qu'un lieu portant le tag OpenStreetMap `diet:halal`. Or ce tag
// sert à SIGNALER UNE EXCEPTION : on l'écrit à Berlin ou à Lyon, où le
// halal se cherche. Personne ne l'écrit à Berkane, où il ne distingue rien.
// Notre filtre était donc aveugle exactement là où tout convient.
//
// CE QUE NOUS N'ÉCRIRONS JAMAIS POUR AUTANT : « ce restaurant est halal ».
// Nous ne l'avons pas vérifié et le pays ne le prouve pas. Ce fichier ne
// sert qu'à décider si un lieu SANS étiquette mérite d'être montré, avec
// une mention qui dit exactement ce qu'on sait : le statut n'est pas
// renseigné, le pays est à majorité musulmane, ça se vérifie sur place.
//
// LA LISTE EST VOLONTAIREMENT PRUDENTE. N'y figurent que les pays où la
// question ne se pose pratiquement pas dans un restaurant ordinaire. Sont
// écartés exprès des pays pourtant à majorité musulmane où le porc est
// courant dans une partie de la restauration : Indonésie (Bali, cuisine
// chinoise), Malaisie, Liban, Albanie, Bosnie, Kazakhstan, Kirghizistan,
// Nigéria, Ouzbékistan. Là-bas, l'ancienne règle reste la bonne.

const PAYS = [
  'Afghanistan', 'Algérie', 'Arabie Saoudite', 'Bahreïn', 'Bangladesh',
  'Brunei', 'Comores', 'Djibouti', 'Émirats Arabes Unis', 'Gambie',
  'Irak', 'Iran', 'Jordanie', 'Koweït', 'Libye', 'Maldives', 'Mali',
  'Maroc', 'Mauritanie', 'Niger', 'Oman', 'Pakistan', 'Palestine',
  'Qatar', 'Sénégal', 'Somalie', 'Soudan', 'Syrie', 'Tunisie',
  'Turquie', 'Yémen', 'Égypte',
]

const sansAccent = (s: string) =>
  s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim()

const SET = new Set(PAYS.map(sansAccent))

/**
 * Dans ce pays, un restaurant ordinaire sans étiquette mérite-t-il d'être
 * montré ? `true` ne veut PAS dire « halal » : il veut dire « ne pas le
 * cacher, et dire honnêtement ce qu'on ignore ».
 */
export function halalParDefaut(pays: string | null | undefined): boolean {
  return !!pays && SET.has(sansAccent(pays))
}

/** La mention affichée sous un lieu montré à ce titre. Elle ne promet rien. */
export function mentionPaysMusulman(en = false): string {
  return en
    ? 'halal status not listed · majority-Muslim country, check on site'
    : 'statut halal non renseigné · pays à majorité musulmane, à vérifier sur place'
}
