'use client'
import { useEffect, useRef, useState } from 'react'
import { CRITERES_DEFAUT, type Categorie, type Criteres } from '@/lib/criteres'
import type { Fiche } from '@/components/lieux/SurMesure'
import TrajetMin, { StatutOuverture } from '@/components/lieux/TrajetMin'
import { lancerItineraire } from '@/lib/itineraire'
import { appelerLieux } from '@/lib/appelLieux'
import { typeMot } from '@/lib/typeMot.mjs'

// 📖 LA SECTION MAGAZINE DU GUIDE VILLE (brief 3a/3c).
//
// Même moteur que partout — l'unique porte lib/appelLieux, la même que
// SurMesure (verrouillé par test-un-seul-chemin) — mais l'HABILLAGE éditorial de la maquette : une pépite en
// grand + des cartes photo, au lieu du harnais complet de recherche.
// « Que cherches-tu ? » ne vit donc qu'UNE fois dans l'app (Autour).
//
// Règles : un lieu SANS photo est exclu du haut de section (jamais de
// carré vide) ; badge VERT réservé au vérifié, ambre « signalé halal »,
// rien sinon — jamais « certifié » ; aucun emoji.

const VOILE = 'linear-gradient(180deg, rgba(11,26,15,0.25) 0%, rgba(11,26,15,0) 30%, rgba(11,26,15,0.92) 100%)'

function Badge({ f, en }: { f: Fiche; en: boolean }) {
  if (f.statut === 'verifie') {
    return <span style={{ position: 'absolute', top: 10, right: 10, zIndex: 2, fontSize: 11, fontWeight: 700, padding: '5px 11px', borderRadius: 999, letterSpacing: '0.08em', background: '#1F7A4A', color: '#fff' }}>{en ? 'VERIFIED' : 'VÉRIFIÉ'}</span>
  }
  if (/signalé halal/.test(f.statut ?? '')) {
    return <span style={{ position: 'absolute', top: 10, right: 10, zIndex: 2, fontSize: 11, fontWeight: 700, padding: '5px 11px', borderRadius: 999, letterSpacing: '0.06em', background: '#C77A1E', color: '#160E03' }}>{en ? 'REPORTED HALAL' : 'SIGNALÉ HALAL'}</span>
  }
  return null
}

function CartePhoto({ f, en, h, grande = false, mode }: { f: Fiche; en: boolean; h: number; grande?: boolean; mode: Categorie }) {
  return (
    <button onClick={() => lancerItineraire(f.lat, f.lng, typeof f.marcheMin === 'number' ? f.marcheMin <= 15 : undefined)}
      style={{ position: 'relative', display: 'block', width: '100%', height: h, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(201,168,76,0.14)', cursor: 'pointer', padding: 0, textAlign: 'left', background: '#0B1A0F' }}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src={f.photos![0]} alt="" loading="lazy" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
      <span aria-hidden style={{ position: 'absolute', inset: 0, background: VOILE }} />
      <Badge f={f} en={en} />
      <span style={{ position: 'absolute', left: 14, right: 14, bottom: 12, zIndex: 2 }}>
        <span style={{ display: 'block', fontFamily: "'Playfair Display', serif", color: '#fff', fontWeight: 700, fontSize: grande ? 28 : 18, lineHeight: 1.15 }}>{f.nom}</span>
        {f.titreIA && <span style={{ display: 'block', fontFamily: "'Playfair Display', serif", fontStyle: 'italic', color: 'var(--or-clair, #E9D9A6)', fontSize: grande ? 16 : 13.5, marginTop: 3 }}>{f.titreIA}</span>}
        <span style={{ display: 'block', color: 'rgba(253,250,243,0.85)', fontSize: 13.5, marginTop: 4 }}>
          {f.cuisine ?? typeMot(f.famille, mode)}
          {typeof f.note === 'number' ? ` · ★ ${f.note.toLocaleString('fr-FR')}` : ''}
          {typeof f.prix === 'number' && f.prix > 0 ? ` · ${'€'.repeat(f.prix)}` : ''}
          {' · '}<TrajetMin f={f} en={en} />
        </span>
        <span style={{ display: 'block', fontSize: 13, marginTop: 3 }}><StatutOuverture f={f} en={en} />{f.conseilIA ? <span style={{ color: 'rgba(253,250,243,0.7)' }}> · {f.conseilIA}</span> : null}</span>
      </span>
    </button>
  )
}

export default function SectionMagazine({ destination, categorie, en = false }: {
  destination: { lat: number; lng: number; nom: string }
  categorie: Categorie
  en?: boolean
}) {
  const [fiches, setFiches] = useState<Fiche[] | null>(null)
  const lancee = useRef(false)

  useEffect(() => {
    if (lancee.current) return
    lancee.current = true
    const c: Criteres = { ...CRITERES_DEFAUT, categorie, mode: 'pied' }
    const ac = new AbortController()
    const t = setTimeout(() => ac.abort(), 20000)
    appelerLieux({ lat: destination.lat, lng: destination.lng, criteres: c, lang: en ? 'en' : 'fr', ecrit: false, profil: {} }, ac.signal)
      .then((r) => r.json())
      .then((j: { fiches?: Fiche[] }) => setFiches(j.fiches ?? []))
      .catch(() => setFiches([]))
      .finally(() => clearTimeout(t))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Un lieu sans photo n'entre pas dans le haut de section — jamais de
  // carré vide (il reste dans les annuaires repliés de la page).
  const avecPhoto = (fiches ?? []).filter((f) => f.photos?.[0])

  if (fiches === null) {
    return (
      <div style={{ display: 'grid', gap: 12 }} aria-hidden>
        <div className="squelette" style={{ height: categorie === 'manger' ? 260 : 150, borderRadius: 16, background: 'rgba(253,250,243,0.06)' }} />
      </div>
    )
  }
  if (!avecPhoto.length) {
    return (
      <p style={{ color: 'rgba(253,250,243,0.6)', fontSize: 14, margin: '4px 0 0' }}>
        {en ? 'Live picks are unavailable right now — the full directory below still works.' : 'La sélection en direct est indisponible pour le moment — l’annuaire complet ci-dessous reste là.'}
      </p>
    )
  }

  if (categorie === 'manger') {
    const [pepite, ...reste] = avecPhoto
    return (
      <div className="mag-manger">
        <CartePhoto f={pepite} en={en} h={340} grande mode={categorie} />
        <div style={{ display: 'grid', gap: 12 }}>
          {reste.slice(0, 2).map((f) => <CartePhoto key={f.id} f={f} en={en} h={164} mode={categorie} />)}
        </div>
      </div>
    )
  }
  if (categorie === 'mosquee') {
    return (
      <div className="mag-trois">
        {avecPhoto.slice(0, 3).map((f) => <CartePhoto key={f.id} f={f} en={en} h={150} mode={categorie} />)}
      </div>
    )
  }
  return (
    <div className="mag-grille">
      {avecPhoto.slice(0, 4).map((f) => <CartePhoto key={f.id} f={f} en={en} h={170} mode={categorie} />)}
    </div>
  )
}
