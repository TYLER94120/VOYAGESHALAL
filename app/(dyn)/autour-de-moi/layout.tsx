import type { Metadata } from 'next'
import { getDomainSEO } from '@/lib/domain'

// 📍 « AUTOUR DE MOI » N'AVAIT AUCUN TITRE À ELLE.
//
// Mesuré le 29 août : la page servait le titre PAR DÉFAUT du site —
// « Guide Voyage Halal 2026 — Restaurants, Mosquées, Prière ». Deux
// adresses se présentaient donc à Google sous le même titre que l'accueil,
// et se faisaient concurrence. Elle n'avait pas non plus de canonique.
//
// C'est une page CLIENT (géolocalisation, carte) : elle ne peut pas
// exporter de métadonnées elle-même. Ce layout les porte pour elle.
//
// ⚠️ Le titre ne vise PAS « mosquée près de moi » : cette requête appartient
// à /mosquee-proche, qui la travaille déjà. Deux pages sur une même requête
// valent moins qu'une. Ce qu'Autour de moi fait et qu'aucune autre page ne
// fait, c'est les TROIS à la fois — prier, manger, sortir — là où l'on est.
export async function generateMetadata(): Promise<Metadata> {
  const { isEN, siteUrl } = await getDomainSEO()
  return {
    title: { absolute: isEN ? 'Around me: pray, eat halal, go out nearby' : 'Autour de moi : prier, manger halal, sortir' },
    description: isEN
      ? 'Mosques, halal places to eat and things to do around you, right now. Free, no account. Source shown on every listing.'
      : 'Mosquées, adresses halal et activités autour de vous, tout de suite. Gratuit, sans compte. Source affichée sur chaque adresse.',
    alternates: { canonical: `${siteUrl}/autour-de-moi` },
  }
}

export default function LayoutAutourDeMoi({ children }: { children: React.ReactNode }) {
  return children
}
