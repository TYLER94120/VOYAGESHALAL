'use client'
import { useState, useEffect } from 'react'

let showToastGlobal: ((msg: string) => void) | null = null

export function useToast() {
  return (msg: string) => showToastGlobal?.(msg)
}

export function ToastProvider() {
  const [visible, setVisible] = useState(false)
  const [msg, setMsg] = useState('')

  useEffect(() => {
    showToastGlobal = (message: string) => {
      setMsg(message)
      setVisible(true)
      setTimeout(() => setVisible(false), 2200)
    }
    return () => {
      showToastGlobal = null
    }
  }, [])

  return (
    <div
      style={{
        position: 'fixed',
        bottom: '5rem',
        left: '50%',
        transform: visible ? 'translate(-50%, 0) scale(1)' : 'translate(-50%, 12px) scale(0.95)',
        opacity: visible ? 1 : 0,
        transition: 'all 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)',
        pointerEvents: 'none',
        zIndex: 9999,
        background: 'var(--foret)',
        color: 'white',
        borderRadius: '20px',
        padding: '0.6rem 1.25rem',
        fontSize: '14px',
        fontWeight: 600,
        boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
      }}
    >
      ✓ {msg}
    </div>
  )
}
