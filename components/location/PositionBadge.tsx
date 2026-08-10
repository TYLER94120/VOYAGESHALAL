'use client'
import { useState } from 'react'
import { useInstantPosition, distanceKm } from '@/lib/useInstantPosition'

// 📍 LA POSITION, DITE EN CLAIR — UN SEUL COMPOSANT POUR TOUT LE SITE.
//
// CE QUI N'ALLAIT PAS. Chaque page affichait la position à sa façon : « 📍 Ma
// position », « 📍 Paris · pas toi ? Appuie », « ⚠️ Position approximative ».
// Trois formulations, et aucune ne répond aux trois seules questions que se
// pose l'utilisateur :
//
//   1. OÙ me croit-on ?          → il faut un nom de lieu, pas « ma position »
//   2. Est-ce bien MOI ?         → il faut dire exacte ou approximative
//   3. Dois-je appuyer ?         → il faut que la réponse soit visible, ou
//                                  qu'il soit écrit qu'il n'y a rien à faire
//
// La position est l'élément le plus important du site : tout en découle — les
// horaires, la Qibla, les mosquées, les restaurants. Une position fausse ne
// donne pas un site imprécis, elle donne un site faux. Donc on ne la glisse
// pas dans un coin : on l'affiche, on la qualifie, et on donne un bouton.
//
// LES QUATRE ÉTATS, jamais deux :
//   · exacte        → « ✓ Position exacte », rien à faire, on le dit
//   · approximative → le bouton doré, plein cadre, impossible à rater
//   · en cours      → « Localisation… », le bouton dit qu'il travaille
//   · refusée       → on explique quoi faire, sans jargon

export type PositionRetour = ReturnType<typeof useInstantPosition>

export default function PositionBadge({
  etat, en = false, clair = false, compact = false, apresRefus,
}: {
  /** L'état de position de la page. Passé par le parent pour qu'il n'y ait
   *  qu'une seule position sur l'écran — jamais deux enquêtes en parallèle. */
  etat: PositionRetour
  en?: boolean
  /** Sur fond clair (crème) plutôt que sur fond nuit. */
  clair?: boolean
  /** Version pilule sur une ligne, pour les barres déjà denses. */
  compact?: boolean
  /** Où envoyer l'utilisateur si le navigateur refuse la géolocalisation. */
  apresRefus?: () => void
}) {
  const { pos, source, geoLoading, geoErr, refineGps, detectee, adopterDetectee } = etat
  // Trois qualités, pas deux : une ville choisie à la main n'est ni une
  // position exacte ni une estimation ratée — c'est un choix, et le dire
  // évite de proposer un bouton qui ferait perdre ce choix par erreur.
  const choisie = source === 'manual'
  const exacte = source === 'gps'
  const rassurant = exacte || choisie
  const nom = pos?.label ?? '…'

  const tx = clair ? 'var(--foret)' : 'var(--creme)'
  const tx2 = clair ? 'var(--texte-2)' : 'rgba(253,250,243,0.7)'
  const bord = clair ? 'rgba(27,67,50,0.18)' : 'rgba(201,168,76,0.4)'

  const demander = () => { refineGps().then((ok) => { if (!ok) apresRefus?.() }) }

  // « Rester sur X » : on ne redemande plus pour cette visite. Poser deux fois
  // la même question à quelqu'un qui a déjà répondu, c'est du harcèlement.
  const [ignore, setIgnore] = useState(false)

  // 🧭 « TU N'ES PLUS LÀ-BAS ? » — la question qu'il faut poser.
  //
  // Mohamed a choisi une ville à la main, puis l'accueil est resté dessus
  // alors qu'il était à des centaines de kilomètres, sans jamais le lui
  // signaler. Un choix manuel doit primer, sinon il ne sert à rien — mais
  // le site sait où il est, et faire semblant de l'ignorer est pire que de
  // demander.
  //
  // 80 km : au-delà, ce n'est plus la même ville ni la même météo ni les
  // mêmes horaires. En deçà, on se tait — personne n'a envie qu'on lui
  // demande ça à chaque banlieue traversée.
  const ailleurs =
    !ignore && detectee && pos && (source === 'manual' || source === 'city' || source === 'last') &&
    distanceKm(pos, detectee) > 80
      ? detectee
      : null

  /** La question « tu n'es plus là-bas ? », identique dans les deux formes.
   *  Elle vaut surtout sur l'ACCUEIL, en pilule compacte : c'est là que
   *  Mohamed l'attendait, et la version compacte n'y avait pas droit. */
  const questionAilleurs = ailleurs && (
    <div style={{ padding: '9px 12px', borderRadius: 12, background: clair ? 'rgba(201,168,76,0.14)' : 'rgba(201,168,76,0.18)', border: `1px solid ${clair ? 'rgba(201,168,76,0.45)' : 'rgba(201,168,76,0.5)'}` }}>
      <p style={{ margin: 0, fontSize: 13.5, fontWeight: 800, color: tx }}>
        {en
          ? `You are not in ${pos!.label}? We place you in ${ailleurs.label}.`
          : `Tu n’es pas à ${pos!.label} ? On te situe à ${ailleurs.label}.`}
      </p>
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 8 }}>
        <button onClick={adopterDetectee}
          style={{ minHeight: 44, padding: '0 15px', borderRadius: 999, border: 'none', background: 'var(--or)', color: 'var(--nuit)', fontSize: 13.5, fontWeight: 900, cursor: 'pointer' }}>
          {en ? `Use ${ailleurs.label}` : `Passer à ${ailleurs.label}`}
        </button>
        <button onClick={() => setIgnore(true)}
          style={{ minHeight: 44, padding: '0 15px', borderRadius: 999, border: 'none', background: 'transparent', color: tx2, fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>
          {en ? `Stay on ${pos!.label}` : `Rester sur ${pos!.label}`}
        </button>
      </div>
    </div>
  )

  // ── Pilule compacte : le nom + l'état, et le tap relance la localisation ──
  if (compact) {
    const pilule = (
      <button
        onClick={demander}
        aria-label={en ? 'Update my location' : 'Mettre à jour ma position'}
        style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, minHeight: 44,
          padding: '4px 13px', borderRadius: 999, cursor: 'pointer',
          // Sur une seule ligne, toujours : cassée en deux, la pilule ne se
          // lit plus comme un bouton (constaté sur une capture d'accueil).
          whiteSpace: 'nowrap', maxWidth: '100%', overflow: 'hidden',
          border: `1px solid ${rassurant ? 'rgba(34,197,94,0.5)' : bord}`,
          background: rassurant ? 'rgba(34,197,94,0.12)' : 'rgba(201,168,76,0.16)',
          color: tx, fontSize: 13.5, fontWeight: 800,
        }}
      >
        {geoLoading
          ? <>📡 <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{nom}</span><span style={{ fontSize: 11.5, fontWeight: 700, color: 'var(--or)' }}>{en ? '· locating…' : '· recherche…'}</span></>
          : <>📍 <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{nom}</span><span style={{ fontSize: 11.5, fontWeight: 700, color: rassurant ? '#22c55e' : 'var(--or)' }}>
              {exacte ? (en ? '· exact ✓' : '· exacte ✓')
                : choisie ? (en ? '· chosen city' : '· ville choisie')
                : (en ? '· approx. — tap' : '· approx. — appuie')}
            </span></>}
      </button>
    )
    if (!questionAilleurs) return pilule
    // Toute la largeur : coincée entre la température et « Tout voir », la
    // question se retrouvait sur quatre lignes et écrasait ses voisines.
    // Elle est rare — elle a le droit de prendre la place quand elle sort.
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 8, flex: '1 1 100%' }}>
        {pilule}
        <div style={{ width: '100%' }}>{questionAilleurs}</div>
      </div>
    )
  }

  // ── Bloc complet : l'état sur une ligne, l'action en dessous ──
  return (
    <div style={{
      border: `1px solid ${rassurant ? (clair ? 'rgba(22,163,74,0.35)' : 'rgba(34,197,94,0.45)') : bord}`,
      background: rassurant
        ? (clair ? 'rgba(22,163,74,0.07)' : 'rgba(34,197,94,0.10)')
        : (clair ? 'rgba(201,168,76,0.10)' : 'rgba(201,168,76,0.14)'),
      borderRadius: 16, padding: '11px 13px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap' }}>
        <p style={{ margin: 0, color: tx, fontSize: 15.5, fontWeight: 800 }}>
          {/* Le nom reste affiché pendant la recherche : le faire disparaître
              enlève le seul repère au moment précis où on doute. */}
          📍 {nom}
        </p>
        <p style={{
          margin: 0, fontSize: 12.5, fontWeight: 800,
          color: rassurant ? (clair ? '#16a34a' : '#4ade80') : 'var(--or)',
        }}>
          {exacte ? (en ? '✓ Exact position' : '✓ Position exacte')
            : choisie ? (en ? '✓ City you chose' : '✓ Ville que tu as choisie')
            : (en ? '≈ Approximate position' : '≈ Position approximative')}
        </p>
      </div>

      {/* Question 3 : « dois-je appuyer ? » — on répond, dans les deux cas. */}
      {rassurant ? (
        <>
          <p style={{ margin: '5px 0 0', fontSize: 12.5, color: tx2 }}>
            {en
              ? 'Nothing to do — everything on this page is calculated from here.'
              : 'Rien à faire — tout ce qui est affiché ici est calculé depuis ce lieu.'}
          </p>
          {/* Discret volontairement : quand c'est juste, on n'invite pas à
              rappuyer. Le lien existe pour qui a bougé. */}
          <button onClick={demander} disabled={geoLoading}
            style={{ marginTop: 4, background: 'none', border: 'none', padding: '8px 0', minHeight: 40, color: tx2, fontSize: 12.5, fontWeight: 700, textDecoration: 'underline', cursor: 'pointer' }}>
            {geoLoading ? (en ? 'Locating…' : 'Localisation…') : (en ? 'I have moved — locate me again' : 'J’ai bougé — me relocaliser')}
          </button>
        </>
      ) : (
        <>
          <p style={{ margin: '5px 0 9px', fontSize: 12.5, color: tx2 }}>
            {en
              ? 'Estimated from your connection — it can be off by several kilometres.'
              : 'Estimée depuis ta connexion — elle peut se tromper de plusieurs kilomètres.'}
          </p>
          <button
            onClick={demander}
            disabled={geoLoading}
            style={{
              width: '100%', minHeight: 48, borderRadius: 12, border: 'none',
              background: geoLoading ? 'rgba(201,168,76,0.5)' : 'var(--or)',
              color: 'var(--nuit)', fontSize: 15, fontWeight: 900,
              cursor: geoLoading ? 'progress' : 'pointer',
            }}
          >
            {geoLoading
              ? (en ? '📡 Locating…' : '📡 Localisation en cours…')
              : (en ? '📍 Use my exact position' : '📍 Utiliser ma position exacte')}
          </button>
        </>
      )}

      {questionAilleurs && <div style={{ marginTop: 10 }}>{questionAilleurs}</div>}

      {geoErr && (
        <div style={{ marginTop: 9, padding: '9px 11px', borderRadius: 11, background: 'rgba(220,38,38,0.12)', border: '1px solid rgba(220,38,38,0.3)' }}>
          <p style={{ margin: 0, fontSize: 13, fontWeight: 800, color: clair ? '#b91c1c' : '#fca5a5' }}>{geoErr.message}</p>
          <p style={{ margin: '3px 0 0', fontSize: 12.5, color: tx2 }}>{geoErr.detail}</p>
        </div>
      )}
    </div>
  )
}
