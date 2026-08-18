// Bouton flottant vers HalalGPT — devenu PASTILLE DISCRÈTE le 15 août.
// Mohamed, capture à l'appui : la pilule dorée « Question halal ? »
// flottait en plein milieu du contenu et cassait la lecture (« vaut mieux
// l'enlever ou le mettre dans un coin très discret »). Elle devient un
// petit disque 🌙 de 44 px, collé au bord droit au-dessus du dock :
// fond sombre, liseré or — repérable pour qui le cherche, invisible pour
// qui lit. L'accessibilité garde le libellé complet (aria-label).
//
// (Reposé le 15 août pour déclencher le build que Vercel avait manqué.)
// Ancré sur la GÉOMÉTRIE DU DOCK (leçon des premières versions) :
//   dock 10px + hauteur 62px + débord ➕ 30px + marge 12px = 114px + safe-area.
// zIndex 90 : sous les panneaux du dock (98-99), jamais par-dessus.
'use client'
import { usePathname } from 'next/navigation'

export default function HalalGPTFab({ en = false }: { en?: boolean }) {
  // Sur le flux plein écran /spots, chaque pixel du bas droit appartient au
  // rail et au CTA Itinéraire : la pastille s'efface plutôt que de les
  // recouvrir (elle reste partout ailleurs).
  const pathname = usePathname()
  if (pathname?.startsWith('/spots')) return null
  const href = en ? '/halalgpt' : 'https://halalgpt.fr?utm_source=voyageshalal&utm_medium=passerelle&utm_campaign=bouton-flottant'
  const label = en ? 'Halal question? Ask HalalGPT' : 'Question halal ? Demander à HalalGPT'
  return (
    <a
      href={href}
      className="fixed right-3 md:right-6 bottom-[calc(114px+env(safe-area-inset-bottom,0px))] md:bottom-6 inline-flex items-center justify-center rounded-full transition-transform hover:scale-105 active:scale-95"
      style={{
        zIndex: 90,
        width: 44, height: 44,
        background: 'rgba(11,26,15,0.85)',
        border: '1.5px solid rgba(201,168,76,0.65)',
        boxShadow: '0 3px 10px rgba(0,0,0,0.35)',
      }}
      aria-label={label}
      title={label}
    >
      <span className="text-lg leading-none" aria-hidden>🌙</span>
    </a>
  )
}
