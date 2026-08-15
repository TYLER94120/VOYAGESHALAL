export interface Croisement {
  trajetMin: number
  besoinMin: number
  resteMin: number
  /** Le temps qu'il reste pour PARTIR — le chiffre qui n'existe nulle part. */
  partirAvantMin: number
  arrivee: Date
  etat: 'large' | 'juste' | 'trop-tard'
}
export declare function croisement(e: {
  distanceM: number
  mode?: 'pied' | 'velo' | 'transports' | 'voiture'
  finPriere: Date
  maintenant?: Date
  categorie?: 'mosquee' | 'manger' | 'activite'
  aller?: boolean
}): Croisement | null
export declare function phraseCroisement(c: Croisement | null, nomPriere: string, en?: boolean): string | null
