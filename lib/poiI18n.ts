// Traduction EN des micro-textes DATA-DRIVEN (catégories, types, valeurs
// répétitives) affichés sur gohalaltravel.com. Dictionnaire à l'affichage :
// aucune donnée dupliquée. Si un libellé n'est pas connu, on renvoie tel quel
// (les types OSM sont déjà en anglais : kebab, turkish…).

const MAP: Record<string, string> = {
  // Catégories de l'annuaire
  'Traditionnel local': 'Local traditional', 'Libanais & Levant': 'Lebanese & Levant',
  'Indien & Pakistani': 'Indian & Pakistani', 'Pizza & Italien': 'Pizza & Italian',
  'Japonais & Asiatique': 'Japanese & Asian', 'Burgers & Fast-food': 'Burgers & Fast food',
  Gastronomique: 'Fine dining', 'Végétarien & Healthy': 'Vegetarian & Healthy',
  'Pâtisserie & Café': 'Pastry & Coffee',
  'Grillades & Kebab': 'Grill & Kebab', 'Fruits de mer': 'Seafood',
  Marocain: 'Moroccan', Turc: 'Turkish',
  Luxe: 'Luxury', Standard: 'Standard', 'Riad & Boutique': 'Riad & Boutique',
  Budget: 'Budget', 'Resort & Spa': 'Resort & Spa',
  'Religieux & Spirituel': 'Religious & Spiritual', 'Histoire & Culture': 'History & Culture',
  'Shopping & Souks': 'Shopping & Souks', Gastronomie: 'Food', 'Nature & Plein air': 'Nature & Outdoors',
  Famille: 'Family', 'Hammam & Bien-être': 'Hammam & Wellness',
  // Types de POI fréquents
  Restaurant: 'Restaurant', 'Boucherie halal': 'Halal butcher', Mosquée: 'Mosque',
  'Lieu de prière': 'Prayer space', Hôtel: 'Hotel',
  Culture: 'Culture', Histoire: 'History', Panorama: 'Viewpoint', Nature: 'Nature',
  'À voir': 'Must-see', Spirituel: 'Spiritual', Gratuit: 'Free',
}

export function enLabel(fr: string | undefined, en: boolean): string | undefined {
  if (!fr || !en) return fr
  return MAP[fr] ?? fr
}

// Noms de pays FR → EN (pages pays sur gohalaltravel.com). Fallback = identique.
const COUNTRY_EN: Record<string, string> = {
  Turquie: 'Türkiye', Maroc: 'Morocco', 'Émirats Arabes Unis': 'United Arab Emirates',
  'Arabie Saoudite': 'Saudi Arabia', Malaisie: 'Malaysia', Indonésie: 'Indonesia',
  Égypte: 'Egypt', Tunisie: 'Tunisia', Algérie: 'Algeria', Jordanie: 'Jordan',
  Liban: 'Lebanon', Qatar: 'Qatar', Koweït: 'Kuwait', Oman: 'Oman', Bahreïn: 'Bahrain',
  France: 'France', 'Royaume-Uni': 'United Kingdom', Espagne: 'Spain', Italie: 'Italy',
  Allemagne: 'Germany', Belgique: 'Belgium', 'Pays-Bas': 'Netherlands', Suisse: 'Switzerland',
  Autriche: 'Austria', Grèce: 'Greece', 'Bosnie-Herzégovine': 'Bosnia and Herzegovina',
  Albanie: 'Albania', Turkménistan: 'Turkmenistan', Ouzbékistan: 'Uzbekistan',
  Kazakhstan: 'Kazakhstan', Azerbaïdjan: 'Azerbaijan', Japon: 'Japan', 'Corée du Sud': 'South Korea',
  Chine: 'China', Thaïlande: 'Thailand', Singapour: 'Singapore', Inde: 'India',
  Pakistan: 'Pakistan', Bangladesh: 'Bangladesh', Maldives: 'Maldives', 'Sri Lanka': 'Sri Lanka',
  'États-Unis': 'United States', Canada: 'Canada', Brésil: 'Brazil', Mexique: 'Mexico',
  Australie: 'Australia', 'Afrique du Sud': 'South Africa', Sénégal: 'Senegal', Kenya: 'Kenya',
  Nigéria: 'Nigeria', Éthiopie: 'Ethiopia', Russie: 'Russia', Pologne: 'Poland',
  Hongrie: 'Hungary', Portugal: 'Portugal', Suède: 'Sweden', Norvège: 'Norway', Danemark: 'Denmark',
}
export const countryEn = (fr: string, en: boolean) => (en ? (COUNTRY_EN[fr] ?? fr) : fr)

// Valeurs d'infos pays (échelles fermées) FR → EN.
const COUNTRY_VALUES: Record<string, string> = {
  Excellent: 'Excellent', Bon: 'Good', Moyen: 'Average', Difficile: 'Difficult',
  Partout: 'Everywhere', 'Dans les villes': 'In cities', Rares: 'Rare',
  Interdit: 'Forbidden', Rare: 'Rare', 'Disponible mais évitable': 'Available but avoidable',
  'Très présent': 'Very present',
}
export const countryValueEn = (fr: string, en: boolean) => (en ? (COUNTRY_VALUES[fr] ?? fr) : fr)

// Noms de villes FR → EN (chips « Autres destinations », en-têtes).
const CITY_EN: Record<string, string> = {
  'Le Caire': 'Cairo', Médine: 'Medina', 'La Mecque': 'Makkah', Dubaï: 'Dubai',
  Cappadoce: 'Cappadocia', Séville: 'Seville', Grenade: 'Granada', Cordoue: 'Córdoba',
  Londres: 'London', Lisbonne: 'Lisbon', Bruxelles: 'Brussels', Copenhague: 'Copenhagen',
  Venise: 'Venice', Athènes: 'Athens', Moscou: 'Moscow', Pékin: 'Beijing',
  'Le Cap': 'Cape Town', Marrakech: 'Marrakesh', Fès: 'Fez', Tanger: 'Tangier',
  Alger: 'Algiers', Beyrouth: 'Beirut', Damas: 'Damascus', Bagdad: 'Baghdad',
  Riyad: 'Riyadh', Djeddah: 'Jeddah', Mascate: 'Muscat', 'Kuala Lumpur': 'Kuala Lumpur',
  Jérusalem: 'Jerusalem', 'Nouvelle-Delhi': 'New Delhi', Munich: 'Munich', Vienne: 'Vienna',
  Genève: 'Geneva', Varsovie: 'Warsaw', Cracovie: 'Kraków', Prague: 'Prague', Édimbourg: 'Edinburgh',
}
export const cityEn = (fr: string, en: boolean) => (en ? (CITY_EN[fr] ?? fr) : fr)
