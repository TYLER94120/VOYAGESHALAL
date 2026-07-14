// Planificateur « Mon voyage halal » — moteur de génération d'itinéraire.
// RÈGLE D'OR : zéro donnée inventée. Tout provient du JSON ville (restaurants,
// mosquées, activités, hôtels réels). Les montants sont des ESTIMATIONS
// dérivées des fourchettes de prix réelles, toujours étiquetées comme telles.
// Jamais « certifié halal » : on reprend le vocabulaire honnête du site.

export type PlanProfil = 'famille' | 'couple' | 'solo'
export type PlanInteret = 'culture' | 'detente' | 'gastronomie' | 'spiritualite' | 'shopping'

export interface PlanInput {
  villeSlug: string
  dateStart: string // YYYY-MM-DD
  dateEnd: string
  profil: PlanProfil
  interets: PlanInteret[]
}

export interface PlanActivite {
  nom: string
  type?: string
  categorie?: string
  description?: string
  duree?: string
  prix?: string
  conseil?: string
  mapsUrl?: string
}

export interface PlanResto {
  nom: string
  type?: string
  adresse?: string
  priceRange?: string
  score?: number
  statutHalal: string // « Halal signalé · à vérifier » / « À vérifier sur place »
  mapsUrl?: string
  lat?: number
  lng?: number
}

export interface PlanMosquee {
  nom: string
  adresse?: string
  description?: string
}

export interface PlanDay {
  date: string // YYYY-MM-DD
  activites: PlanActivite[]
  restos: PlanResto[]
  mosquee?: PlanMosquee
}

export interface PlanBudget {
  repasParJour?: string      // dérivé des priceRange réels des restos du plan
  hotelParNuit?: string      // médiane des prix réels des hôtels de la ville
  transportParJour: string   // estimation générique, étiquetée
  note: string
}

export interface TripPlan {
  id?: string
  villeSlug: string
  villeNom: string
  pays?: string
  coord?: { lat: number; lng: number }
  dateStart: string
  dateEnd: string
  nbJours: number
  profil: PlanProfil
  interets: PlanInteret[]
  days: PlanDay[]
  budget: PlanBudget
  checklist: string[]
  ramadan: boolean
  createdAt?: string
}

export interface PlanAlternates {
  activites: PlanActivite[]
  restos: PlanResto[]
}

// Intérêts → catégories/tags réels observés dans les données activités
const INTERET_KEYWORDS: Record<PlanInteret, string[]> = {
  culture: ['culture', 'histoire', 'musée', 'musees', 'art', 'à voir', 'monument', 'patrimoine'],
  detente: ['nature', 'panorama', 'détente', 'detente', 'parc', 'plage', 'bien-être', 'croisière', 'jardin', 'aventure'],
  gastronomie: ['gastronomie', 'cuisine', 'marché', 'marche', 'street food', 'café', 'thé'],
  spiritualite: ['religieux', 'spirituel', 'mosquée', 'mosquee', 'islam'],
  shopping: ['shopping', 'souk', 'bazar', 'marché', 'boutique'],
}

const PROFIL_KEYWORDS: Record<PlanProfil, string[]> = {
  famille: ['famille', 'familles', 'enfants'],
  couple: ['couple', 'couples', 'romantique'],
  solo: ['solo', 'voyageur'],
}

function textOf(a: Record<string, unknown>): string {
  const tags = Array.isArray(a.tags) ? (a.tags as string[]).join(' ') : ''
  const ideal = Array.isArray(a.idealPour) ? (a.idealPour as string[]).join(' ') : ''
  return `${a.categorie ?? ''} ${a.type ?? ''} ${a.nom ?? ''} ${tags} ${ideal}`.toLowerCase()
}

function scoreActivite(a: Record<string, unknown>, interets: PlanInteret[], profil: PlanProfil): number {
  const txt = textOf(a)
  let s = 0
  for (const it of interets) if (INTERET_KEYWORDS[it].some((k) => txt.includes(k))) s += 3
  if (PROFIL_KEYWORDS[profil].some((k) => txt.includes(k))) s += 2
  if (a.description) s += 0.5
  if (a.mapsUrl) s += 0.5
  return s
}

// Fourchettes repas honnêtes par niveau de prix (par personne, ordre de grandeur)
const MEAL_RANGE: Record<string, [number, number]> = { '€': [5, 15], '€€': [12, 30], '€€€': [25, 60], '€€€€': [50, 120] }

function toPlanResto(r: Record<string, unknown>): PlanResto {
  return {
    nom: String(r.nom ?? ''),
    type: r.type ? String(r.type) : undefined,
    adresse: r.adresse ? String(r.adresse) : undefined,
    priceRange: r.priceRange ? String(r.priceRange) : undefined,
    score: typeof r.score === 'number' ? r.score : undefined,
    statutHalal: r.certificationHalal ? 'Halal signalé · à vérifier' : 'À vérifier sur place',
    mapsUrl: r.mapsUrl ? String(r.mapsUrl) : undefined,
    lat: typeof r.lat === 'number' ? r.lat : undefined,
    lng: typeof r.lng === 'number' ? r.lng : undefined,
  }
}

function toPlanActivite(a: Record<string, unknown>): PlanActivite {
  return {
    nom: String(a.nom ?? ''),
    type: a.type ? String(a.type) : undefined,
    categorie: a.categorie ? String(a.categorie) : undefined,
    description: a.description ? String(a.description).slice(0, 220) : undefined,
    duree: a.duree ? String(a.duree) : undefined,
    prix: a.prix ? String(a.prix) : undefined,
    conseil: a.conseil ? String(a.conseil).slice(0, 180) : undefined,
    mapsUrl: a.mapsUrl ? String(a.mapsUrl) : undefined,
  }
}

function median(nums: number[]): number | null {
  if (!nums.length) return null
  const s = [...nums].sort((a, b) => a - b)
  return s[Math.floor(s.length / 2)]
}

function eachDate(start: string, end: string): string[] {
  const out: string[] = []
  const d = new Date(`${start}T12:00:00Z`)
  const e = new Date(`${end}T12:00:00Z`)
  while (d <= e && out.length < 14) {
    out.push(d.toISOString().slice(0, 10))
    d.setUTCDate(d.getUTCDate() + 1)
  }
  return out
}

// Ramadan 2026/2027 (mêmes approximations que lib/ramadan.ts)
const RAMADAN = [
  { start: '2026-02-17', end: '2026-03-19' },
  { start: '2027-02-06', end: '2027-03-07' },
]
function overlapsRamadan(start: string, end: string): boolean {
  return RAMADAN.some((r) => start <= r.end && end >= r.start)
}

function buildChecklist(profil: PlanProfil, ramadan: boolean, en: boolean): string[] {
  const fr = [
    'Passeport / CNI valides (vérifier les conditions de visa du pays)',
    'Tapis de prière de voyage + boussole Qibla (ou notre outil /qibla)',
    'Télécharger les horaires de prière de la ville (notre outil Horaires)',
    'Repérer les restaurants halal du plan sur Google Maps avant le départ',
    'Vérifier sur place le statut halal des adresses — nous ne certifions rien',
    'Assurance voyage + copies des documents dans le cloud',
  ]
  const en_ = [
    'Valid passport / ID (check the country\'s visa requirements)',
    'Travel prayer mat + Qibla compass (or our /qibla tool)',
    'Download the city\'s prayer times (our Prayer times tool)',
    'Pin the plan\'s halal restaurants on Google Maps before departure',
    'Verify the halal status of each place on site — we never certify',
    'Travel insurance + document copies in the cloud',
  ]
  const list = en ? en_ : fr
  if (profil === 'famille') list.push(en ? 'Snacks + activities for the kids during transit' : 'Encas + occupations pour les enfants pendant les trajets')
  if (ramadan) list.push(en ? 'Ramadan dates overlap your trip: plan suhoor/iftar (see our Ramadan travel guide)' : 'Votre séjour tombe pendant le Ramadan : prévoir s\'hour/iftar (voir notre guide Ramadan)')
  return list
}

/** Génère l'itinéraire à partir du JSON ville (aucune donnée inventée). */
export function generatePlan(
  ville: Record<string, unknown>,
  input: PlanInput,
  en = false
): { plan: TripPlan; alternates: PlanAlternates } {
  const dates = eachDate(input.dateStart, input.dateEnd)
  const nbJours = dates.length

  // Activités : scoring par intérêts + profil, tri stable, dédoublonnage par nom
  const rawActs = (Array.isArray(ville.activites) ? ville.activites : []) as Record<string, unknown>[]
  const seen = new Set<string>()
  const rankedActs = rawActs
    .filter((a) => a && a.nom && !seen.has(String(a.nom)) && seen.add(String(a.nom)))
    .map((a) => ({ a, s: scoreActivite(a, input.interets, input.profil) }))
    .sort((x, y) => y.s - x.s)
    .map((x) => x.a)

  // Restos : meilleurs scores d'abord, mais en MIXANT les niveaux de prix
  // (1 abordable €/€€ + 1 supérieur €€€/€€€€ par jour) — un plan « famille »
  // ne doit pas être 100 % gastronomie haut de gamme.
  const rawRestos = (Array.isArray(ville.restaurants) ? ville.restaurants : []) as Record<string, unknown>[]
  const byScore = (x: Record<string, unknown>, y: Record<string, unknown>) =>
    (Number(y.score ?? 0) - Number(x.score ?? 0)) || ((y.lat ? 1 : 0) - (x.lat ? 1 : 0))
  const valid = rawRestos.filter((r) => r && r.nom)
  const cheap = valid.filter((r) => ['€', '€€'].includes(String(r.priceRange ?? '€€'))).sort(byScore)
  const high = valid.filter((r) => !['€', '€€'].includes(String(r.priceRange ?? '€€'))).sort(byScore)
  const rankedRestos: Record<string, unknown>[] = []
  for (let i = 0; i < Math.max(cheap.length, high.length); i++) {
    if (cheap[i]) rankedRestos.push(cheap[i])
    if (high[i]) rankedRestos.push(high[i])
  }

  const mosquees = (Array.isArray(ville.mosquees) ? ville.mosquees : []) as Record<string, unknown>[]

  const perDayActs = nbJours <= 4 ? 3 : 2
  const days: PlanDay[] = dates.map((date, i) => {
    const acts = rankedActs.slice(i * perDayActs, i * perDayActs + perDayActs).map(toPlanActivite)
    const restos = rankedRestos.slice(i * 2, i * 2 + 2).map(toPlanResto)
    const m = mosquees.length ? mosquees[i % mosquees.length] : undefined
    return {
      date,
      activites: acts,
      restos,
      mosquee: m ? { nom: String(m.nom ?? ''), adresse: m.adresse ? String(m.adresse) : undefined, description: m.description ? String(m.description).slice(0, 160) : undefined } : undefined,
    }
  })

  // Budget — uniquement dérivé de données réelles, étiqueté « estimation »
  const usedRestos = days.flatMap((d) => d.restos)
  const ranges = usedRestos.map((r) => MEAL_RANGE[r.priceRange ?? ''] ?? null).filter(Boolean) as [number, number][]
  const repasParJour = ranges.length
    ? `${Math.round((ranges.reduce((s, r) => s + r[0], 0) / ranges.length) * 2)}–${Math.round((ranges.reduce((s, r) => s + r[1], 0) / ranges.length) * 2)} € / pers.`
    : undefined
  const hotels = (Array.isArray(ville.hotels) ? ville.hotels : []) as Record<string, unknown>[]
  const nightPrices = hotels.map((h) => Number(h.prix_nuit_min)).filter((n) => Number.isFinite(n) && n > 0)
  const med = median(nightPrices)
  const devise = hotels.find((h) => h.devise)?.devise
  const hotelParNuit = med ? `≈ ${med} ${String(devise ?? '€')} / nuit (médiane des hôtels référencés)` : undefined

  const ramadan = overlapsRamadan(input.dateStart, input.dateEnd)
  const coord = (ville.coordonnees ?? undefined) as { lat: number; lng: number } | undefined

  const plan: TripPlan = {
    villeSlug: input.villeSlug,
    villeNom: String(ville.nom ?? input.villeSlug),
    pays: ville.pays ? String(ville.pays) : undefined,
    coord,
    dateStart: input.dateStart,
    dateEnd: input.dateEnd,
    nbJours,
    profil: input.profil,
    interets: input.interets,
    days,
    budget: {
      repasParJour,
      hotelParNuit,
      transportParJour: en ? '5–15 € / day (rough estimate)' : '5–15 € / jour (estimation indicative)',
      note: en
        ? 'Estimates derived from the price ranges of the places actually listed — always verify for your season.'
        : 'Estimations dérivées des fourchettes de prix des adresses réellement référencées — à vérifier selon votre saison.',
    },
    checklist: buildChecklist(input.profil, ramadan, en),
    ramadan,
  }

  const alternates: PlanAlternates = {
    activites: rankedActs.slice(nbJours * perDayActs, nbJours * perDayActs + 12).map(toPlanActivite),
    restos: rankedRestos.slice(nbJours * 2, nbJours * 2 + 12).map(toPlanResto),
  }

  return { plan, alternates }
}
