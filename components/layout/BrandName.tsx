'use client'
import { useEffect, useState } from 'react'

// Affiche la marque selon le domaine : GoHalalTravel.com sur le .com, VoyagesHalal.fr sinon.
export default function BrandName({ fr = 'VoyagesHalal.fr', en = 'GoHalalTravel.com' }: { fr?: string; en?: string }) {
  const [name, setName] = useState(fr)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname.includes('gohalaltravel')) setName(en)
  }, [en])
  return <>{name}</>
}
