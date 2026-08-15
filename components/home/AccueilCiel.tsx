'use client'
import { useEffect, useMemo, useState } from 'react'
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
  /**
   * 🔴🔴 ON NE S'OUVRE PLUS SUR DES RESTAURANTS.
   *
   * Mohamed, 16 août : « Dès qu'on ouvre la page d'accueil, il y a déjà des
   * restaurants d'ouverts, et ça, ce n'est pas bon. » Il a raison, et ça
   * rejoint ce qu'il avait écrit plus tôt : « VoyagesHalal n'est pas une
   * appli de restauration. S'ouvrir sur un traiteur, c'est perdre le voyage
   * ET la prière d'un coup. »
   *
   * Une adresse ne s'impose donc QUE si le moment la justifie :
   *   · une prière dans moins d'une heure → la mosquée, c'est urgent ;
   *   · la nuit → la Qibla, et rien à chercher ;
   *   · quelqu'un qui REVIENT, à l'heure d'un repas → il sait ce qu'il
   *     vient chercher, on lui répond.
   * Sinon : les quatre portes, et il choisit. Un premier visiteur découvre
   * un site, il ne cherche pas un dîner.
   *
   * Effet de bord heureux : aucun appel à Google pour un visiteur qui ne
   * demande rien. Le quota sert à ceux qui cherchent vraiment.
   */
  const [dejaVenu, setDejaVenu] = useState<boolean | null>(null)
  useEffect(() => {
    try {
      setDejaVenu(localStorage.getItem('vh_deja_venu') === '1')
      localStorage.setItem('vh_deja_venu', '1')
    } catch { setDejaVenu(false) }
  }, [])

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
        // ⏱️ La FIN de la fenêtre courante, et la part déjà écoulée.
        // C'est ce couple qui permet la jauge de temps et le croisement
        // prière × distance. Sans lui, on n'écrit rien : on ne devine pas
        // une heure de prière.
        finPriere: suiv ? (h[suiv] as Date) : null,
        partEcoulee: (() => {
          const i = ordre.indexOf(suiv as typeof ordre[number])
          if (i < 0) return null
          // Le début de la fenêtre courante : la prière précédente. Avant
          // Fajr, la fenêtre est celle d'Isha — elle traverse minuit.
          const debut = i === 0 ? (h.Isha as Date).getTime() - 86_400_000 : (h[ordre[i - 1]] as Date).getTime()
          const fin = (h[suiv as typeof ordre[number]] as Date).getTime()
          if (!(fin > debut)) return null
          return Math.min(1, Math.max(0, (now - debut) / (fin - debut)))
        })(),
        qibla: qiblaDe(lat, lng),
      }
    } catch { return null }
  }, [lat, lng])

  const ciel = calc?.ciel ?? 'isha'
  const heure = new Date().getHours()

  // 🔴 LE MOMENT DÉCIDE, ET LE RUBAN PROPOSE — il n'impose pas.
  //
  // Mohamed, 16 août : « La prière passe devant à MOINS D'UNE HEURE, pas
  // trente minutes. À "Maghrib dans 1 h 21", c'est la mosquée qui domine. »
  // Et : « le ruban propose : "À côté de toi ce soir", pas "ENCORE OUVERT
  // CE SOIR" » — une proposition, pas une injonction.
  const { categorie, ruban, mode } = useMemo(() => {
    const nuit = heure >= 23 || heure < 5
    // La nuit : la Qibla, et RIEN à chercher — donc aucun appel.
    if (nuit) return { categorie: undefined, ruban: '🧭 Tourne-toi vers La Mecque', mode: 'nuit' as const }
    // La prière passe devant à moins d'une heure. C'est le seul cas où une
    // adresse s'impose sans qu'on ait rien demandé — et elle est urgente.
    if (calc?.minutes != null && calc.minutes <= 60) {
      return { categorie: 'mosquee' as const, ruban: '🕌 Tu peux y être à temps', mode: 'priere' as const }
    }
    // Un visiteur qui REVIENT, à l'heure d'un repas : on répond.
    if (dejaVenu === true && heure >= 11 && heure < 14) return { categorie: 'manger' as const, ruban: '🍽 Où déjeuner, tout près', mode: 'normal' as const }
    if (dejaVenu === true && heure >= 19 && heure < 23) return { categorie: 'manger' as const, ruban: '🍽 À côté de toi ce soir', mode: 'normal' as const }
    // Tout le reste — et notamment le premier visiteur : les quatre portes.
    return { categorie: undefined, ruban: '', mode: 'portes' as const }
  }, [calc?.minutes, heure, dejaVenu])

  // 🔴 L'ORDRE DE L'ÉCRAN CHANGE — décision de Mohamed du 15 août au soir :
  // « ① la barre de recherche, l'élément DOMINANT de la page · ② trois
  // onglets · ③ une bande FINE en bas pour les horaires et la Qibla. C'est
  // une information de référence, pas le sujet de la page. »
  // La recherche passe donc en tête, la prière descend en bande fine.
  return (
    <>
      <div style={{ padding: '10px 14px 0' }}>
        <SurMesure
          fondu en={en} titrePage
          posInitiale={posInitiale ? { lat: posInitiale.lat, lng: posInitiale.lng, ville: posInitiale.ville ?? undefined } : null}
          chercheDesLOuverture={categorie}
          onResultats={(f) => setFiches(f as unknown as FicheEcran[])}
        />
      </div>
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
        mode={mode}
        verdict={null}
        finPriere={calc?.finPriere ?? null}
        partEcoulee={calc?.partEcoulee ?? null}
      />
    </>
  )
}
