'use client'
import { useEffect } from 'react'
import { useInstantPosition } from '@/lib/useInstantPosition'
import { computePrayerTimesFull } from '@/lib/prayerCalc'
import { cielA, degrade, CIELS } from '@/lib/cielDuMoment.mjs'

// 🌅 L'HEURE FAIT L'ÉCRAN.
//
// Ce composant ne dessine rien : il pose deux variables CSS sur la racine,
// et toute l'interface les suit. La teinte est choisie sur les VRAIS
// horaires de prière du lieu où l'on se trouve — pas sur l'heure de
// l'horloge : à Oslo en juin et à Dakar, le même « 20 h » n'est pas le
// même moment de la journée.
//
// 🔴 LA TRANSITION NE SE FAIT QU'AU CHARGEMENT. « Jamais pendant que le
// visiteur lit » : on calcule une fois, on pose, et on ne repasse que si la
// position change vraiment de lieu. Un écran qui change de couleur sous les
// yeux de quelqu'un qui lit une adresse, c'est une distraction, pas une
// ambiance.
export default function CielDuMoment() {
  const { pos } = useInstantPosition()
  const lat = pos?.lat, lng = pos?.lng

  useEffect(() => {
    if (typeof document === 'undefined') return
    let cle = 'isha'
    try {
      if (typeof lat === 'number' && typeof lng === 'number') {
        const meth = Number(localStorage.getItem('vh_prayer_method') || 3)
        const ecole = Number(localStorage.getItem('vh_prayer_school') || 0)
        const h = computePrayerTimesFull(lat, lng, meth, ecole, new Date())
        cle = cielA(new Date(), h as unknown as Record<string, Date>)
      }
    } catch { /* horaires inconnus : la nuit, sobre, par défaut */ }
    const r = document.documentElement
    r.style.setProperty('--ciel-fond', degrade(cle))
    r.style.setProperty('--ciel-accent', CIELS[cle as keyof typeof CIELS].accent)
    r.dataset.ciel = cle
  }, [lat, lng])

  return null
}
