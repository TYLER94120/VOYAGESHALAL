// Géolocalisation robuste, partagée par tout le site.
// Gère les 3 cas qui plantent en prod : permission refusée, position indisponible, timeout.

export type GeoErrorCode = 'PERMISSION_DENIED' | 'POSITION_UNAVAILABLE' | 'TIMEOUT' | 'UNSUPPORTED'

export interface GeoError {
  code: GeoErrorCode
  message: string // titre court
  detail: string // explication + action alternative
}

export const isIOS = (): boolean =>
  typeof navigator !== 'undefined' && /iPad|iPhone|iPod/.test(navigator.userAgent)

const TIMEOUT_MS = 8000

// Récupère la position de l'utilisateur. Rejette avec un GeoErrorCode clair.
export function getPosition(): Promise<{ lat: number; lng: number }> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject('UNSUPPORTED' as GeoErrorCode)
      return
    }

    let settled = false
    const timer = setTimeout(() => {
      if (settled) return
      settled = true
      reject('TIMEOUT' as GeoErrorCode)
    }, TIMEOUT_MS)

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        resolve({ lat: pos.coords.latitude, lng: pos.coords.longitude })
      },
      (error) => {
        if (settled) return
        settled = true
        clearTimeout(timer)
        if (error.code === 1) reject('PERMISSION_DENIED' as GeoErrorCode)
        else if (error.code === 2) reject('POSITION_UNAVAILABLE' as GeoErrorCode)
        else reject('TIMEOUT' as GeoErrorCode)
      },
      {
        timeout: TIMEOUT_MS,
        maximumAge: 300000, // accepte une position vieille de 5 min (plus rapide)
        enableHighAccuracy: false, // plus rapide, largement suffisant pour trouver une ville/restos
      }
    )
  })
}

// Transforme un code d'erreur en message clair + action de repli (saisie manuelle).
export function describeGeoError(code: GeoErrorCode): GeoError {
  switch (code) {
    case 'PERMISSION_DENIED':
      return {
        code,
        message: '📵 Accès à la position refusé',
        detail: isIOS()
          ? "Sur iPhone : Réglages > Confidentialité > Service de localisation > Safari > « Lors de l'utilisation ». Ou tapez votre ville ci-dessous."
          : 'Autorisez la localisation dans les paramètres de votre navigateur, ou tapez votre ville ci-dessous.',
      }
    case 'POSITION_UNAVAILABLE':
      return {
        code,
        message: '📡 Position indisponible',
        detail: 'Activez le GPS ou le Wi-Fi, ou tapez votre ville ci-dessous.',
      }
    case 'TIMEOUT':
      return {
        code,
        message: '⏱ Localisation trop lente',
        detail: 'Tapez votre ville pour continuer.',
      }
    case 'UNSUPPORTED':
    default:
      return {
        code: 'UNSUPPORTED',
        message: '🔍 Géolocalisation non disponible',
        detail: "Votre navigateur ne supporte pas cette fonction. Tapez votre ville ci-dessous.",
      }
  }
}
