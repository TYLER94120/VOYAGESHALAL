/* L'OBJECTIF DU JOUR ET LA SERIE, DE BOUT EN BOUT.
 *
 * controler-serie.mjs verifie le COMPTAGE, hors navigateur. Celui-ci verifie
 * la CHAINE : on joue vraiment, et on regarde ce que l'accueil affiche apres.
 * Les deux sont necessaires — un comptage juste qui n'arrive pas a l'ecran ne
 * fait revenir personne, et c'est exactement le defaut trouve le 25 aout :
 * l'anneau annoncait « objectif du jour atteint » a cote d'une serie qui
 * n'avait pas demarre, parce que l'un comptait les questions et l'autre
 * attendait la fin d'une partie.
 *
 * Verdict par code de sortie. */
import { chromium } from 'playwright-core';
const B = 'http://127.0.0.1:8899';
let ec = 0;
const rate = (m,d) => { console.log('  ECHEC  '+m+(d?'  -> '+d:'')); ec++; };
const ok = (m,d) => console.log('  ok     '+m+(d?'  -> '+d:''));

const nav = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox'] });
const ctx = await nav.newContext({ viewport:{width:390,height:844}, isMobile:true, hasTouch:true });
await ctx.route('**', (r) => r.request().url().startsWith(B) ? r.continue() : r.abort());
const p = await ctx.newPage();
const err = []; p.on('pageerror', (e) => err.push(e.message));

const etat = () => p.evaluate(() => ({
  anneau: (document.querySelector('.jour-anneau-txt') || {}).textContent || '',
  titre: (document.querySelector('.jour-titre') || {}).textContent || '',
  serie: (document.querySelector('.jour-serie') || {}).textContent || '',
  vive: document.querySelector('.jour-serie')
    ? document.querySelector('.jour-serie').getAttribute('data-vive') : null,
  // A ZERO, L'ARC N'EST PAS DESSINE DU TOUT : un trait arrondi de longueur
  // nulle laisse un point dore qui ressemble a une salissure.
  arcs: document.querySelectorAll('.jour-anneau svg circle').length,
  etapes: document.querySelectorAll('.etape').length,
}));

// --- 1. Avant d'avoir joue : l'anneau est la, vide, et il ne salit pas ----
await p.goto(B + '/index.html', { waitUntil: 'domcontentloaded' });
await p.evaluate(() => localStorage.clear());
await p.reload({ waitUntil: 'domcontentloaded' });
await p.waitForSelector('.jour-anneau', { timeout: 8000 });
await p.waitForTimeout(500);
let e = await etat();
if (!/^0\//.test(e.anneau)) rate('l anneau ne part pas de zero', e.anneau);
else ok('l anneau est visible AVANT d avoir commence', e.anneau);
if (e.arcs !== 1) rate('a zero, l arc ne doit pas etre dessine', e.arcs + ' cercles');
else ok('a zero, aucun arc dessine', 'un seul cercle, la piste');
if (e.vive !== 'non') rate('la serie ne devrait pas etre vive avant d avoir joue', e.vive);
else ok('la serie est au repos', e.serie);
if (e.etapes !== 12) rate('le chemin ne porte pas les douze etapes', e.etapes);
else ok('le chemin porte les douze etapes');

// --- 2. On joue jusqu a l objectif ---------------------------------------
await p.goto(B + '/qcm.html?section=la-priere&n=12&niveau=1', { waitUntil: 'domcontentloaded' });
await p.waitForSelector('.reponse');
for (let i = 0; i < 14; i++) {
  if (!(await p.locator('.reponse').count())) break;
  await p.locator('.reponse').first().click();
  await p.keyboard.press('ArrowRight');
  await p.waitForTimeout(320);
  if (await p.locator('#f-suite').count()) {
    await p.locator('#f-suite').click(); await p.waitForTimeout(280);
  }
  if (p.url().includes('resultat')) break;
}

// --- 3. L objectif rempli DOIT faire demarrer la serie -------------------
await p.goto(B + '/index.html', { waitUntil: 'domcontentloaded' });
await p.waitForSelector('.jour-anneau', { timeout: 8000 });
await p.waitForTimeout(600);
e = await etat();
if (e.anneau !== '10/10') rate('l anneau ne s est pas rempli', e.anneau);
else ok('l anneau se remplit en jouant', e.anneau);
if (e.arcs !== 2) rate('l arc n est pas dessine alors que l objectif est atteint', e.arcs);
else ok('l arc est dessine');
// LE POINT DU 25 AOUT : les deux doivent bouger ENSEMBLE.
if (e.vive !== 'oui') rate('objectif atteint mais serie au repos — deux declencheurs pour une promesse', e.serie);
else ok('objectif atteint, la serie demarre', e.serie);
if (!/1 jour/.test(e.serie)) rate('la serie n annonce pas son premier jour', e.serie);
else ok('la serie annonce son premier jour', e.serie);

// --- 4. Le ton, dans l etat le plus dur ----------------------------------
// Aucun mot de reproche ne doit apparaitre a l ecran, quel que soit l etat.
const LETTRE = 'a-zàâäçéèêëîïôöûùüÿñæœ';
const MOTS = ['perdu','perdue','perdus','casse','cassee','cassé','cassée','dommage',
              'rate','ratee','raté','ratée','echec','échec','nul','nulle','honte',
              'honteux','helas','hélas','malheureusement'];
const REPROCHE = new RegExp('(^|[^'+LETTRE+'])('+MOTS.join('|')+')([^'+LETTRE+']|$)','i');
const vu = await p.evaluate(() => document.querySelector('.corps').innerText);
if (REPROCHE.test(vu)) {
  rate('un mot de reproche est affiche a l accueil', (vu.match(REPROCHE) || [])[0]);
} else ok('aucun mot de reproche a l ecran');

if (err.length) rate('erreurs JavaScript', err.join(' | '));
else ok('aucune erreur JavaScript');
await nav.close();
console.log(ec === 0 ? '\nVERT' : `\nROUGE (${ec})`);
process.exit(ec === 0 ? 0 : 1);
