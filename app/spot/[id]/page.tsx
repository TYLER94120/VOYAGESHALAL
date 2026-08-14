import type { Metadata } from 'next'
import { replier, contientDuFrancais } from '@/lib/titreSpot.mjs'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getDomainSEO } from '@/lib/domain'
import { getRedis } from '@/lib/pushStore'
import { getSpotById, addImpact, CATEGORIES, INFOS_LABELS, SEUIL_CONFIANCE } from '@/lib/community'
import ShareSpot from '@/components/community/ShareSpot'
import SalamBar from '@/components/community/SalamBar'
import PrixSpot from '@/components/community/PrixSpot'
import { getSalams } from '@/lib/community'
import { LIEU_LABELS } from '@/lib/prayerSpots'
import ConfirmBar from '@/components/community/ConfirmBar'
import ItineraireButton from '@/components/community/ItineraireButton'
import JsonLd from '@/components/seo/JsonLd'

// Page publique d'un spot communautaire (BLOC 6 — indexable, SEO
// « où prier / manger halal à [lieu] »). Chaque vue = +1 impact réel
// pour l'auteur (« grâce à toi, X musulmans ont trouvé… »).
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

interface Props { params: Promise<{ id: string }> }

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const { isEN, siteUrl } = await getDomainSEO()
  const spot = await getSpotById(id)
  if (!spot || spot.status === 'hidden') return { robots: { index: false } }
  const cat = CATEGORIES.find((c) => c.id === spot.categorie) ?? CATEGORIES[0]
  // Le pire gabarit du site avant le 14 août : jusqu'à 123 caractères, et
  // 21 titres français servis sur le domaine anglais. Le nom du spot passe
  // devant ; sur le domaine anglais, un nom saisi en français cède la place
  // à la catégorie, qui est traduite.
  const nomEnAnglais = !contientDuFrancais(spot.nom)
  const title = replier(isEN
    ? (nomEnAnglais
        ? [`${spot.nom} — ${cat.en} in ${spot.villeNom} (community-shared)`,
           `${spot.nom} — ${cat.en} in ${spot.villeNom}`,
           `${spot.nom} — ${spot.villeNom}`,
           `${spot.nom}`]
        : [`${cat.en} in ${spot.villeNom} — shared by the community`,
           `${cat.en} in ${spot.villeNom} — community-shared`,
           `${cat.en} in ${spot.villeNom}`])
    : [`${spot.nom} — ${cat.fr} à ${spot.villeNom} (partagé par la communauté)`,
       `${spot.nom} — ${cat.fr} à ${spot.villeNom}`,
       `${spot.nom} — ${spot.villeNom}`,
       `${spot.nom}`])
  // La description est saisie par l'auteur, en français. Sur le domaine
  // anglais, on ne la sert que si elle ne contient pas de français ; sinon on
  // écrit une description anglaise à partir de la catégorie, qui est traduite.
  const descriptionSaisie = spot.description?.slice(0, 150)
  const descriptionUtilisable = descriptionSaisie && (!isEN || !contientDuFrancais(descriptionSaisie))
  const descriptionDuSpot = descriptionUtilisable
    ? descriptionSaisie
    : isEN
      ? `${cat.en} shared by a Muslim traveller in ${spot.villeNom}. Location, tips and community confirmations — to verify on site.`
      : `${cat.fr} partagé par un voyageur musulman à ${spot.villeNom}. Emplacement, conseils et confirmations de la communauté — à vérifier sur place.`
  return {
    title,
    description: descriptionDuSpot,
    alternates: { canonical: `${siteUrl}/spot/${spot.id}` },
    // Aperçu riche au partage (WhatsApp…) : photo utilisateur http sinon rien
    openGraph: {
      title,
      description: descriptionDuSpot,
      url: `${siteUrl}/spot/${spot.id}`,
      images: (spot.photos ?? []).find((p) => p.startsWith('http')) ? [{ url: (spot.photos ?? []).find((p) => p.startsWith('http'))! }] : undefined,
    },
  }
}

export default async function SpotPage({ params }: Props) {
  const { id } = await params
  const { isEN: en, siteUrl } = await getDomainSEO()
  const spot = await getSpotById(id)
  if (!spot || spot.status === 'hidden') notFound()

  // Impact réel : la consultation compte pour l'auteur (dédupe non nécessaire :
  // c'est un ordre de grandeur honnête de personnes AIDÉES par la page)
  const r = getRedis()
  if (r) {
    try {
      const n = await r.incr(`vh:spot:${spot.id}:vues`)
      spot.vues = Number(n) // miroir → visible sur toutes les cartes
      await r.set(`vh:spot:${spot.id}`, spot)
      if (spot.auteurId) await addImpact(spot.auteurId, 1)
    } catch { /* best-effort */ }
  }
  const aides = Math.max(0, (spot.vues ?? 0) - 1) + (spot.itineraires ?? 0)

  const cat = CATEGORIES.find((c) => c.id === spot.categorie) ?? CATEGORIES[0]
  const lieu = LIEU_LABELS[spot.typeLieu]
  const place = {
    '@context': 'https://schema.org', '@type': 'Place',
    name: spot.nom,
    description: spot.description,
    geo: { '@type': 'GeoCoordinates', latitude: spot.lat, longitude: spot.lng },
    address: { '@type': 'PostalAddress', addressLocality: spot.villeNom },
    url: `${siteUrl}/spot/${spot.id}`,
  }
  const breadcrumb = {
    '@context': 'https://schema.org', '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: en ? 'Community' : 'Communauté', item: `${siteUrl}/communaute` },
      { '@type': 'ListItem', position: 2, name: spot.villeNom, item: `${siteUrl}/destinations/${spot.villeSlug}` },
      { '@type': 'ListItem', position: 3, name: spot.nom, item: `${siteUrl}/spot/${spot.id}` },
    ],
  }

  return (
    <main style={{ minHeight: '100vh', background: 'var(--creme)' }}>
      <JsonLd data={place} />
      <JsonLd data={breadcrumb} />
      <div style={{ maxWidth: 560, margin: '0 auto', padding: '24px 16px 70px' }}>
        <nav style={{ fontSize: 13, opacity: 0.7, marginBottom: 14 }}>
          <Link href="/communaute">{en ? 'Community' : 'Communauté'}</Link> ›{' '}
          <Link href={`/destinations/${spot.villeSlug}`}>{spot.villeNom}</Link>
        </nav>

        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(107,70,193,0.12)', color: '#6b21a8', borderRadius: 999, padding: '7px 14px', fontWeight: 800, fontSize: 13 }}>
          {cat.icon} {en ? cat.en : cat.fr} · {en ? 'community' : 'communauté'}
        </span>

        <h1 style={{ fontFamily: "'Playfair Display', serif", fontSize: 28, fontWeight: 900, color: '#0b1a0f', margin: '12px 0 4px', lineHeight: 1.2 }}>
          {spot.nom}
        </h1>
        <p style={{ fontSize: 14.5, color: '#6b7280', margin: '0 0 6px' }}>
          {spot.villeNom}{spot.adresse ? ` · ${spot.adresse}` : ''}{lieu ? ` · ${en ? lieu.en : lieu.fr}` : ''}
        </p>
        <p style={{ fontSize: 14, color: '#1b4332', fontWeight: 700, margin: '0 0 14px' }}>
          {en ? 'Shared by' : 'Ajouté par'}{' '}
          {spot.auteurPseudo
            ? <Link href={`/communaute/${encodeURIComponent(spot.auteurPseudo)}`} style={{ color: '#1b4332', textDecoration: 'underline' }}>{spot.auteurPseudo}</Link>
            : 'VoyagesHalal'}
        </p>

        {/* Reel de la communauté (légende à l'écran, lecture native) */}
        {spot.video && (
          <div style={{ position: 'relative', borderRadius: 18, overflow: 'hidden', marginBottom: 14, background: '#000' }}>
            <video src={spot.video} controls playsInline preload="metadata" style={{ width: '100%', maxHeight: 420, display: 'block' }} />
            {spot.videoTexte && (
              <p style={{ position: 'absolute', bottom: 52, left: 12, right: 12, margin: 0, color: '#fff', fontWeight: 800, fontSize: 17, textShadow: '0 2px 8px rgba(0,0,0,0.8)', textAlign: 'center', pointerEvents: 'none' }}>{spot.videoTexte}</p>
            )}
          </div>
        )}
        {/* Galerie photos de la communauté */}
        {(() => {
          const gallery = [...(spot.photos ?? []), ...(spot.photo ? [spot.photo] : [])].filter((p, i, a) => a.indexOf(p) === i)
          if (gallery.length === 0) return null
          return (
            <div style={{ marginBottom: 14 }}>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={gallery[0]} alt={spot.nom} loading="lazy" style={{ width: '100%', borderRadius: 18, maxHeight: 300, objectFit: 'cover' }} />
              {gallery.length > 1 && (
                <div style={{ display: 'flex', gap: 8, marginTop: 8, overflowX: 'auto' }}>
                  {gallery.slice(1, 8).map((p, i) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={i} src={p} alt="" loading="lazy" style={{ width: 92, height: 92, borderRadius: 12, objectFit: 'cover', flexShrink: 0 }} />
                  ))}
                </div>
              )}
            </div>
          )
        })()}

        {/* Infos halal structurées, signalées par la communauté */}
        {spot.infos && Object.entries(spot.infos).some(([, v]) => v) && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', margin: '0 0 12px' }}>
            {Object.entries(spot.infos).filter(([, v]) => v).map(([k]) => INFOS_LABELS[k] && (
              <span key={k} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#fff', border: '1px solid rgba(27,67,50,0.18)', color: '#1b4332', borderRadius: 999, padding: '7px 12px', fontWeight: 700, fontSize: 13 }}>
                {INFOS_LABELS[k].icon} {en ? INFOS_LABELS[k].en : INFOS_LABELS[k].fr}
              </span>
            ))}
            <span style={{ alignSelf: 'center', color: '#9ca3af', fontSize: 12 }}>{en ? 'reported by the community · to verify' : 'signalé par la communauté · à vérifier'}</span>
          </div>
        )}

        {spot.description && (
          <p style={{ fontSize: 16, color: '#374151', lineHeight: 1.7, background: '#fff', borderRadius: 16, padding: 16, border: '1px solid rgba(27,67,50,0.1)', margin: '0 0 6px' }}>
            💬 {spot.description}
          </p>
        )}

        {/* Astuces des voyageurs (enrichissement collectif) */}
        {spot.astuces && spot.astuces.length > 0 && (
          <div style={{ margin: '8px 0 6px' }}>
            <p style={{ fontSize: 13, fontWeight: 800, color: '#6b7280', letterSpacing: 1, textTransform: 'uppercase', margin: '0 0 8px' }}>
              💡 {en ? 'Traveler tips' : 'Astuces des voyageurs'}
            </p>
            <div style={{ display: 'grid', gap: 8 }}>
              {spot.astuces.slice(-5).reverse().map((a, i) => (
                <p key={i} style={{ margin: 0, background: '#fff', border: '1px solid rgba(27,67,50,0.1)', borderRadius: 14, padding: '12px 14px', fontSize: 14.5, color: '#374151', lineHeight: 1.6 }}>
                  « {a.texte} » <span style={{ color: '#9ca3af', fontSize: 13 }}>— {a.pseudo}</span>
                </p>
              ))}
            </div>
          </div>
        )}

        {/* Badge confiance (≥ 5 confirmations) */}
        {(spot.confirmations ?? 0) >= SEUIL_CONFIANCE && (
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(201,168,76,0.15)', border: '1px solid rgba(201,168,76,0.5)', color: '#8A6D1E', borderRadius: 999, padding: '8px 14px', fontWeight: 800, fontSize: 13.5, margin: '4px 0' }}>
            🛡️ {en ? 'Community trust' : 'Confiance communauté'}
          </span>
        )}

        {/* 💫 Usage réel du spot — motivation : ce spot SERT */}
        {aides > 0 && (
          <div style={{ display: 'flex', gap: 10, margin: '0 0 4px', flexWrap: 'wrap' }}>
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(201,168,76,0.15)', color: '#8A6D1E', borderRadius: 999, padding: '8px 14px', fontWeight: 800, fontSize: 13.5 }}>
              💫 {en ? `This spot already helped ${aides} traveler${aides > 1 ? 's' : ''}` : `Ce spot a déjà aidé ${aides} voyageur${aides > 1 ? 's' : ''}`}
            </span>
            {(spot.itineraires ?? 0) > 0 && (
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(27,67,50,0.08)', color: '#1b4332', borderRadius: 999, padding: '8px 14px', fontWeight: 700, fontSize: 13.5 }}>
                🧭 {spot.itineraires} {en ? 'went there' : `y ${(spot.itineraires ?? 0) > 1 ? 'sont allés' : 'est allé'}`}
              </span>
            )}
          </div>
        )}
        <ConfirmBar spotId={spot.id} confirmations={spot.confirmations ?? 0} />
        {/* 💶 L'addition, s'il te plaît — restos & boucheries uniquement */}
        {(spot.categorie === 'resto' || spot.categorie === 'boucherie') && (
          <div style={{ background: '#fff', border: '1px solid rgba(27,67,50,0.12)', borderRadius: 16, padding: '12px 16px', margin: '10px 0 0' }}>
            <PrixSpot spotId={spot.id} votes={spot.prixVotes} en={en} />
          </div>
        )}
        {/* 👋 Salam de passage — on ne voyage jamais seul */}
        <SalamBar spotId={spot.id} initial={await getSalams(spot.id)} en={en} />

        <ItineraireButton spotId={spot.id} lat={spot.lat} lng={spot.lng} en={en} />
        {/* Partage 1 tap — le bouche-à-oreille WhatsApp est notre moteur */}
        <ShareSpot nom={spot.nom} ville={spot.villeNom} url={`${siteUrl}/spot/${spot.id}`} en={en} />

        <p style={{ fontSize: 12.5, color: '#9ca3af', lineHeight: 1.6 }}>
          {en
            ? 'Community-shared information — we never certify a place\'s religious or halal status; always verify on site.'
            : 'Information partagée par la communauté — nous ne certifions jamais le statut religieux ou halal d\'un lieu ; vérifiez toujours sur place.'}
        </p>

        <div style={{ marginTop: 18, textAlign: 'center', display: 'grid', gap: 10 }}>
          <Link href="/communaute/ajouter" style={{ display: 'inline-block', padding: '14px 24px', borderRadius: 999, background: 'var(--or)', color: '#0b1a0f', fontWeight: 900, fontSize: 15, textDecoration: 'none' }}>
            ➕ {en ? 'I also know a spot' : 'Moi aussi je connais un spot'}
          </Link>
          <Link href={`/guide-vivant/${spot.villeSlug}`} style={{ color: '#1b4332', fontWeight: 800, fontSize: 14.5, textDecoration: 'none' }}>
            📖 {en ? `Living halal guide to ${spot.villeNom} →` : `Guide vivant halal de ${spot.villeNom} →`}
          </Link>
        </div>
      </div>
    </main>
  )
}
