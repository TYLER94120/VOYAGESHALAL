export interface Destination {
  city: string
  country: string
  slug: string
  description: string
  shortDescription: string
  coverImage: string
  halalScore: number
  mosqueeCount: number
  restaurantHalalCount: number
  population: string
  bestTime: string
  tags: string[]
  restaurants: HalalPlace[]
  mosques: HalalPlace[]
  activities: Activity[]
  tips: string[]
  relatedArticles?: { slug: string; title: string; type: 'guide' | 'blog' }[]
  url?: string
}

export interface HalalPlace {
  name: string
  address: string
  description: string
  rating: number
}

export interface Activity {
  name: string
  address?: string
  description: string
  duration: string
}

export interface Guide {
  slug: string
  /** Langue du guide. Absent = 'fr'. Sert au filtrage par domaine. */
  lang?: 'fr' | 'en'
  /** FAQ affichée en bas du guide + schema FAQPage (rich results). */
  faq?: { q: string; a: string }[]
  title: string
  description: string
  coverImage: string
  category: string
  readTime: string
  publishedAt: string
  /** 📅 Date de la dernière modification RÉELLE — jamais inventée.
   *
   *  Mesuré le 29 août sur la capture de Search Console : les titres
   *  réécrits le 27 apparaissaient dans Google pour Parc Astérix (publié
   *  le 6 août) et PAS pour Disneyland ni Orly (publiés le 20 juillet).
   *  La raison : le sitemap annonçait `lastModified = publishedAt`. Un
   *  titre changé ne produisait donc AUCUN signal de fraîcheur, et Google
   *  repassait à son rythme — vite sur les pages récentes, lentement sur
   *  les autres.
   *
   *  Ce champ n'est posé que sur un article réellement modifié, à la date
   *  de la modification. Le poser partout « pour faire remonter » serait
   *  inventer une date : Google mesure la constance de ces dates, et une
   *  page annoncée modifiée sans l'être perd sa crédibilité de fraîcheur. */
  updatedAt?: string
  content: string
  tags: string[]
}

export interface BlogPost {
  slug: string
  title: string
  description: string
  coverImage: string
  category: string
  readTime: string
  publishedAt: string
  /** 📅 Date de la dernière modification RÉELLE — jamais inventée.
   *
   *  Mesuré le 29 août sur la capture de Search Console : les titres
   *  réécrits le 27 apparaissaient dans Google pour Parc Astérix (publié
   *  le 6 août) et PAS pour Disneyland ni Orly (publiés le 20 juillet).
   *  La raison : le sitemap annonçait `lastModified = publishedAt`. Un
   *  titre changé ne produisait donc AUCUN signal de fraîcheur, et Google
   *  repassait à son rythme — vite sur les pages récentes, lentement sur
   *  les autres.
   *
   *  Ce champ n'est posé que sur un article réellement modifié, à la date
   *  de la modification. Le poser partout « pour faire remonter » serait
   *  inventer une date : Google mesure la constance de ces dates, et une
   *  page annoncée modifiée sans l'être perd sa crédibilité de fraîcheur. */
  updatedAt?: string
  content: string
  tags: string[]
  /** Langue de rédaction de l'article. Absent = 'fr'. Sert au filtrage par domaine. */
  lang?: 'fr' | 'en'
}
