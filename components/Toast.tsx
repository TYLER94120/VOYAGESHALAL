'use client'
import { useState, useEffect } from 'react'

type ToastType = 'default' | 'success'
let showToastGlobal: ((msg: string, type?: ToastType) => void) | null = null

export function useToast() {
  return (msg: string, type: ToastType = 'default') => showToastGlobal?.(msg, type)
}

export function ToastProvider() {
  const [visible, setVisible] = useState(false)
  const [msg, setMsg] = useState('')
  const [type, setType] = useState<ToastType>('default')

  useEffect(() => {
    showToastGlobal = (message: string, t: ToastType = 'default') => {
      setMsg(message)
      setType(t)
      setVisible(true)
      setTimeout(() => setVisible(false), 2600)
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
        background: 'var(--nuit)',
        border: `1px solid ${type === 'success' ? 'rgba(201,168,76,0.6)' : 'rgba(201,168,76,0.3)'}`,
        borderLeft: type === 'success' ? '3px solid var(--or)' : undefined,
        color: 'var(--creme)',
        borderRadius: '14px',
        padding: '0.7rem 1.1rem',
        fontSize: '14px',
        fontWeight: 600,
        boxShadow: '0 10px 30px rgba(11,26,15,0.3)',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        maxWidth: '320px',
      }}
    >
      {type === 'success' && <span style={{ color: 'var(--or)' }}>✓</span>}
      {msg}
    </div>
  )
}
