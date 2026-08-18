import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import type { Metadata } from 'next'
import JsonLd from '@/components/seo/JsonLd'
import EmailCapture from '@/components/ui/EmailCapture'
import { buildWebSiteSchema, buildOrganizationSchema } from '@/lib/seo'
import { guides } from '@/lib/data'
import HeroDepart from '@/components/accueil/HeroDepart'
import BlocSeo from '@/components/accueil/BlocSeo'
import { FAQ_ACCUEIL } from '@/lib/faqAccueil'
import { positionServeur } from '@/lib/positionServeur'
import { localizedHref } from '@/lib/slugs'
import { HomeScoreRanking } from '@/components/HomeScoreRanking'
import { photoLargeur } from '@/lib/imageLargeur'
import { getDomainSEO, FR_URL, EN_URL } from '@/lib/domain'
import { getVillesCounts } from '@/lib/villeStats'

// Métadonnées par domaine : anglais sur gohalaltravel.com, français sur voyageshalal.fr
export async function generateMetadata(): Promise<Metadata> {
  const { isEN, siteUrl } = await getDomainSEO()
  // 81 et 84 caracteres : Google coupait les deux titres, et la marque en
  // tete mangeait la place des mots que les gens tapent vraiment. On ouvre
  // desormais sur le besoin (« halal travel guide », « voyage halal ») et
  // on annonce un chiffre verifiable.
  const title = isEN
    ? 'Halal Travel Guide 2026: 354 Cities, Mosques & Food'
    : 'Guide Voyage Halal 2026 : 354 Villes, Mosquées, Restos'
  const description = isEN
    ? 'Prayer times and qibla wherever you are, the nearest mosque, halal addresses in 354 cities. Every listing carries its source. Free, no account needed.'
    : 'Horaires de prière et qibla où que vous soyez, la mosquée la plus proche, des adresses halal dans 354 villes. Chaque adresse porte sa source. Gratuit.'
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

// ⚡ Même cache que /destinations : compter les villes et les continents
// obligeait à parser 27 Mo de JSON à chaque affichage de la page d'accueil.
let cacheStats: { totalVilles: number; totalContinents: number } | null = null

function getVillesStats() {
  if (cacheStats) return cacheStats
  cacheStats = lireVillesStats()
  return cacheStats
}

function lireVillesStats() {
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
  // La position approximative de l'adresse IP, connue AVANT le premier octet
  // de HTML : le tableau de bord s'affiche rempli, sans attendre le
  // navigateur et sans faire sauter la page quand la vraie position arrive.
  const ip = await positionServeur()
  const posIP = ip ? { lat: ip.lat, lng: ip.lng, ville: ip.ville } : null
  const websiteSchema = buildWebSiteSchema({ en: isEN, siteUrl, name: isEN ? brand : undefined })
  const orgSchema = buildOrganizationSchema({ en: isEN, siteUrl, name: isEN ? brand : undefined })
  // 📚 GUIDES VEDETTES — DANS LA LANGUE DU DOMAINE.
  // Défaut mesuré le 11 août : `guides.slice(0, 3)` prenait les trois
  // premiers guides du fichier, tous français. L'accueil anglais affichait
  // donc « Voyage halal pour débutants : le guide complet » et « Pratique »
  // sous des libellés anglais, et pointait vers /guides/voyage-halal-debutant
  // — une URL qui fait une 301 vers le slug anglais. Trois titres français
  // sur la page la plus importante du domaine anglais.
  const guidesDuDomaine = guides.filter((g) => (g.lang ?? 'fr') === (isEN ? 'en' : 'fr'))
  const featuredGuides = (guidesDuDomaine.length >= 3 ? guidesDuDomaine : guides).slice(0, 3)
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
      // Ne promettre que ce que l'email contient réellement : une sélection
      // de ressources, pas un livret de vingt pages.
      ? 'Our best halal travel resources, hand-picked — straight to your inbox.'
      : 'Nos meilleures ressources voyage halal, sélectionnées — directement dans votre boîte mail.',
  }

  // ❓ Le schéma FAQ est construit depuis la MÊME source que la FAQ visible
  // (lib/faqAccueil.ts) : « mot pour mot », comme l'exige le brief — et
  // comme l'exige Google, qui pénalise un balisage qui ne correspond pas.
  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${siteUrl}/#faq`,
    mainEntity: FAQ_ACCUEIL.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.r },
    })),
  }

  return (
    <>
    <JsonLd data={websiteSchema} />
    <JsonLd data={orgSchema} />
    <JsonLd data={faqSchema} />

    {/* ⛩️ L'ACCUEIL v6 — maquette du 16 août.
        Au premier écran : l'ornement, le nom, la ligne du guide, un bouton
        plein « Autour de moi », un bouton contour « Choisir une ville », et
        la barre Horaires / Qibla DANS LE FLUX. Rien d'autre.
        En dessous, au défilement : le contenu que Google lit — présentation,
        destinations réelles avec leur HalalScore, ce qu'on trouve ici, la
        FAQ, le pied de page. */}
    <main className="v6">
      <HeroDepart />
      <BlocSeo />

      <footer className="v6-pied">
        <nav aria-label="Liens du site">
          <Link href="/destinations">Destinations</Link>
          <Link href={localizedHref('/mosquee-proche', isEN)}>Mosquées</Link>
          <Link href="/hotels">Hébergements</Link>
          <Link href={localizedHref('/horaires-priere', isEN)}>Horaires de prière</Link>
          <Link href="/qibla">Qibla</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/a-propos">À propos</Link>
          <Link href="/contact">Contact</Link>
        </nav>
        <div className="v6-bismillah">بِسْمِ اللَّهِ</div>
        {/* Mentions légales et confidentialité étaient deux liens de 16 px
            de haut noyés dans une phrase : impossibles à viser au pouce.
            Ils rejoignent la navigation, où ils font 56 px comme le reste. */}
        <nav aria-label="Informations légales" className="v6-pied-legal">
          <Link href="/mentions-legales">Mentions légales</Link>
          <Link href="/confidentialite">Confidentialité</Link>
        </nav>
        <small>© {new Date().getFullYear()} VoyagesHalal — Guide du voyage halal dans le monde.</small>
      </footer>
    </main>
    </>
  )
}
