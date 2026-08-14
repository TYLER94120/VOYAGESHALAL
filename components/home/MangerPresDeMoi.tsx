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

const RACCOURCIS = ['Pizza', 'Kebab', 'Burger', 'Restaurant']

const fmtDist = (m: number) => (m >= 2000 ? `${(m / 1000).toFixed(1)} km` : `${Math.max(1, Math.round(m / 80))} min à pied`)

export default function MangerPresDeMoi({ posInitiale }: { posInitiale: { lat: number; lng: number; ville?: string | null } | null }) {
  const [texte, setTexte] = useState('')
  const [etat, setEtat] = useState<'repos' | 'cherche' | 'fini' | 'sans-position'>('repos')
  const [lieux, setLieux] = useState<Lieu[]>([])
  const [source, setSource] = useState('')
  const [posUtilisee, setPosUtilisee] = useState<'gps' | 'ip' | null>(null)
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

  async function chercher(requete: string, forcerGPS = false) {
    if (enCours.current) return
    enCours.current = true
    derniereRequete.current = requete
    setProse(''); setLieux([]); setEtat('cherche')
    try {
      // 20 s : le temps de LIRE la fenêtre d'autorisation et d'y répondre.
      const exacte = await gps(forcerGPS ? 25_000 : 20_000)
      const pos = exacte ?? posInitiale
      if (!pos) { setEtat('sans-position'); return }
      setPosUtilisee(exacte ? 'gps' : 'ip')
      const ac = new AbortController()
      const t = setTimeout(() => ac.abort(), 15_000)
      let corps: { lieux?: Lieu[]; source?: string } = {}
      try {
        const r = await fetch('/api/lieux', {
          method: 'POST', signal: ac.signal,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lat: pos.lat, lng: pos.lng, requete }),
        })
        corps = r.ok ? await r.json() : {}
      } finally { clearTimeout(t) }
      const trouves = corps.lieux ?? []
      setLieux(trouves); setSource(corps.source ?? ''); setEtat('fini')

      // La prose IA — un bonus, jamais une condition. Elle s'écrit mot à mot.
      if (trouves.length) {
        const contexte = trouves.map((l) =>
          [l.nom, fmtDist(l.distanceM), l.note ? `note ${l.note}` : null, l.ouvert === true ? 'ouvert' : l.ouvert === false ? 'fermé' : null, l.statut]
            .filter(Boolean).join(' — '))
        const ac2 = new AbortController()
        const t2 = setTimeout(() => ac2.abort(), 30_000)
        try {
          const r2 = await fetch('/api/lieux/assistant', {
            method: 'POST', signal: ac2.signal,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: requete ? `Je cherche : ${requete}, halal, près de moi.` : 'Où manger halal près de moi ?', contexte }),
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
    <section style={{ background: 'var(--nuit)' }} className="pb-8 px-4" aria-label="Manger halal près de moi">
      <div className="max-w-3xl mx-auto" style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,168,76,0.3)', borderRadius: 16, padding: 16 }}>
        <p style={{ color: 'var(--or)', fontSize: 12, fontWeight: 800, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
          🍽 Manger halal près de moi
        </p>
        <form
          onSubmit={(e) => { e.preventDefault(); chercher(texte) }}
          style={{ display: 'flex', gap: 8, marginTop: 10 }}
        >
          <input
            value={texte} onChange={(e) => setTexte(e.target.value)}
            placeholder="Je veux une pizza…"
            style={{ flex: 1, minWidth: 0, minHeight: 48, borderRadius: 12, border: '1px solid rgba(253,250,243,0.25)', background: 'rgba(255,255,255,0.07)', color: '#fdfaf3', padding: '0 14px', fontSize: 16 }}
          />
          <button type="submit" disabled={etat === 'cherche'}
            style={{ minHeight: 48, padding: '0 18px', borderRadius: 12, border: 'none', background: 'var(--or)', color: 'var(--nuit)', fontWeight: 800, fontSize: 14.5, cursor: 'pointer', opacity: etat === 'cherche' ? 0.6 : 1 }}>
            {etat === 'cherche' ? '…' : 'Chercher'}
          </button>
        </form>
        <div style={{ display: 'flex', gap: 7, marginTop: 8, flexWrap: 'wrap' }}>
          {RACCOURCIS.map((rq) => (
            <button key={rq} onClick={() => { setTexte(rq); chercher(rq) }}
              style={{ minHeight: 44, padding: '0 13px', borderRadius: 999, border: '1px solid rgba(253,250,243,0.28)', background: 'rgba(255,255,255,0.05)', color: 'var(--creme)', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              {rq}
            </button>
          ))}
        </div>

        {etat === 'cherche' && (
          <p style={{ color: 'rgba(253,250,243,0.65)', fontSize: 13, marginTop: 12 }}>
            Recherche autour de toi… (si le navigateur demande ta position, accepte pour des résultats exacts)
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
            Aucune adresse trouvée autour de toi — on préfère te le dire plutôt que d&apos;inventer.
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
                    {fmtDist(l.distanceM)} · {l.statut}
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
