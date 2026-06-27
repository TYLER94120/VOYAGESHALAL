'use client'
import { useState } from 'react'

interface ShareProps {
  titre: string
  url: string
  description?: string
}

export function ShareButtons({ titre, url, description }: ShareProps) {
  const [copied, setCopied] = useState(false)

  const messageWA = encodeURIComponent(
    `🕌 ${titre}\n\n${description || ''}\n\n🔗 ${url}\n\nVia VoyagesHalal.fr — Le guide de l'Oumma`
  )
  const waLink = `https://wa.me/?text=${messageWA}`
  const fbLink = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`

  const copierLien = async () => {
    try {
      await navigator.clipboard.writeText(url)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // clipboard unavailable
    }
  }

  return (
    <div className="share-buttons">
      <span className="share-label">Partager :</span>
      <a href={waLink} target="_blank" rel="noopener noreferrer" className="share-btn share-wa">
        <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
          <path d="M12 0C5.373 0 0 5.373 0 12c0 2.123.553 4.116 1.526 5.849L.057 23.997l6.304-1.654A11.95 11.95 0 0012 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.882a9.882 9.882 0 01-5.034-1.375l-.36-.214-3.742.981 1-3.641-.235-.374A9.86 9.86 0 012.118 12C2.118 6.476 6.476 2.118 12 2.118c5.523 0 9.882 4.358 9.882 9.882 0 5.523-4.359 9.882-9.882 9.882z" />
        </svg>
        WhatsApp
      </a>
      <a href={fbLink} target="_blank" rel="noopener noreferrer" className="share-btn share-fb">
        Facebook
      </a>
      <button onClick={copierLien} className="share-btn share-copy">
        {copied ? '✅ Copié !' : '🔗 Copier'}
      </button>
    </div>
  )
}
