export interface Indicateur { note: number | null; sur: string }
export interface Indicateurs { manger: Indicateur; prier: Indicateur; vigilance: Indicateur }
export interface EntreeIndicateurs {
  paysMajoriteMusulmane: boolean
  mosquees: number
  restaurants: number
  restaurantsSignales: number
  restaurantsARisque: number
}
export declare function indicateurs(e: EntreeIndicateurs): Indicateurs
export declare function scoreGlobal(ind: Indicateurs): number | null
export declare function verdict(v: { ville: string; pays: string; paysMajoriteMusulmane: boolean }, ind: Indicateurs): string[]
