// Les types de lib/titreSpot.mjs.
//
// Le module est en JavaScript pur pour pouvoir être importé par le
// garde-fou avec n'importe quelle version de Node (voir l'en-tête du .mjs :
// un drapeau expérimental y a coûté cinq déploiements de production). Ce
// fichier rend les mêmes fonctions typées côté application : on ne perd
// rien du contrôle de types en gagnant la robustesse.
export declare const TITRE_MAX: number
export declare const DESCRIPTION_MAX: number
export declare function tronquer(texte: string, max: number): string
export declare function contientDuFrancais(texte: string): boolean
export declare function replier(versions: string[], max?: number): string
export declare function titreSpot(args: {
  nom: string
  villeNom: string
  marque: string
  isEN: boolean
  typeLieuEn?: string
}): string
export declare function descriptionSpot(args: {
  nom: string
  villeNom: string
  lieu: string
  isEN: boolean
}): string
