// Méthodes de calcul des horaires de prière (AlAdhan).
// Le choix de la méthode change Fajr/Isha de 10-20 min ; l'école change le ʿAsr de 30-60 min.

export interface PrayerMethod {
  id: number
  label: string
}

// Liste curée des méthodes les plus utilisées dans le monde.
export const PRAYER_METHODS: PrayerMethod[] = [
  { id: 3, label: 'Ligue Islamique Mondiale (MWL)' },
  { id: 12, label: 'UOIF — France (angle 12°)' },
  { id: 2, label: 'ISNA — Amérique du Nord' },
  { id: 5, label: 'Autorité générale d’Égypte' },
  { id: 4, label: 'Umm al-Qura — La Mecque' },
  { id: 8, label: 'Région du Golfe' },
  { id: 9, label: 'Koweït' },
  { id: 10, label: 'Qatar' },
  { id: 13, label: 'Diyanet — Turquie' },
  { id: 1, label: 'Karachi — Pakistan/Inde' },
  { id: 11, label: 'Singapour / Asie du SE' },
  { id: 15, label: 'Moonsighting Committee Worldwide' },
]

// École juridique pour le calcul du ʿAsr.
export const ASR_SCHOOLS = [
  { id: 0, label: 'Standard (Shafi’i, Maliki, Hanbali)' },
  { id: 1, label: 'Hanafi' },
]

// Méthode conseillée par défaut selon le pays (nom FR tel que stocké dans les fiches villes).
const COUNTRY_METHOD: Record<string, number> = {
  France: 12, Belgique: 12, Suisse: 12, Luxembourg: 12,
  'Arabie Saoudite': 4,
  'Émirats Arabes Unis': 8, Oman: 8, Bahreïn: 8,
  Qatar: 10, Koweït: 9,
  Égypte: 5, Maroc: 3, Algérie: 3, Tunisie: 3, Jordanie: 5, Liban: 5,
  Turquie: 13,
  Pakistan: 1, Inde: 1, Bangladesh: 1,
  Malaisie: 11, Singapour: 11, Indonésie: 11, Thaïlande: 11, Brunei: 11,
  'États-Unis': 2, Canada: 2,
  'Royaume-Uni': 3,
}

export function defaultMethodForCountry(pays?: string): number {
  if (!pays) return 3
  return COUNTRY_METHOD[pays] ?? 3
}

export function methodLabel(id: number): string {
  return PRAYER_METHODS.find((m) => m.id === id)?.label ?? `Méthode ${id}`
}
