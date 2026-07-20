// Télécharge les photos RETENUES (revue humaine) des parcours 3 jours dans
// public/guides/<key>.jpg — auto-hébergées : rapides, stables, affichables
// partout. Réécrit data/guideImages.json vers les chemins locaux en gardant
// le crédit auteur (exigence Wikimedia Commons).
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs'

const UA = 'VoyagesHalal-guide-images/1.0 (contact@voyageshalal.fr)'
const map = JSON.parse(readFileSync('data/guideImages.json', 'utf8'))
mkdirSync('public/guides', { recursive: true })
const out = {}

for (const [key, v] of Object.entries(map)) {
  const src = v.source ?? v.url // idempotent : `source` garde l'URL d'origine
  if (!src || !src.startsWith('http')) { out[key] = v; continue }
  let ok = false
  for (let attempt = 0; attempt < 4 && !ok; attempt++) {
    try {
      await new Promise((r) => setTimeout(r, attempt === 0 ? 600 : 2500))
      const resp = await fetch(src, { headers: { 'User-Agent': UA } })
      if (resp.ok) {
        writeFileSync(`public/guides/${key}.jpg`, Buffer.from(await resp.arrayBuffer()))
        ok = true
      } else if (resp.status !== 429) { console.error('FAIL', key, resp.status); break }
    } catch (e) { console.error('FAIL', key, e.message); break }
  }
  out[key] = ok ? { url: `/guides/${key}.jpg`, credit: v.credit, source: src } : v
  console.log(key, ok ? 'ok' : 'KO')
}
writeFileSync('data/guideImages.json', JSON.stringify(out, null, 1))
