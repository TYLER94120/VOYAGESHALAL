export interface VilleCoordonnees {
  lat: number
  lng: number
}

export interface HalalScore {
  global: number
  sourceViande: number
  certifie: boolean
  organisationCertification?: string
  sansAlcool: boolean
  proprietaireMusulman: boolean
  avisMusulmans: number
  derniereVerification: string
  badge: string
}

export interface VilleRestaurant {
  id: string
  nom: string
  cuisine: string
  adresse: string
  halal_certifie?: boolean
  sans_alcool?: boolean
  note: number
  avis_count?: number
  fourchette_prix?: string
  prix_moyen?: string
  horaires?: string
  specialite?: string
  specialites?: string[]
  ouvertSuhoor?: boolean
  halalScore?: HalalScore
  description?: string
  // Champs enrichis (catégories + liens externes)
  type?: string
  certificationHalal?: boolean
  score?: number
  mapsUrl?: string
  websiteUrl?: string
  priceRange?: string
}

export interface VilleMosquee {
  id: string
  nom: string
  type: string
  adresse: string
  description: string
  note: number
  acces_non_musulmans: boolean
  capacite?: number
}

export interface VilleHotel {
  id: string
  nom: string
  type?: string
  adresse: string
  etoiles?: number
  halal_certifie?: boolean
  sans_alcool?: boolean
  piscine_privee?: boolean
  note: number
  avis_count?: number
  prix_nuit_min?: number
  devise?: string
  halalScore?: HalalScore
  description?: string
  // Champs enrichis
  categorie?: string
  score?: number
  halalFriendly?: boolean
  sansAlcool?: boolean
  mapsUrl?: string
  bookingUrl?: string
  halalBookingUrl?: string
  priceRange?: string
}

export interface VilleActivite {
  id: string
  nom: string
  type?: string
  description?: string
  duree?: string
  prix?: string
  tags?: string[]
  // Champs enrichis
  categorie?: string
  mapsUrl?: string
  tripadvisorUrl?: string
}

export interface VilleRoadTrip {
  id: string
  titre: string
  duree: string
  distance_km: number
  etapes: string[]
  description: string
  conseils_halal: string
  budget_estime: string
}

export interface VilleTypeVoyage {
  intro: string
  top_experiences: string[]
  conseils?: string
  hotels_recommandes?: string[]
}

export interface Ville {
  slug: string
  nom: string
  pays: string
  pays_slug: string
  codeISO?: string
  region: string
  coordonnees: VilleCoordonnees
  score_halal: number
  description: string | { court?: string; long?: string }
  image_hero: string
  image?: string
  continent?: string
  image_alt: string
  meta_title: string
  meta_description: string
  metaDescription?: string
  metaDescription_en?: string
  description_en?: string
  nom_en?: string
  statistiques: {
    mosquees?: number
    restaurants_halal?: number
    hotels_halal?: number
    hotels_halal_friendly?: number
    habitants_musulmans_pct?: number
    musulmans_pct?: number
    population?: string
  }
  infos_pratiques: {
    langue?: string
    langue_officielle?: string
    monnaie?: string
    meilleure_periode?: string
    appel_priere?: string
    nourriture_halal?: string
    alcool?: string
    tenue?: string
    securite?: string
    [key: string]: string | undefined
  }
  restaurants: VilleRestaurant[]
  mosquees: VilleMosquee[]
  hotels: VilleHotel[]
  activites: VilleActivite[]
  road_trips?: VilleRoadTrip[]
  voyages_par_type?: {
    en_couple?: VilleTypeVoyage
    en_famille?: VilleTypeVoyage
    entre_amis?: VilleTypeVoyage
    voyage_solo?: VilleTypeVoyage
    voyage_spirituel?: VilleTypeVoyage
  }
  articles_lies?: string[]
  villes_proches?: string[]
  // Champs premium / mobile
  halalScore?: number
  monnaie?: string
  langue?: string
  meilleureEpoque?: string
  prixMoyenNuit?: string
  infoPratique?: Record<string, string>
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  mosqueesPrincipales?: any[]
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectionsPremium?: Record<string, any>
}
