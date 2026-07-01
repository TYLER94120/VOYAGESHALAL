'use client'
import { useState, useRef, useEffect } from 'react'
import { LANGS } from '@/lib/i18n/translations'
import { useLanguage } from '@/components/i18n/LanguageProvider'
import { applyGoogleTranslate } from '@/components/i18n/GoogleTranslate'

export default function LanguageSwitcher() {
  const { lang, setLang } = useLanguage()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const current = LANGS.find((l) => l.code === lang) ?? LANGS[0]

  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false) }
    document.addEventListener('mousedown', h)
    return () => document.removeEventListener('mousedown', h)
  }, [])

  // FR et EN sont des DOMAINES distincts (voyageshalal.fr / gohalaltravel.com).
  // Cliquer FR/EN doit ouvrir la MÊME page sur l'autre domaine (pas la home, pas
  // une traduction Google en place). Les autres langues utilisent Google Translate.
  function selectLang(code: string) {
    setOpen(false)
    if (code === 'fr' || code === 'en') {
      const targetHost = code === 'en' ? 'www.gohalaltravel.com' : 'www.voyageshalal.fr'
      const onEn = window.location.hostname.includes('gohalaltravel')
      const alreadyThere = (code === 'en' && onEn) || (code === 'fr' && !onEn)
      if (!alreadyThere) {
        window.location.href = `https://${targetHost}${window.location.pathname}${window.location.search}`
        return
      }
    }
    setLang(code as typeof lang)
    applyGoogleTranslate(code as typeof lang)
    setTimeout(() => window.location.reload(), 60)
  }

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen((o) => !o)} aria-label="Changer de langue"
        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '13px', fontWeight: 700, padding: '4px 6px' }}>
        <span style={{ fontSize: '14px' }} aria-hidden>🌐</span><span>{current.short}</span>
        <span style={{ fontSize: '9px', opacity: 0.7 }}>▼</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#fff', borderRadius: '12px', boxShadow: '0 12px 34px rgba(11,26,15,0.22)', border: '1px solid rgba(11,26,15,0.08)', padding: '6px', minWidth: '180px', zIndex: 200 }}>
          {LANGS.map((l) => {
            const active = l.code === lang
            return (
              <button key={l.code} onClick={() => selectLang(l.code)}
                style={{ display: 'flex', alignItems: 'center', gap: '10px', width: '100%', padding: '9px 12px', border: 'none', borderRadius: '9px', background: active ? '#1b4332' : 'transparent', color: active ? '#fdfaf3' : '#1a1a1a', cursor: 'pointer', fontSize: '14px', fontWeight: active ? 700 : 500, textAlign: 'left' }}>
                <span style={{ fontSize: '16px' }}>{l.flag}</span>
                <span>{l.name}</span>
                <span style={{ marginLeft: 'auto', fontSize: '11px', opacity: 0.6 }}>{l.short}</span>
              </button>
            )
          })}
        </div>
      )}
    </div>
  )
}
