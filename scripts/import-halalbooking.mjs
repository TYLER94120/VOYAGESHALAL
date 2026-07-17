#!/usr/bin/env node
/**
 * Import des resorts « piscine/plage privée (femmes) » VÉRIFIÉS HalalBooking.
 * Lit data/halalbooking-resorts.json (rempli à la main ou via l'export du
 * programme d'affiliation HalalBooking — source réelle, URL de preuve requise)
 * et fusionne dans data/villes/<slug>.json :
 *   - hôtel existant (même nom normalisé) → ajoute piscineNonMixte/plagePrivee
 *     + sourceEquipements: 'halalbooking' + halalBookingUrl
 *   - hôtel absent → l'ajoute avec source: 'halalbooking'
 * Une entrée SANS url de preuve est refusée. Rien n'est déduit.
 */
import { readFileSync, writeFileSync, existsSync } from 'fs'

const src = JSON.parse(readFileSync('data/halalbooking-resorts.json', 'utf-8'))
const norm = (s) => (s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').trim()
let ok = 0, ref = 0
for (const r of src.resorts || []) {
  if (!r.villeSlug || !r.nom || !r.url || !String(r.url).includes('halalbooking.com')) {
    console.log('✗ refusé (preuve manquante):', r.nom || '?'); ref++; continue
  }
  const fp = `data/villes/${r.villeSlug}.json`
  if (!existsSync(fp)) { console.log('✗ ville inconnue:', r.villeSlug); ref++; continue }
  const v = JSON.parse(readFileSync(fp, 'utf-8'))
  v.hotels = v.hotels || []
  let h = v.hotels.find((x) => norm(x.nom) === norm(r.nom))
  if (!h) {
    h = { nom: r.nom, source: 'halalbooking' }
    if (typeof r.lat === 'number') { h.lat = r.lat; h.lng = r.lng }
    v.hotels.unshift(h)
  }
  if (r.piscineNonMixte === true) h.piscineNonMixte = true
  if (r.plagePrivee === true) h.plagePrivee = true
  if (typeof r.note === 'number') h.note = r.note
  h.sourceEquipements = 'halalbooking'
  h.halalBookingUrl = r.url
  writeFileSync(fp, JSON.stringify(v, null, 1), 'utf-8')
  console.log('✓', r.villeSlug, '→', r.nom)
  ok++
}
console.log(`Import terminé : ${ok} resorts, ${ref} refusés`)
