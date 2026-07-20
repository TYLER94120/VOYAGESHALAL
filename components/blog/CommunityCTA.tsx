import Link from 'next/link'
import { cityEn } from '@/lib/poiI18n'

// Encart communauté en pied de CHAQUE article : le blog nourrit la communauté.
// Si l'article parle d'une ville, le lien d'ajout est pré-rempli et on propose
// aussi la fiche ville correspondante.
export default function CommunityCTA({ en = false, city }: { en?: boolean; city?: { slug: string; nom: string } | null }) {
  const ajouterHref = city ? `/communaute/ajouter?ville=${encodeURIComponent(city.slug)}` : '/communaute/ajouter'
  const nom = city ? cityEn(city.nom, en) : ''
  return (
    <section style={{ marginTop: 40, background: 'var(--nuit, #0B1A0F)', borderRadius: 20, padding: '26px 22px', textAlign: 'center' }}>
      <p style={{ fontSize: 30, margin: '0 0 8px' }}>🤲</p>
      <p style={{ fontFamily: "'Playfair Display', Georgia, serif", color: '#fdfaf3', fontSize: 20, fontWeight: 800, margin: '0 0 6px', lineHeight: 1.35 }}>
        {en
          ? <>Know a good spot{city ? ` in ${nom}` : ''}?</>
          : <>Tu connais un bon spot{city ? ` à ${nom}` : ' ici'} ?</>}
      </p>
      <p style={{ color: 'rgba(253,250,243,0.65)', fontSize: 14.5, lineHeight: 1.6, margin: '0 0 16px' }}>
        {en
          ? 'A halal restaurant, a prayer corner, a hidden gem — share it and keep helping travelers after you, in shā’ Allāh.'
          : 'Un resto halal, un coin prière, une pépite — partage-le et continue d\'aider les voyageurs après toi, in shā’ Allāh.'}
      </p>
      <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
        <Link href={ajouterHref} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 52, padding: '0 22px', borderRadius: 999, background: 'var(--or, #C9A84C)', color: '#0b1a0f', fontWeight: 900, fontSize: 15, textDecoration: 'none' }}>
          ➕ {en ? 'Share it with the community' : 'Partage-le à la communauté'}
        </Link>
        {city && (
          <Link href={`/destinations/${city.slug}`} style={{ display: 'inline-flex', alignItems: 'center', gap: 8, minHeight: 52, padding: '0 22px', borderRadius: 999, border: '1.5px solid rgba(201,168,76,0.55)', color: '#fdfaf3', fontWeight: 700, fontSize: 15, textDecoration: 'none' }}>
            🏙 {en ? `${nom} halal guide →` : `Guide halal ${city.nom} →`}
          </Link>
        )}
      </div>
    </section>
  )
}
