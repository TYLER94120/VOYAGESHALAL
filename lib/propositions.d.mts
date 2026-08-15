export interface FicheFiltrable {
  distanceM: number
  ouvert?: boolean
  prix?: number
  note?: number
  nbAvis?: number
  famille?: string
}
export interface ContextePropositions { priere?: { nom: string; minutes: number } | null }
export interface Proposition { id: string; libelle: string; n: number }
export declare function propositions<T extends FicheFiltrable>(fiches: T[], ctx: ContextePropositions | null | undefined, en?: boolean): Proposition[]
export declare function filtrer<T extends FicheFiltrable>(fiches: T[], id: string | null, ctx?: ContextePropositions | null): T[]
