// 🖱 « LE SWIPE NE MARCHE PAS SUR PC POUR LES 2 SITES » — Mohamed, 22 août.
//
// Ce test rejoue le geste d'un ordinateur dans un VRAI navigateur, sur le
// CSS réel du flux et le code réellement livré (lib/fluxSouris.mjs).
//
// Ce qui était mesuré AVANT la correction, fenêtre 1440 × 900 :
//   molette de 400 px → scrollTop 0   (rien ne bouge)
//   flèche ↓          → le flux ne bouge pas, la PAGE défile
// Un cran de molette vaut ~100 px : le flux ne bougeait donc jamais.
//
// Le navigateur n'existe pas partout (Vercel n'a pas Chromium) : sans lui,
// le test vérifie au moins que le branchement n'a pas disparu des quatre
// flux, et ne bloque pas la construction pour une raison d'outillage.
import { readFileSync, writeFileSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { createServer } from 'node:http'

let fautes = 0
const casse = (m) => { console.error(`❌ ${m}`); fautes++ }

// ── 1. les quatre flux du site branchent bien le geste ──
const FLUX = [
  ['components/flux/WorldFeed.tsx', 'accueil gohalaltravel.com'],
  ['components/villes/Immersion.tsx', 'page ville (les 2 sites)'],
  ['components/lieux/FluxLieux.tsx', 'Autour de moi'],
  ['components/spots/FluxPepites.tsx', 'Pépites'],
]
for (const [f, quoi] of FLUX) {
  const s = readFileSync(f, 'utf8')
  if (!/useFluxSouris\(fluxRef\)/.test(s)) casse(`${quoi} : la molette et les flèches ne sont plus branchées (${f})`)
  // Le mot « Swipe » seul, sur un ordinateur, décrit un geste que le
  // lecteur ne peut pas faire.
  if (!/geste-souris/.test(s)) casse(`${quoi} : l'indice ne dit plus quoi faire avec une souris`)
}
const css = readFileSync('app/globals.css', 'utf8')
if (!/\(hover: hover\) and \(pointer: fine\)[\s\S]{0,200}geste-souris/.test(css)) {
  casse('l\'indice « molette » ne s\'affiche pas sur les appareils à souris')
}

// ── 2. le geste, rejoué dans un navigateur ──
let chromium = null
try { ({ chromium } = await import('playwright-core')) } catch { /* absent */ }
const EXE = process.env.CHROMIUM_PATH ?? '/opt/pw-browsers/chromium'

if (chromium) {
  const dossier = mkdtempSync(path.join(tmpdir(), 'swipe-'))
  writeFileSync(path.join(dossier, 'globals.css'), css)
  writeFileSync(path.join(dossier, 'flux.mjs'), readFileSync('lib/flux.mjs'))
  writeFileSync(path.join(dossier, 'fluxSouris.mjs'), readFileSync('lib/fluxSouris.mjs'))
  writeFileSync(path.join(dossier, 'banc.html'), `<!doctype html><meta charset="utf-8">
<link rel="stylesheet" href="globals.css">
<div class="imm-scene"><div class="imm-flux" id="f">
${[1, 2, 3, 4].map((n) => `<section class="imm-panneau"><div class="imm-contenu"><h2 class="imm-h1">Panneau ${n}</h2></div></section>`).join('\n')}
</div></div>
<div style="height:1200px;background:#0B1A0F">socle</div>
<script type="module">
  import { brancherFluxSouris } from './fluxSouris.mjs'
  brancherFluxSouris(document.getElementById('f'))
  window.pret = true
</script>`)

  const srv = createServer((req, res) => {
    const nom = (req.url ?? '/').split('?')[0].replace(/^\//, '') || 'banc.html'
    try {
      const corps = readFileSync(path.join(dossier, path.basename(nom)))
      res.writeHead(200, { 'Content-Type': nom.endsWith('.css') ? 'text/css' : nom.endsWith('.mjs') ? 'text/javascript' : 'text/html' })
      res.end(corps)
    } catch { res.writeHead(404).end() }
  })
  await new Promise((ok) => srv.listen(0, ok))
  const url = `http://127.0.0.1:${srv.address().port}/banc.html`

  const nav = await chromium.launch({ executablePath: EXE })
  const page = await (await nav.newContext({ viewport: { width: 1440, height: 900 } })).newPage()
  await page.goto(url, { waitUntil: 'load' })
  await page.waitForFunction('window.pret === true')

  const panneau = () => page.evaluate(() => {
    const f = document.getElementById('f')
    return Math.round(f.scrollTop / f.clientHeight)
  })
  const attendre = () => page.waitForTimeout(800)

  await page.mouse.move(720, 450)
  // Un cran de molette, celui d'une vraie souris.
  await page.mouse.wheel(0, 100); await attendre()
  if (await panneau() !== 1) casse(`un cran de molette n'avance pas d'un panneau (on est resté au ${await panneau() + 1})`)

  await page.keyboard.press('ArrowDown'); await attendre()
  if (await panneau() !== 2) casse('la flèche ↓ n\'avance pas d\'un panneau')

  await page.keyboard.press('ArrowUp'); await attendre()
  if (await panneau() !== 1) casse('la flèche ↑ ne revient pas au panneau précédent')

  await page.mouse.wheel(0, -100); await attendre()
  if (await panneau() !== 0) casse('la molette vers le haut ne remonte pas')

  // Au dernier panneau, le flux REND LA MAIN : sinon la page ne descend
  // plus jusqu'au socle, et l'écran devient un cul-de-sac.
  await page.evaluate(() => { const f = document.getElementById('f'); f.scrollTop = f.scrollHeight })
  await attendre()
  const avant = await page.evaluate(() => Math.round(window.scrollY))
  await page.mouse.wheel(0, 300); await attendre()
  const apres = await page.evaluate(() => Math.round(window.scrollY))
  if (apres <= avant) casse('au dernier panneau, le flux retient le défilement : on n\'atteint plus le socle')

  await nav.close()
  srv.close()
  if (!fautes) console.log('✅ swipe PC : un cran de molette = un panneau, ↑ ↓ marchent, le socle reste atteignable (Chromium, 1440 × 900).')
} else if (!fautes) {
  console.log('✅ swipe PC : branchement vérifié dans les 4 flux (navigateur absent ici — geste rejoué en local).')
}

if (fautes) { console.error(`\n${fautes} faute(s) — build arrêté.`); process.exit(1) }
