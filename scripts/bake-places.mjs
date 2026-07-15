#!/usr/bin/env node
/**
 * BLOC 1 (refonte data) — restaurants RÉELS via Google Places Text Search.
 * Source de vérité : nom réel, note réelle, nb d'avis réel, prix réel,
 * coordonnées réelles, place_id. JAMAIS de donnée inventée.
 *
 * - Requiert GOOGLE_PLACES_API_KEY (secret GitHub).
 * - GARDE-FOU BUDGET : MAX_REQUESTS (défaut 900 ≈ 29 $ au tarif Text Search).
 * - Recherche : "halal restaurant in {ville}, {pays}" (2 pages max = ~40 lieux).
 * - Fusionne avec l'existant OSM (dédup nom/90 m) ; la version Google (notée)
 *   remplace le doublon OSM. source: 'google'.
 * - Commits incrémentaux ; idempotent (saute les villes déjà bakées Google
 *   depuis < 90 jours, sauf FORCE=1).
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import { execSync } from 'child_process'
import path from 'path'

const KEY = process.env.GOOGLE_PLACES_API_KEY
if (!KEY) { console.error('GOOGLE_PLACES_API_KEY manquant — abandon (aucune donnée inventée à la place).'); process.exit(1) }
const MAX_REQUESTS = parseInt(process.env.MAX_REQUESTS || '900', 10)
const FORCE = process.env.FORCE === '1'
const VDIR = path.join(process.cwd(), 'data', 'villes')
const COMMIT_EVERY = 20
let requests = 0
const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

const norm = (s) => (s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').trim()
function hav(a, b, c, d) { const R = 6371000, p = Math.PI / 180; const x = Math.sin(((c - a) * p) / 2) ** 2 + Math.cos(a * p) * Math.cos(c * p) * Math.sin(((d - b) * p) / 2) ** 2; return R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)) }

async function textSearch(query, pagetoken) {
  if (requests >= MAX_REQUESTS) return null
  requests++
  const url = pagetoken
    ? `https://maps.googleapis.com/maps/api/place/textsearch/json?pagetoken=${pagetoken}&key=${KEY}`
    : `https://maps.googleapis.com/maps/api/place/textsearch/json?query=${encodeURIComponent(query)}&key=${KEY}`
  try {
    const res = await fetch(url)
    const j = await res.json()
    if (j.status === 'OVER_QUERY_LIMIT') { console.error('QUOTA Google atteint — arrêt propre.'); return 'STOP' }
    if (j.status !== 'OK' && j.status !== 'ZERO_RESULTS') { console.log('  status', j.status); return null }
    return j
  } catch { return null }
}

const PRICE = { 0: '€', 1: '€', 2: '€€', 3: '€€€', 4: '€€€€' }

function flush(label) {
  try {
    execSync('git add data/villes', { stdio: 'ignore' })
    if (!execSync('git status --porcelain data/villes').toString().trim()) return
    execSync('git config user.name "github-actions[bot]"', { stdio: 'ignore' })
    execSync('git config user.email "github-actions[bot]@users.noreply.github.com"', { stdio: 'ignore' })
    execSync(`git commit -m "data(google): restaurants réels (${label})"`, { stdio: 'ignore' })
    execSync('git pull --rebase origin main', { stdio: 'ignore' }); execSync('git push', { stdio: 'ignore' })
    console.log(`  ↑ ${label}`)
  } catch (e) { console.log('  (commit ignoré)', String(e).slice(0, 60)) }
}

async function main() {
  const files = readdirSync(VDIR).filter((f) => f.endsWith('.json'))
  let done = 0, added = 0
  for (const f of files) {
    if (requests >= MAX_REQUESTS) { console.log('Budget de requêtes atteint — reprendre au prochain run.'); break }
    const fp = path.join(VDIR, f)
    const v = JSON.parse(readFileSync(fp, 'utf-8'))
    if (!FORCE && v.googleBakedAt && (Date.now() - new Date(v.googleBakedAt).getTime()) < 90 * 864e5) continue

    const results = []
    let page = await textSearch(`halal restaurant in ${v.nom}, ${v.pays || ''}`)
    if (page === 'STOP') break
    if (page?.results) results.push(...page.results)
    if (page?.next_page_token) {
      await sleep(2200) // le token Google met ~2 s à s'activer
      const p2 = await textSearch(null, page.next_page_token)
      if (p2 === 'STOP') break
      if (p2?.results) results.push(...p2.results)
    }

    const incoming = results
      .filter((r) => r.name && r.geometry?.location)
      .map((r) => ({
        id: `g-${r.place_id}`, placeId: r.place_id,
        nom: String(r.name).slice(0, 90),
        type: (r.types || []).includes('restaurant') ? 'restaurant' : (r.types?.[0] || 'restaurant'),
        note: typeof r.rating === 'number' ? r.rating : undefined,
        nombreAvis: typeof r.user_ratings_total === 'number' ? r.user_ratings_total : undefined,
        priceRange: PRICE[r.price_level] ?? undefined,
        adresse: r.formatted_address ? String(r.formatted_address).slice(0, 120) : undefined,
        lat: r.geometry.location.lat, lng: r.geometry.location.lng,
        mapsUrl: `https://www.google.com/maps/place/?q=place_id:${r.place_id}`,
        source: 'google',
      }))

    if (incoming.length) {
      // dédup : la version GOOGLE (notée) remplace le doublon OSM
      const rest = (v.restaurants || []).filter((e) => {
        const en = norm(e.nom)
        return !incoming.some((n) => norm(n.nom) === en
          || (typeof e.lat === 'number' && hav(e.lat, e.lng, n.lat, n.lng) <= 90))
      })
      v.restaurants = [...incoming, ...rest]
      v.statistiques = { ...(v.statistiques || {}), restaurants_halal: v.restaurants.length }
      added += incoming.length
    }
    v.googleBakedAt = new Date().toISOString().slice(0, 10)
    writeFileSync(fp, JSON.stringify(v, null, 1), 'utf-8')
    console.log(`✓ ${v.nom}: ${incoming.length} lieux Google (req ${requests}/${MAX_REQUESTS})`)
    if (++done % COMMIT_EVERY === 0) flush(`${done} villes`)
    await sleep(250)
  }
  flush('final')
  console.log(`Terminé : ${done} villes, ${added} restaurants réels Google, ${requests} requêtes`)
}
main()
