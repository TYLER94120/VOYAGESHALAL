'use client'
import { useEffect, useState } from 'react'

// Affiche la marque selon le domaine : GoHalalTravel.com sur le .com, VoyagesHalal.fr sinon.
export default function BrandName({ fr = 'VoyagesHalal.fr', en = 'GoHalalTravel.com', isEN = false }: { fr?: string; en?: string; isEN?: boolean }) {
  // Valeur initiale fournie par le serveur (domaine) → aucun flash.
  const [name, setName] = useState(isEN ? en : fr)
  useEffect(() => {
    if (typeof window !== 'undefined' && window.location.hostname.includes('gohalaltravel')) setName(en)
  }, [en])
  return <>{name}</>
}
