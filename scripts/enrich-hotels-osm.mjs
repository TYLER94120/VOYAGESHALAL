#!/usr/bin/env node
// 🏨 ENRICHIR LES HÔTELS AVEC CE QU'OSM SAIT VRAIMENT.
//
// Constat mesuré : nos 222 hôtels d'Istanbul et Dubaï ne portaient que
// nom + coordonnées + « €€ ». Aucune information sur l'alcool, alors que
// la requête n°1 du site anglais est littéralement « non alcoholic
// hotels dubai ».
//
// OpenStreetMap porte parfois ces tags, posés par des contributeurs :
//   alcohol=no / served                → bar sans alcool
//   diet:halal=yes|only                → restauration halal
//   stars, phone, website, rooms       → utiles au lecteur
//   internet_access, wheelchair, brand
//
// RÈGLE INTOUCHABLE : on n'écrit QUE ce qu'OSM dit. Un hôtel sans tag
// `alcohol` ne devient pas « sans alcool » : il reste « information non
// vérifiée ». C'est ce qui nous sépare des fermes de contenu.
//
// On calcule aussi la distance à pied de la mosquée la plus proche, à
// partir des mosquées déjà présentes dans la fiche (donnée maison, personne
// d'autre ne le fait proprement).
//
// Usage : node scripts/enrich-hotels-osm.mjs istanbul dubai

import fs from 'fs'
import path from 'path'

const ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
]

const villes = process.argv.slice(2)
if (!villes.length) {
  console.error('Usage : node scripts/enrich-hotels-osm.mjs <slug> [slug…]')
  process.exit(1)
}

const dossier = path.join(process.cwd(), 'data', 'villes')

/** Distance en mètres (haversine). */
function distM(a, b, c, d) {
  const R = 6371000, p = Math.PI / 180
  const x = Math.sin(((c - a) * p) / 2) ** 2
    + Math.cos(a * p) * Math.cos(c * p) * Math.sin(((d - b) * p) / 2) ** 2
  return Math.round(R * 2 * Math.atan2(Math.sqrt(x), Math.sqrt(1 - x)))
}

async function overpass(query) {
  for (const url of ENDPOINTS) {
    try {
      const r = await fetch(url, { method: 'POST', body: 'data=' + encodeURIComponent(query) })
      if (!r.ok) continue
      return await r.json()
    } catch { /* on tente l'endpoint suivant */ }
  }
  return null
}

const norm = (s) => (s || '').normalize('NFKD').replace(/[̀-ͯ]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '')

for (const slug of villes) {
  const fichier = path.join(dossier, `${slug}.json`)
  if (!fs.existsSync(fichier)) { console.error(`✗ ${slug} : fiche absente`); continue }
  const ville = JSON.parse(fs.readFileSync(fichier, 'utf8'))
  const hotels = ville.hotels || []
  const mosquees = (ville.mosqueesPrincipales || []).filter((m) => m.lat && m.lng)
  if (!hotels.length) { console.log(`- ${slug} : aucun hôtel`); continue }

  const lat = ville.coordonnees?.lat, lng = ville.coordonnees?.lng
  if (lat == null) { console.error(`✗ ${slug} : pas de coordonnées`); continue }

  // Tous les hébergements de la ville, avec leurs tags
  const q = `[out:json][timeout:90];
(
  node["tourism"~"^(hotel|apartment|guest_house|hostel)$"](around:25000,${lat},${lng});
  way["tourism"~"^(hotel|apartment|guest_house|hostel)$"](around:25000,${lat},${lng});
);out center tags;`
  // Overpass peut être indisponible (ou le réseau coupé) : on continue quand
  // même, car la distance à la mosquée se calcule avec NOS données.
  const data = await overpass(q)
  if (!data?.elements) console.error(`  ⚠ ${slug} : Overpass indisponible — seules les distances mosquée seront calculées`)

  const osm = (data?.elements ?? []).map((e) => ({
    nom: e.tags?.name || '',
    lat: e.lat ?? e.center?.lat,
    lng: e.lon ?? e.center?.lon,
    tags: e.tags || {},
  })).filter((e) => e.lat && e.nom)

  let enrichis = 0, avecAlcool = 0, avecHalal = 0, avecMosquee = 0

  for (const h of hotels) {
    // Appariement : même nom normalisé ET moins de 150 m, sinon la position seule
    let match = null, meilleure = Infinity
    for (const e of osm) {
      const d = h.lat != null ? distM(h.lat, h.lng, e.lat, e.lng) : Infinity
      const memeNom = norm(h.nom) && norm(h.nom) === norm(e.nom)
      if (memeNom && d < 150) { match = e; break }
      if (memeNom && d < meilleure) { meilleure = d; match = e }
    }

    if (match) {
      const t = match.tags
      // ── Alcool : on ne note QUE ce qui est explicitement tagué ──
      if (t.alcohol === 'no') { h.sansAlcool = true; h.sourceAlcool = 'osm'; avecAlcool++ }
      else if (t.alcohol === 'served' || t.alcohol === 'yes') { h.sansAlcool = false; h.sourceAlcool = 'osm'; avecAlcool++ }
      // ── Restauration halal ──
      if (t['diet:halal'] === 'only' || t['diet:halal'] === 'yes') {
        h.petitDejeunerHalal = true; h.sourceHalal = 'osm'; avecHalal++
      }
      // ── Informations utiles au lecteur, telles quelles ──
      if (t.stars && /^\d$/.test(t.stars)) h.etoiles = Number(t.stars)
      if (t.website && /^https?:\/\//.test(t.website)) h.siteWeb = t.website
      if (t.phone) h.telephone = t.phone
      if (t.rooms && /^\d+$/.test(t.rooms)) h.chambres = Number(t.rooms)
      h.sourceEnrichissement = 'osm'
      enrichis++
    }

    // ── Distance à la mosquée la plus proche (donnée maison) ──
    if (h.lat != null && mosquees.length) {
      let d = Infinity, nom = null
      for (const m of mosquees) {
        const dd = distM(h.lat, h.lng, m.lat, m.lng)
        if (dd < d) { d = dd; nom = m.nom }
      }
      if (d < 5000) {
        h.mosqueeProcheM = d
        h.mosqueeProcheNom = nom
        // 80 m/min : allure de marche ordinaire, arrondie à la minute
        h.mosqueeProcheMin = Math.max(1, Math.round(d / 80))
        avecMosquee++
      }
    }
  }

  ville.hotelsEnrichisAt = new Date().toISOString().slice(0, 10)
  fs.writeFileSync(fichier, JSON.stringify(ville, null, 2))
  console.log(`✓ ${slug} : ${hotels.length} hôtels · ${enrichis} appariés OSM · ${avecAlcool} avec info alcool · ${avecHalal} avec restauration halal · ${avecMosquee} avec distance mosquée`)
}
