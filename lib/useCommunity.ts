'use client'
import { useCallback, useEffect, useState } from 'react'

// Hook client de la communauté : session légère (token localStorage) + profil.
export interface Me {
  pseudo: string
  points: number
  nbSpots: number
  nbConfirmations: number
  badges: string[]
  niveau: { id: string; fr: string; en: string; icon: string; min: number }
  impact: number
}

const TOKEN_KEY = 'vh_ctoken'
export const getToken = () => { try { return localStorage.getItem(TOKEN_KEY) } catch { return null } }

export function authFetch(url: string, init: RequestInit = {}) {
  const t = getToken()
  return fetch(url, { ...init, headers: { ...(init.headers || {}), ...(t ? { Authorization: `Bearer ${t}` } : {}), 'Content-Type': 'application/json' } })
}

export function useCommunity() {
  const [me, setMe] = useState<Me | null>(null)
  const [loaded, setLoaded] = useState(false)

  const refresh = useCallback(async () => {
    if (!getToken()) { setMe(null); setLoaded(true); return }
    try {
      const r = await authFetch('/api/community/me')
      const j = await r.json()
      setMe(j.user ?? null)
    } catch { setMe(null) }
    setLoaded(true)
  }, [])

  useEffect(() => { void refresh() }, [refresh])

  const sendCode = async (email: string) => {
    const r = await fetch('/api/auth/otp', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email }) })
    if (!r.ok) throw new Error((await r.json()).error || 'Erreur')
  }
  const verify = async (email: string, code: string, pseudo: string) => {
    const r = await fetch('/api/auth/verify', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ email, code, pseudo }) })
    const j = await r.json()
    if (!r.ok) throw new Error(j.error || 'Code incorrect')
    try { localStorage.setItem(TOKEN_KEY, j.token) } catch { /* privé */ }
    await refresh()
    return j.user
  }
  const logout = () => { try { localStorage.removeItem(TOKEN_KEY) } catch { /* noop */ } setMe(null) }

  return { me, loaded, refresh, sendCode, verify, logout }
}
