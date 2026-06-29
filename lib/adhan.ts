// Muezzins disponibles pour l'adhan dans l'app (audio chargé côté navigateur).
export interface Muezzin {
  id: string
  name: string
  url: string
}

export const MUEZZINS: Muezzin[] = [
  { id: 'makkah', name: 'La Mecque — Masjid al-Harâm', url: 'https://www.islamcan.com/audio/adhan/azan2.mp3' },
  { id: 'madinah', name: 'Médine — Masjid an-Nabawî', url: 'https://www.islamcan.com/audio/adhan/azan1.mp3' },
  { id: 'mishary', name: 'Mishary Rashid Alafasy', url: 'https://www.islamcan.com/audio/adhan/azan4.mp3' },
  { id: 'egypt', name: 'Adhan d’Égypte', url: 'https://www.islamcan.com/audio/adhan/azan5.mp3' },
  { id: 'turkey', name: 'Adhan de Turquie', url: 'https://www.islamcan.com/audio/adhan/azan9.mp3' },
]

export const PRAYER_KEYS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const
export type PrayerKey = (typeof PRAYER_KEYS)[number]

export const PRAYER_LABELS: Record<PrayerKey, string> = {
  Fajr: 'Fajr', Dhuhr: 'Dhuhr', Asr: 'ʿAsr', Maghrib: 'Maghrib', Isha: 'ʿIshâ',
}
