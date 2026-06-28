'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { dict, RTL_LANGS, type Lang, type TranslationKey } from '@/lib/i18n/translations'

interface Ctx {
  lang: Lang
  dir: 'ltr' | 'rtl'
  setLang: (l: Lang) => void
  t: (key: TranslationKey) => string
}

const LanguageContext = createContext<Ctx>({
  lang: 'fr', dir: 'ltr', setLang: () => {}, t: (k) => dict.fr[k] ?? k,
})

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [lang, setLangState] = useState<Lang>('fr')

  useEffect(() => {
    const saved = (typeof window !== 'undefined' && localStorage.getItem('vh_lang')) as Lang | null
    if (saved && dict[saved]) setLangState(saved)
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

  const t = useCallback((key: TranslationKey) => dict[lang]?.[key] ?? dict.fr[key] ?? key, [lang])

  const dir = RTL_LANGS.includes(lang) ? 'rtl' : 'ltr'

  return (
    <LanguageContext.Provider value={{ lang, dir, setLang, t }}>{children}</LanguageContext.Provider>
  )
}

export function useLanguage() {
  return useContext(LanguageContext)
}
