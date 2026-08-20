'use client'
import { useEffect, useMemo, useState } from 'react'
import Immersion, { type Pool } from '@/components/villes/Immersion'
// (la couche pratique plein écran vit en bas de ce fichier)
import PageVille from '@/components/villes/PageVille'

// 🎬 LE CHEF D'ORCHESTRE DE LA PAGE VILLE (chantier Immersion).
//
// Un seul fetch du pool décide de tout :
//   · pool riche (≥ 4 lieux au-dessus des seuils) → le flux Immersion EST
//     la page, et la couche pratique (hôtels, adresses, planning, à
//     savoir) vit dessous, SANS verdict ni sommaire — le verdict est le
//     panneau 1 du flux. Remplace, ne juxtapose pas.
//   · pool vide ou API muette → PageVille complète, comme avant. Jamais
//     un écran noir, jamais un flux inventé pour remplir.
//
// Le HalalScore et son niveau sont calculés UNE fois ici (base_vh,
// validé 0–10) et servis aux deux couches.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type VilleData = any

export default function VilleExperience({ ville, en = false }: { ville: VilleData; en?: boolean }) {
  const t = (fr: string, an: string) => (en ? an : fr)
  const [pool, setPool] = useState<Pool | null | undefined>(undefined)

  useEffect(() => {
    const ac = new AbortController()
    const to = setTimeout(() => ac.abort(), 12000)
    fetch(`/api/immersion?slug=${encodeURIComponent(ville.slug ?? '')}&lang=${en ? 'en' : 'fr'}`, { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : null))
      .then((j: Pool | null) => setPool(j && Array.isArray(j.panneaux) && j.panneaux.length >= 4 ? j : null))
      .catch(() => setPool(null))
      .finally(() => clearTimeout(to))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const score = typeof ville.halalScore === 'number' && ville.halalScore > 0 && ville.halalScore <= 10 ? ville.halalScore as number : null
  const ton = score == null ? null : score >= 9 ? 'vert-fonce' : score >= 8 ? 'vert' : score >= 7 ? 'orange' : 'gris'
  const niveau = useMemo(() => score == null ? null
    : score >= 9 ? t('Excellent — tout est simple sur place', 'Excellent — everything is easy there')
    : score >= 8 ? t('Très bon — voyage confortable', 'Very good — a comfortable trip')
    : score >= 7 ? t('Acceptable — voyage possible, un peu de préparation', 'Acceptable — doable with a little planning')
    : t('Exigeant — bien préparer chaque journée', 'Demanding — plan each day carefully'),
  // eslint-disable-next-line react-hooks/exhaustive-deps
  [score, en])

  // Squelette sombre < 2 s : le premier panneau arrive, rien ne saute.
  if (pool === undefined) {
    return (
      <div style={{ minHeight: '100svh', background: '#060E08', display: 'grid', placeItems: 'center' }} aria-hidden>
        <div className="squelette" style={{ width: 220, height: 16, borderRadius: 8, background: 'rgba(253,250,243,0.08)' }} />
      </div>
    )
  }

  return pool
    ? <ImmersionAvecPratique ville={ville} en={en} pool={pool} score={score} ton={ton} niveau={niveau} />
    : <PageVille ville={ville} en={en} mode="complet" />
}

/** L'Immersion EST la page ; la couche pratique (hôtels, adresses,
 *  planning, à savoir) ne vit plus EN DESSOUS (« ce qui est en dessous,
 *  on le supprime » — Mohamed, 19 août) : elle s'ouvre PAR-DESSUS le
 *  flux, en plein écran, depuis la feuille « ☰ Pratique » et depuis
 *  « Construire mes journées ». Un bouton sans destination n'existe pas. */
function ImmersionAvecPratique({ ville, en, pool, score, ton, niveau }: {
  ville: VilleData; en: boolean; pool: Pool
  score: number | null; ton: string | null; niveau: string | null
}) {
  const t = (fr: string, an: string) => (en ? an : fr)
  const [section, setSection] = useState<string | null>(null)

  // « Build my days » depuis My saves : ?construire=1 ouvre directement le
  // planning (qui démarre avec les lieux gardés).
  useEffect(() => {
    if (new URLSearchParams(window.location.search).get('construire') === '1') setSection('planning')
  }, [])

  // La couche s'ouvre déjà défilée sur la bonne section.
  useEffect(() => {
    if (!section) return
    const id = requestAnimationFrame(() => document.getElementById(`couche-${section}`)?.querySelector(`#${section}`)?.scrollIntoView())
    document.body.style.overflow = 'hidden'
    return () => { cancelAnimationFrame(id); document.body.style.overflow = '' }
  }, [section])

  return (
    <>
      {/* « La Mecque » sur le site anglais : le nom anglais de la base prime.
          La scène garde la barre de flux solidaire du flux : le socle SSR
          qui suit ne doit rien avoir de collé par-dessus. */}
    <div className="imm-scene"><Immersion slug={String(ville.slug ?? '')} nom={String((en && ville.nom_en) || ville.nom || '')} score={score} ton={ton} niveau={niveau} pool={pool} en={en} onOuvrir={setSection} /></div>
      {section && (
        <div id={`couche-${section}`} className="imm-couche">
          <button className="imm-couche-fermer" onClick={() => setSection(null)} aria-label={t('Fermer', 'Close')}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
            {t('Retour au flux', 'Back to the feed')}
          </button>
          <PageVille ville={ville} en={en} mode="pratique" />
        </div>
      )}
    </>
  )
}
