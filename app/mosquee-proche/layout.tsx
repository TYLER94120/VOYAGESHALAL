import type { Metadata } from 'next'
import { getDomainSEO } from '@/lib/domain'

// /mosquee-proche est un composant client : ce layout serveur porte ses
// métadonnées, avec le bon slug EN (/mosque-near-me) sur le domaine anglais.
export async function generateMetadata(): Promise<Metadata> {
  const { isEN, siteUrl } = await getDomainSEO()
  return {
    title: isEN ? 'Nearest mosque — Find a mosque around you' : 'Mosquée la plus proche — Trouvez une mosquée autour de vous',
    description: isEN
      ? 'Find the nearest mosque anywhere in the world in seconds, with directions and prayer times. Free, based on OpenStreetMap data.'
      : "Trouvez la mosquée la plus proche partout dans le monde en quelques secondes, avec itinéraire et horaires de prière. Gratuit, basé sur les données OpenStreetMap.",
    alternates: {
      canonical: `${siteUrl}${isEN ? '/mosque-near-me' : '/mosquee-proche'}`,
      languages: {
        fr: 'https://www.voyageshalal.fr/mosquee-proche',
        en: 'https://www.gohalaltravel.com/mosque-near-me',
        'x-default': 'https://www.gohalaltravel.com/mosque-near-me',
      },
    },
  }
}

export default function MosqueeProcheLayout({ children }: { children: React.ReactNode }) {
  return children
}
