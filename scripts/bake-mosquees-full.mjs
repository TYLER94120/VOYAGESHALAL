#!/usr/bin/env node
/**
 * BLOC 2 (refonte data) — mosquées COMPLÈTES pour CHAQUE ville, depuis
 * OpenStreetMap (Overpass) : amenity=place_of_worship + religion=muslim.
 * Nom + coordonnées RÉELS uniquement, dédupliqué (nom proche ou ≤ 90 m),
 * cap 60/ville. Fusionne dans mosqueesPrincipales (source: 'osm').
 * Idempotent, commits incrémentaux. Aucune donnée inventée.
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { execSync } from 'child_process'
import path from 'path'

const VDIR = path.join(process.cwd(), 'data', 'villes')
const RADIUS = 15000, CAP = 60, COMMIT_EVERY = 30
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

function flush(label) {
  try {
    execSync('git add data/villes', { stdio: 'ignore' })
    if (!execSync('git status --porcelain data/villes').toString().trim()) return
    execSync('git config user.name "github-actions[bot]"', { stdio: 'ignore' })
    execSync('git config user.email "github-actions[bot]@users.noreply.github.com"', { stdio: 'ignore' })
    execSync(`git commit -m "data(osm): mosquées complètes (${label})"`, { stdio: 'ignore' })
    execSync('git pull --rebase origin main', { stdio: 'ignore' }); execSync('git push', { stdio: 'ignore' })
    console.log(`  ↑ ${label}`)
  } catch (e) { console.log('  (commit ignoré)', String(e).slice(0, 60)) }
}

async function main() {
  const files = readdirSync(VDIR).filter((f) => f.endsWith('.json'))
  let done = 0, added = 0
  for (const f of files) {
    const fp = path.join(VDIR, f)
    const v = JSON.parse(readFileSync(fp, 'utf-8'))
    const c = v.coordonnees || {}
    if (typeof c.lat !== 'number') continue

    const q = `[out:json][timeout:80];(`
      + `node["amenity"="place_of_worship"]["religion"="muslim"](around:${RADIUS},${c.lat},${c.lng});`
      + `way["amenity"="place_of_worship"]["religion"="muslim"](around:${RADIUS},${c.lat},${c.lng});`
      + `relation["amenity"="place_of_worship"]["religion"="muslim"](around:${RADIUS},${c.lat},${c.lng});`
      + `);out center;`
    const els = await overpass(q)
    await sleep(1100)
    if (!els) { console.log(`… ${v.nom}: Overpass indisponible`); continue }

    const mosq = []
    for (const el of els) {
      const lat = el.lat ?? el.center?.lat, lng = el.lon ?? el.center?.lon
      const nom = el.tags?.name || el.tags?.['name:fr'] || el.tags?.['name:en'] || el.tags?.['name:ar']
      if (!lat || !lng || !nom) continue
      mosq.push({
        id: `osm-${el.id}`, nom: String(nom).slice(0, 90), type: 'mosquee',
        adresse: [el.tags?.['addr:street'], el.tags?.['addr:city']].filter(Boolean).join(', ') || undefined,
        lat, lng, mapsUrl: maps(lat, lng), source: 'osm',
      })
    }
    const before = (v.mosqueesPrincipales || []).length
    v.mosqueesPrincipales = merge(v.mosqueesPrincipales || [], mosq, CAP)
    const gain = v.mosqueesPrincipales.length - before
    if (gain > 0) {
      v.statistiques = { ...(v.statistiques || {}), mosquees: v.mosqueesPrincipales.length }
      v.osmEnrichedAt = new Date().toISOString().slice(0, 10)
      writeFileSync(fp, JSON.stringify(v, null, 1), 'utf-8')
      added += gain
      console.log(`✓ ${v.nom}: +${gain} (total ${v.mosqueesPrincipales.length})`)
    }
    if (++done % COMMIT_EVERY === 0) flush(`${done}/${files.length}`)
  }
  flush('final')
  console.log(`Terminé : ${done} villes, +${added} mosquées réelles`)
}
main()
