'use client'
import { useMemo, useState } from 'react'
import Link from 'next/link'
import { croisement, phraseCroisement } from '@/lib/croisementPriere.mjs'
import { CIELS } from '@/lib/cielDuMoment.mjs'
import { filtresDisponibles, appliquer } from '@/lib/propositions.mjs'

// 🌅 L'ÉCRAN DES CINQ CIELS — reproduction fidèle de
// docs/maquette-cinq-ciels.html (commit 52b4563).
//
// Toutes les valeurs viennent de la maquette, pas d'une invention : ruban
// 11,5 px / .1em / padding 9-16, photo 126 px, nom serif 21 px, infos
// 13,5 px, aveu 12,5 px, bouton 15,5 px coins 16 px, vignette 48 px coins
// 13 px, filtres coins 999 px padding 8-14, écart entre blocs 10 px,
// padding d'écran 8px 14px.
//
// ⚠️ Ce composant N'APPELLE RIEN. Il reçoit les adresses déjà trouvées par
// le moteur commun — il n'existe qu'UN seul chemin vers /api/lieux, et ce
// n'est pas ici. Il met en forme, il ne cherche pas.

export interface FicheEcran {
  id?: string
  nom: string
  distanceM: number
  note?: number
  nbAvis?: number
  prix?: number
  ouvert?: boolean
  photos?: string[]
  statut?: string
  alcool?: 'non' | 'inconnu'
  mapsUri?: string
  lat: number
  lng: number
}

// Tentative de déploiement du 15 août au soir : les commits 7b33f74 et
// 5ea27f8 ont été refusés par Vercel (plafond journalier), donc ni le ciel
// visible ni cet écran n'avaient atteint la production.
const SERIF = "Georgia,'Iowan Old Style','Times New Roman',serif"

function minutesAPied(m: number) { return Math.max(1, Math.round(m / 75)) }
function distanceLisible(m: number) { return m < 1000 ? `${m} m` : `${(m / 1000).toFixed(1)} km` }

/** La fiche compacte du modèle : vignette 48 px coins 13 px, nom 15,5 px,
 *  infos 12,5 px. Même objet en secondaire et sous la Qibla la nuit. */
function FicheMini({ f }: { f: FicheEcran }) {
  return (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', background: 'rgba(255,255,255,.07)', borderRadius: 16, padding: '11px 13px', border: '1px solid rgba(255,255,255,.1)' }}>
      <div style={{ width: 48, height: 48, flex: '0 0 auto', borderRadius: 13, overflow: 'hidden', background: 'linear-gradient(140deg,#2C4A7A,#0D1830)' }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {f.photos?.[0] && <img src={f.photos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />}
      </div>
      <div style={{ minWidth: 0 }}>
        <p style={{ fontFamily: SERIF, fontSize: 16, margin: '0 0 2px', color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{f.nom}</p>
        <p style={{ fontSize: 12.5, margin: 0, color: 'rgba(255,255,255,.82)' }}>
          {f.note != null && <span style={{ color: '#FFC978', fontWeight: 700 }}>★ {f.note} · </span>}
          {minutesAPied(f.distanceM)} min à pied · {distanceLisible(f.distanceM)}
          {f.ouvert === true && <span style={{ color: '#4FD69C' }}> · ouvert</span>}
          {f.ouvert === false && <span style={{ color: 'rgba(255,255,255,.6)' }}> · fermé</span>}
        </p>
      </div>
    </div>
  )
}

export default function EcranCiel({
  ciel, lieu, exacte, priere, fiches, ruban, onOuvrirHoraires, horairesOuverts, horaires, qibla,
  mode, verdict, finPriere, partEcoulee,
}: {
  ciel: keyof typeof CIELS
  lieu: string
  exacte: boolean
  priere: { nom: string; reste: string; urgent: boolean } | null
  /**
   * ⏱️ L'heure de FIN de la fenêtre courante. C'est elle qui permet le
   * croisement prière × distance — « il te reste 11 min pour partir ».
   * `null` quand on ne la connaît pas : alors on n'écrit rien du tout.
   */
  finPriere: Date | null
  /** La part écoulée de la fenêtre, de 0 à 1 — la jauge de temps. */
  partEcoulee: number | null
  fiches: FicheEcran[]
  ruban: string
  onOuvrirHoraires: () => void
  horairesOuverts: boolean
  horaires: { nom: string; heure: string; courante: boolean }[]
  qibla: { deg: number; dir: string } | null
  /**
   * 🔴 CE QUE L'HEURE CHANGE — les quatre écrans du modèle.
   *   nuit    : la Qibla seule. « Personne ne cherche à dîner à 4 h. »
   *   priere  : la mosquée domine, et on ne filtre pas une mosquée.
   *   voyage  : le verdict d'arrivée, en texte, avec ses trois jauges.
   *   normal  : la réponse, puis les quatre portes de même poids.
   *   portes  : AUCUNE adresse imposée — les quatre portes, et il choisit.
   *             C'est le cas du premier visiteur, et de toute heure où rien
   *             ne justifie qu'on décide à sa place.
   */
  mode: 'nuit' | 'priere' | 'voyage' | 'normal' | 'portes'
  verdict: { ville: string; titre: string; lignes: string[]; attention: string | null; jauges: { nom: string; note: number | null }[] } | null
}) {
  const accent = CIELS[ciel].accent
  const [filtres, setFiltres] = useState<string[]>([])
  const dispo = useMemo(() => filtresDisponibles(fiches), [fiches])
  const liste = useMemo(() => appliquer(fiches, filtres), [fiches, filtres])
  const [tete, ...suite] = liste

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, padding: '8px 14px 0', fontVariantNumeric: 'tabular-nums' }}>

      {/* ① LA POSITION — jamais tronquée : c'est le nom de la commune qui
          dit au visiteur que le site parle bien de LUI. */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, padding: '2px 2px 0' }}>
        <span style={{ fontSize: 16, fontWeight: 600, color: '#fff', display: 'flex', alignItems: 'center', gap: 5, minWidth: 0 }}>
          📍 <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{lieu}</span>
          <span style={{ fontSize: 12, color: exacte ? '#4FD69C' : '#E0A340', fontWeight: 700, flex: '0 0 auto' }}>
            {exacte ? 'exacte ✓' : 'approximative'}
          </span>
        </span>
      </div>

      {/* ③ LA RÉPONSE — la seule chose dominante de l'écran.
          Sa forme change avec le moment : la Qibla la nuit, le verdict
          d'arrivée en voyage, une adresse le reste du temps. */}

      {mode === 'nuit' && (
        <>
          <article style={{ borderRadius: 22, overflow: 'hidden', background: 'rgba(255,255,255,.09)', border: '1px solid rgba(255,255,255,.16)' }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', padding: '9px 16px', background: accent, color: '#141018' }}>
              🧭 Tourne-toi vers La Mecque
            </div>
            <div style={{ textAlign: 'center', padding: '26px 16px 22px' }}>
              <p style={{ fontFamily: SERIF, fontSize: 56, margin: 0, lineHeight: 1, color: '#fff' }}>{qibla?.deg ?? '—'}°</p>
              <p style={{ fontSize: 16, margin: '8px 0 0', color: 'rgba(255,255,255,.82)' }}>
                {qibla?.dir ?? ''} · depuis ta position {exacte ? 'exacte' : 'approximative'}
              </p>
              <Link href="/qibla" style={{ display: 'block', marginTop: 13, borderRadius: 16, padding: 14, fontSize: 15.5, fontWeight: 700, background: accent, color: '#141018', textDecoration: 'none', minHeight: 56, boxSizing: 'border-box' }}>
                🧭 Ouvrir la boussole
              </Link>
            </div>
          </article>
          {/* Une seule fiche : la mosquée la plus proche. Rien d'autre — et
              on dit pourquoi, plutôt que de laisser un écran vide. */}
          {tete && <FicheMini f={tete} />}
          <p style={{ fontSize: 12.5, color: 'rgba(255,255,255,.66)', margin: 0 }}>
            Le reste du site attend qu&apos;il fasse jour.
          </p>
        </>
      )}

      {mode === 'voyage' && verdict && (
        <article style={{ borderRadius: 22, overflow: 'hidden', background: 'rgba(255,255,255,.09)', border: '1px solid rgba(255,255,255,.16)' }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', padding: '9px 16px', background: accent, color: '#141018' }}>
            ✦ Ton premier soir à {verdict.ville}
          </div>
          <div style={{ padding: '14px 16px 16px' }}>
            <h2 style={{ fontFamily: SERIF, fontSize: 24, fontWeight: 400, margin: '0 0 8px', color: '#fff', lineHeight: 1.2 }}>{verdict.titre}</h2>
            {verdict.lignes.map((l) => (
              <p key={l} style={{ fontSize: 16, lineHeight: 1.5, margin: '0 0 6px', color: 'rgba(255,255,255,.82)' }}>{l}</p>
            ))}
            {verdict.attention && (
              <p style={{ fontSize: 12.5, lineHeight: 1.4, margin: '8px 0 0', color: 'rgba(255,255,255,.66)' }}>
                ⚠ <b style={{ color: '#FFC978', fontWeight: 600 }}>Le point d&apos;attention :</b> {verdict.attention}
              </p>
            )}
            <div style={{ display: 'flex', gap: 8, marginTop: 14 }}>
              {verdict.jauges.map((j) => (
                <div key={j.nom} style={{ flex: 1, background: 'rgba(0,0,0,.3)', borderRadius: 14, padding: '11px 7px', textAlign: 'center', fontSize: 12.5, color: 'rgba(255,255,255,.7)' }}>
                  {j.nom}
                  <b style={{ display: 'block', fontFamily: SERIF, fontSize: 20, fontWeight: 400, marginTop: 3, color: j.note == null ? 'rgba(255,255,255,.5)' : j.note >= 8 ? '#4FD69C' : '#FFC978' }}>
                    {j.note ?? '—'}
                  </b>
                </div>
              ))}
            </div>
          </div>
        </article>
      )}

      {/* 🔴 EN MODE « PORTES », ON NE MONTRE AUCUNE ADRESSE. Le visiteur
          vient d'arriver : il découvre un site, il ne cherche pas un dîner.
          On lui donne sa position, l'heure de la prière, et les portes. */}
      {mode === 'portes' && (
        <p style={{ fontSize: 16, lineHeight: 1.5, margin: 0, color: 'rgba(255,255,255,.82)' }}>
          Où veux-tu aller ?
        </p>
      )}

      {(mode === 'normal' || mode === 'priere') && (tete ? (
        <article style={{ borderRadius: 22, overflow: 'hidden', background: 'rgba(255,255,255,.09)', border: '1px solid rgba(255,255,255,.16)' }}>
          <div style={{ fontSize: 11.5, fontWeight: 700, letterSpacing: '.1em', textTransform: 'uppercase', padding: '9px 16px', background: accent, color: '#141018' }}>
            {ruban}
          </div>
          <div style={{ height: 126, position: 'relative', background: 'linear-gradient(150deg,#8A5B2E 0%,#5A3A1C 52%,#33200F 100%)' }}>
            {tete.photos?.[0] && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={tete.photos[0]} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            )}
            <span style={{ position: 'absolute', top: 11, right: 11, fontSize: 12, fontWeight: 700, borderRadius: 999, padding: '5px 11px', background: '#E0A340', color: '#231603' }}>
              {tete.statut ?? 'à vérifier'}
            </span>
          </div>
          <div style={{ padding: '14px 16px 16px' }}>
            <h2 style={{ fontFamily: SERIF, fontSize: 21, fontWeight: 400, lineHeight: 1.18, margin: '0 0 7px', color: '#fff' }}>{tete.nom}</h2>
            <p style={{ fontSize: 13.5, color: 'rgba(255,255,255,.82)', margin: '0 0 3px' }}>
              {tete.note != null && <><span style={{ color: '#FFC978', fontWeight: 700 }}>★ {tete.note}</span>{tete.nbAvis ? ` · ${tete.nbAvis} avis` : ''} · </>}
              <b>{tete.distanceM < 1000 ? `${tete.distanceM} m` : `${(tete.distanceM / 1000).toFixed(1)} km`}</b> · {minutesAPied(tete.distanceM)} min à pied
              {tete.ouvert === true && <span style={{ color: '#4FD69C', fontWeight: 600 }}> · ouvert</span>}
              {tete.ouvert === false && <span style={{ color: 'rgba(255,255,255,.6)' }}> · fermé</span>}
            </p>
            {/* ⏱️ LE CROISEMENT PRIÈRE × DISTANCE — ce que personne d'autre
                ne peut écrire. Google Maps connaît la distance mais pas ta
                prière ; une application de prière connaît ta prière mais pas
                le restaurant. Nous avons les deux dans le même écran.
                Et surtout : « il te reste 11 min pour partir ». Une distance
                laisse hésiter ; un compte à rebours fait décider. */}
            {(() => {
              if (!finPriere || !priere) return null
              const c = croisement({ distanceM: tete.distanceM, mode: 'pied', finPriere, categorie: mode === 'priere' ? 'mosquee' : 'manger', aller: mode === 'priere' })
              const ph = phraseCroisement(c, priere.nom)
              if (!ph) return null
              return (
                <p style={{ display: 'flex', gap: 8, fontSize: 13, lineHeight: 1.45, margin: '9px 0 0', padding: '9px 11px', borderRadius: 12, background: 'rgba(0,0,0,.26)' }}>
                  <span aria-hidden>⏱️</span>
                  <span style={{ color: c?.etat === 'large' ? '#4FD69C' : c?.etat === 'juste' ? '#FFC978' : 'rgba(255,255,255,.82)' }}>{ph}</span>
                </p>
              )
            })()}
            <p style={{ fontSize: 12.5, lineHeight: 1.4, margin: '8px 0 0', color: 'rgba(255,255,255,.66)' }}>
              {tete.statut ?? 'Statut halal non confirmé — à vérifier sur place'}
              {tete.alcool === 'non' && <> · <b style={{ color: '#FFC978', fontWeight: 600 }}>✓ Ne sert pas d&apos;alcool</b></>}
            </p>
            <a
              href={tete.mapsUri ?? `https://www.google.com/maps/dir/?api=1&destination=${tete.lat},${tete.lng}`}
              target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', marginTop: 13, borderRadius: 16, padding: 14, textAlign: 'center', fontSize: 15.5, fontWeight: 700, background: accent, color: '#141018', textDecoration: 'none', minHeight: 56, boxSizing: 'border-box' }}
            >
              🚶 {mode === 'priere' ? `Y aller — ${minutesAPied(tete.distanceM)} min` : 'Itinéraire'}
            </a>
          </div>
        </article>
      ) : (
        // 🔴 JAMAIS DE POINTS DE SUSPENSION ÉTERNELS. Tant qu'on n'a rien,
        // on le dit en une phrase franche — pas en « recherche… » qui tourne.
        <p style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 16, padding: '16px', fontSize: 16, color: 'rgba(255,255,255,.82)', margin: 0 }}>
          On cherche les adresses autour de toi. Si rien n&apos;arrive d&apos;ici quelques secondes, c&apos;est qu&apos;on n&apos;a pas pu joindre nos sources — et on te le dira franchement plutôt que de faire tourner un rond.
        </p>
      ))}

      {/* ④ UNE OU DEUX FICHES SECONDAIRES */}
      {mode !== 'nuit' && mode !== 'portes' && suite.slice(0, 2).map((f) => <FicheMini key={f.id ?? f.nom} f={f} />)}

      {/* ⑤ LES TROIS FILTRES */}
      {mode === 'normal' && dispo.length > 0 && (
        <div style={{ display: 'flex', gap: 7 }}>
          {dispo.map((f) => {
            const on = filtres.includes(f.id)
            return (
              <button key={f.id} aria-pressed={on}
                onClick={() => setFiltres((v) => (v.includes(f.id) ? v.filter((x) => x !== f.id) : [...v, f.id]))}
                style={{ border: `1px solid ${on ? '#fff' : 'rgba(255,255,255,.28)'}`, borderRadius: 999, padding: '8px 14px', fontSize: 16, fontWeight: 600, color: on ? '#0A1020' : 'rgba(255,255,255,.9)', background: on ? '#fff' : 'transparent', whiteSpace: 'nowrap', minHeight: 56, cursor: 'pointer' }}>
                {f.icone} {f.fr}
              </button>
            )
          })}
        </div>
      )}

      {/* ⑥ LES QUATRE PORTES — Mohamed, 16 août : « VoyagesHalal n'est pas
          une appli de restauration. S'ouvrir sur un traiteur, c'est perdre
          le voyage ET la prière d'un coup. » La réponse ne règne donc plus
          seule : sous elle, de même poids, les autres portes du site.
          En mode nuit, elles disparaissent avec le reste : à 4 h du matin,
          il n'y a rien à proposer d'autre que la Qibla. */}
      {/* 🔴 LES QUATRE PORTES SONT SUPPRIMÉES ICI. Elles doublaient les
          trois onglets Prier · Manger · Que faire, qui sont juste au-dessus
          et qui, eux, RÉPONDENT sans quitter la page. « Aujourd'hui Prier
          existe deux fois : le visiteur n'y voit pas un choix, il y voit
          qu'il n'a pas compris. » Les onglets gagnent, les portes sortent.
          La navigation complète reste dans la barre du bas. */}
      {false && (
      <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
        {[['🕌 Prier', '/mosquee-proche'], ['🎯 Que faire', '/autour-de-moi?cat=activite'], ['🌍 Voyages', '/destinations'], ['📍 Carte', '/autour-de-moi']].map(([lib, href]) => (
          <Link key={href} href={href} style={{ flex: '1 1 40%', textAlign: 'center', fontSize: 16, fontWeight: 600, color: 'rgba(255,255,255,.82)', border: '1px solid rgba(255,255,255,.14)', borderRadius: 14, padding: '10px 3px', textDecoration: 'none', minHeight: 56, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            {lib}
          </Link>
        ))}
      </div>
      )}

      {/* ③ LA BANDE FINE DE PRIÈRE — EN BAS, ET DISCRÈTE.
          Décision de Mohamed du 15 août au soir : « une bande FINE en bas :
          les cinq horaires avec la prochaine mise en valeur, et la Qibla.
          C'est une information de référence, PAS le sujet de la page.
          Jamais plus d'un dixième de l'écran. »
          Elle occupait le tiers du haut ; elle ferme maintenant l'écran,
          repliée, et se déplie au tap. */}
      <button
        onClick={onOuvrirHoraires}
        aria-expanded={horairesOuverts}
        style={{ display: 'flex', alignItems: 'baseline', gap: 9, padding: '4px 2px', background: 'none', border: 'none', width: '100%', textAlign: 'left', cursor: 'pointer', minHeight: 56 }}
      >
        <span style={{ fontSize: 12, letterSpacing: '.2em', textTransform: 'uppercase', fontWeight: 700, color: 'rgba(255,255,255,.66)' }}>
          {priere?.nom ?? '—'}
        </span>
        <span style={{ fontFamily: SERIF, fontSize: 26, lineHeight: 1, color: priere?.urgent ? '#FFC978' : '#fff' }}>
          {priere?.reste ?? '…'}
        </span>
        <span style={{ marginLeft: 'auto', fontSize: 15, color: 'rgba(255,255,255,.5)' }} aria-hidden>{horairesOuverts ? '⌃' : '⌄'}</span>
      </button>

      {/* ⏳ LA JAUGE DE TEMPS — la fenêtre de prière qui s'écoule.
          « Se termine dans 31 min » est un chiffre qu'il faut lire. Ce trait
          se lit sans lire : on voit d'un coup d'œil si on est au début ou à
          la fin. Il passe à l'ambre au dernier cinquième — le moment où on
          arrête de flâner. La forme porte l'information, elle ne décore pas. */}
      {partEcoulee != null && (
        <div style={{ height: 3, borderRadius: 2, background: 'rgba(255,255,255,.14)', overflow: 'hidden' }}
          role="progressbar" aria-valuemin={0} aria-valuemax={100}
          aria-valuenow={Math.round(partEcoulee * 100)}
          aria-label={`Fenêtre de ${priere?.nom ?? 'prière'} écoulée à ${Math.round(partEcoulee * 100)} %`}>
          <span style={{ display: 'block', height: '100%', borderRadius: 2, width: `${Math.min(100, Math.max(2, partEcoulee * 100))}%`, background: partEcoulee > 0.8 ? '#FFC978' : accent }} />
        </div>
      )}

      {horairesOuverts && (
        <div style={{ background: 'rgba(255,255,255,.07)', border: '1px solid rgba(255,255,255,.1)', borderRadius: 16, padding: '11px 13px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 6 }}>
            {horaires.map((h) => (
              <div key={h.nom} style={{ textAlign: 'center', flex: 1 }}>
                <p style={{ margin: 0, fontSize: 12, color: h.courante ? accent : 'rgba(255,255,255,.66)', fontWeight: 700 }}>{h.nom}</p>
                <p style={{ margin: '2px 0 0', fontSize: 16, color: '#fff', fontFamily: SERIF }}>{h.heure}</p>
              </div>
            ))}
          </div>
          {qibla && (
            <p style={{ margin: '10px 0 0', fontSize: 13.5, color: 'rgba(255,255,255,.82)' }}>
              🧭 Qibla <b style={{ color: '#fff' }}>{qibla.deg}°</b> · {qibla.dir}
            </p>
          )}
        </div>
      )}

    </div>
  )
}
