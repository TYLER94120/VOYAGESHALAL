// 🗄 LA FICHE DE VILLE, RENDUE UNE FOIS POUR TOUTES.
//
// CHANTIER CACHE DU 22 AOÛT. Mesuré sur le serveur de production : cette
// page sortait avec « private, no-cache, no-store » et pesait 137 à 152 Ko.
// Interdiction de cache × 354 villes × 2 domaines : chaque passage d'un
// robot d'indexation retirait ces octets de notre serveur. Le compte
// Vercel s'est mis en pause à 10,77 Go d'« Origin Transfer » sur 10 Go
// inclus, et les trois sites sont tombés ensemble.
//
// 🔴 LA CAUSE, ET POURQUOI ELLE N'ÉTAIT PAS VISIBLE.
// La page appelait getDomainSEO(), qui lit l'en-tête « Host » pour savoir
// si elle parle français ou anglais. Lire un en-tête rend une page
// dynamique : Next.js la recalcule à chaque visite et interdit alors le
// cache — c'est lui qui écrit « no-store », pas nous. La fiche d'Istanbul,
// qui ne change pas du mois, était refabriquée pour chaque visiteur.
//
// LA CORRECTION : la langue vient de la ROUTE, plus de l'en-tête.
//   /destinations/istanbul      → français  (voyageshalal.fr)
//   /en/destinations/istanbul   → anglais   (réécriture interne du
//                                 middleware ; l'URL publique reste
//                                 gohalaltravel.com/destinations/istanbul)
// La réponse ne dépend plus que de l'adresse. Les deux versions sont donc
// fabriquées À LA CONSTRUCTION et servies depuis le cache : plus un octet
// de notre serveur une fois la page en cache.
//
// ⚠️ CE QUI NE DOIT PAS BOUGER : l'URL publique et le lien canonique. Le
// préfixe /en est un chemin INTERNE. Il ne s'affiche jamais dans la barre
// d'adresse, il ne part jamais dans un sitemap, et le middleware renvoie
// en 301 quiconque le tape à la main.
import { titreSeo } from '@/lib/titre-seo'
import { titresVilleEn, titresVilleFr, descriptionVille } from '@/lib/titreVille.mjs'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { readdirSync, readFileSync } from 'fs'
import path from 'path'
import type { Ville } from '@/lib/villeTypes'
import VilleExperience from '@/components/villes/VilleExperience'
import SocleVille from '@/components/villes/SocleVille'
import { DestinationFaqSchema, DestinationSchema } from '@/components/SchemaOrg'
import CitySync from '@/components/location/CitySync'
import { cityEn } from '@/lib/poiI18n'
import cityCoords from '@/lib/cityCoords.json'
import { FR_URL, EN_URL } from '@/lib/domain'
import { conforme } from '@/lib/conformite'
import { compteurVille } from '@/lib/mosqueesOsm'
import { dateGitVille, fmtMonthYear } from '@/lib/freshness'

interface Props {
  city: string
  en: boolean
}

const villesDir = path.join(process.cwd(), 'data', 'villes')

function getVilleSlugs(): string[] {
  try {
    return readdirSync(villesDir)
      .filter((f) => f.endsWith('.json'))
      .map((f) => f.replace('.json', ''))
  } catch {
    return []
  }
}

function getVille(slug: string): Ville | null {
  try {
    const raw = readFileSync(path.join(villesDir, `${slug}.json`), 'utf-8')
    return JSON.parse(raw) as Ville
  } catch {
    return null
  }
}

export function paramsVilles() {
  return getVilleSlugs().map((city) => ({ city }))
}

export async function metadataDestination({ city, en }: Props): Promise<Metadata> {
  const ville = getVille(city)
  if (!ville) return {}
  const restos = ville.statistiques?.restaurants_halal ?? (ville.restaurants?.length ?? 0)
  const mosquees = ville.statistiques?.mosquees
  const richDesc =
    ville.metaDescription ??
    `🕌 Guide halal ${ville.nom} 2026 : Halal Trust Score™ ${ville.score_halal}/5 · ${restos.toLocaleString('fr-FR')} restaurants halal · Horaires de prière en temps réel${mosquees ? ` · ${mosquees.toLocaleString('fr-FR')} mosquées` : ''} · Confirmé par la communauté.`
  const ogImage = ville.image ?? ville.image_hero
  // Le chiffre annoncé à Google doit être celui de la page : les bars,
  // lounges à chicha et boîtes de nuit sont écartés de la liste affichée
  // (lib/conformite), ils ne doivent pas gonfler le compte du titre.
  const nbRestos = (ville.restaurants ?? []).filter(
    (r: { nom?: string; type?: string; halalConfidence?: string }) => conforme(r.nom, r.type, r.halalConfidence),
  ).length
  const nbMosq = ville.mosqueesPrincipales?.length ?? mosquees ?? 0
  const nbHotels = ville.hotels?.length ?? 0

  const isEN = en
  const siteUrl = en ? EN_URL : FR_URL

  // 🔎 CE QUE GOOGLE AFFICHE. Trois corrections mesurees :
  //
  // 1. Le nom de la ville doit etre celui que TAPE le lecteur. Sur le
  //    domaine anglais, 34 fiches sortaient encore leur nom francais
  //    (« Dubaï », « La Mecque », « Le Caire »…). Un anglophone cherche
  //    « Dubai », « Mecca » : sans le mot exact, Google ne le met pas en
  //    gras et le resultat n'est pas choisi.
  // 2. Plus de marque dans le titre : « | GoHalalTravel.com » coutait 19
  //    caracteres sur une limite d'environ 60, et faisait tronquer la fin
  //    utile du titre par Google.
  // 3. Les chiffres viennent des donnees REELLES de la fiche. Les
  //    descriptions figees annonçaient un nombre de restaurants faux sur
  //    93 fiches sur 354 (Mecque : « 76 » annonces, 26 reels).
  const nomLocal = (isEN && ville.nom_en) ? ville.nom_en : ville.nom
  // Se replie sur les noms longs (« Bandar Seri Begawan », « Al-Quds
  // (Jérusalem) », « La Nouvelle-Orléans ») — voir lib/titre-seo.
  // 🔎 4. LE BESOIN D'ABORD, ET UN CHIFFRE QUI SE VÉRIFIE (ordre du
  //    20 août). « Marrakech Halal Guide 2026 » décrivait le CATALOGUE ;
  //    « Où prier à Marrakech : 147 lieux de prière » décrit le BESOIN de
  //    celui qui tape. Le mot « Guide » est retiré des deux langues : la
  //    page Marrakech le portait et a fait zéro clic sur 109 affichages
  //    en première page. Le chiffre est le MÊME que celui du socle rendu
  //    sur la page — compté, jamais annoncé à l'aveugle.
  const nbPriere = compteurVille(city) ?? nbMosq
  const sourceOsm = compteurVille(city) != null
  const title = isEN
    ? titreSeo(titresVilleEn(nomLocal, nbPriere, sourceOsm))
    : titreSeo(titresVilleFr(nomLocal, nbPriere, sourceOsm))

  const description = descriptionVille({
    nom: nomLocal,
    nbRestos,
    nbHotels,
    en: isEN,
  })

  const ogTitle = isEN
    ? `${nomLocal} Halal Travel Guide 2026 — Muslim-Friendly`
    : `${nomLocal} Halal 2026 — Guide Voyage Musulman`
  const ogDesc = isEN
    ? `Halal restaurants, nearby mosques and prayer times in ${nomLocal}. Every listing carries its source.`
    : `Restaurants halal, mosquées proches et horaires de prière à ${nomLocal}. Chaque adresse porte sa source.`

  // Protection qualité : une fiche sans aucun contenu réel (0 resto, 0 mosquée,
  // 0 hôtel, 0 activité) dilue le domaine → noindex (mais on garde follow pour
  // laisser passer le maillage). Les fiches avec du contenu restent indexables.
  const contentCount = (ville.restaurants?.length ?? 0) + (ville.mosqueesPrincipales?.length ?? 0)
    + (ville.hotels?.length ?? 0) + (ville.activites?.length ?? 0)
  const thin = contentCount < 3

  return {
    title: { absolute: title },
    description,
    ...(thin ? { robots: { index: false, follow: true } } : {}),
    // ⚠️ Plus de hreflang (20 août) : côté français la page ville prépare
    // le voyage, côté anglais c'est l'immersion en plein écran avec ses
    // flux. Même ville, contenus différents : pas une paire de traductions.
    alternates: { canonical: `${siteUrl}/destinations/${city}` },
    openGraph: {
      title: ogTitle,
      description: ogDesc,
      url: `${siteUrl}/destinations/${city}`,
      // Date de modification réelle (historique git) : Google s'en sert pour
      // juger la fraîcheur d'un guide. Absente jusqu'ici sur les 354 fiches.
      ...(dateGitVille(city) ? { modifiedTime: dateGitVille(city) as string } : {}),
      ...(ogImage ? { images: [{ url: ogImage, width: 1200, height: 630, alt: `Halal travel ${ville.nom}` }] } : {}),
    },
  }
}

export default function DestinationRoute({ city, en }: Props) {
  const ville = getVille(city)
  if (!ville) notFound()

  const isEN = en
  const siteUrl = en ? EN_URL : FR_URL
  const all = cityCoords as { slug: string; nom: string; pays?: string; lat?: number; lng?: number }[]
  const coords = all.find((c) => c.slug === city)
  // Restaurants proposes au public : bars, lounges a chicha et boites de
  // nuit sont ecartes (lib/conformite.ts). Le lieu compte autant que la
  // nourriture pour un voyageur musulman en famille.
  const restaurantsConformes = (ville.restaurants ?? []).filter(
    (r: { nom?: string; type?: string; halalConfidence?: string }) => conforme(r.nom, r.type, r.halalConfidence),
  )

  // La ville TELLE QU'ON L'AFFICHE — une seule source pour l'écran et pour
  // ce qu'on déclare à Google. Les compteurs de la FAQ et les noms qu'elle
  // cite en découlent, donc ils ne peuvent plus diverger de la page.
  const villeAffichee = { ...ville, restaurants: restaurantsConformes, restaurantsTotal: restaurantsConformes.length }

  return (
    <>
      {/* Mémorise automatiquement cette ville pour tout le site si aucune n'est encore choisie */}
      {coords?.lat != null && coords?.lng != null && (
        <CitySync city={{ slug: city, nom: ville.nom, pays: ville.pays, lat: coords.lat, lng: coords.lng }} />
      )}

      {/* 🏙 ITÉRATION 7 — la page ville REPARTIE DE ZÉRO (PageVille) :
          5 sections (Verdict, Dormir, Manger, Mes journées, À savoir) au
          CSS contractuel de maquette-page-ville.html. Elle REMPLACE
          VilleDesktop et ses onglets. Rôle : préparer le voyage chez soi
          — sur place, c'est Autour de moi.
          Perf mobile : seuls 24 restos sont sérialisés. */}
      <VilleExperience en={isEN} ville={{
        ...ville,
        slug: city,
        // Bars, lounges à chicha et boîtes de nuit sont écartés : le lieu
        // compte autant que la nourriture (lib/conformite.ts)
        restaurants: restaurantsConformes.slice(0, 24),
        restaurantsTotal: restaurantsConformes.length,
      }} />


      {/* 📜 CHANTIER SEO DU 20 AOÛT — le socle rendu par le SERVEUR.
          Test JavaScript désactivé sur cette page avant correction :
          1 092 caractères, aucun <h1>, aucun <h2> — 354 pages invisibles
          pour Google. Le socle rend ici, en HTML, le <h1> orienté besoin,
          les compteurs réels, les noms des lieux et le maillage interne.
          C'est la reprise assumée du « soit on le supprime, soit on le
          refait » du 19 août : refait, en sombre, sous le flux. */}
      <SocleVille ville={villeAffichee} slug={city} en={isEN} />

      {/* 🧹 19 août, ordre de Mohamed après la mise en ligne de l'Immersion :
          « ce qui est en dessous [du flux], on le supprime parce que c'est
          très mal fait — soit on le supprime, soit on le refait ». Sont
          donc PARTIS d'ici : le bandeau hôtels crème, les sections
          éditoriales SSR, la FAQ visible, le maillage « autres
          destinations », les guides liés, ContinueExploring et la capture
          email. Les schémas JSON-LD (invisibles, SEO) restent. À REFAIRE
          plus tard dans le style sombre si on veut récupérer le maillage
          interne — la suppression a un coût SEO, dit et assumé. */}

      {/* 🔴 3 septembre — LA FAQ ENVOYÉE À GOOGLE CONTREDISAIT LA PAGE.
          Ces deux schémas recevaient la ville BRUTE, alors que l'affichage
          (VilleExperience, SocleVille) reçoit `restaurantsConformes`. Mesuré
          sur les 354 fiches :

            · 159 villes (45 %) annonçaient dans leur FAQ un nombre de
              restaurants supérieur à ce que la page montre — 407 de trop.
            · 27 villes NOMMAIENT une adresse que la page refuse : « Chicha
              Châtelet » à Annaba, « Cloud Lounge » à Bagdad, « 114 Group Tea
              & Lounge » à Bakou. Des lounges à chicha, écartés de l'écran
              par lib/conformite.ts — et cités à Google comme nos adresses.

          Une partie de l'écart est de ma main : les mots de porc ajoutés au
          filtre le 1er septembre ont resserré l'affichage sans resserrer la
          FAQ (80 des 407). Le reste préexistait.

          Une seule ville part maintenant partout : celle qu'on affiche. */}
      <DestinationSchema ville={villeAffichee} slug={city} en={isEN} siteUrl={siteUrl} />
      <DestinationFaqSchema ville={villeAffichee} en={isEN} />
    </>
  )
}
