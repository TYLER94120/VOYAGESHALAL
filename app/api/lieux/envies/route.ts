import { NextResponse } from 'next/server'
import { Redis } from '@upstash/redis'

// 🍣 LES COMPTEURS D'ENVIES (itération 4, corrections 2 et 3).
//
// « On ne propose jamais un tap qui mène à une page vide. » Avant
// d'afficher la grille d'envies, on demande à Google COMBIEN d'adresses
// existent par envie autour du visiteur — pré-requête la plus légère
// possible (FieldMask places.id seul), en parallèle, et en cache 10 min
// par position ARRONDIE à ~500 m (l'arrondi ne sort jamais de la clé de
// cache : il ne sert qu'à mutualiser les comptages entre voisins).
// Une envie à 0 n'est pas renvoyée du tout.
//
// Pour « Que faire », les envies sont CONSTRUITES depuis ce qui existe :
// 8 catégories Places interrogées, seules celles avec ≥ 1 résultat
// deviennent des cases — la grille s'adapte à chaque ville du monde.
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

// 🍣 Chaque envie porte l'IDENTIFIANT de lib/envies.ts : c'est lui qui
// permet de relire la réponse de Google et d'écarter ce qui n'est pas le
// plat demandé (20 août — « quand on veut des sushi on doit pas tomber sur
// des pizzas »). Une envie sans identifiant filtrerait dans le vide.
const MANGER: { mot: string; requete: string; id: string }[] = [
  { mot: 'Sushi', requete: 'sushi', id: 'sushi' }, { mot: 'Burger', requete: 'burger', id: 'burger' }, { mot: 'Pizza', requete: 'pizza', id: 'pizza' },
  { mot: 'Turc', requete: 'restaurant turc', id: 'turc' }, { mot: 'Indien', requete: 'restaurant indien', id: 'indien' }, { mot: 'Marocain', requete: 'restaurant marocain', id: 'maghrebin' },
  { mot: 'Asiatique', requete: 'restaurant asiatique', id: 'asiatique' }, { mot: 'Poulet', requete: 'poulet grillé', id: 'poulet' }, { mot: 'Dessert', requete: 'pâtisserie', id: 'dessert' },
]
const FAIRE: { mot: string; type: string }[] = [
  { mot: 'Parc', type: 'park' }, { mot: 'Musée', type: 'museum' }, { mot: 'Piscine', type: 'swimming_pool' },
  { mot: 'Bowling', type: 'bowling_alley' }, { mot: 'Zoo', type: 'zoo' }, { mot: 'À voir', type: 'tourist_attraction' },
  { mot: 'Shopping', type: 'shopping_mall' }, { mot: 'Enfants', type: 'playground' },
]
const RAYON_M = 10000

function getRedis(): Redis | null {
  try {
    const url = process.env.UPSTASH_REDIS_REST_URL, token = process.env.UPSTASH_REDIS_REST_TOKEN
    return url && token ? new Redis({ url, token }) : null
  } catch { return null }
}

async function compteTexte(cle: string, lat: number, lng: number, requete: string, signal: AbortSignal): Promise<number> {
  const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': cle, 'X-Goog-FieldMask': 'places.id' },
    body: JSON.stringify({ textQuery: requete, pageSize: 10, locationBias: { circle: { center: { latitude: lat, longitude: lng }, radius: RAYON_M } } }),
  })
  if (!r.ok) throw new Error(String(r.status))
  return (((await r.json()).places as unknown[]) ?? []).length
}

async function compteType(cle: string, lat: number, lng: number, type: string, signal: AbortSignal): Promise<number> {
  const r = await fetch('https://places.googleapis.com/v1/places:searchNearby', {
    method: 'POST', signal,
    headers: { 'Content-Type': 'application/json', 'X-Goog-Api-Key': cle, 'X-Goog-FieldMask': 'places.id' },
    body: JSON.stringify({ includedTypes: [type], maxResultCount: 10, locationRestriction: { circle: { center: { latitude: lat, longitude: lng }, radius: RAYON_M } } }),
  })
  if (!r.ok) throw new Error(String(r.status))
  return (((await r.json()).places as unknown[]) ?? []).length
}

export async function POST(request: Request) {
  const cle = process.env.GOOGLE_PLACES_KEY
  let corps: { lat?: number; lng?: number; mode?: string }
  try { corps = await request.json() } catch { return NextResponse.json({ erreur: 'corps' }, { status: 400 }) }
  const lat = Number(corps.lat), lng = Number(corps.lng)
  const mode = corps.mode === 'activite' ? 'activite' : 'manger'
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return NextResponse.json({ erreur: 'position' }, { status: 400 })
  if (!cle) return NextResponse.json({ envies: null, raison: 'sans-cle' })

  // ~500 m : Math.round(x * 200) / 200 = pas de 0,005°.
  const cleCache = `vh:envies:v2:${mode}:${Math.round(lat * 200) / 200},${Math.round(lng * 200) / 200}`
  const r = getRedis()
  if (r) {
    try {
      const enCache = await r.get<{ mot: string; requete: string; id?: string; n: number }[]>(cleCache)
      if (enCache) return NextResponse.json({ envies: enCache, cache: true })
    } catch { /* le comptage direct suivra */ }
  }

  const ac = new AbortController()
  const t = setTimeout(() => ac.abort(), 3500)
  try {
    const envies = mode === 'manger'
      ? await Promise.all(MANGER.map(async (e) => ({ mot: e.mot, requete: e.requete, id: e.id, n: await compteTexte(cle, lat, lng, e.requete, ac.signal).catch(() => -1) })))
      : await Promise.all(FAIRE.map(async (e) => ({ mot: e.mot, requete: e.mot.toLowerCase(), type: e.type, n: await compteType(cle, lat, lng, e.type, ac.signal).catch(() => -1) })))
    // -1 = comptage indisponible : on GARDE l'envie sans compteur plutôt que
    // de la cacher à tort. 0 = vraiment rien : la case disparaît.
    const utiles = envies.filter((e) => e.n !== 0)
    if (r && utiles.every((e) => e.n >= 0)) { try { await r.set(cleCache, utiles, { ex: 600 }) } catch { /* tant pis */ } }
    return NextResponse.json({ envies: utiles })
  } catch {
    return NextResponse.json({ envies: null, raison: 'google-muet' })
  } finally { clearTimeout(t) }
}
