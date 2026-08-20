'use client'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { getPosition } from '@/lib/geo'

// ⛩️ L'ÉCRAN DE DÉPART — maquette v6.
//
// Cinq choses, et rien d'autre avant le défilement : l'ornement, le nom,
// la ligne « Le guide du voyage halal », un bouton plein, un bouton contour,
// et la barre discrète Horaires / Qibla.
//
// ⚠️ CETTE BARRE EST DANS LE FLUX, PAS EN `position: fixed`. Remarque de
// Mohamed, constatée en test réel : en fixed, elle passe sous la barre du
// navigateur mobile et devient invisible. Un élément qu'on ne voit pas
// n'existe pas.
export default function HeroDepart() {
  const router = useRouter()
  const [etat, setEtat] = useState<'repos' | 'cherche' | 'refus'>('repos')

  async function autourDeMoi() {
    setEtat('cherche')
    try {
      // On demande franchement — et `getPosition` porte déjà son propre
      // délai maximum : aucun bouton ne tourne indéfiniment.
      const p = await getPosition({ highAccuracy: true })
      if (p) { router.push('/autour-de-moi'); return }
      setEtat('refus')
    } catch { setEtat('refus') }
  }

  return (
    <div className="v6-hero">
      <div className="v6-marque">
        <svg className="v6-ornement" aria-hidden viewBox="0 0 78 44" fill="none" stroke="currentColor" strokeWidth="1.1">
          <path d="M39 6c7 5 11 10 11 15s-5 9-11 9-11-4-11-9 4-10 11-15z" />
          <path d="M39 30v9M31 39h16" /><path d="M2 22h20M56 22h20" />
          <circle cx="26" cy="22" r="2.2" /><circle cx="52" cy="22" r="2.2" />
        </svg>
        {/* Le <h1> de l'accueil porte le BESOIN, pas la marque (chantier SEO
            du 20 août) : il vit dans BlocSeo, juste sous cet écran. Ici, le
            nom est un titre visuel. */}
        <p className="v6-logo">Voyages<em>Halal</em></p>
        <p className="v6-tagline">Le guide du voyage halal</p>
      </div>

      <div>
        <button className="v6-btn v6-btn-or" onClick={autourDeMoi} aria-busy={etat === 'cherche'}>
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" aria-hidden>
            <circle cx="12" cy="12" r="8.2" /><circle cx="12" cy="12" r="2.6" />
            <path d="M12 1.6v3M12 19.4v3M1.6 12h3M19.4 12h3" />
          </svg>
          {etat === 'cherche' ? 'Je cherche où tu es…' : 'Autour de moi'}
        </button>

        {/* On ne laisse jamais quelqu'un devant un refus sans issue. */}
        {etat === 'refus' && (
          <p className="v6-refus">
            La position n&apos;est pas accessible. Choisis ta ville juste en dessous — le site fonctionne pareil.
          </p>
        )}

        <div className="v6-ou">ou</div>

        <a className="v6-btn v6-btn-fantome" href="/destinations">
          <svg viewBox="0 0 24 24" width="24" height="24" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <circle cx="12" cy="12" r="9" /><path d="M3 12h18M12 3c3.5 3.8 3.5 14.2 0 18M12 3c-3.5 3.8-3.5 14.2 0 18" />
          </svg>
          Choisir une ville
        </a>
      </div>

      <div className="v6-mini">
        <a href="/horaires-priere">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" aria-hidden>
            <circle cx="12" cy="12" r="9" /><path d="M12 6.8V12l3.5 2.1" />
          </svg>
          Horaires de prière
        </a>
        <span className="v6-mini-sep" />
        <a href="/qibla">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" aria-hidden>
            <circle cx="12" cy="12" r="9" /><path d="M15.8 8.2l-2.1 5.5-5.5 2.1 2.1-5.5z" />
          </svg>
          Qibla
        </a>
      </div>

      <div className="v6-vers-bas" aria-hidden>
        <span>Découvrir</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6" /></svg>
      </div>
    </div>
  )
}
