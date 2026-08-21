// Les types de lib/envies.mjs — même contrat, vérifié par TypeScript.
export interface Envie {
  id: string
  emoji: string
  fr: string
  en: string
  /** le plat lui-meme : correspondance SURE */
  motsSurs: string[]
  /** famille de cuisine : correspondance POSSIBLE, annoncee comme telle */
  motsLarges?: string[]
  /** 🔴 LES TYPES GOOGLE DU PLAT (20 août, retour de Mohamed : « quand on
   *  veut des sushi on doit pas tomber sur des pizzas »). Places range les
   *  restaurants par plat — `sushi_restaurant`, `pizza_restaurant` — et
   *  c'est le signal le plus fiable dont on dispose : plus sûr qu'un mot
   *  dans un nom, et disponible sur chaque résultat. */
  typesSurs?: string[]
  /** Types d'une famille voisine : acceptés, mais jamais en tête. */
  typesLarges?: string[]
}

export declare const ENVIES: Envie[]
export declare function forceEnvie(type: string | undefined, nom: string | undefined, envieId: string): 0 | 1 | 2
export declare function forceEnvieGoogle(primaryType: string | undefined, types: string[] | undefined, nom: string | undefined, envieId: string): 0 | 1 | 2
export declare function correspondEnvie(type: string | undefined, envieId: string): boolean
export declare function envieById(id: string | null | undefined): Envie | null
export declare function niveauHalal(v: string | undefined, en?: boolean): { texte: string; fort: boolean } | null
