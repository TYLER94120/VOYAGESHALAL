'use client'

// 🧭 LE VERDICT D'ARRIVÉE — la première chose qu'on lit sur une destination.
//
// Ordre de Mohamed, 15 août : « Personne n'arrive sur cette page en se
// demandant combien d'hôtels il y a. La vraie question, c'est : est-ce que
// ce voyage est fait pour nous, en tant que musulmans ? »
//
// Le HalalScore ne se contente plus d'être un chiffre posé sur une photo :
// il est DÉCOMPOSÉ. Trois indicateurs — manger, prier, alcool — et sous
// chacun, la phrase qui dit sur quoi la note repose. Une note inconnue
// s'affiche « pas assez de relevés » : jamais un chiffre rassurant inventé.
//
// Tout ce qui est écrit ici vient de lib/verdictVille.mjs, calculé à partir
// de nos propres données. Aucun appel réseau, aucun texte généré.

import type { Indicateurs } from '@/lib/verdictVille.mjs'

const LIBELLE: Record<string, { titre: string; icone: string }> = {
  manger: { titre: 'Manger halal', icone: '🍽' },
  prier: { titre: 'Prier', icone: '🕌' },
  vigilance: { titre: 'Points de vigilance', icone: '⚠️' },
}

function couleur(n: number | null) {
  if (n == null) return 'rgba(253,250,243,0.35)'
  if (n >= 8) return '#3BD17A'
  if (n >= 6) return '#C9A84C'
  return '#E08A5A'
}

export default function VerdictArrivee({
  phrases,
  ind,
  score,
}: {
  phrases: string[]
  ind: Indicateurs
  score: number | null
}) {
  return (
    <section
      aria-label="Ce que vaut cette destination pour un voyageur musulman"
      style={{
        background: 'rgba(253,250,243,0.05)',
        border: '1px solid rgba(201,168,76,0.35)',
        borderRadius: 18,
        padding: '18px 18px 16px',
        maxWidth: 700,
        margin: '0 auto 18px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
        <span style={{ color: 'var(--or)', fontSize: 11, fontWeight: 700, letterSpacing: '1.6px', textTransform: 'uppercase' }}>
          Est-ce fait pour nous ?
        </span>
        {score != null && (
          <span style={{ color: 'var(--or-clair)', fontSize: 13, fontWeight: 800 }}>HalalScore {score}/10</span>
        )}
      </div>

      {phrases.map((p) => (
        <p key={p} style={{ color: 'rgba(253,250,243,0.86)', fontSize: '14.5px', lineHeight: 1.65, margin: '0 0 8px' }}>
          {p}
        </p>
      ))}

      {/* La décomposition : chaque note porte sa raison, sur la même ligne
          que la note. On ne cache rien derrière un clic. */}
      <div style={{ marginTop: 12, display: 'grid', gap: 10 }}>
        {(['manger', 'prier', 'vigilance'] as const).map((cle) => {
          const i = ind[cle]
          return (
            <div key={cle} style={{ display: 'flex', gap: 10, alignItems: 'flex-start' }}>
              <span
                style={{
                  flex: '0 0 auto', minWidth: 46, textAlign: 'center',
                  background: 'rgba(11,26,15,0.35)', border: `1px solid ${couleur(i.note)}`,
                  borderRadius: 9, padding: '4px 6px', fontSize: 12.5, fontWeight: 800,
                  color: couleur(i.note),
                }}
              >
                {i.note == null ? '—' : `${i.note}/10`}
              </span>
              <span style={{ color: 'rgba(253,250,243,0.72)', fontSize: '13px', lineHeight: 1.5 }}>
                <strong style={{ color: 'rgba(253,250,243,0.92)' }}>{LIBELLE[cle].icone} {LIBELLE[cle].titre}</strong> — {i.note == null ? `pas assez de relevés : ${i.sur}` : i.sur}
              </span>
            </div>
          )
        })}
      </div>
      {/* La clause de prudence ferme le bloc — elle vaut pour toute la page. */}
      <p style={{ color: 'rgba(253,250,243,0.5)', fontSize: '12px', lineHeight: 1.5, margin: '12px 0 0' }}>
        Nous ne certifions aucun établissement individuellement : chaque adresse porte sa source, et ce qui n&apos;est pas
        vérifié est écrit comme tel.
      </p>
    </section>
  )
}
