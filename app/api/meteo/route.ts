import { NextResponse } from 'next/server'

// 🌤 LA MÉTÉO — GET /api/meteo?lat=..&lng=..
//
// Demandée par Mohamed : « la météo est importante en voyage, et pouvoir
// anticiper, très importante ». Le mot qui compte est ANTICIPER : une
// température seule ne sert à rien, ce qu'on veut savoir c'est s'il faut
// prendre une veste avant de sortir pour Maghrib.
//
// LA SOURCE : l'Institut météorologique norvégien (MET Norway). Gratuit, sans
// clé, sans plafond pour notre volume, et utilisable par un site commercial —
// à deux conditions que nous respectons : un User-Agent qui nous identifie, et
// l'attribution affichée à l'écran. Aucune dépense, aucune inscription.
//
// POURQUOI CÔTÉ SERVEUR et pas depuis le téléphone :
//   1. le navigateur ne peut pas fixer son User-Agent, exigé par MET ;
//   2. un cache partagé sert TOUS les visiteurs d'une même ville — la météo
//      change lentement, la garder 30 minutes divise les appels par cent et
//      rend la réponse instantanée pour presque tout le monde ;
//   3. MET demande explicitement de ne pas marteler l'API depuis les clients.

export const dynamic = 'force-dynamic'
export const runtime = 'nodejs'

const AGENT = 'VoyagesHalal.fr/1.0 (contact@voyageshalal.fr)'
/** Surchargeable pour éprouver le chemin dégradé sans dépendre du vrai
 *  service (le réseau externe est fermé depuis l'environnement de l'agent). */
const BASE = process.env.METEO_BASE_URL ?? 'https://api.met.no'
/** La météo ne change pas en dix minutes. 30 min = fraîcheur suffisante et
 *  quasiment plus aucun appel réseau. */
const DUREE_CACHE = 30 * 60 * 1000
/** Il y a un humain qui attend derrière : on ne le fait pas patienter
 *  indéfiniment. Au-delà, on sert le cache périmé s'il existe. */
const DELAI = 6000

export interface Heure { t: string; temp: number; code: string; pluieMm: number }
export interface Jour { date: string; min: number; max: number; code: string; pluieMm: number }
export interface Meteo {
  maintenant: { temp: number; code: string; ressenti?: number } | null
  heures: Heure[]
  jours: Jour[]
  releveA: number
  perime?: boolean
}

const cache = new Map<string, { a: number; v: Meteo }>()

/** MET impose 4 décimales maximum. On arrondit à 2 (~1 km) : c'est assez
 *  précis pour la météo et ça fait tomber tout un quartier sur la même clé. */
const cle = (lat: number, lng: number) => `${lat.toFixed(2)},${lng.toFixed(2)}`

export async function GET(req: Request) {
  const u = new URL(req.url)
  const lat = parseFloat(u.searchParams.get('lat') || '')
  const lng = parseFloat(u.searchParams.get('lng') || '')
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
    return NextResponse.json({ error: 'lat et lng requis' }, { status: 400 })
  }

  const k = cle(lat, lng)
  const enCache = cache.get(k)
  if (enCache && Date.now() - enCache.a < DUREE_CACHE) {
    return NextResponse.json(enCache.v, { headers: { 'Cache-Control': 'public, max-age=900' } })
  }

  try {
    const ac = new AbortController()
    const t = setTimeout(() => ac.abort(), DELAI)
    const r = await fetch(
      `${BASE}/weatherapi/locationforecast/2.0/compact?lat=${lat.toFixed(4)}&lon=${lng.toFixed(4)}`,
      { headers: { 'User-Agent': AGENT, Accept: 'application/json' }, signal: ac.signal },
    )
    clearTimeout(t)
    if (!r.ok) throw new Error(`MET ${r.status}`)
    const j = await r.json()
    const v = transformer(j)
    cache.set(k, { a: Date.now(), v })
    // Le cache est borné : sans ça, un site mondial finit par tout garder.
    if (cache.size > 500) cache.delete(cache.keys().next().value as string)
    return NextResponse.json(v, { headers: { 'Cache-Control': 'public, max-age=900' } })
  } catch (e) {
    // ⚠️ Une météo d'il y a deux heures vaut infiniment mieux que rien —
    // à condition de DIRE qu'elle date. C'est `perime` qui sert à ça, et
    // l'écran l'affiche.
    if (enCache) return NextResponse.json({ ...enCache.v, perime: true }, { headers: { 'Cache-Control': 'no-store' } })
    // La RAISON est renvoyée en clair : sans elle, une météo absente en ligne
    // ne se diagnostique qu'en devinant. Ouvrir cette adresse dans un
    // navigateur suffit alors à savoir si c'est un délai, un refus de la
    // source, ou autre chose.
    const raison = e instanceof Error ? e.message : String(e)
    console.error('[meteo] échec', raison)
    return NextResponse.json(
      { error: 'météo indisponible', raison, source: BASE },
      { status: 503, headers: { 'Cache-Control': 'no-store' } },
    )
  }
}

/* eslint-disable @typescript-eslint/no-explicit-any */
function transformer(j: any): Meteo {
  const ts: any[] = j?.properties?.timeseries ?? []
  const heures: Heure[] = ts.slice(0, 48).map((p) => ({
    t: p.time,
    temp: Math.round(p.data?.instant?.details?.air_temperature ?? 0),
    code: p.data?.next_1_hours?.summary?.symbol_code ?? p.data?.next_6_hours?.summary?.symbol_code ?? 'clearsky_day',
    pluieMm: p.data?.next_1_hours?.details?.precipitation_amount ?? 0,
  }))

  // Les journées, reconstituées à partir des relevés horaires — MET ne les
  // fournit pas toutes faites.
  const parJour = new Map<string, { temps: number[]; codes: string[]; pluie: number }>()
  for (const p of ts) {
    const date = String(p.time).slice(0, 10)
    const temp = p.data?.instant?.details?.air_temperature
    if (typeof temp !== 'number') continue
    const e = parJour.get(date) ?? { temps: [], codes: [], pluie: 0 }
    e.temps.push(temp)
    const h = Number(String(p.time).slice(11, 13))
    // Le pictogramme du jour se prend en milieu de journée : à 3 h du matin
    // il est toujours « nuit claire », ce qui ne dit rien de la journée.
    if (h >= 11 && h <= 15) {
      const c = p.data?.next_1_hours?.summary?.symbol_code ?? p.data?.next_6_hours?.summary?.symbol_code
      if (c) e.codes.push(c)
    }
    e.pluie += p.data?.next_1_hours?.details?.precipitation_amount ?? 0
    parJour.set(date, e)
  }
  const jours: Jour[] = [...parJour.entries()].slice(0, 7).map(([date, e]) => ({
    date,
    min: Math.round(Math.min(...e.temps)),
    max: Math.round(Math.max(...e.temps)),
    code: e.codes[Math.floor(e.codes.length / 2)] ?? 'clearsky_day',
    pluieMm: Math.round(e.pluie * 10) / 10,
  }))

  const p0 = ts[0]
  return {
    maintenant: p0
      ? {
          temp: Math.round(p0.data?.instant?.details?.air_temperature ?? 0),
          code: p0.data?.next_1_hours?.summary?.symbol_code ?? 'clearsky_day',
        }
      : null,
    heures,
    jours,
    releveA: Date.now(),
  }
}
