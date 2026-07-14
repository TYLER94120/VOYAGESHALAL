'use client'
import { useState, useEffect, useRef } from 'react'
import { PrayerTimesWidget } from '@/components/PrayerTimesWidget'
import { useLocation } from '@/components/location/LocationProvider'
import { getPosition, describeGeoError, type GeoError, type GeoErrorCode } from '@/lib/geo'
import { PRAYER_METHODS, ASR_SCHOOLS, defaultMethodForCountry } from '@/lib/prayer'
import AdhanSettings from '@/components/adhan/AdhanSettings'
import { useLanguage } from '@/components/i18n/LanguageProvider'

// UX « Muslim Pro » : les horaires s'affichent INSTANTANÉMENT en haut, sans
// aucun clic. Ordre de résolution de la position (du plus rapide) :
//   1. dernière position utilisée (localStorage)   → 0 ms
//   2. ville mémorisée du site (LocationProvider)  → 0 ms
//   3. Paris par défaut, affiché tout de suite     → 0 ms
//   4. géoloc IP (/api/geoip) en arrière-plan      → ~100-300 ms, transition douce
//   5. GPS en arrière-plan UNIQUEMENT si la permission est déjà accordée
// Le bouton « Ma position exacte » reste disponible pour affiner — il ne
// conditionne JAMAIS l'affichage.

interface VilleOption { nom: string; apiName: string; pays: string; code: string }

const VILLES: VilleOption[] = [
  { nom: 'Marrakech', apiName: 'Marrakech', pays: 'Maroc', code: 'MA' },
  { nom: 'Casablanca', apiName: 'Casablanca', pays: 'Maroc', code: 'MA' },
  { nom: 'Alger', apiName: 'Algiers', pays: 'Algérie', code: 'DZ' },
  { nom: 'Tunis', apiName: 'Tunis', pays: 'Tunisie', code: 'TN' },
  { nom: 'Istanbul', apiName: 'Istanbul', pays: 'Turquie', code: 'TR' },
  { nom: 'Le Caire', apiName: 'Cairo', pays: 'Égypte', code: 'EG' },
  { nom: 'Dubaï', apiName: 'Dubai', pays: 'Émirats', code: 'AE' },
  { nom: 'La Mecque', apiName: 'Mecca', pays: 'Arabie Saoudite', code: 'SA' },
  { nom: 'Médine', apiName: 'Medina', pays: 'Arabie Saoudite', code: 'SA' },
  { nom: 'Paris', apiName: 'Paris', pays: 'France', code: 'FR' },
  { nom: 'Marseille', apiName: 'Marseille', pays: 'France', code: 'FR' },
  { nom: 'Londres', apiName: 'London', pays: 'Royaume-Uni', code: 'GB' },
  { nom: 'Kuala Lumpur', apiName: 'Kuala Lumpur', pays: 'Malaisie', code: 'MY' },
]

interface Pos { lat?: number; lng?: number; label: string; pays?: string; apiName?: string; code?: string }

const LAST_POS_KEY = 'vh_prayer_last_pos'
const DEFAULT_POS: Pos = { lat: 48.8566, lng: 2.3522, label: 'Paris', pays: 'France', code: 'FR' }

export default function HorairesClient() {
  const { city } = useLocation()
  const { lang } = useLanguage()
  const en = lang === 'en'
  const [pos, setPos] = useState<Pos | null>(null)
  const [posSource, setPosSource] = useState<'last' | 'city' | 'default' | 'ip' | 'gps' | 'manual'>('default')
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoErr, setGeoErr] = useState<GeoError | null>(null)
  const [method, setMethod] = useState(3)
  const [school, setSchool] = useState(0)
  const [methodTouched, setMethodTouched] = useState(false)
  const resolved = useRef(false)

  // ── Position instantanée (jamais bloquante) ──
  useEffect(() => {
    if (resolved.current) return
    resolved.current = true

    // 1) Dernière position utilisée
    let initial: Pos | null = null
    let source: typeof posSource = 'default'
    try {
      // Clé partagée entre tous les outils (vh_last_pos) puis clé historique
      for (const k of ['vh_last_pos', LAST_POS_KEY]) {
        const saved = JSON.parse(localStorage.getItem(k) || 'null') as Pos | null
        if (saved && saved.label) { initial = saved; source = 'last'; break }
      }
    } catch { /* stockage privé */ }
    // 2) Ville mémorisée du site
    if (!initial && city && city.lat != null && city.lng != null) {
      initial = { lat: city.lat, lng: city.lng, label: city.nom, pays: city.pays }
      source = 'city'
    }
    // 3) Défaut immédiat (Paris) — l'utilisateur voit des horaires TOUT DE SUITE
    if (!initial) { initial = DEFAULT_POS; source = 'default' }
    setPos(initial); setPosSource(source)

    // 4) Géoloc IP en arrière-plan — n'écrase que le défaut (pas un choix mémorisé)
    if (source === 'default') {
      fetch('/api/geoip')
        .then((r) => r.json())
        .then((j) => {
          if (j?.ok && typeof j.lat === 'number') {
            setPos({ lat: j.lat, lng: j.lng, label: j.city || (en ? 'Around you' : 'Autour de vous') })
            setPosSource('ip')
          }
        })
        .catch(() => { /* on garde le défaut */ })
    }

    // 5) GPS en arrière-plan UNIQUEMENT si la permission est déjà accordée
    //    (pas de pop-up surprise, jamais bloquant)
    try {
      navigator.permissions?.query({ name: 'geolocation' as PermissionName }).then((st) => {
        if (st.state === 'granted') {
          getPosition().then(({ lat, lng }) => {
            setPos({ lat, lng, label: en ? 'My position' : 'Ma position' })
            setPosSource('gps')
          }).catch(() => { /* silencieux */ })
        }
      }).catch(() => { /* Safari sans permissions API */ })
    } catch { /* noop */ }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city])

  // Mémorise la position affichée pour un prochain chargement instantané
  useEffect(() => {
    if (!pos || posSource === 'default') return
    try { localStorage.setItem(LAST_POS_KEY, JSON.stringify(pos)) } catch { /* noop */ }
  }, [pos, posSource])

  // Préférences méthode/école
  useEffect(() => {
    try {
      const m = localStorage.getItem('vh_prayer_method')
      const s = localStorage.getItem('vh_prayer_school')
      if (m) { setMethod(Number(m)); setMethodTouched(true) }
      if (s) setSchool(Number(s))
    } catch { /* noop */ }
  }, [])
  useEffect(() => {
    if (!methodTouched && pos?.pays) setMethod(defaultMethodForCountry(pos.pays))
  }, [pos, methodTouched])

  const setMethodPref = (m: number) => {
    setMethod(m); setMethodTouched(true)
    try { localStorage.setItem('vh_prayer_method', String(m)) } catch { /* noop */ }
  }
  const setSchoolPref = (s: number) => {
    setSchool(s)
    try { localStorage.setItem('vh_prayer_school', String(s)) } catch { /* noop */ }
  }

  // Affinage GPS à la demande — rapide (timeout 8-12 s max), sans recharger
  const useMyPosition = async () => {
    setGeoLoading(true); setGeoErr(null)
    try {
      const { lat, lng } = await getPosition({ highAccuracy: true })
      setPos({ lat, lng, label: en ? 'My exact location' : 'Ma position exacte' })
      setPosSource('gps')
    } catch (code) {
      setGeoErr(describeGeoError(code as GeoErrorCode))
    } finally {
      setGeoLoading(false)
    }
  }

  const selectStyle = { width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid rgba(27,67,50,0.25)', background: '#fff', fontSize: 13, color: 'var(--texte)', textAlign: 'center' as const, textAlignLast: 'center' as const }

  return (
    <div className="max-w-3xl mx-auto">
      {/* ═══ 1. LES HORAIRES, TOUT DE SUITE, EN HAUT ═══ */}
      {pos ? (
        <PrayerTimesWidget
          ville={pos.apiName ?? pos.label}
          pays={pos.pays ?? ''}
          countryCode={pos.code ?? ''}
          lat={pos.lat}
          lng={pos.lng}
          method={method}
          school={school}
          en={en}
        />
      ) : (
        // Hauteur réservée le temps du 1er effet (aucun layout shift)
        <div className="prayer-widget prayer-loading" style={{ minHeight: 220 }} />
      )}

      {/* Affiner : GPS à la demande — n'a jamais bloqué l'affichage */}
      <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
        <button
          onClick={useMyPosition}
          disabled={geoLoading}
          style={{ flex: 1, minWidth: 220, padding: '13px 16px', borderRadius: 12, border: 'none', cursor: geoLoading ? 'wait' : 'pointer', background: 'var(--foret)', color: '#fff', fontSize: 14.5, fontWeight: 700 }}
        >
          📍 {geoLoading ? (en ? 'Locating…' : 'Localisation…') : (en ? 'My exact position (GPS)' : 'Ma position exacte (GPS)')}
        </button>
      </div>
      {posSource === 'ip' && (
        <p style={{ fontSize: 12, color: 'var(--texte-2)', margin: '6px 2px 0' }}>
          {en ? 'Approximate position (network). Tap the button above for minute-accurate times.' : 'Position approximative (réseau). Touchez le bouton ci-dessus pour des horaires à la minute.'}
        </p>
      )}
      {geoErr && (
        <div style={{ background: 'rgba(255,100,100,0.12)', border: '1px solid rgba(255,100,100,0.3)', borderRadius: 12, padding: '12px 16px', marginTop: 10 }}>
          <p style={{ color: '#b91c1c', fontWeight: 700, margin: 0, fontSize: 14 }}>{geoErr.message}</p>
          <p style={{ color: 'var(--texte-2)', fontSize: 13, margin: '4px 0 0' }}>{geoErr.detail}</p>
        </div>
      )}

      {/* ═══ 2. VILLES RAPIDES ═══ */}
      <details style={{ marginTop: 14 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: 14, color: 'var(--foret)', padding: '10px 2px' }}>
          🌍 {en ? `Another city (currently: ${pos?.label ?? '…'})` : `Autre ville (actuellement : ${pos?.label ?? '…'})`}
        </summary>
        <div className="ville-grid" style={{ marginTop: 10 }}>
          {VILLES.map((v) => (
            <button key={v.nom} className="ville-btn" onClick={() => { setMethodTouched(false); setPos({ label: v.nom, pays: v.pays, apiName: v.apiName, code: v.code }); setPosSource('manual') }}>
              {v.nom}
            </button>
          ))}
        </div>
      </details>

      {/* ═══ 3. RÉGLAGES REPLIÉS (adhan, méthode, école) — SOUS les horaires ═══ */}
      <details style={{ marginTop: 6 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: 14, color: 'var(--foret)', padding: '10px 2px' }}>
          ⚙️ {en ? 'Settings (adhan, calculation method, school)' : 'Réglages (adhan, méthode de calcul, école)'}
        </summary>
        <div style={{ marginTop: 10 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 14 }}>
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: 'var(--foret)' }}>
              {en ? 'Calculation method' : 'Méthode de calcul'}
              <select value={method} onChange={(e) => setMethodPref(Number(e.target.value))} style={selectStyle}>
                {PRAYER_METHODS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
              </select>
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: 'var(--foret)' }}>
              {en ? 'School (ʿAsr)' : 'École (ʿAsr)'}
              <select value={school} onChange={(e) => setSchoolPref(Number(e.target.value))} style={selectStyle}>
                {ASR_SCHOOLS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
              </select>
            </label>
          </div>
          <AdhanSettings />
        </div>
      </details>

      <p style={{ fontSize: 12, color: 'var(--texte-2)', marginTop: 16, lineHeight: 1.6 }}>
        {en ? '⚠️ Times vary by calculation method and juristic school. Check your local mosque’s convention. Source: Aladhan.com.' : '⚠️ Les horaires varient selon la méthode de calcul et l’école juridique. Vérifiez la convention de votre mosquée locale. Source : Aladhan.com.'}
      </p>
    </div>
  )
}
