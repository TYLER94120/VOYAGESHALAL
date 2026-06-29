'use client'
import { useAdhan } from '@/components/adhan/AdhanProvider'
import { MUEZZINS, PRAYER_KEYS, PRAYER_LABELS } from '@/lib/adhan'
import { useLocation } from '@/components/location/LocationProvider'

// Réglages de l'adhan dans l'app (sonne quand le site/PWA est ouvert).
export default function AdhanSettings() {
  const { enabled, muezzin, volume, perPrayer, nextInfo, setEnabled, setMuezzin, setVolume, togglePrayer, test } = useAdhan()
  const { city } = useLocation()

  return (
    <div style={{ background: '#fff', border: '1px solid rgba(27,67,50,0.12)', borderRadius: 16, padding: 18, marginBottom: 18, boxShadow: '0 4px 16px rgba(11,26,15,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, color: 'var(--foret)', fontSize: 18, margin: 0 }}>🔊 Adhan automatique</p>
          <p style={{ color: 'var(--texte-2)', fontSize: 12.5, margin: '3px 0 0' }}>Sonne à l’heure de la prière quand l’app est ouverte.</p>
        </div>
        {/* Interrupteur */}
        <button onClick={() => setEnabled(!enabled)} aria-label="Activer l'adhan" style={{ flexShrink: 0, width: 52, height: 30, borderRadius: 20, border: 'none', cursor: 'pointer', background: enabled ? 'var(--foret)' : 'rgba(11,26,15,0.18)', position: 'relative', transition: 'background .2s' }}>
          <span style={{ position: 'absolute', top: 3, left: enabled ? 25 : 3, width: 24, height: 24, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
        </button>
      </div>

      {enabled && (
        <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 14 }}>
          {!city && (
            <p style={{ background: 'rgba(255,180,0,0.12)', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 10, padding: '10px 12px', fontSize: 12.5, color: '#8A6D1E', margin: 0 }}>
              ⚠️ Choisissez d’abord une ville ou activez le GPS pour programmer l’adhan à la bonne heure.
            </p>
          )}
          {nextInfo && (
            <p style={{ fontSize: 13, color: 'var(--foret)', fontWeight: 700, margin: 0 }}>⏱️ Prochain adhan : {PRAYER_LABELS[nextInfo.key]} à {nextInfo.time}</p>
          )}

          {/* Muezzin */}
          <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 700, color: 'var(--foret)' }}>
            Muezzin
            <select value={muezzin} onChange={(e) => setMuezzin(e.target.value)} style={{ padding: '10px 12px', borderRadius: 10, border: '1.5px solid rgba(27,67,50,0.25)', background: '#fff', fontSize: 13, color: 'var(--texte)' }}>
              {MUEZZINS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
            </select>
          </label>

          {/* Prières concernées */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--foret)', margin: '0 0 8px' }}>Prières concernées</p>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {PRAYER_KEYS.map((k) => {
                const on = perPrayer[k]
                return (
                  <button key={k} onClick={() => togglePrayer(k)} style={{ padding: '8px 14px', borderRadius: 20, border: `1.5px solid ${on ? 'var(--foret)' : 'rgba(27,67,50,0.25)'}`, background: on ? 'var(--foret)' : '#fff', color: on ? '#fff' : 'var(--foret)', fontSize: 13, fontWeight: 700, cursor: 'pointer' }}>
                    {PRAYER_LABELS[k]}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Volume */}
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, fontWeight: 700, color: 'var(--foret)' }}>
            🔈
            <input type="range" min={0} max={1} step={0.05} value={volume} onChange={(e) => setVolume(Number(e.target.value))} style={{ flex: 1, accentColor: '#1b4332' }} />
            🔊
          </label>

          <button onClick={test} style={{ padding: '12px', borderRadius: 12, border: 'none', background: 'var(--or)', color: 'var(--nuit)', fontWeight: 800, fontSize: 14, cursor: 'pointer' }}>
            ▶️ Tester l’adhan
          </button>

          <p style={{ fontSize: 11.5, color: 'var(--texte-2)', lineHeight: 1.6, margin: 0 }}>
            ℹ️ L’adhan sonne tant que le site (ou l’app installée) reste ouvert. Pour qu’il sonne app fermée, une vraie application native serait nécessaire (voir « Installer l’app »).
          </p>
        </div>
      )}
    </div>
  )
}
