import coords from '@/lib/cityCoords.json'
import { indexerVilles, lireIntention as lire } from '@/lib/lireVille.mjs'
import type { Intention, VilleSource } from '@/lib/lireVille.mjs'

// Le seul endroit qui branche la règle (`lib/lireVille.mjs`) sur les
// données réelles : les 354 villes qui ont une fiche. Une ville absente
// d'ici n'existe pas pour la barre de recherche — c'est ce qui garantit
// qu'aucune reconnaissance ne mène à une page qui n'existe pas.

const INDEX = indexerVilles(coords as VilleSource[])

export function lireIntention(phrase: string): Intention {
  return lire(phrase, INDEX)
}

export type { Intention }
