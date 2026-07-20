import * as adhan from 'adhan'
import { PRAYER_KEYS, type PrayerKey } from '@/lib/adhan'

// Mappe nos identifiants de méthode (AlAdhan) vers les paramètres de la lib adhan.
function paramsFor(method: number, school: number) {
  const CM = adhan.CalculationMethod
  let p
  switch (method) {
    case 2: p = CM.NorthAmerica(); break
    case 1: p = CM.Karachi(); break
    case 4: p = CM.UmmAlQura(); break
    case 5: p = CM.Egyptian(); break
    case 8: p = CM.Dubai(); break
    case 9: p = CM.Kuwait(); break
    case 10: p = CM.Qatar(); break
    case 11: p = CM.Singapore(); break
    case 13: p = CM.Turkey(); break
    case 15: p = CM.MoonsightingCommittee(); break
    case 12: p = CM.Other(); p.fajrAngle = 12; p.ishaAngle = 12; break // UOIF France
    case 3:
    default: p = CM.MuslimWorldLeague(); break
  }
  p.madhab = school === 1 ? adhan.Madhab.Hanafi : adhan.Madhab.Shafi
  return p
}

// Horaires absolus (Date UTC) du jour donné — aucune gestion de fuseau nécessaire.
export function computePrayerTimes(
  lat: number, lng: number, method: number, school: number, date = new Date()
): Record<PrayerKey, Date> {
  const coords = new adhan.Coordinates(lat, lng)
  const pt = new adhan.PrayerTimes(coords, date, paramsFor(method, school))
  return { Fajr: pt.fajr, Dhuhr: pt.dhuhr, Asr: pt.asr, Maghrib: pt.maghrib, Isha: pt.isha }
}

// Variante avec le lever du soleil (fin de la fenêtre du Fajr) — Radar Prière
export function computePrayerTimesFull(
  lat: number, lng: number, method: number, school: number, date = new Date()
): Record<PrayerKey, Date> & { Sunrise: Date } {
  const coords = new adhan.Coordinates(lat, lng)
  const pt = new adhan.PrayerTimes(coords, date, paramsFor(method, school))
  return { Fajr: pt.fajr, Dhuhr: pt.dhuhr, Asr: pt.asr, Maghrib: pt.maghrib, Isha: pt.isha, Sunrise: pt.sunrise }
}

export { PRAYER_KEYS }
export type { PrayerKey }
