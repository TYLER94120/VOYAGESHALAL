// Les types de `lib/halalPrudent.mjs`. La règle vit dans le .mjs — source
// unique, importée par les pages ET par le test lancé avant chaque build.

export type EtatHalal = 'verifie' | 'signale' | 'a-confirmer'

export interface EntreeHalal {
  nom?: string
  /** La liste de cuisines d'OpenStreetMap, en clair. */
  type?: string
  halalConfidence?: string
  source?: string
  /** Vrai uniquement pour ce que NOUS avons contrôlé. */
  verifie?: boolean
}

export declare const MOTS_A_RISQUE: string[]
export declare function motARisque(nom?: string, type?: string): boolean
export declare function verdictHalal(e: EntreeHalal): { etat: EtatHalal; coche: boolean; motif?: string }
export declare function phraseHalal(etat: EtatHalal, en?: boolean): string
export declare function familleDepuisType(type?: string): string | null
