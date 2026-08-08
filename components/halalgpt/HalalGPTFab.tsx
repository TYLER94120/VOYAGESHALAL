// Bouton flottant « Question halal ? » — le pont vers HalalGPT.
// FR (voyageshalal.fr) → halalgpt.fr ; EN (gohalaltravel.com) → /halalgpt.
//
// Petit mais bien visible : doré (on le repère du coin de l'œil), et
// surtout descendu dans l'espace libre SOUS les horaires du jour — avant,
// il recouvrait Maghrib et Isha, ce qui est inacceptable sur un site de
// prière. Largeur bornée à 140 px pour laisser passer la pastille ➕ du
// dock, qui est centrée. Il garde son texte (jamais d'icône seule).
//
// Géométrie mesurée (écran 375 x 812) : les horaires s'arrêtent à y=691,
// le dock commence à y=734, et la pastille ➕ occupe x 160-215. Ce bouton
// se loge pile dans ce couloir : 78 px du bas, 42 px de haut, largeur
// bornée à 140 px et aligné à droite — il ne recouvre plus rien.
// zIndex 90 : sous les panneaux du dock (98-99), jamais par-dessus.
export default function HalalGPTFab({ en = false }: { en?: boolean }) {
  const href = en ? '/halalgpt' : 'https://halalgpt.fr'
  const label = en ? 'Halal question?' : 'Question halal ?'
  return (
    <a
      href={href}
      className="fixed right-3 md:right-6 bottom-[calc(78px+env(safe-area-inset-bottom,0px))] md:bottom-6 inline-flex items-center gap-1 h-[42px] px-2.5 rounded-full font-extrabold text-[12px] whitespace-nowrap transition-transform hover:scale-105"
      style={{
        zIndex: 90,
        maxWidth: 140,
        backgroundColor: '#c9a84c',
        color: '#0b1a0f',
        boxShadow: '0 6px 18px rgba(0,0,0,0.45), 0 0 0 1px rgba(11,26,15,0.2)',
      }}
      aria-label={label}
    >
      <span className="text-sm" aria-hidden>
        🌙
      </span>
      <span>{label}</span>
    </a>
  )
}
