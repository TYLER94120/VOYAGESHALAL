'use client'
import { useMemo, useState } from 'react'
import EcranCiel, { type FicheEcran } from '@/components/home/EcranCiel'
import SurMesure from '@/components/lieux/SurMesure'
import { useInstantPosition } from '@/lib/useInstantPosition'
import { computePrayerTimesFull } from '@/lib/prayerCalc'
import { cielA, CIELS } from '@/lib/cielDuMoment.mjs'

// 🌅 L'ACCUEIL DES CINQ CIELS — l'assemblage.
//
// EcranCiel met en forme, SurMesure cherche : il n'existe toujours qu'UN
// seul chemin vers /api/lieux, et c'est le sien. Ici on ne fait que lui
// donner la position et récupérer ses adresses.
//
// ⑤ « La réponse change avec le moment » : le ruban et la catégorie
// cherchée découlent de l'heure et de la prochaine prière — jamais d'un
// choix arbitraire, et on écrit toujours POURQUOI dans le ruban.
/** La Qibla, calculée sur place — zéro réseau, comme partout ailleurs. */
function qiblaDe(lat: number, lng: number) {
  const p = Math.PI / 180, kLat = 21.4225 * p, kLng = 39.8262 * p
  const la = lat * p, lo = lng * p
  const y = Math.sin(kLng - lo)
  const x = Math.cos(la) * Math.tan(kLat) - Math.sin(la) * Math.cos(kLng - lo)
  const deg = Math.round(((Math.atan2(y, x) / p) + 360) % 360)
  const dirs = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSO', 'SO', 'OSO', 'O', 'ONO', 'NO', 'NNO']
  return { deg, dir: dirs[Math.round(deg / 22.5) % 16] }
}

export default function AccueilCiel({ posInitiale, en }: {
  posInitiale: { lat: number; lng: number; ville?: string | null } | null
  en: boolean
}) {
  const { pos, source } = useInstantPosition(en)
  const [fiches, setFiches] = useState<FicheEcran[]>([])
  const [ouvert, setOuvert] = useState(false)

  const lat = pos?.lat ?? posInitiale?.lat
  const lng = pos?.lng ?? posInitiale?.lng

  const calc = useMemo(() => {
    if (typeof lat !== 'number' || typeof lng !== 'number') return null
    try {
      const meth = Number((typeof localStorage !== 'undefined' && localStorage.getItem('vh_prayer_method')) || 3)
      const ecole = Number((typeof localStorage !== 'undefined' && localStorage.getItem('vh_prayer_school')) || 0)
      const h = computePrayerTimesFull(lat, lng, meth, ecole, new Date())
      const now = Date.now()
      const ordre = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const
      const suiv = ordre.find((k) => (h[k] as Date).getTime() > now)
      const min = suiv ? Math.round(((h[suiv] as Date).getTime() - now) / 60000) : null
      return {
        ciel: cielA(new Date(), h as unknown as Record<string, Date>) as keyof typeof CIELS,
        horaires: ordre.map((k) => ({
          nom: k, courante: k === suiv,
          heure: (h[k] as Date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
        })),
        priere: suiv && min != null
          ? { nom: suiv, urgent: min <= 30, reste: min >= 60 ? `dans ${Math.floor(min / 60)} h ${String(min % 60).padStart(2, '0')}` : `dans ${min} min` }
          : null,
        minutes: min,
        qibla: qiblaDe(lat, lng),
      }
    } catch { return null }
  }, [lat, lng])

  const ciel = calc?.ciel ?? 'isha'
  const heure = new Date().getHours()

  // Le moment décide de ce qu'on cherche, et le ruban le dit à voix haute.
  const { categorie, ruban } = useMemo(() => {
    if (calc?.minutes != null && calc.minutes <= 30) {
      return { categorie: 'mosquee' as const, ruban: '🕌 Tu peux y être à temps' }
    }
    if (heure >= 23 || heure < 5) return { categorie: 'mosquee' as const, ruban: '🕌 La plus proche, cette nuit' }
    if (heure >= 11 && heure < 14) return { categorie: 'manger' as const, ruban: '🍽 Où déjeuner, tout près' }
    if (heure >= 19 && heure < 23) return { categorie: 'manger' as const, ruban: '🍽 Encore ouvert ce soir' }
    if (heure >= 14 && heure < 19) return { categorie: 'activite' as const, ruban: '🎯 À faire autour de toi' }
    return { categorie: 'manger' as const, ruban: '🍽 À cinq minutes de toi' }
  }, [calc?.minutes, heure])

  return (
    <>
      <EcranCiel
        ciel={ciel}
        lieu={pos?.label ?? posInitiale?.ville ?? 'Ta position'}
        exacte={source === 'gps'}
        priere={calc?.priere ?? null}
        horaires={calc?.horaires ?? []}
        qibla={calc?.qibla ?? null}
        horairesOuverts={ouvert}
        onOuvrirHoraires={() => setOuvert((v) => !v)}
        fiches={fiches}
        ruban={ruban}
      />
      {/* Le champ libre reste — pour tout ce qui sort des catégories. Et
          c'est lui qui porte le moteur : un seul chemin vers /api/lieux. */}
      <div style={{ padding: '10px 14px 0' }}>
        <SurMesure
          fondu en={en} titrePage
          posInitiale={posInitiale ? { lat: posInitiale.lat, lng: posInitiale.lng, ville: posInitiale.ville ?? undefined } : null}
          chercheDesLOuverture={categorie}
          onResultats={(f) => setFiches(f as unknown as FicheEcran[])}
        />
      </div>
    </>
  )
}
