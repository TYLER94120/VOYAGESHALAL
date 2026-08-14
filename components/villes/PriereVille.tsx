'use client'

import { useEffect, useMemo, useState } from 'react'
import { computePrayerTimesFull } from '@/lib/prayerCalc'

// 🕌 LA PRIÈRE, EN TÊTE DE CHAQUE FICHE VILLE.
//
// Ordre de Mohamed, 15 août : « "Horaires de prière à Istanbul" et "Qibla
// depuis Istanbul" traînent tout en bas, en boutons orphelins, alors que
// c'est le besoin numéro un. » Ils remontent, et ils deviennent un vrai
// bloc : la prochaine prière À CETTE VILLE avec son horaire, les cinq
// horaires du jour, et la Qibla depuis cette ville.
//
// ZÉRO RÉSEAU : tout est calculé sur place à partir des coordonnées de la
// fiche (bibliothèque locale), donc rien à attendre et rien qui puisse
// tomber en panne. La méthode et l'école suivent le choix du visiteur,
// comme partout ailleurs sur le site — sinon deux écrans donneraient deux
// horaires différents pour la même prière.

const KEYS = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha'] as const

export default function PriereVille({ lat, lng, nom, ctx, en }: {
  lat: number; lng: number; nom: string; ctx: string; en: boolean
}) {
  // L'heure n'est lue qu'après le montage : rendre l'horloge côté serveur
  // ferait diverger le HTML et l'affichage (et ferait sauter la page).
  const [now, setNow] = useState<number | null>(null)
  useEffect(() => {
    setNow(Date.now())
    const id = setInterval(() => setNow(Date.now()), 30_000)
    return () => clearInterval(id)
  }, [])

  const calc = useMemo(() => {
    if (now == null) return null
    try {
      const meth = Number((typeof localStorage !== 'undefined' && localStorage.getItem('vh_prayer_method')) || 3)
      const ecole = Number((typeof localStorage !== 'undefined' && localStorage.getItem('vh_prayer_school')) || 0)
      const j = computePrayerTimesFull(lat, lng, meth, ecole, new Date(now))
      const dem = computePrayerTimesFull(lat, lng, meth, ecole, new Date(now + 86_400_000))
      const liste = KEYS.map((k) => ({ k, d: j[k] as Date }))
      const suivante = liste.find((x) => x.d.getTime() > now) ?? { k: 'Fajr' as const, d: dem.Fajr as Date }
      return { liste, suivante, minutes: Math.max(0, Math.round((suivante.d.getTime() - now) / 60_000)) }
    } catch { return null }
  }, [now, lat, lng])

  // Heure locale de la VILLE, pas celle du visiteur : quelqu'un à Paris qui
  // consulte Istanbul doit lire l'heure d'Istanbul.
  const fmt = (d: Date) => d.toLocaleTimeString(en ? 'en-GB' : 'fr-FR', { hour: '2-digit', minute: '2-digit' })
  const dans = (m: number) => (m >= 60 ? `${Math.floor(m / 60)} h ${String(m % 60).padStart(2, '0')}` : `${m} min`)

  return (
    <section
      aria-label={en ? `Prayer in ${nom}` : `Prière à ${nom}`}
      style={{
        maxWidth: 700, margin: '0 auto 18px', padding: 16, borderRadius: 18,
        background: 'linear-gradient(150deg, rgba(27,67,50,0.55), rgba(255,255,255,0.05))',
        border: '1.5px solid rgba(201,168,76,0.5)',
      }}
    >
      <p style={{ color: 'var(--or)', fontSize: 12.5, fontWeight: 900, letterSpacing: '0.08em', textTransform: 'uppercase', margin: 0 }}>
        🕌 {en ? `Prayer in ${nom}` : `Prière à ${nom}`}
      </p>

      {calc ? (
        <>
          <p style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#fdfaf3', fontSize: 24, fontWeight: 900, margin: '6px 0 0', lineHeight: 1.15 }}>
            {calc.suivante.k} {fmt(calc.suivante.d)}
            <span style={{ color: 'var(--or)', fontSize: 16, fontWeight: 800 }}> · {en ? 'in' : 'dans'} {dans(calc.minutes)}</span>
          </p>
          <div style={{ display: 'flex', justifyContent: 'space-between', gap: 4, marginTop: 12, paddingTop: 10, borderTop: '1px solid rgba(253,250,243,0.14)' }}>
            {calc.liste.map(({ k, d }) => {
              const on = k === calc.suivante.k
              return (
                <div key={k} style={{ textAlign: 'center', flex: 1, borderRadius: 12, padding: '6px 2px', background: on ? 'rgba(201,168,76,0.18)' : 'transparent', border: on ? '1px solid rgba(201,168,76,0.45)' : '1px solid transparent' }}>
                  <p style={{ fontSize: 11, fontWeight: 800, letterSpacing: '0.04em', textTransform: 'uppercase', color: on ? 'var(--or)' : 'rgba(253,250,243,0.78)', margin: 0 }}>{k}</p>
                  <p style={{ fontFamily: "'Playfair Display', Georgia, serif", color: 'rgba(253,250,243,0.95)', fontWeight: on ? 900 : 700, fontSize: 16, margin: '3px 0 0', fontVariantNumeric: 'tabular-nums', lineHeight: 1.1 }}>{fmt(d)}</p>
                </div>
              )
            })}
          </div>
        </>
      ) : (
        <p style={{ color: 'rgba(253,250,243,0.6)', fontSize: 13.5, margin: '6px 0 0' }}>…</p>
      )}

      <div style={{ display: 'flex', gap: 10, marginTop: 12, flexWrap: 'wrap' }}>
        <a href={`/qibla${ctx}`} style={{ flex: 1, minWidth: 150, minHeight: 46, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 999, background: 'var(--or)', color: 'var(--nuit)', fontSize: 13.5, fontWeight: 900, textDecoration: 'none' }}>
          🧭 {en ? `Qibla from ${nom}` : `Qibla depuis ${nom}`}
        </a>
        <a href={`/horaires-priere${ctx}`} style={{ flex: 1, minWidth: 150, minHeight: 46, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', gap: 8, borderRadius: 999, background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(201,168,76,0.4)', color: 'var(--or-clair)', fontSize: 13.5, fontWeight: 700, textDecoration: 'none' }}>
          🕐 {en ? 'All prayer times' : 'Tous les horaires'}
        </a>
      </div>
    </section>
  )
}
