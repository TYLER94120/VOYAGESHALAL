'use client'
import { useState } from 'react'
import GuideCard from '@/components/ui/GuideCard'

// Grille des guides — meme regle que le blog : la page ne doit pas etre un
// mur (12,4 ecrans mesures), mais on ne retire RIEN du HTML. Tous les
// guides sont rendus (liens internes intacts pour Google) et le surplus est
// simplement masque jusqu'au clic.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function GuidesGrid({ guides, en = false }: { guides: any[]; en?: boolean }) {
  const PAR_LOT = 9
  const [visibles, setVisibles] = useState(PAR_LOT)
  const reste = Math.max(0, guides.length - visibles)

  return (
    <>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {guides.map((guide, i) => (
          <div key={guide.slug} style={i < visibles ? undefined : { display: 'none' }}>
            <GuideCard guide={guide} />
          </div>
        ))}
      </div>
      {reste > 0 && (
        <div style={{ textAlign: 'center', marginTop: 28 }}>
          <button
            onClick={() => setVisibles((v) => v + PAR_LOT)}
            style={{ minHeight: 56, padding: '0 26px', borderRadius: 16, cursor: 'pointer', border: '2px solid rgba(27,67,50,0.25)', background: '#fff', color: 'var(--foret)', fontWeight: 800, fontSize: 15.5 }}
          >
            {en
              ? `Show ${Math.min(reste, PAR_LOT)} more guides (${reste} left)`
              : `Voir ${Math.min(reste, PAR_LOT)} guides de plus (${reste} restants)`}
          </button>
        </div>
      )}
    </>
  )
}
