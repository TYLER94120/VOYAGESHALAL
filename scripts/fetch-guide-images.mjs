// Cherche sur Wikimedia Commons (API libre, sans clé) des photos candidates
// pour chaque lieu des parcours « L'essentiel en 3 jours », télécharge des
// vignettes et écrit un mapping des URLs — la sélection finale est HUMAINE
// (revue des planches-contact : cadrage, netteté, conformité identité).
import { writeFileSync, mkdirSync } from 'node:fs'

const KEYS = [
  { key: 'istanbul-j1', q: 'Blue Mosque Istanbul exterior' },
  { key: 'istanbul-j2', q: 'Suleymaniye Mosque Istanbul' },
  { key: 'istanbul-j3', q: 'Bosphorus Istanbul ferry' },
  { key: 'marrakech-j1', q: 'Koutoubia Mosque Marrakech' },
  { key: 'marrakech-j2', q: 'Bahia Palace Marrakech' },
  { key: 'marrakech-j3', q: 'Agafay desert Morocco' },
  { key: 'dubai-j1', q: 'Burj Khalifa Dubai' },
  { key: 'dubai-j2', q: 'Al Fahidi historical district Dubai' },
  { key: 'dubai-j3', q: 'Dubai Marina skyline' },
  { key: 'kuala-lumpur-j1', q: 'Petronas Towers Kuala Lumpur' },
  { key: 'kuala-lumpur-j2', q: 'National Mosque of Malaysia' },
  { key: 'kuala-lumpur-j3', q: 'Batu Caves stairs' },
  { key: 'le-caire-j1', q: 'Pyramids of Giza panorama' },
  { key: 'le-caire-j2', q: 'Muhammad Ali Mosque Cairo Citadel' },
  { key: 'le-caire-j3', q: 'Felucca Nile Cairo' },
  { key: 'casablanca-j1', q: 'Hassan II Mosque Casablanca' },
  { key: 'casablanca-j2', q: 'Casablanca Corniche Ain Diab' },
  { key: 'londres-j1', q: 'Big Ben Westminster London' },
  { key: 'londres-j2', q: 'Tower Bridge London' },
  { key: 'londres-j3', q: 'British Museum Great Court' },
  { key: 'antalya-j1', q: 'Kaleici Antalya old harbour' },
  { key: 'antalya-j2', q: 'Lower Duden Waterfall Antalya' },
  { key: 'antalya-j3', q: 'Aspendos theatre' },
  { key: 'paris-j1', q: 'Eiffel Tower Trocadero' },
  { key: 'paris-j2', q: 'Grande Mosquee de Paris' },
  { key: 'paris-j3', q: 'Louvre pyramid Paris' },
]

const UA = 'VoyagesHalal-guide-images/1.0 (contact@voyageshalal.fr)'
mkdirSync('guide-images/thumbs', { recursive: true })
const map = {}

for (const { key, q } of KEYS) {
  const url = `https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search&gsrnamespace=6&gsrlimit=8&gsrsearch=${encodeURIComponent(q + ' filetype:bitmap')}&prop=imageinfo&iiprop=url|size|extmetadata&iiurlwidth=1000`
  let cands = []
  try {
    const r = await fetch(url, { headers: { 'User-Agent': UA } })
    const j = await r.json()
    const pages = Object.values(j?.query?.pages ?? {})
    cands = pages
      .map((p) => p.imageinfo?.[0])
      .filter((ii) => ii && ii.width > ii.height && ii.width >= 900 && /\.(jpe?g|png)$/i.test(ii.url))
      .slice(0, 4)
      .map((ii) => ({ thumb: ii.thumburl, full: ii.url, artist: String(ii.extmetadata?.Artist?.value ?? '').replace(/<[^>]*>/g, '').slice(0, 80), license: ii.extmetadata?.LicenseShortName?.value ?? '' }))
  } catch (e) { console.error('FAIL', key, e.message) }
  map[key] = { query: q, candidates: cands }
  for (let i = 0; i < cands.length; i++) {
    const dest = `guide-images/thumbs/${key}-${i}.jpg`
    // Commons limite le débit (429) : on espace les requêtes et on retente
    for (let attempt = 0; attempt < 4; attempt++) {
      try {
        await new Promise((res) => setTimeout(res, attempt === 0 ? 600 : 2500))
        const resp = await fetch(cands[i].thumb, { headers: { 'User-Agent': UA } })
        if (resp.ok) { writeFileSync(dest, Buffer.from(await resp.arrayBuffer())); break }
        if (resp.status !== 429) { console.error('THUMB FAIL', key, i, resp.status); break }
        if (attempt === 3) console.error('THUMB FAIL', key, i, 429)
      } catch (e) { console.error('THUMB FAIL', key, i, e.message); break }
    }
  }
  console.log(key, cands.length, 'candidates')
}
writeFileSync('guide-images/map.json', JSON.stringify(map, null, 1))
