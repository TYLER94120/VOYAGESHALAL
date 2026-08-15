// Les types de `lib/requete.mjs`. La règle vit dans le .mjs — source unique,
// importée par l'API ET par le test lancé avant le build.

export interface CriteresRequete {
  categorie?: 'manger' | 'mosquee' | 'activite'
  quoi?: string
  /** Les mots du visiteur, tels qu'il les a écrits. */
  motsCles?: string
}

export declare const TEXTE_PAR_DEFAUT: Record<string, string>
export declare function motsUtiles(phrase: string): string
export declare function requeteGoogle(criteres: CriteresRequete): string
