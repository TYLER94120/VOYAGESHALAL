'use client'
import { useRef, useState } from 'react'
import type { CityGuide } from '@/lib/cityGuides'
import { guidePhoto } from '@/lib/cityGuides'

// Carrousel « L'essentiel en 3 jours » : cartes-photo swipables (~1,3 visible,
// scroll-snap, points indicateurs). Photo réelle du monument du jour
// (Wikimedia, revue humaine) — fallback dégradé de marque si absente.
export default function GuideCarousel({ guide, villeNom, heroImage, en }: { guide: CityGuide; villeNom: string; heroImage?: string; en: boolean }) {
  const track = useRef<HTMLDivElement>(null)
  const [idx, setIdx] = useState(0)

  const onScroll = () => {
    const el = track.current
    if (!el || !el.firstElementChild) return
    const w = (el.firstElementChild as HTMLElement).offsetWidth + 12
    setIdx(Math.max(0, Math.min(guide.jours.length - 1, Math.round(el.scrollLeft / w))))
  }

  return (
    <div>
      <div ref={track} onScroll={onScroll}
        style={{ display: 'flex', gap: 12, overflowX: 'auto', paddingBottom: 6, scrollSnapType: 'x mandatory', WebkitOverflowScrolling: 'touch', scrollbarWidth: 'none' }}>
        {guide.jours.map((j, i) => {
          // TOUJOURS une vraie photo : celle du monument du jour, sinon la
          // photo hero de la ville — jamais d'icône sur bloc de couleur.
          const monument = guidePhoto(j.photoKey)
          const photo = monument ?? (heroImage ? { url: heroImage } : null)
          return (
            <a key={i} href={`https://www.google.com/maps/search/${encodeURIComponent(`${j.maps}`)}`} target="_blank" rel="noopener noreferrer"
              style={{ width: 'min(76vw, 300px)', minWidth: 'min(76vw, 300px)', scrollSnapAlign: 'start', background: '#fff', border: '1px solid rgba(27,67,50,0.1)', borderRadius: 18, overflow: 'hidden', textDecoration: 'none', boxShadow: '0 6px 20px rgba(11,26,15,0.07)', transition: 'transform .18s' }}>
              <div style={{ position: 'relative', height: 132, background: 'linear-gradient(120deg, #0B1A0F, #1B4332)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {photo && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={photo.url} alt={`${en ? j.titreEn : j.titre} — ${villeNom}`} loading="lazy"
                    style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />
                )}
                {monument?.credit && (
                  <span style={{ position: 'absolute', bottom: 4, right: 6, fontSize: 8.5, color: 'rgba(255,255,255,0.85)', background: 'rgba(0,0,0,0.35)', borderRadius: 6, padding: '1px 5px', maxWidth: '60%', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    📷 {monument.credit}
                  </span>
                )}
                <span style={{ position: 'absolute', left: 10, bottom: 8, background: 'rgba(11,26,15,0.82)', color: 'var(--or)', borderRadius: 999, padding: '4px 12px', fontWeight: 800, fontSize: 12.5, letterSpacing: 0.3 }}>
                  {en ? j.titreEn : j.titre}
                </span>
              </div>
              <div style={{ padding: '12px 14px 14px' }}>
                {j.etapes.slice(0, 3).map((e, k) => (
                  <p key={k} style={{ fontSize: 14, color: 'var(--texte, #1f2937)', fontWeight: 600, margin: k ? '7px 0 0' : 0, display: 'flex', gap: 8, alignItems: 'baseline' }}>
                    <span>{e.icon}</span><span>{en ? e.en : e.fr}</span>
                  </p>
                ))}
                <p style={{ fontSize: 12, color: 'var(--foret)', fontWeight: 700, margin: '10px 0 0' }}>🗺 {en ? 'Open in Maps →' : 'Ouvrir dans Maps →'}</p>
              </div>
            </a>
          )
        })}
      </div>
      {/* Points indicateurs */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 8 }} aria-hidden>
        {guide.jours.map((_, i) => (
          <span key={i} style={{ width: i === idx ? 18 : 7, height: 7, borderRadius: 999, background: i === idx ? 'var(--or)' : 'rgba(27,67,50,0.2)', transition: 'all .18s' }} />
        ))}
      </div>
    </div>
  )
}
