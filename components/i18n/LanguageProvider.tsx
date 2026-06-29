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
    const saved = (typeof window !== 'undefined' && localStorage.getItem('vh_lang')) as Lang | null
    if (saved && dict[saved]) { setLangState(saved); return }
    // Première visite sans préférence → langue par défaut selon le DOMAINE.
    // gohalaltravel.com → anglais ; voyageshalal.fr → français.
    if (typeof window === 'undefined') return
    const domainLang: Lang = window.location.hostname.includes('gohalaltravel') ? 'en' : 'fr'
    if (domainLang === 'fr') return
    localStorage.setItem('vh_lang', domainLang)
    setLangState(domainLang)
    // Applique la traduction de toute la page une seule fois (puis rechargement)
    if (!document.cookie.includes('googtrans')) {
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
    if (typeof window !== 'undefined') localStorage.setItem('vh_lang', l)
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
