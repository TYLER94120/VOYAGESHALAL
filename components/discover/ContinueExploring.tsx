import Link from 'next/link'
import cityCoords from '@/lib/cityCoords.json'
import indexVilles from '@/data/index-villes.json'
import { localizedHref } from '@/lib/slugs'
import { cityEn } from '@/lib/poiI18n'

// Bloc « Continuer votre exploration » (P2 anti cul-de-sac) : liens internes
// CONTEXTUELS en fin de fiche ville — villes proches avec distance réelle,
// destinations similaires (même région / Halal Score voisin), où prier,
// hôtels, planificateur. Server component, zéro JS client.

interface CityIdx { slug: string; nom: string; pays: string; region?: string; score_halal?: number }
interface CityPos { slug: string; nom: string; lat: number; lng: number }

const IDX = indexVilles as CityIdx[]
const POS = new Map((cityCoords as CityPos[]).map((c) => [c.slug, c]))

function distKm(a: CityPos, b: CityPos): number {
  const p = Math.PI / 180, R = 6371
  const x = Math.sin(((b.lat - a.lat) * p) / 2) ** 2 + Math.cos(a.lat * p) * Math.cos(b.lat * p) * Math.sin(((b.lng - a.lng) * p) / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

export default function ContinueExploring({
  slug,
  nom,
  pays,
  paysSlug,
  scoreHalal,
  villesProches,
  isEN = false,
}: {
  slug: string
  nom: string
  pays?: string
  paysSlug?: string | null
  scoreHalal?: number
  villesProches?: string[]
  isEN?: boolean
}) {
  const me = POS.get(slug)
  const name = (s: string, n: string) => (isEN ? cityEn(n, true) : n)

  // Villes proches : celles du JSON ville si présentes, sinon les plus proches
  // géographiquement — avec la distance réelle (« Bursa, à ~150 km »).
  let proches: { slug: string; nom: string; km: number }[] = []
  if (me) {
    const candidates = (villesProches?.length
      ? villesProches.map((s) => POS.get(s)).filter(Boolean) as CityPos[]
      : (cityCoords as CityPos[]).filter((c) => c.slug !== slug))
      .map((c) => ({ slug: c.slug, nom: c.nom, km: Math.round(distKm(me, c) / 10) * 10 }))
      .sort((a, b) => a.km - b.km)
    proches = candidates.slice(0, 3)
  }

  // Destinations similaires : même région, Halal Score le plus proche
  const mine = IDX.find((c) => c.slug === slug)
  const prochesSet = new Set(proches.map((p) => p.slug))
  // (régions parfois hétérogènes → complément par score le plus proche, toutes régions)
  let similaires: (CityIdx & { d: number })[] = []
  if (mine) {
    const ref = scoreHalal ?? mine.score_halal ?? 0
    const pool = IDX.filter((c) => c.slug !== slug && !prochesSet.has(c.slug))
    const sameRegion = pool.filter((c) => c.region && c.region === mine.region)
    const ranked = (list: CityIdx[]) => list.map((c) => ({ ...c, d: Math.abs((c.score_halal ?? 0) - ref) })).sort((a, b) => a.d - b.d)
    similaires = ranked(sameRegion).slice(0, 3)
    if (similaires.length < 3) {
      const have = new Set(similaires.map((c) => c.slug))
      similaires = [...similaires, ...ranked(pool.filter((c) => !have.has(c.slug))).slice(0, 3 - similaires.length)]
    }
  }

  const card = 'block bg-white rounded-2xl border border-gray-100 px-4 py-3 text-sm hover:border-[#c9a870] transition-colors'

  return (
    <section style={{ maxWidth: 820, margin: '0 auto', padding: '2.5rem 1.25rem 1rem' }}>
      <h2 style={{ fontFamily: 'var(--font-playfair), Georgia, serif', color: '#1a3a2a' }} className="text-2xl font-bold mb-5">
        {isEN ? 'Continue your exploration' : 'Continuer votre exploration'}
      </h2>

      {proches.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            {isEN ? `Near ${name(slug, nom)}` : `Près de ${nom}`}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {proches.map((p) => (
              <Link key={p.slug} href={`/destinations/${p.slug}`} className={card}>
                <strong style={{ color: '#1a3a2a' }}>{name(p.slug, p.nom)}</strong>
                <span className="block text-xs text-gray-400">
                  {isEN ? `~${p.km} km from ${name(slug, nom)}` : `à ~${p.km} km ${/^[aeiouyàâéèêiîoôuû]/i.test(nom) ? `d'${nom}` : `de ${nom}`}`}
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      {similaires.length > 0 && (
        <div className="mb-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-gray-400 mb-2">
            {isEN ? 'Similar destinations' : 'Destinations similaires'}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            {similaires.map((c) => (
              <Link key={c.slug} href={`/destinations/${c.slug}`} className={card}>
                <strong style={{ color: '#1a3a2a' }}>{name(c.slug, c.nom)}</strong>
                <span className="block text-xs text-gray-400">
                  {c.region} · Halal Score {c.score_halal}/5
                </span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        <Link href={`/priere/${slug}`} className={card} style={{ color: '#1a3a2a' }}>
          🕌 {isEN ? `Where to pray in ${name(slug, nom)}` : `Où prier à ${nom}`}
        </Link>
        <Link href={`/hotels/${slug}`} className={card} style={{ color: '#1a3a2a' }}>
          🏨 {isEN ? `Well-located hotels in ${name(slug, nom)}` : `Hôtels bien placés à ${nom}`}
        </Link>
        <Link href={localizedHref('/planificateur', isEN)} className={card} style={{ color: '#1a3a2a' }}>
          🗺️ {isEN ? `Plan my ${name(slug, nom)} trip day by day` : `Planifier mon séjour à ${nom} jour par jour`}
        </Link>
        {pays && paysSlug && (
          <Link href={`/destinations/pays/${paysSlug}`} className={card} style={{ color: '#1a3a2a' }}>
            🌍 {isEN ? `Halal travel in ${pays}` : `Voyage halal ${pays}`}
          </Link>
        )}
      </div>
    </section>
  )
}
