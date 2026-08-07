// Bouton flottant « Une question halal ? » — le pont vers HalalGPT.
// FR (voyageshalal.fr) → halalgpt.fr ; EN (gohalaltravel.com) → /halalgpt.
// Positionné nettement au-dessus de la BottomNav mobile (~53px + safe-area,
// marge visible incluse), sous ses
// panneaux (zIndex 98-99) pour ne jamais les recouvrir.
export default function HalalGPTFab({ en = false }: { en?: boolean }) {
  const href = en ? '/halalgpt' : 'https://halalgpt.fr'
  const label = en ? 'A halal question?' : 'Une question halal ?'
  return (
    <a
      href={href}
      className="fixed right-4 md:right-6 bottom-[calc(88px+env(safe-area-inset-bottom,0px))] md:bottom-6 flex items-center gap-2 min-h-[52px] px-5 rounded-full font-bold text-[15px] transition-transform hover:scale-105"
      style={{
        zIndex: 90,
        backgroundColor: '#c9a84c',
        color: '#0b1a0f',
        boxShadow: '0 8px 24px rgba(11,26,15,0.45), 0 0 0 1px rgba(11,26,15,0.15)',
      }}
      aria-label={label}
    >
      <span className="text-xl" aria-hidden>
        🌙
      </span>
      <span>{label}</span>
    </a>
  )
}
