import Link from 'next/link'

const footerLinks = {
  Destinations: [
    { href: '/destinations/istanbul', label: 'Istanbul' },
    { href: '/destinations/marrakech', label: 'Marrakech' },
    { href: '/destinations/dubai', label: 'Dubaï' },
    { href: '/destinations/kuala-lumpur', label: 'Kuala Lumpur' },
    { href: '/destinations/le-caire', label: 'Le Caire' },
    { href: '/destinations/medine', label: 'Médine' },
  ],
  Guides: [
    { href: '/guides/voyage-halal-debutant', label: 'Guide débutant' },
    { href: '/guides/top-destinations-halal-2026', label: 'Top destinations 2026' },
    { href: '/guides/ramadan-voyage-guide', label: 'Voyager en Ramadan' },
  ],
  Application: [
    { href: '/application', label: "Télécharger l'app" },
    { href: '/application#fonctionnalites', label: 'Fonctionnalités' },
    { href: '/application#qibla', label: 'Boussole Qibla' },
  ],
  Légal: [
    { href: '/mentions-legales', label: 'Mentions légales' },
    { href: '/confidentialite', label: 'Confidentialité' },
    { href: '/contact', label: 'Contact' },
  ],
}

export default function Footer() {
  return (
    <footer style={{ backgroundColor: '#1a3a2a' }} className="text-white/70">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-12">
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 mb-5">
              <span style={{ color: '#c9a870' }} className="text-lg">◆</span>
              <span className="font-bold text-base tracking-widest text-white uppercase">
                Voyages<span style={{ color: '#c9a870' }}>Halal</span>
              </span>
            </Link>
            <p className="text-sm leading-relaxed text-white/50">
              Votre guide de confiance pour voyager halal dans le monde entier.
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
            © {new Date().getFullYear()} VoyagesHalal.fr — Tous droits réservés
          </p>
          <p className="text-xs text-white/30">
            Fait avec ♥ pour les voyageurs musulmans du monde entier
          </p>
        </div>
      </div>
    </footer>
  )
}
