export interface PanneauPool {
  id: string
  cat: 'monument' | 'table' | 'experience' | 'hotel' | 'joker'
  [k: string]: unknown
}
export function tirer<T extends PanneauPool>(pool: T[], dejaVus?: string[]): { panneaux: T[]; epuise: boolean }
export function sansDoublonsConsecutifs<T extends PanneauPool>(liste: T[]): T[]
