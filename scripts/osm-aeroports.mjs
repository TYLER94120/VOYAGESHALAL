// ✈️ LES SALLES DE PRIÈRE DES AÉROPORTS (chantier SEO anglais, 20 août).
//
// POURQUOI CE SCRIPT EXISTE. Le brief demande dix pages « prayer room
// {aéroport} » portant le terminal exact, le niveau et le temps de marche.
// Vérification faite avant d'écrire une ligne de page : notre base OSM
// (153 168 lieux, extraite sur amenity=place_of_worship) ne contient PAS
// les salles de prière situées DANS les terminaux — elles sont taguées
// autrement (room=prayer, prayer_room=yes, multi-étages). Autour de
// Heathrow, elle ne connaît que deux mosquées de quartier à 2,5 km.
//
// Écrire « Terminal 2, niveau 3, 4 minutes des portes » sans cette donnée
// serait inventer une salle de prière — la chose que nous ne faisons
// jamais. Ce script va donc la CHERCHER à la source.
//
// CE QU'IL FAIT, pour chaque aéroport (identifié par son code IATA, aucune
// coordonnée écrite à la main) :
//   1. trouve l'aérodrome dans OSM par son tag iata ;
//   2. relève, dans son enceinte, tout ce qui sert à prier : salles de
//      prière indoor (room=prayer / prayer_room=yes / multi-faith) et
//      lieux de culte musulmans ;
//   3. garde les tags qui RÉPONDENT à la question — nom, niveau, terminal,
//      accès, horaires — et rien d'autre.
//
// Un champ absent dans OSM reste absent chez nous : la page affichera
// « not recorded — check on arrival » plutôt qu'une supposition.
//
//   node scripts/osm-aeroports.mjs            → les dix aéroports ciblés
//   node scripts/osm-aeroports.mjs LHR DXB    → seulement ceux-là
//
// ⚠️ Licence ODbL : le crédit « © OpenStreetMap contributors » est affiché
// partout où ces données apparaissent.
import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'

const FICHIER = 'data/airports/prayer-rooms.json'
const MIROIRS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
]

// Les dix cibles du brief. Le code IATA est la SEULE chose écrite ici :
// le nom affiché, le pays et les coordonnées viennent d'OSM.
export const AEROPORTS = [
  { iata: 'LHR', slug: 'heathrow' },
  { iata: 'LGW', slug: 'gatwick' },
  { iata: 'DXB', slug: 'dubai-airport' },
  { iata: 'IST', slug: 'istanbul-airport' },
  { iata: 'KUL', slug: 'kuala-lumpur-klia' },
  { iata: 'AMS', slug: 'schiphol' },
  { iata: 'JFK', slug: 'jfk' },
  { iata: 'DOH', slug: 'doha-hamad' },
  { iata: 'JED', slug: 'jeddah' },
  { iata: 'SIN', slug: 'changi-singapore' },
]

const pause = (ms) => new Promise((res) => setTimeout(res, ms))

async function overpass(requete, etiquette) {
  let derniere = null
  for (let passe = 0; passe < 3; passe++) {
    if (passe) { console.log(`  ${etiquette} : passe ${passe + 1}, pause ${30 * passe}s…`); await pause(30000 * passe) }
    for (const url of MIROIRS) {
      try {
        const r = await fetch(url, {
          method: 'POST',
          body: 'data=' + encodeURIComponent(requete),
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'User-Agent': 'VoyagesHalal/1.0 (https://www.voyageshalal.fr; contact@voyageshalal.fr)',
          },
        })
        if (!r.ok) { derniere = new Error(`${url} → ${r.status}`); console.log(`  ${etiquette} : ${url} → ${r.status}`); continue }
        return await r.json()
      } catch (e) { derniere = e }
    }
  }
  throw derniere ?? new Error('aucun miroir Overpass ne répond')
}

const centre = (el) => (el.type === 'node' ? { lat: el.lat, lng: el.lon } : el.center ? { lat: el.center.lat, lng: el.center.lon } : null)

/** L'aérodrome lui-même : nom, coordonnées, pays. Rien n'est écrit à la
 *  main — si OSM ne le connaît pas sous ce code IATA, l'aéroport est sauté
 *  et aucune page n'est publiée pour lui. */
async function aerodrome(iata) {
  const j = await overpass(`[out:json][timeout:120];
nwr["aeroway"="aerodrome"]["iata"="${iata}"];
out center tags 1;`, iata)
  const el = (j.elements ?? [])[0]
  if (!el) return null
  const c = centre(el)
  if (!c) return null
  const tags = el.tags ?? {}
  return {
    nom: tags['name:en'] ?? tags.name ?? iata,
    lat: c.lat,
    lng: c.lng,
    pays: tags['addr:country'] ?? null,
    osmId: `${el.type[0]}${el.id}`,
  }
}

/** Tout ce qui sert à prier dans l'enceinte : salles indoor ET lieux de
 *  culte musulmans, dans un rayon de 4 km autour du centre (les terminaux
 *  d'un grand aéroport s'étalent sur plusieurs kilomètres). */
async function lieuxDePriere(lat, lng, etiquette) {
  const j = await overpass(`[out:json][timeout:180];
(
  nwr["room"="prayer"](around:4000,${lat},${lng});
  nwr["room"="prayer_room"](around:4000,${lat},${lng});
  nwr["amenity"="prayer_room"](around:4000,${lat},${lng});
  nwr["prayer_room"="yes"](around:4000,${lat},${lng});
  nwr["religion"="muslim"]["indoor"="room"](around:4000,${lat},${lng});
  nwr["amenity"="place_of_worship"]["religion"="muslim"](around:4000,${lat},${lng});
  nwr["amenity"="place_of_worship"]["religion"="multifaith"](around:4000,${lat},${lng});
);
out center tags;`, etiquette)
  const out = []
  for (const el of j.elements ?? []) {
    const c = centre(el)
    if (!c) continue
    const tg = el.tags ?? {}
    out.push({
      id: `${el.type[0]}${el.id}`,
      lat: c.lat,
      lng: c.lng,
      // Un champ absent d'OSM reste absent : la page dira « non relevé ».
      ...(tg['name:en'] ?? tg.name ? { nom: tg['name:en'] ?? tg.name } : {}),
      ...(tg.level ? { niveau: String(tg.level) } : {}),
      ...(tg['addr:unit'] ?? tg.terminal ? { terminal: String(tg.terminal ?? tg['addr:unit']) } : {}),
      ...(tg.opening_hours ? { horaires: tg.opening_hours } : {}),
      ...(tg.access ? { acces: tg.access } : {}),
      ...(tg.female ?? tg.male ? { mixite: `${tg.female === 'yes' ? 'women' : ''}${tg.female === 'yes' && tg.male === 'yes' ? ' & ' : ''}${tg.male === 'yes' ? 'men' : ''}`.trim() } : {}),
      ...(tg.wudu ?? tg['toilets:wudu'] ? { ablutions: 'yes' } : {}),
      // Le type honnête : une salle de prière n'est pas une mosquée.
      type: /prayer/.test(String(tg.room ?? '')) || tg.prayer_room === 'yes' || tg.amenity === 'prayer_room' ? 'prayer_room'
        : tg.religion === 'multifaith' ? 'multifaith_room' : 'mosque',
      indoor: tg.indoor === 'yes' || tg.room === 'prayer' || tg.prayer_room === 'yes',
    })
  }
  return out
}

async function main() {
  const demandes = process.argv.slice(2).map((a) => a.toUpperCase()).filter((a) => /^[A-Z]{3}$/.test(a))
  const cibles = demandes.length ? AEROPORTS.filter((a) => demandes.includes(a.iata)) : AEROPORTS
  mkdirSync('data/airports', { recursive: true })
  const existant = existsSync(FICHIER) ? JSON.parse(readFileSync(FICHIER, 'utf8')) : { genere: null, aeroports: [] }
  const parSlug = new Map((existant.aeroports ?? []).map((a) => [a.slug, a]))

  for (const cible of cibles) {
    try {
      const aero = await aerodrome(cible.iata)
      if (!aero) { console.log(`✗ ${cible.iata} : introuvable dans OSM sous ce code IATA — aucune page publiée`); continue }
      const lieux = await lieuxDePriere(aero.lat, aero.lng, cible.iata)
      parSlug.set(cible.slug, { ...cible, ...aero, lieux, releve: new Date().toISOString().slice(0, 10) })
      const salles = lieux.filter((l) => l.type !== 'mosque').length
      console.log(`✓ ${cible.iata} ${aero.nom} : ${lieux.length} lieu(x) relevé(s), dont ${salles} salle(s) de prière`)
      await pause(4000) // on ne martèle pas un service bénévole
    } catch (e) {
      console.log(`✗ ${cible.iata} : ${e.message} — aéroport sauté, les autres continuent`)
    }
  }

  const sortie = {
    genere: new Date().toISOString().slice(0, 10),
    source: 'OpenStreetMap (ODbL)',
    aeroports: [...parSlug.values()].sort((a, b) => a.slug.localeCompare(b.slug)),
  }
  writeFileSync(FICHIER, JSON.stringify(sortie, null, 1))
  const total = sortie.aeroports.reduce((n, a) => n + a.lieux.length, 0)
  console.log(`\n${sortie.aeroports.length} aéroport(s), ${total} lieu(x) de prière → ${FICHIER}`)
}

main()
