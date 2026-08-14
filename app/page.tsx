import fs from 'fs'
import path from 'path'
import Link from 'next/link'
import type { Metadata } from 'next'
import JsonLd from '@/components/seo/JsonLd'
import EmailCapture from '@/components/ui/EmailCapture'
import { buildWebSiteSchema, buildOrganizationSchema } from '@/lib/seo'
import { guides } from '@/lib/data'
import BoardVoyageur from '@/components/home/BoardVoyageur'
import PresDeMoi from '@/components/lieux/PresDeMoi'
import { positionServeur } from '@/lib/positionServeur'
import { localizedHref } from '@/lib/slugs'
import { HomeScoreRanking } from '@/components/HomeScoreRanking'
import SearchBarHome from '@/components/search/SearchBarHome'
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

  return (
    <>
    <JsonLd data={websiteSchema} />
    <JsonLd data={orgSchema} />
    {/* Design unifié : même accueil sur mobile et desktop */}
    <main style={{ backgroundColor: '#fdfaf3' }}>
      {/* 🎛️ UN SEUL PREMIER ÉCRAN — Mohamed, 15 août : « les 2 premières
          pages doivent fusionner, garde le meilleur des 2 ». Le hero
          n'existe plus comme section séparée : son meilleur — le titre et
          la recherche — est rendu ici par le serveur et glissé DANS le
          tableau de bord, sous la barre de position. Un écran, pas deux
          empilés. Le H1 et la recherche restent du HTML serveur : Google
          les voit toujours, position connue ou non. */}
      <BoardVoyageur
        vedettes={vedettes.map((v) => ({ slug: v.slug, nom: v.nom, score: v.score, restaurants: v.restaurants, mosquees: v.mosquees, image: v.image }))}
        posInitiale={posIP}
        recherche={
          <div style={{ textAlign: 'center' }}>
            {/* Le H1 garde son texte complet pour Google, mais à l'écran il
                redevient une ligne discrète : sur un écran épuré, c'est la
                RECHERCHE qui est la vedette de cette zone, pas la phrase. */}
            <h1
              className="text-white/85"
              style={{ fontFamily: "'Playfair Display', Georgia, serif", fontWeight: 800, fontSize: 16.5, lineHeight: 1.3, margin: '0 0 8px' }}
            >
              {t.heroTitlePre}<span className="gold-em">{t.heroTitleGold}</span>{t.heroTitlePost}
            </h1>
            <div style={{ background: 'rgba(255,255,255,0.1)', border: '1.5px solid rgba(201,168,76,0.45)', borderRadius: 16, padding: 4 }}>
              <SearchBarHome />
            </div>
          </div>
        }
      />

      {/* ⭐ LE CŒUR DU SITE — Mohamed, 15 août : « je veux que cette
          nouvelle fonction soit au cœur du site et au centre de la page
          d'accueil, on tient un truc ». « Près de moi » quitte la rangée
          du bas où il partageait la place avec les destinations : il
          prend toute la largeur, juste sous le tableau de bord. C'est la
          première chose qu'on voit après l'heure de la prière — et la
          ligne « Manger » du tableau de bord a été retirée, elle faisait
          doublon avec lui. Français d'abord ; l'anglais suit. */}
      {!isEN && <PresDeMoi posInitiale={posIP} />}

      {/* 🖥️ RANGÉE DU BAS — sur PC, Destinations et « manger halal près
          de moi » se mettent CÔTE À CÔTE : Mohamed, 15 août, « la ligne du
          bas est coupée, elle doit rentrer dans la page ». Empilés, les
          deux blocs dépassaient l'écran ; côte à côte, toute la hauteur
          d'une section est récupérée et tout tient. Sur mobile, la pile
          ne change pas. Sur le domaine anglais (pas encore de widget), la
          section Destinations reprend seule toute la largeur. */}
      <div className="rangee-bas" style={{ background: 'var(--nuit)' }}>


      {/* 🌍 DESTINATIONS — remontées JUSTE SOUS le tableau de bord.
          Mohamed, 15 août : « les destinations avec les images, c'est
          beau — j'aimerais que ce soit visible dès qu'on ouvre la page ».
          Ce sont les seules belles photos dont on dispose aujourd'hui :
          elles font la première impression. Les chiffres restent lus dans
          les fiches villes, jamais inventés. */}
      <section style={{ background: 'var(--nuit)' }} className="pt-3 pb-4 px-4">
        <div className="max-w-3xl mx-auto">
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', gap: 12, marginBottom: 10 }}>
            <h2 className="text-white text-xl font-bold" style={{ fontFamily: "'Playfair Display', Georgia, serif" }}>
              🌍 {t.popularTitle}
            </h2>
            <Link href="/destinations" style={{ color: 'var(--or)', fontWeight: 800, fontSize: 14, textDecoration: 'none', whiteSpace: 'nowrap' }}>
              {t.seeAll}
            </Link>
          </div>
          <div style={{ display: 'flex', gap: 10, overflowX: 'auto', padding: '2px 2px 6px', scrollSnapType: 'x mandatory', scrollbarWidth: 'none' }}>
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
                    // 168 px à l'écran : inutile de télécharger du 1600.
                    ? `linear-gradient(180deg, rgba(11,26,15,0.15) 20%, rgba(11,26,15,0.92)), url(${photoLargeur(v.image, 168)})`
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
        </div>
      </section>

      </div>

      {/* 🧹 15 août — LES DEUX SECTIONS SPOTS QUITTENT L'ACCUEIL.
          Mohamed : « spot et destination n'ont pas leur place ; tout le
          site doit tourner autour de sa destination + IA + Google Maps ».
          Elles ne sont PAS supprimées du site : l'onglet Spots de la barre
          du bas, la ligne Spots du tableau de bord et le menu Outils y
          mènent toujours — trois portes suffisent. L'accueil, lui, répond
          d'abord à « j'ai besoin de quelque chose, MAINTENANT », et les
          destinations gardent une seule rangée de photos, en vitrine. */}


      {/* Halal Trust Score™ ranking */}
      <HomeScoreRanking en={isEN} />

      {/* Installer l'app — une ligne, pas un écran (le site EST l'app) */}
      <section style={{ background: 'var(--nuit)' }} className="py-10 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-white font-bold text-lg mb-1">✦ {isEN ? 'Add VoyagesHalal to your home screen' : 'Ajoute VoyagesHalal à ton écran d\'accueil'}</p>
          <p className="text-white/60 text-sm mb-5">{isEN ? 'Full screen, offline, prayer notifications — like an app, no store needed.' : 'Plein écran, hors-ligne, notifications de prière — comme une app, sans store.'}</p>
          <Link href={localizedHref('/application', isEN)} style={{ display: 'inline-flex', alignItems: 'center', minHeight: 50, padding: '0 24px', borderRadius: 999, background: 'var(--or)', color: '#0b1a0f', fontWeight: 800, fontSize: 15, textDecoration: 'none' }}>
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
