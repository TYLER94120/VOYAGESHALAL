// Types du filtre alcool. LA RÈGLE VIT DANS lib/alcool.mjs — ce fichier ne
// fait que la décrire pour TypeScript.
//
// Pourquoi la règle est en .mjs et non en .ts : le garde-fou
// scripts/test-alcool.mjs doit l'importer TELLE QUELLE, sans compilation
// et sans drapeau expérimental (leçon du 14 août : cinq déploiements de
// production perdus à cause de --experimental-strip-types). Une copie
// recopiée à la main finirait par diverger du code réellement servi, et un
// test qui teste autre chose que le code servi ne protège personne — ici,
// il laisserait passer un bistrot.

export interface SignauxLieu {
  nom: string
  /** Type primaire renvoyé par Google (champ peu coûteux, dès la passe 1). */
  primaryType?: string
  types?: string[]
  /** Attributs de service — `undefined` signifie INCONNU, pas « non ». */
  servesBeer?: boolean
  servesWine?: boolean
  servesCocktails?: boolean
  /** Textes d'avis, quand on les a : ils peuvent révéler le porc. */
  avis?: string[]
}

export type Verdict =
  | { garde: true; alcool: 'non' | 'inconnu' }
  | { garde: false; motif: 'type-boisson' | 'sert-alcool' | 'doute-nom' | 'doute-porc' }

export function verdictAlcool(l: SignauxLieu): Verdict
export function ligneAlcool(alcool: 'non' | 'inconnu', en: boolean): string
export function mentionPermanente(en: boolean): string
