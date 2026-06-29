'use client'
import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import cityCoords from '@/lib/cityCoords.json'

export interface City {
  slug: string
  nom: string
  pays?: string
  lat?: number
  lng?: number
}

interface Ctx {
  city: City | null
  setCity: (c: City) => void
  setCityBySlug: (slug: string) => City | null
  clearLocation: () => void
  geolocate: () => Promise<City | null>
  geoStatus: 'idle' | 'loading' | 'error'
  ready: boolean
}

const LocationContext = createContext<Ctx>({
  city: null, setCity: () => {}, setCityBySlug: () => null, clearLocation: () => {}, geolocate: async () => null, geoStatus: 'idle', ready: false,
})

const COORDS = cityCoords as City[]

function haversine(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const R = 6371
  const dLat = ((b.lat - a.lat) * Math.PI) / 180
  const dLng = ((b.lng - a.lng) * Math.PI) / 180
  const la1 = (a.lat * Math.PI) / 180
  const la2 = (b.lat * Math.PI) / 180
  const x = Math.sin(dLat / 2) ** 2 + Math.cos(la1) * Math.cos(la2) * Math.sin(dLng / 2) ** 2
  return 2 * R * Math.asin(Math.sqrt(x))
}

export function nearestCity(lat: number, lng: number): City {
  let best = COORDS[0]
  let bestD = Infinity
  for (const c of COORDS) {
    if (c.lat == null || c.lng == null) continue
    const d = haversine({ lat, lng }, { lat: c.lat, lng: c.lng })
    if (d < bestD) { bestD = d; best = c }
  }
  return best
}

export function LocationProvider({ children }: { children: React.ReactNode }) {
  const [city, setCityState] = useState<City | null>(null)
  const [geoStatus, setGeoStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [ready, setReady] = useState(false)

  useEffect(() => {
    try {
      const saved = localStorage.getItem('vh_city')
      if (saved) setCityState(JSON.parse(saved))
    } catch { /* ignore */ }
    setReady(true)
  }, [])

  const setCity = useCallback((c: City) => {
    setCityState(c)
    try { localStorage.setItem('vh_city', JSON.stringify(c)) } catch { /* ignore */ }
  }, [])

  // Sélectionne une ville connue de notre base à partir de son slug (avec ses coordonnées)
  const setCityBySlug = useCallback((slug: string): City | null => {
    const found = COORDS.find((c) => c.slug === slug)
    if (found) { setCity(found); return found }
    return null
  }, [setCity])

  const clearLocation = useCallback(() => {
    setCityState(null)
    try { localStorage.removeItem('vh_city') } catch { /* ignore */ }
  }, [])

  const geolocate = useCallback(async (): Promise<City | null> => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) { setGeoStatus('error'); return null }
    setGeoStatus('loading')
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          // On garde les coordonnées GPS RÉELLES de l'utilisateur (précis pour mosquées/qibla/prière),
          // mais le nom/slug/pays viennent de la ville connue la plus proche (pour l'affichage + redirections).
          const near = nearestCity(pos.coords.latitude, pos.coords.longitude)
          const c: City = { ...near, lat: pos.coords.latitude, lng: pos.coords.longitude }
          setCity(c); setGeoStatus('idle'); resolve(c)
        },
        () => { setGeoStatus('error'); resolve(null) },
        { timeout: 10000 }
      )
    })
  }, [setCity])

  return (
    <LocationContext.Provider value={{ city, setCity, setCityBySlug, clearLocation, geolocate, geoStatus, ready }}>{children}</LocationContext.Provider>
  )
}

export function useLocation() {
  return useContext(LocationContext)
}
