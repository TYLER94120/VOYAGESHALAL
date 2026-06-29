'use client'
import { useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useLocation } from '@/components/location/LocationProvider'

// Sur /destinations : si une ville est mémorisée avec un slug connu → redirection directe
// vers sa page. On affiche quand même la liste complète si l'URL contient ?all=1
// (lien « Voir toutes les destinations »).
export default function DestinationsRedirect() {
  const { city, ready } = useLocation()
  const router = useRouter()
  const params = useSearchParams()
  const showAll = params.get('all') === '1'

  useEffect(() => {
    if (ready && !showAll && city?.slug) {
      router.replace(`/destinations/${city.slug}`)
    }
  }, [ready, showAll, city, router])

  return null
}
