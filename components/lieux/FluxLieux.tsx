'use client'
/* eslint-disable @next/next/no-img-element */
import { useEffect, useRef, useState } from 'react'
import type { Fiche } from '@/components/lieux/SurMesure'
import TrajetMin, { StatutOuverture } from '@/components/lieux/TrajetMin'
import { lancerItineraire } from '@/lib/itineraire'
import { ligneAlcool } from '@/lib/alcool.mjs'

// 🎞 LE SWIPE D'AUTOUR DE MOI (ordre du 20 août) : un tap sur un mode →
// on SWIPE les résultats en plein écran, comme l'accueil monde.
//   · mosquées / activités : de la plus proche à la moins proche ;
//   · restos : du mieux noté (avec beaucoup d'avis) au moins bien noté ;
// (le tri est appliqué par l'appelant — ce composant AFFICHE).
// Photos : les 3 premières fiches arrivent enrichies du moteur ; les
// suivantes ne se paient QUE si on swipe jusqu'à elles (/api/lieux/un,
// cache 24 h) — le coût suit l'usage. Sans photo : dégradé de secours,
// jamais d'écran vide. « Y aller » = itinéraire natif, un tap.

function IcPin() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden style={{ display: 'inline-block' }}><path d="M12 21s7-5.1 7-11a7 7 0 0 0-14 0c0 5.9 7 11 7 11zM12 12.5a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5z" /></svg>
}

export default function FluxLieux({ fiches, cat, en = false, onFermer, onChangerCat }: {
  fiches: Fiche[]
  cat: 'mosquee' | 'manger' | 'activite'
  en?: boolean
  onFermer: () => void
  /** Changer de catégorie SANS quitter le swipe (pilules Pray · Eat · Do) :
   *  relance la recherche du mode — même geste que les cartes de mode. */
  onChangerCat?: (cat: 'mosquee' | 'manger' | 'activite') => void
}) {
  const t = (fr: string, an: string) => (en ? an : fr)
  const [extras, setExtras] = useState<Record<string, { photos?: string[]; note?: number; nbAvis?: number; ouvert?: boolean }>>({})
  const [actif, setActif] = useState(0)
  const fluxRef = useRef<HTMLDivElement>(null)
  const demandes = useRef(new Set<string>())

  // Enrichissement à la demande : le panneau courant + le suivant.
  useEffect(() => {
    for (const i of [actif, actif + 1]) {
      const f = fiches[i]
      if (!f?.id || f.photos?.[0] || extras[f.id]?.photos?.[0] || demandes.current.has(f.id)) continue
      if (f.source === 'osm' && !f.id.startsWith('ChI')) continue // pas d'identifiant Google : rien à payer
      demandes.current.add(f.id)
      fetch(`/api/lieux/un?id=${encodeURIComponent(f.id)}&lang=${en ? 'en' : 'fr'}`)
        .then((r) => (r.ok ? r.json() : null))
        .then((j) => { if (j && !j.erreur) setExtras((p) => ({ ...p, [f.id!]: j })) })
        .catch(() => {})
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actif, fiches])

  useEffect(() => {
    const flux = fluxRef.current
    if (!flux) return
    const sections = [...flux.querySelectorAll('.imm-panneau')]
    const obs = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) setActif(sections.indexOf(e.target)) })
    }, { threshold: 0.55 })
    sections.forEach((s) => obs.observe(s))
    return () => obs.disconnect()
  }, [fiches])

  const etiquette = cat === 'mosquee' ? t('LIEU DE PRIÈRE', 'PRAYER PLACE') : cat === 'manger' ? t('TABLE', 'TABLE') : t('À FAIRE', 'THINGS TO DO')

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 85, background: '#060E08' }}>
      {onChangerCat && (
        <nav className="imm-selecteur" aria-label={t('Modes', 'Feeds')}>
          {([['mosquee', t('Prier', 'Pray')], ['manger', t('Manger', 'Eat')], ['activite', t('Faire', 'Do')]] as const).map(([v, libelle]) => (
            <button key={v} className={`imm-sel${cat === v ? ' on' : ''}`}
              onClick={() => { if (cat !== v) onChangerCat(v) }}>
              {libelle}
            </button>
          ))}
        </nav>
      )}
      <button className="imm-couche-fermer" onClick={onFermer} aria-label={t('Fermer', 'Close')}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden><path d="M6 6l12 12M18 6L6 18" /></svg>
        {t('Liste & carte', 'List & map')}
      </button>
      <div className="imm-fil" aria-hidden>
        {fiches.map((f, i) => <i key={f.id ?? i} className={i === actif ? 'on' : undefined} />)}
      </div>
      <div className="imm-flux" ref={fluxRef} style={{ height: '100svh' }}>
        {fiches.map((f, i) => {
          const ex = f.id ? extras[f.id] : undefined
          const photo = f.photos?.[0] ?? ex?.photos?.[0]
          const note = f.note ?? ex?.note
          const nbAvis = f.nbAvis ?? ex?.nbAvis
          const fx = { ...f, ouvert: f.ouvert ?? ex?.ouvert }
          return (
            <section key={f.id ?? i} className="imm-panneau imm-stable">
              <div className="imm-fond" style={{ background: 'linear-gradient(180deg,#14263B,#060E08)' }} />
              {photo && <img className="imm-photo" src={photo} alt="" loading={i < 2 ? 'eager' : 'lazy'} onError={(e) => e.currentTarget.remove()} />}
              <div className="imm-contenu" style={i === 0 ? { paddingBottom: 'calc(148px + env(safe-area-inset-bottom))' } : undefined}>
                <span className={`imm-etiquette ${/vérifié|verified/i.test(f.statut ?? '') ? 'imm-et-halal' : 'imm-et-type'}`}>{etiquette}</span>
                <h2 className="imm-h2">{f.nom}</h2>
                {f.titreIA && <p className="imm-ia">{f.titreIA}</p>}
                {(() => {
                  const parts = [
                    f.cuisine,
                    typeof note === 'number' ? `★ ${note.toLocaleString(en ? 'en-GB' : 'fr-FR')}` : null,
                    typeof nbAvis === 'number' ? `${nbAvis.toLocaleString(en ? 'en-GB' : 'fr-FR')} ${t('avis', 'reviews')}` : null,
                  ].filter(Boolean)
                  return <p className="imm-meta">{parts.join(' · ')}{parts.length ? ' · ' : ''}<TrajetMin f={f} en={en} /></p>
                })()}
                {/* La mention alcool suit le lieu jusque dans le swipe :
                    elle ne doit jamais dépendre de l'écran où l'on est. */}
                {f.alcool && (
                  <p className="imm-meta" style={{ marginTop: 4, color: f.alcool === 'non' ? '#7dd87d' : f.alcool === 'oui' ? '#ffb4a2' : 'rgba(253,250,243,.72)', fontWeight: 700 }}>
                    {ligneAlcool(f.alcool, en)}
                  </p>
                )}
                <p className="imm-meta" style={{ marginTop: 4 }}><StatutOuverture f={fx} en={en} />{f.conseilIA ? <span style={{ color: 'rgba(253,250,243,.7)' }}>{fx.ouvert !== undefined ? ' · ' : ''}{f.conseilIA}</span> : null}</p>
                <div className="imm-actions">
                  <button className="imm-b-or" onClick={() => lancerItineraire(f.lat, f.lng, typeof f.marcheMin === 'number' ? f.marcheMin <= 15 : undefined)}>
                    <IcPin /> {t('Y aller', 'Go')}
                  </button>
                </div>
              </div>
              {i === 0 && (
                <div className="imm-indice">{t('Swipe — du plus pertinent au suivant', 'Swipe — best match first')}<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden><path d="m6 9 6 6 6-6" /></svg></div>
              )}
            </section>
          )
        })}
      </div>
    </div>
  )
}
