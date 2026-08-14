'use client'

import { useRef, useState } from 'react'

// 🍽 « MANGER HALAL PRÈS DE MOI » — le widget de l'ordre du 14 août au soir.
//
// Le visiteur écrit « je veux une pizza » (ou appuie sur un raccourci), le
// widget prend sa position, /api/lieux trouve les adresses halal autour,
// et l'IA de la famille rédige la réponse qui s'écrit MOT À MOT.
//
// HONNÊTETÉ AFFICHÉE : chaque lieu porte la phrase que l'API lui a donnée
// (« signalé halal sur Google Maps — à confirmer sur place », « partagé
// par un voyageur »…) — le widget ne reformule jamais un statut.
//
// 📍 LA POSITION, corrigée le 15 août après le test de Mohamed : le widget
// le croyait « à Montréal » alors qu'il est en France. Deux causes :
//   · on n'attendait la géolocalisation que 5 s — le temps que la fenêtre
//     d'autorisation s'affiche et qu'on la lise, le délai expirait et on
//     retombait sur l'adresse IP (qui peut se tromper de continent) ;
//   · on ne DISAIT pas quelle position servait la recherche.
// Désormais : 20 s pour répondre à la fenêtre, et si la recherche a dû
// se faire à l'IP, le widget l'écrit (« position approximative : X ») et
// propose « 🎯 Ma position exacte » qui relance avec le GPS.
//
// CONDITIONS DÉGRADÉES : ni GPS ni IP → on le dit ; l'IA muette → la
// liste reste ; zéro résultat → on le dit, on n'invente pas une adresse.

interface Lieu {
  nom: string; distanceM: number; note?: number; ouvert?: boolean
  adresse?: string; statut: string; source: 'spot' | 'google' | 'osm'
  lat: number; lng: number
}

// 🗂️ Trois ateliers dans le même bloc — Mohamed, 15 août : « il faut
// faire la même chose pour activités, mosquées ». Même moteur, mêmes
// règles ; seuls la requête, les raccourcis et la phrase d'honnêteté
// changent (portée par l'API, jamais reformulée ici).
const CATS = [
  { id: 'manger' as const, icon: '🍽', label: 'Manger', placeholder: 'Je veux une pizza…', raccourcis: ['Pizza', 'Kebab', 'Burger', 'Restaurant'] },
  { id: 'mosquee' as const, icon: '🕌', label: 'Mosquée', placeholder: 'Mosquée près de moi…', raccourcis: ['La plus proche'] },
  { id: 'activite' as const, icon: '🎡', label: 'Activités', placeholder: 'Parc, musée, sortie en famille…', raccourcis: ['Parc', 'Musée', 'En famille', 'Hammam'] },
]

const fmtDist = (m: number, versUneVille = false) =>
  versUneVille || m >= 2000
    ? `${(m / 1000).toFixed(1)} km${versUneVille ? ' du centre' : ''}`
    : `${Math.max(1, Math.round(m / 80))} min à pied`

/**
 * 📍 LE MÊME MOTEUR, DEUX ANCRAGES — Mohamed, 15 août : « tout le site
 * doit tourner autour de sa destination, Dubaï, + IA + Google Maps, idem
 * pour autour de moi ».
 *   · sans `destination` : on cherche autour du VISITEUR (accueil,
 *     autour de moi) — GPS d'abord, adresse IP en repli annoncé ;
 *   · avec `destination` : on cherche autour de la VILLE affichée
 *     (fiche Dubaï, Istanbul…), sans jamais demander la position — le
 *     voyageur qui prépare son séjour n'est pas encore sur place.
 */
export default function PresDeMoi({ posInitiale, destination }: {
  posInitiale?: { lat: number; lng: number; ville?: string | null } | null
  destination?: { lat: number; lng: number; nom: string } | null
}) {
  const [texte, setTexte] = useState('')
  const [cat, setCat] = useState<'manger' | 'mosquee' | 'activite'>('manger')
  const [etat, setEtat] = useState<'repos' | 'cherche' | 'fini' | 'sans-position'>('repos')
  const [lieux, setLieux] = useState<Lieu[]>([])
  const [source, setSource] = useState('')
  const [posUtilisee, setPosUtilisee] = useState<'gps' | 'ip' | 'ville' | null>(null)
  const [prose, setProse] = useState('')
  const enCours = useRef(false)
  const derniereRequete = useRef('')

  function gps(delaiMs: number): Promise<{ lat: number; lng: number } | null> {
    return new Promise((res) => {
      if (!navigator.geolocation) return res(null)
      const t = setTimeout(() => res(null), delaiMs)
      navigator.geolocation.getCurrentPosition(
        (p) => { clearTimeout(t); res({ lat: p.coords.latitude, lng: p.coords.longitude }) },
        () => { clearTimeout(t); res(null) },
        { timeout: delaiMs - 500, maximumAge: 60_000 },
      )
    })
  }

  async function chercher(requete: string, forcerGPS = false, categorie = cat) {
    if (enCours.current) return
    enCours.current = true
    derniereRequete.current = requete
    setProse(''); setLieux([]); setEtat('cherche')
    try {
      // Sur une fiche destination, la ville EST la position : on ne
      // demande jamais le GPS de quelqu'un qui prépare son voyage.
      const exacte = destination ? null : await gps(forcerGPS ? 25_000 : 20_000)
      const pos = destination ?? exacte ?? posInitiale
      if (!pos) { setEtat('sans-position'); return }
      setPosUtilisee(destination ? 'ville' : exacte ? 'gps' : 'ip')
      const ac = new AbortController()
      const t = setTimeout(() => ac.abort(), 15_000)
      let corps: { lieux?: Lieu[]; source?: string } = {}
      try {
        const r = await fetch('/api/lieux', {
          method: 'POST', signal: ac.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: pos.lat, lng: pos.lng, requete, categorie }),
        })
        corps = r.ok ? await r.json() : {}
      } finally { clearTimeout(t) }
      const trouves = corps.lieux ?? []
      setLieux(trouves); setSource(corps.source ?? ''); setEtat('fini')

      // La prose IA — un bonus, jamais une condition. Elle s'écrit mot à mot.
      if (trouves.length) {
        const contexte = trouves.map((l) =>
          [l.nom, fmtDist(l.distanceM, !!destination), l.note ? `note ${l.note}` : null, l.ouvert === true ? 'ouvert' : l.ouvert === false ? 'fermé' : null, l.statut]
            .filter(Boolean).join(' — '))
        const ac2 = new AbortController()
        const t2 = setTimeout(() => ac2.abort(), 30_000)
        try {
          const r2 = await fetch('/api/lieux/assistant', {
            method: 'POST', signal: ac2.signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              // La question SITUE la recherche : « à Dubaï » ou « près de
              // moi ». La porte IA n'affirme rien hors du contexte fourni.
              question: (() => {
                const ou = destination ? `à ${destination.nom}` : 'près de moi'
                if (categorie === 'mosquee') return requete && requete !== 'La plus proche' ? `Je cherche une mosquée ${ou} : ${requete}.` : `Quelle est la mosquée la plus proche ${ou} ?`
                if (categorie === 'activite') return `Je cherche une activité ${ou}${requete ? ` : ${requete}` : ''}.`
                return requete ? `Je cherche : ${requete}, halal, ${ou}.` : `Où manger halal ${ou} ?`
              })(),
              contexte,
            }),
          })
          if (r2.ok && r2.body) {
            const lecteur = r2.body.getReader()
            const dec = new TextDecoder()
            for (;;) {
              const { done, value } = await lecteur.read()
              if (done) break
              setProse((p) => p + dec.decode(value, { stream: true }))
            }
          }
        } catch { /* la liste suffit */ } finally { clearTimeout(t2) }
      }
    } finally { enCours.current = false }
  }

  return (
    <section style={{ background: 'var(--nuit)' }} className="pb-8 px-4" aria-label={destination ? `À ${destination.nom}` : 'Près de moi'}>
      <div className="max-w-3xl mx-auto" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 16, padding: 16 }}>
        <p style={{ color: 'var(--or)', fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
          📍 {destination ? `À ${destination.nom}` : 'Près de moi'}
        </p>
        {/* Les trois ateliers : un tap change la catégorie et vide le résultat. */}
        <div style={{ display: 'flex', gap: 7, marginTop: 10, flexWrap: 'wrap' }}>
          {CATS.map((c) => {
            const on = cat === c.id
            return (
              <button key={c.id} onClick={() => { setCat(c.id); setTexte(''); setLieux([]); setProse(''); setEtat('repos') }} aria-pressed={on}
                style={{ minHeight: 44, padding: '0 14px', borderRadius: 999, cursor: 'pointer',
                  border: on ? '1.5px solid var(--or)' : '1px solid rgba(253,250,243,0.28)',
                  background: on ? 'rgba(201,168,76,0.18)' : 'rgba(255,255,255,0.05)',
                  color: on ? 'var(--or)' : 'var(--creme)', fontWeight: on ? 800 : 700, fontSize: 13.5 }}>
                {c.icon} {c.label}
              </button>
            )
          })}
        </div>
        <form
          onSubmit={(e) => { e.preventDefault(); chercher(texte) }}
          style={{ display: 'flex', gap: 8, marginTop: 10 }}
        >
          <input
            value={texte} onChange={(e) => setTexte(e.target.value)}
            placeholder={destination ? `${CATS.find((c) => c.id === cat)!.label} à ${destination.nom}…` : CATS.find((c) => c.id === cat)!.placeholder}
            style={{ flex: 1, minWidth: 0, minHeight: 48, borderRadius: 12, border: '1px solid rgba(253,250,243,0.25)', background: 'rgba(255,255,255,0.07)', color: '#fdfaf3', padding: '0 14px', fontSize: 16 }}
          />
          <button type="submit" disabled={etat === 'cherche'}
            style={{ minHeight: 48, padding: '0 18px', borderRadius: 12, border: 'none', background: 'var(--or)', color: 'var(--nuit)', fontWeight: 800, fontSize: 14.5, cursor: 'pointer', opacity: etat === 'cherche' ? 0.6 : 1 }}>
            {etat === 'cherche' ? '…' : 'Chercher'}
          </button>
        </form>
        <div style={{ display: 'flex', gap: 7, marginTop: 8, flexWrap: 'wrap' }}>
          {CATS.find((c) => c.id === cat)!.raccourcis.map((rq) => (
            <button key={rq} onClick={() => { setTexte(rq); chercher(rq === 'La plus proche' ? '' : rq) }}
              style={{ minHeight: 44, padding: '0 13px', borderRadius: 999, border: '1px solid rgba(253,250,243,0.28)', background: 'rgba(255,255,255,0.05)', color: 'var(--creme)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              {rq}
            </button>
          ))}
        </div>

        {etat === 'cherche' && (
          <p style={{ color: 'rgba(253,250,243,0.65)', fontSize: 13, marginTop: 12 }}>
            {destination
              ? `Recherche à ${destination.nom}…`
              : 'Recherche autour de toi… (si le navigateur demande ta position, accepte pour des résultats exacts)'}
          </p>
        )}
        {etat === 'sans-position' && (
          <p style={{ color: 'rgba(253,250,243,0.75)', fontSize: 13.5, marginTop: 12, lineHeight: 1.5 }}>
            Impossible de connaître ta position (GPS refusé et adresse IP muette) — autorise la position ou cherche ta ville dans la barre plus haut.
          </p>
        )}
        {etat === 'fini' && posUtilisee === 'ip' && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap', marginTop: 12 }}>
            <p style={{ color: 'rgba(253,250,243,0.7)', fontSize: 12.5, margin: 0 }}>
              📍 Position approximative{posInitiale?.ville ? ` : ${posInitiale.ville}` : ''} (adresse IP) — elle peut se tromper.
            </p>
            <button onClick={() => chercher(derniereRequete.current, true)}
              style={{ minHeight: 44, padding: '0 13px', borderRadius: 999, border: '1.5px solid rgba(201,168,76,0.55)', background: 'transparent', color: 'var(--or)', fontWeight: 800, fontSize: 12.5, cursor: 'pointer' }}>
              🎯 Ma position exacte
            </button>
          </div>
        )}
        {etat === 'fini' && lieux.length === 0 && (
          <p style={{ color: 'rgba(253,250,243,0.75)', fontSize: 13.5, marginTop: 12, lineHeight: 1.5 }}>
            {destination ? `Aucune adresse trouvée à ${destination.nom}` : 'Aucune adresse trouvée autour de toi'} — on préfère te le dire plutôt que d&apos;inventer.
          </p>
        )}
        {lieux.length > 0 && (
          <ul style={{ listStyle: 'none', margin: '12px 0 0', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {lieux.map((l, i) => (
              <li key={i} style={{ border: '1px solid rgba(253,250,243,0.14)', borderRadius: 12, padding: '10px 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ color: '#fdfaf3', fontWeight: 800, fontSize: 14, margin: 0 }}>
                    <bdi>{l.nom}</bdi>
                    {l.note != null && <span style={{ color: 'var(--or)', fontWeight: 800 }}> · ★ {l.note}</span>}
                    {l.ouvert === true && <span style={{ color: '#7dd87d', fontWeight: 700, fontSize: 12.5 }}> · ouvert</span>}
                    {l.ouvert === false && <span style={{ color: 'rgba(253,250,243,0.6)', fontWeight: 700, fontSize: 12.5 }}> · fermé</span>}
                  </p>
                  <p style={{ color: 'rgba(253,250,243,0.7)', fontSize: 12.5, margin: '2px 0 0', lineHeight: 1.4 }}>
                    {fmtDist(l.distanceM, !!destination)} · {l.statut}
                  </p>
                </div>
                <a href={`https://www.google.com/maps/dir/?api=1&destination=${l.lat},${l.lng}`} target="_blank" rel="noopener noreferrer"
                  style={{ minHeight: 44, display: 'inline-flex', alignItems: 'center', padding: '0 12px', borderRadius: 999, border: '1px solid rgba(201,168,76,0.5)', color: 'var(--or)', fontWeight: 800, fontSize: 12.5, textDecoration: 'none', flexShrink: 0 }}>
                  Itinéraire
                </a>
              </li>
            ))}
          </ul>
        )}
        {source === 'osm' && lieux.length > 0 && (
          <p style={{ color: 'rgba(253,250,243,0.55)', fontSize: 12, marginTop: 8 }}>
            Résultats OpenStreetMap — les résultats Google Maps arrivent bientôt.
          </p>
        )}
        {prose && (
          <p style={{ color: 'rgba(253,250,243,0.88)', fontSize: 14, marginTop: 12, lineHeight: 1.6, borderTop: '1px solid rgba(253,250,243,0.12)', paddingTop: 10, whiteSpace: 'pre-wrap' }}>
            🌙 {prose}
          </p>
        )}
      </div>
    </section>
  )
}
