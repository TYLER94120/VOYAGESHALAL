'use client'
import { useState, useEffect, useRef } from 'react'
import { PrayerTimesWidget } from '@/components/PrayerTimesWidget'
import { useInstantPosition } from '@/lib/useInstantPosition'
import PositionBadge from '@/components/location/PositionBadge'
import { PRAYER_METHODS, ASR_SCHOOLS, defaultMethodForCountry } from '@/lib/prayer'
import AdhanSettings from '@/components/adhan/AdhanSettings'
import { useLanguage } from '@/components/i18n/LanguageProvider'

// UX « Muslim Pro » : les horaires s'affichent INSTANTANÉMENT en haut, sans
// aucun clic. La position vient de useInstantPosition, la source commune à
// tout le site.
//
// Cette page avait sa PROPRE copie de la résolution de position : sa propre
// géoloc IP, son propre GPS, sa propre clé de stockage. Deux implémentations
// pour une même question, qui pouvaient répondre différemment sur le même
// écran — c'est exactement ce qui a donné deux horaires de prière
// contradictoires. Il n'en reste qu'une.

interface VilleOption { nom: string; apiName: string; pays: string; code: string; lat: number; lng: number }

const VILLES: VilleOption[] = [
  { nom: 'Marrakech', apiName: 'Marrakech', pays: 'Maroc', code: 'MA' , lat: 31.6295, lng: -7.9811 },
  { nom: 'Casablanca', apiName: 'Casablanca', pays: 'Maroc', code: 'MA' , lat: 33.5731, lng: -7.5898 },
  { nom: 'Alger', apiName: 'Algiers', pays: 'Algérie', code: 'DZ' , lat: 36.7372, lng: 3.0865 },
  { nom: 'Tunis', apiName: 'Tunis', pays: 'Tunisie', code: 'TN' , lat: 36.819, lng: 10.1658 },
  { nom: 'Istanbul', apiName: 'Istanbul', pays: 'Turquie', code: 'TR' , lat: 41.0082, lng: 28.9784 },
  { nom: 'Le Caire', apiName: 'Cairo', pays: 'Égypte', code: 'EG' , lat: 30.0444, lng: 31.2357 },
  { nom: 'Dubaï', apiName: 'Dubai', pays: 'Émirats', code: 'AE' , lat: 25.2048, lng: 55.2708 },
  { nom: 'La Mecque', apiName: 'Mecca', pays: 'Arabie Saoudite', code: 'SA' , lat: 21.3891, lng: 39.8579 },
  { nom: 'Médine', apiName: 'Medina', pays: 'Arabie Saoudite', code: 'SA' , lat: 24.5247, lng: 39.5692 },
  { nom: 'Paris', apiName: 'Paris', pays: 'France', code: 'FR' , lat: 48.8566, lng: 2.3522 },
  { nom: 'Marseille', apiName: 'Marseille', pays: 'France', code: 'FR' , lat: 43.2965, lng: 5.3698 },
  { nom: 'Londres', apiName: 'London', pays: 'Royaume-Uni', code: 'GB' , lat: 51.5074, lng: -0.1278 },
  { nom: 'Kuala Lumpur', apiName: 'Kuala Lumpur', pays: 'Malaisie', code: 'MY' , lat: 3.139, lng: 101.6869 },
]

interface Pos { lat?: number; lng?: number; label: string; pays?: string; apiName?: string; code?: string }

export default function HorairesClient() {
  const { lang } = useLanguage()
  const en = lang === 'en'
  // Position partagée par tout le site (le badge et le reste de la page
  // regardent le même objet — jamais deux enquêtes en parallèle).
  const etatPos = useInstantPosition(en)
  // Ville choisie à la main dans la liste ci-dessous : elle prime, et elle est
  // diffusée au reste du site (setManual) pour que rien ne la contredise.
  const [choixVille, setChoixVille] = useState<VilleOption | null>(null)
  const pos: Pos | null = choixVille
    ? { lat: choixVille.lat, lng: choixVille.lng, label: choixVille.nom, pays: choixVille.pays, apiName: choixVille.apiName, code: choixVille.code }
    : etatPos.pos
  const [method, setMethod] = useState(3)
  const [school, setSchool] = useState(0)
  const [methodTouched, setMethodTouched] = useState(false)

  // « J'ai bougé — me relocaliser » doit vraiment libérer la ville choisie,
  // sinon le GPS répond et l'écran continue d'afficher l'ancienne ville.
  useEffect(() => {
    if (etatPos.source === 'gps') setChoixVille(null)
  }, [etatPos.source])

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

  const selectStyle = { width: '100%', minHeight: 48, padding: '0 12px', borderRadius: 10, border: '1.5px solid rgba(27,67,50,0.25)', background: '#fff', fontSize: 14.5, color: 'var(--texte)', textAlign: 'center' as const, textAlignLast: 'center' as const }

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

      {/* Position : le même bloc que sur toutes les pages du site — le lieu
          est nommé, l'état est dit, et l'action est visible quand elle sert. */}
      <div style={{ marginTop: 12 }}>
        <PositionBadge etat={etatPos} en={en} clair />
      </div>

      {/* ═══ 2. VILLES RAPIDES ═══ */}
      <details style={{ marginTop: 14 }}>
        <summary style={{ cursor: 'pointer', fontWeight: 700, fontSize: 14, color: 'var(--foret)', padding: '10px 2px' }}>
          🌍 {en ? `Another city (currently: ${pos?.label ?? '…'})` : `Autre ville (actuellement : ${pos?.label ?? '…'})`}
        </summary>
        <div className="ville-grid" style={{ marginTop: 10 }}>
          {VILLES.map((v) => (
            <button key={v.nom} className="ville-btn" onClick={() => { setMethodTouched(false); setChoixVille(v); etatPos.setManual({ lat: v.lat, lng: v.lng, label: v.nom, pays: v.pays }) }}>
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
