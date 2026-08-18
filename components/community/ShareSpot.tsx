'use client'
import { useState } from 'react'

// Partage d'un spot en 1 tap — Web Share natif (WhatsApp, etc.) avec repli
// copie du lien. Le canal n°1 de la communauté, c'est WhatsApp.
export default function ShareSpot({ nom, ville, url, en = false, compact = false }: { nom: string; ville: string; url: string; en?: boolean; compact?: boolean }) {
  const [copied, setCopied] = useState(false)
  const share = async () => {
    const text = en
      ? `${nom} — a halal gem in ${ville}, shared by the Muslim community 🤲`
      : `${nom} — une pépite halal à ${ville}, partagée par la communauté 🤲`
    try {
      if (navigator.share) { await navigator.share({ title: nom, text, url }); return }
    } catch { /* annulé */ }
    try {
      await navigator.clipboard.writeText(`${text}\n${url}`)
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    } catch { window.prompt(en ? 'Copy the link:' : 'Copie le lien :', url) }
  }
  if (compact) {
    return (
      <button onClick={share} style={{ minHeight: 42, padding: '0 14px', borderRadius: 999, border: '1.5px solid rgba(201,168,76,0.4)', background: 'transparent', color: 'var(--creme)', fontWeight: 700, fontSize: 13.5, cursor: 'pointer' }}>
        {copied ? '✓' : '📤'} {copied ? (en ? 'Copied' : 'Copié') : (en ? 'Share' : 'Partager')}
      </button>
    )
  }
  return (
    <button onClick={share} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, width: '100%', minHeight: 54, borderRadius: 16, border: '2px solid rgba(27,67,50,0.3)', background: '#fff', color: '#1b4332', fontWeight: 800, fontSize: 15, cursor: 'pointer', margin: '10px 0 0' }}>
      {copied ? '✓' : '📤'} {copied ? (en ? 'Link copied!' : 'Lien copié !') : (en ? 'Share this find (WhatsApp…)' : 'Partager cette trouvaille (WhatsApp…)')}
    </button>
  )
}
