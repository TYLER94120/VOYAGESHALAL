// Types de lib/titreVille.mjs — la règle vit dans le .mjs pour que
// l'audit des 354 villes puisse l'importer sans compilation.
export declare const PLAFOND_MOSQUEES: number
export declare const PLAFOND_RESTOS: number
export declare const PLAFOND_HOTELS: number
export declare const MOTS_INTERDITS: RegExp
export declare function titresVilleEn(nom: string, nbPriere: number, sourceOsm: boolean): string[]
export declare function titresVilleFr(nom: string, nbPriere: number, sourceOsm: boolean): string[]
export declare function descriptionVille(o: { nom: string; nbRestos: number; nbHotels: number; en: boolean }): string
