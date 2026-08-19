import { NextResponse } from 'next/server'
import { after } from 'next/server'
import { readFileSync } from 'fs'
import path from 'path'
import { getRedis } from '@/lib/pushStore'
import { estLatinLisible } from '@/lib/latin.mjs'
import { conforme } from '@/lib/conformite'

// 🎬 LE POOL IMMERSION D'UNE VILLE — le hall of fame, PAS des adresses
// quelconques. Construit CÔTÉ SERVEUR, en cache Redis 7 jours par ville
// (recalcul hebdomadaire de fait), pour N'IMPORTE QUELLE ville : aucun
// nom de lieu codé en dur — le pipeline ne lit que le slug, les
// coordonnées et la base.
//
// Seuils d'entrée, AUCUNE exception (une catégorie vide reste vide) :
//   monuments/expériences : ★ ≥ 4,5 ET ≥ 1 000 avis
//   tables : ★ ≥ 4,5 ET ≥ 300 avis ET halal vérifié (base) ou signalé
//            (mention Places / OSM diet:halal de notre base)
//   hôtels : sans alcool VÉRIFIÉ dans notre base
//   et une PHOTO exploitable obligatoire — sans photo, pas de panneau.
//
// Couche de confiance extensible : chaque lieu porte sa LISTE de sources
// (base_vh, osm, places) — une source future s'ajoute sans refonte.
// Contradictions entre sources → listées dans la réponse pour arbitrage.
//
// Les textes (conseil d'initié ≤ 14 mots, actionnable) : Haiku, UNE fois,
// en arrière-plan via after(), stockés dans le cache du pool — jamais
// générés pendant que le visiteur attend. Sans conseil : l'élément est
// absent, jamais improvisé.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const CLE_CACHE = (slug: string, lang: string) => `vh:immersion:v1:${lang}:${slug}`
const DELAI = 8000

export interface PanneauImmersion {
  id: string
  cat: 'monument' | 'table' | 'experience' | 'hotel' | 'joker'
  nom: string
  lat: number
  lng: number
  photo: string // /api/lieux/photo?ref=… (proxy, clé jamais exposée)
  note?: number
  nbAvis?: number
  prix?: number
  quartier?: string
  etiquette?: string
  conseil?: string
  badge?: 'vert' | 'orange'
  sources: string[]
  osmId?: string
}

interface Pool {
  ville: string
  panneaux: PanneauImmersion[]
  contradictions: { nom: string; detail: string }[]
  genere: string
  conseilsPrets?: boolean
}

function lireVille(slug: string): Record<string, unknown> | null {
  if (!/^[a-z0-9-]{1,60}$/.test(slug)) return null
  try { return JSON.parse(readFileSync(path.join(process.cwd(), 'data', 'villes', `${slug}.json`), 'utf8')) } catch { return null }
}

const distM = (a: number, b: number, c: number, d: number) => {
  const dx = (d - b) * Math.cos(((a + c) / 2 * Math.PI) / 180) * 111320
  const dy = (c - a) * 110570
  return Math.sqrt(dx * dx + dy * dy)
}
const normNom = (s: string) => s.toLowerCase().normalize('NFD').replace(/\p{M}/gu, '').replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
const semblables = (a: string, b: string) => {
  const na = normNom(a), nb = normNom(b)
  if (!na || !nb) return false
  if (na.includes(nb) || nb.includes(na)) return true
  const ta = new Set(na.split(' ')), tb = new Set(nb.split(' '))
  return [...ta].filter((m) => m.length > 2 && tb.has(m)).length >= Math.ceil(Math.min(ta.size, tb.size) / 2)
}

interface Lu {
  id: string; nom: string; lat: number; lng: number; note?: number; nbAvis?: number
  prix?: number; quartier?: string; photoRef?: string; type?: string; resume?: string
}

const CHAMPS = ['id', 'displayName', 'location', 'rating', 'userRatingCount', 'priceLevel', 'photos', 'primaryType', 'shortFormattedAddress', 'editorialSummary']
  .map((c) => `places.${c}`).join(',')

async function chercher(cle: string, lang: string, texte: string, lat: number, lng: number): Promise<Lu[]> {
  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), DELAI)
  try {
    const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
      method: 'POST', signal: ac.signal,
      headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': cle, 'X-Goog-FieldMask': CHAMPS },
      body: JSON.stringify({
        textQuery: texte, languageCode: lang, maxResultCount: 20, minRating: 4.5,
        locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius: 30000 } },
      }),
    })
    if (!r.ok) { console.error('[immersion] searchText refuse', r.status, texte); return [] }
    const j = await r.json() as { places?: Record<string, unknown>[] }
    return (j.places ?? []).map((p) => {
      const loc = p.location as { latitude?: number; longitude?: number } | undefined
      const photos = p.photos as { name?: string }[] | undefined
      const PRIX: Record<string, number> = { PRICE_LEVEL_INEXPENSIVE: 1, PRICE_LEVEL_MODERATE: 2, PRICE_LEVEL_EXPENSIVE: 3, PRICE_LEVEL_VERY_EXPENSIVE: 4 }
      return {
        id: String(p.id ?? ''),
        nom: (p.displayName as { text?: string } | undefined)?.text ?? '',
        lat: loc?.latitude ?? NaN, lng: loc?.longitude ?? NaN,
        note: p.rating as number | undefined,
        nbAvis: p.userRatingCount as number | undefined,
        prix: PRIX[String(p.priceLevel ?? '')],
        quartier: (p.shortFormattedAddress as string | undefined)?.split(',')[0]?.trim(),
        photoRef: photos?.[0]?.name,
        type: p.primaryType as string | undefined,
        resume: (p.editorialSummary as { text?: string } | undefined)?.text,
      }
    }).filter((p) => p.id && p.nom && Number.isFinite(p.lat))
  } catch (e) { console.error('[immersion] searchText échec :', e instanceof Error ? e.message : e); return [] } finally { clearTimeout(t) }
}

const JOKER_TYPES = /market|viewpoint|spa|hammam|garden|park|ferry|observation/i

async function construirePool(slug: string, lang: string): Promise<Pool | null> {
  const v = lireVille(slug)
  if (!v) return null
  const coords = (v.coordonnees as { lat?: number; lng?: number }) ?? {}
  if (typeof coords.lat !== 'number' || typeof coords.lng !== 'number') return null
  const cle = process.env.GOOGLE_PLACES_KEY
  const nomVille = String(v.nom ?? slug)
  const panneaux: PanneauImmersion[] = []
  const contradictions: { nom: string; detail: string }[] = []
  const restosBase = ((v.restaurants as { nom?: string; lat?: number; lng?: number; halalConfidence?: string; type?: string }[]) ?? [])
    .filter((r) => conforme(r.nom, r.type, r.halalConfidence))

  if (cle) {
    // ── 3 requêtes Places par ville et par SEMAINE (cache), pas par visite ──
    const [monuments, experiences, tables] = await Promise.all([
      chercher(cle, lang, `monuments et lieux emblématiques incontournables ${nomVille}`, coords.lat, coords.lng),
      chercher(cle, lang, `expérience emblématique croisière hammam marché panorama ${nomVille}`, coords.lat, coords.lng),
      chercher(cle, lang, `restaurant halal ${nomVille}`, coords.lat, coords.lng),
    ])

    const pris = new Set<string>()
    const pousser = (l: Lu, cat: PanneauImmersion['cat'], extra: Partial<PanneauImmersion> = {}) => {
      if (pris.has(l.id) || !l.photoRef) return // photo OBLIGATOIRE
      if (!estLatinLisible(l.nom)) return // jamais d'écriture non latine seule
      pris.add(l.id)
      panneaux.push({
        id: l.id, cat, nom: l.nom, lat: l.lat, lng: l.lng,
        photo: `/api/lieux/photo?ref=${encodeURIComponent(l.photoRef)}`,
        note: l.note, nbAvis: l.nbAvis, prix: l.prix, quartier: l.quartier,
        sources: ['places'], ...extra,
      })
    }

    // Monuments + jokers : ★ ≥ 4,5 (déjà filtré) ET ≥ 1 000 avis.
    for (const l of [...monuments, ...experiences]) {
      if ((l.nbAvis ?? 0) < 1000) continue
      if (JOKER_TYPES.test(l.type ?? '')) pousser(l, 'joker')
      else if (/tour|cruise|boat|ferry|hamam|bath/i.test(l.type ?? '')) pousser(l, 'experience')
      else pousser(l, 'monument')
    }
    // Si la recherche « expérience » n'a rien classé experience, le premier
    // joker éligible y glisse — la composition reste honnête, rien n'est
    // inventé, seulement reclassé.
    if (!panneaux.some((p) => p.cat === 'experience')) {
      const j = panneaux.find((p) => p.cat === 'joker')
      if (j) j.cat = 'experience'
    }

    // Tables : ★ ≥ 4,5 ET ≥ 300 avis ET halal vérifié/signalé — le
    // croisement fait la confiance (base verte > mention orange).
    for (const l of tables) {
      if ((l.nbAvis ?? 0) < 300) continue
      const base = restosBase.find((r) => r.nom && typeof r.lat === 'number'
        && distM(r.lat!, r.lng!, l.lat, l.lng) < 60 && semblables(r.nom, l.nom))
      const mention = /halal/i.test(l.nom) || /halal/i.test(l.resume ?? '')
      if (!base && !mention) continue
      if (base?.halalConfidence === 'no') { contradictions.push({ nom: l.nom, detail: 'notre base dit non-halal, Places le signale halal' }); continue }
      pousser(l, 'table', {
        badge: base?.halalConfidence === 'verified' ? 'vert' : 'orange',
        sources: base ? ['places', 'base_vh'] : ['places'],
      })
    }
  }

  // Hôtels : SANS ALCOOL VÉRIFIÉ dans notre base — et une photo. Notre
  // base d'hôtels n'a pas de photos aujourd'hui : la catégorie restera
  // vide tant que c'est vrai (les seuils priment, on ne comble pas).
  const hotels = ((v.hotels as { nom?: string; sansAlcool?: boolean; photo?: string; lat?: number; lng?: number; note?: number; prixNuitEur?: number }[]) ?? [])
    .filter((h) => h.sansAlcool === true && h.photo && h.nom && estLatinLisible(h.nom) && typeof h.lat === 'number')
  for (const h of hotels.slice(0, 3)) {
    panneaux.push({
      id: `hotel-${normNom(h.nom!)}`, cat: 'hotel', nom: h.nom!, lat: h.lat!, lng: h.lng!,
      photo: h.photo!, note: h.note, prix: undefined, badge: 'vert', sources: ['base_vh'],
      etiquette: 'SANS ALCOOL',
    })
  }

  // Phase 2 : le pool sert aussi les flux Eat/Sleep/Do — on garde jusqu'à
  // 40 lieux au-dessus des seuils (les flux filtrent par catégorie).
  return { ville: nomVille, panneaux: panneaux.slice(0, 40), contradictions, genere: new Date().toISOString().slice(0, 10) }
}

/** Conseils d'initié — Haiku, UNE fois, ≤ 14 mots, actionnables. */
async function genererConseils(pool: Pool, lang: string, r: NonNullable<ReturnType<typeof getRedis>>, slug: string) {
  const cle = process.env.ANTHROPIC_API_KEY
  if (!cle || !pool.panneaux.length) return
  try {
    const lieux = pool.panneaux.map((p) => ({ id: p.id, nom: p.nom, cat: p.cat }))
    const PROMPT = `Ville : ${pool.ville}. Pour CHAQUE lieu, un conseil d'initié ${lang === 'en' ? 'en anglais' : 'en français'} de 14 mots MAXIMUM, ACTIONNABLE (« vas-y au Fajr », « vise le départ de 17 h », « commence à moitié prix ») — jamais une description Wikipédia. Et une étiquette COURTE en majuscules (ex. LIEU CULTE, LE PLUS VISITÉ, EXPÉRIENCE, POINT DE VUE, SENS EN ÉVEIL).
Réponds UNIQUEMENT un JSON : {"<id>":{"c":"conseil","e":"ÉTIQUETTE"}}.
Si tu ne connais pas un lieu avec certitude, OMETS-le. Jamais le mot « certifié ».
Lieux : ${JSON.stringify(lieux)}`
    const { default: Anthropic } = await import('@anthropic-ai/sdk')
    const client = new Anthropic({ apiKey: cle })
    const rep = await client.messages.create({ model: 'claude-haiku-4-5-20251001', max_tokens: 1800, temperature: 0, messages: [{ role: 'user', content: PROMPT }] })
    const brut = (rep.content.find((c) => c.type === 'text')?.text ?? '').trim()
    const j = JSON.parse(brut.match(/\{[\s\S]*\}/)?.[0] ?? 'null') as Record<string, { c?: string; e?: string }> | null
    if (!j) return
    for (const p of pool.panneaux) {
      const x = j[p.id]
      if (!x) continue
      if (x.c && x.c.split(/\s+/).length <= 16 && !/certifi/i.test(x.c)) p.conseil = x.c
      if (x.e && x.e.length <= 24 && !/certifi/i.test(x.e) && !p.etiquette) p.etiquette = x.e.toUpperCase()
    }
    pool.conseilsPrets = true
    await r.set(CLE_CACHE(slug, lang), pool, { ex: 7 * 24 * 3600 })
  } catch (e) { console.error('[immersion] conseils IA échoués :', e instanceof Error ? e.message : e) }
}

export async function GET(request: Request) {
  const u = new URL(request.url)
  const slug = u.searchParams.get('slug') ?? ''
  const lang = u.searchParams.get('lang') === 'en' ? 'en' : 'fr'
  const r = getRedis()

  if (r) {
    try {
      const cache = await r.get<Pool>(CLE_CACHE(slug, lang))
      if (cache) return NextResponse.json(cache)
    } catch { /* cache muet : on construit */ }
  }
  const pool = await construirePool(slug, lang)
  if (!pool) return NextResponse.json({ erreur: 'ville' }, { status: 404 })
  if (r) {
    try { await r.set(CLE_CACHE(slug, lang), pool, { ex: 7 * 24 * 3600 }) } catch { /* pas bloquant */ }
    after(() => genererConseils(pool, lang, r, slug))
  }
  console.info(`[immersion] pool ${slug} : ${pool.panneaux.length} lieux (${pool.contradictions.length} contradiction(s))`)
  return NextResponse.json(pool)
}
