// Les types de `lib/categorie.mjs`. La règle vit dans le .mjs — source
// unique, importée par l'API ET par le test lancé avant chaque build.

export type CategorieLieu = 'manger' | 'mosquee' | 'activite'

export declare const TYPES_PRIERE: Set<string>
export declare const TYPES_NOURRITURE: Set<string>
export declare function sertAManger(primaryType?: string, types?: string[]): boolean
export declare function estLieuDePriere(primaryType?: string, types?: string[]): boolean
export declare function accepte(categorie: CategorieLieu, primaryType?: string, types?: string[]): boolean
