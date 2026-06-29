'use client'
import { useEffect } from 'react'
import { useLocation, type City } from '@/components/location/LocationProvider'

// Mémorise automatiquement la ville quand l'utilisateur arrive directement sur
// une page ville (ex. /destinations/istanbul) sans en avoir encore choisi une.
export default function CitySync({ city: data }: { city: City }) {
  const { city, setCity } = useLocation()
  useEffect(() => {
    if (!city && data.lat != null && data.lng != null) setCity(data)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])
  return null
}
