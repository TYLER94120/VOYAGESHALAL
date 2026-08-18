export interface FicheTriable {
  distanceM: number
  ouvert?: boolean
  prix?: number
  note?: number
  nbAvis?: number
}
export interface Tri { id: string; icone: string; fr: string; en: string }
export declare const TRIS: Tri[]
export declare function trisDisponibles<T extends FicheTriable>(fiches: T[]): Tri[]
export declare function appliquer<T extends FicheTriable>(fiches: T[], tri: string | null): T[]
