import { chromium } from 'playwright-core'
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--no-sandbox'] })
const ctx = await b.newContext({ viewport: { width: 390, height: 844 }, geolocation: { latitude: 48.851, longitude: 2.483 }, permissions: ['geolocation'], locale: 'fr-FR' })
let lieux = 0
await ctx.route('**/api/lieux', async (r) => { lieux++; await r.fulfill({ json: { fiches: [
  { id: 'x1', nom: 'Hawax', distanceM: 300, prix: 2, note: 4.8, nbAvis: 210, ouvert: true, statut: 'verifie', famille: 'african_restaurant', adresse: '12 rue des Moulins, 94120 Fontenay', lat: 48.853, lng: 2.485, titreIA: 'Grillades généreuses, service rapide', marcheMin: 4 },
  { id: 'x2', nom: 'Traiteur Al Baraka', distanceM: 320, prix: 1, note: 3.9, nbAvis: 88, ouvert: true, statut: 'signale', famille: 'meal_takeaway', adresse: 'r', lat: 48.852, lng: 2.484, marcheMin: 4 },
  { id: 'x3', nom: 'Bom Tempero Restaurante Brasileiro', distanceM: 2400, prix: 2, note: 4.5, nbAvis: 320, ouvert: true, statut: 'signale', famille: 'brazilian_restaurant', adresse: 'r', lat: 48.850, lng: 2.481, marcheMin: 32, voitureMin: 6 },
], source: 'test' } }) })
await ctx.route('**/api/geo/**', (r) => r.fulfill({ json: { commune: 'Fontenay' } }))
await ctx.route('https://tile.openstreetmap.org/**', (r) => r.fulfill({ status: 204, body: '' }))
await ctx.route('**/api/osm-restos**', (r) => r.fulfill({ json: { mosquees: [] } }))
const p = await ctx.newPage()
p.on('pageerror', (e) => console.log('PAGEERROR', e.message))
await p.goto('http://localhost:3266/autour-de-moi', { waitUntil: 'domcontentloaded', timeout: 60000 })
await p.waitForTimeout(8000)
const c1 = await p.evaluate(() => ({
  champ: !![...document.querySelectorAll('input')].find((i) => (i.getAttribute('aria-label') || '').match(/Décris/)),
  trouver: /Trouver/.test(document.body.innerText),
  tris: /un seul tri à la fois/.test(document.body.innerText),
}))
console.log('C1 (rien avant mode):', JSON.stringify(c1))
await p.evaluate(() => { [...document.querySelectorAll('button.surmesure-cat')].find((x) => /Manger/.test(x.textContent)).click() })
await p.waitForTimeout(4000)
const liste = await p.evaluate(() => {
  const txt = document.body.innerText
  return {
    champApresMode: !![...document.querySelectorAll('input')].find((i) => (i.getAttribute('aria-label') || '').match(/Décris/)),
    titreIA: /Grillades généreuses, service rapide/.test(txt),
    verif: /VÉRIFIÉ/.test(txt),
    adresseCache: !/12 rue des Moulins/.test(txt),
    noteIA: /écrits par l’IA VoyagesHalal|écrits par l'IA VoyagesHalal/.test(txt),
    voiture: /6 min/.test(txt), marche: /4 min/.test(txt),
    ordre1: txt.indexOf('Hawax') < txt.indexOf('Traiteur Al Baraka'),
  }
})
console.log('C2 liste:', JSON.stringify(liste), '| appels:', lieux)
await p.screenshot({ path: '/tmp/claude-0/scooter-liste.png' })
// carte
await p.evaluate(() => { const b2 = [...document.querySelectorAll('button')].find((x) => /Voir sur la carte/.test(x.textContent)); b2.click() })
await p.waitForTimeout(2500)
const carte = await p.evaluate(() => {
  const nav = document.querySelector('.bottom-nav')
  const tiroir = document.querySelector('.carte-tiroir')
  const rT = tiroir?.getBoundingClientRect()
  const lignes = [...document.querySelectorAll('.carte-tiroir-sous')].map((l) => l.textContent.trim())
  const rec = document.querySelector('.autour-recentrer')?.getBoundingClientRect()
  const zone = !![...document.querySelectorAll('button')].find((x) => /Revenir sur ma zone/.test(x.textContent))
  return { navMasquee: !nav || getComputedStyle(nav).display === 'none', tiroirBas: rT ? Math.round(844 - rT.bottom) : null, lignes, recentrer: rec ? `${Math.round(rec.width)}px@(${Math.round(rec.right)},${Math.round(rec.top)})` : 'ABSENT', zoneApresAuto: zone }
})
console.log('C5 carte:', JSON.stringify(carte, null, 1))
// tap ligne → itinéraire (surveille les popups/navigation)
let nav2 = null
p.on('framenavigated', (f) => { if (f === p.mainFrame()) nav2 = f.url() })
const popup = new Promise((res) => { ctx.on('page', (pg) => res(pg.url())); setTimeout(() => res(null), 3000) })
await p.evaluate(() => { document.querySelector('.carte-tiroir-ligne').click() })
const pop = await popup
console.log('C4 tap ligne → popup/nav:', pop ?? nav2)
await p.screenshot({ path: '/tmp/claude-0/scooter-carte.png' })
await b.close()
