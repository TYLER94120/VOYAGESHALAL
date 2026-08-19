// 🕌 OPENSTREETMAP DEVIENT NOTRE BASE DE MOSQUÉES (ordre du 17 août).
//
// Récupère les lieux de culte musulmans d'UN pays via Overpass et les range
// dans data/osm/mosquees/{cc}.json — jamais le monde d'un coup (la requête
// mondiale passe en test mais est trop lourde pour tourner régulièrement).
// Ne garde que le strict utile : id, nom, lat, lng, ville, horaires,
// accès. Le reste est jeté — la base doit rester légère pour servir.
//
//   node scripts/osm-mosquees.mjs FR            → un pays
//   node scripts/osm-mosquees.mjs FR TR MA      → plusieurs, en séquence
//   node scripts/osm-mosquees.mjs --compteurs   → recalcule les compteurs
//     par pays et par ville du guide (data/osm/compteurs.json) — c'est lui
//     qui permet « 14 mosquées dans tout Tokyo ».
//
// ⚠️ Ces données viennent de contributeurs bénévoles (licence ODbL) :
// qualité inégale, noms parfois absents ou en arabe seul, salles de prière
// et mausolées mélangés aux mosquées. On stocke tel quel, l'AFFICHAGE
// applique l'étiquette honnête (« lieu de prière », jamais une promesse).
import { mkdirSync, readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs'

const DOSSIER = 'data/osm/mosquees'
const MIROIRS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
  'https://overpass.private.coffee/api/interpreter',
]

/** L'ordre de priorité de Mohamed : la France, puis les destinations
 *  réelles du site, puis les pays d'où viennent les visiteurs. */
export const PAYS_PRIORITAIRES = ['FR', 'TR', 'MA', 'AE', 'MY', 'SA', 'AL', 'EG', 'ID', 'TN', 'GB', 'BE', 'DE', 'CA']

const pause = (ms) => new Promise((res) => setTimeout(res, ms))

async function overpass(cc) {
  const data = `[out:json][timeout:180];
area["ISO3166-1"="${cc}"][admin_level=2]->.z;
nwr["amenity"="place_of_worship"]["religion"="muslim"](area.z);
out center tags;`
  // Les miroirs publics refusent par À-COUPS (429/500 sous charge) : le
  // premier chargement est tombé en 39 s parce qu'on n'insistait pas.
  // Trois passes sur les miroirs, pause croissante entre les passes.
  let derniere = null
  for (let passe = 0; passe < 3; passe++) {
    if (passe) { console.log(`  ${cc} : passe ${passe + 1}, pause ${30 * passe}s…`); await pause(30000 * passe) }
    for (const url of MIROIRS) {
      try {
        // MÊME appel que scripts/bake-mosques.mjs (qui a fait ses preuves) :
        // corps encodé à la main + Content-Type SANS charset + User-Agent
        // identifiable — overpass-api.de rend 406 sinon (politique d'usage).
        const r = await fetch(url, {
          method: 'POST',
          body: 'data=' + encodeURIComponent(data),
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', 'User-Agent': 'VoyagesHalal/1.0 (https://www.voyageshalal.fr; contact@voyageshalal.fr)' },
        })
        if (!r.ok) { derniere = new Error(`${url} → ${r.status}`); console.log(`  ${cc} : ${url} → ${r.status}`); continue }
        return await r.json()
      } catch (e) { derniere = e }
    }
  }
  throw derniere ?? new Error('aucun miroir Overpass ne répond')
}

function compacter(el, cc) {
  // `out center tags` : un polygone (way/relation) porte ses coordonnées
  // dans `center` — sans lui, la moitié des mosquées n'aurait pas de point.
  const lat = el.lat ?? el.center?.lat
  const lng = el.lon ?? el.center?.lon
  if (typeof lat !== 'number' || typeof lng !== 'number') return null
  const t = el.tags ?? {}
  const o = {
    id: `${el.type[0]}${el.id}`, // n123 / w123 / r123 — l'identifiant OSM complet
    lat: Number(lat.toFixed(6)), lng: Number(lng.toFixed(6)),
    pays: cc,
  }
  const nom = t.name ?? t['name:fr'] ?? t['name:en']
  if (nom) o.nom = nom.slice(0, 120)
  if (t['name:ar'] && t['name:ar'] !== nom) o.nomAr = t['name:ar'].slice(0, 120)
  if (t['addr:city']) o.ville = t['addr:city'].slice(0, 80)
  if (t.opening_hours) o.horaires = t.opening_hours.slice(0, 160)
  if (t.wheelchair) o.acces = t.wheelchair.slice(0, 20)
  // Ne pas promettre « mosquée » quand OSM dit autre chose : on garde le
  // type déclaré s'il existe (mosque, prayer_room, mausoleum, zawiya…).
  if (t.building === 'mosque' || t.amenity === 'mosque') o.type = 'mosque'
  else if (t['place_of_worship'] || t['place_of_worship:type']) o.type = String(t['place_of_worship'] ?? t['place_of_worship:type']).slice(0, 30)
  return o
}

async function unPays(cc) {
  console.log(`— ${cc} : interrogation Overpass…`)
  const j = await overpass(cc)
  const lieux = (j.elements ?? []).map((el) => compacter(el, cc)).filter(Boolean)
  if (!lieux.length) throw new Error(`${cc} : 0 lieu — refus d'écraser la base avec du vide`)
  mkdirSync(DOSSIER, { recursive: true })
  writeFileSync(`${DOSSIER}/${cc.toLowerCase()}.json`, JSON.stringify({ pays: cc, recupere: new Date().toISOString().slice(0, 10), total: lieux.length, lieux }))
  console.log(`  ${cc} : ${lieux.length} lieux de prière écrits (${(JSON.stringify(lieux).length / 1024 / 1024).toFixed(1)} Mo)`)
}

/** Compteurs par pays + par ville du guide — calculés UNE fois, servis
 *  ensuite sans aucun calcul. Une ville « couvre » un rayon de 15 km
 *  autour de son centre : approximation honnête, la même pour toutes. */
function compteurs() {
  const parPays = {}
  const tous = []
  if (existsSync(DOSSIER)) {
    for (const f of readdirSync(DOSSIER)) {
      if (!f.endsWith('.json')) continue
      const j = JSON.parse(readFileSync(`${DOSSIER}/${f}`, 'utf8'))
      parPays[j.pays] = j.total
      for (const l of j.lieux) tous.push(l)
    }
  }
  const RAYON_KM = 15
  const parVille = {}
  for (const f of readdirSync('data/villes')) {
    if (!f.endsWith('.json')) continue
    const v = JSON.parse(readFileSync(`data/villes/${f}`, 'utf8'))
    const c = v.coordonnees
    if (!c || typeof c.lat !== 'number') continue
    const cosLat = Math.cos((c.lat * Math.PI) / 180)
    const n = tous.filter((l) => {
      const dx = (l.lng - c.lng) * cosLat * 111.32
      const dy = (l.lat - c.lat) * 110.57
      return dx * dx + dy * dy <= RAYON_KM * RAYON_KM
    }).length
    if (n > 0) parVille[v.slug ?? f.replace('.json', '')] = n
  }
  mkdirSync('data/osm', { recursive: true })
  writeFileSync('data/osm/compteurs.json', JSON.stringify({ calcule: new Date().toISOString().slice(0, 10), rayonKm: RAYON_KM, parPays, parVille }, null, 1))
  console.log(`compteurs : ${Object.keys(parPays).length} pays, ${Object.keys(parVille).length} villes du guide couvertes`)
}

const args = process.argv.slice(2)
if (!args.length) { console.error('usage : node scripts/osm-mosquees.mjs FR [TR MA…] | --compteurs'); process.exit(1) }
if (args[0] === '--compteurs') { compteurs() } else {
  // Un pays qui échoue n'emporte pas les autres : on le note, on continue,
  // et on ne sort en erreur que si RIEN n'a pu être chargé.
  const rates = []
  let reussis = 0
  for (const cc of args) {
    if (!/^[A-Z]{2}$/.test(cc)) { console.error(`code pays invalide : ${cc}`); process.exit(1) }
    try { await unPays(cc); reussis++ } catch (e) {
      console.error(`✗ ${cc} : ${e instanceof Error ? e.message : e}`)
      rates.push(cc)
    }
    // Politesse Overpass : une pause entre deux pays.
    if (args.length > 1) await pause(10000)
  }
  compteurs()
  if (rates.length) console.error(`pays non chargés (à relancer) : ${rates.join(' ')}`)
  if (!reussis) process.exit(1)
}
