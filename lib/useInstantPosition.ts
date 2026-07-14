'use client'
import { useEffect, useRef, useState, useCallback } from 'react'
import { useLocation } from '@/components/location/LocationProvider'
import { getPosition, describeGeoError, type GeoError, type GeoErrorCode } from '@/lib/geo'

// Position INSTANTANÉE partagée par tous les outils géolocalisés
// (horaires, qibla, mosquée proche, autour de moi). Principe « Muslim Pro » :
// un résultat utile s'affiche tout de suite, le GPS ne bloque JAMAIS.
//
// Ordre de résolution (du plus rapide) :
//   1. dernière position utilisée (localStorage, partagée entre les outils)
//   2. ville mémorisée du site (LocationProvider)
//   3. Paris par défaut — affiché immédiatement
//   4. géoloc IP (/api/geoip) en arrière-plan → transition douce
//   5. GPS en arrière-plan UNIQUEMENT si la permission est déjà accordée
// + refineGps() : affinage GPS à la demande (bouton), avec états d'erreur.

export type PosSource = 'last' | 'city' | 'default' | 'ip' | 'gps' | 'manual'

export interface InstantPos {
  lat: number
  lng: number
  label: string
  pays?: string
}

const LAST_KEY = 'vh_last_pos'
const LEGACY_KEYS = ['vh_prayer_last_pos']
export const DEFAULT_POS: InstantPos = { lat: 48.8566, lng: 2.3522, label: 'Paris', pays: 'France' }

export function useInstantPosition(en = false) {
  const { city } = useLocation()
  const [pos, setPosState] = useState<InstantPos | null>(null)
  const [source, setSource] = useState<PosSource>('default')
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoErr, setGeoErr] = useState<GeoError | null>(null)
  const resolved = useRef(false)

  const setPos = useCallback((p: InstantPos, s: PosSource) => {
    setPosState(p); setSource(s)
    if (s !== 'default') {
      try { localStorage.setItem(LAST_KEY, JSON.stringify(p)) } catch { /* stockage privé */ }
    }
  }, [])

  useEffect(() => {
    if (resolved.current) return
    resolved.current = true

    // 1) Dernière position (clé partagée, avec reprise des anciennes clés)
    let initial: InstantPos | null = null
    let s: PosSource = 'default'
    try {
      for (const k of [LAST_KEY, ...LEGACY_KEYS]) {
        const saved = JSON.parse(localStorage.getItem(k) || 'null')
        if (saved && typeof saved.lat === 'number' && typeof saved.lng === 'number') {
          initial = { lat: saved.lat, lng: saved.lng, label: saved.label || (en ? 'Last position' : 'Dernière position'), pays: saved.pays }
          s = 'last'
          break
        }
      }
    } catch { /* noop */ }
    // 2) Ville mémorisée du site
    if (!initial && city && city.lat != null && city.lng != null) {
      initial = { lat: city.lat, lng: city.lng, label: city.nom, pays: city.pays }
      s = 'city'
    }
    // 3) Défaut immédiat — l'outil affiche un résultat TOUT DE SUITE
    if (!initial) { initial = DEFAULT_POS; s = 'default' }
    setPos(initial, s)

    // 4) Géoloc IP en arrière-plan — n'écrase que le défaut
    if (s === 'default') {
      fetch('/api/geoip')
        .then((r) => r.json())
        .then((j) => {
          if (j?.ok && typeof j.lat === 'number') {
            setPos({ lat: j.lat, lng: j.lng, label: j.city || (en ? 'Around you' : 'Autour de vous') }, 'ip')
          }
        })
        .catch(() => { /* on garde le défaut */ })
    }

    // 5) GPS silencieux si (et seulement si) la permission est déjà accordée
    try {
      navigator.permissions?.query({ name: 'geolocation' as PermissionName }).then((st) => {
        if (st.state === 'granted') {
          getPosition().then(({ lat, lng }) => {
            setPos({ lat, lng, label: en ? 'My position' : 'Ma position' }, 'gps')
          }).catch(() => { /* silencieux */ })
        }
      }).catch(() => { /* Safari sans permissions API */ })
    } catch { /* noop */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city])

  // Affinage GPS à la demande (bouton « Ma position exacte ») — 8-12 s max
  const refineGps = useCallback(async () => {
    setGeoLoading(true); setGeoErr(null)
    try {
      const { lat, lng } = await getPosition({ highAccuracy: true })
      setPos({ lat, lng, label: en ? 'My exact location' : 'Ma position exacte' }, 'gps')
      return true
    } catch (code) {
      setGeoErr(describeGeoError(code as GeoErrorCode))
      return false
    } finally {
      setGeoLoading(false)
    }
  }, [en, setPos])

  const setManual = useCallback((p: InstantPos) => setPos(p, 'manual'), [setPos])

  return { pos, source, geoLoading, geoErr, refineGps, setManual }
}
