// Bouton flottant « Question halal ? » — le pont vers HalalGPT.
// FR (voyageshalal.fr) → halalgpt.fr ; EN (gohalaltravel.com) → /halalgpt.
//
// LECON : les premieres versions calaient sa hauteur sur des pixels releves
// sur UN seul ecran. Sur un telephone plus grand, il retombait sur le dock —
// deux formes dorees qui se percutent. Il est donc desormais ancre sur la
// GEOMETRIE DU DOCK, pas sur un vide suppose :
//
//   dock : bottom 10px + safe-area, hauteur ~62px
//   pastille ➕ : deborde de 30px au-dessus du dock
//   marge de respiration : 12px
//   => 10 + 62 + 30 + 12 = 114px + safe-area
//
// Il passe ainsi au-dessus du dock ET de sa pastille sur tous les formats.
// Taille contenue (44px de haut, 150px max) et or plein : petit mais
// reperable. Il garde son texte — jamais une icone seule.
// zIndex 90 : sous les panneaux du dock (98-99), jamais par-dessus.
export default function HalalGPTFab({ en = false }: { en?: boolean }) {
  const href = en ? '/halalgpt' : 'https://halalgpt.fr'
  const label = en ? 'Halal question?' : 'Question halal ?'
  return (
    <a
      href={href}
      className="fixed right-3 md:right-6 bottom-[calc(114px+env(safe-area-inset-bottom,0px))] md:bottom-6 inline-flex items-center gap-1.5 h-11 px-3.5 rounded-full font-extrabold text-[12.5px] whitespace-nowrap transition-transform hover:scale-105 active:scale-95"
      style={{
        zIndex: 90,
        maxWidth: 150,
        background: 'linear-gradient(145deg, #d8b95e, #c9a84c)',
        color: '#0b1a0f',
        // liseré sombre + ombre portée : le bouton se détache du fond sans
        // écraser le contenu qu'il survole
        boxShadow: '0 4px 14px rgba(0,0,0,0.4), 0 0 0 1.5px rgba(11,26,15,0.35)',
      }}
      aria-label={label}
    >
      <span className="text-sm leading-none" aria-hidden>
        🌙
      </span>
      <span>{label}</span>
    </a>
  )
}
