/* UNE CARTE LONGUE : LE GLISSEMENT LIT D'ABORD, IL LANCE ENSUITE.
 *
 * Sur un petit ecran, une question sur cinq demande de faire glisser pour
 * voir la quatrieme reponse. Le geste doit alors :
 *   1. defiler tant qu'il reste du texte, sans lancer la carte ;
 *   2. une fois en bas, lancer la carte comme d'habitude ;
 *   3. ne PAS choisir la reponse survolee au passage ;
 *   4. faire disparaitre le signe « il y en a plus » quand on est au bout.
 *
 * Verdict par code de sortie. */
import { chromium } from 'playwright-core';
const B = 'http://127.0.0.1:8899';
let ec = 0;
const rate = (m,d) => { console.log('  ECHEC  '+m+(d?'  -> '+d:'')); ec++; };
const ok = (m,d) => console.log('  ok     '+m+(d?'  -> '+d:''));
const nav = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox'] });
const ctx = await nav.newContext({ viewport:{width:360,height:640}, isMobile:true, hasTouch:true });
await ctx.route('**', (r) => {
  const u = r.request().url();
  if (u.startsWith(B) || /fonts\.(googleapis|gstatic)\.com/.test(u)) return r.continue();
  return r.abort();
});
const p = await ctx.newPage();
const err=[]; p.on('pageerror',(e)=>err.push(e.message));
await p.goto(B+'/qcm.html?section=la-priere&n=20', { waitUntil:'domcontentloaded' });
await p.evaluate(() => localStorage.clear());
await p.reload({ waitUntil:'domcontentloaded' });
await p.waitForSelector('.reponse');
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(300);

const etat = () => p.evaluate(() => {
  const c = document.getElementById('carte'), d = c.querySelector('.carte-dedans');
  return {
    defile: c.getAttribute('data-defile'),
    top: Math.round(d.scrollTop),
    reste: Math.round(d.scrollHeight - d.clientHeight),
    feuille: document.getElementById('feuille').getAttribute('data-ouverte'),
    choisie: [...document.querySelectorAll('.reponse')].findIndex((e) => e.getAttribute('aria-pressed') === 'true'),
    question: document.querySelector('.t-question').textContent,
  };
});

// On cherche une carte qui demande de faire glisser. Elles sont majoritaires
// a cette largeur ; si on n'en trouve pas en vingt cartes, c'est que quelque
// chose ne va pas et le test doit le dire.
let e = await etat(), tours = 0;
while (e.defile !== 'oui' && tours < 20) {
  await p.locator('#cote-gauche').click();
  await p.waitForTimeout(500);
  e = await etat(); tours++;
}
if (e.defile !== 'oui') { rate('aucune carte longue trouvee en 20 cartes'); }
else {
  ok('carte longue trouvee', e.reste + ' px sous le bord');

  async function tirer(dy, relacher) {
    const b = await p.locator('#carte').boundingBox();
    const x = b.x + b.width/2, y = b.y + b.height/2;
    await p.mouse.move(x, y);
    await p.mouse.down();
    await p.mouse.move(x, y + dy, { steps: 16 });
    if (relacher) { await p.mouse.up(); await p.waitForTimeout(600); }
  }

  // 1. Vers le haut sur une carte longue : ca DEFILE, ca ne lance rien.
  await tirer(-140, true);
  const e2 = await etat();
  if (e2.top <= e.top) rate('le glissement vers le haut n a pas fait defiler', e.top + ' -> ' + e2.top);
  else ok('le glissement vers le haut fait defiler', e.top + ' -> ' + e2.top + ' px');
  if (e2.feuille === 'oui') rate('la carte est partie au lieu de defiler');
  else ok('la carte n est pas partie');
  if (e2.question !== e.question) rate('on a change de question en defilant');
  else ok('on est reste sur la meme question');
  if (e2.choisie !== -1) rate('le defilement a choisi une reponse au passage', e2.choisie);
  else ok('le defilement n a choisi aucune reponse');

  // 2. On va jusqu'en bas : le signe doit disparaitre.
  await p.evaluate(() => {
    const d = document.querySelector('.carte-dedans');
    d.scrollTop = d.scrollHeight;
  });
  await p.waitForTimeout(200);
  const e3 = await etat();
  if (e3.defile === 'oui') rate('le signe de defilement reste alors qu on est en bas');
  else ok('en bas, le signe disparait');

  // 3. La quatrieme reponse est alors visible et cliquable.
  await p.locator('.reponse').nth(3).click();
  const e4 = await etat();
  if (e4.choisie !== 3) rate('la quatrieme reponse ne se laisse pas choisir', e4.choisie);
  else ok('la quatrieme reponse se choisit');

  // 4. En bas, le glissement vers le haut lance la carte.
  await tirer(-140, true);
  const e5 = await etat();
  if (e5.feuille !== 'oui') rate('en bas, le glissement vers le haut ne valide pas', e5.feuille);
  else ok('en bas, le glissement vers le haut valide');
}

if (err.length) rate('erreurs JavaScript', err.join(' | ')); else ok('aucune erreur JavaScript');
await nav.close();
console.log(ec===0 ? '\nVERT' : `\nROUGE (${ec})`);
process.exit(ec===0?0:1);
