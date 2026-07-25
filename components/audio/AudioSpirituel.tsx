'use client'
import { useEffect, useRef, useState } from 'react'
import { SOURATES, DOUAS, ADHKAR, type Track } from '@/lib/audioSpirituel'
import { useLanguage } from '@/components/i18n/LanguageProvider'

// 🎧 Section Audio / Spirituel — lecteur simple et apaisant.
// Un seul <audio> partagé ; chaque piste : gros bouton play/pause (≥56px),
// barre de temps, téléchargement mp3 (mode hors-ligne du voyageur).

const fmt = (s: number) => `${Math.floor(s / 60)}:${String(Math.floor(s % 60)).padStart(2, '0')}`

export default function AudioSpirituel() {
  const { lang } = useLanguage()
  const en = lang === 'en'
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const [current, setCurrent] = useState<string | null>(null)
  const [playing, setPlaying] = useState(false)
  const [t, setT] = useState(0)
  const [dur, setDur] = useState(0)
  const [openText, setOpenText] = useState<string | null>(null)

  useEffect(() => {
    const a = new Audio()
    audioRef.current = a
    a.preload = 'none'
    const onTime = () => setT(a.currentTime)
    const onMeta = () => setDur(a.duration || 0)
    const onEnd = () => setPlaying(false)
    a.addEventListener('timeupdate', onTime)
    a.addEventListener('loadedmetadata', onMeta)
    a.addEventListener('ended', onEnd)
    return () => { a.pause(); a.removeEventListener('timeupdate', onTime); a.removeEventListener('loadedmetadata', onMeta); a.removeEventListener('ended', onEnd) }
  }, [])

  const toggle = (tr: Track) => {
    const a = audioRef.current
    if (!a || !tr.audio) return
    if (current === tr.id) {
      if (playing) { a.pause(); setPlaying(false) } else { a.play(); setPlaying(true) }
      return
    }
    a.src = tr.audio
    a.play()
    setCurrent(tr.id); setPlaying(true); setT(0); setDur(0)
  }

  const seek = (v: number) => { const a = audioRef.current; if (a && dur) { a.currentTime = v; setT(v) } }

  const Card = ({ tr }: { tr: Track }) => {
    const active = current === tr.id
    const hasAudio = !!tr.audio
    const hasText = !!tr.arabe
    const textOpen = openText === tr.id
    return (
      <div style={{ background: 'rgba(255,255,255,0.05)', border: `1px solid ${active ? 'rgba(201,168,76,0.65)' : 'rgba(201,168,76,0.22)'}`, borderRadius: 18, padding: '14px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
          {hasAudio ? (
            <button
              onClick={() => toggle(tr)}
              aria-label={active && playing ? (en ? 'Pause' : 'Pause') : (en ? 'Play' : 'Écouter')}
              style={{ width: 56, height: 56, flexShrink: 0, borderRadius: '50%', border: 'none', cursor: 'pointer', background: active ? 'var(--or)' : 'rgba(201,168,76,0.18)', color: active ? '#0b1a0f' : 'var(--or)', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              {active && playing ? '⏸' : '▶'}
            </button>
          ) : (
            <button
              onClick={() => setOpenText(textOpen ? null : tr.id)}
              aria-label={en ? 'Read the text' : 'Lire le texte'}
              style={{ width: 56, height: 56, flexShrink: 0, borderRadius: '50%', border: '1px solid rgba(201,168,76,0.5)', cursor: 'pointer', background: 'transparent', color: 'var(--or)', fontSize: 22, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
            >
              📖
            </button>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p style={{ margin: 0, color: '#fdfaf3', fontWeight: 800, fontSize: 16.5 }}>{en ? tr.titreEn : tr.titre}</p>
            <p style={{ margin: '2px 0 0', color: 'rgba(253,250,243,0.55)', fontSize: 13 }}>{en ? tr.sousTitreEn : tr.sousTitre}</p>
          </div>
          {hasAudio && (
            <a
              href={tr.audio}
              download
              target="_blank"
              rel="noopener noreferrer"
              title={en ? 'Download mp3 (offline)' : 'Télécharger le mp3 (hors-ligne)'}
              style={{ width: 56, height: 56, flexShrink: 0, borderRadius: '50%', border: '1px solid rgba(201,168,76,0.4)', color: 'var(--or)', fontSize: 20, display: 'flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none' }}
            >
              ⬇️
            </a>
          )}
          {hasText && hasAudio === false && (
            <span style={{ color: 'rgba(253,250,243,0.4)', fontSize: 12, flexShrink: 0 }}>{en ? 'text' : 'texte'}</span>
          )}
        </div>

        {/* Barre de temps (piste active) */}
        {hasAudio && active && (
          <div style={{ marginTop: 12 }}>
            <input
              type="range" min={0} max={dur || 1} step={1} value={Math.min(t, dur || 1)}
              onChange={(e) => seek(Number(e.target.value))}
              aria-label={en ? 'Seek' : 'Position'}
              style={{ width: '100%', accentColor: '#C9A84C', height: 22, cursor: 'pointer' }}
            />
            <div style={{ display: 'flex', justifyContent: 'space-between', color: 'rgba(253,250,243,0.55)', fontSize: 12.5 }}>
              <span>{fmt(t)}</span><span>{dur ? fmt(dur) : '–:––'}</span>
            </div>
          </div>
        )}

        {/* Texte de la dou'a (arabe + phonétique + traduction + source) */}
        {hasText && (textOpen || (active && hasAudio)) && (
          <div style={{ marginTop: 12, borderTop: '1px solid rgba(255,255,255,0.08)', paddingTop: 12 }}>
            <p dir="rtl" lang="ar" style={{ margin: 0, color: '#fdfaf3', fontSize: 22, lineHeight: 2, textAlign: 'right', fontFamily: "'Scheherazade New', 'Amiri', serif" }}>{tr.arabe}</p>
            {tr.phonetique && <p style={{ margin: '10px 0 0', color: 'var(--or)', fontSize: 14.5, lineHeight: 1.7, fontStyle: 'italic' }}>{tr.phonetique}</p>}
            <p style={{ margin: '10px 0 0', color: 'rgba(253,250,243,0.85)', fontSize: 14.5, lineHeight: 1.7 }}>{en ? tr.en : tr.fr}</p>
          </div>
        )}
        {tr.source && (hasText ? (textOpen || active) : active) && (
          <p style={{ margin: '10px 0 0', color: 'rgba(253,250,243,0.4)', fontSize: 12 }}>📚 {en ? 'Source: ' : 'Source : '}{tr.source}</p>
        )}
      </div>
    )
  }

  const Section = ({ titre, sub, tracks }: { titre: string; sub?: string; tracks: Track[] }) => (
    <section style={{ marginTop: 26 }}>
      <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#fdfaf3', fontSize: 22, fontWeight: 800, margin: '0 0 4px' }}>{titre}</h2>
      {sub && <p style={{ color: 'rgba(253,250,243,0.55)', fontSize: 13.5, margin: '0 0 12px' }}>{sub}</p>}
      <div style={{ display: 'grid', gap: 10 }}>
        {tracks.map((tr) => <Card key={tr.id} tr={tr} />)}
      </div>
    </section>
  )

  return (
    <main style={{ background: 'var(--nuit)', minHeight: '100vh', padding: '28px 16px 90px' }}>
      <div style={{ maxWidth: 680, margin: '0 auto' }}>
        <p style={{ color: 'var(--or)', fontSize: 12, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', margin: 0 }}>
          {en ? 'Audio · Spiritual' : 'Audio · Spirituel'}
        </p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", color: '#fdfaf3', fontSize: 30, fontWeight: 900, margin: '6px 0 8px' }}>
          {en ? 'Your travel companion' : 'Ton compagnon de voyage'}
        </h1>
        <p style={{ color: 'rgba(253,250,243,0.65)', fontSize: 15, lineHeight: 1.65, margin: 0 }}>
          {en
            ? 'Travel duas and protection surahs — listen, read, download for offline use.'
            : 'Dou\'as du voyageur et sourates de protection — écoute, lis, télécharge pour le hors-ligne.'}
        </p>
        <p style={{ color: 'rgba(253,250,243,0.45)', fontSize: 12.5, margin: '10px 0 0', lineHeight: 1.6 }}>
          💡 {en
            ? 'Bad connection abroad? Tap ⬇️ on each surah to save the mp3 on your phone before you fly.'
            : 'Connexion difficile à l\'étranger ? Touche ⬇️ sur chaque sourate pour garder le mp3 sur ton téléphone avant de partir.'}
        </p>

        <Section
          titre={en ? '🤲 Traveler\'s duas' : '🤲 Dou\'as du voyageur'}
          sub={en ? 'Arabic text, transliteration and translation — source: Hisn al-Muslim.' : 'Texte arabe, phonétique et traduction — source : Hisn al-Muslim.'}
          tracks={DOUAS}
        />
        <Section
          titre={en ? '📿 Protection & travel surahs' : '📿 Sourates de protection & voyage'}
          sub={en ? 'Free & legal audio — Mishary Alafasy recitation via the alquran.cloud open API.' : 'Audio libre et légal — récitation Mishary Alafasy via l\'API ouverte alquran.cloud.'}
          tracks={SOURATES}
        />
        <Section
          titre={en ? '🌅 Morning & evening adhkar' : '🌅 Adhkâr du matin et du soir'}
          sub={en ? 'The two essentials, to say 3 times.' : 'Les deux essentiels, à dire 3 fois.'}
          tracks={ADHKAR}
        />
      </div>
    </main>
  )
}
