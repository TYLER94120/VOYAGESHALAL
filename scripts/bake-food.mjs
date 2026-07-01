#!/usr/bin/env node
/**
 * Enrichit CHAQUE ville avec les restaurants halal + boucheries halal réels
 * d'OpenStreetMap (coordonnées réelles), pour que la carte « Autour de moi » soit
 * dense partout — y compris dans les villes curées (Paris, Tokyo…) qui n'avaient
 * que leurs adresses éditoriales, et les boucheries (quasi vides).
 *
 * Fusionne (dédup nom+≤80 m) : on garde les entrées existantes (curées) et on
 * AJOUTE les OSM manquantes. Aucune donnée inventée.
 *
 *   node scripts/bake-food.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { execSync } from 'child_process'
import path from 'path'

const VDIR = path.join(process.cwd(), 'data', 'villes')
const RADIUS = 10000
const CAP_RESTO = 150, CAP_BOUCH = 60, COMMIT_EVERY = 25
const CU = 'kebab|turkish|lebanese|arab|syrian|persian|iranian|afghan|pakistani|bangladeshi|egyptian|moroccan|uyghur|halal|doner|shawarma|biryani|indian|tunisian|algerian|senegalese'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const maps = (lat, lng) => `https://maps.google.com/?q=${lat},${lng}`
const ENDPOINTS = ['https://overpass-api.de/api/interpreter', 'https://overpass.kumi.systems/api/interpreter', 'https://maps.mail.ru/osm/tools/overpass/api/interpreter']

async function overpass(query) {
  for (let attempt = 0; attempt < ENDPOINTS.length * 2; attempt++) {
    const url = ENDPOINTS[attempt % ENDPOINTS.length]
    const ac = new AbortController(); const timer = setTimeout(() => ac.abort(), 90000)
    try {
      const res = await fetch(url, { method: 'POST', body: 'data=' + encodeURIComponent(query), headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, signal: ac.signal })
      if (res.status === 429 || res.status === 504) { await sleep(3000); continue }
      if (!res.ok) { await sleep(1500); continue }
      const j = await res.json(); return j.elements || []
    } catch { await sleep(1500) } finally { clearTimeout(timer) }
  }
  return null
}

const norm = (s) => (s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').trim()
function hav(a, b, c, d) { const R = 6371000, p = Math.PI / 180; const x = Math.sin(((c - a) * p) / 2) ** 2 + Math.cos(a * p) * Math.cos(c * p) * Math.sin(((d - b) * p) / 2) ** 2; return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)) }
const co = (o) => { const lat = o.lat ?? o.coordonnees?.lat, lng = o.lng ?? o.coordonnees?.lng; return typeof lat === 'number' ? { lat, lng } : null }

// Fusionne les nouveaux (OSM) dans l'existant sans doublon (nom proche + ≤80 m)
function merge(existing, incoming, cap) {
  const out = [...existing]
  for (const n of incoming) {
    const nn = norm(n.nom), nc = co(n)
    const dup = out.some((e) => { const en = norm(e.nom), ec = co(e); if (en && en === nn) return true; return nc && ec ? hav(nc.lat, nc.lng, ec.lat, ec.lng) <= 80 : false })
    if (!dup) out.push(n)
  }
  return out.slice(0, cap)
}

function flush(label) {
  try {
    execSync('git add data/villes', { stdio: 'ignore' })
    if (!execSync('git status --porcelain data/villes').toString().trim()) return
    execSync('git config user.name "github-actions[bot]"', { stdio: 'ignore' })
    execSync('git config user.email "github-actions[bot]@users.noreply.github.com"', { stdio: 'ignore' })
    execSync(`git commit -m "data(osm): restaurants + boucheries halal (${label})"`, { stdio: 'ignore' })
    execSync('git pull --rebase origin main', { stdio: 'ignore' }); execSync('git push', { stdio: 'ignore' })
    console.log(`  ↑ ${label}`)
  } catch (e) { console.log('  (commit ignoré)', String(e).slice(0, 60)) }
}

async function main() {
  const files = readdirSync(VDIR).filter((f) => f.endsWith('.json'))
  let done = 0, addedR = 0, addedB = 0
  for (const f of files) {
    const fp = path.join(VDIR, f)
    const v = JSON.parse(readFileSync(fp, 'utf-8'))
    const c = v.coordonnees || {}
    if (typeof c.lat !== 'number') continue
    const q = `[out:json][timeout:60];(`
      + `node["amenity"~"restaurant|fast_food"]["diet:halal"~"yes|only"](around:${RADIUS},${c.lat},${c.lng});`
      + `way["amenity"~"restaurant|fast_food"]["diet:halal"~"yes|only"](around:${RADIUS},${c.lat},${c.lng});`
      + `node["amenity"~"restaurant|fast_food|cafe"]["cuisine"~"${CU}",i](around:${RADIUS},${c.lat},${c.lng});`
      + `way["amenity"~"restaurant|fast_food|cafe"]["cuisine"~"${CU}",i](around:${RADIUS},${c.lat},${c.lng});`
      + `node["shop"="butcher"]["diet:halal"~"yes|only"](around:${RADIUS},${c.lat},${c.lng});`
      + `node["shop"="butcher"]["halal"~"yes|only"](around:${RADIUS},${c.lat},${c.lng});`
      + `way["shop"="butcher"]["diet:halal"~"yes|only"](around:${RADIUS},${c.lat},${c.lng});`
      + `);out center;`
    const els = await overpass(q)
    await sleep(1200)
    if (!els) { console.log(`… ${v.nom}: Overpass indisponible`); continue }
    const restos = [], bouch = []
    for (const el of els) {
      const lat = el.lat ?? el.center?.lat, lng = el.lon ?? el.center?.lng
      const nom = el.tags?.name || el.tags?.['name:fr'] || el.tags?.['name:en']
      if (!lat || !lng || !nom) continue
      const t = el.tags || {}
      if (t.shop === 'butcher') {
        bouch.push({ nom, lat, lng, type: 'Boucherie halal', mapsUrl: maps(lat, lng), source: 'osm', _d: hav(c.lat, c.lng, lat, lng) })
      } else {
        const halal = t['diet:halal'] === 'only' ? 'certified' : t['diet:halal'] === 'yes' ? 'high' : 'likely'
        restos.push({ nom, lat, lng, type: t.cuisine ? String(t.cuisine).replace(/_/g, ' ').replace(/;/g, ', ') : 'Restaurant', halalConfidence: halal, mapsUrl: maps(lat, lng), source: 'osm', _d: hav(c.lat, c.lng, lat, lng) })
      }
    }
    restos.sort((a, b) => a._d - b._d); bouch.sort((a, b) => a._d - b._d)
    const strip = (a) => a.map(({ _d, ...x }) => x) // eslint-disable-line no-unused-vars
    if (!restos.length && !bouch.length) { console.log(`… ${v.nom}: 0 trouvé`); continue }
    const beforeR = (v.restaurants || []).length, beforeB = (v.boucheries || []).length
    v.restaurants = merge(v.restaurants || [], strip(restos), CAP_RESTO)
    v.boucheries = merge(v.boucheries || [], strip(bouch), CAP_BOUCH)
    addedR += v.restaurants.length - beforeR; addedB += v.boucheries.length - beforeB
    writeFileSync(fp, JSON.stringify(v, null, 2)); done++
    console.log(`✓ ${v.nom}: +${v.restaurants.length - beforeR} restos, +${v.boucheries.length - beforeB} boucheries`)
    if (done % COMMIT_EVERY === 0) flush(`${done} villes`)
  }
  flush(`final · ${done} villes · +${addedR} restos · +${addedB} boucheries`)
  console.log(`\nTerminé. Villes: ${done} · +${addedR} restos · +${addedB} boucheries`)
}
main().catch((e) => { console.error(e); process.exit(1) })
