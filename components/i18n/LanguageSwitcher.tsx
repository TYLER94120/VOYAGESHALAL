'use client'
import { useState, useRef, useEffect } from 'react'
import { LANGS } from '@/lib/i18n/translations'
import { useLanguage } from '@/components/i18n/LanguageProvider'

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

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button onClick={() => setOpen((o) => !o)} aria-label="Changer de langue"
        style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'none', border: 'none', cursor: 'pointer', color: 'inherit', fontSize: '13px', fontWeight: 700, padding: '4px 6px' }}>
        <span>{current.flag}</span><span>{current.short}</span>
        <span style={{ fontSize: '9px', opacity: 0.7 }}>▼</span>
      </button>
      {open && (
        <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, background: '#fff', borderRadius: '12px', boxShadow: '0 12px 34px rgba(11,26,15,0.22)', border: '1px solid rgba(11,26,15,0.08)', padding: '6px', minWidth: '180px', zIndex: 200 }}>
          {LANGS.map((l) => {
            const active = l.code === lang
            return (
              <button key={l.code} onClick={() => { setLang(l.code); setOpen(false) }}
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
