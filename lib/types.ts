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
  title: string
  description: string
  coverImage: string
  category: string
  readTime: string
  publishedAt: string
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
  content: string
  tags: string[]
  /** Langue de rédaction de l'article. Absent = 'fr'. Sert au filtrage par domaine. */
  lang?: 'fr' | 'en'
}
