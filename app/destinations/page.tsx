import type { Metadata } from 'next'
import { Suspense } from 'react'
import fs from 'fs'
import path from 'path'
import { getDomainSEO, FR_URL, EN_URL } from '@/lib/domain'
import DestinationsClient, { type VilleCard } from '@/components/destination/DestinationsClient'
import DestinationsRedirect from '@/components/location/DestinationsRedirect'

const FALLBACK_IMG = 'https://images.unsplash.com/photo-1476514525535-07fb3b4ae5f1?w=600&q=80'

// Rendu dynamique forcé : lecture fraîche de data/villes/ à chaque requête,
// évite tout cache statique/CDN obsolète (ex. ancienne version à 6 villes).
export const dynamic = 'force-dynamic'
export const revalidate = 0

// Nombre réel de villes (lecture du dossier data/villes au build)
const VILLE_COUNT = (() => {
  try {
    return fs.readdirSync(path.join(process.cwd(), 'data', 'villes')).filter((f) => f.endsWith('.json')).length
  } catch {
    return 0
  }
})()

export async function generateMetadata(): Promise<Metadata> {
  const { isEN, brand, siteUrl } = await getDomainSEO()
  const title = isEN
    ? `Halal Destinations Worldwide — ${VILLE_COUNT}+ Cities | ${brand}`
    : `Destinations Voyage Halal — Meilleures Villes du Monde | ${brand}`
  const description = isEN
    ? `${VILLE_COUNT}+ hand-picked halal destinations: Istanbul, Marrakech, Dubai, Kuala Lumpur, Mecca and more. Halal restaurants, mosques and guides for every city.`
    : `${VILLE_COUNT}+ destinations halal sélectionnées : Istanbul, Marrakech, Dubaï, Kuala Lumpur, La Mecque et bien plus. Restaurants halal signalés, mosquées et guides pour chaque ville.`
  return {
    title: { absolute: title },
    description,
    alternates: {
      canonical: `${siteUrl}/destinations`,
      languages: { fr: `${FR_URL}/destinations`, en: `${EN_URL}/destinations`, 'x-default': `${EN_URL}/destinations` },
    },
    openGraph: { title, description, url: `${siteUrl}/destinations` },
  }
}

function getAllVilles(): VilleCard[] {
  const dir = path.join(process.cwd(), 'data', 'villes')
  if (!fs.existsSync(dir)) return []
  return fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      try {
        const v = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf-8'))
        const slug = f.replace('.json', '')
        const desc =
          typeof v.description === 'string'
            ? v.description
            : v.description?.court ?? v.description?.long ?? ''
        const st = v.statistiques ?? {}
        const bits: string[] = []
        if (st.mosquees) bits.push(`${Number(st.mosquees).toLocaleString('fr-FR')} mosquées`)
        if (st.restaurants_halal) bits.push(`${Number(st.restaurants_halal).toLocaleString('fr-FR')}+ restaurants`)
        const subtitle = bits.length ? bits.join(' · ') : desc.slice(0, 60)
        return {
          slug,
          nom: v.nom ?? slug,
          pays: v.pays ?? '',
          scoreHalal: v.score_halal ?? null,
          description: desc,
          subtitle,
          image: v.image ?? v.image_hero ?? FALLBACK_IMG,
          continent: v.continent ?? null,
          tags: Array.isArray(v.tags) ? v.tags : [],
          halalScore: v.halalScore ?? (v.score_halal ? Math.round(v.score_halal * 2 * 10) / 10 : null),
          codeISO: v.codeISO ?? '',
          lat: v.coordonnees?.lat ?? null,
          piscinePrivee: Array.isArray(v.hotels) && v.hotels.some((h: any) =>
            (h?.piscineNonMixte === true || h?.plagePrivee === true) && h?.sourceEquipements === 'halalbooking'),
          lng: v.coordonnees?.lng ?? null,
          villeNonMusulmane: v.villeNonMusulmane === true
            || (Array.isArray(v.tags) && v.tags.some((t: string) => String(t).toLowerCase() === 'ville non-musulmane')),
        } as VilleCard
      } catch {
        return null
      }
    })
    .filter((v): v is VilleCard => v !== null)
    .sort((a, b) => a.nom.localeCompare(b.nom, 'fr'))
}

// Ordre d'affichage des filtres ; on ne garde que ceux réellement présents.
const CONTINENT_ORDER = ['Asie', 'Afrique', 'Europe', 'Amérique du Nord', 'Amérique du Sud', 'Océanie']

export default async function DestinationsPage() {
  const villes = getAllVilles()

  // Filtres dérivés dynamiquement des continents réellement présents dans data/villes/
  const presents = new Set(villes.map((v) => v.continent).filter(Boolean) as string[])
  const continents = ['Toutes', ...CONTINENT_ORDER.filter((c) => presents.has(c))]

  return (
    <main style={{ backgroundColor: '#fdfaf3' }}>
      <Suspense fallback={null}>
        <DestinationsRedirect />
      </Suspense>
      {/* Hero de recherche + étagères + grille : rendus par le client (refonte
          « étagères » façon Netflix — voir DestinationsClient) */}
      <DestinationsClient villes={villes} continents={continents} />
    </main>
  )
}
