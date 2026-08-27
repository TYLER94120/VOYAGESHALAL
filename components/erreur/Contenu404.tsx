// 🚧 LE CONTENU DU 404.
//
// CHANTIER CACHE, 25 août. La version du 22 août lisait l'en-tête « Host »
// pour choisir sa langue. Or le 404 global fait partie de l'arbre de
// TOUTES les routes du site : cette seule lecture rendait les 117 routes
// dynamiques, donc non cachables. Mesuré en isolant le fichier — une page
// triviale passait de « ƒ » à « ○ » rien qu'en le neutralisant, et les 354
// fiches de ville de « ƒ » à « ● », fabriquées d'avance.
//
// La langue arrive donc par la propriété `lang`, posée par la route :
// app/(fr) écrit « fr », app/en écrit « en », app/(dyn) lit l'en-tête (son
// groupe est de toute façon dynamique). Aucun de ces chemins ne lit la
// requête depuis ICI.
export default function Contenu404({ lang }: { lang: 'fr' | 'en' }) {
  const isEN = lang === 'en'
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
