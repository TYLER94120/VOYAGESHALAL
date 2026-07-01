#!/usr/bin/env node
/**
 * Géocode TOUS les lieux sans coordonnées (restaurants, mosquées, activités) sur
 * les 354 villes, pour qu'ils apparaissent sur la carte « Autour de moi ».
 *
 * Priorité à l'ADRESSE (fiable) ; repli sur le NOM + ville si pas d'adresse.
 * Garde-fou : un résultat à plus de ~60 km du centre-ville est rejeté (mauvais
 * match). Aucune donnée inventée : si Nominatim ne trouve rien, on laisse le lieu
 * sans coordonnées.
 *
 *   node scripts/geocode-places.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { execSync } from 'child_process'
import path from 'path'

const VDIR = path.join(process.cwd(), 'data', 'villes')
const COMMIT_EVERY = 20 // commit+push périodique → reprenable, jamais de perte si timeout

function flush(label) {
  try {
    execSync('git add data/villes', { stdio: 'ignore' })
    const changed = execSync('git status --porcelain data/villes').toString().trim()
    if (!changed) return
    execSync('git config user.name "github-actions[bot]"', { stdio: 'ignore' })
    execSync('git config user.email "github-actions[bot]@users.noreply.github.com"', { stdio: 'ignore' })
    execSync(`git commit -m "data(geo): géocodage incrémental (${label})"`, { stdio: 'ignore' })
    execSync('git pull --rebase origin main', { stdio: 'ignore' })
    execSync('git push', { stdio: 'ignore' })
    console.log(`  ↑ commit poussé (${label})`)
  } catch (e) { console.log('  (commit ignoré:', String(e).slice(0, 80), ')') }
}
const UA = 'VoyagesHalal/1.0 (https://www.voyageshalal.fr; contact@voyageshalal.fr)'
const KEYS = ['restaurants', 'mosqueesPrincipales', 'activites']
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

// garde-fou : rejette un résultat à plus de ~60 km du centre-ville
function near(lat, lng, c) {
  if (!c || typeof c.lat !== 'number') return true
  return Math.abs(lat - c.lat) < 0.6 && Math.abs(lng - c.lng) < 0.8
}

const hasCoord = (x) =>
  typeof x.lat === 'number' || typeof (x.coordonnees || {}).lat === 'number'

async function main() {
  const files = readdirSync(VDIR).filter((f) => f.endsWith('.json'))
  let placesFixed = 0, placesMiss = 0, citiesTouched = 0, req = 0
  for (const f of files) {
    const fp = path.join(VDIR, f)
    const v = JSON.parse(readFileSync(fp, 'utf-8'))
    const center = v.coordonnees || null
    let changed = false

    for (const key of KEYS) {
      const arr = v[key]
      if (!Array.isArray(arr)) continue
      for (const item of arr) {
        if (!item || !item.nom || hasCoord(item)) continue
        // Requête : adresse d'abord (fiable), sinon nom + ville
        const addr = item.adresse || item.address
        const q = addr
          ? `${addr}, ${v.nom}${v.pays ? ', ' + v.pays : ''}`
          : `${item.nom}, ${v.nom}${v.pays ? ', ' + v.pays : ''}`
        req++
        const r = await geocode(q)
        await sleep(1100) // respect de la politique Nominatim (1 req/s)
        if (r && near(r.lat, r.lng, center)) {
          item.lat = r.lat
          item.lng = r.lng
          if (!item.mapsUrl) item.mapsUrl = maps(r.lat, r.lng)
          item.geocoded = true
          placesFixed++
          changed = true
        } else {
          placesMiss++
        }
      }
    }

    if (changed) {
      citiesTouched++
      writeFileSync(fp, JSON.stringify(v, null, 2))
      console.log(`✓ ${v.nom}: mise à jour (${placesFixed} placés cumulés)`)
      // Commit périodique → si le job est tué (timeout), rien n'est perdu et
      // un nouveau run reprend là où on s'est arrêté (script idempotent).
      if (citiesTouched % COMMIT_EVERY === 0) flush(`${placesFixed} lieux`)
    }
  }
  flush(`final · ${placesFixed} lieux`)
  console.log(`\nTerminé. Requêtes: ${req} · Lieux géocodés: ${placesFixed} · Non trouvés: ${placesMiss} · Villes modifiées: ${citiesTouched}`)
}

main().catch((e) => { console.error(e); process.exit(1) })
