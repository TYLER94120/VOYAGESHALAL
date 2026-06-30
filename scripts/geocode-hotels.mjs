#!/usr/bin/env node
/**
 * Géocode les hôtels CURÉS (noms réels mais sans coordonnées) via Nominatim,
 * pour que toutes les villes — y compris les phares (Tokyo, Istanbul…) — aient
 * des hôtels avec lat/lng. On garde les noms curés, on ajoute juste lat/lng/mapsUrl.
 * Aucune donnée inventée : si Nominatim ne trouve pas, on laisse l'hôtel sans coords.
 *
 *   node scripts/geocode-hotels.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import path from 'path'

const VDIR = path.join(process.cwd(), 'data', 'villes')
const UA = 'VoyagesHalal/1.0 (https://www.voyageshalal.fr; contact@voyageshalal.fr)'
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const maps = (lat, lng) => `https://maps.google.com/?q=${lat},${lng}`

async function geocode(q) {
  const url = 'https://nominatim.openstreetmap.org/search?format=json&limit=1&q=' + encodeURIComponent(q)
  const ac = new AbortController()
  const timer = setTimeout(() => ac.abort(), 20000)
  try {
    const res = await fetch(url, { headers: { 'User-Agent': UA, 'Accept-Language': 'fr,en' }, signal: ac.signal })
    if (!res.ok) return null
    const j = await res.json()
    if (Array.isArray(j) && j[0] && j[0].lat && j[0].lon) return { lat: parseFloat(j[0].lat), lng: parseFloat(j[0].lon) }
    return null
  } catch { return null } finally { clearTimeout(timer) }
}

function near(lat, lng, c) {
  // garde-fou : on rejette un résultat à plus de ~60 km du centre-ville (mauvais match)
  if (!c || typeof c.lat !== 'number') return true
  const dLat = Math.abs(lat - c.lat), dLng = Math.abs(lng - c.lng)
  return dLat < 0.6 && dLng < 0.8
}

async function main() {
  const files = readdirSync(VDIR).filter((f) => f.endsWith('.json'))
  let cities = 0, fixed = 0, miss = 0
  for (const f of files) {
    const fp = path.join(VDIR, f)
    const v = JSON.parse(readFileSync(fp, 'utf-8'))
    const hotels = v.hotels || []
    const todo = hotels.filter((h) => h && h.nom && (h.lat == null || h.lng == null))
    if (!todo.length) continue
    cities++
    let changed = false
    for (const h of todo) {
      const q = `${h.nom}, ${v.nom}${v.pays ? ', ' + v.pays : ''}`
      let r = await geocode(q)
      await sleep(1100) // politique Nominatim : ~1 req/s
      if (!r) { r = await geocode(`${h.nom} ${v.nom}`); await sleep(1100) }
      if (r && near(r.lat, r.lng, v.coordonnees)) {
        h.lat = r.lat; h.lng = r.lng
        if (!h.mapsUrl || /\/maps\.google\.com\/\?q=$/.test(h.mapsUrl)) h.mapsUrl = maps(r.lat, r.lng)
        fixed++; changed = true
      } else { miss++ }
    }
    if (changed) {
      v.statistiques = v.statistiques || {}
      v.statistiques.hotels = hotels.length
      writeFileSync(fp, JSON.stringify(v, null, 1) + '\n', 'utf-8')
      console.log(`✓ ${v.slug}: ${todo.length} hôtels traités`)
    }
  }
  console.log(`\nTerminé — ${fixed} hôtels géocodés, ${miss} introuvables, sur ${cities} villes.`)
}
main()
