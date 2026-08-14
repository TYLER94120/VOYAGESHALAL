import type { Metadata } from 'next'
import { replier } from '@/lib/titreSpot'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { readFileSync } from 'fs'
import path from 'path'
import { getDomainSEO } from '@/lib/domain'
import { alternatesFor } from '@/lib/hreflang'
import { listSpotsByVille } from '@/lib/prayerSpots'
import { CATEGORIES, SEUIL_CONFIANCE } from '@/lib/community'
import ShareSpot from '@/components/community/ShareSpot'
import JsonLd from '@/components/seo/JsonLd'

// 📖 GUIDE VIVANT — le guide halal d'une ville ÉCRIT PAR LA COMMUNAUTÉ.
// Généré automatiquement depuis les spots réels : il grandit à chaque
// nouveau spot, à chaque confirmation, à chaque astuce. Ce qu'aucune IA ne
// peut copier : il vit. Indexé par Google dès 3 spots (sinon noindex).
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ ville: string }> }

const GROUPES: { id: string; cats: string[]; fr: string; en: string; icon: string }[] = [
  { id: 'prier', cats: ['coin_priere'], fr: 'Où prier', en: 'Where to pray', icon: '🕌' },
  { id: 'manger', cats: ['resto', 'boucherie'], fr: 'Où manger halal', en: 'Where to eat halal', icon: '🍽' },
  { id: 'femmes', cats: ['espace_femmes'], fr: 'Espaces femmes & famille', en: 'Women & family spaces', icon: '🏊' },
  { id: 'pepites', cats: ['pepite', 'autre'], fr: 'Les pépites', en: 'Hidden gems', icon: '💎' },
]

function villeInfo(slug: string): { nom: string; image?: string } | null {
  try {
    const v = JSON.parse(readFileSync(path.join(process.cwd(), 'data', 'villes', `${slug}.json`), 'utf8'))
    return { nom: v.nom ?? slug, image: v.image_hero || v.image }
  } catch { return null }
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { ville } = await params
  const { isEN, siteUrl } = await getDomainSEO()
  const info = villeInfo(ville)
  const spots = (await listSpotsByVille(ville)).filter((s) => s.status === 'published')
  const nom = info?.nom ?? ville
  // Le nom de la ville passe devant : le compte de spots et la mention de la
  // communauté sont sacrifiés en premier. 11 titres sur 14 dépassaient.
  const title = replier(isEN
    ? [`Living halal guide to ${nom} — by the Muslim community (${spots.length} spots)`,
       `Living halal guide to ${nom} — ${spots.length} community spots`,
       `Living halal guide to ${nom} (${spots.length} spots)`,
       `Living halal guide to ${nom}`]
    : [`Guide vivant halal de ${nom} — par la communauté (${spots.length} spots)`,
       `Guide vivant halal de ${nom} — ${spots.length} spots partagés`,
       `Guide vivant halal de ${nom} (${spots.length} spots)`,
       `Guide vivant halal de ${nom}`])
  const description = isEN
    ? `Where to pray, eat halal and stay in ${nom} — real spots shared, enriched and confirmed by Muslim travelers. A guide that grows every day.`
    : `Où prier, manger halal et dormir à ${nom} — de vrais spots partagés, enrichis et confirmés par des voyageurs musulmans. Un guide qui grandit chaque jour.`
  return {
    title,
    description,
    // Indexé seulement quand le guide a de la matière (≥ 3 spots)
    robots: spots.length >= 3 ? undefined : { index: false, follow: true },
    alternates: alternatesFor(`/guide-vivant/${ville}`, isEN),
    openGraph: { title, description, url: `${siteUrl}/guide-vivant/${ville}` },
  }
}

export default async function GuideVivantPage({ params }: Props) {
  const { ville } = await params
  const { isEN: en, siteUrl } = await getDomainSEO()
  const info = villeInfo(ville)
  const spots = (await listSpotsByVille(ville)).filter((s) => s.status === 'published')
  if (!info && spots.length === 0) notFound()
  const nom = info?.nom ?? spots[0]?.villeNom ?? ville
  const totalConf = spots.reduce((n, s) => n + (s.confirmations ?? 0), 0)
  const auteurs = new Set(spots.map((s) => s.auteurPseudo ?? 'Un voyageur')).size

  const itemList = {
    '@context': 'https://schema.org', '@type': 'ItemList',
    name: en ? `Halal guide to ${nom} by the community` : `Guide halal de ${nom} par la communauté`,
    numberOfItems: spots.length,
    itemListElement: spots.slice(0, 30).map((s, i) => ({
      '@type': 'ListItem', position: i + 1, name: s.nom, url: `${siteUrl}/spot/${s.id}`,
    })),
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--creme)' }}>
      <JsonLd data={itemList} />
      {/* En-tête sombre, photo d'ambiance de la ville si disponible */}
      <section style={{ position: 'relative', background: 'var(--nuit)', padding: '34px 18px 26px', overflow: 'hidden' }}>
        {info?.image && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={info.image} alt="" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.28 }} />
        )}
        <div style={{ position: 'relative', maxWidth: 640, margin: '0 auto' }}>
          <p style={{ color: 'var(--or)', fontSize: 12, fontWeight: 800, letterSpacing: 3, textTransform: 'uppercase', margin: 0 }}>
            📖 {en ? 'Living guide — written by the community' : 'Guide vivant — écrit par la communauté'}
          </p>
          <h1 style={{ fontFamily: "'Playfair Display', serif", color: '#fdfaf3', fontSize: 32, fontWeight: 900, margin: '6px 0 8px' }}>
            {en ? `Halal guide to ${nom}` : `Guide halal de ${nom}`}
          </h1>
          <p style={{ color: 'rgba(253,250,243,0.75)', fontSize: 14.5, margin: 0, lineHeight: 1.6 }}>
            {en
              ? `${spots.length} real spot${spots.length > 1 ? 's' : ''} · ${auteurs} contributor${auteurs > 1 ? 's' : ''}${totalConf > 0 ? ` · ${totalConf} confirmations` : ''} — this guide grows with every traveler.`
              : `${spots.length} spot${spots.length > 1 ? 's' : ''} réel${spots.length > 1 ? 's' : ''} · ${auteurs} contributeur${auteurs > 1 ? 's' : ''}${totalConf > 0 ? ` · ${totalConf} confirmations` : ''} — ce guide grandit avec chaque voyageur.`}
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '18px 16px 70px' }}>
        {spots.length < 3 && (
          <p style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.4)', borderRadius: 14, padding: '12px 16px', fontSize: 14, color: '#8A6D1E', fontWeight: 600 }}>
            🌱 {en
              ? 'This guide is just starting — every spot you add makes it more useful for the next traveler.'
              : 'Ce guide démarre — chaque spot que tu ajoutes le rend plus utile pour le prochain voyageur.'}
          </p>
        )}

        {GROUPES.map((g) => {
          const items = spots.filter((s) => g.cats.includes(s.categorie ?? 'autre'))
          if (items.length === 0) return null // honnêteté : pas de données → pas de section
          return (
            <section key={g.id} style={{ marginTop: 22 }}>
              <h2 style={{ fontFamily: "'Playfair Display', serif", fontSize: 22, fontWeight: 800, color: '#0b1a0f', margin: '0 0 10px' }}>
                {g.icon} {en ? g.en : g.fr} <span style={{ fontSize: 14, color: '#9ca3af', fontWeight: 600 }}>({items.length})</span>
              </h2>
              <div style={{ display: 'grid', gap: 10 }}>
                {items.map((s) => {
                  const cat = CATEGORIES.find((c) => c.id === s.categorie)
                  const derniereAstuce = s.astuces?.[s.astuces.length - 1]
                  return (
                    <Link key={s.id} href={`/spot/${s.id}`} style={{ display: 'block', background: '#fff', border: `1px solid ${(s.confirmations ?? 0) >= SEUIL_CONFIANCE ? 'rgba(201,168,76,0.55)' : 'rgba(27,67,50,0.12)'}`, borderRadius: 16, padding: '14px 16px', textDecoration: 'none' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
                        <span style={{ fontSize: 20 }}>{cat?.icon ?? '📍'}</span>
                        <span style={{ flex: 1, minWidth: 150, fontWeight: 800, fontSize: 15.5, color: '#0b1a0f' }}>{s.nom}</span>
                        {(s.confirmations ?? 0) >= SEUIL_CONFIANCE && <span style={{ fontSize: 13, color: '#8A6D1E', fontWeight: 800 }}>🛡️</span>}
                        {(s.confirmations ?? 0) > 0 && <span style={{ fontSize: 13, color: '#1a6b3c', fontWeight: 700 }}>✅ {s.confirmations}</span>}
                      </div>
                      {(s.description || derniereAstuce) && (
                        <p style={{ margin: '6px 0 0', fontSize: 13.5, color: '#6b7280', lineHeight: 1.55 }}>
                          {s.description ?? `« ${derniereAstuce!.texte} » — ${derniereAstuce!.pseudo}`}
                        </p>
                      )}
                      <p style={{ margin: '4px 0 0', fontSize: 12.5, color: '#9ca3af' }}>
                        {en ? 'by' : 'par'} {s.auteurPseudo ?? (en ? 'A traveler' : 'Un voyageur')} · {en ? 'community · to confirm' : 'communauté · à confirmer'}
                      </p>
                    </Link>
                  )
                })}
              </div>
            </section>
          )
        })}

        {/* Le guide s'écrit à plusieurs */}
        <div style={{ marginTop: 26, textAlign: 'center', background: 'var(--nuit)', borderRadius: 20, padding: '22px 18px' }}>
          <p style={{ color: '#fdfaf3', fontWeight: 800, fontSize: 16.5, margin: '0 0 4px' }}>
            {en ? `You know ${nom}?` : `Tu connais ${nom} ?`}
          </p>
          <p style={{ color: 'rgba(253,250,243,0.65)', fontSize: 14, margin: '0 0 14px' }}>
            {en ? 'Add your spot — 15 seconds, and it helps every traveler after you 🤲' : 'Ajoute ton spot — 15 secondes, et il aide tous les voyageurs après toi 🤲'}
          </p>
          <Link href="/communaute/ajouter" style={{ display: 'inline-flex', alignItems: 'center', minHeight: 52, padding: '0 24px', borderRadius: 999, background: 'var(--or)', color: '#0b1a0f', fontWeight: 900, fontSize: 15, textDecoration: 'none' }}>
            ➕ {en ? 'Add a spot' : 'Ajouter un spot'}
          </Link>
          <div style={{ maxWidth: 340, margin: '10px auto 0' }}>
            <ShareSpot nom={en ? `Halal guide to ${nom}` : `Guide halal de ${nom}`} ville={nom} url={`${siteUrl}/guide-vivant/${ville}`} en={en} />
          </div>
        </div>

        <p style={{ marginTop: 16, textAlign: 'center', fontSize: 13.5 }}>
          <Link href={`/destinations/${ville}`} style={{ color: '#1b4332', fontWeight: 700 }}>
            {en ? `Full ${nom} city guide (hotels, mosques, tips) →` : `Fiche complète de ${nom} (hôtels, mosquées, conseils) →`}
          </Link>
        </p>
      </div>
    </main>
  )
}
