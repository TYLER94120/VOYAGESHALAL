// Bouton flottant « Question halal ? » — le pont vers HalalGPT.
// FR (voyageshalal.fr) → halalgpt.fr ; EN (gohalaltravel.com) → /halalgpt.
//
// Discret par construction : il flotte au-dessus du contenu en permanence,
// donc il doit rester DISPONIBLE sans jamais dominer. Fond nuit translucide
// + fin contour or (et non un aplat doré, qui criait plus fort que la tuile
// de prière), libellé court, largeur ~2 fois moindre. Il garde son texte
// (jamais d'icône seule) et une cible de frappe de 48 px.
//
// Positionné au-dessus du dock flottant ET de sa pastille ➕ surélevée
// (le ➕ culmine à ~95 px du bas : 108 px laisse une marge visible), sous
// ses panneaux (zIndex 98-99) pour ne jamais les recouvrir.
export default function HalalGPTFab({ en = false }: { en?: boolean }) {
  const href = en ? '/halalgpt' : 'https://halalgpt.fr'
  const label = en ? 'Halal question?' : 'Question halal ?'
  return (
    <a
      href={href}
      className="fixed right-3 md:right-6 bottom-[calc(108px+env(safe-area-inset-bottom,0px))] md:bottom-6 inline-flex items-center gap-1.5 min-h-[48px] px-3.5 rounded-full font-bold text-[13px] transition-transform hover:scale-105"
      style={{
        zIndex: 90,
        backgroundColor: 'rgba(11,26,15,0.92)',
        WebkitBackdropFilter: 'blur(8px)',
        backdropFilter: 'blur(8px)',
        border: '1px solid rgba(201,168,76,0.55)',
        color: '#c9a84c',
        boxShadow: '0 6px 18px rgba(0,0,0,0.4)',
      }}
      aria-label={label}
    >
      <span className="text-base" aria-hidden>
        🌙
      </span>
      <span>{label}</span>
    </a>
  )
}
