#!/usr/bin/env node
/**
 * Enrichit les fiches villes avec de VRAIES données OpenStreetMap (Overpass) :
 * restaurants halal & halal-friendly, mosquées, activités — avec coordonnées réelles.
 * Écrit le résultat EN DUR dans data/villes/*.json (plus de dépendance au live).
 *
 * À exécuter là où il y a un accès réseau (GitHub Action ou machine locale) :
 *   node scripts/enrich-osm.mjs [all|empty]   (défaut: empty)
 *
 * Aucune donnée inventée : on n'écrit que ce qu'OSM connaît. Les restaurants
 * "cuisine halal courante" (turc, libanais...) sont marqués halalConfidence:"likely".
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import path from 'path'

const VDIR = path.join(process.cwd(), 'data', 'villes')
const INDEX = path.join(process.cwd(), 'data', 'index-villes.json')
const SCOPE = (process.argv[2] || 'empty').toLowerCase()
const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
]
const HALAL_CUISINE = /kebab|turkish|lebanese|arab|syrian|persian|iranian|afghan|pakistani|bangladeshi|egyptian|moroccan|uyghur|uighur|halal|doner|shawarma|biryani/i

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
function haversine(a, b, c, d) {
  const R = 6371000, p = Math.PI / 180
  const x = Math.sin(((c - a) * p) / 2) ** 2 + Math.cos(a * p) * Math.cos(c * p) * Math.sin(((d - b) * p) / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}
const maps = (lat, lng) => `https://maps.google.com/?q=${lat},${lng}`

function buildQuery(lat, lng) {
  const cu = 'kebab|turkish|lebanese|arab|syrian|persian|iranian|afghan|pakistani|bangladeshi|egyptian|moroccan|uyghur|halal|doner|shawarma|biryani'
  return `[out:json][timeout:40];(` +
    `node["amenity"~"restaurant|fast_food"]["diet:halal"~"yes|only"](around:8000,${lat},${lng});` +
    `way["amenity"~"restaurant|fast_food"]["diet:halal"~"yes|only"](around:8000,${lat},${lng});` +
    `node["amenity"~"restaurant|fast_food"]["cuisine"~"${cu}",i](around:8000,${lat},${lng});` +
    `way["amenity"~"restaurant|fast_food"]["cuisine"~"${cu}",i](around:8000,${lat},${lng});` +
    `node["amenity"="place_of_worship"]["religion"="muslim"](around:7000,${lat},${lng});` +
    `way["amenity"="place_of_worship"]["religion"="muslim"](around:7000,${lat},${lng});` +
    `node["tourism"~"attraction|museum|gallery|viewpoint"](around:6000,${lat},${lng});` +
    `way["tourism"~"attraction|museum|gallery"](around:6000,${lat},${lng});` +
    `node["historic"~"monument|memorial|castle|monastery"](around:6000,${lat},${lng});` +
    `);out center tags;`
}

async function overpass(query) {
  for (let attempt = 0; attempt < ENDPOINTS.length * 2; attempt++) {
    const url = ENDPOINTS[attempt % ENDPOINTS.length]
    // Timeout client par requête : un fetch bloqué est avorté au bout de 30s,
    // on bascule alors sur l'endpoint suivant (évite tout blocage du job).
    const ac = new AbortController()
    const timer = setTimeout(() => ac.abort(), 30000)
    try {
      const res = await fetch(url, { method: 'POST', body: 'data=' + encodeURIComponent(query), headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, signal: ac.signal })
      if (res.status === 429 || res.status === 504) { await sleep(3000); continue }
      if (!res.ok) { await sleep(1500); continue }
      const j = await res.json()
      return j.elements || []
    } catch { await sleep(1500) } finally { clearTimeout(timer) }
  }
  return null
}

function categorize(elements, lat, lng) {
  const restos = [], mosquees = [], activites = []
  for (const el of elements) {
    const t = el.tags || {}
    const elat = el.lat ?? el.center?.lat, elng = el.lon ?? el.center?.lon
    const name = t.name || t['name:fr'] || t['name:en']
    if (!elat || !elng || !name) continue
    const dist = haversine(lat, lng, elat, elng)
    if (t.amenity === 'restaurant' || t.amenity === 'fast_food') {
      const certified = t['diet:halal'] === 'yes' || t['diet:halal'] === 'only'
      if (!certified && !HALAL_CUISINE.test(String(t.cuisine || ''))) continue
      restos.push({
        nom: name,
        type: t.cuisine ? String(t.cuisine).replace(/_/g, ' ').replace(/;/g, ', ') : 'Restaurant halal',
        priceRange: t['price:range'] || '€€',
        mapsUrl: maps(elat, elng), lat: elat, lng: elng,
        halalConfidence: t['diet:halal'] === 'only' ? 'only' : certified ? 'yes' : 'likely',
        source: 'osm', _d: dist,
      })
    } else if (t.amenity === 'place_of_worship') {
      mosquees.push({ id: 'm' + el.id, nom: name, type: 'Mosquée', adresse: [t['addr:street'], t['addr:city']].filter(Boolean).join(', '), description: 'Lieu de prière (OpenStreetMap).', mapsUrl: maps(elat, elng), lat: elat, lng: elng, source: 'osm', _d: dist })
    } else if (t.tourism || t.historic) {
      activites.push({ id: 'a' + el.id, nom: name, categorie: (t.tourism || t.historic).replace(/_/g, ' '), description: '', prix: '', duree: '', mapsUrl: maps(elat, elng), lat: elat, lng: elng, source: 'osm', _d: dist })
    }
  }
  const rank = (h) => (h === 'only' || h === 'yes' ? 0 : 1)
  restos.sort((a, b) => rank(a.halalConfidence) - rank(b.halalConfidence) || a._d - b._d)
  mosquees.sort((a, b) => a._d - b._d)
  activites.sort((a, b) => a._d - b._d)
  const strip = (arr) => arr.map(({ _d, ...r }) => r)
  // Plafonds généreux (premium) : on baque un maximum de vraies adresses OSM.
  return { restos: strip(restos).slice(0, 60), mosquees: strip(mosquees).slice(0, 60), activites: strip(activites).slice(0, 30) }
}

async function main() {
  const files = readdirSync(VDIR).filter((f) => f.endsWith('.json'))
  const idx = JSON.parse(readFileSync(INDEX, 'utf-8'))
  const idxBy = Object.fromEntries(idx.map((c) => [c.slug, c]))
  let processed = 0, enriched = 0
  for (const f of files) {
    const fp = path.join(VDIR, f)
    const v = JSON.parse(readFileSync(fp, 'utf-8'))
    const co = v.coordonnees
    if (!co || typeof co.lat !== 'number' || typeof co.lng !== 'number') continue
    // Ville à la main (restaurants curés, jamais touchée par OSM) → on ne clobbe jamais.
    const curated = (v.restaurants?.length) && !v.osmEnriched
    if (curated) continue
    // Périmètre 'empty' : on saute les villes déjà enrichies ; 'all' : on rafraîchit tout.
    if (SCOPE !== 'all' && v.osmEnriched) continue
    if (SCOPE !== 'all' && (v.restaurants?.length)) continue
    processed++
    const els = await overpass(buildQuery(co.lat, co.lng))
    if (els === null) { console.log('⚠️  Overpass KO pour', v.slug); await sleep(2000); continue }
    const { restos, mosquees, activites } = categorize(els, co.lat, co.lng)
    // Remplace un tableau si l'OSM ramène mieux ET que l'existant est vide ou déjà d'origine OSM
    // (préserve les éléments curés à la main qui n'ont pas de champ source:'osm').
    const osmOrigin = (arr) => arr && arr.length && arr[0] && arr[0].source === 'osm'
    if (restos.length && (!(v.restaurants?.length) || osmOrigin(v.restaurants))) v.restaurants = restos
    if (mosquees.length && (!(v.mosqueesPrincipales?.length) || osmOrigin(v.mosqueesPrincipales))) v.mosqueesPrincipales = mosquees
    if (activites.length && (!(v.activites?.length) || osmOrigin(v.activites))) v.activites = activites
    v.statistiques = {
      restaurants_halal: v.restaurants.length,
      mosquees: v.mosqueesPrincipales.length,
      hotels: v.hotels?.length || 0,
    }
    v.osmEnriched = true
    v.osmEnrichedAt = new Date().toISOString().slice(0, 10)
    delete v.donneesAVenir
    writeFileSync(fp, JSON.stringify(v, null, 1) + '\n', 'utf-8')
    if (idxBy[v.slug]) {
      idxBy[v.slug].restaurants_halal = v.restaurants.length
      idxBy[v.slug].mosquees = v.mosqueesPrincipales.length
    }
    enriched++
    console.log(`✓ ${v.slug}: ${restos.length} restos, ${mosquees.length} mosquées, ${activites.length} activités`)
    await sleep(1200) // respect des quotas Overpass
  }
  writeFileSync(INDEX, JSON.stringify(idx, null, 1) + '\n', 'utf-8')
  console.log(`\nTerminé — ${enriched}/${processed} villes enrichies.`)
}
main()
