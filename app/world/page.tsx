import type { Metadata } from 'next'
import { readFileSync } from 'fs'
import path from 'path'
import WorldFeed, { type VillePanneau } from '@/components/flux/WorldFeed'
import cityCoords from '@/lib/cityCoords.json'
import { countryEn } from '@/lib/poiI18n'
import { compteurVille } from '@/lib/mosqueesOsm'
import { getRedis } from '@/lib/pushStore'
import { EN_URL, FR_URL } from '@/lib/domain'

// 🌍 GOHALALTRAVEL — L'ACCUEIL EN SWIPE (phase 1, validée le 20 août).
// Cette page n'est servie QUE sur le domaine anglais (réécriture « / » →
// /world dans le middleware). Rendu CÔTÉ SERVEUR : le HTML complet des
// villes (noms, scores, accroches) est indexable sans JavaScript.
//
// Règle B — provenance de chaque champ :
//   nom/pays/score/photo : base_vh (data/villes, HalalScore validé 0–10)
//   accroche : base_vh (1re phrase éditoriale anglaise de la fiche)
//   compteur lieux de prière : base OSM précalculée (© contributeurs OSM)
//   temps de vol / prix : AUCUNE source réelle branchée → absents.
export const dynamic = 'force-dynamic'

// 🌍 TOUTES les villes du guide (ordre du 20 août : « mettre en accueil
// toutes les villes à swiper ») — triées par HalalScore décroissant : les
// meilleures d'abord, le flux ne s'arrête jamais. 354 villes, toutes avec
// score et photo réels de la base.
import { readdirSync } from 'fs'

export const metadata: Metadata = {
  title: { absolute: 'GoHalalTravel — Swipe the halal world' },
  description: 'One city per screen. Real photos, HalalScores, verified halal food and prayer places — swipe to find your next Muslim-friendly trip.',
  alternates: {
    canonical: `${EN_URL}/`,
    languages: { en: `${EN_URL}/`, fr: `${FR_URL}/`, 'x-default': `${EN_URL}/` },
  },
}

function lireVilles(): VillePanneau[] {
  const villes: VillePanneau[] = []
  const slugs = readdirSync(path.join(process.cwd(), 'data', 'villes'))
    .filter((f) => f.endsWith('.json')).map((f) => f.replace('.json', ''))
  for (const slug of slugs) {
    try {
      const v = JSON.parse(readFileSync(path.join(process.cwd(), 'data', 'villes', `${slug}.json`), 'utf8')) as Record<string, unknown>
      const score = typeof v.halalScore === 'number' && v.halalScore > 0 && v.halalScore <= 10 ? v.halalScore : null
      // L'accroche : la première phrase éditoriale anglaise de la fiche qui
      // ne cite pas l'ancien « Trust Score » (marque abandonnée) — réelle,
      // jamais générée à la volée.
      const phrases = String(v.description_en ?? '').split(/(?<=[.!?])\s+/)
      const brute = phrases.find((p) => p.length > 30 && !/trust score/i.test(p))?.trim() ?? null
      // Jamais coupée en plein mot : phrase entière si courte, sinon
      // tronquée au dernier espace avant 110 caractères + « … ».
      const accroche = brute == null ? null
        : brute.length <= 120 ? brute
        : `${brute.slice(0, 110).replace(/\s+\S*$/, '')}…`
      if (score == null || typeof v.image !== 'string') continue // sans score ou photo : pas de panneau
      villes.push({
        slug,
        nom: String(v.nom_en ?? v.nom ?? slug),
        pays: String((v as { pays_en?: string }).pays_en ?? v.pays ?? ''),
        score,
        image: typeof v.image === 'string' ? v.image : null,
        accroche,
        lieuxPriere: compteurVille(slug),
      })
    } catch { /* ville illisible : elle n'entre pas dans le flux */ }
  }
  return villes.sort((a, b) => (b.score ?? 0) - (a.score ?? 0))
}


export default async function WorldPage() {
  // Les pays de la base sont en français : countryEn (le même service que
  // le reste du domaine anglais) les traduit pour les 354 villes.
  const villes = lireVilles().map((v) => ({ ...v, pays: countryEn(v.pays, true) }))
  // Phase 2 : l'accroche IA en cache (ia_cache, ≤ 12 mots, calée sur nos
  // compteurs) REMPLACE la phrase éditoriale de la base quand elle existe —
  // c'est elle qui règle l'écart « 3,113 mosques » vs compteur OSM.
  const r = getRedis()
  if (r) {
    try {
      const caches = await r.mget<({ accroche?: string } | null)[]>(...villes.map((v) => `vh:villeia:v1:en:${v.slug}`))
      villes.forEach((v, i) => {
        const a = caches[i]?.accroche
        if (a && a.length <= 120) v.accroche = a
      })
    } catch { /* cache muet : la phrase de la base reste */ }
  }
  // 🔎 L'index de recherche : les 354 villes du guide (slug + nom réels de
  // la base) — la barre trouve n'importe laquelle, pas que les 10 du flux.
  const index = (cityCoords as { slug: string; nom: string; pays?: string }[])
    .map((c) => ({ slug: c.slug, nom: c.nom, pays: c.pays ?? '' }))
  return <WorldFeed villes={villes} index={index} />
}
