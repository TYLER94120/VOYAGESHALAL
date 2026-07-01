import Link from 'next/link'
import IslamicPattern from '@/components/ui/IslamicPattern'
import BrandName from '@/components/layout/BrandName'

// Colonnes de liens, bilingues selon le domaine (FR = voyageshalal.fr, EN = gohalaltravel.com)
function getFooterLinks(en: boolean) {
  return {
    [en ? 'Destinations' : 'Destinations']: [
      { href: '/destinations', label: en ? 'All cities' : 'Toutes les villes' },
      { href: '/destinations/istanbul', label: 'Istanbul' },
      { href: '/destinations/marrakech', label: en ? 'Marrakesh' : 'Marrakech' },
      { href: '/destinations/dubai', label: en ? 'Dubai' : 'Dubaï' },
    ],
    [en ? 'Muslim tools' : 'Outils musulmans']: [
      { href: '/horaires-priere', label: en ? '🕐 Prayer times' : '🕐 Horaires de prière' },
      { href: '/qibla', label: en ? '🧭 Qibla finder' : '🧭 Calculateur Qibla' },
      { href: '/mosquee-proche', label: en ? '🕌 Nearest mosque' : '🕌 Mosquée la plus proche' },
      { href: '/omra', label: en ? '🕋 Umrah & Hajj' : '🕋 Omra & Hajj' },
    ],
    [en ? 'Resources' : 'Ressources']: [
      { href: '/blog', label: en ? 'Blog & Guides' : 'Blog & Guides' },
      { href: '/guides/voyage-halal-debutant', label: en ? 'Beginner guide' : 'Guide débutant' },
      { href: '/guides/ramadan-voyage-guide', label: en ? 'Travel during Ramadan' : 'Voyager en Ramadan' },
    ],
    [en ? 'Legal' : 'Légal']: [
      { href: '/mentions-legales', label: en ? 'Legal notice' : 'Mentions légales' },
      { href: '/confidentialite', label: en ? 'Privacy' : 'Confidentialité' },
      { href: '/contact', label: 'Contact' },
    ],
  }
}

export default function Footer({ brandEN = false }: { brandEN?: boolean }) {
  const en = brandEN
  const footerLinks = getFooterLinks(en)
  return (
    <footer style={{ backgroundColor: '#0b1a0f' }} className="site-footer relative overflow-hidden text-white/70">
      <IslamicPattern opacity={0.06} />
      <div className="relative z-10 text-center pt-12 pb-2">
        <p className="font-arabic text-2xl sm:text-3xl mb-1" style={{ color: '#c9a84c' }} dir="rtl">
          بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ
        </p>
        <p className="text-xs text-white/40">
          {en ? 'In the name of Allah, the Most Gracious, the Most Merciful' : "Au nom d'Allah, le Tout Miséricordieux, le Très Miséricordieux"}
        </p>
      </div>
      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-5">
              <span style={{ color: '#c9a84c' }} className="text-lg">◆</span>
              <span className="font-bold text-base tracking-widest text-white uppercase">
                <BrandName isEN={en} />
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-white/50">
              {en ? 'Your trusted guide for halal travel worldwide.' : 'Votre guide de confiance pour voyager halal dans le monde entier.'}
            </p>
            <div className="mt-6 flex gap-3">
              {['🇫🇷 FR', '🇬🇧 EN'].map((lang) => (
                <span key={lang} className="text-xs text-white/40 hover:text-white/70 cursor-pointer transition-colors">
                  {lang}
                </span>
              ))}
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-white text-sm uppercase tracking-widest mb-5">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link
                      href={link.href}
                      className="text-sm text-white/50 hover:text-white transition-colors"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-xs text-white/30">
            © {new Date().getFullYear()} <BrandName isEN={en} /> — {en ? 'All rights reserved · Photos:' : 'Tous droits réservés · Photos :'}{' '}
            <a href="https://unsplash.com" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 underline">Unsplash</a> &amp;{' '}
            <a href="https://commons.wikimedia.org" target="_blank" rel="noopener noreferrer" className="hover:text-white/60 underline">Wikimedia</a>
          </p>
          <p className="text-xs text-white/30">
            {en ? 'Made with ♥ for Muslim travelers around the world' : 'Fait avec ♥ pour les voyageurs musulmans du monde entier'}
          </p>
        </div>
      </div>
    </footer>
  )
}
