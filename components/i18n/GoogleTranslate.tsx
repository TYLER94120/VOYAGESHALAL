'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react'

// Google Translate est désormais chargé UNIQUEMENT À LA DEMANDE : le moteur ne
// s'injecte que si l'utilisateur a explicitement choisi une des 8 langues
// secondaires (cookie `googtrans` présent, hors fr/en). Par défaut, le domaine
// FR sert du français en dur et le domaine EN de l'anglais en dur — aucun script
// Google Translate ne s'exécute, plus de re-traduction parasite.
function hasActiveGoogtrans(): boolean {
  if (typeof document === 'undefined') return false
  const m = document.cookie.match(/(?:^|;\s*)googtrans=([^;]+)/)
  if (!m) return false
  const val = decodeURIComponent(m[1]) // ex. /fr/ar
  const target = val.split('/')[2]
  return !!target && target !== 'fr' && target !== 'en'
}

export default function GoogleTranslate() {
  useEffect(() => {
    if (!hasActiveGoogtrans()) return // langue par défaut → on ne charge pas GT
    if (document.getElementById('google-translate-script')) return
    ;(window as any).googleTranslateElementInit = () => {
      try {
        new (window as any).google.translate.TranslateElement(
          {
            pageLanguage: 'fr',
            includedLanguages: 'fr,en,ar,id,tr,ur,ms,de,nl,es',
            autoDisplay: false,
          },
          'google_translate_element'
        )
      } catch {
        /* moteur indisponible — dégradation silencieuse */
      }
    }
    const s = document.createElement('script')
    s.id = 'google-translate-script'
    s.src = 'https://translate.google.com/translate_a/element.js?cb=googleTranslateElementInit'
    document.body.appendChild(s)
  }, [])

  return <div id="google_translate_element" style={{ display: 'none' }} aria-hidden />
}

// Applique une langue : positionne le cookie googtrans puis recharge.
export function applyGoogleTranslate(lang: string) {
  if (typeof document === 'undefined') return
  const value = lang === 'fr' ? '/fr/fr' : `/fr/${lang}`
  // path racine + variantes de domaine pour fiabilité
  const host = window.location.hostname
  const expires = 'path=/'
  document.cookie = `googtrans=${value};${expires}`
  document.cookie = `googtrans=${value};${expires};domain=${host}`
  document.cookie = `googtrans=${value};${expires};domain=.${host}`
}
