import type { Metadata } from 'next'
import Link from 'next/link'
import { readFileSync, readdirSync } from 'fs'
import path from 'path'
import { getDomainSEO, FR_URL, EN_URL } from '@/lib/domain'
import PepiteFinder from '@/components/hotels/PepiteFinder'
import ReleveForm from '@/components/hotels/ReleveForm'
import { hotelBookingUrl } from '@/lib/affiliate'

// 🏨 Hub Hôtels — 100 % HALALBOOKING (décision produit : Booking & co ne sont
// pas orientés halal). Honnêteté : équipements « vérifiés » = listes
// officielles HalalBooking (_preuve) ; prix = RELEVÉS datés par la communauté,
// jamais inventés, toujours « vérifie le prix du jour ».
export async function generateMetadata(): Promise<Metadata> {
  const { isEN, siteUrl } = await getDomainSEO()
  // 60 caractères maximum : au-delà, Google coupe et le lecteur ne voit plus
  // la fin. « HalalBooking » était en queue de titre — donc invisible dans les
  // résultats. Ce qui fait cliquer passe devant : piscines femmes, sans alcool.
  const title = isEN
    ? 'Halal hotels 2026: women-only pools, no alcohol, family'
    : 'Hôtels halal 2026 : piscines femmes, sans alcool, famille'
  const description = isEN
    ? 'Find your halal gem: verified women/family facilities, honest community price checks, and HalalBooking member prices.'
    : 'Trouve ta pépite halal : équipements femmes/famille vérifiés, relevés de prix honnêtes de la communauté, et prix membres HalalBooking.'
  return {
    title, description,
    alternates: { canonical: `${siteUrl}/hotels`, languages: { fr: `${FR_URL}/hotels`, en: `${EN_URL}/hotels` } },
    openGraph: { title, description, url: `${siteUrl}/hotels` },
  }
}

function loadReleves() {
  try {
    return (JSON.parse(readFileSync(path.join(process.cwd(), 'data', 'prixReleves.json'), 'utf8')).releves ?? []) as {
      hotel: string; villeSlug: string; villeNom: string; booking: number; halalbooking: number; membre?: number; devise: string; date: string; source: string
    }[]
  } catch { return [] }
}

function loadVerifies() {
  const out: { nom: string; villeNom: string; villeSlug: string; piscineNonMixte?: boolean; plagePrivee?: boolean; halalBookingUrl?: string }[] = []
  try {
    for (const f of readdirSync(path.join(process.cwd(), 'data', 'villes'))) {
      try {
        const d = JSON.parse(readFileSync(path.join(process.cwd(), 'data', 'villes', f), 'utf8'))
        for (const h of d.hotels ?? []) {
          if (h.sourceEquipements === 'halalbooking' && (h.piscineNonMixte || h.plagePrivee)) {
            out.push({ nom: h.nom, villeNom: d.nom, villeSlug: d.slug, piscineNonMixte: h.piscineNonMixte, plagePrivee: h.plagePrivee, halalBookingUrl: h.halalBookingUrl })
          }
        }
      } catch { /* fiche illisible */ }
    }
  } catch { /* dossier absent */ }
  return out
}

export default async function HotelsPage() {
  const { isEN: en } = await getDomainSEO()
  const releves = loadReleves()
  const verifies = loadVerifies()

  return (
    <main style={{ background: 'var(--nuit)', minHeight: '100vh', padding: '26px 16px 80px' }}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <p style={{ color: 'var(--or)', fontSize: 12, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', margin: 0 }}>
          {en ? 'Halal hotels · HalalBooking only' : 'Hôtels halal · 100 % HalalBooking'}
        </p>
        <h1 style={{ fontFamily: "'Playfair Display', serif", color: '#fdfaf3', fontSize: 30, fontWeight: 900, margin: '6px 0 8px', lineHeight: 1.15 }}>
          {en ? 'Sleep halal — often for less.' : 'Dors halal — souvent moins cher.'}
        </h1>
        <p style={{ color: 'rgba(253,250,243,0.7)', fontSize: 15, lineHeight: 1.65, margin: '0 0 16px' }}>
          {en
            ? 'Booking & co have no halal filters. HalalBooking does: women-only pools, no alcohol, halal food — and member prices. We only work with them.'
            : 'Booking & co n\'ont aucun filtre halal. HalalBooking si : piscines femmes, sans alcool, cuisine halal — et des prix membres. On ne travaille qu\'avec eux.'}
        </p>

        {/* 🧞 Le trouveur de pépites */}
        <PepiteFinder />

        {/* 💰 Relevés de prix RÉELS — datés, jamais inventés */}
        {releves.length > 0 && (
          <section style={{ marginTop: 26 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#fdfaf3', fontSize: 22, fontWeight: 800, margin: '0 0 4px' }}>
              💰 {en ? 'Real price checks' : 'Relevés de prix réels'}
            </h2>
            <p style={{ color: 'rgba(253,250,243,0.55)', fontSize: 13, margin: '0 0 12px' }}>
              {en ? 'Observed by the community on the date shown — prices change, always check today\'s price.' : 'Observés par la communauté à la date indiquée — les prix évoluent, vérifie toujours le prix du jour.'}
            </p>
            <div style={{ display: 'grid', gap: 10 }}>
              {releves.map((r) => (
                <div key={r.hotel} style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(201,168,76,0.35)', borderRadius: 16, padding: '14px 16px' }}>
                  <p style={{ margin: 0, color: '#fdfaf3', fontWeight: 800, fontSize: 16 }}>{r.hotel} <span style={{ color: 'rgba(253,250,243,0.5)', fontWeight: 600, fontSize: 13 }}>· {r.villeNom}</span></p>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '10px 0' }}>
                    <span style={{ background: 'rgba(255,255,255,0.07)', borderRadius: 10, padding: '8px 12px', color: 'rgba(253,250,243,0.6)', fontSize: 13.5 }}>
                      Booking <s>{r.booking} {r.devise}</s>
                    </span>
                    <span style={{ background: 'rgba(59,209,122,0.15)', border: '1px solid rgba(59,209,122,0.4)', borderRadius: 10, padding: '8px 12px', color: '#3BD17A', fontWeight: 800, fontSize: 13.5 }}>
                      HalalBooking {r.halalbooking} {r.devise} (−{Math.round((1 - r.halalbooking / r.booking) * 100)} %)
                    </span>
                    {r.membre != null && (
                      <span style={{ background: 'rgba(201,168,76,0.16)', border: '1px solid rgba(201,168,76,0.5)', borderRadius: 10, padding: '8px 12px', color: 'var(--or)', fontWeight: 800, fontSize: 13.5 }}>
                        {en ? 'Member' : 'Membre'} {r.membre} {r.devise}
                      </span>
                    )}
                  </div>
                  <p style={{ margin: '0 0 10px', color: 'rgba(253,250,243,0.4)', fontSize: 12 }}>
                    📅 {en ? 'observed on' : 'relevé le'} {r.date} · {r.source}
                  </p>
                  <a href={hotelBookingUrl(r.villeNom).url} target="_blank" rel="noopener noreferrer sponsored"
                    style={{ display: 'inline-flex', alignItems: 'center', minHeight: 46, padding: '0 18px', borderRadius: 999, background: 'var(--or)', color: '#0b1a0f', fontWeight: 800, fontSize: 14, textDecoration: 'none' }}>
                    {en ? 'Check today\'s price →' : 'Vérifie le prix du jour →'}
                  </a>
                </div>
              ))}
            </div>
            <ReleveForm />
          </section>
        )}

        {/* ✅ Équipements femmes/famille vérifiés (listes officielles HalalBooking) */}
        {verifies.length > 0 && (
          <section style={{ marginTop: 26 }}>
            <h2 style={{ fontFamily: "'Playfair Display', serif", color: '#fdfaf3', fontSize: 22, fontWeight: 800, margin: '0 0 4px' }}>
              ✅ {en ? 'Verified women & family facilities' : 'Espaces femmes & famille vérifiés'}
            </h2>
            <p style={{ color: 'rgba(253,250,243,0.55)', fontSize: 13, margin: '0 0 12px' }}>
              {en ? 'Source: official HalalBooking filter lists — not our guesses.' : 'Source : listes-filtres officielles HalalBooking — pas nos suppositions.'}
            </p>
            <div style={{ display: 'grid', gap: 8 }}>
              {verifies.map((h) => (
                <a key={`${h.villeSlug}-${h.nom}`} href={h.halalBookingUrl ?? hotelBookingUrl(h.villeNom).url} target="_blank" rel="noopener noreferrer sponsored"
                  style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.12)', borderRadius: 14, padding: '12px 14px', textDecoration: 'none' }}>
                  <span style={{ flex: 1, minWidth: 140, color: '#fdfaf3', fontWeight: 700, fontSize: 14.5 }}>
                    {h.nom} <span style={{ color: 'rgba(253,250,243,0.5)', fontWeight: 600, fontSize: 12.5 }}>· {h.villeNom}</span>
                  </span>
                  {h.piscineNonMixte && <span title={en ? 'Women-only pool' : 'Piscine femmes'} style={{ fontSize: 15 }}>🏊</span>}
                  {h.plagePrivee && <span title={en ? 'Private beach' : 'Plage privée'} style={{ fontSize: 15 }}>🏖️</span>}
                  <span style={{ color: 'var(--or)', fontWeight: 800, fontSize: 13 }}>→</span>
                </a>
              ))}
            </div>
          </section>
        )}

        <p style={{ marginTop: 22, color: 'rgba(253,250,243,0.4)', fontSize: 12.5, lineHeight: 1.6 }}>
          {en
            ? 'Some links are affiliate links (no extra cost to you) — they fund the free community project. We never certify a hotel\'s halal status: verify on site.'
            : 'Certains liens sont affiliés (aucun surcoût pour toi) — ils financent le projet communautaire gratuit. Nous ne certifions jamais le statut halal d\'un hôtel : vérifie sur place.'}
        </p>
        <p style={{ marginTop: 8, fontSize: 14 }}>
          <Link href="/spots" style={{ color: 'var(--or)', fontWeight: 800, textDecoration: 'none' }}>
            💎 {en ? 'Hotel gems shared by travelers →' : 'Les pépites hôtel partagées par les voyageurs →'}
          </Link>
        </p>
      </div>
    </main>
  )
}
