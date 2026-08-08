import fs from 'fs'
import path from 'path'

// Compteurs REELS d'une fiche ville (lus dans data/villes/<slug>.json au
// rendu serveur). Sert a « donner avant de demander » : l'accueil montre
// tout de suite la richesse du guide au lieu d'un etat vide. Aucun chiffre
// n'est arrondi ni invente — si une liste est absente, le compteur vaut 0
// et n'est pas affiche.
export interface VilleCounts {
  slug: string
  nom: string
  pays: string
  score: number // sur 10
  restaurants: number
  mosquees: number
  hotels: number
  activites: number
  image: string | null
}

export function getVilleCounts(slug: string, en = false): VilleCounts | null {
  try {
    const raw = fs.readFileSync(path.join(process.cwd(), 'data', 'villes', `${slug}.json`), 'utf8')
    const v = JSON.parse(raw)
    const n = (x: unknown) => (Array.isArray(x) ? x.length : 0)
    return {
      slug,
      nom: (en && v.nom_en) || v.nom || slug,
      pays: (en && v.pays_en) || v.pays || '',
      score: Math.round((Number(v.score_halal) || 0) * 2 * 10) / 10,
      restaurants: n(v.restaurants),
      mosquees: n(v.mosqueesPrincipales) || n(v.mosquees),
      hotels: n(v.hotels),
      activites: n(v.activites),
      image: v.image_hero || v.image || null,
    }
  } catch {
    return null
  }
}

export function getVillesCounts(slugs: string[], en = false): VilleCounts[] {
  return slugs.map((s) => getVilleCounts(s, en)).filter((v): v is VilleCounts => !!v)
}
