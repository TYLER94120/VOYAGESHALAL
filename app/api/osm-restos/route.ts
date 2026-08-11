import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { conforme } from '@/lib/conformite'
import { forceEnvie } from '@/lib/envies'

// 🍽 LES RESTAURANTS AUTOUR DE TOI — GET /api/osm-restos?lat=..&lng=..
//
// POURQUOI CETTE ROUTE EXISTE, alors que le navigateur sait très bien
// appeler OpenStreetMap tout seul : parce que chez Mohamed, il n'y arrive
// pas. Deux captures d'écran successives à Berkane, en 4G, avec la tuile
// « KEBAB … » qui tourne indéfiniment, pendant que la mosquée s'affichait —
// et elle, elle vient de NOTRE annuaire, pas d'OpenStreetMap. Autrement dit
// Overpass ne répondait pas depuis son téléphone, une fois de plus.
//
// Ce que le serveur peut faire et que le téléphone ne peut pas :
//   1. ESSAYER PLUSIEURS MIROIRS. Overpass est un service bénévole ; le
//      miroir principal refuse régulièrement du monde (429, 504). Il en
//      existe d'autres, strictement équivalents.
//   2. GARDER LA RÉPONSE. Deux voyageurs dans la même ville partagent le
//      même résultat pendant 30 minutes : plus aucun appel pour le second.
//   3. NE PAS DÉPENDRE DU RÉSEAU MOBILE de l'utilisateur pour un appel
//      vers un domaine tiers, souvent le premier à être bridé.
//
// HONNÊTETÉ (règle non négociable) : cette route ne décrète JAMAIS qu'un
// lieu est halal. Elle renvoie ce que dit OpenStreetMap — l'étiquette
// `diet:halal` quand elle existe, et rien quand elle n'existe pas. C'est
// l'appelant qui affiche la mention honnête correspondante.

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const AGENT = 'VoyagesHalal.fr/1.0 (contact@voyageshalal.fr)'

/** Miroirs Overpass, essayés dans l'ordre. Surchargeable par variable
 *  d'environnement pour éprouver le chemin dégradé sans réseau externe. */
const MIROIRS = (process.env.OVERPASS_BASES ??
  'https://overpass-api.de/api/interpreter,https://overpass.kumi.systems/api/interpreter,https://overpass.osm.ch/api/interpreter')
  .split(',').map((s) => s.trim()).filter(Boolean)

const DELAI = 8000
const DUREE_CACHE = 30 * 60 * 1000
const CACHE_MAX = 300

interface Resto { nom: string; lat: number; lng: number; cuisine?: string; halal?: string }
interface Mosquee { nom: string; lat: number; lng: number }
const cache = new Map<string, { t: number; restos: Resto[]; mosquees: Mosquee[] }>()

async function interroger(url: string, corps: string): Promise<unknown | null> {
  const ac = new AbortController()
  const minuteur = setTimeout(() => ac.abort(), DELAI)
  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': AGENT },
      body: `data=${encodeURIComponent(corps)}`,
      signal: ac.signal,
    })
    if (!r.ok) return null
    return await r.json()
  } catch {
    return null
  } finally {
    clearTimeout(minuteur)
  }
}

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams
  const lat = parseFloat(sp.get('lat') ?? '')
  const lng = parseFloat(sp.get('lng') ?? '')
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: 'lat et lng requis' }, { status: 400 })
  }
  const rayon = Math.min(8000, Math.max(500, parseInt(sp.get('rayon') ?? '4000', 10) || 4000))
  const envie = sp.get('envie')
  // `quoi=tout` ajoute les mosquées : le board les demandait directement à
  // Overpass depuis le téléphone, avec le même échec silencieux.
  const avecMosquees = sp.get('quoi') === 'tout'
  const envieOk = envie && /^[a-z]{3,12}$/.test(envie) ? envie : undefined

  // Clé de cache arrondie à ~1 km : deux personnes du même quartier
  // partagent la même réponse, ce qui est exactement le but.
  const cle = `${lat.toFixed(2)},${lng.toFixed(2)},${rayon}`
  const garde = cache.get(cle)
  const frais = garde && Date.now() - garde.t < DUREE_CACHE

  let restos: Resto[]
  let mosquees: Mosquee[]
  let source: 'cache' | 'reseau' | 'perime'
  if (frais) {
    restos = garde!.restos
    mosquees = garde!.mosquees
    source = 'cache'
  } else {
    const autour = `(around:${rayon},${lat},${lng})`
    // Les mosquées se cherchent plus loin : on marche volontiers 5 km pour
    // une mosquée, pas pour un sandwich.
    const autourM = `(around:${Math.max(rayon, 5000)},${lat},${lng})`
    const q = `[out:json][timeout:20];(node["amenity"~"restaurant|fast_food"]${autour};way["amenity"~"restaurant|fast_food"]${autour};node["amenity"="place_of_worship"]["religion"="muslim"]${autourM};way["amenity"="place_of_worship"]["religion"="muslim"]${autourM};);out center 100;`
    let brut: unknown | null = null
    for (const m of MIROIRS) {
      brut = await interroger(m, q)
      if (brut) break
    }
    if (!brut) {
      // On ne ment pas : si on a une réponse périmée, on la sert en le
      // disant ; sinon on avoue que la recherche n'a pas abouti.
      if (garde) {
        return NextResponse.json({ restos: garde.restos, mosquees: garde.mosquees, perime: true, raison: 'openstreetmap ne répond pas' })
      }
      return NextResponse.json({ restos: [], mosquees: [], erreur: true, raison: 'openstreetmap ne répond pas' }, { status: 200 })
    }
    const out: Resto[] = []
    const outM: Mosquee[] = []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    for (const el of ((brut as any).elements as any[]) ?? []) {
      const la = el.lat ?? el.center?.lat, lo = el.lon ?? el.center?.lon
      const nom = el.tags?.name
      if (!la || !lo || !nom) continue
      if (el.tags.amenity === 'place_of_worship') { outM.push({ nom: String(nom), lat: la, lng: lo }); continue }
      const cuisine: string | undefined = el.tags.cuisine ?? undefined
      const halal: string | undefined = el.tags['diet:halal'] ?? undefined
      // Un bar, un lounge à chicha ou un nom qui annonce du porc reste
      // écarté, ici comme partout ailleurs sur le site.
      if (!conforme(nom, cuisine, halal)) continue
      out.push({ nom: String(nom), lat: la, lng: lo, cuisine, halal })
    }
    cache.set(cle, { t: Date.now(), restos: out, mosquees: outM })
    if (cache.size > CACHE_MAX) cache.delete(cache.keys().next().value as string)
    restos = out
    mosquees = outM
    source = 'reseau'
  }

  const filtres = envieOk
    ? restos
      .map((r) => ({ ...r, force: forceEnvie(r.cuisine, r.nom, envieOk) }))
      .filter((r) => r.force > 0)
    : restos
  return NextResponse.json({ restos: filtres, ...(avecMosquees ? { mosquees } : {}), source })
}
