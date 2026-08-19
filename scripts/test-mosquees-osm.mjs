// 🕌 GARDE-FOUS DE LA BASE OSM DES MOSQUÉES (chantier du 17 août).
//
// 1. Chaque fichier data/osm/mosquees/*.json est lisible et chaque lieu
//    porte id + coordonnées valides — un lieu sans point ne sert à rien.
// 2. Les compteurs précalculés correspondent aux fichiers (le « X lieux
//    de prière à Istanbul » ne doit jamais mentir).
// 3. Le moteur garde ses engagements, vérifiés dans le SOURCE comme
//    test-un-seul-chemin : découverte via prochesOsm (jamais Google),
//    dédup à 60 m, nom jamais vide (« nom non renseigné »), étiquette
//    « lieu de prière » sans promesse, crédit ODbL dans l'interface.
// La base peut être ABSENTE (elle se remplit par le workflow pays par
// pays) : dans ce cas les contrôles de données sont sautés, pas ceux du
// code.
import { readFileSync, readdirSync, existsSync } from 'node:fs'

let fautes = 0
const casse = (m) => { console.error('❌ ' + m); fautes++ }

// ── 1 + 2 : les données, si présentes ──
const DOSSIER = 'data/osm/mosquees'
let total = 0
if (existsSync(DOSSIER)) {
  const parPays = {}
  for (const f of readdirSync(DOSSIER).filter((x) => x.endsWith('.json'))) {
    const j = JSON.parse(readFileSync(`${DOSSIER}/${f}`, 'utf8'))
    if (!Array.isArray(j.lieux) || !j.lieux.length) { casse(`${f} : aucun lieu`); continue }
    if (j.total !== j.lieux.length) casse(`${f} : total annoncé ${j.total} ≠ ${j.lieux.length} lieux`)
    for (const l of j.lieux) {
      if (!l.id || typeof l.lat !== 'number' || typeof l.lng !== 'number'
        || Math.abs(l.lat) > 90 || Math.abs(l.lng) > 180) { casse(`${f} : lieu invalide ${JSON.stringify(l).slice(0, 80)}`); break }
    }
    parPays[j.pays] = j.lieux.length
    total += j.lieux.length
  }
  if (existsSync('data/osm/compteurs.json')) {
    const c = JSON.parse(readFileSync('data/osm/compteurs.json', 'utf8'))
    for (const [cc, n] of Object.entries(parPays)) {
      if (c.parPays?.[cc] !== n) casse(`compteurs.json : ${cc} annonce ${c.parPays?.[cc]}, les fichiers contiennent ${n}`)
    }
  } else if (total) casse('des fichiers pays existent mais data/osm/compteurs.json manque — lance --compteurs')
}

// ── 3 : les engagements du moteur, dans le source ──
const route = readFileSync('app/api/lieux/route.ts', 'utf8')
if (!/prochesOsm\(lat, lng, rayon/.test(route)) casse('la découverte mosquée ne passe plus par la base locale (prochesOsm)')
if (!/nom non renseigné/.test(route)) casse('le repli « nom non renseigné » a disparu — un nom vide redeviendrait possible')
if (!/Lieu de prière/.test(route)) casse('l\'étiquette prudente « Lieu de prière » a disparu')
if (!/< 60\b/.test(route) || !/nomsSemblables/.test(route)) casse('la déduplication (60 m + similarité de nom) a disparu')
if (!/0 pour la découverte/.test(route)) casse('le journal du compte d\'appels Google a disparu — la mesure est obligatoire')
const ui = readFileSync('components/lieux/SurMesure.tsx', 'utf8')
if (!/contributeurs OpenStreetMap/.test(ui)) casse('le crédit ODbL « © les contributeurs OpenStreetMap » a disparu de la liste')

// ── le repli « nom non renseigné » lui-même, hors réseau ──
// (logique dupliquée volontairement minime : sans nom → générique + mention)
const { estLatinLisible } = await import('../lib/latin.mjs')
if (estLatinLisible('')) casse('estLatinLisible accepte le vide')
if (estLatinLisible('和泉村地蔵墓地')) casse('estLatinLisible accepte le non-latin seul')
if (!estLatinLisible('Mosquée de Fontenay')) casse('estLatinLisible refuse un nom français')

if (fautes) { console.error(`${fautes} faute(s) — build arrêté.`); process.exit(1) }
console.log(`✅ base OSM mosquées : ${total ? `${total} lieux vérifiés` : 'base pas encore chargée (workflow pays par pays)'}, engagements du moteur en place, crédit ODbL présent.`)
