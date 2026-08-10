'use client'
import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { useInstantPosition } from '@/lib/useInstantPosition'
import villesJson from '@/lib/cityCoords.json'
import { meteoInstantanee, ageReleve, emojiMeteo, motMeteo, conseilDuJour, type Meteo } from '@/lib/meteo'

// 🌤 LA MÉTÉO DU VOYAGEUR : ICI, ET SURTOUT LÀ OÙ JE VAIS.
//
// Première version : j'avais construit « la météo à chaque heure de prière ».
// Mohamed a coupé net — « ça ne veut rien dire ». Il avait raison, et l'erreur
// vaut d'être écrite : j'avais cherché ce qui rendrait la page ORIGINALE, pas
// ce dont on a besoin. Personne ne se demande le temps qu'il fera à ʿAsr.
//
// Ce qu'on se demande vraiment, c'est :
//
//     « Je pars à Dubaï demain. Il fait quoi là-bas ? »
//
// C'est une question de VALISE, et elle se pose avant de partir, depuis chez
// soi. Nous avons déjà les coordonnées de nos 354 destinations : la réponse
// tient en un tap, sans rien taper pour les villes les plus demandées.
//
// Deux choses sur cette page, pas une de plus :
//   1. la température là où tu es, en petit — un repère ;
//   2. la météo de la ville où tu vas, en grand — le sujet.

interface Ville { slug: string; nom: string; pays: string; lat: number; lng: number }
const VILLES = villesJson as Ville[]

/** Proposées sans rien taper. Les deux premières sont nos deux mines. */
const RACCOURCIS = ['dubai', 'istanbul', 'marrakech', 'la-mecque', 'medine', 'kuala-lumpur']

const sansAccent = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

export default function MeteoClient({ en = false }: { en?: boolean }) {
  const etatPos = useInstantPosition(en)
  const { pos } = etatPos

  const [ici, setIci] = useState<Meteo | null>(null)
  const [ville, setVille] = useState<Ville | null>(null)
  const [laBas, setLaBas] = useState<Meteo | null>(null)
  const [cherche, setCherche] = useState(false)
  const [q, setQ] = useState('')

  useEffect(() => {
    if (!pos) return
    const g = meteoInstantanee(pos.lat, pos.lng, setIci)
    if (g) setIci(g)
  }, [pos])

  useEffect(() => {
    if (!ville) { setLaBas(null); return }
    setLaBas(null); setCherche(true)
    const g = meteoInstantanee(ville.lat, ville.lng, (m) => { setLaBas(m); setCherche(false) })
    if (g) { setLaBas(g); setCherche(false) }
    // Un écran qui cherche indéfiniment ment sur son état.
    const t = setTimeout(() => setCherche(false), 6000)
    return () => clearTimeout(t)
  }, [ville])

  const resultats = useMemo(() => {
    const n = sansAccent(q.trim())
    if (n.length < 2) return []
    return VILLES.filter((v) => sansAccent(v.nom).startsWith(n) || sansAccent(v.pays).startsWith(n)).slice(0, 8)
  }, [q])

  const raccourcis = RACCOURCIS.map((s) => VILLES.find((v) => v.slug === s)).filter(Boolean) as Ville[]
  const conseil = laBas ? conseilDuJour(laBas, en) : null
  const age = laBas ? ageReleve(laBas.releveA, en) : null

  const carte: React.CSSProperties = {
    background: '#fff', borderRadius: 18, padding: '1rem 1.1rem',
    border: '1px solid rgba(27,67,50,0.1)', marginBottom: 14,
  }

  return (
    <section style={{ maxWidth: 640, margin: '0 auto', padding: '1.25rem 1rem 96px' }}>
      {/* ── 1. Ici, sur une ligne. Un repère, pas le sujet. ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16,
        padding: '10px 13px', borderRadius: 14,
        background: 'rgba(27,67,50,0.06)', border: '1px solid rgba(27,67,50,0.1)',
      }}>
        <span style={{ fontSize: 22 }}>{ici?.maintenant ? emojiMeteo(ici.maintenant.code) : '📍'}</span>
        <span style={{ fontWeight: 800, color: 'var(--foret)', fontSize: 15 }}>{pos?.label ?? '…'}</span>
        <span style={{ marginLeft: 'auto', fontWeight: 900, color: 'var(--foret)', fontSize: 20 }}>
          {ici?.maintenant ? `${ici.maintenant.temp}°` : '—'}
        </span>
        <span style={{ color: 'var(--texte-2)', fontSize: 13 }}>
          {ici?.maintenant ? motMeteo(ici.maintenant.code, en) : (en ? 'here' : 'ici')}
        </span>
      </div>

      {/* ── 2. Là où je vais. Le vrai sujet. ── */}
      <div style={carte}>
        <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.15rem', color: 'var(--foret)', margin: '0 0 3px' }}>
          ✈️ {en ? 'Where are you going?' : 'Tu pars où ?'}
        </h2>
        <p style={{ fontSize: 13, color: 'var(--texte-2)', margin: '0 0 11px' }}>
          {en ? 'See the weather there before you pack.' : 'Vois le temps qu’il fait là-bas avant de faire ta valise.'}
        </p>

        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder={en ? 'A city (Dubai, Istanbul…)' : 'Une ville (Dubaï, Istanbul…)'}
          aria-label={en ? 'Search a destination' : 'Chercher une destination'}
          style={{
            width: '100%', minHeight: 48, padding: '0 14px', borderRadius: 12, fontSize: 16,
            border: '1.5px solid rgba(27,67,50,0.2)', background: '#fff', color: 'var(--texte)',
          }}
        />

        {resultats.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginTop: 8 }}>
            {resultats.map((v) => (
              <button key={v.slug} onClick={() => { setVille(v); setQ('') }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 46, padding: '0 12px', borderRadius: 11, border: '1px solid rgba(27,67,50,0.12)', background: '#FDFAF3', cursor: 'pointer', textAlign: 'left' }}>
                <span style={{ fontWeight: 800, color: 'var(--foret)', fontSize: 14.5 }}>{v.nom}</span>
                <span style={{ color: 'var(--texte-2)', fontSize: 13 }}>{v.pays}</span>
              </button>
            ))}
          </div>
        )}

        {!q && (
          <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap', marginTop: 10 }}>
            {raccourcis.map((v) => (
              <button key={v.slug} onClick={() => setVille(v)}
                style={{
                  minHeight: 44, padding: '0 14px', borderRadius: 999, cursor: 'pointer', fontSize: 14, fontWeight: 800,
                  border: `1.5px solid ${ville?.slug === v.slug ? 'var(--foret)' : 'rgba(27,67,50,0.2)'}`,
                  background: ville?.slug === v.slug ? 'var(--foret)' : 'transparent',
                  color: ville?.slug === v.slug ? '#fff' : 'var(--foret)',
                }}>
                {v.nom}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* ── 3. La réponse ── */}
      {ville && (
        <div style={{ ...carte, background: 'var(--nuit)', border: '1px solid rgba(201,168,76,0.3)', textAlign: 'center' }}>
          <p style={{ color: 'var(--or)', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', margin: 0 }}>
            {ville.nom} · {ville.pays}
          </p>

          {laBas?.maintenant ? (
            <>
              <p style={{ fontSize: 52, margin: '4px 0 0', lineHeight: 1 }}>{emojiMeteo(laBas.maintenant.code)}</p>
              <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '3rem', fontWeight: 900, color: '#fff', margin: '2px 0 0', lineHeight: 1 }}>
                {laBas.maintenant.temp}°
              </p>
              <p style={{ color: 'var(--or-clair)', fontSize: 15, margin: '2px 0 0' }}>
                {(() => { const m = motMeteo(laBas.maintenant!.code, en); return m.charAt(0).toUpperCase() + m.slice(1) })()}
                {' · '}{en ? 'right now' : 'en ce moment'}
              </p>

              {conseil && (
                <p style={{ color: '#fdfaf3', fontSize: 14.5, fontWeight: 700, margin: '10px 0 0', padding: '9px 12px', background: 'rgba(201,168,76,0.16)', borderRadius: 12 }}>
                  {conseil}
                </p>
              )}

              {/* Les jours à venir : c'est ça, préparer une valise. */}
              {laBas.jours.length > 1 && (
                <div style={{ marginTop: 12, textAlign: 'left' }}>
                  {laBas.jours.map((j) => {
                    const d = new Date(j.date + 'T12:00:00')
                    return (
                      <div key={j.date} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '7px 2px', borderTop: '1px solid rgba(253,250,243,0.12)' }}>
                        <span style={{ width: 92, fontWeight: 700, color: 'rgba(253,250,243,0.85)', fontSize: 13.5, textTransform: 'capitalize' }}>
                          {d.toLocaleDateString(en ? 'en-GB' : 'fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                        </span>
                        <span style={{ fontSize: 17 }}>{emojiMeteo(j.code)}</span>
                        <span style={{ color: 'rgba(253,250,243,0.7)', fontSize: 13, flex: 1 }}>{motMeteo(j.code, en)}</span>
                        {j.pluieMm >= 1 && <span style={{ fontSize: 12, fontWeight: 800, color: '#93c5fd' }}>{j.pluieMm} mm</span>}
                        <span style={{ fontWeight: 900, color: '#fff', fontSize: 15, width: 64, textAlign: 'right' }}>
                          {j.max}° <span style={{ fontWeight: 600, color: 'rgba(253,250,243,0.6)', fontSize: 13 }}>{j.min}°</span>
                        </span>
                      </div>
                    )
                  })}
                </div>
              )}

              {/* D'où vient le chiffre — jamais une donnée sans sa provenance. */}
              {(age || laBas.perime) && (
                <p style={{ color: 'rgba(253,250,243,0.6)', fontSize: 12, margin: '9px 0 0' }}>
                  📴 {en ? 'Reading kept on your phone' : 'Relevé gardé sur ton téléphone'}{age ? ` · ${age}` : ''}
                </p>
              )}

              {/* La suite naturelle : le guide halal de cette ville. */}
              <Link href={`/destinations/${ville.slug}`}
                style={{ display: 'inline-flex', alignItems: 'center', minHeight: 46, padding: '0 18px', marginTop: 12, borderRadius: 999, background: 'var(--or)', color: 'var(--nuit)', fontWeight: 900, fontSize: 14.5, textDecoration: 'none' }}>
                {en ? `Halal guide to ${ville.nom} →` : `Le guide halal de ${ville.nom} →`}
              </Link>
            </>
          ) : cherche ? (
            <p style={{ color: 'var(--or-clair)', fontSize: 15, margin: 0, padding: '20px 0' }}>
              🌤️ {en ? 'Getting the weather…' : 'Recherche de la météo…'}
            </p>
          ) : (
            <div style={{ padding: '14px 0' }}>
              <p style={{ color: '#fdfaf3', fontSize: 15, fontWeight: 700, margin: 0 }}>
                {en ? `No forecast for ${ville.nom} right now.` : `Pas de prévision pour ${ville.nom} pour le moment.`}
              </p>
              <p style={{ color: 'rgba(253,250,243,0.7)', fontSize: 13, margin: '5px 0 0' }}>
                {en ? 'Try again in a moment.' : 'Réessaie dans un instant.'}
              </p>
            </div>
          )}
        </div>
      )}

      <p style={{ fontSize: 12, color: 'var(--texte-2)', textAlign: 'center', margin: '4px 0 0' }}>
        {en ? 'Forecast data from ' : 'Prévisions fournies par '}
        <a href="https://www.met.no/en" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--foret)', fontWeight: 700 }}>MET Norway</a>
      </p>
    </section>
  )
}
