import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import Image from 'next/image'
import type { Metadata } from 'next'
import JsonLd from '@/components/seo/JsonLd'
import EmailCapture from '@/components/ui/EmailCapture'
import { buildWebSiteSchema, buildOrganizationSchema } from '@/lib/seo'
import { guides } from '@/lib/data'
import NearbySpotsHome from '@/components/community/NearbySpotsHome'
import RecentSpotsHome from '@/components/spots/RecentSpotsHome'
import BoardVoyageur from '@/components/home/BoardVoyageur'
import { HomeScoreRanking } from '@/components/HomeScoreRanking'
import IslamicPattern from '@/components/ui/IslamicPattern'
import SearchBarHome from '@/components/search/SearchBarHome'
import { getDomainSEO, FR_URL, EN_URL } from '@/lib/domain'
import { getVillesCounts } from '@/lib/villeStats'

// Métadonnées par domaine : anglais sur gohalaltravel.com, français sur voyageshalal.fr
export async function generateMetadata(): Promise<Metadata> {
  const { isEN, siteUrl } = await getDomainSEO()
  const title = isEN
    ? 'GoHalalTravel — #1 Halal Travel Guide | Restaurants, Mosques & Destinations'
    : 'VoyagesHalal.fr — Guide Voyage Halal #1 | Restaurants, Mosquées & Destinations'
  const description = isEN
    ? 'Halal restaurants, mosques, prayer times and practical guides in 354+ destinations worldwide — for Muslim travelers.'
    : 'Restaurants halal signalés, mosquées, hébergements et guides pratiques dans 354+ destinations — pour les musulmans du monde entier.'
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: siteUrl,
      languages: { fr: FR_URL, en: EN_URL, 'x-default': EN_URL },
    },
    openGraph: { title, description, url: siteUrl },
  }
}

const DESTINATIONS = [
  { slug: 'istanbul', city: 'Istanbul', country: 'Turquie', countryEn: 'Turkey', image: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=600&q=80', badge: 'INCONTOURNABLE', badgeEn: 'MUST-SEE' },
  { slug: 'marrakech', city: 'Marrakech', cityEn: 'Marrakesh', country: 'Maroc', countryEn: 'Morocco', image: 'https://images.unsplash.com/photo-1675782357250-8329a7677819?w=600&q=80', badge: 'POPULAIRE', badgeEn: 'POPULAR' },
  { slug: 'dubai', city: 'Dubaï', cityEn: 'Dubai', country: 'Émirats', countryEn: 'UAE', image: 'https://images.unsplash.com/photo-1512453979798-5ea266f8880c?w=600&q=80', badge: 'LUXE', badgeEn: 'LUXURY' },
  { slug: 'kuala-lumpur', city: 'Kuala Lumpur', country: 'Malaisie', countryEn: 'Malaysia', image: 'https://images.unsplash.com/photo-1596422846543-75c6fc197f07?w=600&q=80', badge: 'TENDANCE', badgeEn: 'TRENDING' },
  { slug: 'le-caire', city: 'Le Caire', cityEn: 'Cairo', country: 'Égypte', countryEn: 'Egypt', image: 'https://images.unsplash.com/photo-1553913861-c0fddf2619ee?w=600&q=80', badge: 'CULTURELLE', badgeEn: 'CULTURAL' },
  { slug: 'medine', city: 'Médine', cityEn: 'Medina', country: 'Arabie Saoudite', countryEn: 'Saudi Arabia', image: 'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?w=600&q=80', badge: 'SPIRITUELLE', badgeEn: 'SPIRITUAL' },
]

const FEATURES = [
  { icon: '🍽', title: 'Restaurants halal', titleEn: 'Halal restaurants', desc: 'Options halal et adresses signalées — chaque adresse porte sa source.', descEn: 'Halal options and reported spots — every listing carries its source.' },
  { icon: '🕌', title: 'Mosquées proches', titleEn: 'Nearby mosques', desc: 'Localisez la mosquée la plus proche, avec horaires de prière.', descEn: 'Find the nearest mosque, with prayer times.' },
  { icon: '🧭', title: 'Guides pratiques', titleEn: 'Practical guides', desc: 'Conseils culturels, visa, transports — tout pour voyager l\'esprit libre.', descEn: 'Cultural tips, visas, transport — everything for worry-free travel.' },
]

function getVillesStats() {
  try {
    const dir = path.join(process.cwd(), 'data', 'villes')
    const files = fs.readdirSync(dir).filter((f) => f.endsWith('.json'))
    const continents = new Set<string>()
    for (const f of files) {
      try {
        const v = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'))
        if (v.continent) continents.add(v.continent)
      } catch {
        // skip
      }
    }
    return { totalVilles: files.length, totalContinents: continents.size }
  } catch {
    return { totalVilles: 0, totalContinents: 0 }
  }
}

export default async function HomePage() {
  const { isEN, brand, siteUrl } = await getDomainSEO()
  const websiteSchema = buildWebSiteSchema({ en: isEN, siteUrl, name: isEN ? brand : undefined })
  const orgSchema = buildOrganizationSchema({ en: isEN, siteUrl, name: isEN ? brand : undefined })
  const featuredGuides = guides.slice(0, 3)
  const { totalVilles } = getVillesStats()
  // Guides vedettes : chiffres RÉELS lus dans les fiches villes, pour que le
  // premier écran donne (la richesse du site) avant de demander (contribuer).
  const vedettes = getVillesCounts(['istanbul', 'dubai', 'marrakech', 'kuala-lumpur', 'medine', 'le-caire'], isEN)

  // Toutes les chaînes de l'accueil, bilingues selon le domaine (P0-1)
  const t = {
    // Le premier écran promet ce qu'il DONNE (trouver), pas ce qu'il demande
    heroEyebrow: isEN ? `Travel with faith · ${totalVilles} destinations` : `Voyagez avec foi · ${totalVilles} destinations`,
    heroTitlePre: isEN ? 'Where to pray, where to ' : 'Où prier, où ',
    heroTitleGold: isEN ? 'eat halal' : 'manger halal',
    heroTitlePost: isEN ? ' — anywhere you travel.' : ' — partout où tu voyages.',
    heroSub: isEN
      ? 'Mosques, halal restaurants and practical guides, ready for every destination — plus real spots lived and confirmed by Muslim travelers.'
      : 'Mosquées, restaurants halal et guides pratiques, déjà prêts pour chaque destination — plus de vrais spots vécus et confirmés par des voyageurs musulmans.',
    heroAdd: isEN ? '➕ Add a spot' : '➕ Ajouter un spot',
    heroDiscover: isEN ? '💎 Discover spots' : '💎 Découvrir les spots',
    heroMine: isEN ? '❤️ My spots' : '❤️ Mes spots',
    heroCommunity: isEN ? '🤝 Join the community' : '🤝 Rejoins la communauté',
    qaDestinations: isEN ? 'Destinations' : 'Destinations',
    qaPrayer: isEN ? 'Prayer' : 'Horaires',
    qaBlog: 'Blog',
    explore: isEN ? 'Explore' : 'Explorez',
    popularTitle: isEN ? 'Popular halal destinations' : 'Destinations halal populaires',
    seeAll: isEN ? 'See all →' : 'Voir tout →',
    fullGuide: isEN ? 'Full guide →' : 'Guide complet →',
    promise: isEN ? 'Our promise' : 'Notre promesse',
    promiseTitle: isEN ? 'Halal travel, made simple' : 'Voyager Halal, simplifié',
    appEyebrow: isEN ? 'Coming soon' : 'Bientôt disponible',
    appTitle: isEN ? `${brand} in your pocket` : 'Voyages Halal dans votre poche',
    appSub: isEN
      ? 'Geolocation, Qibla compass, prayer times, nearby restaurants — everything you need, even offline.'
      : 'Géolocalisation, boussole Qibla, horaires de prière, restaurants proches — tout ce dont vous avez besoin, même sans connexion.',
    learnMore: isEN ? 'Learn more' : 'En savoir plus',
    ourGuides: isEN ? 'Our guides' : 'Nos guides',
    guidesTitle: isEN ? 'Everything for stress-free halal travel' : 'Tout pour voyager halal sereinement',
    seeAllGuides: isEN ? 'See all guides →' : 'Voir tous les guides →',
    readTime: isEN ? 'read' : 'de lecture',
    readGuide: isEN ? 'Read the guide →' : 'Lire le guide →',
    emailTitle: isEN ? 'Get our free halal travel guide' : 'Recevez notre guide voyage halal gratuit',
    emailSub: isEN
      ? '20+ pages of tips, the best destinations and must-visit addresses — straight to your inbox.'
      : '20+ pages de conseils, les meilleures destinations et adresses incontournables — directement dans votre boîte mail.',
  }

  return (
    <>
    <JsonLd data={websiteSchema} />
    <JsonLd data={orgSchema} />
    {/* Design unifié : même accueil sur mobile et desktop */}
    <main style={{ backgroundColor: '#fdfaf3' }}>
      {/* 🎛️ Board voyageur (bento) : rendu client au-dessus du hero quand la
          position est connue — absorbe le Radar Prière. Le HTML serveur
          en dessous ne change pas : SEO intact. */}
      <BoardVoyageur vedettes={vedettes.map((v) => ({ slug: v.slug, nom: v.nom, score: v.score, restaurants: v.restaurants, mosquees: v.mosquees, image: v.image }))} />
      {/* Hero plein écran minimaliste */}
      <section
        className="relative overflow-hidden flex items-center justify-center text-center px-6"
        // 100dvh (et non 100vh) : les barres du navigateur mobile ne coupent rien ;
        // on soustrait bandeau + header (~100px) pour que le widget prière suivant
        // commence proprement sous la ligne de flottaison, jamais coupé à moitié.
        style={{ minHeight: 'calc(100dvh - 100px)', padding: '24px 24px 18px', backgroundColor: '#0b1a0f' }}
      >
        {/* Image d'architecture islamique (sans personne) + voile sombre */}
        <Image
          src="https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1920&q=80"
          alt={isEN ? 'Blue Mosque of Istanbul at sunset' : 'Mosquée Bleue d\'Istanbul au coucher du soleil'}
          fill
          priority
          sizes="100vw"
          style={{ objectFit: 'cover', opacity: 0.42 }}
        />
        <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(11,26,15,0.7) 0%, rgba(11,26,15,0.85) 100%)' }} />
        <IslamicPattern opacity={0.06} />

        <div className="relative z-10 max-w-3xl mx-auto w-full">
          <p style={{ color: '#c9a84c' }} className="text-xs font-semibold uppercase tracking-[0.35em] mb-2">
            {t.heroEyebrow}
          </p>
          <h1
            className="text-2xl sm:text-3xl lg:text-4xl text-white leading-[1.08] mb-2"
            style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 900 }}
          >
            {t.heroTitlePre}<span className="gold-em">{t.heroTitleGold}</span>{t.heroTitlePost}
          </h1>
          <p className="text-white/70 text-sm sm:text-base leading-relaxed mb-4 max-w-xl mx-auto">
            {t.heroSub}
          </p>

          {/* DONNER AVANT DE DEMANDER : la recherche puis les guides déjà
              remplis (chiffres réels lus dans les fiches villes). Contribuer
              vient après avoir reçu — « Ajouter » passe en second rang. */}
          <div style={{ maxWidth: 560, margin: '0 auto', width: '100%' }}>
            <div style={{ background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(201,168,76,0.45)', borderRadius: 16, padding: 4 }}>
              <SearchBarHome />
            </div>

            {/* Guides prêts à l'emploi — la richesse du site, visible tout de suite */}
            <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '12px 2px 4px', scrollSnapType: 'x mandatory' }}>
              {vedettes.map((v) => (
                <Link
                  key={v.slug}
                  href={`/destinations/${v.slug}`}
                  style={{
                    flex: 'none', width: 168, minHeight: 116, scrollSnapAlign: 'start',
                    borderRadius: 16, overflow: 'hidden', textDecoration: 'none',
                    border: '1px solid rgba(201,168,76,0.35)',
                    display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
                    backgroundImage: v.image
                      ? `linear-gradient(180deg, rgba(11,26,15,0.15) 20%, rgba(11,26,15,0.92)), url(${v.image})`
                      : 'linear-gradient(160deg, #1d4a35, #0e2013)',
                    backgroundSize: 'cover', backgroundPosition: 'center',
                    textAlign: 'left',
                  }}
                >
                  <span style={{ padding: '8px 10px 9px' }}>
                    <span style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
                      <span style={{ color: '#fdfaf3', fontWeight: 800, fontSize: 15 }}>{v.nom}</span>
                      <span style={{ color: '#c9a84c', fontWeight: 800, fontSize: 13 }}>✦ {v.score}</span>
                    </span>
                    <span style={{ display: 'block', color: 'rgba(253,250,243,0.72)', fontSize: 11.5, lineHeight: 1.35, marginTop: 2 }}>
                      {v.restaurants > 0 && `${v.restaurants} ${isEN ? 'halal restos' : 'restos halal'}`}
                      {v.restaurants > 0 && v.mosquees > 0 && ' · '}
                      {v.mosquees > 0 && `${v.mosquees} ${isEN ? 'mosques' : 'mosquées'}`}
                    </span>
                  </span>
                </Link>
              ))}
              <Link
                href="/destinations"
                style={{ flex: 'none', width: 132, minHeight: 116, borderRadius: 16, border: '1.5px dashed rgba(201,168,76,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', textAlign: 'center', color: 'var(--or)', fontWeight: 800, fontSize: 13, textDecoration: 'none', padding: '0 10px' }}
              >
                {isEN ? `All ${totalVilles} destinations →` : `Les ${totalVilles} destinations →`}
              </Link>
            </div>

            {/* Second rang : explorer les spots, puis contribuer */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 6 }}>
              <Link href="/spots" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 56, borderRadius: 14, border: '2px solid rgba(201,168,76,0.55)', background: 'rgba(255,255,255,0.06)', color: 'var(--creme)', fontWeight: 800, fontSize: 14.5, textDecoration: 'none' }}>
                {t.heroDiscover}
              </Link>
              <Link href="/communaute/ajouter" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 56, borderRadius: 14, border: '2px solid rgba(201,168,76,0.55)', background: 'rgba(255,255,255,0.06)', color: 'var(--creme)', fontWeight: 800, fontSize: 14.5, textDecoration: 'none' }}>
                {t.heroAdd}
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* 💎 Le cœur : derniers spots partagés + spots près de toi
          (le Radar Prière vit désormais dans le Board voyageur ci-dessus) */}
      <RecentSpotsHome />
      <NearbySpotsHome />



      {/* Halal Trust Score™ ranking */}
      <HomeScoreRanking en={isEN} />

      {/* Installer l'app — une ligne, pas un écran (le site EST l'app) */}
      <section style={{ background: 'var(--nuit)' }} className="py-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-white font-bold text-lg mb-1">✦ {isEN ? 'Add VoyagesHalal to your home screen' : 'Ajoute VoyagesHalal à ton écran d\'accueil'}</p>
          <p className="text-white/60 text-sm mb-5">{isEN ? 'Full screen, offline, prayer notifications — like an app, no store needed.' : 'Plein écran, hors-ligne, notifications de prière — comme une app, sans store.'}</p>
          <Link href="/application" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 50, padding: '0 24px', borderRadius: 999, background: 'var(--or)', color: '#0b1a0f', fontWeight: 800, fontSize: 15, textDecoration: 'none' }}>
            {isEN ? 'How to install (30 sec) →' : 'Comment l\'installer (30 sec) →'}
          </Link>
        </div>
      </section>

      {/* Guides — maillage interne vers blog */}
      <section style={{ backgroundColor: '#faf8f4' }} className="py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-end justify-between mb-8">
            <div>
              <p style={{ color: '#c9a84c' }} className="text-xs font-semibold uppercase tracking-[0.2em] mb-2">{t.ourGuides}</p>
              <h2 className="text-2xl font-bold" style={{ fontFamily: 'var(--font-playfair), Georgia, serif', color: '#1b4332' }}>
                {t.guidesTitle}
              </h2>
            </div>
            <Link href="/guides" className="text-sm font-medium hover:underline" style={{ color: '#1b4332' }}>
              {t.seeAllGuides}
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {featuredGuides.map((guide) => (
              <Link
                key={guide.slug}
                href={`/guides/${guide.slug}`}
                className="group bg-white rounded-2xl p-5 border border-gray-100 hover:border-[#c9a84c]/40 hover:shadow-sm transition-all"
              >
                <span style={{ backgroundColor: '#f5f0e8', color: '#1b4332' }} className="text-[10px] font-bold uppercase tracking-widest px-2 py-1 rounded-full">
                  {guide.category}
                </span>
                <h3 className="font-bold text-gray-900 mt-3 mb-2 text-sm leading-snug group-hover:text-[#1b4332]">
                  {guide.title}
                </h3>
                <p className="text-xs text-gray-400">⏱ {guide.readTime} {t.readTime}</p>
                <p style={{ color: '#c9a84c' }} className="text-xs font-medium mt-3">{t.readGuide}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Email capture — lead magnet (« près de toi » est remonté sous le Radar) */}
      <EmailCapture
        title={t.emailTitle}
        subtitle={t.emailSub}
        source="homepage"
      />
    </main>
    </>
  )
}
