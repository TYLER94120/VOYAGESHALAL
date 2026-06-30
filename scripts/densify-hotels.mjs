#!/usr/bin/env node
/**
 * Densifie les hôtels de CHAQUE ville : on garde les hôtels curés géolocalisés
 * (noms premium : Aman, Four Seasons…) et on AJOUTE les hôtels OSM (tourism=hotel)
 * avec vraies coordonnées, pour que chaque ville ait beaucoup d'hôtels mappables.
 * Aucune donnée inventée (tout vient d'OSM/curation). Ne touche ni aux restos,
 * ni aux mosquées, ni aux activités.
 *
 *   node scripts/densify-hotels.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import path from 'path'

const VDIR = path.join(process.cwd(), 'data', 'villes')
const INDEX = path.join(process.cwd(), 'data', 'index-villes.json')
const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
]
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const maps = (lat, lng) => `https://maps.google.com/?q=${lat},${lng}`
function haversine(a, b, c, d) {
  const R = 6371000, p = Math.PI / 180
  const x = Math.sin(((c - a) * p) / 2) ** 2 + Math.cos(a * p) * Math.cos(c * p) * Math.sin(((d - b) * p) / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x))
}

async function overpass(query) {
  for (let attempt = 0; attempt < ENDPOINTS.length * 2; attempt++) {
    const url = ENDPOINTS[attempt % ENDPOINTS.length]
    const ac = new AbortController()
    const timer = setTimeout(() => ac.abort(), 75000)
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

const query = (lat, lng) =>
  `[out:json][timeout:60];(` +
  `node["tourism"~"hotel|guest_house|hostel|apartment"](around:9000,${lat},${lng});` +
  `way["tourism"~"hotel|guest_house|hostel|apartment"](around:9000,${lat},${lng});` +
  `);out center tags;`

function osmHotels(elements, lat, lng) {
  const out = []
  for (const el of elements) {
    const t = el.tags || {}
    const elat = el.lat ?? el.center?.lat, elng = el.lon ?? el.center?.lon
    const name = t.name || t['name:fr'] || t['name:en']
    if (!elat || !elng || !name) continue
    out.push({
      nom: name,
      categorie: t.tourism === 'hotel' ? 'Hôtel' : t.tourism === 'guest_house' ? "Maison d'hôtes" : t.tourism === 'hostel' ? 'Auberge' : 'Appartement',
      priceRange: t['price:range'] || (t.stars ? '€'.repeat(Math.min(4, Math.max(1, parseInt(t.stars) || 2))) : '€€'),
      score: t.stars ? Number(t.stars) : undefined,
      mapsUrl: maps(elat, elng), lat: elat, lng: elng,
      halalFriendly: false, bookingUrl: t.website || maps(elat, elng),
      source: 'osm', _d: haversine(lat, lng, elat, elng),
    })
  }
  out.sort((a, b) => a._d - b._d)
  return out
}

async function main() {
  const files = readdirSync(VDIR).filter((f) => f.endsWith('.json'))
  const idx = JSON.parse(readFileSync(INDEX, 'utf-8'))
  const idxBy = Object.fromEntries(idx.map((c) => [c.slug, c]))
  let touched = 0, added = 0
  for (const f of files) {
    const fp = path.join(VDIR, f)
    const v = JSON.parse(readFileSync(fp, 'utf-8'))
    const co = v.coordonnees
    if (!co || typeof co.lat !== 'number') continue
    const els = await overpass(query(co.lat, co.lng))
    await sleep(1000)
    if (els === null) { console.log('⚠️  Overpass KO', v.slug); continue }
    const osm = osmHotels(els, co.lat, co.lng)
    const existing = (v.hotels || []).filter((h) => h && h.nom)
    const names = new Set(existing.map((h) => String(h.nom).toLowerCase()))
    const withCoords = existing.filter((h) => h.lat != null)
    const noCoords = existing.filter((h) => h.lat == null)
    const fresh = osm.filter((h) => !names.has(h.nom.toLowerCase())).map(({ _d, ...h }) => h)
    // Premium curés géolocalisés d'abord, puis OSM (par distance), puis curés sans coords en fin
    const merged = [...withCoords, ...fresh, ...noCoords].slice(0, 120)
    const before = existing.length
    v.hotels = merged
    v.statistiques = v.statistiques || {}
    v.statistiques.hotels = merged.length
    writeFileSync(fp, JSON.stringify(v, null, 1) + '\n', 'utf-8')
    if (idxBy[v.slug]) idxBy[v.slug].hotels = merged.length
    const gained = merged.length - before
    if (gained > 0) added += gained
    touched++
    console.log(`✓ ${v.slug}: ${merged.length} hôtels (${merged.filter((h) => h.lat != null).length} géoloc) [+${Math.max(0, gained)}]`)
  }
  writeFileSync(INDEX, JSON.stringify(idx, null, 1) + '\n', 'utf-8')
  console.log(`\nTerminé — ${touched} villes, +${added} hôtels ajoutés.`)
}
main()
