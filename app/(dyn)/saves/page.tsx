import type { Metadata } from 'next'
import MySaves from '@/components/flux/MySaves'
import { EN_URL } from '@/lib/domain'

// ♡ MY SAVES — LE carnet unique (GoHalalTravel phase 2) : tous les ♡ de
// tous les flux (villes du World feed, lieux des City/Eat/Sleep/Do)
// tombent ici, et nourrissent « Build my days ». Les données vivent dans
// le TÉLÉPHONE (localStorage) — le serveur ne stocke rien.
// Sur le domaine FR, /saves redirige vers /carnet (middleware).
export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: { absolute: 'My saves — GoHalalTravel' },
  description: 'Every place and city you saved while swiping — ready to become your days.',
  robots: { index: false, follow: true }, // contenu personnel, rien à indexer
  alternates: { canonical: `${EN_URL}/saves` },
}

export default function SavesPage() {
  return <MySaves />
}
