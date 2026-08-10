'use client'

import SaveButton from '@/components/ui/SaveButton'
import { favId } from '@/lib/favorites'

// ⭐ « GARDE CETTE ADRESSE » — posé sur les articles « où prier ».
//
// Ces pages sont notre porte d'entrée : /blog/ou-prier-disneyland-paris
// fait à elle seule 22 des 24 clics du site. Le visiteur lit, il repart, on
// ne le revoit plus. Ce qui le ferait revenir, ce n'est pas nous : c'est
// l'adresse qu'il a gardée ici, et qu'il rouvre le jour du départ, dans la
// file d'attente, sans réseau (tout vit dans localStorage).
//
// RÈGLE INTOUCHABLE respectée : on ne garde QUE ce que l'article documente
// déjà. Aucune salle de prière n'est inventée, et le libellé reprend mot
// pour mot ce que dit le guide (« sur demande », « pas de salle
// officielle »).

interface Lieu {
  /** nom gardé dans le carnet — fidèle à ce que dit l'article */
  nom: string
  /** ville de rangement dans le carnet */
  ville: string
  /** précision affichée sous le bouton, jamais une promesse */
  precision: string
}

const LIEUX: Record<string, Lieu> = {
  'ou-prier-disneyland-paris': {
    nom: 'Prier à Disneyland Paris — City Hall (sur demande)',
    ville: 'Disneyland Paris',
    precision: 'City Hall, à gauche après les portes du parc Disneyland. Espace calme accessible sur demande à un Cast Member.',
  },
  'ou-prier-parc-asterix': {
    nom: 'Prier au Parc Astérix — demander un espace calme',
    ville: 'Parc Astérix',
    precision: 'Pas de salle officielle à notre connaissance : demander un endroit calme à l’accueil.',
  },
  'ou-prier-puy-du-fou': {
    nom: 'Prier au Puy du Fou — coin calme entre les spectacles',
    ville: 'Puy du Fou',
    precision: 'Pas de salle officielle à notre connaissance : sous-bois et allées secondaires, ou demander au personnel.',
  },
  // Version anglaise de la page d'entrée (gohalaltravel.com)
  'where-to-pray-disneyland-paris': {
    nom: 'Praying at Disneyland Paris — City Hall (on request)',
    ville: 'Disneyland Paris',
    precision: 'City Hall, on your left after the Disneyland Park entrance. A quiet space is offered on request to a Cast Member.',
  },
  'ou-prier-futuroscope': {
    nom: 'Prier au Futuroscope — demander un espace calme',
    ville: 'Futuroscope',
    precision: 'Pas de salle officielle à notre connaissance : demander un endroit calme à l’accueil.',
  },
}

// Guides pratiques qu'on garde comme une fiche de terrain : on les rouvre
// au restaurant, dans la rue, souvent sans réseau.
const GUIDES_A_GARDER = new Set([
  'dire-sans-porc-sans-alcool-langues',
  'restaurant-vraiment-halal-verifier',
  'aucun-restaurant-halal-que-faire',
  'no-pork-no-alcohol-in-12-languages',
  'is-this-restaurant-really-halal',
  'no-halal-restaurant-what-to-eat',
  'repas-halal-avion-moml',
  'ablutions-avion-train',
  'heure-priere-avion-fuseaux',
  'voile-controle-securite-aeroport',
  'toilettes-sans-douchette-voyage',
])

export default function GarderSpot({ slug, titre, en = false }: { slug: string; titre: string; en?: boolean }) {
  // Repli pour les autres guides « où prier » (aéroports, gares, centres
  // commerciaux…) : on garde LE GUIDE, sans nommer un lieu qu'on n'a pas
  // documenté ici. Jamais d'adresse inventée pour remplir un encadré.
  const lieu: Lieu | undefined = LIEUX[slug] ?? (slug.startsWith('ou-prier-') || slug.startsWith('where-to-pray-') || GUIDES_A_GARDER.has(slug)
    ? { nom: titre, ville: '', precision: en ? 'This guide stays in your notebook, readable offline.' : 'Ce guide reste dans ton carnet, consultable hors ligne.' }
    : undefined)
  if (lieu === undefined) return null

  const disneyland = slug === 'ou-prier-disneyland-paris' || slug === 'where-to-pray-disneyland-paris'

  return (
    <div style={{ marginTop: 30, background: 'var(--nuit)', borderRadius: 20, padding: '20px 22px', color: '#fdfaf3' }}>
      <p style={{ fontFamily: "'Playfair Display', serif", fontWeight: 900, fontSize: 19, margin: '0 0 6px', color: '#fff' }}>
        ⭐ {GUIDES_A_GARDER.has(slug)
          ? (en ? 'Keep this guide' : 'Garde cette fiche')
          : (en ? 'Keep this address' : 'Garde cette adresse')}
      </p>
      <p style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(253,250,243,0.72)', margin: '0 0 14px' }}>
        {en
          ? 'Saved on your phone, available on the day — even with no signal. No account, nothing to sign up for.'
          : 'Enregistrée sur ton téléphone, tu la retrouveras le jour J — même sans réseau. Sans compte, sans inscription.'}
      </p>

      <SaveButton
        en={en}
        variante="plein"
        fav={{
          id: favId('spot', slug),
          kind: 'spot',
          nom: lieu.nom,
          villeNom: lieu.ville || undefined,
          href: `/blog/${slug}`,
        }}
      />

      <p style={{ fontSize: 12.5, lineHeight: 1.6, color: 'rgba(253,250,243,0.55)', margin: '12px 0 0' }}>
        ℹ️ {lieu.precision}
      </p>

      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 16 }}>
        <a
          href="/communaute/ajouter"
          style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, padding: '0 16px', borderRadius: 999, border: '1px solid rgba(201,168,76,0.4)', color: 'var(--or-clair)', fontSize: 13.5, fontWeight: 700, textDecoration: 'none' }}
        >
          ➕ {en ? 'You know a spot we missed? Add it' : 'Tu connais un coin qu’on n’a pas listé ? Ajoute-le'}
        </a>
        {disneyland && (
          <a
            href="https://halalgpt.fr/questions?utm_source=voyageshalal&utm_medium=passerelle&utm_campaign=disneyland"
            target="_blank"
            rel="noopener noreferrer"
            style={{ display: 'inline-flex', alignItems: 'center', minHeight: 44, padding: '0 16px', borderRadius: 999, border: '1px solid rgba(201,168,76,0.4)', color: 'var(--or-clair)', fontSize: 13.5, fontWeight: 700, textDecoration: 'none' }}
          >
            💬 {en ? 'A question about praying while travelling?' : 'Une question sur la prière en voyage ?'}
          </a>
        )}
      </div>
    </div>
  )
}
