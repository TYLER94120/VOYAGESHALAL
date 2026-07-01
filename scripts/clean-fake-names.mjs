#!/usr/bin/env node
/**
 * Supprime les restaurants CURÉS (source ≠ 'osm') dont le nom exact apparaît dans
 * ≥ 3 villes différentes : un vrai restaurant indépendant n'existe pas dans 10
 * pays. Ce sont des données templatées/fabriquées (« Sakura Halal », « Spice
 * Darbar », « Bait Al Karam »…) qui nuisent à la crédibilité.
 *
 * Ne touche JAMAIS aux entrées OpenStreetMap (réelles, même si le nom est
 * générique comme « Kebab House »), ni aux vraies chaînes (whitelist).
 *
 *   node scripts/clean-fake-names.mjs
 */
import { readFileSync, writeFileSync, readdirSync } from 'fs'
import path from 'path'

const VDIR = path.join(process.cwd(), 'data', 'villes')
const MIN_CITIES = 3

// Vraies chaînes multi-villes à conserver même si curées
const REAL_CHAINS = new Set(
  ['mcdonald\'s', 'kfc', 'burger king', 'subway', 'nando\'s', 'five guys', 'the halal guys', 'pizza hut', 'domino\'s'].map((s) => s)
)
const norm = (s) => (s || '').trim().toLowerCase()

function loadAll() {
  const files = readdirSync(VDIR).filter((f) => f.endsWith('.json'))
  return files.map((f) => ({ f, d: JSON.parse(readFileSync(path.join(VDIR, f), 'utf-8')) }))
}

function main() {
  const all = loadAll()
  // Compte les villes par nom curé
  const cityCount = new Map()
  for (const { d } of all) {
    for (const r of (d.restaurants || [])) {
      if (r.source === 'osm') continue
      const n = norm(r.nom)
      if (!n) continue
      if (!cityCount.has(n)) cityCount.set(n, new Set())
      cityCount.get(n).add(d.slug)
    }
  }
  // Noms fabriqués = curés présents dans ≥ MIN_CITIES villes, hors vraies chaînes
  const fake = new Set()
  for (const [n, cities] of cityCount) {
    if (cities.size >= MIN_CITIES && !REAL_CHAINS.has(n)) fake.add(n)
  }
  console.log(`Noms fabriqués détectés : ${fake.size}`)

  let removed = 0, filesChanged = 0
  for (const { f, d } of all) {
    const before = (d.restaurants || []).length
    if (!before) continue
    d.restaurants = d.restaurants.filter((r) => r.source === 'osm' || !fake.has(norm(r.nom)))
    const gone = before - d.restaurants.length
    if (gone > 0) {
      removed += gone; filesChanged++
      writeFileSync(path.join(VDIR, f), JSON.stringify(d, null, 2))
    }
  }
  console.log(`Entrées fabriquées supprimées : ${removed} · fichiers modifiés : ${filesChanged}`)
}

main()
