'use client'
/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect } from 'react'

// Charge le moteur Google Translate (caché). La traduction réelle de toute la page
// (interface + contenu éditorial) est déclenchée via le cookie `googtrans`,
// positionné par le sélecteur de langue. Couvre desktop + mobile, toutes les pages.
export default function GoogleTranslate() {
  useEffect(() => {
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
