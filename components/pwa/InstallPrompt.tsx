'use client'
import { useEffect, useState } from 'react'
import { usePathname } from 'next/navigation'

interface BIPEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISS_KEY = 'vh_pwa_dismissed'

// Bandeau discret « Installer l'app ».
// Android/Chrome : bouton natif (beforeinstallprompt). iOS/Safari : astuce Partager → écran d'accueil.
export default function InstallPrompt() {
  const [deferred, setDeferred] = useState<BIPEvent | null>(null)
  const [show, setShow] = useState(false)
  const [iosHint, setIosHint] = useState(false)
  const pathname = usePathname()
  // Jamais sur la page des horaires : le bandeau ne doit pas masquer les
  // horaires ni les boutons (fix UX prière).
  const suppressed = pathname?.startsWith('/horaires-priere') || pathname?.startsWith('/prayer-times')

  useEffect(() => {
    if (typeof window === 'undefined') return
    // Déjà installé (mode standalone) ou déjà rejeté → on n'affiche rien
    const standalone =
      window.matchMedia('(display-mode: standalone)').matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true
    if (standalone) return
    try { if (localStorage.getItem(DISMISS_KEY)) return } catch {}

    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent)
    if (isIOS) {
      const t = setTimeout(() => { setIosHint(true); setShow(true) }, 3000)
      return () => clearTimeout(t)
    }

    const handler = (e: Event) => {
      e.preventDefault()
      setDeferred(e as BIPEvent)
      setShow(true)
    }
    window.addEventListener('beforeinstallprompt', handler)
    return () => window.removeEventListener('beforeinstallprompt', handler)
  }, [])

  const dismiss = () => {
    setShow(false)
    try { localStorage.setItem(DISMISS_KEY, '1') } catch {}
  }

  const install = async () => {
    if (!deferred) return
    await deferred.prompt()
    await deferred.userChoice
    dismiss()
  }

  if (!show || suppressed) return null

  return (
    <div style={{
      position: 'fixed', left: 12, right: 12, bottom: 'calc(env(safe-area-inset-bottom, 0px) + 74px)',
      zIndex: 300, background: '#0b1a0f', border: '1px solid rgba(201,168,76,0.4)',
      borderRadius: 16, padding: '14px 16px', boxShadow: '0 12px 40px rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', gap: 12, maxWidth: 520, margin: '0 auto',
    }}>
      <div style={{ fontSize: 30, color: '#c9a84c' }}>✦</div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ color: '#f3ece0', fontWeight: 800, margin: 0, fontSize: 14 }}>Installer VoyagesHalal</p>
        <p style={{ color: 'rgba(243,236,224,0.7)', margin: '2px 0 0', fontSize: 12 }}>
          {iosHint
            ? "Touchez Partager ⬆️ puis « Sur l'écran d'accueil »"
            : "Accès rapide, plein écran, comme une app."}
        </p>
      </div>
      {!iosHint && (
        <button onClick={install} style={{ background: '#c9a84c', color: '#0b1a0f', border: 'none', borderRadius: 10, padding: '9px 14px', fontWeight: 800, fontSize: 13, cursor: 'pointer', whiteSpace: 'nowrap' }}>
          Installer
        </button>
      )}
      <button onClick={dismiss} aria-label="Fermer" style={{ background: 'none', border: 'none', color: 'rgba(243,236,224,0.5)', fontSize: 18, cursor: 'pointer', padding: '0 2px' }}>✕</button>
    </div>
  )
}
