'use client'
import { useEffect, useRef, useState } from 'react'

// 🧭 BARRE DE SECTIONS COLLANTE — la reponse au mur de 46 ecrans.
//
// Une fiche ville est un guide tres long : mesure a 46,7 ecrans sur un
// telephone. Les onglets « Ou prier / Ou manger / … » ne vivent qu'en haut
// de page : des qu'on descend, plus aucun moyen de naviguer autrement qu'en
// faisant defiler a l'aveugle. Cette barre apparait justement quand les
// onglets sortent de l'ecran, se colle sous le bandeau de priere, et
// surligne la section qu'on est en train de lire.
//
// Elle ne s'affiche que sur mobile/tablette (sous 1024px) et uniquement
// pour les sections REELLEMENT presentes dans la page.

const SECTIONS = [
  { id: 'sec-mosquees', icon: '🕌', fr: 'Où prier', en: 'Where to pray' },
  { id: 'sec-restaurants', icon: '🍽', fr: 'Où manger', en: 'Where to eat' },
  { id: 'sec-hotels', icon: '🏨', fr: 'Où dormir', en: 'Where to stay' },
  { id: 'sec-activites', icon: '🎯', fr: 'Que faire', en: 'What to do' },
  { id: 'sec-pratique', icon: '💡', fr: 'Bon à savoir', en: 'Good to know' },
  { id: 'sec-communaute', icon: '🤝', fr: 'Communauté', en: 'Community' },
]

export default function StickySections({ ancre, en = false }: { ancre: string; en?: boolean }) {
  const [visible, setVisible] = useState(false)
  const [presentes, setPresentes] = useState<typeof SECTIONS>([])
  const [courante, setCourante] = useState<string | null>(null)
  const [haut, setHaut] = useState(44)
  const barreRef = useRef<HTMLDivElement>(null)

  // Sections reellement rendues + hauteur du bandeau de priere (sticky)
  useEffect(() => {
    setPresentes(SECTIONS.filter((s) => document.getElementById(s.id)))
    const bar = document.querySelector('.prayer-bar') as HTMLElement | null
    if (bar) setHaut(Math.round(bar.getBoundingClientRect().height))
  }, [])

  // Apparait quand le bloc d'onglets du haut est sorti de l'ecran
  useEffect(() => {
    const cible = document.getElementById(ancre)
    if (!cible) return
    const obs = new IntersectionObserver(([e]) => setVisible(!e.isIntersecting), { rootMargin: '-60px 0px 0px 0px' })
    obs.observe(cible)
    return () => obs.disconnect()
  }, [ancre])

  // Surligne la section en cours de lecture
  useEffect(() => {
    if (!presentes.length) return
    const obs = new IntersectionObserver(
      (entries) => {
        const vue = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
        if (vue) setCourante(vue.target.id)
      },
      { rootMargin: '-25% 0px -65% 0px' },
    )
    presentes.forEach((s) => { const el = document.getElementById(s.id); if (el) obs.observe(el) })
    return () => obs.disconnect()
  }, [presentes])

  // Garde la puce active dans le champ de vision de la barre
  useEffect(() => {
    if (!courante || !barreRef.current) return
    const puce = barreRef.current.querySelector(`[data-sec="${courante}"]`) as HTMLElement | null
    puce?.scrollIntoView({ inline: 'center', block: 'nearest', behavior: 'smooth' })
  }, [courante])

  if (presentes.length < 2) return null

  return (
    <div
      ref={barreRef}
      className="sticky-sections"
      style={{
        position: 'fixed', top: haut, left: 0, right: 0, zIndex: 480,
        display: visible ? 'flex' : 'none',
        gap: 7, padding: '8px 12px', overflowX: 'auto',
        background: 'rgba(11,26,15,0.96)',
        WebkitBackdropFilter: 'blur(8px)', backdropFilter: 'blur(8px)',
        borderBottom: '1px solid rgba(201,168,76,0.3)',
        WebkitOverflowScrolling: 'touch',
      }}
      aria-label={en ? 'Sections of this guide' : 'Sections de ce guide'}
    >
      {presentes.map((s) => {
        const on = courante === s.id
        return (
          <button
            key={s.id}
            data-sec={s.id}
            onClick={() => document.getElementById(s.id)?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            style={{
              flex: 'none', minHeight: 44, padding: '0 14px', borderRadius: 999, cursor: 'pointer',
              border: on ? '1.5px solid var(--or)' : '1px solid rgba(253,250,243,0.18)',
              background: on ? 'rgba(201,168,76,0.18)' : 'rgba(255,255,255,0.06)',
              color: on ? 'var(--or)' : 'var(--creme)',
              fontWeight: on ? 800 : 700, fontSize: 13.5, whiteSpace: 'nowrap',
            }}
          >
            {s.icon} {en ? s.en : s.fr}
          </button>
        )
      })}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        style={{
          flex: 'none', minHeight: 44, padding: '0 14px', borderRadius: 999, cursor: 'pointer',
          border: '1px solid rgba(253,250,243,0.18)', background: 'transparent',
          color: 'rgba(253,250,243,0.75)', fontWeight: 700, fontSize: 13.5, whiteSpace: 'nowrap',
        }}
      >
        ↑ {en ? 'Top' : 'Haut'}
      </button>
    </div>
  )
}
