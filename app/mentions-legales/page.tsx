import type { Metadata } from 'next'
import Link from 'next/link'
import { getDomainSEO } from '@/lib/domain'
import { localizedHref } from '@/lib/slugs'

// Mentions légales (FR) / Legal notice (EN — servie via la réécriture
// middleware /legal-notice → cette route). Le lien footer pointait vers
// une page inexistante (404 relevé par l'audit liens).

export async function generateMetadata(): Promise<Metadata> {
  const { isEN, siteUrl } = await getDomainSEO()
  return {
    title: isEN ? 'Legal notice' : 'Mentions légales',
    description: isEN
      ? 'Legal information about GoHalalTravel.com: publisher, hosting, intellectual property and contact.'
      : 'Informations légales de VoyagesHalal.fr : éditeur, hébergement, propriété intellectuelle et contact.',
    alternates: {
      canonical: `${siteUrl}${localizedHref('/mentions-legales', isEN)}`,
      languages: {
        fr: 'https://www.voyageshalal.fr/mentions-legales',
        en: 'https://www.gohalaltravel.com/legal-notice',
      },
    },
    robots: { index: false, follow: true },
  }
}

export default async function MentionsLegalesPage() {
  const { isEN: en, brand } = await getDomainSEO()
  const h2 = { fontFamily: 'var(--font-playfair), Georgia, serif', color: '#1b4332', fontSize: 20, fontWeight: 800, margin: '28px 0 8px' } as const
  const p = { fontSize: 14.5, color: '#374151', lineHeight: 1.75, margin: '0 0 10px' } as const
  return (
    <main style={{ background: 'var(--creme)', minHeight: '100vh' }}>
      <div style={{ maxWidth: 720, margin: '0 auto', padding: '48px 20px 80px' }}>
        <h1 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', color: '#0b1a0f', fontSize: 32, fontWeight: 900, marginBottom: 8 }}>
          {en ? 'Legal notice' : 'Mentions légales'}
        </h1>

        <h2 style={h2}>{en ? 'Site publisher' : 'Éditeur du site'}</h2>
        <p style={p}>
          {en
            ? <>{brand} — an independent halal travel guide. Contact: <a href="mailto:contact@voyageshalal.fr" style={{ color: '#1b4332', fontWeight: 700 }}>contact@voyageshalal.fr</a></>
            : <>{brand} — guide indépendant du voyage halal. Contact : <a href="mailto:contact@voyageshalal.fr" style={{ color: '#1b4332', fontWeight: 700 }}>contact@voyageshalal.fr</a></>}
        </p>

        <h2 style={h2}>{en ? 'Hosting' : 'Hébergement'}</h2>
        <p style={p}>Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA — vercel.com</p>

        <h2 style={h2}>{en ? 'Intellectual property' : 'Propriété intellectuelle'}</h2>
        <p style={p}>
          {en
            ? 'Editorial content (guides, articles, city write-ups) is the property of the publisher. Place data is aggregated from verifiable sources — OpenStreetMap (© OpenStreetMap contributors, ODbL license) and Google Maps — and each listing displays its source. Photos of places are served by their respective sources with attribution.'
            : 'Les contenus éditoriaux (guides, articles, textes de villes) sont la propriété de l’éditeur. Les données de lieux sont agrégées depuis des sources vérifiables — OpenStreetMap (© les contributeurs OpenStreetMap, licence ODbL) et Google Maps — et chaque adresse affiche sa source. Les photos de lieux sont servies par leurs sources respectives avec attribution.'}
        </p>

        <h2 style={h2}>{en ? 'Liability' : 'Responsabilité'}</h2>
        <p style={p}>
          {en
            ? 'We aggregate real-world data but never certify the halal status of any establishment — statuses are reported by sources and must be verified on site. Information may change; always double-check before traveling.'
            : 'Nous agrégeons des données réelles mais ne certifions jamais le statut halal d’un établissement — les statuts sont signalés par les sources et à vérifier sur place. Les informations peuvent évoluer ; vérifiez toujours avant de voyager.'}
        </p>

        <h2 style={h2}>{en ? 'Affiliate links' : 'Liens d’affiliation'}</h2>
        <p style={p}>
          {en
            ? 'Some outbound links (hotels, flights) are affiliate links: they may earn us a commission at no extra cost to you. They are marked rel="sponsored".'
            : 'Certains liens sortants (hôtels, vols) sont des liens d’affiliation : ils peuvent nous rapporter une commission sans surcoût pour vous. Ils sont marqués rel="sponsored".'}
        </p>

        <h2 style={h2}>{en ? 'Personal data' : 'Données personnelles'}</h2>
        <p style={p}>
          {en
            ? <>See our <Link href={localizedHref('/confidentialite', true)} style={{ color: '#1b4332', fontWeight: 700 }}>privacy policy</Link>. You can unsubscribe from our emails in one click at any time.</>
            : <>Voir notre <Link href="/confidentialite" style={{ color: '#1b4332', fontWeight: 700 }}>politique de confidentialité</Link>. Vous pouvez vous désinscrire de nos emails en un clic à tout moment.</>}
        </p>
      </div>
    </main>
  )
}
