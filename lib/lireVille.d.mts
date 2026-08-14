// Les types de `lib/lireVille.mjs`. La règle vit dans le .mjs (source
// unique, importée par l'application ET par le test lancé avant le
// build) ; ce fichier ne fait que la décrire à TypeScript.

export interface VilleSource {
  slug: string
  nom: string
  lat: number
  lng: number
}

export interface EntreeVille extends VilleSource {
  /** Le nom normalisé qui sert à la comparaison. */
  cle: string
}

export interface VilleLue extends VilleSource {
  /** La phrase ne désigne QUE cette ville → on ouvre son guide. */
  seule: boolean
  /** « à Tirana », « in Tirana » → la ville est explicitement le lieu. */
  explicite: boolean
  /** Ce qui reste de la phrase une fois la ville retirée : le vrai besoin. */
  reste: string
}

export type Intention =
  | { quoi: 'autour' }
  | { quoi: 'guide'; ville: VilleLue }
  | { quoi: 'dans-ville'; ville: VilleLue }
  | { quoi: 'ambigu'; ville: VilleLue }

export declare const AMBIGU: Set<string>
export declare function normaliser(s: string): string
export declare function designeUnLieu(phraseOrigine: string, nom: string): boolean
export declare function trouverMot(texte: string, mot: string): number
export declare function indexerVilles(villes: VilleSource[]): EntreeVille[]
export declare function lireVille(phrase: string, index: EntreeVille[]): VilleLue | null
export declare function lireIntention(phrase: string, index: EntreeVille[]): Intention
