import type { Metadata } from 'next'
import IslamicPattern from '@/components/ui/IslamicPattern'
import { getDomainSEO } from '@/lib/domain'
import { buildOrganizationSchema } from '@/lib/seo'

export async function generateMetadata(): Promise<Metadata> {
  const { isEN, brand, siteUrl } = await getDomainSEO()
  const url = `${siteUrl}${isEN ? '/about' : '/a-propos'}`
  return {
    title: isEN ? `About ${brand} & our Halal Trust Score™` : `À propos de ${brand} & notre Halal Trust Score™`,
    description: isEN
      ? `Who we are, our mission, and the exact method behind the Halal Trust Score™ — how we rate ${'354+'} destinations for Muslim travelers.`
      : `Qui nous sommes, notre mission, et la méthode exacte derrière le Halal Trust Score™ — comment nous évaluons 354+ destinations pour les voyageurs musulmans.`,
    alternates: {
      canonical: url,
      languages: {
        fr: 'https://www.voyageshalal.fr/a-propos',
        en: 'https://www.gohalaltravel.com/about',
        'x-default': 'https://www.gohalaltravel.com/about',
      },
    },
    robots: { index: true, follow: true },
  }
}

// Critères du Halal Trust Score™ (pondération = source de confiance affichée)
const CRITERIA = [
  { fr: 'Densité de restaurants halal', en: 'Halal restaurant density', weight: 30 },
  { fr: 'Accès aux mosquées & lieux de prière', en: 'Access to mosques & prayer spaces', weight: 25 },
  { fr: 'Facilité de trouver de la nourriture halal', en: 'Ease of finding halal food', weight: 20 },
  { fr: 'Accueil des familles musulmanes', en: 'Muslim-family friendliness', weight: 15 },
  { fr: 'Infrastructure & sécurité pour le voyageur', en: 'Traveler infrastructure & safety', weight: 10 },
]

export default async function AProposPage() {
  const { isEN, brand, siteUrl } = await getDomainSEO()
  const en = isEN
  const org = buildOrganizationSchema({ en, siteUrl, name: brand })

  return (
    <main style={{ minHeight: '100vh', background: 'var(--creme)' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(org) }} />

      <section className="relative overflow-hidden text-center" style={{ background: 'var(--nuit)', padding: '4rem 1.5rem 3rem' }}>
        <IslamicPattern opacity={0.06} />
        <div className="relative z-10">
          <p style={{ color: 'var(--or)', fontSize: 11, fontWeight: 600, letterSpacing: 3, textTransform: 'uppercase', marginBottom: '1rem' }}>✦ {en ? 'About' : 'À propos'}</p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 'clamp(2rem, 5vw, 3rem)', fontWeight: 900, color: 'white', lineHeight: 1.1 }}>
            {en ? <>Travel <em style={{ color: 'var(--or)' }}>halal</em>, with confidence</> : <>Voyager <em style={{ color: 'var(--or)' }}>halal</em>, en confiance</>}
          </h1>
          <p style={{ color: 'var(--or-clair)', opacity: 0.85, marginTop: '0.75rem', maxWidth: 620, marginInline: 'auto' }}>
            {en
              ? `${brand} helps Muslim travelers find halal restaurants, mosques, prayer times and the Qibla in 354+ destinations worldwide.`
              : `${brand} aide les voyageurs musulmans à trouver restaurants halal, mosquées, horaires de prière et Qibla dans 354+ destinations à travers le monde.`}
          </p>
        </div>
      </section>

      <article style={{ maxWidth: 780, margin: '0 auto', padding: '2.5rem 1.5rem 5rem' }} className="legal-prose">
        <h2>{en ? 'Our mission' : 'Notre mission'}</h2>
        <p>
          {en
            ? "We believe faith should never make travel harder. Our goal is simple: give every Muslim traveler the practical information they need — where to eat halal, where to pray, and what to expect — clearly and honestly, for any city in the world."
            : "Nous pensons que la foi ne devrait jamais compliquer le voyage. Notre objectif est simple : donner à chaque voyageur musulman l'information pratique dont il a besoin — où manger halal, où prier, à quoi s'attendre — clairement et honnêtement, pour n'importe quelle ville du monde."}
        </p>

        <h2 id="halal-trust-score">{en ? 'The Halal Trust Score™ — our method' : 'Le Halal Trust Score™ — notre méthode'}</h2>
        <p>
          {en
            ? "Every destination gets a Halal Trust Score from 0 to 5 (shown as /10 on some pages). It is a single value per city, computed from five weighted criteria — never hand-picked to look good:"
            : "Chaque destination reçoit un Halal Trust Score de 0 à 5 (affiché en /10 sur certaines pages). C'est une valeur unique par ville, calculée à partir de cinq critères pondérés — jamais choisie arbitrairement pour faire joli :"}
        </p>
        <div className="legal-box">
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {CRITERIA.map((c) => (
              <li key={c.en} style={{ display: 'flex', justifyContent: 'space-between', gap: 12, padding: '8px 0', borderBottom: '1px solid rgba(27,67,50,0.08)' }}>
                <span>{en ? c.en : c.fr}</span>
                <strong style={{ color: 'var(--foret)' }}>{c.weight}%</strong>
              </li>
            ))}
          </ul>
        </div>
        <p>
          {en
            ? "Important honesty note: a high score does not mean a city is Muslim-majority or alcohol-free. For non-Muslim destinations we label listings « halal options available » rather than « halal verified », and we never claim a city is « alcohol-free » when it isn't. Data comes from our own research combined with OpenStreetMap contributors, and each point of interest carries its source."
            : "Note d'honnêteté importante : un score élevé ne signifie pas qu'une ville est à majorité musulmane ou sans alcool. Pour les destinations non-musulmanes, nous indiquons « options halal disponibles » plutôt que « halal vérifié », et nous n'affirmons jamais qu'une ville est « sans alcool » quand ce n'est pas le cas. Les données proviennent de nos recherches combinées aux contributeurs OpenStreetMap, et chaque point d'intérêt porte sa source."}
        </p>

        <h2>{en ? 'How we build our data' : 'Comment nous construisons nos données'}</h2>
        <p>
          {en
            ? "We combine editorial research on flagship destinations with live, open data (OpenStreetMap / Overpass) for restaurants, mosques, butchers and hotels. Duplicate and auto-generated entries are removed, and coordinates are verified so the map around you is real — we do not fabricate restaurant names or locations."
            : "Nous combinons une recherche éditoriale sur les destinations phares avec des données ouvertes en temps réel (OpenStreetMap / Overpass) pour les restaurants, mosquées, boucheries et hôtels. Les doublons et entrées auto-générées sont supprimés, et les coordonnées vérifiées pour que la carte autour de vous soit réelle — nous n'inventons jamais de noms ni d'emplacements de restaurants."}
        </p>

        <h2>{en ? 'Contact' : 'Contact'}</h2>
        <p>
          {en ? 'A question, a correction, a place to report? Write to us: ' : 'Une question, une correction, un lieu à signaler ? Écrivez-nous : '}
          <a href="mailto:contact@voyageshalal.fr">contact@voyageshalal.fr</a>
        </p>
      </article>

      <style>{`
        .legal-prose { color: #28332b; font-size: 16px; line-height: 1.75; }
        .legal-prose h2 { font-family: 'Playfair Display', serif; font-size: 22px; font-weight: 800; color: var(--nuit); margin: 2rem 0 0.6rem; }
        .legal-prose p { margin: 0 0 1rem; }
        .legal-prose a { color: var(--foret); font-weight: 700; }
        .legal-box { background: #fff; border: 1px solid rgba(27,67,50,0.12); border-radius: 16px; padding: 1rem 1.25rem; margin: 1.25rem 0; }
      `}</style>
    </main>
  )
}
