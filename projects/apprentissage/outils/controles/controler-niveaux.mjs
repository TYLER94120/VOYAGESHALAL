/* LES TROIS NIVEAUX : sont-ils choisissables, et changent-ils vraiment le
 * paquet ? Un mode qui n existe qu a l ecran ne sert a rien. */
import { chromium } from 'playwright-core';
import { brancherPolices, attendrePolices } from './polices.mjs';
const B = 'http://127.0.0.1:8899';
let ec = 0;
const rate=(m,d)=>{console.log('  ECHEC  '+m+(d?'  -> '+d:''));ec++;};
const ok=(m,d)=>console.log('  ok     '+m+(d?'  -> '+d:''));
const nav = await chromium.launch({ executablePath:'/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args:['--no-sandbox'] });
const ctx = await nav.newContext({ viewport:{width:390,height:900}, isMobile:true, hasTouch:true, deviceScaleFactor:2 });
// Les polices ne sortent plus vers Google : elles n'y arrivaient jamais.
await ctx.route('**', (r) => (r.request().url().startsWith(B) ? r.continue() : r.abort()));
await brancherPolices(ctx);
const p = await ctx.newPage();
const err=[]; p.on('pageerror',(e)=>err.push(e.message));

await p.goto(B+'/section/sens-des-sourates/qcm', { waitUntil:'domcontentloaded' });
await attendrePolices(p);
await p.evaluate(() => localStorage.clear());
await p.reload({ waitUntil:'domcontentloaded' });
await p.waitForSelector('.niveau');
await p.evaluate(() => document.fonts.ready);
await p.waitForTimeout(600);

const n = await p.evaluate(() => ({
  boutons: [...document.querySelectorAll('.niveau')].map(b => ({
    nom: b.querySelector('.choix-nom').textContent,
    nb: b.querySelector('.choix-nb').textContent,
    choisi: b.getAttribute('aria-checked'),
    h: Math.round(b.getBoundingClientRect().height),
  })),
  dit: (document.getElementById('dit-niveau')||{}).textContent,
  nombre: (document.getElementById('dit-nombre')||{}).textContent,
}));
console.log(JSON.stringify(n, null, 1));
if (n.boutons.length !== 3) rate('il n y a pas trois niveaux', n.boutons.length);
else ok('trois niveaux', n.boutons.map(b=>b.nom+' '+b.nb).join(' · '));
if (n.boutons.some(b => b.h < 44)) rate('un bouton de niveau fait moins de 44 px');
else ok('les trois cibles font 44 px ou plus');
if (n.boutons.filter(b=>b.choisi==='true').length !== 1) rate('pas exactement un niveau choisi');
else ok('un seul niveau choisi a la fois');

// On choisit expert, on lance, et on regarde le paquet reellement tire.
await p.locator('.niveau[data-niveau="3"]').click();
await p.waitForTimeout(300);
const dit3 = await p.evaluate(() => document.getElementById('dit-niveau').textContent);
if (dit3 === n.dit) rate('la phrase ne change pas avec le niveau');
else ok('la phrase suit le niveau', dit3.slice(0, 44));

await p.locator('#commencer').click();
await p.waitForTimeout(1400);
if (!/niveau=3/.test(p.url())) rate('le niveau ne passe pas dans l adresse', p.url());
else ok('le niveau passe dans l adresse');
await p.waitForSelector('.reponse');
const paquet = await p.evaluate(() => {
  const j = window.__jeu;
  const c = {};
  j.s.paquet.forEach(q => { c[q.niveau] = (c[q.niveau]||0)+1; });
  return { n: j.s.paquet.length, parNiveau: c };
});
console.log('  paquet tire :', JSON.stringify(paquet));
if (paquet.parNiveau['3'] !== paquet.n) rate('le paquet melange les niveaux', JSON.stringify(paquet.parNiveau));
else ok('le paquet ne contient que le niveau demande', paquet.n + ' cartes en expert');

// Et le niveau 1 donne un AUTRE paquet.
await p.goto(B+'/qcm.html?section=sens-des-sourates&n=20&niveau=1', { waitUntil:'domcontentloaded' });
await p.waitForSelector('.reponse');
const p1 = await p.evaluate(() => {
  const j = window.__jeu; const c = {};
  j.s.paquet.forEach(q => { c[q.niveau] = (c[q.niveau]||0)+1; });
  return c;
});
if (p1['1'] !== 20) rate('le niveau 1 ne donne pas un paquet de niveau 1', JSON.stringify(p1));
else ok('le niveau 1 donne bien un paquet de niveau 1');

if (err.length) rate('erreurs JavaScript', err.join(' | ')); else ok('aucune erreur JavaScript');

/* UN NIVEAU VIDE SUR UNE SECTION QUI N'EST PAS VIDE.
 *
 * Mesure du 10 octobre : `qcm.html?section=les-invocations&niveau=1`
 * affichait « Cette section n'a pas encore de questions. » — sur une section
 * qui en a 176, toutes au niveau 3. Onze couples (section, niveau) sur
 * trente-trois sont dans ce cas. L'ecran de reglages, lui, desactive un
 * niveau vide et en preselectionne un autre : on n'arrive la que par une
 * adresse tapee ou gardee ailleurs. Le message n'en etait pas moins faux.
 *
 * Et l'ecran gardait son compteur « 1 / 20 » et ses boutons « Passer » et
 * « Valider » : `pied.hidden = true` etait bien pose, mais
 * `.qcm-pied { display: flex }` ecrasait la regle du navigateur.
 *
 * On verifie les trois choses sur un cas de chaque sorte : le niveau vide
 * d'une section pleine, et la section vraiment vide. */
for (const [slug, niveau, pleine] of [['les-invocations', 1, 176],
                                      ['le-comportement', 3, 11],
                                      ['vie-du-prophete', 1, 0]]) {
  const q = await ctx.newPage();
  const e2 = []; q.on('pageerror', (x) => e2.push(x.message));
  await q.goto(`${B}/qcm.html?section=${slug}&niveau=${niveau}`,
    { waitUntil: 'domcontentloaded' });
  await attendrePolices(q);
  await q.waitForTimeout(800);
  const r = await q.evaluate(() => {
    const vu = (s) => [...document.querySelectorAll(s)]
      .filter((x) => x.offsetParent !== null).length;
    return {
      texte: document.body.innerText.replace(/\s+/g, ' '),
      liens: [...document.querySelectorAll('#zone a')].map((a) => a.textContent.trim()),
      pied: vu('.qcm-pied'), compte: vu('.qcm-compte'), barre: vu('#qcm-progres'),
      cartes: vu('.reponse'),
    };
  });
  const quoi = `${slug} niveau ${niveau}`;
  if (r.cartes) { rate(`${quoi} : des cartes s'affichent alors que le niveau est vide`); }
  if (r.pied || r.compte || r.barre) {
    rate(`${quoi} : l'ecran garde son pied, son compteur ou sa barre`,
      `pied ${r.pied}, compteur ${r.compte}, barre ${r.barre}`);
  } else { ok(`${quoi} : ni compteur ni boutons sur un ecran sans carte`); }
  if (pleine) {
    if (/pas encore de questions|pas encore ouverte/.test(r.texte)) {
      rate(`${quoi} : le site dit la section vide, elle a ${pleine} questions`);
    } else if (!r.texte.includes(String(pleine))) {
      rate(`${quoi} : le message ne dit pas combien la section en a`, r.texte.slice(0, 70));
    } else if (!r.liens.length) {
      rate(`${quoi} : aucun niveau de rechange propose`);
    } else {
      ok(`${quoi} : le message dit vrai et propose ${r.liens.join(', ')}`);
    }
  } else if (!/pas encore/.test(r.texte)) {
    rate(`${quoi} : une section vraiment vide doit le dire`, r.texte.slice(0, 70));
  } else {
    ok(`${quoi} : une section vraiment vide le dit`);
  }
  if (e2.length) { rate(`${quoi} : erreur JavaScript`, e2[0].slice(0, 70)); }
  await q.close();
}

await nav.close();
console.log(ec===0 ? '\nVERT' : `\nROUGE (${ec})`);
process.exit(ec===0?0:1);
