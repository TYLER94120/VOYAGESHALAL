import type { Metadata, Viewport } from 'next'
import { DM_Sans, Playfair_Display } from 'next/font/google'
import Coque from '@/components/layout/Coque'
import '../globals.css'
import '../../styles/animations.css'
import { DEFAULT_DESCRIPTION, EN_DESCRIPTION as EN_DEFAULT_DESCRIPTION } from '@/lib/seo'
import { getDomainSEO } from '@/lib/domain'

const dmSans = DM_Sans({ subsets: ['latin'], variable: '--font-inter' })
const playfair = Playfair_Display({ subsets: ['latin'], variable: '--font-playfair' })

export async function generateMetadata(): Promise<Metadata> {
  const { isEN, brand, siteUrl } = await getDomainSEO()
  return {
    metadataBase: new URL(siteUrl),
    // Google coupe un titre vers 60 caracteres. Les deux titres par defaut
    // faisaient 81 et 84 : la fin utile etait tronquee. Le suffixe de marque
    // du template coutait 15 a 19 caracteres sur CHAQUE page — il disparait,
    // les pages qui veulent la marque la mettent elles-memes.
    title: isEN
      ? {
          default: 'Halal Travel Guide 2026 — Restaurants, Mosques, Prayer',
          template: '%s',
        }
      : {
          default: 'Guide Voyage Halal 2026 — Restaurants, Mosquées, Prière',
          template: '%s',
        },
    description: isEN ? EN_DEFAULT_DESCRIPTION : DEFAULT_DESCRIPTION,
    authors: [{ name: brand }],
    creator: brand,
    openGraph: {
      type: 'website',
      locale: isEN ? 'en_US' : 'fr_FR',
      siteName: brand,
      images: [{ url: 'https://images.unsplash.com/photo-1524231757912-21f4fe3a7200?w=1200&h=630&fit=crop&q=80', width: 1200, height: 630 }],
    },
    twitter: { card: 'summary_large_image' },
    robots: { index: true, follow: true, googleBot: { index: true, follow: true, 'max-image-preview': 'large' } },
    // ⚠️ 20 août : ce hreflang par défaut annonçait les DEUX ACCUEILS comme
    // traductions l'un de l'autre sur toute page qui ne le remplaçait pas.
    // Les deux sites ont divergé — l'accueil anglais est un feed. On ne
    // déclare plus rien globalement ; chaque page qui a un vrai jumeau le
    // déclare elle-même (lib/hreflang.ts).
    alternates: {},
    appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: isEN ? 'GoHalalTravel.com' : 'VoyagesHalal.fr' },
    ...(process.env.NEXT_PUBLIC_GSC_VERIFICATION && {
      verification: { google: process.env.NEXT_PUBLIC_GSC_VERIFICATION },
    }),
  }
}

export const viewport: Viewport = {
  themeColor: '#0b1a0f',
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}

// Site bi-domaine : la langue (et la marque) dépend de l'hôte de la requête.
// On force le rendu dynamique sur TOUTES les routes pour qu'aucune page (dont « / »)
// ne soit servie depuis un cache edge/build figé sur la mauvaise langue.
//
// 🗄 CHANTIER CACHE — CE QUI RESTE ICI EST CE QUI N'EST PAS ENCORE MIGRÉ.
//
// La raison qui l'a fait écrire reste vraie : servir une page française à
// un anglophone serait pire qu'une facture. Mais elle s'applique au site
// ENTIER, et Next.js écrit alors « no-store » sur chaque page. Mesuré le
// 22 août : aucune page du site n'a le droit d'être mise en cache, la
// plus lourde pèse 544 Ko, et le compte Vercel s'est mis en pause à
// 10,77 Go d'« Origin Transfer » sur 10 Go inclus — les trois sites sont
// tombés ensemble.
//
// LA SORTIE, par étapes (voir scripts/test-cache.mjs) :
// ÉTAPE 2, FAITE LE 25 AOÛT. Le site a maintenant trois layouts racine :
//   app/(fr)  — français, ne lit rien de la requête → pages en cache
//   app/en    — anglais, ne lit rien de la requête → pages en cache
//   app/(dyn) — CE FICHIER : les pages pas encore migrées. Elles lisent
//               encore l'en-tête, restent dynamiques, et gardent donc la
//               bonne langue sur les deux domaines. C'est volontaire :
//               une page mal migrée servirait du français à un anglophone,
//               ce qui est plus grave qu'une facture.
//
// La ligne ci-dessous ne concerne donc plus QUE ce groupe. Chaque famille
// de pages qu'on déplacera vers (fr)/en sortira de son périmètre.
// ÉTAPE 3 — à faire : les listes (/destinations, l'accueil, /blog,
// /guides), puis le sitemap.
export const dynamic = 'force-dynamic'

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { isEN } = await getDomainSEO()
  return (
    <html lang={isEN ? 'en' : 'fr'}>
      <body className={`${dmSans.variable} ${playfair.variable} font-sans`}>
        <Coque en={isEN}>{children}</Coque>
      </body>
    </html>
  )
}
