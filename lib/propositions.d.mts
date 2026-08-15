export interface FicheFiltrable {
  distanceM: number
  ouvert?: boolean
  prix?: number
  note?: number
  nbAvis?: number
}
export interface Filtre { id: string; icone: string; fr: string; en: string }
export interface FiltreDisponible extends Filtre { n: number }
export declare const FILTRES: Filtre[]
export declare function filtresDisponibles<T extends FicheFiltrable>(fiches: T[]): FiltreDisponible[]
export declare function appliquer<T extends FicheFiltrable>(fiches: T[], actifs: string[]): T[]
