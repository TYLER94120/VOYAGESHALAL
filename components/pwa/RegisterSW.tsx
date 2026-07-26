'use client'
import { useEffect } from 'react'

// Enregistre le service worker (PWA installable). Silencieux si non supporté.
export default function RegisterSW() {
  useEffect(() => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator)) return
    const register = () => navigator.serviceWorker.register('/sw.js').catch(() => {})
    // Si la page est DÉJÀ chargée quand React s'hydrate, « load » ne viendra
    // jamais → enregistrer tout de suite dans ce cas.
    if (document.readyState === 'complete') { register(); return }
    window.addEventListener('load', register)
    return () => window.removeEventListener('load', register)
  }, [])
  return null
}
