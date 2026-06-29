'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { dict, moreDict, RTL_LANGS, type Lang } from '@/lib/i18n/translations'
import { applyGoogleTranslate } from '@/components/i18n/GoogleTranslate'

interface Ctx {
  lang: Lang
  dir: 'ltr' | 'rtl'
  setLang: (l: Lang) => void
  t: (key: string) => string
}

function lookup(lang: Lang, key: string): string {
  return (dict[lang] as Record<string, string>)?.[key] ?? moreDict[lang]?.[key]
    ?? (dict.fr as Record<string, string>)[key] ?? moreDict.fr[key] ?? key
}

const LanguageContext = createContext<Ctx>({
  lang: 'fr', dir: 'ltr', setLang: () => {}, t: (k) => lookup('fr', k),
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr')

  useEffect(() => {
    if (typeof window === 'undefined') return
    const explicit = localStorage.getItem('vh_lang_explicit') === '1'
    const saved = localStorage.getItem('vh_lang') as Lang | null
    // Choix explicite de l'utilisateur → on le respecte
    if (explicit && saved && dict[saved]) { setLangState(saved); return }
    // Sinon : langue par défaut selon le DOMAINE (gohalaltravel.com → en, voyageshalal.fr → fr)
    const domainLang: Lang = window.location.hostname.includes('gohalaltravel') ? 'en' : 'fr'
    setLangState(domainLang)
    localStorage.setItem('vh_lang', domainLang)
    if (domainLang !== 'fr' && !document.cookie.includes('googtrans')) {
      applyGoogleTranslate(domainLang)
      window.location.reload()
    }
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined') return
    document.documentElement.lang = lang
    document.documentElement.dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr'
  }, [lang])

  const setLang = useCallback((l: Lang) => {
    setLangState(l)
    if (typeof window !== 'undefined') {
      localStorage.setItem('vh_lang', l)
      localStorage.setItem('vh_lang_explicit', '1') // choix explicite de l'utilisateur
    }
  }, [])

  const t = useCallback((key: string) => lookup(lang, key), [lang])

  const dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr'

  return (
    <LanguageContext.Provider value={{ lang, dir, setLang, t }}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
