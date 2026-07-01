#!/usr/bin/env node
/**
 * Remplace les mosquées FABRIQUÉES (toutes à la même coordonnée = centre-ville,
 * sans source) par de VRAIES mosquées OpenStreetMap (coordonnées réelles), pour
 * les ~100 villes concernées (Paris, Rome, Tokyo, Londres, Médine…).
 *
 * Requête Overpass autour du centre-ville. Aucune donnée inventée : si Overpass
 * ne renvoie rien, on laisse la ville telle quelle.
 *
 *   node scripts/bake-mosques.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { execSync } from 'child_process'
import path from 'path'

const VDIR = path.join(process.cwd(), 'data', 'villes')
const RADIUS = 18000 // 18 km autour du centre-ville
const CAP = 50
const COMMIT_EVERY = 25
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const maps = (lat, lng) => `https://maps.google.com/?q=${lat},${lng}`

function isFabricated(arr) {
  if (!Array.isArray(arr) || !arr.length) return false
  const co = (m) => { const c = m.coordonnees || {}; return `${c.lat ?? m.lat},${c.lng ?? m.lng}` }
  const nonOsm = arr.filter((m) => m.source !== 'osm' && (m.coordonnees?.lat ?? m.lat) != null)
  return nonOsm.length > 0 && new Set(nonOsm.map(co)).size === 1
}

// Approche SÉQUENTIELLE avec retry + backoff sur 429/504 (identique à enrich-osm,
// qui fonctionne — contrairement à Promise.any qui abandonne dès le 1er rejet).
const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://maps.mail.ru/osm/tools/overpass/api/interpreter',
]
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

function flush(label) {
  try {
    execSync('git add data/villes', { stdio: 'ignore' })
    if (!execSync('git status --porcelain data/villes').toString().trim()) return
    execSync('git config user.name "github-actions[bot]"', { stdio: 'ignore' })
    execSync('git config user.email "github-actions[bot]@users.noreply.github.com"', { stdio: 'ignore' })
    execSync(`git commit -m "data(osm): vraies mosquées OSM (${label})"`, { stdio: 'ignore' })
    execSync('git pull --rebase origin main', { stdio: 'ignore' })
    execSync('git push', { stdio: 'ignore' })
    console.log(`  ↑ ${label}`)
  } catch (e) { console.log('  (commit ignoré)', String(e).slice(0, 60)) }
}

async function main() {
  const files = readdirSync(VDIR).filter((f) => f.endsWith('.json'))
  let done = 0, totalM = 0
  for (const f of files) {
    const fp = path.join(VDIR, f)
    const v = JSON.parse(readFileSync(fp, 'utf-8'))
    if (!isFabricated(v.mosqueesPrincipales)) continue
    const c = v.coordonnees || {}
    if (typeof c.lat !== 'number') continue
    const q = `[out:json][timeout:50];(node["amenity"="place_of_worship"]["religion"="muslim"](around:${RADIUS},${c.lat},${c.lng});way["amenity"="place_of_worship"]["religion"="muslim"](around:${RADIUS},${c.lat},${c.lng}););out center;`
    const els = await overpass(q)
    await sleep(1200)
    if (!els) { console.log(`… ${v.nom}: Overpass indisponible, inchangé`); continue }
    const R = 6371000, p = Math.PI / 180
    const hav = (a, b, cc, dd) => { const x = Math.sin(((cc - a) * p) / 2) ** 2 + Math.cos(a * p) * Math.cos(cc * p) * Math.sin(((dd - b) * p) / 2) ** 2; return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)) }
    const seen = new Set()
    const mosques = els.map((el) => {
      const lat = el.lat ?? el.center?.lat, lng = el.lon ?? el.center?.lng
      const nom = el.tags?.name || el.tags?.['name:fr'] || el.tags?.['name:en']
      if (!lat || !lng || !nom) return null
      const key = nom.toLowerCase()
      if (seen.has(key)) return null; seen.add(key)
      const adr = [el.tags?.['addr:street'], el.tags?.['addr:city']].filter(Boolean).join(', ')
      return { nom, lat, lng, coordonnees: { lat, lng }, adresse: adr || undefined, mapsUrl: maps(lat, lng), source: 'osm', dist: hav(c.lat, c.lng, lat, lng) }
    }).filter(Boolean).sort((a, b) => a.dist - b.dist).slice(0, CAP)
      .map(({ dist, ...m }) => m) // eslint-disable-line no-unused-vars
    if (!mosques.length) { console.log(`… ${v.nom}: 0 mosquée OSM trouvée`); continue }
    v.mosqueesPrincipales = mosques
    writeFileSync(fp, JSON.stringify(v, null, 2))
    done++; totalM += mosques.length
    console.log(`✓ ${v.nom}: ${mosques.length} mosquées OSM réelles`)
    if (done % COMMIT_EVERY === 0) flush(`${done} villes`)
  }
  flush(`final · ${done} villes · ${totalM} mosquées`)
  console.log(`\nTerminé. Villes re-bakées: ${done} · mosquées: ${totalM}`)
}
main().catch((e) => { console.error(e); process.exit(1) })
