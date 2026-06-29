'use client'
import { useState, useEffect } from 'react'
import { PrayerTimesWidget } from '@/components/PrayerTimesWidget'
import { useLocation } from '@/components/location/LocationProvider'
import { getPosition, describeGeoError, type GeoError, type GeoErrorCode } from '@/lib/geo'
import { PRAYER_METHODS, ASR_SCHOOLS, defaultMethodForCountry } from '@/lib/prayer'
import AdhanSettings from '@/components/adhan/AdhanSettings'

interface VilleOption {
  nom: string
  apiName: string
  pays: string
  code: string
}

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

export default function HorairesClient() {
  const { city } = useLocation()
  const [pos, setPos] = useState<Pos | null>(null)
  const [geoLoading, setGeoLoading] = useState(false)
  const [geoErr, setGeoErr] = useState<GeoError | null>(null)
  const [method, setMethod] = useState(3)
  const [school, setSchool] = useState(0)
  const [methodTouched, setMethodTouched] = useState(false)

  // Restaure les préférences (méthode + école)
  useEffect(() => {
    try {
      const m = localStorage.getItem('vh_prayer_method')
      const s = localStorage.getItem('vh_prayer_school')
      if (m) { setMethod(Number(m)); setMethodTouched(true) }
      if (s) setSchool(Number(s))
    } catch {}
  }, [])

  // Au chargement : si une ville est mémorisée, on l'utilise comme position de départ
  useEffect(() => {
    if (city && city.lat != null && city.lng != null && !pos) {
      setPos({ lat: city.lat, lng: city.lng, label: city.nom, pays: city.pays })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [city])

  // Méthode auto selon le pays (tant que l'utilisateur n'a pas choisi manuellement)
  useEffect(() => {
    if (!methodTouched && pos?.pays) setMethod(defaultMethodForCountry(pos.pays))
  }, [pos, methodTouched])

  const setMethodPref = (m: number) => {
    setMethod(m); setMethodTouched(true)
    try { localStorage.setItem('vh_prayer_method', String(m)) } catch {}
  }
  const setSchoolPref = (s: number) => {
    setSchool(s)
    try { localStorage.setItem('vh_prayer_school', String(s)) } catch {}
  }

  const useMyPosition = async () => {
    setGeoLoading(true); setGeoErr(null)
    try {
      const { lat, lng } = await getPosition({ highAccuracy: true })
      setPos({ lat, lng, label: 'Ma position exacte' })
    } catch (code) {
      setGeoErr(describeGeoError(code as GeoErrorCode))
    } finally {
      setGeoLoading(false)
    }
  }

  return (
    <div className="max-w-3xl mx-auto">
      {/* Réglages de l'adhan automatique */}
      <AdhanSettings />

      {/* Position GPS précise — priorité pour des horaires « à la minute » */}
      <button
        onClick={useMyPosition}
        disabled={geoLoading}
        style={{ width: '100%', padding: '16px', borderRadius: 14, border: 'none', cursor: geoLoading ? 'wait' : 'pointer', background: 'var(--foret)', color: '#fff', fontSize: 16, fontWeight: 700, marginBottom: 14, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}
      >
        📍 {geoLoading ? 'Localisation précise…' : 'Horaires pour ma position exacte (GPS)'}
      </button>

      {geoErr && (
        <div style={{ background: 'rgba(255,100,100,0.12)', border: '1px solid rgba(255,100,100,0.3)', borderRadius: 12, padding: '12px 16px', marginBottom: 14 }}>
          <p style={{ color: '#b91c1c', fontWeight: 700, margin: 0, fontSize: 14 }}>{geoErr.message}</p>
          <p style={{ color: 'var(--texte-2)', fontSize: 13, margin: '4px 0 0' }}>{geoErr.detail}</p>
        </div>
      )}

      {/* Réglages de calcul — engagent l'exactitude, donc explicites et modifiables */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 18 }}>
        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: 'var(--foret)' }}>
          Méthode de calcul
          <select value={method} onChange={(e) => setMethodPref(Number(e.target.value))} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid rgba(27,67,50,0.25)', background: '#fff', fontSize: 13, color: 'var(--texte)', textAlign: 'center', textAlignLast: 'center' }}>
            {PRAYER_METHODS.map((m) => <option key={m.id} value={m.id}>{m.label}</option>)}
          </select>
        </label>
        <label style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', gap: 5, fontSize: 12, fontWeight: 700, color: 'var(--foret)' }}>
          École (ʿAsr)
          <select value={school} onChange={(e) => setSchoolPref(Number(e.target.value))} style={{ width: '100%', padding: '10px 12px', borderRadius: 10, border: '1.5px solid rgba(27,67,50,0.25)', background: '#fff', fontSize: 13, color: 'var(--texte)', textAlign: 'center', textAlignLast: 'center' }}>
            {ASR_SCHOOLS.map((s) => <option key={s.id} value={s.id}>{s.label}</option>)}
          </select>
        </label>
      </div>

      {pos ? (
        <>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14, fontSize: 13, color: 'var(--texte-2)', flexWrap: 'wrap' }}>
            <span style={{ fontWeight: 700, color: 'var(--foret)' }}>📍 {pos.label}</span>
            {pos.lat != null && pos.lng != null && <span>· lat {pos.lat.toFixed(3)}, lng {pos.lng.toFixed(3)}</span>}
            <button onClick={() => { setPos(null); setGeoErr(null) }} style={{ background: 'none', border: 'none', color: 'var(--or)', fontWeight: 700, fontSize: 13, cursor: 'pointer', marginLeft: 'auto' }}>Changer →</button>
          </div>
          <PrayerTimesWidget
            ville={pos.apiName ?? pos.label}
            pays={pos.pays ?? ''}
            countryCode={pos.code ?? ''}
            lat={pos.lat}
            lng={pos.lng}
            method={method}
            school={school}
          />
        </>
      ) : (
        <>
          <p style={{ fontSize: 13, color: 'var(--texte-2)', marginBottom: 10 }}>
            Ou choisissez une ville (la position GPS reste la plus précise) :
          </p>
          <div className="ville-grid" style={{ marginBottom: 18 }}>
            {VILLES.map((v) => (
              <button key={v.nom} className="ville-btn" onClick={() => { setMethodTouched(false); setPos({ label: v.nom, pays: v.pays, apiName: v.apiName, code: v.code }) }}>
                {v.nom}
              </button>
            ))}
          </div>
        </>
      )}

      <p style={{ fontSize: 12, color: 'var(--texte-2)', marginTop: 16, lineHeight: 1.6 }}>
        ⚠️ Les horaires varient selon la méthode de calcul et l’école juridique. Vérifiez la convention de votre
        mosquée locale. Source : Aladhan.com · calcul basé sur votre position GPS.
      </p>
    </div>
  )
}
