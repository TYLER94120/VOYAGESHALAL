export interface Palier { min: number; max: number; niveau: string }
export declare const BAREME: Palier[]
export declare const ATTENDU: Record<string, string>
export declare function niveauDe(score: number | null | undefined): string | null
export declare function valider(slug: string, score: number | null | undefined): { ok: boolean; erreur?: string }
export declare function afficher(score: number | null | undefined): string | null
export declare function couleurBadge(score: number | null | undefined): string
