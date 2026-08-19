import { titreSeo } from '@/lib/titre-seo'
import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import { readdirSync, readFileSync } from 'fs'
import path from 'path'
import type { Ville } from '@/lib/villeTypes'
import VilleExperience from '@/components/villes/VilleExperience'
import { DestinationFaqSchema, DestinationSchema } from '@/components/SchemaOrg'
import CitySync from '@/components/location/CitySync'
import { cityEn } from '@/lib/poiI18n'
import cityCoords from '@/lib/cityCoords.json'
import { getDomainSEO, FR_URL, EN_URL } from '@/lib/domain'
import { conforme } from '@/lib/conformite'
import { dateGitVille, fmtMonthYear } from '@/lib/freshness'

export const dynamicParams = false

interface Props {
  params: Promise<{ city: string }>
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

export async function generateStaticParams() {
  return getVilleSlugs().map((city) => ({ city }))
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { city } = await params
  const ville = getVille(city)
  if (!ville) return {}
  const restos = ville.statistiques?.restaurants_halal ?? (ville.restaurants?.length ?? 0)
  const mosquees = ville.statistiques?.mosquees
  const richDesc =
    ville.metaDescription ??
    `🕌 Guide halal ${ville.nom} 2026 : Halal Trust Score™ ${ville.score_halal}/5 · ${restos.toLocaleString('fr-FR')} restaurants halal · Horaires de prière en temps réel${mosquees ? ` · ${mosquees.toLocaleString('fr-FR')} mosquées` : ''} · Confirmé par la communauté.`
  const ogImage = ville.image ?? ville.image_hero
  const nbRestos = ville.restaurants?.length ?? 0
  const nbMosq = ville.mosqueesPrincipales?.length ?? mosquees ?? 0
  const nbHotels = ville.hotels?.length ?? 0

  const { isEN, siteUrl } = await getDomainSEO()

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
  const title = isEN
    ? titreSeo([
        `${nomLocal} Halal Guide 2026: Restaurants, Mosques & Prayer`,
        `${nomLocal} Halal Guide 2026: Restaurants & Mosques`,
        `${nomLocal} Halal Guide: Restaurants & Mosques`,
        `${nomLocal} Halal Guide 2026`,
      ])
    : titreSeo([
        `${nomLocal} Halal 2026 : Restaurants, Mosquées & Prière`,
        `${nomLocal} Halal 2026 : Restaurants & Mosquées`,
        `${nomLocal} Halal : Restaurants & Mosquées`,
        `${nomLocal} Halal 2026`,
      ])
  const chiffresEn = [
    nbRestos > 0 ? `${nbRestos} halal restaurants` : null,
    nbMosq > 0 ? `${nbMosq} mosques` : null,
    nbHotels > 0 ? `${nbHotels} hotels` : null,
  ].filter(Boolean).join(', ')
  const chiffresFr = [
    nbRestos > 0 ? `${nbRestos} restaurants halal` : null,
    nbMosq > 0 ? `${nbMosq} mosquées` : null,
    nbHotels > 0 ? `${nbHotels} hôtels` : null,
  ].filter(Boolean).join(', ')
  const description = isEN
    ? `${chiffresEn || 'Halal addresses'} listed in ${nomLocal}, with prayer times, qibla and where to pray. Every listing carries its source.`.slice(0, 300)
    : `${chiffresFr || 'Adresses halal'} référencés à ${nomLocal} : horaires de prière, qibla et où prier. Chaque adresse porte sa source.`.slice(0, 300)
  const ogTitle = isEN
    ? `${nomLocal} Halal Travel Guide 2026 — Muslim-Friendly`
    : `${nomLocal} Halal 2026 — Guide Voyage Musulman`
  const ogDesc = isEN
    ? `Halal restaurants, nearby mosques and prayer times in ${nomLocal}. The complete guide for Muslim travel.`
    : `Restaurants halal, mosquées proches et horaires de prière à ${nomLocal}. Le guide complet pour voyager halal.`

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
    alternates: {
      canonical: `${siteUrl}/destinations/${city}`,
      languages: {
        fr: `${FR_URL}/destinations/${city}`,
        en: `${EN_URL}/destinations/${city}`,
        'x-default': `${EN_URL}/destinations/${city}`,
      },
    },
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

export default async function DestinationPage({ params }: Props) {
  const { city } = await params
  const ville = getVille(city)
  if (!ville) notFound()

  const { isEN, siteUrl } = await getDomainSEO()
  const all = cityCoords as { slug: string; nom: string; pays?: string; lat?: number; lng?: number }[]
  const coords = all.find((c) => c.slug === city)
  // Restaurants proposes au public : bars, lounges a chicha et boites de
  // nuit sont ecartes (lib/conformite.ts). Le lieu compte autant que la
  // nourriture pour un voyageur musulman en famille.
  const restaurantsConformes = (ville.restaurants ?? []).filter(
    (r: { nom?: string; type?: string; halalConfidence?: string }) => conforme(r.nom, r.type, r.halalConfidence),
  )

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


      {/* 🧹 19 août, ordre de Mohamed après la mise en ligne de l'Immersion :
          « ce qui est en dessous [du flux], on le supprime parce que c'est
          très mal fait — soit on le supprime, soit on le refait ». Sont
          donc PARTIS d'ici : le bandeau hôtels crème, les sections
          éditoriales SSR, la FAQ visible, le maillage « autres
          destinations », les guides liés, ContinueExploring et la capture
          email. Les schémas JSON-LD (invisibles, SEO) restent. À REFAIRE
          plus tard dans le style sombre si on veut récupérer le maillage
          interne — la suppression a un coût SEO, dit et assumé. */}

      <DestinationSchema ville={ville} slug={city} en={isEN} siteUrl={siteUrl} />
      <DestinationFaqSchema ville={ville} en={isEN} />
    </>
  )
}
