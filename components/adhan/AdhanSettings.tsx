'use client'
import { useEffect, useState } from 'react'
import { useAdhan } from '@/components/adhan/AdhanProvider'
import { MUEZZINS, CHIMES, PRAYER_KEYS, PRAYER_LABELS } from '@/lib/adhan'
import { useLocation } from '@/components/location/LocationProvider'
import { pushSupported, subscribePush, unsubscribePush } from '@/lib/push-client'
import { useLanguage } from '@/components/i18n/LanguageProvider'

// Réglages de l'adhan dans l'app (sonne quand le site/PWA est ouvert).
export default function AdhanSettings() {
  const { enabled, muezzin, soundMode, chime, volume, perPrayer, nextInfo, setEnabled, setMuezzin, setSoundMode, setChime, setVolume, togglePrayer, test } = useAdhan()
  const { city } = useLocation()
  const { lang } = useLanguage()
  const en = lang === 'en'

  // Notifications Push (app fermée)
  const [pushOn, setPushOn] = useState(false)
  const [pushMsg, setPushMsg] = useState('')
  const [pushBusy, setPushBusy] = useState(false)
  const canPush = pushSupported()
  useEffect(() => { try { setPushOn(localStorage.getItem('vh_push_on') === '1') } catch {} }, [])

  const togglePush = async () => {
    if (pushBusy) return
    setPushBusy(true); setPushMsg('')
    try {
      if (pushOn) {
        await unsubscribePush(); setPushOn(false); localStorage.setItem('vh_push_on', '0')
      } else {
        if (!city || city.lat == null || city.lng == null) { setPushMsg(en ? 'Please pick a city first.' : 'Choisissez d\u2019abord une ville.'); return }
        const method = Number(localStorage.getItem('vh_prayer_method') || 3)
        const school = Number(localStorage.getItem('vh_prayer_school') || 0)
        const prayers = PRAYER_KEYS.filter((k) => perPrayer[k])
        const res = await subscribePush({ lat: city.lat, lng: city.lng, method, school, prayers, city: city.nom })
        if (res.ok) { setPushOn(true); localStorage.setItem('vh_push_on', '1'); setPushMsg(en ? '✓ Notifications enabled.' : '✓ Notifications activées.') }
        else if (res.reason === 'denied') setPushMsg(en ? 'Notifications blocked in the browser.' : 'Notifications refusées dans le navigateur.')
        else if (res.reason === 'not_configured') setPushMsg(en ? 'Service not configured yet (server).' : 'Service non encore configuré (serveur).')
        else setPushMsg(en ? 'Notifications unavailable on this device.' : 'Notifications indisponibles sur cet appareil.')
      }
    } finally { setPushBusy(false) }
  }

  return (
   <>
    <div style={{ background: '#fff', border: '1px solid rgba(27,67,50,0.12)', borderRadius: 16, padding: 18, marginBottom: 18, boxShadow: '0 4px 16px rgba(11,26,15,0.05)' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
        <div>
          <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, color: 'var(--foret)', fontSize: 18, margin: 0 }}>🔊 {en ? 'Automatic Adhan' : 'Adhan automatique'}</p>
          <p style={{ color: 'var(--texte-2)', fontSize: 12.5, margin: '3px 0 0' }}>{en ? 'Plays at prayer time while the app is open.' : 'Sonne à l\u2019heure de la prière quand l\u2019app est ouverte.'}</p>
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
              ⚠️ {en ? 'Pick a city or enable GPS first to schedule the Adhan at the right time.' : 'Choisissez d\u2019abord une ville ou activez le GPS pour programmer l\u2019adhan à la bonne heure.'}
            </p>
          )}
          {nextInfo && (
            <p style={{ fontSize: 13, color: 'var(--foret)', fontWeight: 700, margin: 0 }}>⏱️ {en ? 'Next Adhan' : 'Prochain adhan'} : {PRAYER_LABELS[nextInfo.key]} {en ? 'at' : 'à'} {nextInfo.time}</p>
          )}

          {/* Type de son : adhan complet ou sonnerie discrète (pour le travail) */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--foret)', margin: '0 0 8px' }}>{en ? 'Sound type' : 'Type de son'}</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              <button onClick={() => setSoundMode('adhan')} style={{ padding: '12px', borderRadius: 12, border: `1.5px solid ${soundMode === 'adhan' ? 'var(--foret)' : 'rgba(27,67,50,0.25)'}`, background: soundMode === 'adhan' ? 'var(--foret)' : '#fff', color: soundMode === 'adhan' ? '#fff' : 'var(--foret)', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>🕌 {en ? 'Full Adhan' : 'Adhan complet'}</button>
              <button onClick={() => setSoundMode('discreet')} style={{ padding: '12px', borderRadius: 12, border: `1.5px solid ${soundMode === 'discreet' ? 'var(--foret)' : 'rgba(27,67,50,0.25)'}`, background: soundMode === 'discreet' ? 'var(--foret)' : '#fff', color: soundMode === 'discreet' ? '#fff' : 'var(--foret)', fontSize: 13.5, fontWeight: 700, cursor: 'pointer' }}>🔔 {en ? 'Discreet chime' : 'Sonnerie discrète'}</button>
            </div>
            <p style={{ fontSize: 11.5, color: 'var(--texte-2)', margin: '6px 0 0' }}>
              {soundMode === 'discreet' ? (en ? 'Ideal at work: a short, discreet sound.' : 'Idéal au travail : un son court et discret.') : (en ? 'The full call to prayer.' : 'L\u2019appel à la prière complet.')}
            </p>
          </div>

          {/* Muezzin (adhan) ou carillon (discret) */}
          {soundMode === 'adhan' ? (
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 700, color: 'var(--foret)' }}>
              {en ? 'Muezzin' : 'Muezzin'}
              <select value={muezzin} onChange={(e) => setMuezzin(e.target.value)} style={{ padding: '10px 12px', borderRadius: 10, border: '1.5px solid rgba(27,67,50,0.25)', background: '#fff', fontSize: 13, color: 'var(--texte)' }}>
                {MUEZZINS.map((m) => <option key={m.id} value={m.id}>{m.name}</option>)}
              </select>
            </label>
          ) : (
            <label style={{ display: 'flex', flexDirection: 'column', gap: 5, fontSize: 12, fontWeight: 700, color: 'var(--foret)' }}>
              {en ? 'Discreet chime' : 'Sonnerie discrète'}
              <select value={chime} onChange={(e) => setChime(e.target.value)} style={{ padding: '10px 12px', borderRadius: 10, border: '1.5px solid rgba(27,67,50,0.25)', background: '#fff', fontSize: 13, color: 'var(--texte)' }}>
                {CHIMES.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
            </label>
          )}

          {/* Prières concernées */}
          <div>
            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--foret)', margin: '0 0 8px' }}>{en ? 'Prayers included' : 'Prières concernées'}</p>
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
            ▶️ {en ? 'Test the Adhan' : 'Tester l\u2019adhan'}
          </button>

          <p style={{ fontSize: 11.5, color: 'var(--texte-2)', lineHeight: 1.6, margin: 0 }}>
            ℹ️ {en ? 'The Adhan plays while the site (or installed app) stays open. For alerts when the app is closed, enable notifications below.' : 'L\u2019adhan sonne tant que le site (ou l\u2019app installée) reste ouvert. Pour une alerte app fermée, activez les notifications ci-dessous.'}
          </p>
        </div>
      )}
    </div>

    {/* Notifications Push — alerte de prière même app fermée */}
    {canPush && (
      <div style={{ background: '#fff', border: '1px solid rgba(27,67,50,0.12)', borderRadius: 16, padding: 18, marginBottom: 18, boxShadow: '0 4px 16px rgba(11,26,15,0.05)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 800, color: 'var(--foret)', fontSize: 18, margin: 0 }}>🔔 {en ? 'Prayer notifications' : 'Notifications de prière'}</p>
            <p style={{ color: 'var(--texte-2)', fontSize: 12.5, margin: '3px 0 0' }}>{en ? <>Alert at prayer time, <strong>even when the app is closed</strong>.</> : <>Alerte à l\u2019heure de prière, <strong>même app fermée</strong>.</>}</p>
          </div>
          <button onClick={togglePush} disabled={pushBusy} aria-label="Activer les notifications" style={{ flexShrink: 0, width: 52, height: 30, borderRadius: 20, border: 'none', cursor: 'pointer', background: pushOn ? 'var(--foret)' : 'rgba(11,26,15,0.18)', position: 'relative', transition: 'background .2s' }}>
            <span style={{ position: 'absolute', top: 3, left: pushOn ? 25 : 3, width: 24, height: 24, borderRadius: '50%', background: '#fff', transition: 'left .2s', boxShadow: '0 1px 4px rgba(0,0,0,0.3)' }} />
          </button>
        </div>
        {pushMsg && <p style={{ fontSize: 12.5, color: 'var(--texte-2)', margin: '10px 0 0' }}>{pushMsg}</p>}
        <p style={{ fontSize: 11.5, color: 'var(--texte-2)', lineHeight: 1.6, margin: '10px 0 0' }}>
          📱 {en ? 'On iPhone, install the app first ("Add to Home Screen") to receive notifications. The sound will be the system one (not the Adhan).' : 'Sur iPhone, installez d\u2019abord l\u2019app (« Sur l\u2019écran d\u2019accueil ») pour recevoir les notifications. Le son sera celui du système (pas l\u2019adhan).'}
        </p>
      </div>
    )}
   </>
  )
}
