'use client'
import { useEffect, useState } from 'react'
import Link from 'next/link'

// ♡ MY SAVES — le carnet unique du moteur Swipe. Lit les clés locales :
//   vh_wishlist_villes            — les villes gardées au World feed
//   vh_immersion_gardes:{slug}    — les lieux gardés dans chaque ville
// « Build my days » ouvre le planning de la ville, qui démarre déjà avec
// ces lieux (brief 4 bis). Tout est local au téléphone.

interface Garde { id: string; nom: string; lat: number; lng: number }

export default function MySaves() {
  const [villes, setVilles] = useState<string[]>([])
  const [parVille, setParVille] = useState<Record<string, Garde[]>>({})

  useEffect(() => {
    try { setVilles(JSON.parse(localStorage.getItem('vh_wishlist_villes') ?? '[]')) } catch { /* vide */ }
    const lieux: Record<string, Garde[]> = {}
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i)
      if (!k?.startsWith('vh_immersion_gardes:')) continue
      try {
        const l = JSON.parse(localStorage.getItem(k) ?? '[]') as Garde[]
        if (l.length) lieux[k.slice('vh_immersion_gardes:'.length)] = l
      } catch { /* clé illisible : ignorée */ }
    }
    setParVille(lieux)
  }, [])

  const nomVille = (slug: string) => slug.split('-').map((m) => m.charAt(0).toUpperCase() + m.slice(1)).join(' ')
  const vide = !villes.length && !Object.keys(parVille).length

  return (
    <div className="pv" style={{ minHeight: '100svh', paddingTop: 26 }}>
      <section className="pv-sec">
        <div className="pv-sec-titre"><h2>My saves</h2></div>
        {vide && (
          <p className="pv-sec-sous">Nothing saved yet — swipe the <Link href="/" style={{ color: '#E9D9A6' }}>world feed</Link> and double-tap what you love.</p>
        )}

        {villes.length > 0 && (
          <>
            <p className="pv-sec-sous" style={{ marginTop: 14 }}>Cities on your wishlist</p>
            {villes.map((slug) => (
              <Link key={slug} className="pv-ligne" href={`/destinations/${slug}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <span className="pv-l-txt"><span className="pv-l-nom">{nomVille(slug)}</span><span className="pv-l-sous">Keep swiping →</span></span>
              </Link>
            ))}
          </>
        )}

        {Object.entries(parVille).map(([slug, lieux]) => (
          <div key={slug} style={{ marginTop: 22 }}>
            <p className="pv-sec-sous">{nomVille(slug)} — {lieux.length} place{lieux.length > 1 ? 's' : ''} saved</p>
            {lieux.map((l) => (
              <a key={l.id} className="pv-ligne" href={`https://www.google.com/maps/dir/?api=1&destination=${l.lat},${l.lng}`}
                style={{ textDecoration: 'none', color: 'inherit' }}>
                <span className="pv-l-txt"><span className="pv-l-nom">{l.nom}</span><span className="pv-l-sous">Go →</span></span>
              </a>
            ))}
            <Link className="pv-ligne premier" href={`/destinations/${slug}?construire=1`}
              style={{ textDecoration: 'none', color: '#E9D9A6', justifyContent: 'center', fontWeight: 700 }}>
              ✦ Build my days in {nomVille(slug)}
            </Link>
          </div>
        ))}
      </section>
    </div>
  )
}
