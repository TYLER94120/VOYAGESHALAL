import type { Ville } from '@/lib/villeTypes'
import { buildVilleFaq } from '@/lib/villeFaq'

// FAQ VISIBLE sur la page ville. Utilise la même source que le JSON-LD FAQPage
// (lib/villeFaq) → contenu affiché = contenu structuré, comme l'exige Google.
export default function VilleFaq({ ville, en = false }: { ville: Ville; en?: boolean }) {
  const faq = buildVilleFaq(ville, en)
  if (!faq.length) return null

  return (
    <section aria-labelledby="faq-title" style={{ background: 'var(--creme)', padding: '10px 18px 40px' }}>
      <div style={{ maxWidth: 820, margin: '0 auto' }}>
        <h2 id="faq-title" style={{ fontFamily: "'Playfair Display', serif", fontSize: 26, fontWeight: 900, color: 'var(--nuit)', margin: '0 0 18px' }}>
          {en ? 'Frequently asked questions' : 'Questions fréquentes'}
          <span style={{ color: 'var(--foret)' }}> — {ville.nom}</span>
        </h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {faq.map((f, i) => (
            <details key={i} style={{ background: '#fff', border: '1px solid rgba(27,67,50,0.12)', borderRadius: 14, padding: '4px 4px' }}>
              <summary style={{ cursor: 'pointer', listStyle: 'none', padding: '14px 18px', fontWeight: 700, fontSize: 16, color: 'var(--nuit)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                {f.q}
                <span aria-hidden style={{ color: 'var(--foret)', fontSize: 20, flexShrink: 0 }}>+</span>
              </summary>
              <p style={{ margin: 0, padding: '0 18px 16px', color: '#3a4740', fontSize: 15, lineHeight: 1.65 }}>{f.a}</p>
            </details>
          ))}
        </div>
      </div>
    </section>
  )
}
