'use client'
import { useEffect, useState } from 'react'
import { useInstantPosition } from '@/lib/useInstantPosition'
import PositionBadge from '@/components/location/PositionBadge'
import { computePrayerTimesFull } from '@/lib/prayerCalc'
import { meteoInstantanee, ageReleve, emojiMeteo, motMeteo, conseilDuJour, type Meteo } from '@/lib/meteo'

// 🌤 LA MÉTÉO DU VOYAGEUR MUSULMAN.
//
// Ce qui la distingue d'une application météo ordinaire : **la température et
// le ciel à l'heure de chaque prière**. C'est la seule chose qu'aucune autre
// ne donne, et c'est exactement ce que demandait Mohamed — anticiper. Savoir
// qu'il fera 14° et qu'il pleuvra à Maghrib change ce qu'on emporte pour aller
// à la mosquée ; savoir qu'il fera 38° à Dhuhr change l'heure où l'on sort.
//
// La position vient de la source commune du site, et l'écran ne l'attend pas :
// il affiche ce qu'il sait, quand il le sait.

const NOMS: Record<string, string> = { Fajr: 'Fajr', Sunrise: 'Lever', Dhuhr: 'Dhuhr', Asr: 'ʿAsr', Maghrib: 'Maghrib', Isha: 'ʿIshâ' }
const NOMS_EN: Record<string, string> = { Fajr: 'Fajr', Sunrise: 'Sunrise', Dhuhr: 'Dhuhr', Asr: 'ʿAsr', Maghrib: 'Maghrib', Isha: 'ʿIsha' }
const hhmm = (d: Date) => `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`

export default function MeteoClient({ en = false }: { en?: boolean }) {
  const etatPos = useInstantPosition(en)
  const { pos } = etatPos
  const [meteo, setMeteo] = useState<Meteo | null>(null)
  const [cherche, setCherche] = useState(false)

  useEffect(() => {
    if (!pos) return
    setCherche(true)
    const gardee = meteoInstantanee(pos.lat, pos.lng, (m) => { setMeteo(m); setCherche(false) })
    if (gardee) setMeteo(gardee)
    // Si le réseau ne répond jamais, on arrête de dire « recherche » au bout
    // de 5 s : un écran qui cherche indéfiniment ment sur son état.
    const t = setTimeout(() => setCherche(false), 5000)
    return () => clearTimeout(t)
  }, [pos])

  // Les horaires de prière du jour, calculés en local comme partout ailleurs
  // sur le site (même position, même méthode — jamais deux sources).
  const prieres = (() => {
    if (!pos) return []
    try {
      const meth = Number((typeof localStorage !== 'undefined' && localStorage.getItem('vh_prayer_method')) || 3)
      const ecole = Number((typeof localStorage !== 'undefined' && localStorage.getItem('vh_prayer_school')) || 0)
      const t = computePrayerTimesFull(pos.lat, pos.lng, meth, ecole, new Date())
      return (['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const).map((k) => ({ cle: k, quand: t[k] }))
    } catch { return [] }
  })()

  /** Le relevé horaire le plus proche d'un moment donné. Renvoie null si la
   *  prévision ne va pas jusque-là : on n'invente pas une température. */
  const meteoA = (quand: Date) => {
    if (!meteo?.heures.length) return null
    let meilleur = null as null | { temp: number; code: string; pluieMm: number }
    let ecart = Infinity
    for (const h of meteo.heures) {
      const d = Math.abs(new Date(h.t).getTime() - quand.getTime())
      if (d < ecart) { ecart = d; meilleur = h }
    }
    // Plus d'une heure et demie d'écart : ce n'est plus « la météo à Maghrib ».
    return ecart <= 90 * 60 * 1000 ? meilleur : null
  }

  const conseil = meteo ? conseilDuJour(meteo, en) : null
  const age = meteo ? ageReleve(meteo.releveA, en) : null

  const carte: React.CSSProperties = {
    background: '#fff', borderRadius: 18, padding: '1rem 1.1rem',
    border: '1px solid rgba(27,67,50,0.1)', marginBottom: 14,
  }

  return (
    <section style={{ maxWidth: 640, margin: '0 auto', padding: '1.25rem 1rem 96px' }}>
      <div style={{ marginBottom: 14 }}>
        <PositionBadge etat={etatPos} en={en} clair />
      </div>

      {/* ── Maintenant ── */}
      <div style={{ ...carte, background: 'var(--nuit)', border: '1px solid rgba(201,168,76,0.3)', textAlign: 'center' }}>
        {meteo?.maintenant ? (
          <>
            <p style={{ color: 'var(--or)', fontSize: 11, fontWeight: 800, letterSpacing: 2, textTransform: 'uppercase', margin: 0 }}>
              {en ? 'Right now' : 'Maintenant'}{pos ? ` · ${pos.label}` : ''}
            </p>
            <p style={{ fontSize: 54, margin: '2px 0 0', lineHeight: 1 }}>{emojiMeteo(meteo.maintenant.code)}</p>
            <p style={{ fontFamily: "'Playfair Display', serif", fontSize: '3rem', fontWeight: 900, color: '#fff', margin: '2px 0 0', lineHeight: 1 }}>
              {meteo.maintenant.temp}°
            </p>
            <p style={{ color: 'var(--or-clair)', fontSize: 15, margin: '2px 0 0' }}>
              {/* Une majuscule sur le premier mot seulement : `capitalize` en
                  CSS en met une à chaque mot et donnait « Ciel Dégagé ». */}
              {(() => { const m = motMeteo(meteo.maintenant!.code, en); return m.charAt(0).toUpperCase() + m.slice(1) })()}
            </p>
            {conseil && (
              <p style={{ color: '#fdfaf3', fontSize: 14.5, fontWeight: 700, margin: '10px 0 0', padding: '9px 12px', background: 'rgba(201,168,76,0.16)', borderRadius: 12 }}>
                {conseil}
              </p>
            )}
            {/* D'où vient ce qu'on affiche — jamais un chiffre sans provenance. */}
            {(age || meteo.perime) && (
              <p style={{ color: 'rgba(253,250,243,0.6)', fontSize: 12, margin: '8px 0 0' }}>
                📴 {en ? 'Reading kept on your phone' : 'Relevé gardé sur ton téléphone'}{age ? ` · ${age}` : ''}
              </p>
            )}
          </>
        ) : cherche ? (
          <p style={{ color: 'var(--or-clair)', fontSize: 15, margin: 0, padding: '18px 0' }}>
            {en ? '🌤️ Getting the weather…' : '🌤️ Recherche de la météo…'}
          </p>
        ) : (
          <div style={{ padding: '10px 0' }}>
            <p style={{ color: '#fdfaf3', fontSize: 15, fontWeight: 700, margin: 0 }}>
              {en ? 'No weather to show right now.' : 'Pas de météo à afficher pour le moment.'}
            </p>
            <p style={{ color: 'rgba(253,250,243,0.7)', fontSize: 13, margin: '5px 0 0' }}>
              {en
                ? 'The forecast has not arrived — everything else on the site works without it.'
                : 'La prévision n’est pas arrivée. Tout le reste du site fonctionne sans elle.'}
            </p>
          </div>
        )}
      </div>

      {/* ── LA SECTION QUI N'EXISTE NULLE PART AILLEURS ── */}
      {meteo && prieres.length > 0 && (
        <div style={carte}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', color: 'var(--foret)', margin: '0 0 3px' }}>
            🕌 {en ? 'The weather at each prayer' : 'La météo à chaque prière'}
          </h2>
          <p style={{ fontSize: 12.5, color: 'var(--texte-2)', margin: '0 0 10px' }}>
            {en ? 'So you know what to take before you head out.' : 'Pour savoir quoi prendre avant de sortir.'}
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {prieres.map(({ cle, quand }) => {
              const m = meteoA(quand)
              const passe = quand.getTime() < Date.now()
              return (
                <div key={cle} style={{
                  display: 'flex', alignItems: 'center', gap: 10, padding: '9px 11px', borderRadius: 12,
                  background: passe ? 'rgba(27,67,50,0.04)' : 'rgba(201,168,76,0.10)',
                  opacity: passe ? 0.55 : 1,
                }}>
                  <span style={{ fontWeight: 800, color: 'var(--foret)', fontSize: 14.5, width: 72 }}>{(en ? NOMS_EN : NOMS)[cle]}</span>
                  <span style={{ fontWeight: 700, color: 'var(--texte-2)', fontSize: 14, width: 52 }}>{hhmm(quand)}</span>
                  {m ? (
                    <>
                      <span style={{ fontSize: 19 }}>{emojiMeteo(m.code)}</span>
                      <span style={{ fontWeight: 900, color: 'var(--foret)', fontSize: 16 }}>{m.temp}°</span>
                      <span style={{ color: 'var(--texte-2)', fontSize: 13 }}>{motMeteo(m.code, en)}</span>
                      {m.pluieMm >= 0.3 && (
                        <span style={{ marginLeft: 'auto', fontSize: 12, fontWeight: 800, color: '#1d4ed8' }}>
                          {m.pluieMm.toFixed(1)} mm
                        </span>
                      )}
                    </>
                  ) : passe ? (
                    // Prière déjà passée : la prévision ne commence qu'à
                    // maintenant, et annoncer « pas de prévision » sur une
                    // heure révolue n'a aucun sens.
                    <span style={{ color: 'var(--texte-2)', fontSize: 13 }}>{en ? 'done' : 'passée'}</span>
                  ) : (
                    // À venir mais hors de portée de la prévision : on le dit,
                    // on n'invente pas une température.
                    <span style={{ color: 'var(--texte-2)', fontSize: 13 }}>{en ? 'no forecast' : 'pas de prévision'}</span>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Les prochains jours ── */}
      {meteo && meteo.jours.length > 1 && (
        <div style={carte}>
          <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: '1.05rem', color: 'var(--foret)', margin: '0 0 10px' }}>
            📅 {en ? 'The coming days' : 'Les prochains jours'}
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            {meteo.jours.map((j) => {
              const d = new Date(j.date + 'T12:00:00')
              return (
                <div key={j.date} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '8px 4px', borderBottom: '1px solid rgba(27,67,50,0.06)' }}>
                  <span style={{ width: 96, fontWeight: 700, color: 'var(--foret)', fontSize: 14, textTransform: 'capitalize' }}>
                    {d.toLocaleDateString(en ? 'en-GB' : 'fr-FR', { weekday: 'short', day: 'numeric', month: 'short' })}
                  </span>
                  <span style={{ fontSize: 18 }}>{emojiMeteo(j.code)}</span>
                  <span style={{ color: 'var(--texte-2)', fontSize: 13, flex: 1 }}>{motMeteo(j.code, en)}</span>
                  {j.pluieMm >= 1 && <span style={{ fontSize: 12, fontWeight: 700, color: '#1d4ed8' }}>{j.pluieMm} mm</span>}
                  <span style={{ fontWeight: 900, color: 'var(--foret)', fontSize: 15, width: 62, textAlign: 'right' }}>
                    {j.max}° <span style={{ fontWeight: 600, color: 'var(--texte-2)', fontSize: 13 }}>{j.min}°</span>
                  </span>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Attribution : c'est la condition d'usage de la source, et elle est
          juste — on affiche le travail de quelqu'un d'autre. */}
      <p style={{ fontSize: 12, color: 'var(--texte-2)', textAlign: 'center', margin: '4px 0 0' }}>
        {en ? 'Forecast data from ' : 'Prévisions fournies par '}
        <a href="https://www.met.no/en" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--foret)', fontWeight: 700 }}>
          MET Norway
        </a>
        {en ? '. Prayer times calculated on your phone.' : '. Horaires de prière calculés sur ton téléphone.'}
      </p>
    </section>
  )
}
