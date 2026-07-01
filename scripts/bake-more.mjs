#!/usr/bin/env node
/**
 * Alimente CHAQUE ville en VRAIES données OpenStreetMap (coordonnées réelles) là
 * où la carte « Autour de moi » est vide/pauvre :
 *   - Mosquées  → mosqueesPrincipales (77 villes n'en affichaient aucune)
 *   - À faire   → activites           (116 villes en affichaient < 3)
 *
 * Fusionne sans doublon (nom proche + ≤ 90 m) : on GARDE l'existant (curé) et on
 * AJOUTE ce qui manque. Aucune donnée inventée : si Overpass ne renvoie rien, la
 * ville reste inchangée.
 *
 *   node scripts/bake-more.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { execSync } from 'child_process'
import path from 'path'

const VDIR = path.join(process.cwd(), 'data', 'villes')
const RADIUS = 18000
const CAP_MOSQ = 40, CAP_ACT = 60, COMMIT_EVERY = 25
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

function merge(existing, incoming, cap) {
  const out = [...existing]
  for (const n of incoming) {
    const nn = norm(n.nom), nc = co(n)
    const dup = out.some((e) => { const en = norm(e.nom), ec = co(e); if (en && en === nn) return true; return nc && ec ? hav(nc.lat, nc.lng, ec.lat, ec.lng) <= 90 : false })
    if (!dup) out.push(n)
  }
  return out.slice(0, cap)
}

// Catégorise une activité touristique OSM pour l'affichage.
function categorie(t) {
  if (t.tourism === 'museum' || t.tourism === 'gallery') return 'Culture'
  if (t.historic) return 'Histoire'
  if (t.tourism === 'viewpoint') return 'Panorama'
  if (t.leisure === 'park' || t.leisure === 'garden') return 'Nature'
  if (t.tourism === 'zoo' || t.tourism === 'theme_park') return 'Famille'
  if (t.amenity === 'marketplace' || t.shop) return 'Shopping'
  return 'À voir'
}

function flush(label) {
  try {
    execSync('git add data/villes', { stdio: 'ignore' })
    if (!execSync('git status --porcelain data/villes').toString().trim()) return
    execSync('git config user.name "github-actions[bot]"', { stdio: 'ignore' })
    execSync('git config user.email "github-actions[bot]@users.noreply.github.com"', { stdio: 'ignore' })
    execSync(`git commit -m "data(osm): mosquées + à faire (${label})"`, { stdio: 'ignore' })
    execSync('git pull --rebase origin main', { stdio: 'ignore' }); execSync('git push', { stdio: 'ignore' })
    console.log(`  ↑ ${label}`)
  } catch (e) { console.log('  (commit ignoré)', String(e).slice(0, 60)) }
}

async function main() {
  const files = readdirSync(VDIR).filter((f) => f.endsWith('.json'))
  let done = 0, addM = 0, addA = 0
  for (const f of files) {
    const fp = path.join(VDIR, f)
    const v = JSON.parse(readFileSync(fp, 'utf-8'))
    const c = v.coordonnees || {}
    if (typeof c.lat !== 'number') continue

    const mappableMosq = (v.mosqueesPrincipales || []).filter((m) => m.source === 'osm' && (m.coordonnees?.lat ?? m.lat) != null).length
    const mappableAct = (v.activites || []).filter((a) => (a.coordonnees?.lat ?? a.lat) != null).length
    const needMosq = mappableMosq < 6, needAct = mappableAct < 8
    if (!needMosq && !needAct) continue

    let q = `[out:json][timeout:80];(`
    if (needMosq) {
      q += `node["amenity"="place_of_worship"]["religion"="muslim"](around:${RADIUS},${c.lat},${c.lng});`
        + `way["amenity"="place_of_worship"]["religion"="muslim"](around:${RADIUS},${c.lat},${c.lng});`
    }
    if (needAct) {
      q += `node["tourism"~"attraction|museum|gallery|viewpoint|artwork|zoo|theme_park"](around:${RADIUS},${c.lat},${c.lng});`
        + `way["tourism"~"attraction|museum|gallery|viewpoint|zoo|theme_park"](around:${RADIUS},${c.lat},${c.lng});`
        + `node["historic"~"monument|memorial|castle|ruins|fort|city_gate|archaeological_site"](around:${RADIUS},${c.lat},${c.lng});`
        + `way["historic"~"monument|memorial|castle|ruins|fort|city_gate|archaeological_site"](around:${RADIUS},${c.lat},${c.lng});`
        + `node["leisure"~"park|garden"]["name"](around:${RADIUS},${c.lat},${c.lng});`
    }
    q += `);out center;`

    const els = await overpass(q)
    await sleep(1200)
    if (!els) { console.log(`… ${v.nom}: Overpass indisponible`); continue }

    const mosq = [], act = []
    for (const el of els) {
      const lat = el.lat ?? el.center?.lat, lng = el.lon ?? el.center?.lng
      const nom = el.tags?.name || el.tags?.['name:fr'] || el.tags?.['name:en']
      if (!lat || !lng || !nom) continue
      const t = el.tags || {}
      const d = hav(c.lat, c.lng, lat, lng)
      if (t.amenity === 'place_of_worship') {
        const adr = [t['addr:street'], t['addr:city']].filter(Boolean).join(', ')
        mosq.push({ nom, lat, lng, coordonnees: { lat, lng }, adresse: adr || undefined, mapsUrl: maps(lat, lng), source: 'osm', _d: d })
      } else {
        act.push({ nom, lat, lng, coordonnees: { lat, lng }, categorie: categorie(t), mapsUrl: maps(lat, lng), source: 'osm', _d: d })
      }
    }
    mosq.sort((a, b) => a._d - b._d); act.sort((a, b) => a._d - b._d)
    const strip = (a) => a.map(({ _d, ...x }) => x) // eslint-disable-line no-unused-vars
    if (!mosq.length && !act.length) { console.log(`… ${v.nom}: 0 trouvé`); continue }

    const bM = (v.mosqueesPrincipales || []).length, bA = (v.activites || []).length
    if (needMosq && mosq.length) v.mosqueesPrincipales = merge(v.mosqueesPrincipales || [], strip(mosq), CAP_MOSQ)
    if (needAct && act.length) v.activites = merge(v.activites || [], strip(act), CAP_ACT)
    const dM = (v.mosqueesPrincipales || []).length - bM, dA = (v.activites || []).length - bA
    if (!dM && !dA) { console.log(`… ${v.nom}: rien de neuf`); continue }
    addM += dM; addA += dA
    writeFileSync(fp, JSON.stringify(v, null, 2)); done++
    console.log(`✓ ${v.nom}: +${dM} mosquées, +${dA} à faire`)
    if (done % COMMIT_EVERY === 0) flush(`${done} villes`)
  }
  flush(`final · ${done} villes · +${addM} mosquées · +${addA} à faire`)
  console.log(`\nTerminé. Villes: ${done} · +${addM} mosquées · +${addA} à faire`)
}
main().catch((e) => { console.error(e); process.exit(1) })
