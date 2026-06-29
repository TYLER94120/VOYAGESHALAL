import geomagnetism from 'geomagnetism'

// Déclinaison magnétique (écart Nord magnétique ↔ Nord géographique) au point donné,
// via le World Magnetic Model (WMM). Positive = Est. Sert à convertir le cap magnétique
// de la boussole en cap vrai, pour pointer la Qibla par rapport au Nord géographique.
export function getDeclination(lat: number, lng: number): number {
  try {
    return geomagnetism.model().point([lat, lng]).decl
  } catch {
    return 0
  }
}
