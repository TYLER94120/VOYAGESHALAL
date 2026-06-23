import Link from 'next/link'

const footerLinks = {
  Destinations: [
    { href: '/destinations/istanbul', label: 'Istanbul' },
    { href: '/destinations/marrakech', label: 'Marrakech' },
    { href: '/destinations/dubai', label: 'Dubaï' },
    { href: '/destinations/kuala-lumpur', label: 'Kuala Lumpur' },
    { href: '/destinations/le-caire', label: 'Le Caire' },
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
}

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-4">
              <span className="text-2xl">🌙</span>
              <span className="font-bold text-xl text-white">Voyages<span className="text-emerald-400">Halal</span></span>
            </Link>
            <p className="text-sm leading-relaxed text-gray-500">Votre guide de confiance pour voyager halal dans le monde entier.</p>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-white mb-4">{category}</h3>
              <ul className="space-y-2">
                {links.map((link) => (
                  <li key={link.href}>
                    <Link href={link.href} className="text-sm hover:text-emerald-400 transition-colors">{link.label}</Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 pt-8 border-t border-gray-800 flex flex-col sm:flex-row justify-between items-center gap-4">
          <p className="text-sm text-gray-600">© {new Date().getFullYear()} VoyagesHalal.fr — Tous droits réservés</p>
          <div className="flex gap-6 text-sm">
            <Link href="/mentions-legales" className="hover:text-emerald-400 transition-colors">Mentions légales</Link>
            <Link href="/confidentialite" className="hover:text-emerald-400 transition-colors">Confidentialité</Link>
            <Link href="/contact" className="hover:text-emerald-400 transition-colors">Contact</Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
