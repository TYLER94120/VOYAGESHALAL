export interface FicheTop3 {
  lat: number; lng: number; distanceM?: number; note?: number; nbAvis?: number
  prix?: number; ouvert?: boolean
}
export declare const POIDS: Record<string, { note: number; proximite: number; prix: number }>
export declare const BAYES: { M: number; PRIOR: number }
export declare function noteBayes(note?: number, nbAvis?: number): number
export declare function top3<T extends FicheTop3>(fiches: T[], mode: string): (T & { etiquette: string | null })[]
export declare const ETIQUETTES: Record<string, { fr: string; en: string }>
