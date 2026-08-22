import type { Metadata } from 'next'
import { getDomainSEO } from '@/lib/domain'

// 🚧 LA PAGE QUI N'EXISTE PAS — mais qui doit quand même mener quelque part.
//
// Mohamed, 22 août, capture à l'appui : gohalaltravel.com/accueil-gohalal-travel
// rend « 404 · This page could not be found. » — le 404 d'usine de Next.js.
// Une page blanche avec une barre verticale, en anglais sur les DEUX
// domaines, et aucun lien : ni retour, ni suggestion, ni recherche.
//
// Ce n'est pas un cas de bord. Vingt et une routes du site appellent
// `notFound()` : une ville inconnue, un spot retiré, un article renommé, un
// plan expiré. Chacune amenait ici, c'est-à-dire nulle part. C'est
// exactement la règle « un bouton sans destination n'existe pas », vue de
// l'autre côté : une adresse sans issue n'existe pas non plus.
//
// ⚠️ Ce que cette page ne fait PAS : deviner ce que la personne cherchait.
// L'adresse tapée peut être n'importe quoi ; proposer « vous vouliez sans
// doute Istanbul ? » serait inventer. On dit ce qu'on sait — la page
// n'existe pas — et on donne les vraies portes d'entrée du site.

export const metadata: Metadata = {
  // Sans ce titre, l'onglet portait celui de l'accueil — « Halal Travel
  // Guide 2026… » — sur une page qui n'existe pas. Vérifié dans le HTML
  // servi, pas supposé.
  title: { absolute: 'Page introuvable · Page not found' },
  // Une page d'erreur n'a rien à faire dans l'index de Google. `follow`
  // reste : les liens ci-dessous doivent continuer à faire circuler.
  robots: { index: false, follow: true },
}

export default async function PageIntrouvable() {
  const { isEN } = await getDomainSEO()
  const t = (fr: string, en: string) => (isEN ? en : fr)

  // Uniquement des routes qui existent sur ce domaine — une page d'erreur
  // qui renvoie vers une autre erreur serait pire que rien.
  const portes = isEN
    ? [
        { href: '/', titre: 'Home', sous: 'The world feed, city by city' },
        { href: '/spots', titre: 'Spots', sous: 'Places travellers vouch for' },
        { href: '/destinations', titre: 'Destinations', sous: '354 cities in the guide' },
        { href: '/guides', titre: 'Guides', sous: 'Trip guides, city by city' },
        { href: '/blog', titre: 'Blog', sous: 'What we publish' },
      ]
    : [
        { href: '/', titre: 'Accueil', sous: 'Le point de départ' },
        { href: '/autour-de-moi', titre: 'Autour de moi', sous: 'Prier, manger, visiter — près d’ici' },
        { href: '/destinations', titre: 'Destinations', sous: '354 villes dans le guide' },
        { href: '/guides', titre: 'Guides', sous: 'Les guides de voyage, ville par ville' },
        { href: '/blog', titre: 'Blog', sous: 'Ce qu’on publie' },
      ]

  return (
    <main style={{
      minHeight: '70svh', background: '#060E08', color: '#FDFAF3',
      padding: '56px 20px 72px',
    }}>
      <div style={{ maxWidth: 560, margin: '0 auto' }}>
        <p style={{
          fontSize: 12.5, letterSpacing: '.2em', textTransform: 'uppercase',
          color: 'rgba(253,250,243,.45)', margin: 0,
        }}>404</p>

        <h1 style={{
          fontFamily: "'Playfair Display', Georgia, serif", fontSize: 34, lineHeight: 1.1,
          fontWeight: 700, margin: '10px 0 0',
        }}>
          {t('Cette page n’existe pas', 'This page does not exist')}
        </h1>

        <p style={{ fontSize: 16, lineHeight: 1.6, color: 'rgba(253,250,243,.8)', margin: '14px 0 0' }}>
          {t(
            'Soit l’adresse comporte une erreur, soit la page a été retirée. Le reste du site fonctionne — voici par où reprendre.',
            'Either the address has a typo, or the page was removed. The rest of the site works — here is where to pick up.',
          )}
        </p>

        <nav style={{ marginTop: 28, display: 'flex', flexDirection: 'column', gap: 10 }}
          aria-label={t('Reprendre ici', 'Pick up here')}>
          {portes.map((p) => (
            <a key={p.href} href={p.href} style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
              minHeight: 64, padding: '0 20px', borderRadius: 16,
              background: 'rgba(253,250,243,.04)', border: '1px solid rgba(201,168,76,.22)',
              color: '#FDFAF3', textDecoration: 'none',
            }}>
              <span>
                <span style={{ fontSize: 16.5, fontWeight: 700 }}>{p.titre}</span>
                <span style={{ display: 'block', fontSize: 13.5, color: 'rgba(253,250,243,.55)', fontWeight: 400 }}>{p.sous}</span>
              </span>
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#C9A84C" strokeWidth="2"
                strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="m9 6 6 6-6 6" /></svg>
            </a>
          ))}
        </nav>

        <p style={{ fontSize: 14, lineHeight: 1.6, color: 'rgba(253,250,243,.5)', margin: '26px 0 0' }}>
          {t('Cette adresse devrait exister ? ', 'This address should exist? ')}
          <a href="/contact" style={{ color: '#E9D9A6' }}>{t('Dis-le-nous', 'Tell us')}</a>.
        </p>
      </div>
    </main>
  )
}
