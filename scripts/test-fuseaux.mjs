// 🕐 TEST FUSEAUX — la cause du « Dhuhr 04:46 » ne doit jamais revenir.
//
// 1) CHAQUE ville de data/villes résout un fuseau IANA valide (fuseauDe).
// 2) Pour chaque ville avec coordonnées : le MIDI SOLAIRE (12:00 UTC − lng/15,
//    calculable hors ligne, ≈ Dhuhr à ±20 min) formaté DANS le fuseau de la
//    ville tombe à une heure de midi plausible. Un bug de fuseau décale de
//    plusieurs heures (Tokyo vu de Paris : −7h) — il est donc toujours pris.
// 3) Tokyo, Istanbul, Marrakech : bornes serrées 11h–14h (villes du brief).
import { readFileSync, readdirSync } from 'node:fs'
import { fuseauDe, formaterHeureVille } from '../lib/fuseaux.mjs'

let erreurs = 0
const dire = (m) => { console.error('✗', m); erreurs++ }

function midiSolaireLocal(lng, tz) {
  // Instant du midi solaire (aujourd'hui, sans équation du temps : ±16 min).
  const d = new Date()
  d.setUTCHours(12, 0, 0, 0)
  const instant = new Date(d.getTime() - (lng / 15) * 3600 * 1000)
  const [h, m] = formaterHeureVille(instant, tz).split(':').map(Number)
  return h + m / 60
}

const villes = readdirSync('data/villes').filter((f) => f.endsWith('.json'))
let testees = 0
for (const f of villes) {
  const v = JSON.parse(readFileSync(`data/villes/${f}`, 'utf8'))
  const slug = v.slug ?? f.replace('.json', '')
  const tz = fuseauDe(v.pays, slug)
  if (!tz) { dire(`${slug} (${v.pays}) : aucun fuseau résolu`); continue }
  try { new Intl.DateTimeFormat('fr-FR', { timeZone: tz }) } catch { dire(`${slug} : fuseau IANA invalide « ${tz} »`); continue }
  const lng = v.coordonnees?.lng
  if (typeof lng !== 'number') continue
  const h = midiSolaireLocal(lng, tz)
  // Un fuseau légal peut s'écarter du soleil (Espagne l'été : ~14h15, ouest
  // de la Chine : ~15h) — mais jamais de 4–8 h comme le bug du navigateur.
  if (h < 10 || h > 16) dire(`${slug} : midi solaire à ${h.toFixed(1)}h dans ${tz} — fuseau suspect`)
  testees++
}

for (const [slug, min, max] of [['tokyo', 11, 14], ['istanbul', 11, 14], ['marrakech', 11, 15]]) {
  const v = JSON.parse(readFileSync(`data/villes/${slug}.json`, 'utf8'))
  const tz = fuseauDe(v.pays, slug)
  const h = midiSolaireLocal(v.coordonnees.lng, tz)
  if (h < min || h > max) dire(`${slug} : midi solaire ${h.toFixed(2)}h hors [${min};${max}] dans ${tz}`)
  else console.log(`  ${slug} → ${tz}, midi solaire ≈ ${h.toFixed(2)}h ✓`)
}

if (erreurs) { console.error(`test-fuseaux : ${erreurs} erreur(s)`); process.exit(1) }
console.log(`test-fuseaux OK — ${villes.length} villes résolues, ${testees} vérifiées au soleil`)
