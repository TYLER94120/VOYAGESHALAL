/* LA CHAINE COMPLETE, PAR LES NOUVELLES ADRESSES :
 * grille -> couverture -> reglages -> QCM. Une seule maille cassee et
 * personne n atteint plus le produit. */
import { chromium } from 'playwright-core';
const B = 'http://127.0.0.1:8899';
let ec = 0;
const rate=(m,d)=>{console.log('  ECHEC  '+m+(d?'  -> '+d:''));ec++;};
const ok=(m,d)=>console.log('  ok     '+m+(d?'  -> '+d:''));
const nav = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox'] });
const ctx = await nav.newContext({ viewport:{width:390,height:844}, isMobile:true, hasTouch:true });
await ctx.route('**', (r) => r.request().url().startsWith(B) ? r.continue() : r.abort());
const p = await ctx.newPage();
const err=[]; p.on('pageerror',(e)=>err.push(e.message));

await p.goto(B+'/sections.html', { waitUntil:'domcontentloaded' });
await p.evaluate(() => localStorage.clear());
await p.waitForSelector('a.tuile');
await p.locator('a.tuile').first().click();
await p.waitForTimeout(800);
if (!/\/section\/[^/]+$/.test(p.url())) rate('la grille ne mene pas a la couverture', p.url());
else ok('grille -> couverture', p.url().replace(B,''));

// Les feuilles de style ont-elles bien ete trouvees malgre l adresse longue ?
const habille = await p.evaluate(() => getComputedStyle(document.body).backgroundColor);
if (habille === 'rgba(0, 0, 0, 0)' || habille === 'rgb(255, 255, 255)') {
  rate('la couverture est sans style : les chemins relatifs ont casse', habille);
} else ok('les feuilles de style suivent l adresse longue', habille);

await p.locator('.couv-fixe a').click();
await p.waitForTimeout(800);
if (!/\/section\/[^/]+\/qcm$/.test(p.url())) rate('la couverture ne mene pas aux reglages', p.url());
else ok('couverture -> reglages', p.url().replace(B,''));

const slugVu = await p.evaluate(() => (document.querySelector('.t-page')||{}).textContent || '');
if (!slugVu) rate('les reglages n affichent rien');
else ok('les reglages sont montes', slugVu.slice(0, 40));

// Et on lance.
await p.locator('.bouton-vert, .bouton').first().click();
await p.waitForTimeout(1200);
if (!/qcm\.html/.test(p.url())) rate('les reglages ne lancent pas le QCM', p.url());
else ok('reglages -> QCM', p.url().replace(B,'').slice(0, 46));
await p.waitForSelector('.reponse', { timeout: 8000 }).catch(() => rate('le QCM ne monte pas de carte'));
const carte = await p.evaluate(() => document.querySelectorAll('.reponse').length);
if (carte !== 4) rate('la carte n a pas 4 reponses', carte); else ok('la premiere carte est la');

// L ancienne adresse doit continuer de marcher.
await p.goto(B+'/reglages.html?section=la-priere', { waitUntil:'domcontentloaded' });
await p.waitForTimeout(700);
const ancien = await p.evaluate(() => (document.body.textContent||'').indexOf('prière') >= 0);
if (!ancien) rate('l ancienne adresse reglages.html?section= ne marche plus');
else ok('l ancienne adresse marche toujours');

if (err.length) rate('erreurs JavaScript', err.join(' | ')); else ok('aucune erreur JavaScript');
await nav.close();
console.log(ec===0 ? '\nVERT' : `\nROUGE (${ec})`);
process.exit(ec===0?0:1);
