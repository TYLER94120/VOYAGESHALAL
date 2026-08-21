/* UNE PARTIE ENTIERE, JOUEE JUSQU'AU RESULTAT.
 * Le point qui compte : les sommes doivent tomber juste (section 13). */
import { chromium } from 'playwright-core';
const B = 'http://127.0.0.1:8899';
let echecs = 0;
const rate = (m, d) => { console.log('  ECHEC  ' + m + (d ? '  -> ' + d : '')); echecs++; };
const ok = (m, d) => console.log('  ok     ' + m + (d ? '  -> ' + d : ''));

const nav = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const ctx = await nav.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
await ctx.route('**', (r) => r.request().url().startsWith(B) ? r.continue() : r.abort());
const p = await ctx.newPage();
const erreurs = [];
p.on('pageerror', (e) => erreurs.push(e.message));

await p.goto(B + '/qcm.html?section=sens-des-sourates&n=20', { waitUntil: 'domcontentloaded' });
await p.evaluate(() => localStorage.clear());
await p.reload({ waitUntil: 'domcontentloaded' });
await p.waitForSelector('.reponse');

const banque = await p.evaluate(() => fetch('data/questions/sens-des-sourates.json').then((r) => r.json()));
const parQ = {}; banque.forEach((q) => { parQ[q.question + '|' + q.reponses.join('~')] = q; });

// On joue : une sur trois volontairement fausse, pour que les reprises
// existent vraiment et que le comptage soit mis a l'epreuve.
let tours = 0, attendusJustes = 0;
const vus = {};
while (tours < 60) {
  if (!(await p.locator('.reponse').first().isVisible().catch(() => false))) break;
  const cle = await p.evaluate(() => document.querySelector('.t-question').textContent + '|'
    + [...document.querySelectorAll('.reponse .texte')].map((e) => e.textContent).join('~'));
  const q = parQ[cle];
  if (!q) { rate('question absente de la banque'); break; }
  const faux = (tours % 3 === 2);
  const idx = faux ? (q.bonne + 1) % 4 : q.bonne;
  vus[q.id] = !faux;                       // le DERNIER passage fait foi
  await p.locator('.reponse').nth(idx).click();
  await p.keyboard.press('ArrowRight');
  await p.waitForTimeout(320);
  const feuille = await p.locator('#f-suite').count();
  if (feuille) { await p.locator('#f-suite').click(); await p.waitForTimeout(280); }
  tours++;
  if (p.url().includes('resultat')) break;
}
await p.waitForTimeout(900);
if (!p.url().includes('resultat.html')) { rate('la partie ne mene pas au resultat', p.url()); }
else ok('la partie mene bien au resultat', tours + ' passages joues');

await p.waitForSelector('.grand-anneau-pc', { timeout: 8000 });
const r = await p.evaluate(() => {
  const t = document.body.innerText;
  const pc = parseInt(document.querySelector('.grand-anneau-pc b').textContent, 10);
  const sur = document.querySelector('.grand-anneau-pc span').textContent;
  const themes = [...document.querySelectorAll('.theme')].map((e) => {
    const m = e.querySelector('.c-meta').textContent.split('/');
    return { justes: +m[0], n: +m[1] };
  });
  return { pc, sur, themes, incoherence: /ne recoupe pas/.test(t) };
});
const m = r.sur.match(/(\d+) sur (\d+)/);
const justes = +m[1], total = +m[2];
const attendu = Object.values(vus).filter(Boolean).length;
const attenduTotal = Object.keys(vus).length;

ok('score affiche', r.sur + '  (' + r.pc + ' %)');
if (total !== attenduTotal) rate('le total compte les PASSAGES et non les questions', total + ' affiche, ' + attenduTotal + ' questions distinctes');
else ok('le total compte les questions, pas les passages', total);
if (justes !== attendu) rate('les justes ne correspondent pas au dernier passage', justes + ' affiche, ' + attendu + ' attendus');
else ok('les justes correspondent au dernier passage de chaque question', justes);
if (r.pc !== Math.round(justes * 100 / total)) rate('le pourcentage ne decoule pas du score', r.pc);
else ok('le pourcentage decoule du score');

const sn = r.themes.reduce((a, t) => a + t.n, 0);
const sj = r.themes.reduce((a, t) => a + t.justes, 0);
if (r.themes.length) {
  if (sn !== total) rate('la somme des totaux par theme ne fait pas le total', sn + ' vs ' + total);
  else ok('la somme des totaux par theme fait le total', sn);
  if (sj !== justes) rate('la somme des justes par theme ne fait pas le score', sj + ' vs ' + justes);
  else ok('la somme des justes par theme fait le score', sj);
}
const butes = await p.evaluate(() => {
  const c = [...document.querySelectorAll('.chiffre')].map((e) => e.textContent);
  return { chiffres: c, liste: document.querySelectorAll('.bloc').length,
           titre: /buté/.test(document.body.innerText) };
});
const attendusButes = Object.keys(vus).length - Object.values(vus).filter(Boolean).length
  + (tours - Object.keys(vus).length);   // toutes les questions reprises
if (!butes.titre) rate('les questions sur lesquelles on a bute ne sont pas montrees');
else ok('les questions sur lesquelles on a bute sont montrees', butes.chiffres.join(' / '));
if (butes.chiffres.some((c) => /0.*deux essais/.test(c))) {
  rate('le compte des reprises est a zero alors qu il y a eu des reprises');
} else ok('le compte des reprises n est pas efface par les reprises reussies');

if (r.incoherence) rate('la page signale elle-meme une incoherence de comptage');
else ok('aucune incoherence signalee par la page');
if (erreurs.length) rate('erreurs JavaScript', erreurs.join(' | '));
else ok('aucune erreur JavaScript');

await nav.close();
console.log(echecs === 0 ? '\nVERT' : `\nROUGE (${echecs})`);
process.exit(echecs === 0 ? 0 : 1);
